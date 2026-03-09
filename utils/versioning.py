"""
API Versioning Utilities
Handle API version detection and routing
"""

from flask import request, jsonify
from functools import wraps
from typing import Callable, Optional


def get_api_version() -> str:
    """
    Get API version from request
    
    Returns:
        API version string (e.g., 'v1', 'v2')
    """
    # Check URL path
    if '/api/v1/' in request.path:
        return 'v1'
    elif '/api/v2/' in request.path:
        return 'v2'
    
    # Check header
    version_header = request.headers.get('API-Version', 'v1')
    return version_header.lower()


def require_version(min_version: str):
    """
    Decorator to require minimum API version
    
    Args:
        min_version: Minimum required version (e.g., 'v1', 'v2')
    
    Returns:
        Decorated function
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_version = get_api_version()
            
            # Simple version comparison
            if current_version < min_version:
                return jsonify({
                    'error': 'API version not supported',
                    'current_version': current_version,
                    'required_version': min_version
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def deprecated_endpoint(message: Optional[str] = None, sunset_date: Optional[str] = None):
    """
    Decorator to mark endpoint as deprecated
    
    Args:
        message: Deprecation message
        sunset_date: Date when endpoint will be removed (YYYY-MM-DD)
    
    Returns:
        Decorated function
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            response = f(*args, **kwargs)
            
            # Add deprecation headers
            if hasattr(response, 'headers'):
                response.headers['X-API-Deprecated'] = 'true'
                if message:
                    response.headers['X-API-Deprecation-Message'] = message
                if sunset_date:
                    response.headers['X-API-Sunset-Date'] = sunset_date
            
            return response
        
        return decorated_function
    return decorator


def version_response(data: dict, version: Optional[str] = None) -> dict:
    """
    Add version information to response
    
    Args:
        data: Response data
        version: API version
    
    Returns:
        Response with version info
    """
    if version is None:
        version = get_api_version()
    
    return {
        **data,
        'api_version': version
    }
