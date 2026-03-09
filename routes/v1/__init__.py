"""
API Version 1
Main API routes
"""

from flask import Blueprint

# Create v1 blueprint
v1_bp = Blueprint('v1', __name__, url_prefix='/api/v1')

# Import and register sub-blueprints
from routes.auth import auth_bp
from routes.food import food_bp
from routes.user import user_bp
from routes.analytics import analytics_bp
from routes.token import token_bp

# Register blueprints under v1
v1_bp.register_blueprint(auth_bp, url_prefix='/auth')
v1_bp.register_blueprint(food_bp, url_prefix='/food')
v1_bp.register_blueprint(user_bp, url_prefix='/user')
v1_bp.register_blueprint(analytics_bp, url_prefix='/analytics')
v1_bp.register_blueprint(token_bp, url_prefix='/token')
