import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///calorie_app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)  # Reduced from 30 to 7 days
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # OpenAI
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # Gemini (Google Generative AI)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
    
    # App settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # CORS settings
    ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
    
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    
    # Security settings
    FORCE_HTTPS = os.environ.get('FORCE_HTTPS', 'False').lower() == 'true'
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # Caching configuration
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'SimpleCache')
    CACHE_DEFAULT_TIMEOUT = int(os.environ.get('CACHE_DEFAULT_TIMEOUT', 300))
    CACHE_KEY_PREFIX = os.environ.get('CACHE_KEY_PREFIX', 'calorie_app_')
    REDIS_URL = os.environ.get('REDIS_URL', None)
    
    # Celery configuration
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    
    # Push notifications (FCM)
    FCM_SERVER_KEY = os.environ.get('FCM_SERVER_KEY', None)

    # Storage folders
    PROGRESS_PHOTOS_FOLDER = os.environ.get('PROGRESS_PHOTOS_FOLDER', 'uploads/progress_photos')
    FOOD_IMAGES_FOLDER = os.environ.get('FOOD_IMAGES_FOLDER', 'uploads/food_images')

    # Barcode lookup
    OPENFOODFACTS_API_URL = os.environ.get('OPENFOODFACTS_API_URL', 'https://world.openfoodfacts.org/api/v2')

    # Sentry configuration
    SENTRY_DSN = os.environ.get('SENTRY_DSN', None)
    SENTRY_ENVIRONMENT = os.environ.get('SENTRY_ENVIRONMENT', 'development')
