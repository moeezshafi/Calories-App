# Nginx Configuration Update for Mobile App

## Issue
Mobile app cannot connect to server, but browser works fine. This suggests CORS or proxy headers issue.

## Solution
Update Nginx to add proper CORS headers and proxy settings for mobile apps.

## Commands to Run on Server

```bash
# 1. Backup current nginx config
sudo cp /etc/nginx/sites-available/sites.conf /etc/nginx/sites-available/sites.conf.backup

# 2. Edit the nginx config
sudo nano /etc/nginx/sites-available/sites.conf
```

## Add these lines inside the `location /` block:

```nginx
server {
    listen 80;
    server_name 46.62.254.185;
    client_max_body_size 16M;

    # Add CORS headers for mobile app
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Type, Authorization' always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept' always;
        add_header 'Access-Control-Max-Age' 3600 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    location /socket.io {
        proxy_pass http://127.0.0.1:5001/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }

    location /static {
        alias /var/www/calorie-app/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias /var/www/calorie-app/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 3. Test and reload Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# Verify it's running
sudo systemctl status nginx
```

## 4. Update Flask app on server

```bash
# Navigate to app directory
cd /var/www/calorie-app

# Pull latest changes
git pull origin main

# Restart the app
sudo supervisorctl restart calorie-app

# Check status
sudo supervisorctl status calorie-app
```

## 5. Test from mobile browser

Open your phone browser and go to:
- http://46.62.254.185/api/health

Should return: `{"status":"healthy","message":"Calorie Detection API is running"}`
