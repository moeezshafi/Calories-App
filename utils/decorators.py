"""
Custom decorators for API endpoints
"""

from functools import wraps
from flask import current_app, request, jsonify

def rate_limit(limit_string):
    """
    Rate limiting decorator
    Usage: @rate_limit('5 per minute')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            limiter = current_app.extensions.get('limiter')
            if limiter:
                # Apply rate limit
                limiter.limit(limit_string)(f)(*args, **kwargs)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_api_key(f):
    """
    Require API key for endpoint
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != current_app.config.get('API_KEY'):
            return jsonify({'error': 'Invalid or missing API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

def log_request(f):
    """
    Log all requests to endpoint
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_app.logger.info(f"Request to {request.endpoint}: {request.method} {request.path}")
        return f(*args, **kwargs)
    return decorated_function
