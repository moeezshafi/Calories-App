# System Architecture

## Overview

The Calorie Tracker Application follows a client-server architecture with a mobile-first approach. The system is designed for scalability, maintainability, and optimal performance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│                    (React Native/Expo)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │   Food   │  │ Progress │  │ Profile  │   │
│  │ Screens  │  │ Logging  │  │ Tracking │  │ Settings │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                          │                                    │
│                    API Service Layer                          │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    HTTP/HTTPS (REST API)
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                          ▼                                    │
│                   Nginx (Reverse Proxy)                       │
│                          │                                    │
│                          ▼                                    │
│              ┌───────────────────────┐                        │
│              │   Gunicorn (WSGI)     │                        │
│              └───────────────────────┘                        │
│                          │                                    │
│              ┌───────────▼───────────┐                        │
│              │   Flask Application   │                        │
│              │                       │                        │
│              │  ┌─────────────────┐ │                        │
│              │  │  Route Handlers │ │                        │
│              │  └─────────────────┘ │                        │
│              │  ┌─────────────────┐ │                        │
│              │  │   Middleware    │ │                        │
│              │  │  - Auth (JWT)   │ │                        │
│              │  │  - Rate Limit   │ │                        │
│              │  │  - CORS         │ │                        │
│              │  └─────────────────┘ │                        │
│              │  ┌─────────────────┐ │                        │
│              │  │  Business Logic │ │                        │
│              │  └─────────────────┘ │                        │
│              └───────────┬───────────┘                        │
│                          │                                    │
│         ┌────────────────┼────────────────┐                  │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  SQLite  │    │  Redis   │    │  Gemini  │              │
│  │ Database │    │  Cache   │    │   API    │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                                              │
│              Backend Server (Hetzner Cloud)                  │
└──────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Mobile Application Layer

#### Technology Stack
- **Framework**: React Native 0.74+ with Expo SDK 51
- **Language**: TypeScript 5.x
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Navigation**: React Navigation 6.x
- **HTTP Client**: Axios
- **Image Handling**: Expo Image Picker, Expo Camera

#### Key Components
- **Authentication Module**: Handles user login, registration, and JWT token management
- **Food Logging Module**: Camera integration, image upload, and manual food entry
- **Analytics Module**: Charts, graphs, and progress visualization
- **Profile Module**: User settings, preferences, and account management

#### Design Patterns
- Component-based architecture
- Service layer for API communication
- Custom hooks for reusable logic
- Theme provider for consistent styling

### 2. API Gateway Layer

#### Nginx Configuration
- **Role**: Reverse proxy and load balancer
- **Port**: 80 (HTTP)
- **Upstream**: Gunicorn on port 5001
- **Features**:
  - Request routing
  - SSL termination (future)
  - Static file serving
  - Request buffering

### 3. Application Server Layer

#### Gunicorn WSGI Server
- **Workers**: 4 sync workers
- **Timeout**: 120 seconds
- **Binding**: 0.0.0.0:5001
- **Process Manager**: Supervisor for auto-restart

#### Flask Application
- **Version**: 3.0.0
- **Architecture**: Blueprint-based modular design
- **Extensions**:
  - Flask-JWT-Extended: Authentication
  - Flask-CORS: Cross-origin resource sharing
  - Flask-SQLAlchemy: ORM
  - Flask-Migrate: Database migrations
  - Flask-Limiter: Rate limiting
  - Flask-Talisman: Security headers

### 4. Data Layer

#### SQLite Database
- **Location**: `/var/www/calorie-app/instance/calorie_app.db`
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Tables**: 18 tables (see Database Schema documentation)

#### Redis Cache
- **Version**: 7.x
- **Port**: 6379
- **Usage**:
  - Session storage
  - API response caching
  - Rate limiting counters
  - Temporary data storage

### 5. External Services

#### Google Gemini API
- **Purpose**: AI-powered food image recognition
- **Model**: gemini-2.5-flash
- **Features**:
  - Food identification
  - Nutritional estimation
  - Portion size detection

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Backend validates credentials
3. JWT access token generated (15 min expiry)
4. JWT refresh token generated (30 days expiry)
5. Tokens stored securely on client
6. Access token sent with each API request
7. Refresh token used to obtain new access token
```

### Security Measures
- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: HS256 algorithm
- **HTTPS**: SSL/TLS encryption (production)
- **CORS**: Restricted origins
- **Rate Limiting**: Per-endpoint limits
- **Input Validation**: Request data sanitization
- **SQL Injection Prevention**: Parameterized queries via ORM

## Scalability Considerations

### Current Architecture
- Single server deployment
- SQLite database (suitable for < 100K users)
- Redis caching for performance
- Horizontal scaling ready

### Future Scaling Path
1. **Database Migration**: SQLite → PostgreSQL
2. **Load Balancing**: Multiple Gunicorn instances
3. **CDN Integration**: Static asset delivery
4. **Microservices**: Separate services for AI, analytics
5. **Container Orchestration**: Docker + Kubernetes

## Performance Optimization

### Backend Optimizations
- Redis caching for frequently accessed data
- Database query optimization with indexes
- Connection pooling
- Lazy loading of relationships
- Response compression

### Mobile App Optimizations
- Image compression before upload
- Lazy loading of screens
- Local caching with AsyncStorage
- Optimized re-renders with React.memo
- Pagination for large data sets

## Monitoring and Logging

### Application Logs
- **Location**: `/var/www/calorie-app/logs/app.log`
- **Rotation**: 10MB per file, 5 backups
- **Level**: INFO in production, DEBUG in development

### Supervisor Logs
- **stdout**: `/var/log/supervisor/calorie-app.log`
- **stderr**: `/var/log/supervisor/calorie-app-error.log`

### Monitoring Metrics
- API response times
- Error rates
- Database query performance
- Cache hit rates
- User activity patterns

## Deployment Architecture

### Production Environment
- **Server**: Hetzner Cloud VPS
- **OS**: Ubuntu 24.04 LTS
- **IP**: 46.62.254.185
- **Port**: 5001 (API)
- **Process Manager**: Supervisor
- **Auto-restart**: Enabled

### Backup Strategy
- Database backups: Daily
- Configuration backups: Version controlled
- User uploads: Cloud storage (future)

## Network Architecture

### API Endpoints
- **Base URL**: http://46.62.254.185:5001
- **Protocol**: HTTP (HTTPS planned)
- **Format**: JSON
- **Authentication**: Bearer token in Authorization header

### Mobile App Communication
- RESTful API calls
- Retry logic for failed requests
- Offline mode support (future)
- Request/response interceptors

## Development Workflow

### Version Control
- **Repository**: GitHub
- **Branching**: main (production), develop (staging)
- **CI/CD**: Manual deployment (automated pipeline planned)

### Build Process
- **Backend**: Python virtual environment
- **Mobile**: EAS Build (Expo Application Services)
- **Testing**: Manual QA (automated tests planned)

---

This architecture provides a solid foundation for the current application while allowing for future growth and feature additions.
