# Calorie Tracker Application

A comprehensive health and nutrition management system with AI-powered food recognition, designed to help users monitor their daily caloric intake, track nutritional goals, and maintain a healthy lifestyle.

## Project Overview

The Calorie Tracker Application is a full-stack solution consisting of a React Native mobile application powered by a Flask-based REST API backend. The system leverages artificial intelligence for food image recognition and provides detailed nutritional tracking, progress monitoring, and personalized health insights.

## Key Features

- AI-powered food image recognition using Google Gemini API
- Comprehensive nutritional tracking (calories, macros, micronutrients)
- Water intake and hydration monitoring
- Weight tracking with BMI calculation and progress visualization
- Step counter and activity tracking
- Meal planning with customizable templates
- Recipe builder with automatic nutritional calculation
- Progress photos with comparison tools
- Achievement badges and gamification
- Multi-language support (English, Arabic)
- Personalized daily calorie and macro goals
- Advanced analytics and insights

## Technology Stack

### Backend
- Flask 3.0.0 (Python web framework)
- SQLAlchemy 2.0 (ORM)
- SQLite (Database)
- Redis (Caching)
- JWT (Authentication)
- Google Gemini API (AI food recognition)
- Gunicorn (WSGI server)
- Nginx (Reverse proxy)
- Supervisor (Process management)

### Mobile Application
- React Native 0.74.5
- Expo SDK 51
- TypeScript 5.3.3
- React Navigation 6.x
- Axios (HTTP client)
- AsyncStorage (Local storage)

### Infrastructure
- Hetzner Cloud (Ubuntu 24.04 LTS)
- Production API: http://46.62.254.185:5001

## Project Structure

```
calories-app/
├── CalorieMobileApp/          # React Native mobile application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # Application screens
│   │   ├── services/          # API service layer
│   │   ├── navigation/        # Navigation configuration
│   │   ├── config/            # App configuration
│   │   └── theme/             # Theme and styling
│   ├── assets/                # Images and static assets
│   └── app.json               # Expo configuration
│
├── routes/                    # API route handlers
├── models/                    # Database models (18 tables)
├── middleware/                # Custom middleware
├── utils/                     # Utility functions
├── migrations/                # Database migrations
├── documentation/             # Comprehensive documentation
├── app.py                     # Main application entry
├── config.py                  # Configuration management
├── database.py                # Database initialization
└── requirements.txt           # Python dependencies
```

## Documentation

Comprehensive documentation is available in the `documentation/` directory:

1. [System Architecture](./documentation/01-SYSTEM-ARCHITECTURE.md) - Technical architecture and design
2. [Backend API Documentation](./documentation/02-BACKEND-API.md) - Complete API reference
3. [Database Schema](./documentation/03-DATABASE-SCHEMA.md) - Database structure and relationships
4. [Mobile Application](./documentation/04-MOBILE-APP.md) - Mobile app architecture and components
5. [Features and Functionality](./documentation/05-FEATURES.md) - Detailed feature descriptions
6. [User Flow and Testing Guide](./documentation/06-USER-FLOW-TESTING.md) - User journeys and test cases
7. [Deployment Guide](./documentation/07-DEPLOYMENT.md) - Production deployment instructions
8. [Future Roadmap](./documentation/08-FUTURE-ROADMAP.md) - Planned features and enhancements

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Redis Server
- Expo CLI

### Backend Setup

```bash
# Clone repository
git clone https://github.com/moeezshafi/Calories-App.git
cd Calories-App

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python init_db.py

# Run development server
python app.py
```

The API will be available at `http://localhost:5000`

### Mobile App Setup

```bash
# Navigate to mobile app directory
cd CalorieMobileApp

# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS (macOS only)
npx expo run:ios
```

## API Endpoints

