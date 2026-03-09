"""
Rate Limiting Middleware
Protects API endpoints from abuse and DoS attacks
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request, jsonify

def get_user_id():
    """Get user ID from JWT token for user-based rate limiting"""
    try:
        from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        return user_id if user_id else get_remote_address()
    except:
        return get_remote_address()

def init_limiter(app):
    """Initialize rate limiter with Flask app"""
    storage = app.config.get('REDIS_URL') or "memory://"
    limiter = Limiter(
        app=app,
        key_func=get_user_id,
        default_limits=["1000 per day", "200 per hour"],
        storage_uri=storage,
        strategy="fixed-window",
        headers_enabled=True,
    )
    
    # Custom error handler for rate limit exceeded
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': str(e.description),
            'retry_after': e.description.split('in ')[-1] if 'in ' in str(e.description) else 'unknown'
        }), 429
    
    return limiter

# Rate limit configurations for different endpoint types
RATE_LIMITS = {
    'auth_login': '5 per minute',
    'auth_register': '3 per hour',
    'auth_password_reset': '3 per hour',
    'image_analysis': '10 per minute',
    'food_log': '30 per minute',
    'analytics': '60 per minute',
    'general': '100 per minute'
}
