# Deployment Summary - Complete Checklist

## 📋 Pre-Deployment Checklist

- [ ] All code changes committed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints tested locally
- [ ] Mobile app tested with local backend

## 🚀 Deployment Steps

### Phase 1: Prepare Code (Local Machine)

1. **Make scripts executable**
   ```bash
   cd calories-app
   chmod +x git-push.sh deploy.sh server-setup.sh
   ```

2. **Push to Git**
   ```bash
   ./git-push.sh
   # Or manually:
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

### Phase 2: Server Setup (Hetzner Server - One Time Only)

1. **Connect to server**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Run setup script**
   ```bash
   # Option A: Download from Git
   cd /tmp
   wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/server-setup.sh
   chmod +x server-setup.sh
   sudo ./server-setup.sh
   
   # Option B: If code already on server
   cd /var/www/calorie-app
   chmod +x server-setup.sh
   sudo ./server-setup.sh
   ```

3. **Configure environment**
   ```bash
   nano /var/www/calorie-app/.env
   ```
   
   Update:
   - `SECRET_KEY` - Generate random string
   - `JWT_SECRET_KEY` - Generate random string
   - `GEMINI_API_KEY` - Your Gemini API key
   - `CORS_ORIGINS` - Your domain or mobile app origin

4. **Restart application**
   ```bash
   sudo supervisorctl restart calorie-app
   ```

5. **Verify deployment**
   ```bash
   # Check status
   sudo supervisorctl status calorie-app
   
   # Test API
   curl http://YOUR_SERVER_IP/api/health
   
   # Should return: {"status":"healthy","message":"Calorie Detection API is running"}
   ```

### Phase 3: Mobile App Configuration

1. **Update API URL**
   
   Edit `CalorieMobileApp/src/config/constants.ts`:
   ```typescript
   export const API_BASE_URL = 'http://YOUR_SERVER_IP';
   // or with domain:
   export const API_BASE_URL = 'https://your-domain.com';
   ```

2. **Test connection**
   ```bash
   cd CalorieMobileApp
   npx expo start
   ```
   
   Test login and food logging features.

### Phase 4: Build Android APK

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure build**
   
   Verify `eas.json` exists with correct configuration.

4. **Build APK**
   ```bash
   cd CalorieMobileApp
   eas build --platform android --profile preview
   ```

5. **Download and test**
   
   Once build completes, download APK from the provided link and install on Android device.

## 🔧 Post-Deployment Configuration

### SSL Certificate (Recommended)

```bash
ssh root@YOUR_SERVER_IP
sudo certbot --nginx -d your-domain.com
```

### Monitoring Setup

1. **Set up log rotation**
   ```bash
   sudo nano /etc/logrotate.d/calorie-app
   ```
   
   Add:
   ```
   /var/log/calorie-app/*.log {
       daily
       rotate 14
       compress
       delaycompress
       notifempty
       create 0640 www-data www-data
       sharedscripts
   }
   ```

2. **Monitor disk space**
   ```bash
   df -h
   ```

3. **Monitor memory**
   ```bash
   free -m
   ```

## 📊 Verification Checklist

### Backend Verification

- [ ] API health endpoint responds: `curl http://YOUR_SERVER_IP/api/health`
- [ ] User registration works: Test with Postman or mobile app
- [ ] User login works
- [ ] Food image analysis works
- [ ] Food logging works
- [ ] Analytics endpoints work
- [ ] Redis caching works
- [ ] Database migrations applied

### Mobile App Verification

- [ ] App connects to backend
- [ ] User can register
- [ ] User can login
- [ ] Camera food scanning works
- [ ] Manual food entry works
- [ ] Food logs display correctly
- [ ] Analytics/insights display
- [ ] Calendar history works
- [ ] Notifications work
- [ ] All screens accessible

### Server Verification

- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] Redis running: `sudo systemctl status redis-server`
- [ ] App running: `sudo supervisorctl status calorie-app`
- [ ] Firewall configured: `sudo ufw status`
- [ ] SSL certificate installed (if using domain)
- [ ] Backups configured
- [ ] Logs accessible

## 🔄 Update Workflow (Future Changes)

1. **Make changes locally**
2. **Test changes**
3. **Push to Git**
   ```bash
   ./git-push.sh
   ```
4. **Deploy to server**
   ```bash
   ssh root@YOUR_SERVER_IP
   cd /var/www/calorie-app
   sudo ./deploy.sh
   ```
5. **Rebuild mobile app if needed**
   ```bash
   cd CalorieMobileApp
   eas build --platform android --profile preview
   ```

## 📱 APK Distribution

### Option 1: Direct Installation
- Share APK file directly with users
- Users enable "Install from Unknown Sources"
- Install APK

### Option 2: Internal Testing (Google Play)
- Upload to Google Play Console
- Create internal testing track
- Add testers via email
- Testers download from Play Store

### Option 3: Production Release
- Complete Google Play Console setup
- Upload production build
- Submit for review
- Publish to Play Store

## 🆘 Emergency Procedures

### App Crashed

```bash
ssh root@YOUR_SERVER_IP
sudo supervisorctl restart calorie-app
sudo tail -f /var/log/calorie-app/error.log
```

### Database Corrupted

```bash
# Restore from backup
cd /var/www/calorie-app
cp backups/calorie_app_YYYYMMDD.db instance/calorie_app.db
sudo supervisorctl restart calorie-app
```

### Server Overloaded

```bash
# Check resources
htop
df -h

# Restart services
sudo systemctl restart nginx
sudo supervisorctl restart calorie-app
sudo systemctl restart redis-server
```

## 📞 Support Contacts

- Server Provider: Hetzner Support
- Expo/EAS: Expo Documentation
- API Issues: Check logs at `/var/log/calorie-app/`

## 📚 Additional Resources

- Full deployment guide: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- Quick reference: `QUICK_START.md`
- Project overview: `README.md`
- API documentation: Check route files in `routes/`

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Backend API responds to health check
2. ✅ Mobile app can register/login users
3. ✅ Food image analysis works
4. ✅ Data persists across app restarts
5. ✅ All features accessible and functional
6. ✅ No errors in logs
7. ✅ SSL certificate installed (if using domain)
8. ✅ Backups running automatically

---

**Ready to deploy? Start with Phase 1!** 🚀
