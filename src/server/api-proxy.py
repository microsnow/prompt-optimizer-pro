#!/usr/bin/env python3
"""
AI API 代理服务器 (Python 版本)
用途：
1. 解决前端跨域 (CORS) 问题
2. 统一管理多个 AI 提供商的 API
3. 统一所有接口为 OpenAI 格式规范
4. 支持流式和非流式响应

支持的提供商：
- OpenAI (GPT-3.5/4)
- Qwen (阿里云通义千问)
- MiniMax
- Zhipu (智谱 GLM)
- Douyin (豆包)
"""

import os
import json
import logging
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, Any, Optional
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from functools import wraps

# ============ 配置 ============

NODE_ENV = os.getenv('NODE_ENV', 'development')
PORT = int(os.getenv('PORT', 3001))
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# 配置日志 - 修复日志级别转换
def get_log_level(level_str):
    """将字符串日志级别转换为 logging 模块的常量"""
    level_str = level_str.upper()
    level_map = {
        'CRITICAL': logging.CRITICAL,
        'FATAL': logging.FATAL,
        'ERROR': logging.ERROR,
        'WARN': logging.WARNING,
        'WARNING': logging.WARNING,
        'INFO': logging.INFO,
        'DEBUG': logging.DEBUG,
        'NOTSET': logging.NOTSET,
    }
    return level_map.get(level_str, logging.INFO)

logging.basicConfig(
    level=get_log_level(LOG_LEVEL),
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('API_PROXY')

app = Flask(__name__)

# CORS 配置
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 
    'http://localhost:5173,http://localhost:3000,http://localhost:3001,file://').split(',')

CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

logger.info('CONFIG', extra={'environment': NODE_ENV, 'allowed_origins': ALLOWED_ORIGINS})


# ============ 工具函数 ============

def log_request(request_id: str, method: str, path: str, data: Dict = None):
    """记录请求日志"""
    log_data = {
        'request_id': request_id,
        'method': method,
        'path': path,
        'user_agent': request.headers.get('User-Agent', '')[:50] if request.headers.get('User-Agent') else ''
    }
    if data:
        log_data.update(data)
    logger.info('HTTP_REQUEST', extra=log_data)


def log_response(request_id: str, method: str, path: str, status_code: int):
    """记录响应日志"""
    logger.debug('HTTP_RESPONSE', extra={
        'request_id': request_id,
        'method': method,
        'path': path,
        'status_code': status_code
    })


def generate_request_id() -> str:
    """生成唯一的请求 ID"""
    import uuid
    return f"{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:8]}"


def normalize_openai_response(content: str, usage: Dict = None) -> Dict:
    """将任意格式的响应标准化为 OpenAI 格式"""
    if usage is None:
        usage = {}
    return {
        "object": "chat.completion",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": content
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": usage.get('prompt_tokens', 0),
            "completion_tokens": usage.get('completion_tokens', 0),
            "total_tokens": usage.get('total_tokens', 0)
        }
    }


# ============ AI 提供商适配器 ============

