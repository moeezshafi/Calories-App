"""
Database Helper Functions
Common database operations
"""

from database import db
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, Any


def safe_commit() -> tuple[bool, Optional[str]]:
    """
    Safely commit database changes with error handling
    
    Returns:
        Tuple of (success: bool, error_message: Optional[str])
    """
    try:
        db.session.commit()
        return True, None
    except SQLAlchemyError as e:
        db.session.rollback()
        return False, str(e)


def safe_add(obj: Any) -> tuple[bool, Optional[str]]:
    """
    Safely add object to database with error handling
    
    Args:
        obj: Database model instance to add
    
    Returns:
        Tuple of (success: bool, error_message: Optional[str])
    """
    try:
        db.session.add(obj)
        db.session.commit()
        return True, None
    except SQLAlchemyError as e:
        db.session.rollback()
        return False, str(e)


def safe_delete(obj: Any) -> tuple[bool, Optional[str]]:
    """
    Safely delete object from database with error handling
    
    Args:
        obj: Database model instance to delete
    
    Returns:
        Tuple of (success: bool, error_message: Optional[str])
    """
    try:
        db.session.delete(obj)
        db.session.commit()
        return True, None
    except SQLAlchemyError as e:
        db.session.rollback()
        return False, str(e)


def get_or_404(model: Any, id: int, error_message: str = "Resource not found"):
    """
    Get model by ID or return 404 error
    
    Args:
        model: Database model class
        id: ID to search for
        error_message: Custom error message
    
    Returns:
        Model instance
    
    Raises:
        404 error if not found
    """
    from flask import abort
    obj = model.query.get(id)
    if obj is None:
        abort(404, description=error_message)
    return obj


def paginate_query(query, page: int = 1, per_page: int = 20):
    """
    Paginate a SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-indexed)
        per_page: Items per page
    
    Returns:
        Tuple of (items, total_count)
    """
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total
