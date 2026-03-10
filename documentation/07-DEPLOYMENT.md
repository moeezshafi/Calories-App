# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Calorie Tracker application to production environments, including backend API deployment and mobile app distribution.

## Production Environment

### Server Specifications
- **Provider**: Hetzner Cloud
- **Operating System**: Ubuntu 24.04 LTS
- **Server IP**: 46.62.254.185
- **Python Version**: 3.12
- **Node.js Version**: 18+

### Infrastructure Components
- **Web Server**: Nginx (reverse proxy)
- **Application Server**: Gunicorn (WSGI)
- **Process Manager**: Supervisor
- **Database**: SQLite
- **Cache**: Redis 7.x
- **API Port**: 5001

## Backend Deployment

### Prerequisites
- Root or sudo access to server
- Git installed
- Python 3.12+ installed
- Redis server installed
- Nginx installed
- Supervisor installed

### Step 1: Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.12 python3.12-venv python3-pip git nginx redis-server supervisor

# Verify installations
python3.12 --version
redis-cli --version
nginx -v
supervisorctl version
```

### Step 2: Clone Repository

```bash
# Navigate to web directory
cd /var/www

# Clone repository
sudo git clone https://github.com/moeezshafi/Calories-App.git calorie-app

# Set ownership
sudo chown -R www-data:www-data /var/www/calorie-app
```

### Step 3: Create Virtual Environment

```bash
# Navigate to project directory
cd /var/www/calorie-app

# Create virtual environment
sudo python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### Step 4: Install Dependencies

```bash
# Install Python packages
pip install -r requirements.txt

# Verify critical packages
pip list | grep -E "Flask|SQLAlchemy|gunicorn|redis"
```

### Step 5: Configure Environment Variables

```bash
# Create .env file
sudo nano /var/www/calorie-app/.env
```

Add the following configuration:

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Security Keys (CHANGE IN PRODUCTION)
JWT_SECRET_KEY=your_jwt_secret_key_here
SECRET_KEY=your_flask_secret_key_here

# Database
DATABASE_URL=sqlite:////var/www/calorie-app/instance/calorie_app.db

# Flask Configuration
FLASK_ENV=production
FLASK_HOST=0.0.0.0
FLASK_PORT=5001

# CORS Configuration
ALLOWED_ORIGINS=*

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
```

### Step 6: Initialize Database

```bash
# Run database initialization script
python init_db.py
```

Expected output:
```
============================================================
INITIALIZING DATABASE
============================================================
✓ Database initialized successfully!
✓ Created 18 tables
```

### Step 7: Configure Gunicorn

```bash
# Create Gunicorn configuration
sudo nano /var/www/calorie-app/gunicorn_config.py
```

Add configuration:

```python
bind = "0.0.0.0:5001"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5
errorlog = "/var/log/supervisor/calorie-app-error.log"
accesslog = "/var/log/supervisor/calorie-app.log"
loglevel = "info"
```

### Step 8: Configure Supervisor

```bash
# Create Supervisor configuration
sudo nano /etc/supervisor/conf.d/calorie-app.conf
```

Add configuration:

```ini
[program:calorie-app]
command=/var/www/venv/bin/gunicorn -c /var/www/calorie-app/gunicorn_config.py "app:create_app()"
directory=/var/www/calorie-app
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/supervisor/calorie-app-error.log
stdout_logfile=/var/log/supervisor/calorie-app.log
environment=PATH="/var/www/venv/bin"
```

### Step 9: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/calorie-app
```

Add configuration:

```nginx
server {
    listen 80;
    server_name 46.62.254.185;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /var/www/calorie-app/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/calorie-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 10: Set Permissions

```bash
# Fix database permissions
sudo chmod 777 /var/www/calorie-app/instance
sudo chmod 666 /var/www/calorie-app/instance/calorie_app.db

# Fix log permissions
sudo chown www-data:www-data /var/log/supervisor/calorie-app-error.log
sudo chown www-data:www-data /var/log/supervisor/calorie-app.log
sudo chmod 664 /var/log/supervisor/calorie-app-error.log
sudo chmod 664 /var/log/supervisor/calorie-app.log

# Set ownership
sudo chown -R www-data:www-data /var/www/calorie-app
```

### Step 11: Start Application

```bash
# Reload Supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update

# Start application
sudo supervisorctl start calorie-app

# Check status
sudo supervisorctl status calorie-app
```

Expected output:
```
calorie-app                      RUNNING   pid 12345, uptime 0:00:05
```

### Step 12: Verify Deployment

```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Expected response:
# {"status":"healthy","message":"Calorie Detection API is running"}

# Test from external IP
curl http://46.62.254.185:5001/api/health
```

## Mobile App Deployment

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed
- EAS CLI installed
- Expo account created
- Android/iOS developer accounts (for app stores)

### Step 1: Install Dependencies

```bash
# Navigate to mobile app directory
cd CalorieMobileApp

# Install dependencies
npm install

