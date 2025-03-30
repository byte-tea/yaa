import uuid
from datetime import datetime
from ..Agent.BaseAgent import BaseAgent
from ..Config.Config import Config

class BaseClient:
    def run(message=None):
        help_command = ['', '/?', '/help', '/h']

        # 创建会话数据
        session_data = {
            'id': str(uuid.uuid4()),
            'title': '会话',
            'start_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "type": "对话",
            'messages': [],
            'config': {
                'yaa': Config.YAA_CONFIG,
                'llm_api': Config.LLM_API_CONFIG,
                'prompt': Config.PROMPT_CONFIG,
                'tool': Config.TOOL_CONFIG
            }
        }

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
            
            session_data['messages'].append({
                'role': 'user',
                'content': message
            })

            message = None
            
            # 交给智能体处理
            agent_response = BaseAgent.Agent(session_data)

            print(agent_response['messages'][-1]['content'])