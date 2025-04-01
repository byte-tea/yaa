# 最基本流程分析

## 客户端服务器交互

1. 用户运行 `python -m yaa/yaa --serve` 启动服务端。
2. 客户端发送请求到 `localhost:12345/`。
3. yaa/Server/BaseServer.py 模块的 listen() 函数解析会话数据，将会话数据传给 yaa/Config/Config.py 模块的 merge_config()，取得补全的会话数据。然后将补全的会话数据传给 yaa/Agent/BaseAgent.py 模块的 Agent() 函数，创建智能体实例。
4. yaa/Agent/BaseAgent.py 模块的 Agent() 函数将补全的会话数据传给 yaa/LLM_API/BaseAPI.py 模块的 request() 函数，请求大模型。
5. yaa/Agent/BaseAgent.py 模块的 Agent() 函数返回 yaa/LLM_API/BaseAPI.py 模块的 request() 函数返回的会话数据。
6. yaa/Server/BaseServer.py 模块的 listen() 函数返回 yaa/Agent/BaseAgent.py 模块的 Agent() 函数返回的会话数据。
