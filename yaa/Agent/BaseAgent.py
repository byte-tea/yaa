from ..Config.Config import Config
# from ..LLM_API.BaseAPI import BaseAPI
from ..LLM_API.OpenAI import OpenAI_API

class BaseAgent:
    """智能体基类"""
    def Agent(session_data):
        """智能体主处理函数
        
        参数:
            session_data (dict): 补全后的会话数据
            
        返回:
            response_data (dict): 加入智能体信息的会话数据
        """

        def PromptGenerate(session_data):
            # 如果 session_data['messages'] 的最后一条消息是 'user'
            if session_data['messages'][-1]['role'] == 'user':
                message = session_data['messages'][-1]['content']
                session_data['messages'].pop()
                session_data['messages'].append({
                    "role": "system",
                    "content": f'<任务>{message}</任务>\n\n您是 `yaa`，一个智能体。\n如果任务未完成请根据任务内的信息，分析还需要获取哪些信息才能实事求是地解答疑问或完成任务，除非任务已完成。'
                })
            return session_data

        def prase_response(session_data):
            """将会话数据格式化为智能体回复数据格式
            
            参数:
                session_data (dict): 包含会话数据和API响应的字典
                
            返回:
                dict: 格式化后的智能体回复数据
            """
            agent_response = {
                "id": session_data.get("id", ""),
                "title": session_data.get("title", ""),
                "start_time": session_data.get("start_time", ""),
                "finish_reason": "completed",  # 默认完成状态
                "messages": [
                    {
                        "role": "assistant",
                        "content": session_data.get("messages", [{}])[-1].get("content", "")
                    }
                ],
                "usage": {
                    "prompt_tokens": session_data.get("usage", {}).get("prompt_tokens", 0),
                    "completion_tokens": session_data.get("usage", {}).get("completion_tokens", 0),
                    "total_tokens": session_data.get("usage", {}).get("total_tokens", 0)
                }
            }
                
            return agent_response

        try:
            # 补全会话配置
            merged_data = Config.merge_config(session_data)

            # 格式化用户消息
            session_data = PromptGenerate(session_data)

            # 调用大模型API
            # response_data = BaseAPI.request(session_data)
            response_data = OpenAI_API.request(merged_data)

            return prase_response(response_data)
            
        except Exception as e:
            # 错误处理
            session_data['messages'].append({
                "role": "system",
                "content": f'处理请求时出错: {str(e)}'
            })
            return session_data
    
