# Exact Commands to Run - Copy & Paste Guide

## 🎯 Step-by-Step Commands

### STEP 1: Push Code to Git (Run on your local machine)

```bash
# Navigate to project directory
cd calories-app

# Initialize Git (if not already done)
git init

# Add your remote repository
git remote add origin YOUR_REPOSITORY_URL

# Add all files
git add .

# Commit
git commit -m "Production deployment ready"

# Push to main branch
git push -u origin main
```

**Replace `YOUR_REPOSITORY_URL` with your actual Git repository URL**

---

### STEP 2: Connect to Hetzner Server

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP
```

**Replace `YOUR_SERVER_IP` with your actual server IP address**

---

### STEP 3: Clone Repository on Server

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone YOUR_REPOSITORY_URL calorie-app

# Navigate into project
cd calorie-app

# Make scripts executable
chmod +x server-setup.sh deploy.sh
```

---

### STEP 4: Run Server Setup (One-Time Setup)

```bash
# Run the setup script
sudo ./server-setup.sh
```

**This will:**
- Install all required packages (Python, Nginx, Redis, etc.)
- Set up virtual environment
- Install Python dependencies
- Configure Nginx
- Set up Supervisor
- Configure firewall
- Initialize database

**During setup, you'll be asked for:**
1. Git repository URL (if not already cloned)
2. Domain name (optional - press Enter to use IP)
3. Whether to set up SSL certificate (y/n)

---

### STEP 5: Configure Environment Variables

```bash
# Edit the .env file
nano /var/www/calorie-app/.env
```

**Update these values:**

```env
SECRET_KEY=GENERATE_A_RANDOM_STRING_HERE
JWT_SECRET_KEY=GENERATE_ANOTHER_RANDOM_STRING_HERE
GEMINI_API_KEY=your_actual_gemini_api_key
CORS_ORIGINS=*
```

**To generate random keys, you can use:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### STEP 6: Restart Application

```bash
# Restart the app
sudo supervisorctl restart calorie-app

# Check status
sudo supervisorctl status calorie-app
```

**Expected output:** `calorie-app RUNNING`

---

### STEP 7: Test Backend API

```bash
# Test health endpoint
curl http://YOUR_SERVER_IP/api/health
```

**Expected response:**
```json
{"status":"healthy","message":"Calorie Detection API is running"}
```

---

### STEP 8: Update Mobile App Configuration (On your local machine)

Edit the file: `CalorieMobileApp/src/config/constants.ts`

```typescript
// Change this line:
export const API_BASE_URL = 'http://YOUR_SERVER_IP';

// Example:
export const API_BASE_URL = 'http://123.45.67.89';
```

---

### STEP 9: Test Mobile App

```bash
# Navigate to mobile app directory
cd CalorieMobileApp

# Start Expo
npx expo start
```

**Test these features:**
- Register new user
- Login
- Take photo of food
- View food logs
- Check analytics

---

### STEP 10: Build Android APK

```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

**This will:**
1. Upload your code to Expo servers
2. Build the APK
3. Provide a download link when complete (usually takes 10-15 minutes)

---

## 🔍 Verification Commands

### Check if services are running:

```bash
# Check app status
sudo supervisorctl status calorie-app

# Check Nginx
sudo systemctl status nginx

# Check Redis
sudo systemctl status redis-server

# Check firewall
sudo ufw status
```

### View logs:

```bash
# Application logs
sudo tail -f /var/log/calorie-app/error.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Future Updates

When you make changes to your code:

```bash
# 1. On local machine - push changes
cd calories-app
git add .
git commit -m "Your update message"
git push origin main

# 2. On server - deploy updates
ssh root@YOUR_SERVER_IP
cd /var/www/calorie-app
git pull origin main
sudo ./deploy.sh
```

---

## 🆘 Troubleshooting Commands

### If app won't start:

```bash
# View error logs
sudo tail -100 /var/log/calorie-app/error.log

# Restart app
sudo supervisorctl restart calorie-app

# Check if port 5000 is in use
sudo lsof -i :5000
```

### If database has issues:

```bash
# Check database file
ls -la /var/www/calorie-app/instance/

# Fix permissions
sudo chown www-data:www-data /var/www/calorie-app/instance/calorie_app.db
sudo chmod 664 /var/www/calorie-app/instance/calorie_app.db

# Restart app
sudo supervisorctl restart calorie-app
```

### If Nginx has issues:

```bash
# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 Important Notes

1. **Security:** Change the SECRET_KEY and JWT_SECRET_KEY in .env file
2. **Backups:** Automated daily backups are set up at `/var/www/calorie-app/backups/`
3. **SSL:** If you have a domain, run: `sudo certbot --nginx -d your-domain.com`
4. **Monitoring:** Check logs regularly: `sudo tail -f /var/log/calorie-app/error.log`

---

## ✅ Success Checklist

- [ ] Code pushed to Git
- [ ] Server setup completed
- [ ] Environment variables configured
- [ ] Application running (check with supervisorctl)
- [ ] API health check returns success
- [ ] Mobile app connects to backend
- [ ] User can register and login
- [ ] Food logging works
- [ ] APK built and downloaded

---

**Need help? Check the logs:**
```bash
sudo tail -f /var/log/calorie-app/error.log
```

**Everything working? You're done! 🎉**
