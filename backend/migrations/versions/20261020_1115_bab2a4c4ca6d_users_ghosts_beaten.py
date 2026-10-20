"""users ghosts_beaten

Revision ID: bab2a4c4ca6d
Revises: 73e2fb3c6e70
Create Date: 2026-10-20 11:15:50.316894

"""
from alembic import op
import sqlalchemy as sa


revision = 'bab2a4c4ca6d'
down_revision = '73e2fb3c6e70'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ghosts_beaten', sa.Integer(), server_default=sa.text('0'), nullable=False))


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('ghosts_beaten')
