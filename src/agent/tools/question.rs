use crate::core::session::SessionData;
use crate::core::tool::{Tool, ToolError, ToolInput, ToolOutput, ToolParam};
use async_trait::async_trait;
use serde_json::json;

pub struct QuestionTool;

#[async_trait]
impl Tool for QuestionTool {
    fn name(&self) -> &str {
        "ask"
    }

    fn description(&self) -> &str {
        "当无法通过其它方法获取更多信息时，向用户提问。可提供几个不重复的用户可能的回答以减少用户负担。"
    }

    fn parameters(&self) -> Vec<ToolParam> {
        vec![
            ToolParam {
                name: "question".to_string(),
                description: "想要询问用户的问题".to_string(),
                required: true,
                r#type: "string".to_string(),
            },
            ToolParam {
                name: "guess_one".to_string(),
                description: "用户可能的回答".to_string(),
                required: false,
                r#type: "string".to_string(),
            },
            ToolParam {
                name: "guess_two".to_string(),
                description: "用户可能的回答".to_string(),
                required: false,
                r#type: "string".to_string(),
            },
            ToolParam {
                name: "guess_three".to_string(),
                description: "用户可能的回答".to_string(),
                required: false,
                r#type: "string".to_string(),
            },
        ]
    }

    fn default_config(&self) -> crate::core::session::ToolApprovalConfig {
        crate::core::session::ToolApprovalConfig { auto_approve: true }
    }

    async fn execute(
        &self,
        _input: ToolInput,
        session: &mut SessionData,
    ) -> Result<ToolOutput, ToolError> {
        // 检查自动授权配置
        if !session
            .config
            .tool
            .tools
            .get("question")
            .map(|config| config.auto_approve)
            .unwrap_or(true)
        {
            return Err(ToolError::NotAuthorized);
        }

        // 添加工具调用消息到会话
        session.add_message(
            crate::core::session::Role::System,
            format!("[{}]执行成功。", self.name()),
        );

        Ok(ToolOutput {
            name: self.name().to_string(),
            result: json!({"status": "success"}),
        })
    }
}
