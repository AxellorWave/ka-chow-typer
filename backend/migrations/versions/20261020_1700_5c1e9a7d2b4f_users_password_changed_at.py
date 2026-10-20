"""users password_changed_at

Revision ID: 5c1e9a7d2b4f
Revises: 27c9a8e60297
Create Date: 2026-10-20 17:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '5c1e9a7d2b4f'
down_revision = '27c9a8e60297'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('password_changed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('password_changed_at')
