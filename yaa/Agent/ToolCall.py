import importlib

from yaa.Agent.BaseAgent import Agent
from yaa.Config.Config import Config
from yaa.LLM_API.OpenAI import OpenAI_API
from yaa.PromptGen.PromptGenerater import PromptGenerater
import yaa.Tools as tools

class Agent(Agent):
    """工具调用智能体"""
    @classmethod
    def Agent(cls, session_data):
        """智能体主处理函数
        
        参数:
            session_data (dict): 补全后的会话数据
            
        返回:
            dict: 格式化后的智能体回复数据
        """
        # 确保session_data有基本结构
        # if not isinstance(session_data, dict):
        #     session_data = {}
        # if 'messages' not in session_data:
        #     session_data['messages'] = []
        # if 'config' not in session_data:
        #     session_data['config'] = {}

        def tool_call(session_data):
            '''工具调用处理
            如果 session_data['messages'] 以角色为 assistant 的消息结尾，检测是否存在工具调用，
            如果存在，检查工具调用是否被允许，如果允许，则调用工具，并返回结果，否则返回错误信息。
            '''
            if session_data['messages'][-1]['role'] == 'assistant':
                last_msg = session_data['messages'][-1]['content']
                for tool_name in tools.__all__:
                    tool = importlib.import_module('yaa.Tools.' + tool_name).Tool
                    tool_start = f'<{tool.ToolInfo["name"]}>'
                    tool_end = f'</{tool.ToolInfo["name"]}>'
                    if tool_start in last_msg and tool_end in last_msg:
                            return tool.use(session_data)
            return session_data

        def prase_response(session_data):
            """将会话数据格式化为智能体回复数据格式
            
            参数:
                session_data (dict): 包含会话数据和API响应的字典
                
            返回:
                dict: 格式化后的智能体回复数据
            """
            # 取最后一个角色为 user 之后的所有消息
            messages = session_data['messages']
            last_user_idx = -1
            # 从后往前遍历，找到倒数第一个角色为 user 的消息
            for i in range(len(messages) - 1, -1, -1):
                if messages[i]['role'] == 'user':
                    last_user_idx = i
                    break
            
            # 如果找到了最后一个 user 消息，则取该消息之后的所有消息
            if last_user_idx != -1:
                messages = messages[last_user_idx + 1:]
            
            return {
                "id": session_data.get("id", ""),
                "title": session_data.get("title", ""),
                "start_time": session_data.get("start_time", ""),
                "finish_reason": session_data.get("status", "已中断"),
                "messages": messages,
                "usage": {
                    "prompt_tokens": session_data.get("usage", {}).get("prompt_tokens", 0),
                    "completion_tokens": session_data.get("usage", {}).get("completion_tokens", 0),
                    "total_tokens": session_data.get("usage", {}).get("total_tokens", 0)
                }
            }

        try:
            # 补全会话配置
            session_data = Config.merge_config(session_data)
            while True:
                # 格式化用户消息并附上提示词
                session_data = PromptGenerater.PromptGenerate(session_data)

                # 调用大模型 API
                session_data = OpenAI_API.request(session_data)

                # 处理工具调用
                session_data = tool_call(session_data)

                # 是否退出循环
                if session_data["status"] == '已中断' or session_data["status"] == '已完成':
                    break

            return prase_response(session_data)
            
        except Exception as e:
            # 错误处理
            if not isinstance(session_data.get('messages'), list):
                session_data['messages'] = []
            err_msg = f'智能体执行出错：{str(e)}'
            session_data['messages'].append({
                "role": "system",
                "content": err_msg
            })
            print(err_msg)
            session_data['status'] = '已中断'
            return prase_response(session_data)
