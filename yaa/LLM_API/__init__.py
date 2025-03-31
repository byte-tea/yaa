"""大语言模型 API 接口模块"""
from yaa.LLM_API.BaseAPI import BaseAPI
from yaa.LLM_API.OpenAI import OpenAI_API

__all__ = [
    "BaseAPI",
    "OpenAI_API"
]