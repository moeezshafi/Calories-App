# 🍎 AI-Powered Calorie Tracker API

A production-ready Flask REST API for calorie tracking with AI-powered food recognition using Google Gemini Vision API.

## 🚀 Features

- **AI Food Recognition**: Analyze food images using Google Gemini Vision API
- **User Management**: Registration, authentication, profile management
- **Food Logging**: Track meals with detailed nutritional information
- **Analytics**: Daily, weekly, and monthly nutrition analytics
- **Custom Foods**: Create and manage custom food database
- **Security**: Rate limiting, input validation, JWT authentication
- **Professional**: Structured logging, error handling, type hints

## 📋 Requirements

- Python 3.9+
- SQLite (or PostgreSQL for production)
- Google Gemini API Key
- Redis (optional, for production rate limiting)

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd calories-app
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional

# Security
JWT_SECRET_KEY=your_strong_jwt_secret_here
SECRET_KEY=your_strong_flask_secret_here

# Database
DATABASE_URL=sqlite:///calorie_app.db

# CORS (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:19000,http://127.0.0.1:19000

# Rate Limiting
REDIS_URL=memory://  # Use redis://localhost:6379 in production
```

### 5. Initialize Database

```bash
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### 6. Run Server

```bash
python run.py
```

Server will start on `http://127.0.0.1:5000`

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "age": 30,
  "weight": 75,
  "height": 175,
  "gender": "male",
  "activity_level": "moderate",
  "goal_type": "maintain"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Food Analysis

#### Analyze Food Image
```http
POST /api/food/analyze-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
language: en  # or 'ar' for Arabic
```

#### Log Food
```http
POST /api/food/log
Authorization: Bearer <token>
Content-Type: application/json

{
  "food_name": "Banana",
  "serving_size": 100,
  "servings_consumed": 1,
  "calories": 89,
  "proteins": 1.1,
  "carbs": 22.8,
  "fats": 0.3,
  "meal_type": "breakfast"
}
```

#### Get Food Logs
```http
GET /api/food/logs?date=2026-03-06
Authorization: Bearer <token>
```

### Analytics

#### Daily Analytics
```http
GET /api/analytics/daily/2026-03-06
Authorization: Bearer <token>
```

#### Weekly Analytics
```http
GET /api/analytics/weekly
Authorization: Bearer <token>
```

#### Monthly Analytics
```http
GET /api/analytics/monthly?year=2026&month=3
Authorization: Bearer <token>
```

### User Profile

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "weight": 74,
  "daily_calorie_goal": 2200
}
```

## 🔒 Security Features

- **Rate Limiting**: Prevents brute force and DoS attacks
- **Input Validation**: Sanitizes all user inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: HTML escaping
- **CORS**: Configurable origin restrictions
- **JWT Authentication**: Secure token-based auth
- **Password Strength**: Enforced strong passwords
- **Security Headers**: HSTS, CSP, etc.

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_auth.py
```

## 📊 Project Structure

```
calories-app/
├── app.py                 # Flask application factory
├── run.py                 # Application entry point
├── config.py              # Configuration
├── database.py            # Database initialization
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment template
├── models/               # Database models
│   ├── user.py
│   ├── food_log.py
│   └── custom_food.py
├── routes/               # API endpoints
│   ├── auth.py
│   ├── food.py
│   ├── user.py
│   └── analytics.py
├── services/             # Business logic
│   ├── gemini_service.py
│   ├── openai_service.py
│   └── auth_service.py
├── middleware/           # Middleware
│   ├── rate_limiter.py
│   └── validation.py
├── utils/                # Utilities
│   ├── validators.py
│   ├── helpers.py
│   ├── constants.py
│   ├── decorators.py
│   └── error_handlers.py
├── tests/                # Test suite
└── logs/                 # Application logs
```

## 🚀 Deployment

### Production Checklist

- [ ] Set strong JWT and Flask secrets
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure Redis for rate limiting
- [ ] Set up HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up monitoring (Sentry)
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Use gunicorn/uwsgi
- [ ] Configure nginx reverse proxy

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### Using Docker

```bash
docker build -t calorie-api .
docker run -p 5000:5000 --env-file .env calorie-api
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `JWT_SECRET_KEY` | JWT signing secret | Yes | - |
| `SECRET_KEY` | Flask secret key | Yes | - |
| `DATABASE_URL` | Database connection string | No | `sqlite:///calorie_app.db` |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | `*` |
| `REDIS_URL` | Redis connection string | No | `memory://` |
| `FLASK_ENV` | Environment (development/production) | No | `development` |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

## 🙏 Acknowledgments

- Google Gemini API for food recognition
- Flask framework
- SQLAlchemy ORM
- All contributors

---

**Made with ❤️ by Your Team**