Base URL: `http://46.62.254.185:5001`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/token/refresh` - Refresh access token

### Food Logging
- `POST /api/food/analyze` - AI food image analysis
- `POST /api/food/log` - Log food entry
- `GET /api/food/logs` - Get food logs
- `DELETE /api/food/log/<id>` - Delete food log

### Tracking
- `POST /api/water/log` - Log water intake
- `POST /api/weight/log` - Log weight
- `POST /api/steps/log` - Log steps
- `GET /api/analytics/summary` - Get analytics summary

For complete API documentation, see [Backend API Documentation](./documentation/02-BACKEND-API.md).

## Database Schema

The application uses 18 database tables:

- user - User accounts and profiles
- food_log - Food entries
- custom_food - User-created foods
- saved_food - Frequently used foods
- water_log - Water intake records
- weight_log - Weight measurements
- step_log - Daily step counts
- user_preference - User settings
- refresh_tokens - JWT refresh tokens
- badge - Achievement definitions
- user_badge - Earned badges
- progress_photo - Progress images
- meal_plan - Meal planning
- meal_plan_template - Reusable templates
- recipe - Custom recipes
- recipe_ingredient - Recipe components
- meal_reminder - Reminder settings
- exercise_log - Exercise activities

For detailed schema information, see [Database Schema](./documentation/03-DATABASE-SCHEMA.md).

## Current Status

### Version
v1.0.1 - Production Release

### Deployment Status
- Backend API: Deployed and running on Hetzner Cloud
- Mobile App: Android APK available for testing
- iOS App: Planned for Q3 2026

### Feature Completeness
- Core Features: 100% complete
- Advanced Features: 80% complete
- Social Features: Planned
- Payment Integration: Planned

## Planned Features

### Immediate Priorities
- Social groups and challenges
- Payment integration (iOS App Store, Google Play Store)
- Barcode scanning
- Wearable device integration
- Restaurant menu integration

### Future Enhancements
- AI nutrition coach assistant
- Telemedicine integration
- Grocery delivery integration
- Meal kit partnerships
- Corporate wellness programs
- Insurance integration

For detailed roadmap, see [Future Roadmap](./documentation/08-FUTURE-ROADMAP.md).

## Testing

### Manual Testing
The application has been thoroughly tested across:
- Multiple Android devices (Android 10-14)
- Various screen sizes
- Different network conditions
- Edge cases and error scenarios

### Test Coverage
- Authentication flows
- Food logging (camera, search, manual)
- Tracking features (water, weight, steps)
- Meal planning and recipes
- Analytics and insights
- Settings and preferences

For complete testing guide, see [User Flow and Testing Guide](./documentation/06-USER-FLOW-TESTING.md).

## Security

### Implemented Security Measures
- Password hashing with bcrypt
- JWT token-based authentication
- HTTPS support (configurable)
- CORS restrictions
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention via ORM
- Secure session management

### Compliance
- Data privacy controls
- User data encryption
- Secure API communication
- GDPR compliance (planned)

## Performance

### Optimization Techniques
- Redis caching for frequently accessed data
- Database query optimization with indexes
- Image compression before upload
- Lazy loading of components
- Pagination for large data sets
- Connection pooling

### Performance Metrics
- API response time: < 500ms
- AI image analysis: 3-5 seconds
- Page load time: < 300ms
- App launch time: < 3 seconds

## Support and Contact

### Technical Support
For technical issues, bug reports, or feature requests:
- GitHub Issues: https://github.com/moeezshafi/Calories-App/issues
- Email: support@calorietracker.com (planned)

### Documentation
- Complete documentation available in `/documentation` directory
- API reference with examples
- User guides and tutorials
- Developer documentation

## Contributing

This is a proprietary project. For contribution inquiries, please contact the development team.

## License

Proprietary - All rights reserved

## Acknowledgments

- Google Gemini API for AI food recognition
- Expo team for mobile development framework
- Flask community for backend framework
- Open source community for various libraries and tools

## Version History

### v1.0.1 (Current - March 2026)
- Production release with core features
- AI-powered food recognition
- Comprehensive tracking features
- Meal planning and recipes
- Achievement system
- Multi-language support

### v1.0.0 (January 2026)
- Initial release
- Basic food logging
- Calorie tracking
- User authentication

## Project Statistics

- Total Lines of Code: ~50,000+
- Backend API Endpoints: 40+
- Mobile App Screens: 30+
- Database Tables: 18
- Supported Languages: 2 (English, Arabic)
- Development Time: 6 months
- Team Size: Development team

## Links

- Production API: http://46.62.254.185:5001
- GitHub Repository: https://github.com/moeezshafi/Calories-App
- Expo Project: https://expo.dev/accounts/moeezdev/projects/calorie-mobile-app
- Documentation: [/documentation](./documentation/)

---

Last Updated: March 2026

For more information, please refer to the comprehensive documentation in the `/documentation` directory.
