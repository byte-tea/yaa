import uuid
from datetime import datetime
from ..Agent.BaseAgent import BaseAgent
from ..Config.Config import Config

class BaseClient:
    def run(message=None):
        help_command = ['', '/?', '/help', '/h']

        while True:
            if not message or message == '':
                message = input('> ')

            if message in help_command:
                print('可用命令：')
                print(' /exit：退出程序')
                message = None
                continue
            elif message == '/exit':
                message = None
                break

            # 创建会话数据
            session_data = {
                'id': str(uuid.uuid4()),
                'title': '会话',
                'start_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "type": "对话",
                'messages': [
                    {
                        'role': 'user',
                        'content': message
                    }
                ],
                'config': {
                    'yaa': Config.YAA_CONFIG,
                    'llm_api': Config.LLM_API_CONFIG,
                    'prompt': Config.PROMPT_CONFIG,
                    'tool': Config.TOOL_CONFIG
                }
            }

            message = None
            
            # 交给智能体处理
            response_data = BaseAgent.Agent(session_data)

            print(response_data['messages'])