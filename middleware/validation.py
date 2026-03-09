"""
Request Validation Middleware
"""

from flask import request, jsonify
from functools import wraps
import json

def validate_json(f):
    """
    Validate that request contains valid JSON
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method in ['POST', 'PUT', 'PATCH']:
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            try:
                request.get_json()
            except Exception as e:
                return jsonify({'error': 'Invalid JSON', 'details': str(e)}), 400
        
        return f(*args, **kwargs)
    return decorated_function

def validate_content_length(max_length=1024*1024):  # 1MB default
    """
    Validate request content length
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            content_length = request.content_length
            if content_length and content_length > max_length:
                return jsonify({
                    'error': 'Request too large',
                    'max_size': f'{max_length / 1024 / 1024}MB',
                    'your_size': f'{content_length / 1024 / 1024:.2f}MB'
                }), 413
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_fields(*required_fields):
    """
    Validate that required fields are present in request JSON
    Usage: @require_fields('email', 'password')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                return jsonify({
                    'error': 'Missing required fields',
                    'missing_fields': missing_fields
                }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def sanitize_request_data(f):
    """
    Sanitize all string fields in request JSON
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.is_json:
            from utils.validators import sanitize_input
            data = request.get_json()
            
            def sanitize_dict(d):
                if isinstance(d, dict):
                    return {k: sanitize_dict(v) for k, v in d.items()}
                elif isinstance(d, list):
                    return [sanitize_dict(item) for item in d]
                elif isinstance(d, str):
                    return sanitize_input(d)
                else:
                    return d
            
            # Replace request data with sanitized version
            request._cached_json = (sanitize_dict(data), request._cached_json[1])
        
        return f(*args, **kwargs)
    return decorated_function
