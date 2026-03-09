# Calorie Tracker App

A comprehensive calorie tracking application with AI-powered food recognition, built with Flask backend and React Native (Expo) mobile app.

## Features

- 📸 AI-powered food image recognition using Google Gemini
- 📊 Detailed nutrition tracking (calories, macros, fiber, sugar, sodium)
- 🏃 Exercise and step tracking
- 💧 Water intake logging
- 📈 Progress analytics and insights
- 🎯 Goal setting and tracking
- 🔔 Meal reminders and notifications
- 🍽️ Recipe builder and meal planning
- 📅 Calendar-based history view
- 🏆 Streak tracking and badges

## Tech Stack

### Backend
- **Framework**: Flask 3.0
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (Flask-JWT-Extended)
- **Caching**: Redis
- **AI**: Google Gemini API
- **Migrations**: Alembic
- **Production Server**: Gunicorn + Nginx

### Mobile App
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **State Management**: Zustand
- **Internationalization**: i18next
- **HTTP Client**: Axios
- **Camera**: Expo Camera
- **Notifications**: Expo Notifications

## Project Structure

```
calories-app/
├── app.py                      # Flask application entry point
├── config.py                   # Configuration settings
├── database.py                 # Database initialization
├── requirements.txt            # Python dependencies
├── gunicorn_config.py         # Gunicorn configuration
├── deploy.sh                   # Deployment script
├── models/                     # Database models
├── routes/                     # API routes
├── services/                   # Business logic
├── middleware/                 # Custom middleware
├── utils/                      # Utility functions
├── migrations/                 # Database migrations
├── CalorieMobileApp/          # React Native mobile app
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── screens/           # App screens
│   │   ├── navigation/        # Navigation configuration
│   │   ├── services/          # API services
│   │   ├── store/             # State management
│   │   ├── theme/             # Theme configuration
│   │   └── utils/             # Utility functions
│   ├── app.json               # Expo configuration
│   ├── eas.json               # EAS Build configuration
│   └── package.json           # Node dependencies
└── PRODUCTION_DEPLOYMENT_GUIDE.md  # Deployment guide
```

## Quick Start

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calories-app
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python init_db.py
   python run_migrations.py
   ```

6. **Run development server**
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000`

### Mobile App Setup

1. **Navigate to mobile app directory**
   ```bash
   cd CalorieMobileApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API URL**
   Edit `src/config/constants.ts` and set your backend URL

4. **Start development server**
   ```bash
   npx expo start
   ```

5. **Run on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## Production Deployment

See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Hetzner

1. **SSH into server**
   ```bash
   ssh root@your-server-ip
   ```

2. **Clone and setup**
   ```bash
   cd /var/www
   git clone <repository-url> calorie-app
   cd calorie-app
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Build Android APK**
   ```bash
   cd CalorieMobileApp
   eas build --platform android --profile production
   ```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Food Tracking
- `POST /api/food/analyze-image` - Analyze food image
- `POST /api/food/log` - Log food entry
- `GET /api/food/logs` - Get food logs
- `DELETE /api/food/logs/:id` - Delete food log

### Analytics
- `GET /api/analytics/daily/:date` - Get daily analytics
- `GET /api/analytics/weekly` - Get weekly analytics
- `GET /api/analytics/monthly` - Get monthly analytics

### Exercise
- `POST /api/exercise/log` - Log exercise
- `GET /api/exercise/logs` - Get exercise logs

### More endpoints available - see route files in `routes/` directory

## Environment Variables

### Backend (.env)
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Mobile App (constants.ts)
```typescript
export const API_BASE_URL = 'http://your-server-ip:5000';
export const GEMINI_API_KEY = 'your-gemini-api-key';
```

## Testing

```bash
# Backend tests
pytest

# Mobile app tests
cd CalorieMobileApp
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Google Gemini AI for food recognition
- Expo team for the amazing mobile development platform
- Flask community for the robust web framework
