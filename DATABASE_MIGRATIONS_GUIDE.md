# Database Migrations Guide

## Overview

This project uses Alembic for database migrations to ensure proper version control of database schema changes. This is critical for production deployments.

## Migration Files

### Existing Migrations

1. **001_add_onboarding_columns.py** - Adds onboarding-related columns to user table
2. **002_add_meal_plans_and_recipes.py** - Creates meal plan and recipe tables
3. **003_add_missing_tables_and_columns.py** - Adds all remaining tables and the `amount_g` column

### Migration 003 Details

This migration adds:
- `amount_g` column to `recipe_ingredient` table
- `exercise_log` table
- `weight_log` table (if not exists)
- `step_log` table (if not exists)
- `water_log` table (if not exists)
- `progress_photo` table
- `badge` and `user_badge` tables
- `user_preference` table
- `meal_reminder` table
- `custom_food` table
- `saved_food` table
- `refresh_tokens` table

## Scripts

### init_db.py

Initializes a fresh database with all tables. Use this for:
- First-time setup
- Development environments
- Testing

```bash
python init_db.py
```

### run_migrations.py

Runs all pending migrations. Use this for:
- Applying schema changes to existing databases
- Production deployments
- Updating development databases

```bash
python run_migrations.py
```

### check_columns.py

Utility script to verify specific columns exist in tables.

```bash
python check_columns.py
```

## Workflow

### For New Development Setup

1. Initialize the database:
   ```bash
   python init_db.py
   ```

2. Mark database as up-to-date:
   ```bash
   python -c "from alembic.config import Config; from alembic import command; import os; cfg = Config(os.path.join('migrations', 'alembic.ini')); cfg.set_main_option('script_location', 'migrations'); command.stamp(cfg, 'head')"
   ```

### For Production Deployment

1. Backup your database first!

2. Run migrations:
   ```bash
   python run_migrations.py
   ```

3. Verify migration status:
   ```bash
   python run_migrations.py
   ```

### Creating New Migrations

When you add new models or modify existing ones:

1. Create a new migration file in `migrations/versions/`:
   ```python
   """Description of changes
   
   Revision ID: 004_your_migration_name
   Revises: 003_missing_tables_columns
   Create Date: YYYY-MM-DD
   """
   from alembic import op
   import sqlalchemy as sa
   
   revision = '004_your_migration_name'
   down_revision = '003_missing_tables_columns'
   
   def upgrade():
       # Your schema changes here
       pass
   
   def downgrade():
       # Reverse your changes here
       pass
   ```

2. Test the migration:
   ```bash
   python run_migrations.py
   ```

## Important Notes

1. **Always backup before migrations** - Especially in production
2. **Test migrations locally first** - Never run untested migrations in production
3. **Use try-except blocks** - The migration scripts handle existing tables gracefully
4. **Version control** - All migration files should be committed to git
5. **Sequential naming** - Use sequential numbers (001, 002, 003) for clarity
6. **Document changes** - Each migration should have clear comments

## Current Database Status

After running the setup:
- Database: `calorie_tracker.db`
- Current revision: `003_missing_tables_columns (head)`
- Total tables: 19
- All models are in sync with database schema

## Troubleshooting

### "Table already exists" errors
These are normal and handled gracefully by the migration scripts using try-except blocks.

### "No such table" errors
Run `python init_db.py` to create base tables first.

### Migration version conflicts
Check current version:
```bash
python run_migrations.py
```

Reset to specific version:
```bash
python -c "from alembic.config import Config; from alembic import command; cfg = Config('migrations/alembic.ini'); cfg.set_main_option('script_location', 'migrations'); command.stamp(cfg, '003_missing_tables_columns')"
```

## Models Location

Models are defined in two locations:

1. **models/** directory:
   - User, FoodLog, WeightLog, WaterLog, StepLog
   - ProgressPhoto, Badge, UserBadge
   - UserPreference, MealReminder
   - CustomFood, SavedFood, RefreshToken

2. **routes/** directory:
   - ExerciseLog (routes/exercises.py)
   - Recipe, RecipeIngredient (routes/recipes.py)
   - MealPlan, MealPlanTemplate (routes/meal_plans.py)

All models are imported in `migrations/env.py` to ensure they're registered with SQLAlchemy.
