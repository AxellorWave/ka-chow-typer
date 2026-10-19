from datetime import datetime, time, timedelta, timezone

from sqlalchemy import func, null, select

from app.extensions import db
from app.models import Run, User

MSK = timezone(timedelta(hours=3))
PERIOD_DAYS = {"day": 1, "week": 7}
MIN_ACCURACY_CHARS = 100


def period_start(period, now=None):
    if period not in PERIOD_DAYS:
        return None
    today = (now or datetime.now(MSK)).astimezone(MSK).date()
    start_date = today - timedelta(days=PERIOD_DAYS[period] - 1)
    return datetime.combine(start_date, time.min, tzinfo=MSK)


def _best_run(value_column, order_by, filters):
    best = (
        select(
            Run.user_id,
            value_column.label("value"),
            Run.wpm.label("wpm"),
            Run.accuracy.label("accuracy"),
            Run.created_at.label("achieved_at"),
        )
        .where(*filters)
        .distinct(Run.user_id)
        .order_by(Run.user_id, *order_by)
        .subquery()
    )
    return best, [best.c.value.desc(), best.c.wpm.desc(), best.c.achieved_at.asc()]


def _wpm(filters):
    return _best_run(Run.wpm, [Run.wpm.desc(), Run.created_at.asc()], filters)


def _accuracy(filters):
    filters = [*filters, Run.correct_chars >= MIN_ACCURACY_CHARS]
    return _best_run(
        Run.accuracy, [Run.accuracy.desc(), Run.wpm.desc(), Run.created_at.asc()], filters
    )


def _xp(filters, start):
    if start is None:
        totals = (
            select(
                User.id.label("user_id"),
                User.xp.label("value"),
                null().label("wpm"),
                null().label("accuracy"),
                User.created_at.label("achieved_at"),
            )
            .where(User.xp > 0)
            .subquery()
        )
    else:
        xp_sum = func.sum(Run.xp_earned)
        totals = (
            select(
                Run.user_id,
                xp_sum.label("value"),
                null().label("wpm"),
                null().label("accuracy"),
                func.max(Run.created_at).label("achieved_at"),
            )
            .where(*filters)
            .group_by(Run.user_id)
            .having(xp_sum > 0)
            .subquery()
        )
    return totals, [totals.c.value.desc(), totals.c.achieved_at.asc()]


def _ranked(metric, period):
    start = period_start(period)
    filters = [Run.created_at >= start] if start is not None else []
    if metric == "xp":
        source, order_by = _xp(filters, start)
    elif metric == "accuracy":
        source, order_by = _accuracy(filters)
    else:
        source, order_by = _wpm(filters)

    return select(
        source,
        func.row_number().over(order_by=[*order_by, source.c.user_id]).label("position"),
    ).subquery()


def _rows(ranked, *conditions):
    query = (
        select(
            ranked.c.position,
            ranked.c.user_id,
            ranked.c.value,
            ranked.c.wpm,
            ranked.c.accuracy,
            ranked.c.achieved_at,
            User.nickname,
            User.avatar_url,
            User.level,
            User.car_config,
        )
        .join(User, User.id == ranked.c.user_id)
        .where(*conditions)
        .order_by(ranked.c.position)
    )
    return [_serialize(row) for row in db.session.execute(query)]


def _round(value):
    return round(float(value), 1) if value is not None else None


def _serialize(row):
    return {
        "position": row.position,
        "user_id": row.user_id,
        "nickname": row.nickname,
        "avatar_url": row.avatar_url,
        "level": row.level,
        "car_config": row.car_config,
        "value": _round(row.value),
        "wpm": _round(row.wpm),
        "accuracy": _round(row.accuracy),
        "achieved_at": row.achieved_at.isoformat() if row.achieved_at else None,
    }


def leaderboard(metric, period, limit, user_id=None):
    ranked = _ranked(metric, period)
    items = _rows(ranked, ranked.c.position <= limit)
    total = db.session.scalar(select(func.count()).select_from(ranked))
    me = None
    if user_id is not None:
        mine = _rows(ranked, ranked.c.user_id == user_id)
        me = mine[0] if mine else None
    start = period_start(period)
    return {
        "metric": metric,
        "period": period,
        "limit": limit,
        "since": start.isoformat() if start else None,
        "total": total,
        "items": items,
        "me": me,
    }
