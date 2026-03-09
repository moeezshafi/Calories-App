#!/bin/bash

# Calorie App Deployment Script
# This script automates the deployment process on the server

set -e  # Exit on error

echo "🚀 Starting Calorie App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/calorie-app"
VENV_DIR="$APP_DIR/venv"
LOG_DIR="/var/log/calorie-app"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Navigate to app directory
cd $APP_DIR || exit 1
print_status "Changed to app directory: $APP_DIR"

# Pull latest code
print_status "Pulling latest code from Git..."
git pull origin main || {
    print_error "Failed to pull latest code"
    exit 1
}

# Activate virtual environment
print_status "Activating virtual environment..."
source $VENV_DIR/bin/activate || {
    print_error "Failed to activate virtual environment"
    exit 1
}

# Install/update dependencies
print_status "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt || {
    print_error "Failed to install dependencies"
    exit 1
}

# Run database migrations
print_status "Running database migrations..."
python run_migrations.py || {
    print_warning "Migration failed or no new migrations"
}

# Create backup of database
print_status "Creating database backup..."
BACKUP_DIR="$APP_DIR/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp $APP_DIR/instance/calorie_app.db $BACKUP_DIR/calorie_app_$TIMESTAMP.db || {
    print_warning "Failed to create database backup"
}

# Set proper permissions
print_status "Setting permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $APP_DIR/uploads
chmod -R 775 $APP_DIR/instance

# Restart application
print_status "Restarting application..."
supervisorctl restart calorie-app || {
    print_error "Failed to restart application"
    exit 1
}

# Wait for app to start
sleep 3

# Check if app is running
if supervisorctl status calorie-app | grep -q "RUNNING"; then
    print_status "Application is running"
else
    print_error "Application failed to start"
    print_error "Check logs: tail -f $LOG_DIR/error.log"
    exit 1
fi

# Reload Nginx
print_status "Reloading Nginx..."
nginx -t && systemctl reload nginx || {
    print_warning "Nginx reload failed"
}

# Clean old backups (keep last 7 days)
print_status "Cleaning old backups..."
find $BACKUP_DIR -name "calorie_app_*.db" -mtime +7 -delete

echo ""
print_status "Deployment completed successfully! 🎉"
echo ""
echo "Useful commands:"
echo "  View logs: sudo tail -f $LOG_DIR/error.log"
echo "  App status: sudo supervisorctl status calorie-app"
echo "  Restart app: sudo supervisorctl restart calorie-app"
echo ""
