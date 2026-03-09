# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-06

### Added
- Initial production-ready release
- User authentication with JWT
- Refresh token system
- AI-powered food recognition with Google Gemini
- Food logging and tracking
- Daily, weekly, and monthly analytics
- Custom food database
- Rate limiting on all endpoints
- Input validation and sanitization
- Security headers (HSTS, CSP, etc.)
- Comprehensive error handling
- Structured logging
- Email verification system
- Password reset functionality
- Timezone support
- Database migrations with Flask-Migrate
- Comprehensive test suite
- Docker support
- Production deployment guides
- API documentation

### Security
- Rate limiting to prevent abuse
- SQL injection protection
- XSS protection
- CORS configuration
- Strong password requirements
- JWT token rotation
- Security headers
- Input sanitization

### Performance
- Database query optimization
- Connection pooling
- Caching strategy
- Efficient image processing

### Documentation
- Complete README
- API documentation
- Deployment guide
- Contributing guidelines
- Code of conduct

## [0.1.0] - 2026-03-05

### Added
- Basic Flask application structure
- User model
- Food log model
- OpenAI integration (legacy)
- Basic authentication

### Changed
- Migrated from OpenAI to Google Gemini API

### Deprecated
- OpenAI service (kept for backward compatibility)

### Security
- Initial security implementation
- Basic input validation
