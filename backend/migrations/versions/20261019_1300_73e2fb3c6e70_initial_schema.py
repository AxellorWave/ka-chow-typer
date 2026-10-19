"""initial schema

Revision ID: 73e2fb3c6e70
Revises: 
Create Date: 2026-10-19 13:00:51.133201

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '73e2fb3c6e70'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('achievements',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.String(length=64), nullable=False),
    sa.Column('title', sa.String(length=128), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('icon', sa.String(length=128), nullable=True),
    sa.Column('condition', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('sort_order', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_achievements')),
    sa.UniqueConstraint('code', name=op.f('uq_achievements_code'))
    )
    op.create_table('garage_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.String(length=64), nullable=False),
    sa.Column('slot', sa.String(length=16), nullable=False),
    sa.Column('title', sa.String(length=128), nullable=False),
    sa.Column('asset', sa.String(length=256), nullable=True),
    sa.Column('unlock_type', sa.String(length=16), server_default=sa.text("'default'"), nullable=False),
    sa.Column('unlock_value', sa.String(length=64), nullable=True),
    sa.Column('sort_order', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_garage_items')),
    sa.UniqueConstraint('code', name=op.f('uq_garage_items_code'))
    )
    with op.batch_alter_table('garage_items', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_garage_items_slot'), ['slot'], unique=False)

    op.create_table('texts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('mode', sa.String(length=16), nullable=False),
    sa.Column('lang', sa.String(length=16), nullable=False),
    sa.Column('difficulty', sa.SmallInteger(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_texts')),
    sa.UniqueConstraint('mode', 'lang', 'content', name=op.f('uq_texts_mode_lang_content'))
    )
    with op.batch_alter_table('texts', schema=None) as batch_op:
        batch_op.create_index('ix_texts_mode_lang_difficulty', ['mode', 'lang', 'difficulty'], unique=False)

    op.create_table('tracks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.String(length=64), nullable=False),
    sa.Column('title', sa.String(length=128), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('sort_order', sa.Integer(), nullable=False),
    sa.Column('mode', sa.String(length=16), nullable=False),
    sa.Column('lang', sa.String(length=16), nullable=False),
    sa.Column('difficulty', sa.SmallInteger(), nullable=False),
    sa.Column('min_level', sa.Integer(), server_default=sa.text('1'), nullable=False),
    sa.Column('cup_requirements', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_tracks')),
    sa.UniqueConstraint('code', name=op.f('uq_tracks_code'))
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('password_hash', sa.String(length=255), nullable=True),
    sa.Column('nickname', sa.String(length=32), nullable=False),
    sa.Column('avatar_url', sa.String(length=512), nullable=True),
    sa.Column('xp', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('level', sa.Integer(), server_default=sa.text('1'), nullable=False),
    sa.Column('streak_current', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('streak_best', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('last_active_date', sa.Date(), nullable=True),
    sa.Column('car_config', postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_users')),
    sa.UniqueConstraint('email', name=op.f('uq_users_email')),
    sa.UniqueConstraint('nickname', name=op.f('uq_users_nickname'))
    )
    op.create_table('bigram_stats',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('bigram', sa.String(length=8), nullable=False),
    sa.Column('presses', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('errors', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('latency_sum_ms', sa.BigInteger(), server_default=sa.text('0'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_bigram_stats_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'bigram', name=op.f('pk_bigram_stats'))
    )
    op.create_table('daily_challenges',
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('text_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['text_id'], ['texts.id'], name=op.f('fk_daily_challenges_text_id_texts'), ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('date', name=op.f('pk_daily_challenges'))
    )
    op.create_table('key_stats',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('key', sa.String(length=8), nullable=False),
    sa.Column('presses', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('errors', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('latency_sum_ms', sa.BigInteger(), server_default=sa.text('0'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_key_stats_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'key', name=op.f('pk_key_stats'))
    )
    op.create_table('oauth_accounts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('provider', sa.String(length=16), nullable=False),
    sa.Column('provider_user_id', sa.String(length=64), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_oauth_accounts_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_oauth_accounts')),
    sa.UniqueConstraint('provider', 'provider_user_id', name=op.f('uq_oauth_accounts_provider_provider_user_id'))
    )
    with op.batch_alter_table('oauth_accounts', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_oauth_accounts_user_id'), ['user_id'], unique=False)

    op.create_table('user_achievements',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('achievement_id', sa.Integer(), nullable=False),
    sa.Column('unlocked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['achievement_id'], ['achievements.id'], name=op.f('fk_user_achievements_achievement_id_achievements'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_achievements_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'achievement_id', name=op.f('pk_user_achievements'))
    )
    op.create_table('runs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('mode', sa.String(length=16), nullable=False),
    sa.Column('lang', sa.String(length=16), nullable=False),
    sa.Column('difficulty', sa.SmallInteger(), nullable=False),
    sa.Column('text_id', sa.Integer(), nullable=True),
    sa.Column('track_id', sa.Integer(), nullable=True),
    sa.Column('daily_date', sa.Date(), nullable=True),
    sa.Column('text', sa.Text(), nullable=False),
    sa.Column('duration_ms', sa.Integer(), nullable=False),
    sa.Column('typed_chars', sa.Integer(), nullable=False),
    sa.Column('correct_chars', sa.Integer(), nullable=False),
    sa.Column('errors', sa.Integer(), nullable=False),
    sa.Column('cpm', sa.Float(), nullable=False),
    sa.Column('wpm', sa.Float(), nullable=False),
    sa.Column('accuracy', sa.Float(), nullable=False),
    sa.Column('max_combo', sa.Integer(), nullable=False),
    sa.Column('score', sa.Integer(), nullable=False),
    sa.Column('xp_earned', sa.Integer(), nullable=False),
    sa.Column('keystrokes', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['daily_date'], ['daily_challenges.date'], name=op.f('fk_runs_daily_date_daily_challenges'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['text_id'], ['texts.id'], name=op.f('fk_runs_text_id_texts'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['track_id'], ['tracks.id'], name=op.f('fk_runs_track_id_tracks'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_runs_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_runs'))
    )
    with op.batch_alter_table('runs', schema=None) as batch_op:
        batch_op.create_index('ix_runs_created_at_wpm', ['created_at', 'wpm'], unique=False)
        batch_op.create_index('ix_runs_daily_date_wpm', ['daily_date', 'wpm'], unique=False)
        batch_op.create_index('ix_runs_text_id_wpm', ['text_id', 'wpm'], unique=False)
        batch_op.create_index('ix_runs_track_id_wpm', ['track_id', 'wpm'], unique=False)
        batch_op.create_index('ix_runs_user_id_created_at', ['user_id', 'created_at'], unique=False)

    op.create_table('user_tracks',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('track_id', sa.Integer(), nullable=False),
    sa.Column('cups', sa.SmallInteger(), server_default=sa.text('0'), nullable=False),
    sa.Column('best_run_id', sa.Integer(), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['best_run_id'], ['runs.id'], name=op.f('fk_user_tracks_best_run_id_runs'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['track_id'], ['tracks.id'], name=op.f('fk_user_tracks_track_id_tracks'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_tracks_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'track_id', name=op.f('pk_user_tracks'))
    )


def downgrade():
    op.drop_table('user_tracks')
    with op.batch_alter_table('runs', schema=None) as batch_op:
        batch_op.drop_index('ix_runs_user_id_created_at')
        batch_op.drop_index('ix_runs_track_id_wpm')
        batch_op.drop_index('ix_runs_text_id_wpm')
        batch_op.drop_index('ix_runs_daily_date_wpm')
        batch_op.drop_index('ix_runs_created_at_wpm')

    op.drop_table('runs')
    op.drop_table('user_achievements')
    with op.batch_alter_table('oauth_accounts', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_oauth_accounts_user_id'))

    op.drop_table('oauth_accounts')
    op.drop_table('key_stats')
    op.drop_table('daily_challenges')
    op.drop_table('bigram_stats')
    op.drop_table('users')
    op.drop_table('tracks')
    with op.batch_alter_table('texts', schema=None) as batch_op:
        batch_op.drop_index('ix_texts_mode_lang_difficulty')

    op.drop_table('texts')
    with op.batch_alter_table('garage_items', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_garage_items_slot'))

    op.drop_table('garage_items')
    op.drop_table('achievements')