class AIProvider:
    """AI 提供商基类"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def call_chat(self, payload: Dict) -> Dict:
        """调用聊天 API"""
        raise NotImplementedError
    
    async def stream_chat(self, payload: Dict, callback):
        """流式调用聊天 API"""
        raise NotImplementedError


class OpenAIProvider(AIProvider):
    """OpenAI 提供商"""
    
    async def call_chat(self, payload: Dict) -> Dict:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        request_payload = {
            "model": payload['model'],
            "messages": payload['messages'],
            "temperature": payload.get('temperature', 0.7),
            "max_tokens": payload.get('max_tokens', 2000),
            "top_p": payload.get('top_p', 1),
            "stream": payload.get('stream', False)
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=request_payload) as response:
                data = await response.json()
                return data


class QwenProvider(AIProvider):
    """Qwen (阿里云通义千问) 提供商"""

    async def call_chat(self, payload: Dict) -> Dict:
        # 使用 OpenAI 兼容的端点
        url = "https://coding.dashscope.aliyuncs.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        request_payload = {
            "model": payload['model'],
            "messages": payload['messages'],
            "temperature": payload.get('temperature', 0.7),
            "max_tokens": payload.get('max_tokens', 2000),
            "top_p": payload.get('top_p', 1)
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=request_payload) as response:
                data = await response.json()

                # 新的 OpenAI 兼容端点已经返回标准格式
                if 'choices' in data:
                    return data
                return normalize_openai_response(
                    data.get('output', {}).get('text', ''),
                    data.get('usage', {})
                )


class MiniMaxProvider(AIProvider):
    """MiniMax 提供商"""
    
    async def call_chat(self, payload: Dict) -> Dict:
        url = "https://api.minimax.chat/v1/text/chatcompletion_v2"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        request_payload = {
            "model": payload['model'],
            "messages": payload['messages'],
            "temperature": payload.get('temperature', 0.7),
            "tokens_to_generate": payload.get('max_tokens', 2000),
            "top_p": payload.get('top_p', 1)
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=request_payload) as response:
                data = await response.json()
                
                # 转换为 OpenAI 格式
                if 'choices' in data:
                    return data  # MiniMax 已经是类似格式
                return normalize_openai_response(
                    data.get('reply', ''),
                    data.get('usage', {})
                )


class ZhipuProvider(AIProvider):
    """Zhipu (智谱 GLM) 提供商"""
    
    async def call_chat(self, payload: Dict) -> Dict:
        url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        request_payload = {
            "model": payload['model'],
            "messages": payload['messages'],
            "temperature": payload.get('temperature', 0.7),
            "max_tokens": payload.get('max_tokens', 2000),
            "top_p": payload.get('top_p', 1)
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=request_payload) as response:
                data = await response.json()
                return data  # 智谱 API 已经是 OpenAI 格式


class DouyinProvider(AIProvider):
    """Douyin (豆包) 提供商"""

    async def call_chat(self, payload: Dict) -> Dict:
        # 使用 coding 专用端点
        url = "https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        request_payload = {
            "model": payload['model'],
            "messages": payload['messages'],
            "temperature": payload.get('temperature', 0.7),
            "max_tokens": payload.get('max_tokens', 2000),
            "top_p": payload.get('top_p', 1)
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=request_payload) as response:
                data = await response.json()

                # 转换为 OpenAI 格式
                if 'choices' in data:
                    return data
                return normalize_openai_response(
                    data.get('output', {}).get('text', ''),
                    data.get('usage', {})
                )


# ============ 路由处理 ============

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    """
    OpenAI 格式的通用端点
    支持所有 AI 提供商，统一为 OpenAI 格式
    """
    request_id = generate_request_id()
    start_time = datetime.now()
    
    try:
        # 解析请求
        data = request.get_json()
        provider = data.get('provider')
        model = data.get('model')
        messages = data.get('messages')
        api_key = data.get('apiKey')
        stream = data.get('stream', False)
        
        # 验证必填字段
        if not provider:
            log_request(request_id, 'POST', '/v1/chat/completions', 
                     {'error': '缺少 provider'})
            return jsonify({'error': '缺少 provider 字段'}), 400
        
        if not model:
            log_request(request_id, 'POST', '/v1/chat/completions',
                     {'error': '缺少 model'})
            return jsonify({'error': '缺少 model 字段'}), 400
        
        if not messages or not isinstance(messages, list):
            log_request(request_id, 'POST', '/v1/chat/completions',
                     {'error': '缺少或格式错误的 messages'})
            return jsonify({'error': '缺少或格式错误的 messages 字段'}), 400
        
        if not api_key:
            log_request(request_id, 'POST', '/v1/chat/completions',
                     {'error': '缺少 apiKey'})
            return jsonify({'error': '缺少 apiKey 字段'}), 400
        
        log_request(request_id, 'POST', '/v1/chat/completions', {
            'provider': provider,
            'model': model,
            'message_count': len(messages),
            'stream': stream
        })
        
        # 选择提供商
        providers = {
            'openai': OpenAIProvider,
            'qwen': QwenProvider,
            'minimax': MiniMaxProvider,
            'zhipu': ZhipuProvider,
            'douyin': DouyinProvider
        }
        
        provider_class = providers.get(provider.lower())
        if not provider_class:
            return jsonify({'error': f'未知的提供商: {provider}'}), 400
        
        # 异步调用 API
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        provider_instance = provider_class(api_key)
        result = loop.run_until_complete(provider_instance.call_chat(data))
        loop.close()
        
        duration = (datetime.now() - start_time).total_seconds() * 1000
        
        log_response(request_id, 'POST', '/v1/chat/completions', 200)
        logger.info('SUCCESS', extra={
            'request_id': request_id,
            'provider': provider,
            'model': model,
            'duration_ms': duration
        })
        
        return jsonify(result)
        
    except Exception as e:
        duration = (datetime.now() - start_time).total_seconds() * 1000
        logger.error('EXCEPTION', exc_info=True, extra={
            'request_id': request_id,
            'duration_ms': duration,
            'error': str(e)
        })
        return jsonify({
            'error': str(e),
            'request_id': request_id
        }), 500


@app.route('/api/proxy/<provider>/<endpoint>', methods=['POST', 'OPTIONS'])
def proxy_legacy(provider, endpoint):
    """
    兼容旧 API 格式的代理路由
    POST /api/proxy/:provider/:endpoint
    """
    # 处理 CORS 预检请求
    if request.method == 'OPTIONS':
        response = Response()
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    request_id = generate_request_id()
    start_time = datetime.now()
    
    try:
        data = request.get_json()
        api_key = data.get('apiKey')
        
        if not api_key:
            log_request(request_id, 'POST', f'/api/proxy/{provider}/{endpoint}',
                     {'error': '缺少 apiKey'})
            return jsonify({'error': '缺少 API 密钥'}), 400
        
        log_request(request_id, 'POST', f'/api/proxy/{provider}/{endpoint}', {
            'provider': provider,
            'endpoint': endpoint
        })
        
        # 转换到新格式并调用 chat_completions
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # 获取 provider 类并实例化
        providers = {
            'openai': OpenAIProvider,
            'qwen': QwenProvider,
            'minimax': MiniMaxProvider,
            'zhipu': ZhipuProvider,
            'douyin': DouyinProvider
        }
        
        provider_class = providers.get(provider.lower())
        if not provider_class:
            return jsonify({'error': f'未知的提供商: {provider}'}), 400
        
        provider_instance = provider_class(api_key)
        result = loop.run_until_complete(provider_instance.call_chat(data))
        loop.close()
        
        duration = (datetime.now() - start_time).total_seconds() * 1000
        
        log_response(request_id, 'POST', f'/api/proxy/{provider}/{endpoint}', 200)
        logger.info('SUCCESS', extra={
            'request_id': request_id,
            'provider': provider,
            'duration_ms': duration
        })
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        duration = (datetime.now() - start_time).total_seconds() * 1000
        logger.error('EXCEPTION', exc_info=True, extra={
            'request_id': request_id,
            'duration_ms': duration,
            'error': str(e)
        })
        return jsonify({
            'success': False,
            'error': str(e),
            'request_id': request_id
        }), 500


@app.route('/proxy/<provider>/chat', methods=['POST', 'OPTIONS'])
def proxy_chat(provider):
    """
    前端兼容路由 (没有 /api 前缀)
    POST /proxy/:provider/chat
    """
    # 处理 CORS 预检请求
    if request.method == 'OPTIONS':
        response = Response()
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    request_id = generate_request_id()
    start_time = datetime.now()
    
    try:
        data = request.get_json()
        api_key = data.get('apiKey')
        
        if not api_key:
            log_request(request_id, 'POST', f'/proxy/{provider}/chat',
                     {'error': '缺少 apiKey'})
            return jsonify({'error': '缺少 API 密钥'}), 400
        
        log_request(request_id, 'POST', f'/proxy/{provider}/chat', {
            'provider': provider
        })
        
        # 转换到新格式并调用 chat_completions
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # 获取 provider 类并实例化
        providers = {
            'openai': OpenAIProvider,
            'qwen': QwenProvider,
            'minimax': MiniMaxProvider,
            'zhipu': ZhipuProvider,
            'douyin': DouyinProvider
        }
        
        provider_class = providers.get(provider.lower())
        if not provider_class:
            return jsonify({'error': f'未知的提供商: {provider}'}), 400
        
        provider_instance = provider_class(api_key)
        result = loop.run_until_complete(provider_instance.call_chat(data))
        loop.close()
        
        duration = (datetime.now() - start_time).total_seconds() * 1000
        
        log_response(request_id, 'POST', f'/proxy/{provider}/chat', 200)
        logger.info('SUCCESS', extra={
            'request_id': request_id,
            'provider': provider,
            'duration_ms': duration
        })
        
        return jsonify({'success': True, 'data': result})
        
    except Exception as e:
        duration = (datetime.now() - start_time).total_seconds() * 1000
        logger.error('EXCEPTION', exc_info=True, extra={
            'request_id': request_id,
            'duration_ms': duration,
            'error': str(e)
        })
        return jsonify({
            'success': False,
            'error': str(e),
            'request_id': request_id
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'environment': NODE_ENV,
        'port': PORT
    })


@app.errorhandler(404)
def not_found(error):
    """404 处理"""
    return jsonify({'error': '端点未找到'}), 404


@app.errorhandler(500)
def internal_error(error):
    """500 处理"""
    logger.error('INTERNAL_ERROR', exc_info=True)
    return jsonify({'error': '服务器内部错误'}), 500


# ============ 启动服务器 ============

def run_development():
    """运行开发服务器"""
    logger.info('SERVER_START', extra={
        'port': PORT,
        'url': f'http://localhost:{PORT}',
        'environment': NODE_ENV,
        'supported_providers': 'OpenAI, Qwen, MiniMax, Zhipu, Douyin',
        'main_endpoint': 'POST /v1/chat/completions',
        'health_endpoint': 'GET /health',
        'server_type': 'Flask Development Server'
    })
    
    # 启动 Flask 开发服务器
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=True
    )

def run_production():
    """运行生产服务器（使用 waitress）"""
    try:
        from waitress import serve
        logger.info('SERVER_START', extra={
            'port': PORT,
            'url': f'http://localhost:{PORT}',
            'environment': NODE_ENV,
            'supported_providers': 'OpenAI, Qwen, MiniMax, Zhipu, Douyin',
            'main_endpoint': 'POST /v1/chat/completions',
            'health_endpoint': 'GET /health',
            'server_type': 'Waitress Production Server'
        })
        
        # 使用 waitress 作为生产服务器
        serve(app, host='0.0.0.0', port=PORT)
    except ImportError:
        logger.warning('Waitress not installed, falling back to Flask development server')
        logger.warning('Install waitress for production: pip install waitress')
        run_development()

if __name__ == '__main__':
    # 根据环境选择服务器
    if NODE_ENV == 'production':
        run_production()
    else:
        run_development()
