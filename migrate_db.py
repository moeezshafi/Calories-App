"""
Database Migration Script
Initialize and run migrations
"""

from app import create_app
from database import db
from flask_migrate import Migrate, init, migrate, upgrade
import os

app = create_app()
migrate_obj = Migrate(app, db)

if __name__ == '__main__':
    with app.app_context():
        # Check if migrations folder exists
        if not os.path.exists('migrations'):
            print("🔧 Initializing migrations...")
            os.system('flask db init')
        
        print("📝 Creating migration...")
        os.system('flask db migrate -m "Initial migration with all models"')
        
        print("⬆️ Applying migrations...")
        os.system('flask db upgrade')
        
        print("✅ Database migrations complete!")
