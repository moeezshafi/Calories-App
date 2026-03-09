"""
Application Constants
Centralized location for all magic numbers and configuration values
"""

# User Validation Constants
MIN_AGE = 13
MAX_AGE = 120
MIN_WEIGHT_KG = 20
MAX_WEIGHT_KG = 500
MIN_HEIGHT_CM = 100
MAX_HEIGHT_CM = 250
MIN_DAILY_CALORIES = 800
MAX_DAILY_CALORIES = 5000

# Password Constants
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128

# Nutritional Constants
MIN_CALORIES = 0
MAX_CALORIES_PER_SERVING = 10000
MAX_SERVING_SIZE_GRAMS = 10000

# Image Processing Constants
MAX_IMAGE_SIZE_PIXELS = (1024, 1024)
MAX_IMAGE_SIZE_MB = 16
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Activity Level Multipliers (for BMR calculation)
ACTIVITY_MULTIPLIERS = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'very_active': 1.725,
    'extra_active': 1.9
}

# Valid Goal Types
VALID_GOAL_TYPES = ['lose_weight', 'maintain', 'gain_weight']

# Valid Activity Levels
VALID_ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'very_active', 'extra_active']

# Valid Genders
VALID_GENDERS = ['male', 'female']

# Valid Meal Types
VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

# Macronutrient Calories per Gram
PROTEIN_CALORIES_PER_GRAM = 4
CARB_CALORIES_PER_GRAM = 4
FAT_CALORIES_PER_GRAM = 9

# API Rate Limits
RATE_LIMIT_LOGIN = '5 per minute'
RATE_LIMIT_REGISTER = '3 per hour'
RATE_LIMIT_IMAGE_ANALYSIS = '10 per minute'
RATE_LIMIT_FOOD_LOG = '30 per minute'
RATE_LIMIT_ANALYTICS = '60 per minute'
RATE_LIMIT_GENERAL = '100 per minute'

# JWT Token Expiry
JWT_ACCESS_TOKEN_EXPIRY_DAYS = 7
JWT_REFRESH_TOKEN_EXPIRY_DAYS = 30

# Pagination
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# File Upload
MAX_UPLOAD_SIZE_MB = 16
UPLOAD_FOLDER = 'uploads'

# Database
DEFAULT_DATABASE_URI = 'sqlite:///calorie_app.db'

# Logging
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
LOG_FILE = 'logs/app.log'
MAX_LOG_SIZE_MB = 10
LOG_BACKUP_COUNT = 5

# HTTP Status Codes
HTTP_OK = 200
HTTP_CREATED = 201
HTTP_BAD_REQUEST = 400
HTTP_UNAUTHORIZED = 401
HTTP_FORBIDDEN = 403
HTTP_NOT_FOUND = 404
HTTP_CONFLICT = 409
HTTP_UNPROCESSABLE_ENTITY = 422
HTTP_TOO_MANY_REQUESTS = 429
HTTP_INTERNAL_SERVER_ERROR = 500

# Error Messages
ERROR_MISSING_FIELDS = 'Missing required fields'
ERROR_INVALID_EMAIL = 'Invalid email format'
ERROR_INVALID_PASSWORD = 'Invalid password'
ERROR_USER_NOT_FOUND = 'User not found'
ERROR_INVALID_CREDENTIALS = 'Invalid email or password'
ERROR_EMAIL_EXISTS = 'Email already registered'
ERROR_UNAUTHORIZED = 'Unauthorized access'
ERROR_RATE_LIMIT = 'Rate limit exceeded'
ERROR_INVALID_TOKEN = 'Invalid or expired token'
ERROR_FILE_TOO_LARGE = 'File size exceeds maximum allowed'
ERROR_INVALID_FILE_TYPE = 'Invalid file type'
ERROR_NOT_FOOD = 'Image does not contain food'

# Success Messages
SUCCESS_REGISTRATION = 'User registered successfully'
SUCCESS_LOGIN = 'Login successful'
SUCCESS_LOGOUT = 'Logout successful'
SUCCESS_UPDATE = 'Updated successfully'
SUCCESS_DELETE = 'Deleted successfully'
SUCCESS_CREATED = 'Created successfully'
