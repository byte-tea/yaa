"""服务端默认配置模块

职责：
1. 提供服务端相关的默认配置项
"""

from yaa.Config.ConfigTools import ConfigTools

class ServerConfig:
    """服务端默认配置类"""
    
    # 基础配置
    YAA_SERVER_CONFIG = {
        'ip': '0.0.0.0',
        'port': 12345,
        'max_connections': 100,
        'max_receive': 1024,
        'timeout': 60
    }

    # 安全验证配置
    SECURITY_CONFIG = {
        'auth_required': True,
        'api_key_header': 'YAA-API-KEY',
        'api_key': [
            {
                'key': '636ebda2dccc312b88aed7c54786f8678d33d4f878da41c5302b3dcde563055b61e8ca047d333c45e9be1adc342ceb2850f23f294a8b1b1c2d2dd016713fef58' # 测试用密钥（BLAKE2）：yaa
            }
        ],
        'rate_limit': '100/1m',
        'max_request_size': '10MB'
    }

    @classmethod
    def get_default_config(cls):
        """获取默认配置"""
        return {
            'yaa_server': cls.YAA_SERVER_CONFIG,
            'security': cls.SECURITY_CONFIG
        }

    @classmethod
    def merge_config(cls, higher_priority_config=None, lower_priority_config=None):
        """合并用户配置和默认配置
        
        参数:
            higher_priority_config (dict): 服务器运行时参数传入编译的配置字典
            
        返回:
            dict: 合并后的配置字典，参数配置优先于默认配置
        """
        if lower_priority_config is None:
            lower_priority_config = cls.get_default_config()

        if higher_priority_config is None:
            higher_priority_config = {}
            
        merged_config = ConfigTools.deep_merge(lower_priority_config, higher_priority_config)
        
        return merged_config
    
    @classmethod
    def update_config(cls, runtime_config_path=None):
        """更新默认配置（运行时配置优先）
        
        参数:
            runtime_config_path (src): 运行时提供的服务设置 json 的路径
        """
        if runtime_config_path is None:
            raise ValueError('未提供运行时配置路径')

        import json

        runtime_config = json.load(open(runtime_config_path, 'r'))

        if runtime_config is None:
            raise ValueError('未提供运行时配置')
        
        merged_config = ConfigTools.deep_merge(cls.get_default_config(), runtime_config)

        # 更新 YAA 服务配置
        cls.YAA_SERVER_CONFIG = {**cls.YAA_SERVER_CONFIG, **merged_config['yaa_server']}
        
        # 更新安全相关配置
        cls.SECURITY_CONFIG = {**cls.SECURITY_CONFIG, **merged_config['security']}