from datetime import datetime
import uuid
from yaa.Agent.ToolCall import Agent
from yaa.Client.BaseClient import BaseClient

class Client(BaseClient):
    @classmethod
    def run(cls, message=None):
        help_command = ['', '/?', '/help', '/h']

        # 创建会话数据
        session_data = {
            'id': str(uuid.uuid4()),
            'title': '会话',
            'start_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "character": "您是 yaa，一个智能体。",
            "status": "进行中",
            'messages': []
        }

        try:
            while True:
                if not message or message == '':
                    message = input('> ')

                if message in help_command:
                    print('可用命令：')
                    print(' /exit：退出程序')
                    print(' /help：显示帮助信息')
                    print(' /clear：清空历史消息')
                    message = None
                    continue
                elif message == '/exit':
                    break
                elif message == '/clear':
                    session_data['messages'] = []
                    message = None
                    print("已清空历史消息")
                    continue

                session_data['messages'].append({
                    'role': 'user',
                    'content': message
                })

                message = None

                # 交给智能体处理
                agent_response = Agent.Agent(session_data)

                for response in agent_response['messages']:
                    if response['role'] == 'assistant':
                        print('* ' + response['content'])
                    elif response['role'] == 'system':
                        print('$ ' + response['content'])
                    else:
                        print('# ' + response['content'])
        except KeyboardInterrupt:
            print("\n退出客户端")
        except Exception as e:
            print(f"客户端出错: {str(e)}")