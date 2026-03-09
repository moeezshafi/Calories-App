#!/usr/bin/env python3
"""
Diagnostic script to check and fix protein data issues in the database.
This script will:
1. Check if food logs have protein data
2. Verify weekly analytics calculations
3. Show sample data for debugging
"""

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta, date
from database import db
from models.food_log import FoodLog
from models.user import User
from sqlalchemy import func
from flask import Flask

# Create a minimal Flask app for database access
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calorie_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def check_food_logs_protein():
    """Check if food logs have protein data"""
    print("\n" + "="*60)
    print("CHECKING FOOD LOGS FOR PROTEIN DATA")
    print("="*60)
    
    with app.app_context():
        # Get total food logs
        total_logs = FoodLog.query.count()
        print(f"\nTotal food logs in database: {total_logs}")
        
        if total_logs == 0:
            print("❌ No food logs found in database!")
            return False
        
        # Check logs with protein data
        logs_with_protein = FoodLog.query.filter(FoodLog.proteins > 0).count()
        logs_without_protein = total_logs - logs_with_protein
        
        print(f"✓ Logs with protein data: {logs_with_protein}")
        print(f"✗ Logs without protein data: {logs_without_protein}")
        
        # Show sample logs
        print("\n" + "-"*60)
        print("SAMPLE FOOD LOGS (Last 5):")
        print("-"*60)
        
        sample_logs = FoodLog.query.order_by(FoodLog.consumed_at.desc()).limit(5).all()
        for log in sample_logs:
            nutrients = log.total_nutrients()
            print(f"\nFood: {log.food_name}")
            print(f"  Date: {log.consumed_at.strftime('%Y-%m-%d %H:%M')}")
            print(f"  Calories: {log.total_calories():.1f}")
            print(f"  Protein: {nutrients['proteins']:.1f}g")
            print(f"  Carbs: {nutrients['carbs']:.1f}g")
            print(f"  Fats: {nutrients['fats']:.1f}g")
        
        return logs_with_protein > 0

def check_weekly_analytics(user_id=None):
    """Check weekly analytics calculation"""
    print("\n" + "="*60)
    print("CHECKING WEEKLY ANALYTICS CALCULATION")
    print("="*60)
    
    with app.app_context():
        # Get first user if not specified
        if user_id is None:
            user = User.query.first()
            if not user:
                print("❌ No users found in database!")
                return False
            user_id = user.id
            print(f"\nUsing user: {user.name} (ID: {user_id})")
        
        # Calculate current week
        today = date.today()
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
        
        print(f"Week: {start_date} to {end_date}")
        
        # Get food logs for the week
        food_logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.consumed_at) >= start_date,
            func.date(FoodLog.consumed_at) <= end_date
        ).all()
        
        print(f"\nFood logs this week: {len(food_logs)}")
        
        if len(food_logs) == 0:
            print("❌ No food logs found for this week!")
            return False
        
        # Calculate totals
        total_calories = sum(log.total_calories() for log in food_logs)
        total_proteins = sum(log.total_nutrients()['proteins'] for log in food_logs)
        total_carbs = sum(log.total_nutrients()['carbs'] for log in food_logs)
        total_fats = sum(log.total_nutrients()['fats'] for log in food_logs)
        
        # Count days with data
        days_with_data = len(set(log.consumed_at.date() for log in food_logs))
        
        print(f"\nDays with data: {days_with_data}")
        print(f"\nWeekly Totals:")
        print(f"  Calories: {total_calories:.1f}")
        print(f"  Protein: {total_proteins:.1f}g")
        print(f"  Carbs: {total_carbs:.1f}g")
        print(f"  Fats: {total_fats:.1f}g")
        
        print(f"\nWeekly Averages (per day with data):")
        print(f"  Calories: {total_calories / max(days_with_data, 1):.1f}")
        print(f"  Protein: {total_proteins / max(days_with_data, 1):.1f}g")
        print(f"  Carbs: {total_carbs / max(days_with_data, 1):.1f}g")
        print(f"  Fats: {total_fats / max(days_with_data, 1):.1f}g")
        
        # Check if protein is 0
        if total_proteins == 0:
            print("\n⚠️  WARNING: Total protein is 0!")
            print("Checking individual logs...")
            for log in food_logs:
                nutrients = log.total_nutrients()
                if nutrients['proteins'] == 0:
                    print(f"  - {log.food_name}: protein = 0g (might be missing data)")
        else:
            print("\n✓ Protein data looks good!")
        
        return True

def check_database_schema():
    """Check if the database schema is correct"""
    print("\n" + "="*60)
    print("CHECKING DATABASE SCHEMA")
    print("="*60)
    
    with app.app_context():
        # Check if FoodLog table has protein column
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('food_log')]
        
        print(f"\nFoodLog table columns: {', '.join(columns)}")
        
        required_columns = ['proteins', 'carbs', 'fats', 'fiber', 'sugars', 'sodium']
        missing_columns = [col for col in required_columns if col not in columns]
        
        if missing_columns:
            print(f"\n❌ Missing columns: {', '.join(missing_columns)}")
            return False
        else:
            print("\n✓ All required columns present")
            return True

def main():
    """Run all diagnostic checks"""
    print("\n" + "="*60)
    print("PROTEIN DATA DIAGNOSTIC SCRIPT")
    print("="*60)
    
    # Check database schema
    schema_ok = check_database_schema()
    
    # Check food logs
    logs_ok = check_food_logs_protein()
    
    # Check weekly analytics
    analytics_ok = check_weekly_analytics()
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Database Schema: {'✓ OK' if schema_ok else '❌ ISSUES FOUND'}")
    print(f"Food Logs: {'✓ OK' if logs_ok else '❌ ISSUES FOUND'}")
    print(f"Weekly Analytics: {'✓ OK' if analytics_ok else '❌ ISSUES FOUND'}")
    
    if schema_ok and logs_ok and analytics_ok:
        print("\n✓ All checks passed! Protein data should be working correctly.")
        print("\nIf you're still seeing 0g protein in the app:")
        print("1. Make sure you're logged in as the correct user")
        print("2. Try refreshing the app (pull down to refresh)")
        print("3. Check that the API URL is correct in the app")
        print("4. Restart the Flask backend server")
    else:
        print("\n❌ Issues found. Please review the output above.")
    
    print("\n" + "="*60)

if __name__ == '__main__':
    main()
