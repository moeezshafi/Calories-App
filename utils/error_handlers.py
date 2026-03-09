"""
Standardized Error Handling
"""

from flask import jsonify
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from utils.constants import *

class APIError(Exception):
    """Base API Error"""
    def __init__(self, message, status_code=HTTP_BAD_REQUEST, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['error'] = self.message
        rv['status_code'] = self.status_code
        return rv

class ValidationError(APIError):
    """Validation Error"""
    def __init__(self, message, errors=None):
        super().__init__(message, HTTP_BAD_REQUEST, {'errors': errors})

class AuthenticationError(APIError):
    """Authentication Error"""
    def __init__(self, message=ERROR_UNAUTHORIZED):
        super().__init__(message, HTTP_UNAUTHORIZED)

class AuthorizationError(APIError):
    """Authorization Error"""
    def __init__(self, message='Forbidden'):
        super().__init__(message, HTTP_FORBIDDEN)

class NotFoundError(APIError):
    """Not Found Error"""
    def __init__(self, message=ERROR_USER_NOT_FOUND):
        super().__init__(message, HTTP_NOT_FOUND)

class ConflictError(APIError):
    """Conflict Error"""
    def __init__(self, message):
        super().__init__(message, HTTP_CONFLICT)

class RateLimitError(APIError):
    """Rate Limit Error"""
    def __init__(self, message=ERROR_RATE_LIMIT):
        super().__init__(message, HTTP_TOO_MANY_REQUESTS)

def register_error_handlers(app):
    """Register all error handlers with Flask app"""
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({
            'error': 'Resource not found',
            'status_code': HTTP_NOT_FOUND
        }), HTTP_NOT_FOUND
    
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        return jsonify({
            'error': 'Method not allowed',
            'status_code': 405
        }), 405
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        app.logger.error(f'Internal Server Error: {error}')
        return jsonify({
            'error': 'Internal server error',
            'status_code': HTTP_INTERNAL_SERVER_ERROR
        }), HTTP_INTERNAL_SERVER_ERROR
    
    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        app.logger.error(f'Database Error: {error}')
        return jsonify({
            'error': 'Database error occurred',
            'status_code': HTTP_INTERNAL_SERVER_ERROR
        }), HTTP_INTERNAL_SERVER_ERROR
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({
            'error': error.description,
            'status_code': error.code
        }), error.code
    
    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.error(f'Unexpected Error: {error}', exc_info=True)
        return jsonify({
            'error': 'An unexpected error occurred',
            'status_code': HTTP_INTERNAL_SERVER_ERROR
        }), HTTP_INTERNAL_SERVER_ERROR

def success_response(message, data=None, status_code=HTTP_OK):
    """Standardized success response"""
    response = {
        'success': True,
        'message': message
    }
    if data:
        response['data'] = data
    return jsonify(response), status_code

def error_response(message, errors=None, status_code=HTTP_BAD_REQUEST):
    """Standardized error response"""
    response = {
        'success': False,
        'error': message
    }
    if errors:
        response['errors'] = errors
    return jsonify(response), status_code
