# 智能体基类实现
#
# 职责：
# 1. 处理用户任务请求
# 2. 管理智能体工作流程（任务分析、提示词生成、API调用、工具执行）
# 3. 状态管理和异常处理
#
# 主要工作流程：
# 1. 接收来自 Session 的请求（包含会话历史和用户指示）
# 2. 调用 PromptGenerator 生成提示词
# 3. 通过 APIService 调用大语言模型 API
# 4. 检测是否需要工具调用：
#    - 是：检查用户授权 -> 执行工具 -> 将结果返回给提示词生成器
#    - 否：检测任务是否完成 -> 返回结果或继续处理
# 5. 流式传输状态更新给 Session
#
# 关键方法：
# - run_task(): 主执行方法
# - handle_tool_call(): 处理工具调用
# - check_completion(): 检查任务是否完成
# - stream_update(): 流式更新状态
#
# 与其他模块关系：
# - 依赖 Modules/LLM_API.py 进行API调用
# - 使用 Tools/BaseTool.py 执行工具
# - 通过 Prompt/DefaultPrompt.py 获取提示词模板
# - 与 Session/Session.py 交互更新状态