"""Add meal plans and recipes tables

Revision ID: 002_add_meal_plans_and_recipes
Revises: 001_onboarding
Create Date: 2024-03-09

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_add_meal_plans_and_recipes'
down_revision = '001_onboarding'
branch_labels = None
depends_on = None


def upgrade():
    # Create meal_plan table
    op.create_table(
        'meal_plan',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('plan_date', sa.Date(), nullable=False),
        sa.Column('meal_type', sa.String(length=20), nullable=False),
        sa.Column('food_name', sa.String(length=200), nullable=False),
        sa.Column('calories', sa.Float(), nullable=True, default=0),
        sa.Column('protein', sa.Float(), nullable=True, default=0),
        sa.Column('carbs', sa.Float(), nullable=True, default=0),
        sa.Column('fats', sa.Float(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_meal_plan_user_id', 'meal_plan', ['user_id'])
    op.create_index('idx_meal_plan_plan_date', 'meal_plan', ['plan_date'])
    op.create_index('idx_meal_plan_user_date', 'meal_plan', ['user_id', 'plan_date'])
    op.create_index('idx_meal_plan_meal_type', 'meal_plan', ['meal_type'])

    # Create meal_plan_template table
    op.create_table(
        'meal_plan_template',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('meals', sa.Text(), nullable=False),
        sa.Column('total_calories', sa.Float(), nullable=True, default=0),
        sa.Column('total_protein', sa.Float(), nullable=True, default=0),
        sa.Column('total_carbs', sa.Float(), nullable=True, default=0),
        sa.Column('total_fats', sa.Float(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_meal_plan_template_user_id', 'meal_plan_template', ['user_id'])

    # Create recipe table
    op.create_table(
        'recipe',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('servings', sa.Integer(), nullable=True, default=1),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_recipe_user_id', 'recipe', ['user_id'])
    op.create_index('idx_recipe_name', 'recipe', ['name'])

    # Create recipe_ingredient table
    op.create_table(
        'recipe_ingredient',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('food_name', sa.String(length=200), nullable=False),
        sa.Column('amount', sa.String(length=100), nullable=True),
        sa.Column('calories', sa.Float(), nullable=True, default=0),
        sa.Column('protein', sa.Float(), nullable=True, default=0),
        sa.Column('carbs', sa.Float(), nullable=True, default=0),
        sa.Column('fats', sa.Float(), nullable=True, default=0),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipe.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_recipe_ingredient_recipe_id', 'recipe_ingredient', ['recipe_id'])


def downgrade():
    op.drop_index('idx_recipe_ingredient_recipe_id', table_name='recipe_ingredient')
    op.drop_table('recipe_ingredient')
    
    op.drop_index('idx_recipe_name', table_name='recipe')
    op.drop_index('idx_recipe_user_id', table_name='recipe')
    op.drop_table('recipe')
    
    op.drop_index('idx_meal_plan_template_user_id', table_name='meal_plan_template')
    op.drop_table('meal_plan_template')
    
    op.drop_index('idx_meal_plan_meal_type', table_name='meal_plan')
    op.drop_index('idx_meal_plan_user_date', table_name='meal_plan')
    op.drop_index('idx_meal_plan_plan_date', table_name='meal_plan')
    op.drop_index('idx_meal_plan_user_id', table_name='meal_plan')
    op.drop_table('meal_plan')
