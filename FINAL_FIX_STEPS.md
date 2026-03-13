# Final Fix for Mobile App Connection Issue

## Problem
- Server works in mobile browser (both port 80 and 5001)
- React Native app shows "Cannot connect to server"
- This indicates Android security blocking HTTP requests

## Root Causes Identified
1. Android blocks cleartext (HTTP) traffic by default since API 28
2. CORS headers might not be properly configured for mobile apps
3. React Native sends requests differently than browsers

## Fixes Applied

### 1. Android Cleartext Traffic (app.json)
✅ Added `"usesCleartextTraffic": true` to allow HTTP connections
✅ Added `"android.permission.INTERNET"` permission
✅ Incremented versionCode to 4

### 2. CORS Configuration (app.py)
✅ Updated Flask-CORS to allow all origins with proper headers
✅ Set `supports_credentials: False` (required when origins is "*")
✅ Added all necessary HTTP methods and headers

### 3. Debug Logging (api.ts, authStore.ts)
✅ Added console.log statements to track API calls
✅ Added better error handling in loadAuth
✅ Created health check service

### 4. App Startup (App.js)
✅ Added server health check on startup
✅ Shows API URL and server status during loading
✅ Better error handling

## Server Update Required

### Step 1: Update Flask App
```bash
cd /var/www/calorie-app
git pull origin main
sudo supervisorctl restart calorie-app
sudo supervisorctl status calorie-app
```

### Step 2: Verify Backend is Running
```bash
curl http://localhost:5001/api/health
```

Should return: `{"status":"healthy","message":"Calorie Detection API is running"}`

### Step 3: Test CORS Headers
```bash
curl -H "Origin: http://example.com" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:5001/api/auth/register -v
```

Should see `Access-Control-Allow-Origin: *` in response headers.

## Build New APK

```bash
cd CalorieMobileApp
eas build --platform android --profile production
```

Wait for build to complete, then download and test.

## Testing Checklist

After installing new APK:

1. ✅ App opens without immediate error
2. ✅ Shows "Loading..." screen with API URL
3. ✅ Can see server status (healthy/unhealthy)
4. ✅ Can navigate to Register screen
5. ✅ Can fill in registration form
6. ✅ Registration succeeds and creates account
7. ✅ Can login with created account
8. ✅ Can access home screen and other features

## If Still Fails

Check these:

1. Verify APK has latest code (check version code 4 in app info)
2. Check if old APK is cached - uninstall completely and reinstall
3. Clear app data: Settings > Apps > Calorie Tracker > Storage > Clear Data
4. Check server logs: `sudo tail -f /var/log/supervisor/calorie-app-stderr.log`
5. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

## Expected Behavior

The new APK should:
- Allow HTTP connections (cleartext traffic enabled)
- Successfully make API calls to http://46.62.254.185
- Show proper error messages if server is down
- Display API URL on loading screen for debugging
