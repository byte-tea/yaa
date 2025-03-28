"""LLM API 模块

职责：
1. 管理与大语言模型的API交互
2. 处理流式响应
3. 实现自动重试机制
4. 处理工具调用检测
"""

import json
import time
import requests
from typing import Dict, Optional, Generator
from ..Config.DefaultConfig import DefaultConfig

class LLMAPI:
    """大语言模型API封装类"""
    
    def __init__(self, config: Optional[Dict] = None):
        """初始化LLM API
        
        参数:
            config: 用户提供的配置字典，会与默认配置合并
        """
        self.config = DefaultConfig.merge_config(config)['llm_api']
        self.session = requests.Session()
        
    def _make_request_headers(self) -> Dict[str, str]:
        """生成请求头"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.config['provider']['api_key']}"
        }
    
    def _build_request_data(self, messages: list, tools: Optional[list] = None) -> Dict:
        """构建请求数据"""
        data = {
            "model": self.config['provider']['model_name'],
            "messages": messages,
            "temperature": self.config['provider']['model_settings']['temperature'],
            "max_tokens": self.config['provider']['max_tokens'],
            "stream": self.config['stream']
        }
        
        if tools and self.config['provider']['model_type']['is_function_call']:
            data["tools"] = tools
            data["tool_choice"] = "auto"
            
        return data
    
    def _handle_stream_response(self, response) -> Generator[str, None, None]:
        """处理流式响应"""
        for chunk in response.iter_lines():
            if chunk:
                decoded = chunk.decode('utf-8')
                if decoded.startswith("data: "):
                    data = decoded[6:]
                    if data != "[DONE]":
                        try:
                            json_data = json.loads(data)
                            yield json_data
                        except json.JSONDecodeError:
                            continue
    
    def call(
        self,
        messages: list,
        tools: Optional[list] = None,
        retry_count: int = 0
    ) -> Generator[Dict, None, None]:
        """调用LLM API
        
        参数:
            messages: 消息列表
            tools: 可选工具列表
            retry_count: 当前重试次数
            
        返回:
            生成器，产生流式响应或完整响应
        """
        url = self.config['provider']['api_url']
        headers = self._make_request_headers()
        data = self._build_request_data(messages, tools)
        
        try:
            response = self.session.post(
                url,
                headers=headers,
                json=data,
                stream=self.config['stream'],
                timeout=self.config['request_timeout']
            )
            response.raise_for_status()
            
            if self.config['stream']:
                return self._handle_stream_response(response)
            else:
                return [response.json()]
                
        except requests.exceptions.RequestException as e:
            if retry_count < self.config['retry']['times']:
                time.sleep(self.config['retry']['delay'])
                return self.call(messages, tools, retry_count + 1)
            raise Exception(f"API调用失败: {str(e)}")
    
    def detect_tool_call(self, response: Dict) -> Optional[Dict]:
        """检测工具调用
        
        参数:
            response: API响应字典
            
        返回:
            如果检测到工具调用则返回工具信息，否则返回 None
        """
        if not self.config['provider']['model_type']['is_function_call']:
            return None
            
        if "choices" in response and len(response["choices"]) > 0:
            choice = response["choices"][0]
            if "tool_calls" in choice["delta"]:
                return choice["delta"]["tool_calls"]
            if "tool_calls" in choice["message"]:
                return choice["message"]["tool_calls"]
                
        return None
