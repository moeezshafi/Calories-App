#!/usr/bin/env python3
"""
Migration script to add amount_g column to recipe_ingredient table
"""

from database import db
from flask import Flask
from sqlalchemy import text

# Create a minimal Flask app for database access
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calorie_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def add_amount_g_column():
    """Add amount_g column to recipe_ingredient table if it doesn't exist"""
    with app.app_context():
        try:
            # Check if column exists
            result = db.session.execute(text("PRAGMA table_info(recipe_ingredient)"))
            columns = [row[1] for row in result]
            
            if 'amount_g' not in columns:
                print("Adding amount_g column to recipe_ingredient table...")
                db.session.execute(text(
                    "ALTER TABLE recipe_ingredient ADD COLUMN amount_g FLOAT DEFAULT 0"
                ))
                db.session.commit()
                print("✓ Column added successfully!")
            else:
                print("✓ Column amount_g already exists")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()

if __name__ == '__main__':
    add_amount_g_column()
