mod agent;
mod cli;
mod core;
use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use agent::tools::question::QuestionTool;
use agent::tools::finish::FinishTool;
use agent::tools::rethink::RethinkTool;
use agent::{api::OpenAIClient, process_session};
use clap::Parser;
use cli::commands::{Commands, handle_command};
use core::{session::SessionData, tool::ToolRegistry};
use tokio;

use anyhow::{Context, Result};
use std::fs;

#[derive(Parser, Debug)]
#[command(version, about)]
struct Args {
    /// 启动服务监听模式
    #[arg(long)]
    serve: bool,

    /// 指定服务监听端口
    #[arg(long, default_value_t = 12345)]
    port: u16,

    /// 指定配置文件路径
    #[arg(long)]
    config: Option<String>,

    #[command(subcommand)]
    command: Option<Commands>,
}

fn load_config(path: Option<&str>) -> Result<SessionData> {
    // 创建默认配置
    let mut session_data = SessionData::default();

    // 如果指定了配置文件，则加载并深度合并用户配置
    if let Some(config_path) = path {
        let config_content = fs::read_to_string(config_path)
            .with_context(|| format!("Failed to read config file: {}", config_path))?;

        // 反序列化用户配置
        let user_config: serde_json::Value = serde_json::from_str(&config_content)
            .with_context(|| format!("Failed to parse config file: {}", config_path))?;

        // 将默认配置转换为Value以便合并
        let mut default_config = serde_json::to_value(&session_data.config)?;

        // 深度合并配置
        if let Some(user_config) = user_config.get("config") {
            merge_json(&mut default_config, user_config);
        }

        // 转换回Config结构体
        session_data.config = serde_json::from_value(default_config)?;
    }

    Ok(session_data)
}

fn merge_json(target: &mut serde_json::Value, source: &serde_json::Value) {
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

async fn handle_request(
    app_data: web::Data<SessionData>,
    request_data: web::Json<serde_json::Value>,
) -> actix_web::HttpResponse {
    println!("[DEBUG] 接收到的原始数据：{:?}\n", request_data);
    println!("[DEBUG] 初始SessionData：{:#?}\n", app_data);

    let mut tool_registry = ToolRegistry::new();
    tool_registry.register(FinishTool);
    tool_registry.register(RethinkTool);
    tool_registry.register(QuestionTool);

    // 创建全新的SessionData实例，确保状态隔离
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

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let args = Args::parse();
    let session_data = load_config(args.config.as_deref())
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    if args.serve {
        println!("启动服务监听模式，端口: {}", args.port);
        HttpServer::new(move || {
            // 配置 CORS 中间件
            let cors = Cors::default()
                .allow_any_origin()  // 允许所有来源
                .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])  // 允许的方法
                .allowed_headers(vec![
                    actix_web::http::header::AUTHORIZATION,
                    actix_web::http::header::ACCEPT,
                    actix_web::http::header::CONTENT_TYPE,
                ])  // 允许的请求头
                .max_age(3600);  // 预检请求缓存时间

            App::new()
                .wrap(cors)  // 应用 CORS 中间件
                .app_data(web::Data::new(session_data.clone()))
                .service(web::resource("/").route(web::post().to(handle_request)))
        })
        .bind(format!("0.0.0.0:{}", args.port))?
        .run()
        .await
    } else {
        let mut tool_registry = ToolRegistry::new();
        tool_registry.register(FinishTool);
        tool_registry.register(RethinkTool);
        tool_registry.register(QuestionTool);

        let client = OpenAIClient::new(
            session_data.config.llm_api.provider.api_key.to_string(),
            Some(session_data.config.llm_api.provider.api_url.to_string()),
        );

        if let Some(cmd) = args.command {
            handle_command(cmd).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        } else {
            cli::run_interactive(&tool_registry, &client, &session_data)
                .await
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        }
        Ok(())
    }
}
