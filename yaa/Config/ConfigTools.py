class ConfigTools:
    @classmethod
    def deep_merge(cls, lower_priority_config, higher_priority_config):
            """深度合并两个字典
            
            参数:
                lower_priority_config (dict): 基底配置字典
                higher_priority_config (dict): 目标配置字典
                
            返回:
                dict: 合并后的字典
            """
            merged = lower_priority_config.copy()
            for key, value in higher_priority_config.items():
                if (key in merged and isinstance(merged[key], dict)
                    and isinstance(value, dict)):
                    merged[key] = cls.deep_merge(merged[key], value)
                else:
                    merged[key] = value
            return merged