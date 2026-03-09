import logging
from logging.config import fileConfig
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from alembic import context
from database import db
from flask import Flask

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name:
    fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')

# Create Flask app for migrations
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calorie_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Import all models so they're registered with SQLAlchemy
with app.app_context():
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
    # Import models defined in routes
    from routes.exercises import ExerciseLog
    from routes.recipes import Recipe, RecipeIngredient
    from routes.meal_plans import MealPlan, MealPlanTemplate

# Set the SQLAlchemy URL
config.set_main_option('sqlalchemy.url', 'sqlite:///calorie_tracker.db')

# Get metadata from db
target_metadata = db.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url, 
        target_metadata=target_metadata, 
        literal_binds=True,
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    
    # Create engine from Flask app
    with app.app_context():
        connectable = db.engine

        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                compare_type=True
            )

            with context.begin_transaction():
                context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
