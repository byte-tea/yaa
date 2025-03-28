# 大语言模型API服务模块
#
# 职责：
# 1. 封装与大语言模型API的交互
# 2. 处理API请求构建和响应解析
# 3. 实现流式响应传输
# 4. 管理API错误处理和自动重试
#
# 核心功能：
# - 构建标准化API请求（包含会话历史、提示词等）
# - 处理流式响应（chunked response）
# - API错误分类和处理：
#   - 网络错误：自动重试
#   - API错误：根据错误码处理
#   - 限流错误：等待后重试
#
# 实现要点：
# 1. 使用异步IO处理并发请求
# 2. 响应数据流式传输给调用方
# 3. 集成DefaultConfig的API配置
# 4. 记录API调用日志
#
# 主要方法：
# - call_api(): 发起API请求
# - stream_response(): 处理流式响应
# - handle_error(): 错误处理
#
# 与其他模块关系：
# - 被 BaseAgent.py 调用来获取模型响应
# - 使用 DefaultConfig.py 的API配置
# - 与 Session.py 交互记录API调用日志