#!/bin/bash

# Server Setup Script for Hetzner
# Run this script on your Hetzner server to set up the environment

set -e

echo "🚀 Calorie App Server Setup Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    nginx \
    redis-server \
    supervisor \
    git \
    curl \
    ufw \
    certbot \
    python3-certbot-nginx

# Create application directory
APP_DIR="/var/www/calorie-app"
print_status "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR

# Ask for repository URL
echo ""
read -p "Enter your Git repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    print_warning "No repository URL provided. You'll need to upload files manually."
else
    print_status "Cloning repository..."
    cd /var/www
    git clone "$REPO_URL" calorie-app || {
        print_error "Failed to clone repository"
        exit 1
    }
fi

cd $APP_DIR

# Create virtual environment
print_status "Creating Python virtual environment..."
python3.11 -m venv venv

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p instance
mkdir -p uploads
mkdir -p backups
mkdir -p /var/log/calorie-app

# Set up environment file
print_status "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp .env.production.example .env
    print_warning "Please edit .env file with your configuration"
    print_warning "Important: Update SECRET_KEY, JWT_SECRET_KEY, and GEMINI_API_KEY"
fi

# Initialize database
print_status "Initializing database..."
python init_db.py
python run_migrations.py

# Configure Redis
print_status "Configuring Redis..."
systemctl start redis-server
systemctl enable redis-server

# Test Redis
if redis-cli ping | grep -q "PONG"; then
    print_status "Redis is running"
else
    print_error "Redis failed to start"
fi

# Set up Supervisor
print_status "Configuring Supervisor..."
cat > /etc/supervisor/conf.d/calorie-app.conf << 'EOF'
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
EOF

supervisorctl reread
supervisorctl update

# Ask for domain name
echo ""
read -p "Enter your domain name (or press Enter to use IP): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    DOMAIN_NAME="_"
    print_warning "No domain provided. Using server IP."
fi

# Set up Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/calorie-app << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    client_max_body_size 16M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/calorie-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t || {
    print_error "Nginx configuration test failed"
    exit 1
}

systemctl restart nginx

# Set up firewall
print_status "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# Set permissions
print_status "Setting file permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $APP_DIR/uploads
chmod -R 775 $APP_DIR/instance
chmod -R 775 /var/log/calorie-app

# Start application
print_status "Starting application..."
supervisorctl start calorie-app

# Wait for app to start
sleep 3

# Check if app is running
if supervisorctl status calorie-app | grep -q "RUNNING"; then
    print_status "Application is running"
else
    print_error "Application failed to start"
    print_error "Check logs: tail -f /var/log/calorie-app/error.log"
fi

# SSL Certificate setup
if [ "$DOMAIN_NAME" != "_" ]; then
    echo ""
    read -p "Do you want to set up SSL certificate with Let's Encrypt? (y/n): " setup_ssl
    if [ "$setup_ssl" = "y" ]; then
        print_status "Setting up SSL certificate..."
        certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos --email admin@$DOMAIN_NAME || {
            print_warning "SSL setup failed. You can run it manually later with: certbot --nginx -d $DOMAIN_NAME"
        }
    fi
fi

# Set up automated backups
print_status "Setting up automated daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * cp /var/www/calorie-app/instance/calorie_app.db /var/www/calorie-app/backups/calorie_app_\$(date +\\%Y\\%m\\%d).db") | crontab -

# Clean old backups weekly
(crontab -l 2>/dev/null; echo "0 3 * * 0 find /var/www/calorie-app/backups -name 'calorie_app_*.db' -mtime +30 -delete") | crontab -

echo ""
echo "=================================="
print_status "Server setup completed! 🎉"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano /var/www/calorie-app/.env"
echo "2. Update SECRET_KEY, JWT_SECRET_KEY, and GEMINI_API_KEY"
echo "3. Restart app: supervisorctl restart calorie-app"
echo ""
echo "Useful commands:"
echo "  View logs: tail -f /var/log/calorie-app/error.log"
echo "  App status: supervisorctl status calorie-app"
echo "  Restart app: supervisorctl restart calorie-app"
echo "  Nginx status: systemctl status nginx"
echo "  Redis status: systemctl status redis-server"
echo ""

if [ "$DOMAIN_NAME" != "_" ]; then
    echo "Your app should be accessible at: http://$DOMAIN_NAME"
else
    SERVER_IP=$(curl -s ifconfig.me)
    echo "Your app should be accessible at: http://$SERVER_IP"
fi

echo ""
