import hashlib
from yaa.Config.ServerConfig import ServerConfig

class Auth:
    def check_key(self, auth_header):
        # 用 blake2 算出 key 的哈希值
        header = auth_header.split(' ')[0]
        if header != ServerConfig.SECURITY_CONFIG['api_key_header']:
            return False
        key = auth_header.split(' ')[1]
        blake2_key = hashlib.blake2b(key.encode()).hexdigest()

        # 获取配置中的 api_key 列表
        api_keys = ServerConfig.SECURITY_CONFIG['api_key']
        
        # 检查哈希值是否在 api_key 列表中
        for api_key in api_keys:
            if blake2_key == api_key['key']:
                return True
        return False