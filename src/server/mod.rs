use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use serde_json;

use crate::agent::{api::OpenAIClient, process_session};
use crate::core::session::SessionData;

pub async fn start_server(port: u16, session_data: SessionData) -> std::io::Result<()> {
    println!("启动服务监听模式，端口: {}", port);
    HttpServer::new(move || {
        // 配置 CORS 中间件
        let cors = Cors::default()
            .allow_any_origin() // 允许所有来源
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"]) // 允许的方法
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION,
                actix_web::http::header::ACCEPT,
                actix_web::http::header::CONTENT_TYPE,
            ]) // 允许的请求头
            .max_age(3600); // 预检请求缓存时间

        App::new()
            .wrap(cors) // 应用 CORS 中间件
            .app_data(web::Data::new(session_data.clone()))
            .service(web::resource("/").route(web::post().to(handle_request)))
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}

async fn handle_request(
    app_data: web::Data<SessionData>,
    request_data: web::Json<serde_json::Value>,
) -> actix_web::HttpResponse {
    println!("[DEBUG] 接收到的原始数据：{:?}\n", request_data);
    println!("[DEBUG] 初始SessionData：{:#?}\n", app_data);

    let tool_registry = crate::agent::tool::create_tool_registry();

    // 创建全新的 SessionData 实例，确保状态隔离
    let mut merged_data = SessionData::default();
    merged_data.config = app_data.config.clone(); // 只复制必要的配置部分

    // 获取传入数据并检查是否有 config 字段
    let mut user_data = request_data.into_inner();
    if !user_data.as_object().unwrap().contains_key("config") {
        // 如果请求中没有 config 字段，使用默认配置
        user_data["config"] = serde_json::to_value(&merged_data.config).unwrap();
    }
    println!("[DEBUG] 处理后的SessionData：{:#?}\n", merged_data);

    // 将基础配置转换为 JSON Value
    let mut base_data = match serde_json::to_value(&merged_data) {
        Ok(v) => v,
        Err(e) => {
            return actix_web::HttpResponse::InternalServerError()
                .content_type("application/json")
                .body(
                    serde_json::json!({
                        "messages": [{
                            "role": "system",
                            "content": format!("Failed to serialize base config: {}", e)
                        }]
                    })
                    .to_string(),
                );
        }
    };

    // 深度合并配置
    merge_json(&mut base_data, &user_data);

    // 转换回 SessionData 结构体
    match serde_json::from_value::<SessionData>(base_data) {
        Ok(v) => merged_data = v,
        Err(e) => {
            return actix_web::HttpResponse::BadRequest()
                .content_type("application/json")
                .body(
                    serde_json::json!({
                        "messages": [{
                            "role": "system",
                            "content": format!("Invalid request data: {}", e)
                        }]
                    })
                    .to_string(),
                );
        }
    };

    println!("[DEBUG] 合并后的数据：{:?}\n", merged_data);

    let client = OpenAIClient::new(
        merged_data.config.llm_api.provider.api_key.to_string(),
        Some(merged_data.config.llm_api.provider.api_url.to_string()),
    );

    match process_session(merged_data, &tool_registry, &client).await {
        Ok(response) => match serde_json::to_string(&response) {
            Ok(json) => actix_web::HttpResponse::Ok()
                .content_type("application/json")
                .body(json),
            Err(e) => actix_web::HttpResponse::InternalServerError()
                .content_type("application/json")
                .body(
                    serde_json::json!({
                        "messages": [{
                            "role": "system", 
                            "content": format!("Failed to serialize response: {}", e)
                        }]
                    })
                    .to_string(),
                ),
        },
        Err(e) => {
            eprintln!("Agent Error: {}", e);
            actix_web::HttpResponse::InternalServerError()
                .content_type("application/json")
                .body(
                    serde_json::json!({
                        "messages": [{
                            "role": "system",
                            "content": e.to_string()
                        }]
                    })
                    .to_string(),
                )
        }
    }
}

pub fn merge_json(target: &mut serde_json::Value, source: &serde_json::Value) {
    match (target, source) {
        (serde_json::Value::Object(target), serde_json::Value::Object(source)) => {
            for (key, value) in source {
                if let Some(target_value) = target.get_mut(key) {
                    merge_json(target_value, value);
                } else {
                    target.insert(key.clone(), value.clone());
                }
            }
        }
        (target, source) => {
            *target = source.clone();
        }
    }
}