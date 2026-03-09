"""
Monitoring and Error Tracking
Sentry integration and custom monitoring
"""

import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from flask import Flask
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def init_sentry(app: Flask) -> None:
    """
    Initialize Sentry error tracking
    
    Args:
        app: Flask application instance
    """
    sentry_dsn = app.config.get('SENTRY_DSN')
    
    if not sentry_dsn:
        logger.warning("Sentry DSN not configured. Error tracking disabled.")
        return
    
    try:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                FlaskIntegration(),
                SqlalchemyIntegration(),
                RedisIntegration(),
                CeleryIntegration(),
            ],
            environment=app.config.get('SENTRY_ENVIRONMENT', 'development'),
            traces_sample_rate=app.config.get('SENTRY_TRACES_SAMPLE_RATE', 0.1),
            profiles_sample_rate=app.config.get('SENTRY_PROFILES_SAMPLE_RATE', 0.1),
            send_default_pii=False,  # Don't send personally identifiable information
            attach_stacktrace=True,
            debug=app.debug,
            before_send=before_send_filter,
        )
        
        logger.info(f"Sentry initialized for environment: {app.config.get('SENTRY_ENVIRONMENT')}")
        
    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {str(e)}")


def before_send_filter(event: dict, hint: dict) -> Optional[dict]:
    """
    Filter events before sending to Sentry
    
    Args:
        event: Sentry event
        hint: Additional context
    
    Returns:
        Filtered event or None to drop
    """
    # Don't send 404 errors
    if event.get('level') == 'error':
        if 'exc_info' in hint:
            exc_type, exc_value, tb = hint['exc_info']
            if '404' in str(exc_value):
                return None
    
    # Filter out sensitive data
    if 'request' in event:
        if 'headers' in event['request']:
            # Remove authorization headers
            event['request']['headers'].pop('Authorization', None)
            event['request']['headers'].pop('Cookie', None)
    
    return event


def capture_exception(error: Exception, context: Optional[dict] = None) -> None:
    """
    Capture exception with additional context
    
    Args:
        error: Exception to capture
        context: Additional context information
    """
    try:
        if context:
            with sentry_sdk.push_scope() as scope:
                for key, value in context.items():
                    scope.set_extra(key, value)
                sentry_sdk.capture_exception(error)
        else:
            sentry_sdk.capture_exception(error)
    except Exception as e:
        logger.error(f"Failed to capture exception in Sentry: {str(e)}")


def capture_message(message: str, level: str = 'info', context: Optional[dict] = None) -> None:
    """
    Capture custom message
    
    Args:
        message: Message to capture
        level: Severity level (info, warning, error)
        context: Additional context
    """
    try:
        if context:
            with sentry_sdk.push_scope() as scope:
                for key, value in context.items():
                    scope.set_extra(key, value)
                sentry_sdk.capture_message(message, level=level)
        else:
            sentry_sdk.capture_message(message, level=level)
    except Exception as e:
        logger.error(f"Failed to capture message in Sentry: {str(e)}")


def set_user_context(user_id: int, email: Optional[str] = None, username: Optional[str] = None) -> None:
    """
    Set user context for error tracking
    
    Args:
        user_id: User ID
        email: User email (optional)
        username: Username (optional)
    """
    try:
        sentry_sdk.set_user({
            'id': user_id,
            'email': email,
            'username': username
        })
    except Exception as e:
        logger.error(f"Failed to set user context: {str(e)}")


def clear_user_context() -> None:
    """Clear user context"""
    try:
        sentry_sdk.set_user(None)
    except Exception as e:
        logger.error(f"Failed to clear user context: {str(e)}")


def add_breadcrumb(message: str, category: str = 'default', level: str = 'info', data: Optional[dict] = None) -> None:
    """
    Add breadcrumb for debugging
    
    Args:
        message: Breadcrumb message
        category: Category (e.g., 'auth', 'database', 'api')
        level: Severity level
        data: Additional data
    """
    try:
        sentry_sdk.add_breadcrumb(
            message=message,
            category=category,
            level=level,
            data=data or {}
        )
    except Exception as e:
        logger.error(f"Failed to add breadcrumb: {str(e)}")


class PerformanceMonitor:
    """Context manager for monitoring performance"""
    
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.transaction = None
    
    def __enter__(self):
        try:
            self.transaction = sentry_sdk.start_transaction(
                op=self.operation_name,
                name=self.operation_name
            )
            self.transaction.__enter__()
        except Exception as e:
            logger.error(f"Failed to start performance monitoring: {str(e)}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if self.transaction:
                self.transaction.__exit__(exc_type, exc_val, exc_tb)
        except Exception as e:
            logger.error(f"Failed to end performance monitoring: {str(e)}")


def monitor_performance(operation_name: str):
    """
    Decorator for monitoring function performance
    
    Args:
        operation_name: Name of the operation
    
    Returns:
        Decorated function
    """
    def decorator(f):
        from functools import wraps
        
        @wraps(f)
        def decorated_function(*args, **kwargs):
            with PerformanceMonitor(operation_name):
                return f(*args, **kwargs)
        
        return decorated_function
    return decorator
