#!/usr/bin/env python3
"""
Script to initialize the database with all tables
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import db
from flask import Flask

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calorie_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def init_database():
    """Initialize database with all tables"""
    print("\n" + "="*60)
    print("INITIALIZING DATABASE")
    print("="*60 + "\n")
    
    with app.app_context():
        try:
            # Import all models
            from models.user import User
            from models.food_log import FoodLog
            from models.weight_log import WeightLog
            from models.water_log import WaterLog
            from models.step_log import StepLog
            from models.progress_photo import ProgressPhoto
            from models.badge import Badge, UserBadge
            from models.user_preference import UserPreference
            from models.meal_reminder import MealReminder
            from models.custom_food import CustomFood
            from models.saved_food import SavedFood
            from models.refresh_token import RefreshToken
            from routes.exercises import ExerciseLog
            from routes.recipes import Recipe, RecipeIngredient
            from routes.meal_plans import MealPlan, MealPlanTemplate
            
            print("Creating all tables...")
            db.create_all()
            
            print("\n" + "="*60)
            print("✓ DATABASE INITIALIZED SUCCESSFULLY")
            print("="*60 + "\n")
            
            # Show created tables
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"Created {len(tables)} tables:")
            for table in sorted(tables):
                print(f"  - {table}")
            
            return True
            
        except Exception as e:
            print(f"\n❌ ERROR initializing database: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = init_database()
    sys.exit(0 if success else 1)
