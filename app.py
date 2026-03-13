from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from database import db
from middleware.rate_limiter import init_limiter
from middleware.security_headers import init_security_headers
from utils.error_handlers import register_error_handlers
from utils.cache import cache_manager
import logging
from logging.handlers import RotatingFileHandler
import os

# Initialize extensions
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Setup logging
    setup_logging(app)
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cache_manager.init_app(app)
    
    # Initialize rate limiter
    limiter = init_limiter(app)
    
    # Initialize security headers
    if not app.debug:
        init_security_headers(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # CORS configuration - allow all origins and methods for mobile app compatibility
    CORS(app, 
         resources={r"/api/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept"],
             "expose_headers": ["Content-Type", "Authorization"],
             "supports_credentials": False,  # Must be False when origins is "*"
             "max_age": 3600
         }})
    
    # Import and register blueprints
    from routes.auth import auth_bp
    from routes.food import food_bp
    from routes.user import user_bp
    from routes.analytics import analytics_bp
    from routes.token import token_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(food_bp, url_prefix='/api/food')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(token_bp, url_prefix='/api/token')

    from routes.water import water_bp
    from routes.weight import weight_bp
    from routes.steps import steps_bp
    from routes.preferences import preferences_bp
    from routes.search import search_bp
    from routes.badges import badges_bp
    from routes.progress_photos import progress_photos_bp
    from routes.exercises import exercises_bp
    from routes.meal_plans import meal_plans_bp
    from routes.recipes import recipes_bp

    app.register_blueprint(water_bp, url_prefix='/api/water')
    app.register_blueprint(weight_bp, url_prefix='/api/weight')
    app.register_blueprint(steps_bp, url_prefix='/api/steps')
    app.register_blueprint(preferences_bp, url_prefix='/api/preferences')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(badges_bp, url_prefix='/api/badges')
    app.register_blueprint(progress_photos_bp, url_prefix='/api/progress-photos')
    app.register_blueprint(exercises_bp, url_prefix='/api/exercises')
    app.register_blueprint(meal_plans_bp, url_prefix='/api/meal-plans')
    app.register_blueprint(recipes_bp, url_prefix='/api/recipes')

    # Create tables (checkfirst avoids conflicts with existing migrations)
    with app.app_context():
        db.metadata.create_all(db.engine, checkfirst=True)
    
    @app.route('/')
    def index():
        """Root endpoint - API info"""
        return {
            'name': 'Calorie Tracker API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': '/api/*'
        }
    
    @app.route('/favicon.ico')
    def favicon():
        """Favicon handler to prevent 404 errors"""
        return '', 204  # No content
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Calorie Detection API is running'}
    
    # Serve uploaded images
    from flask import send_from_directory
    
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        """Serve uploaded files (images, etc.)"""
        uploads_dir = os.path.join(app.root_path, 'uploads')
        return send_from_directory(uploads_dir, filename)
    
    return app

def setup_logging(app):
    """Configure application logging"""
    if not app.debug:
        # Create logs directory if it doesn't exist
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        # File handler with rotation
        file_handler = RotatingFileHandler(
            'logs/app.log',
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Calorie Detection API startup')

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)