import http.client
import json
from urllib.parse import urlparse

from yaa.LLM_API import BaseAPI

class OpenAI_API(BaseAPI):
    def request(session_data):
        # 获取配置
        provider_config = session_data['config']['llm_api']['provider']
        api_url = provider_config['api_url']
        api_key = provider_config['api_key']
        model_name = provider_config['model_name']

        # 解析 API URL
        parsed_url = urlparse(api_url)
        host = parsed_url.netloc
        path = parsed_url.path
        
        # 构建请求
        conn = http.client.HTTPSConnection(host)
        payload = json.dumps({
            "model": model_name,
            "messages": session_data['messages'],
            "stream": False
        })
        
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        # 发送请求
        conn.request("POST", path, payload, headers)
        res = conn.getresponse()
        response_body = res.read().decode("utf-8")
        
        # 检查响应内容是否为JSON
        try:
            data = json.loads(response_body)
        except json.JSONDecodeError:
            raise Exception(f"API返回非JSON响应: {response_body[:200]}...")
            
        # 检查API响应状态
        if res.status != 200:
            error_msg = data.get('error', {}).get('message', '未知错误') if isinstance(data, dict) else response_body[:200]
            raise Exception(f"API请求失败({res.status}): {error_msg}")
            
        if 'choices' not in data or len(data['choices']) == 0:
            raise Exception("API返回无效响应: 缺少choices字段")
            
        # 添加 AI 回复到消息列表
        ai_response = data['choices'][0]['message']
        session_data['messages'].append(ai_response)
        
        return session_data