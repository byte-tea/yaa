"""服务器模块

职责：
1. 实现简单的TCP服务器监听
2. 处理会话数据结构
3. 返回响应消息
"""

import socket
import json

class Server:
    def __init__(self, config):
        """初始化服务器
        
        参数:
            config (dict): 服务器配置字典，包含yaa_server和security配置
        """
        self.config = config
        server_config = config['yaa_server']
        self.port = server_config['port']
        self.max_connections = server_config['max_connections']
        self.timeout = server_config['timeout']
        
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.settimeout(self.timeout)

    def listen(self):
        """服务器监听函数
        
        监听端口，智能体处理客户端发出的请求，返回请求结果
        """
        self.socket.bind(('0.0.0.0', self.port))
        self.socket.listen(self.max_connections)
        print(f"服务器已启动，监听端口 {self.port}，最大连接数 {self.max_connections}，超时时间 {self.timeout}秒")
        
        while True:
            conn, addr = self.socket.accept()
            try:
                data = conn.recv(4096)
                if data:
                    session = json.loads(data.decode('utf-8'))
                    response = self.process_session(session)
                    conn.sendall(json.dumps(response).encode('utf-8'))
            finally:
                conn.close()

    def process_session(self, session):
        """ 处理会话数据
        
        根据 docs/README.md 中的会话数据结构定义进行处理
        """
        # 基本验证
        if not isinstance(session, dict):
            return self.return_message("无效的会话格式")
            
        if 'id' not in session:
            # TODO 生成会话 ID
            return self.return_message("会话 ID 缺失")

        # TODO 智能体根据会话数据执行并生成结果
        # ...

        # 返回处理结果
        return {
            "status": "received",
            "session_id": session['id'],
            "message": "会话已接收"
        }

    def return_message(self, message):
        """返回信息函数
        
        默认返回格式：
        {
            "message": message
        }
        """
        return {"message": message}