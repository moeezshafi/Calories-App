#!/bin/bash

# Fix Database Permissions Script
# This script resolves SQLite permission issues on production server

echo "============================================================"
echo "FIXING DATABASE PERMISSIONS"
echo "============================================================"

# Set variables
APP_DIR="/var/www/calorie-app"
INSTANCE_DIR="$APP_DIR/instance"
DB_FILE="$INSTANCE_DIR/calorie_app.db"

echo ""
echo "Step 1: Removing SQLite lock files..."
rm -f "$DB_FILE-shm" "$DB_FILE-wal" "$DB_FILE-journal"
echo "✓ Lock files removed"

echo ""
echo "Step 2: Creating instance directory if it doesn't exist..."
mkdir -p "$INSTANCE_DIR"
echo "✓ Instance directory created"

echo ""
echo "Step 3: Setting directory permissions..."
chmod 775 "$INSTANCE_DIR"
chown www-data:www-data "$INSTANCE_DIR"
echo "✓ Directory permissions set (775, www-data:www-data)"

echo ""
echo "Step 4: Setting database file permissions (if exists)..."
if [ -f "$DB_FILE" ]; then
    chmod 664 "$DB_FILE"
    chown www-data:www-data "$DB_FILE"
    echo "✓ Database file permissions set (664, www-data:www-data)"
else
    echo "⚠ Database file doesn't exist yet (will be created on first run)"
fi

echo ""
echo "Step 5: Setting parent directory permissions..."
chmod 755 "$APP_DIR"
chown www-data:www-data "$APP_DIR"
echo "✓ Parent directory permissions set"

echo ""
echo "============================================================"
echo "PERMISSIONS FIXED"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Test app as www-data user:"
echo "   sudo -u www-data $APP_DIR/venv/bin/python $APP_DIR/app.py"
echo ""
echo "2. If successful, start with supervisor:"
echo "   supervisorctl start calorie-app"
echo ""
