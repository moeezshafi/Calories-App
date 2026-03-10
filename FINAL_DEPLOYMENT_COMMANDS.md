# Final Deployment Commands - Run These on Server

## Current Status
- ✓ Repository cloned to `/var/www/calorie-app`
- ✓ Virtual environment created
- ✓ Redis configured and running
- ✓ Supervisor configured
- ✓ Nginx configured (port 5001)
- ✓ Gunicorn configured (port 5001)
- ⚠ Missing Python packages
- ⚠ Database permission issues

## Step 1: Install Missing Python Packages

```bash
cd /var/www/calorie-app
source venv/bin/activate

# Install all requirements (updated with missing packages)
pip install -r requirements.txt

# Verify critical packages are installed
pip list | grep -E "bcrypt|flask-migrate|flask-limiter|flask-talisman|email-validator"
```

Expected output should show:
- bcrypt 4.1.2
- Flask-Limiter 4.1.1
- Flask-Migrate 4.1.0
- Flask-Talisman 1.1.0
- email-validator 2.1.0

## Step 2: Fix Database Permissions

```bash
# Make the fix script executable
chmod +x /var/www/calorie-app/fix_db_permissions.sh

# Run the fix script
/var/www/calorie-app/fix_db_permissions.sh
```

This script will:
- Remove SQLite lock files (*.db-shm, *.db-wal, *.db-journal)
- Create instance directory with proper permissions
- Set correct ownership (www-data:www-data)
- Set correct permissions (775 for directory, 664 for DB file)

## Step 3: Initialize Database

```bash
cd /var/www/calorie-app
source venv/bin/activate

# Run as www-data user to ensure proper permissions
sudo -u www-data /var/www/calorie-app/venv/bin/python init_db.py
```

Expected output:
```
============================================================
INITIALIZING DATABASE
============================================================
✓ Database initialized successfully!
✓ Created 18 tables
```

## Step 4: Test Application Manually

```bash
# Test as www-data user (same user that supervisor will use)
sudo -u www-data /var/www/calorie-app/venv/bin/python app.py
```

Expected output:
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[server-ip]:5000
```

Press Ctrl+C to stop the test server.

## Step 5: Start with Supervisor

```bash
# Start the application
supervisorctl start calorie-app

# Check status
supervisorctl status calorie-app

# View logs if there are issues
tail -f /var/log/supervisor/calorie-app.log
tail -f /var/log/supervisor/calorie-app-error.log
```

Expected status: `RUNNING`

## Step 6: Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Expected response:
# {"status":"healthy","message":"Calorie Detection API is running"}

# Test root endpoint
curl http://localhost:5001/

# Expected response:
# {"name":"Calorie Tracker API","version":"1.0.0","status":"running","endpoints":"/api/*"}
```

## Step 7: Test from External Network

```bash
# Get server IP
ip addr show | grep "inet " | grep -v 127.0.0.1

# Test from your local machine (replace SERVER_IP with actual IP)
curl http://SERVER_IP:5001/api/health
```

## Step 8: Configure Firewall (if needed)

```bash
# Check if firewall is active
ufw status

# If active, allow port 5001
ufw allow 5001/tcp
ufw reload
```

## Step 9: Update Mobile App Configuration

Once the server is running and accessible, update the mobile app:

1. Edit `CalorieMobileApp/src/config/constants.ts`
2. Change `API_BASE_URL` to: `http://YOUR_SERVER_IP:5001`
3. Rebuild the mobile app

## Troubleshooting

### If database permission error persists:

```bash
# Check current permissions
ls -la /var/www/calorie-app/instance/

# Manually set permissions
chmod 777 /var/www/calorie-app/instance
chmod 666 /var/www/calorie-app/instance/calorie_app.db

# Remove lock files
rm -f /var/www/calorie-app/instance/*.db-shm
rm -f /var/www/calorie-app/instance/*.db-wal
rm -f /var/www/calorie-app/instance/*.db-journal
```

### If port 5001 is already in use:

```bash
# Check what's using port 5001
lsof -i :5001

# Kill the process if needed
kill -9 <PID>
```

### If supervisor won't start:

```bash
# Check supervisor logs
tail -50 /var/log/supervisor/supervisord.log

# Restart supervisor
systemctl restart supervisor

# Reload configuration
supervisorctl reread
supervisorctl update
```

### If Nginx returns 502 Bad Gateway:

```bash
# Check if app is running
supervisorctl status calorie-app

# Check Nginx error logs
tail -50 /var/log/nginx/error.log

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## Quick Command Reference

```bash
# Start/Stop/Restart app
supervisorctl start calorie-app
supervisorctl stop calorie-app
supervisorctl restart calorie-app

# View logs
tail -f /var/log/supervisor/calorie-app.log
tail -f /var/log/supervisor/calorie-app-error.log

# Test API
curl http://localhost:5001/api/health

# Check processes
ps aux | grep gunicorn
lsof -i :5001

# Database operations
sudo -u www-data /var/www/calorie-app/venv/bin/python init_db.py
```

## Success Criteria

✓ All Python packages installed without errors
✓ Database initialized with 18 tables
✓ App starts without errors when run as www-data user
✓ Supervisor shows status as RUNNING
✓ Health endpoint returns 200 OK
✓ API accessible from external network
✓ No permission errors in logs

## Next Steps After Deployment

1. Update mobile app with server IP
2. Build Android APK with EAS CLI
3. Test mobile app with production backend
4. Set up SSL certificate (optional but recommended)
5. Configure domain name (optional)
6. Set up automated backups for database
