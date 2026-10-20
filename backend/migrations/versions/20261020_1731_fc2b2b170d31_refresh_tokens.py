"""refresh_tokens

Revision ID: fc2b2b170d31
Revises: 5c1e9a7d2b4f
Create Date: 2026-10-20 17:31:55.609015

"""
from alembic import op
import sqlalchemy as sa


revision = 'fc2b2b170d31'
down_revision = '5c1e9a7d2b4f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('refresh_tokens',
    sa.Column('jti', sa.String(length=36), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_refresh_tokens_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('jti', name=op.f('pk_refresh_tokens'))
    )
    with op.batch_alter_table('refresh_tokens', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_refresh_tokens_user_id'), ['user_id'], unique=False)


def downgrade():
    with op.batch_alter_table('refresh_tokens', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_refresh_tokens_user_id'))

    op.drop_table('refresh_tokens')
