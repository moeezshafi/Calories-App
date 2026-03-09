# Production Deployment Guide - Hetzner Server

## Overview
This guide covers deploying the Calorie Tracker backend to a Hetzner server and building the Android APK.

## Prerequisites
- Hetzner server with SSH access
- Domain name (optional but recommended)
- Git repository access

## Part 1: Backend Deployment on Hetzner

### Step 1: Server Preparation

```bash
# Connect to your Hetzner server via SSH
ssh root@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required system packages
sudo apt install -y python3.11 python3.11-venv python3-pip nginx redis-server supervisor git curl
```

### Step 2: Create Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/calorie-app
cd /var/www/calorie-app

# Clone your repository (replace with your repo URL)
git clone <your-repo-url> .

# Or if pushing code manually, create the directory and upload files
```

### Step 3: Python Environment Setup

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install production server (gunicorn)
pip install gunicorn
```

### Step 4: Environment Configuration

```bash
# Create production .env file
nano .env
```

Add the following (adjust values):

```env
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production

# Database
DATABASE_URL=sqlite:///instance/calorie_app.db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Gemini AI API
GEMINI_API_KEY=your-gemini-api-key

# CORS Settings
CORS_ORIGINS=*

# Upload Settings
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# Server Settings
HOST=0.0.0.0
PORT=5000
```

### Step 5: Initialize Database

```bash
# Create instance directory
mkdir -p instance

# Run database initialization
python init_db.py

# Run migrations
python run_migrations.py
```

### Step 6: Redis Configuration

```bash
# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### Step 7: Gunicorn Configuration

Create gunicorn config file:

```bash
nano gunicorn_config.py
```

Add:

```python
import multiprocessing

# Server socket
bind = "127.0.0.1:5000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = "/var/log/calorie-app/access.log"
errorlog = "/var/log/calorie-app/error.log"
loglevel = "info"

# Process naming
proc_name = "calorie-app"

# Server mechanics
daemon = False
pidfile = "/var/run/calorie-app.pid"
user = "www-data"
group = "www-data"
```

Create log directory:

```bash
sudo mkdir -p /var/log/calorie-app
sudo chown www-data:www-data /var/log/calorie-app
```

### Step 8: Supervisor Configuration

Create supervisor config:

```bash
sudo nano /etc/supervisor/conf.d/calorie-app.conf
```

Add:

```ini
[program:calorie-app]
directory=/var/www/calorie-app
command=/var/www/calorie-app/venv/bin/gunicorn -c gunicorn_config.py app:app
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/calorie-app/error.log
stdout_logfile=/var/log/calorie-app/access.log
environment=PATH="/var/www/calorie-app/venv/bin"
```

Update supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start calorie-app
sudo supervisorctl status calorie-app
```

### Step 9: Nginx Configuration

Create Nginx config:

```bash
sudo nano /etc/nginx/sites-available/calorie-app
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or server IP

    client_max_body_size 16M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
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
sudo ln -s /etc/nginx/sites-available/calorie-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 10: SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

### Step 11: Firewall Configuration

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 12: Set Permissions

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/calorie-app
sudo chmod -R 755 /var/www/calorie-app

# Ensure uploads directory is writable
sudo chmod -R 775 /var/www/calorie-app/uploads
```

### Step 13: Verify Deployment

```bash
# Check if app is running
sudo supervisorctl status calorie-app

# Check logs
sudo tail -f /var/log/calorie-app/error.log

# Test API endpoint
curl http://your-domain.com/api/health
```

## Part 2: Mobile App Configuration

### Update API URL in Mobile App

Edit `calories-app/CalorieMobileApp/src/config/constants.ts`:

```typescript
export const API_BASE_URL = 'https://your-domain.com';  // or http://your-server-ip
```

## Part 3: Building Android APK with Expo

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build

In `calories-app/CalorieMobileApp/`, create or update `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 4: Update app.json

Ensure `calories-app/CalorieMobileApp/app.json` has proper configuration:

```json
{
  "expo": {
    "name": "Calorie Tracker",
    "slug": "calorie-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.calorietracker"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.calorietracker",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      "expo-notifications"
    ]
  }
}
```

### Step 5: Build APK

```bash
cd calories-app/CalorieMobileApp

# Build for preview (APK)
eas build --platform android --profile preview

# Or build for production
eas build --platform android --profile production
```

### Step 6: Download APK

Once the build completes, EAS will provide a download link. Download the APK and install it on your Android device.

## Maintenance Commands

### Backend Updates

```bash
# SSH into server
ssh root@your-server-ip

# Navigate to app directory
cd /var/www/calorie-app

# Pull latest changes
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install any new dependencies
pip install -r requirements.txt

# Run migrations if needed
python run_migrations.py

# Restart application
sudo supervisorctl restart calorie-app
```

### View Logs

```bash
# Application logs
sudo tail -f /var/log/calorie-app/error.log
sudo tail -f /var/log/calorie-app/access.log

# Nginx logs
sudo tail -f /var/nginx/error.log
sudo tail -f /var/nginx/access.log

# Supervisor logs
sudo supervisorctl tail -f calorie-app
```

### Database Backup

```bash
# Create backup
cp /var/www/calorie-app/instance/calorie_app.db /var/www/calorie-app/backups/calorie_app_$(date +%Y%m%d_%H%M%S).db

# Automated daily backup (add to crontab)
0 2 * * * cp /var/www/calorie-app/instance/calorie_app.db /var/www/calorie-app/backups/calorie_app_$(date +\%Y\%m\%d).db
```

## Troubleshooting

### App won't start

```bash
# Check supervisor status
sudo supervisorctl status calorie-app

# Check logs
sudo tail -100 /var/log/calorie-app/error.log

# Restart app
sudo supervisorctl restart calorie-app
```

### Database issues

```bash
# Check database file permissions
ls -la /var/www/calorie-app/instance/

# Fix permissions
sudo chown www-data:www-data /var/www/calorie-app/instance/calorie_app.db
```

### Redis issues

```bash
# Check Redis status
sudo systemctl status redis-server

# Restart Redis
sudo systemctl restart redis-server
```

## Security Checklist

- [ ] Changed default SECRET_KEY and JWT_SECRET_KEY
- [ ] Configured firewall (UFW)
- [ ] Set up SSL certificate
- [ ] Restricted database file permissions
- [ ] Configured proper CORS origins
- [ ] Set up regular backups
- [ ] Monitoring and logging configured
- [ ] Updated all system packages

## Performance Optimization

1. **Enable Gzip compression in Nginx**
2. **Set up Redis caching** (already implemented in code)
3. **Configure CDN for static assets** (optional)
4. **Monitor server resources** (CPU, RAM, disk)
5. **Set up log rotation**

## Next Steps

1. Set up monitoring (e.g., Uptime Robot, Prometheus)
2. Configure automated backups
3. Set up CI/CD pipeline
4. Implement rate limiting
5. Add API documentation (Swagger)
