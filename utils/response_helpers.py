"""
Response Helper Functions
Standardized API response formats
"""

from flask import jsonify
from typing import Any, Dict, Optional, Tuple, List


def success_response(message: str, data: Optional[Dict[str, Any]] = None, status_code: int = 200) -> Tuple[Any, int]:
    """
    Create a standardized success response
    
    Args:
        message: Success message
        data: Optional data payload
        status_code: HTTP status code (default: 200)
    
    Returns:
        Tuple of (response, status_code)
    """
    response: Dict[str, Any] = {
        'success': True,
        'message': message
    }
    
    if data is not None:
        response['data'] = data
    
    return jsonify(response), status_code


def error_response(message: str, details: Optional[str] = None, status_code: int = 400) -> Tuple[Any, int]:
    """
    Create a standardized error response
    
    Args:
        message: Error message
        details: Optional error details
        status_code: HTTP status code (default: 400)
    
    Returns:
        Tuple of (response, status_code)
    """
    response: Dict[str, Any] = {
        'success': False,
        'error': message
    }
    
    if details:
        response['details'] = details
    
    return jsonify(response), status_code


def validation_error_response(errors: List[str], message: str = "Validation failed") -> Tuple[Any, int]:
    """
    Create a standardized validation error response
    
    Args:
        errors: List of validation errors
        message: Error message
    
    Returns:
        Tuple of (response, status_code)
    """
    return jsonify({
        'success': False,
        'error': message,
        'validation_errors': errors
    }), 400


def paginated_response(
    items: List[Any],
    page: int,
    per_page: int,
    total: int,
    message: str = "Success"
) -> Tuple[Any, int]:
    """
    Create a standardized paginated response
    
    Args:
        items: List of items for current page
        page: Current page number
        per_page: Items per page
        total: Total number of items
        message: Success message
    
    Returns:
        Tuple of (response, status_code)
    """
    total_pages: int = (total + per_page - 1) // per_page
    
    return jsonify({
        'success': True,
        'message': message,
        'data': {
            'items': items,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        }
    }), 200
