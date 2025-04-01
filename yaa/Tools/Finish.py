from yaa.Tools.BaseTool import Tool

class Tool(Tool):
    '''完成会话
    大模型使用时：
        大模型的回答包含：<完成会话>\n<理由>（对任务完成的总结）</理由>\n</完成会话>
    '''
    ToolInfo = {
        "id": "finish",
        "name": "完成会话",
        "description": "如果所有的任务和子任务都已经完成，使用这个工具结束会话。",
        "parameters": {
            "properties": [
                {
                    "name": "理由",
                    "type": "string",
                    "description": "对任务完成的总结"
                }
            ],
            "required": ["理由"]
        },
        "feedback": {
            "properties": [
                {
                    "name": "授权",
                    "type": "bool",
                    "description": "用户是否批准本次工具调用"
                },
                {
                    "name": "反馈",
                    "type": "string",
                    "description": "用户对自己决策的说明"
                }
            ],
            "required": ["授权"]
        }
    }

    @classmethod
    def use(cls, session_data):
        if session_data['config']['tool'][cls.ToolInfo['id']]['auto_approve'] == True:
            session_data['messages'].append({
                "role": "tool",
                "content": f"[完成会话]执行成功。"
            })
            session_data['status'] = '已完成'
        else:
            session_data['status'] = '已中断'
        return session_data