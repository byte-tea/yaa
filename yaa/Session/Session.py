# 会话管理模块
#
# 职责：
# 1. 管理用户会话生命周期（创建/维护/销毁）
# 2. 存储和维护会话历史记录
# 3. 同步智能体状态到前端
#
# 主要功能：
# - 创建新会话并初始化上下文
# - 维护会话历史（用户输入/模型响应/工具调用）
# - 处理会话超时和清理
# - 流式传输状态更新
#
# 数据结构：
# {
#   "session_id": "唯一标识",
#   "created_at": "创建时间",
#   "last_active": "最后活跃时间",
#   "history": [
#     {"role": "user", "content": "输入"},
#     {"role": "agent", "content": "响应"}
#   ],
#   "status": "running/completed/failed"
# }
#
# 关键方法：
# - create_session(): 创建新会话
# - update_history(): 更新会话历史
# - stream_update(): 流式推送状态
# - close_session(): 关闭会话
#
# 与其他模块关系：
# - 被yaa.py主程序调用来管理会话
# - 与BaseAgent交互传递会话上下文
# - 使用DefaultConfig的会话配置