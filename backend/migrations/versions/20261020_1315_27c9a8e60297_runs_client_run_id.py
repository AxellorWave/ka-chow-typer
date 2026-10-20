"""runs client_run_id

Revision ID: 27c9a8e60297
Revises: bab2a4c4ca6d
Create Date: 2026-10-20 13:15:13.374976

"""
from alembic import op
import sqlalchemy as sa


revision = '27c9a8e60297'
down_revision = 'bab2a4c4ca6d'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('runs', schema=None) as batch_op:
        batch_op.add_column(sa.Column('client_run_id', sa.String(length=64), nullable=True))
        batch_op.create_index('ix_runs_user_id_client_run_id', ['user_id', 'client_run_id'], unique=True)


def downgrade():
    with op.batch_alter_table('runs', schema=None) as batch_op:
        batch_op.drop_index('ix_runs_user_id_client_run_id')
        batch_op.drop_column('client_run_id')
