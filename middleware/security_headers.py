"""
Security Headers Middleware
Adds security headers to all responses
"""

from flask_talisman import Talisman

def init_security_headers(app):
    """
    Initialize security headers with Flask-Talisman
    """
    # Content Security Policy
    csp = {
        'default-src': "'self'",
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'frame-ancestors': "'none'",
        'base-uri': "'self'",
        'form-action': "'self'"
    }
    
    # Initialize Talisman
    talisman = Talisman(
        app,
        force_https=app.config.get('FORCE_HTTPS', False),  # Enable in production
        strict_transport_security=True,
        strict_transport_security_max_age=31536000,  # 1 year
        strict_transport_security_include_subdomains=True,
        content_security_policy=csp,
        content_security_policy_nonce_in=['script-src'],
        referrer_policy='strict-origin-when-cross-origin',
        feature_policy={
            'geolocation': "'none'",
            'microphone': "'none'",
            'camera': "'none'",
            'payment': "'none'"
        },
        frame_options='DENY',
        frame_options_allow_from=None,
        session_cookie_secure=app.config.get('SESSION_COOKIE_SECURE', False),
        session_cookie_http_only=True,
        session_cookie_samesite='Lax'
    )
    
    # Add custom security headers
    @app.after_request
    def add_security_headers(response):
        # Permissions Policy (replaces Feature-Policy)
        response.headers['Permissions-Policy'] = (
            'geolocation=(), '
            'microphone=(), '
            'camera=(), '
            'payment=(), '
            'usb=(), '
            'magnetometer=(), '
            'gyroscope=(), '
            'accelerometer=()'
        )
        
        # Additional security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Remove server header
        response.headers.pop('Server', None)
        
        # Cache control for sensitive data
        from flask import request
        if request.path and '/api/' in request.path:
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        
        return response
    
    return talisman
