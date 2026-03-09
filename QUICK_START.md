# Quick Start Guide

## Step-by-Step Deployment

### 1. Push Code to Git

```bash
cd calories-app

# Make scripts executable
chmod +x git-push.sh deploy.sh server-setup.sh

# Initialize git and push (if not already done)
./git-push.sh
```

### 2. Server Setup (One-Time)

```bash
# SSH into your Hetzner server
ssh root@your-server-ip

# Download and run setup script
curl -o setup.sh https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/server-setup.sh
chmod +x setup.sh
sudo ./setup.sh

# Or if you already have the code:
cd /var/www/calorie-app
chmod +x server-setup.sh
sudo ./server-setup.sh
```

### 3. Configure Environment

```bash
# Edit environment file
nano /var/www/calorie-app/.env

# Update these values:
SECRET_KEY=your-random-secret-key-here
JWT_SECRET_KEY=your-random-jwt-secret-here
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGINS=https://your-domain.com

# Save and exit (Ctrl+X, Y, Enter)

# Restart application
sudo supervisorctl restart calorie-app
```

### 4. Verify Deployment

```bash
# Check app status
sudo supervisorctl status calorie-app

# Test API
curl http://your-server-ip/api/health

# View logs
sudo tail -f /var/log/calorie-app/error.log
```

### 5. Update Mobile App Configuration

Edit `CalorieMobileApp/src/config/constants.ts`:

```typescript
export const API_BASE_URL = 'http://your-server-ip';
// or
export const API_BASE_URL = 'https://your-domain.com';
```

### 6. Build Android APK

```bash
cd CalorieMobileApp

# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview

# Wait for build to complete and download APK
```

## Future Updates

When you make changes to the code:

```bash
# 1. Push changes to Git
cd calories-app
./git-push.sh

# 2. SSH into server and deploy
ssh root@your-server-ip
cd /var/www/calorie-app
sudo ./deploy.sh
```

## Common Commands

### Server Management

```bash
# View application logs
sudo tail -f /var/log/calorie-app/error.log

# Check app status
sudo supervisorctl status calorie-app

# Restart app
sudo supervisorctl restart calorie-app

# Stop app
sudo supervisorctl stop calorie-app

# Start app
sudo supervisorctl start calorie-app
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Redis Management

```bash
# Check Redis status
sudo systemctl status redis-server

# Restart Redis
sudo systemctl restart redis-server

# Test Redis
redis-cli ping
```

### Database Management

```bash
# Create backup
cp /var/www/calorie-app/instance/calorie_app.db /var/www/calorie-app/backups/backup_$(date +%Y%m%d).db

# View backups
ls -lh /var/www/calorie-app/backups/

# Restore from backup
cp /var/www/calorie-app/backups/backup_YYYYMMDD.db /var/www/calorie-app/instance/calorie_app.db
sudo supervisorctl restart calorie-app
```

## Troubleshooting

### App won't start

```bash
# Check logs
sudo tail -100 /var/log/calorie-app/error.log

# Check supervisor status
sudo supervisorctl status

# Try restarting
sudo supervisorctl restart calorie-app
```

### Database errors

```bash
# Check permissions
ls -la /var/www/calorie-app/instance/

# Fix permissions
sudo chown www-data:www-data /var/www/calorie-app/instance/calorie_app.db
sudo chmod 664 /var/www/calorie-app/instance/calorie_app.db
```

### Nginx errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Redis connection errors

```bash
# Check if Redis is running
sudo systemctl status redis-server

# Test connection
redis-cli ping

# Restart Redis
sudo systemctl restart redis-server
```

## Security Checklist

- [ ] Changed SECRET_KEY in .env
- [ ] Changed JWT_SECRET_KEY in .env
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configured firewall (UFW)
- [ ] Set proper CORS_ORIGINS
- [ ] Regular backups enabled
- [ ] Updated all system packages
- [ ] Strong passwords for server access

## Performance Tips

1. **Monitor server resources**
   ```bash
   htop
   df -h
   free -m
   ```

2. **Check application performance**
   ```bash
   # View active connections
   sudo supervisorctl tail -f calorie-app
   
   # Monitor Nginx access
   sudo tail -f /var/log/nginx/access.log
   ```

3. **Optimize database**
   ```bash
   # Vacuum database (reduces size)
   sqlite3 /var/www/calorie-app/instance/calorie_app.db "VACUUM;"
   ```

## Getting Help

- Check logs: `/var/log/calorie-app/error.log`
- Review deployment guide: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- Check app status: `sudo supervisorctl status`
- Test API: `curl http://your-server-ip/api/health`
