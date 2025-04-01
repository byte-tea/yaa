from yaa.Config.Config import Config
# from yaa.LLM_API.BaseAPI import BaseAPI
from yaa.LLM_API.OpenAI import OpenAI_API
from yaa.PromptGen.BasePromptGenerater import BasePromptGenerater

class Agent:
    """智能体基类"""
    @classmethod
    def Agent(session_data):
        """智能体主处理函数
        
        参数:
            session_data (dict): 补全后的会话数据
            
        返回:
            dict: 格式化后的智能体回复数据
        """

        def prase_response(session_data):
            """将会话数据格式化为智能体回复数据格式
            
            参数:
                session_data (dict): 包含会话数据和API响应的字典
                
            返回:
                dict: 格式化后的智能体回复数据
            """
            return {
                "id": session_data.get("id", ""),
                "title": session_data.get("title", ""),
                "start_time": session_data.get("start_time", ""),
                "finish_reason": "已完成",  # 默认完成状态
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

        try:
            # 补全会话配置
            merged_data = Config.merge_config(session_data)

            # 格式化用户消息并附上提示词
            session_data = BasePromptGenerater.PromptGenerate(session_data)

            # 调用大模型 API
            # response_data = BaseAPI.request(session_data)
            response_data = OpenAI_API.request(merged_data)

            return prase_response(response_data)
            
        except Exception as e:
            # 错误处理
            if not isinstance(session_data.get('messages'), list):
                session_data['messages'] = []
            session_data['messages'].append({
                "role": "system",
                "content": f'智能体执行出错：{str(e)}'
            })
            session_data['status'] = '已中断'
            return prase_response(session_data)
