from datetime import timedelta

from app.services.clock import msk_today


def current_streak(user, today=None):
    today = today or msk_today()
    if user.last_active_date is None or user.last_active_date < today - timedelta(days=1):
        return 0
    return user.streak_current


def update_streak(user, today=None):
    today = today or msk_today()
    if user.last_active_date == today:
        return
    if user.last_active_date == today - timedelta(days=1):
        user.streak_current += 1
    else:
        user.streak_current = 1
    user.streak_best = max(user.streak_best, user.streak_current)
    user.last_active_date = today
