#!/usr/bin/env python3
"""
Script to run all pending Alembic migrations
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from alembic.config import Config
from alembic import command
from database import db
from flask import Flask

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calorie_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def run_migrations():
    """Run all pending migrations"""
    print("\n" + "="*60)
    print("RUNNING DATABASE MIGRATIONS")
    print("="*60 + "\n")
    
    with app.app_context():
        try:
            # Get the directory where this script is located
            script_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Create Alembic config
            alembic_cfg = Config(os.path.join(script_dir, "migrations", "alembic.ini"))
            alembic_cfg.set_main_option("script_location", os.path.join(script_dir, "migrations"))
            
            # Show current revision
            print("Checking current database revision...")
            command.current(alembic_cfg)
            
            print("\nRunning migrations to latest version...")
            command.upgrade(alembic_cfg, "head")
            
            print("\n" + "="*60)
            print("✓ MIGRATIONS COMPLETED SUCCESSFULLY")
            print("="*60 + "\n")
            
            # Show final revision
            print("Current database revision:")
            command.current(alembic_cfg)
            
            return True
            
        except Exception as e:
            print(f"\n❌ ERROR running migrations: {e}")
            print("\nIf you see 'table already exists' errors, this is normal.")
            print("The migration script handles existing tables gracefully.")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = run_migrations()
    sys.exit(0 if success else 1)
