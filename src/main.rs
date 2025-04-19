mod agent;
mod cli;
mod core;
mod server;
use agent::api::OpenAIClient;
use clap::Parser;
use cli::commands::{Commands, handle_command};
use core::session::SessionData;
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
            server::merge_json(&mut default_config, user_config);
        }

        // 转换回Config结构体
        session_data.config = serde_json::from_value(default_config)?;
    }

    Ok(session_data)
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let args = Args::parse();
    let session_data = load_config(args.config.as_deref())
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    if args.serve {
        server::start_server(args.port, session_data).await
    } else {
        let tool_registry = agent::tool::create_tool_registry();

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
