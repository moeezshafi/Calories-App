# Calorie Tracker Application

## Overview

The Calorie Tracker Application is a comprehensive health and nutrition management system designed to help users monitor their daily caloric intake, track nutritional goals, and maintain a healthy lifestyle. The system consists of a React Native mobile application powered by a Flask-based REST API backend with SQLite database storage.

## Table of Contents

1. [System Architecture](./01-SYSTEM-ARCHITECTURE.md)
2. [Backend API Documentation](./02-BACKEND-API.md)
3. [Database Schema](./03-DATABASE-SCHEMA.md)
4. [Mobile Application](./04-MOBILE-APP.md)
5. [Features and Functionality](./05-FEATURES.md)
6. [User Flow and Testing Guide](./06-USER-FLOW-TESTING.md)
7. [Deployment Guide](./07-DEPLOYMENT.md)
8. [Future Roadmap](./08-FUTURE-ROADMAP.md)

## Quick Links

- **Production API**: http://46.62.254.185:5001
- **GitHub Repository**: https://github.com/moeezshafi/Calories-App
- **Expo Project**: https://expo.dev/accounts/moeezdev/projects/calorie-mobile-app

## Technology Stack

### Backend
- **Framework**: Flask 3.0.0
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Caching**: Redis
- **AI Integration**: Google Gemini API for food image analysis
- **Server**: Gunicorn with Supervisor process management
- **Web Server**: Nginx (reverse proxy)

### Mobile Application
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **UI Components**: Custom component library
- **Build System**: EAS (Expo Application Services)

### Infrastructure
- **Hosting**: Hetzner Cloud (Ubuntu 24.04)
- **Process Manager**: Supervisor
- **Reverse Proxy**: Nginx
- **Cache Server**: Redis 7.x

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
│   ├── app.json               # Expo configuration
│   └── package.json           # Dependencies
│
├── routes/                    # API route handlers
├── models/                    # Database models
├── middleware/                # Custom middleware
├── utils/                     # Utility functions
├── migrations/                # Database migrations
├── documentation/             # Project documentation
├── app.py                     # Main application entry
├── config.py                  # Configuration management
├── database.py                # Database initialization
├── requirements.txt           # Python dependencies
└── .env                       # Environment variables
```

## Key Features

### Current Features (v1.0)
- User authentication and authorization
- AI-powered food image recognition
- Manual food logging with nutritional data
- Daily calorie and macro tracking
- Water intake monitoring
- Step counter integration
- Weight tracking and progress visualization
- Custom food database
- Meal planning and templates
- Recipe builder
- Progress photos
- Achievement badges
- Nutritional insights and analytics
- Multi-language support (English, Arabic)

### In Development
- Social groups and challenges
- Payment integration (iOS App Store, Google Play Store)
- Advanced meal recommendations
- Integration with fitness wearables

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- Redis Server
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

Refer to the [Deployment Guide](./07-DEPLOYMENT.md) for detailed installation instructions.

## Support and Contact

For technical support, feature requests, or bug reports, please contact the development team or create an issue in the GitHub repository.

## License

Proprietary - All rights reserved

## Version History

- **v1.0.1** (Current) - Production release with core features
- **v1.0.0** - Initial release

---

Last Updated: March 2026
