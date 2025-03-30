"""智能体默认配置模块

职责：
1. 提供系统默认配置项
2. 管理配置加载优先级（默认配置 < 运行时配置 < 用户配置）
"""

class Config:
    """系统默认配置类"""
    
    # 基础配置
    YAA_CONFIG = {
        'stream': True
    }

    # LLM API 配置
    LLM_API_CONFIG = {
        'provider': {
            'api_url': 'https://api.openai.com/v1/chat/completions',
            'api_key': '',
            'model_name': 'gpt-4',
            'model_type': {
                'is_function_call': False,
                'is_reasoning': False
            },
            'cost_per_ktoken': 0.03,
            'cost_unit': 'USD',
            'max_tokens': 2000,
            'model_settings': {
                'use_custom_temp': False,
                'temperature': 0.7
            }
        },
        'stream': True,
        "request_timeout": 360,
        "interval": 0,
        'retry': {
            'times': 3,
            'delay': 5
        }
    }
    
    # TODO 提示词配置
    PROMPT_CONFIG = {
        'function': 'TODO',
        'system': 'TODO',
        'error': 'TODO：{error}'
    }
    
    # TODO 工具调用配置
    TOOL_CONFIG = {
        'base_tool': {
            'auto_approve': False,
            'timeout': 30,
            'max_memory': '512MB',
            'cpu_threshold': 0.8,
            'interrupt_monitor': True
        }
    }

    @classmethod
    def get_default_config(cls):
        """获取默认配置"""
        return {
            'yaa': cls.YAA_CONFIG,
            'llm_api': cls.LLM_API_CONFIG,
            'prompt': cls.PROMPT_CONFIG,
            'tool': cls.TOOL_CONFIG
        }

    @classmethod
    def merge_config(cls, session_data=None):
        """合并用户配置和默认配置
        
        参数:
            session_data (dict): 用户提供的会话数据，其中 session_data['config'] 为配置字典
            
        返回:
            session_data (dict): 补充完缺少的配置项的会话数据字典
        """
        if session_data is None:
            raise ValueError('未提供会话数据')

        # 从 session_data 中取出用户配置
        user_config = session_data.get('config', {})
        
        session_data['config'] = cls._deep_merge(cls.get_default_config(), user_config)

        return session_data
    
    @classmethod
    def update_config(cls, runtime_config_path=None):
        """更新默认配置（运行时配置优先）
        
        参数:
            runtime_config_path (src): 运行时提供的会话数据 json 的路径
        """
        if runtime_config_path is None:
            raise ValueError('未提供运行时配置路径')

        import json

        runtime_config = json.load(open(runtime_config_path, 'r'))

        if runtime_config['config'] is None:
            raise ValueError('未提供运行时配置')
        
        merged_config = cls._deep_merge(cls.get_default_config(), runtime_config['config'])

        # 更新 YAA 配置
        cls.YAA_CONFIG = {**cls.YAA_CONFIG, **merged_config['yaa']}
        
        # 更新 LLM API 配置
        cls.LLM_API_CONFIG = {**cls.LLM_API_CONFIG, **merged_config['llm_api']}
        
        # 更新提示词配置
        cls.PROMPT_CONFIG = {**cls.PROMPT_CONFIG, **merged_config['prompt']}
        
        # 更新工具调用配置
        cls.TOOL_CONFIG = {**cls.TOOL_CONFIG, **merged_config['tool']}

    @classmethod
    def _deep_merge(cls, default_dict, target_dict):
            """深度合并两个字典，用户字典优先
            
            参数:
                default_dict (dict): 默认配置字典
                target_dict (dict): 目标配置字典
                
            返回:
                dict: 合并后的字典
            """
            merged = default_dict.copy()
            for key, value in target_dict.items():
                if (key in merged and isinstance(merged[key], dict)
                    and isinstance(value, dict)):
                    merged[key] = cls._deep_merge(merged[key], value)
                else:
                    merged[key] = value
            return merged