# Install EAS CLI globally
npm install -g eas-cli
```

### Step 2: Configure Production API

```bash
# Edit constants file
nano src/config/constants.ts
```

Update API URL:

```typescript
const PRODUCTION_API_URL = 'http://46.62.254.185:5001';
```

### Step 3: Login to Expo

```bash
# Login to Expo account
eas login

# Verify login
eas whoami
```

### Step 4: Configure EAS Build

```bash
# Initialize EAS configuration (if not done)
eas build:configure

# Select platforms: All (iOS and Android)
```

### Step 5: Build Android APK

```bash
# Build preview APK
eas build --platform android --profile preview

# Or build production APK
eas build --platform android --profile production
```

Build process:
1. Generates Android keystore (first time)
2. Uploads project files to Expo servers
3. Builds APK (10-15 minutes)
4. Provides download link

### Step 6: Build iOS App (Future)

```bash
# Build iOS app
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Step 7: Download and Test APK

1. Download APK from Expo build page
2. Install on Android device
3. Test all features
4. Verify API connectivity
5. Check for crashes or errors

### Step 8: Distribute APK

#### Option A: Direct Distribution
- Share APK download link
- Users install directly on Android devices
- Enable "Install from Unknown Sources"

#### Option B: Google Play Store (Future)
```bash
# Build AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## SSL Certificate Setup (Optional but Recommended)

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

Update Nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Maintenance

### Application Logs

```bash
# View application logs
sudo tail -f /var/log/supervisor/calorie-app.log

# View error logs
sudo tail -f /var/log/supervisor/calorie-app-error.log

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Supervisor Commands

```bash
# Start application
sudo supervisorctl start calorie-app

# Stop application
sudo supervisorctl stop calorie-app

# Restart application
sudo supervisorctl restart calorie-app

# Check status
sudo supervisorctl status calorie-app

# View all processes
sudo supervisorctl status
```

### Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-calorie-db.sh
```

Add script:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/calorie-app"
DB_PATH="/var/www/calorie-app/instance/calorie_app.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/backup_$DATE.db'"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.db" -mtime +30 -delete
```

Make executable and schedule:

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-calorie-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e

# Add line:
0 2 * * * /usr/local/bin/backup-calorie-db.sh
```

### Redis Monitoring

```bash
# Check Redis status
sudo systemctl status redis

# Redis CLI
redis-cli

# Inside Redis CLI:
PING  # Should return PONG
INFO  # View Redis information
DBSIZE  # Number of keys
```

### System Resource Monitoring

```bash
# CPU and memory usage
htop

# Disk usage
df -h

# Application process
ps aux | grep gunicorn

# Network connections
sudo netstat -tlnp | grep 5001
```

## Troubleshooting

### Application Won't Start

```bash
# Check Supervisor logs
sudo tail -50 /var/log/supervisor/calorie-app-error.log

# Check if port is in use
sudo lsof -i :5001

# Verify Python environment
source /var/www/venv/bin/activate
python -c "import flask; print(flask.__version__)"
```

### Database Permission Errors

```bash
# Fix permissions
sudo chmod 777 /var/www/calorie-app/instance
sudo chmod 666 /var/www/calorie-app/instance/calorie_app.db

# Remove lock files
sudo rm -f /var/www/calorie-app/instance/*.db-shm
sudo rm -f /var/www/calorie-app/instance/*.db-wal
```

### Redis Connection Issues

```bash
# Check Redis status
sudo systemctl status redis

# Restart Redis
sudo systemctl restart redis

# Test connection
redis-cli ping
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -50 /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## Updating the Application

### Backend Updates

```bash
# Navigate to project directory
cd /var/www/calorie-app

# Pull latest changes
sudo git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install new dependencies
pip install -r requirements.txt

# Run migrations (if any)
flask db upgrade

# Restart application
sudo supervisorctl restart calorie-app
```

### Mobile App Updates

```bash
# Navigate to mobile app directory
cd CalorieMobileApp

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Build new version
eas build --platform android --profile production
```

## Security Best Practices

1. **Change default secrets** in .env file
2. **Enable firewall** and allow only necessary ports
3. **Regular security updates** for system packages
4. **Use HTTPS** with SSL certificates
5. **Implement rate limiting** on API endpoints
6. **Regular backups** of database and configuration
7. **Monitor logs** for suspicious activity
8. **Use strong passwords** for all accounts
9. **Restrict SSH access** to specific IPs
10. **Keep dependencies updated**

## Performance Optimization

1. **Enable Redis caching** for frequently accessed data
2. **Optimize database queries** with indexes
3. **Use CDN** for static assets (future)
4. **Enable Gzip compression** in Nginx
5. **Implement pagination** for large data sets
6. **Optimize images** before upload
7. **Use connection pooling** for database
8. **Monitor and optimize** slow queries

## Disaster Recovery

### Backup Strategy
- Daily database backups (automated)
- Weekly full system backups
- Configuration files in version control
- Offsite backup storage

### Recovery Procedure
1. Restore database from backup
2. Restore configuration files
3. Reinstall dependencies
4. Restart services
5. Verify functionality

---

For deployment support or questions, please contact the DevOps team or system administrator.
