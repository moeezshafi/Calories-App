"""Add onboarding columns to user table

Revision ID: 001_onboarding
Revises: None
Create Date: 2026-03-07
"""
from alembic import op
import sqlalchemy as sa

revision = '001_onboarding'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add onboarding-related columns to user table
    # Using batch mode for SQLite compatibility
    with op.batch_alter_table('user', schema=None) as batch_op:
        # Check and add each column (SQLite doesn't support IF NOT EXISTS in ALTER TABLE)
        try:
            batch_op.add_column(sa.Column('target_weight', sa.Float(), nullable=True))
        except Exception:
            pass
        try:
            batch_op.add_column(sa.Column('diet_type', sa.String(length=30), nullable=True))
        except Exception:
            pass
        try:
            batch_op.add_column(sa.Column('workout_frequency', sa.String(length=20), nullable=True))
        except Exception:
            pass
        try:
            batch_op.add_column(sa.Column('onboarding_completed', sa.Boolean(), server_default='0', nullable=True))
        except Exception:
            pass


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('onboarding_completed')
        batch_op.drop_column('workout_frequency')
        batch_op.drop_column('diet_type')
        batch_op.drop_column('target_weight')
