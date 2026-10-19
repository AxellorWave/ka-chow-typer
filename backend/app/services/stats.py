from datetime import timedelta

from sqlalchemy import Date, cast, func, select

from app.extensions import db
from app.models import BigramStat, KeyStat, Run

TIMEZONE = "Europe/Moscow"
MIN_PRESSES = 5
WEAKEST_LIMIT = 10
SLOW_FACTOR = 1.2
WHITESPACE = (" ", "\n", "\t")


def _round(value, digits=1):
    return round(float(value), digits) if value is not None else None


def local_date(column):
    return cast(func.timezone(TIMEZONE, column), Date)


def today():
    return db.session.scalar(select(local_date(func.now())))


def summary(user_id):
    row = db.session.execute(
        select(
            func.count(Run.id),
            func.coalesce(func.sum(Run.duration_ms), 0),
            func.coalesce(func.sum(Run.correct_chars), 0),
            func.coalesce(func.sum(Run.typed_chars), 0),
            func.coalesce(func.sum(Run.errors), 0),
            func.max(Run.wpm),
            func.avg(Run.wpm),
            func.max(Run.cpm),
            func.avg(Run.cpm),
            func.avg(Run.accuracy),
            func.coalesce(func.max(Run.max_combo), 0),
            func.coalesce(func.sum(Run.score), 0),
            func.count(func.distinct(local_date(Run.created_at))),
            func.max(Run.created_at),
        ).where(Run.user_id == user_id)
    ).one()
    (
        runs,
        duration_ms,
        correct_chars,
        typed_chars,
        errors,
        best_wpm,
        avg_wpm,
        best_cpm,
        avg_cpm,
        avg_accuracy,
        max_combo,
        total_score,
        active_days,
        last_run_at,
    ) = row
    return {
        "runs": runs,
        "total_duration_ms": int(duration_ms),
        "total_chars": int(correct_chars),
        "total_typed": int(typed_chars),
        "total_errors": int(errors),
        "best_wpm": _round(best_wpm) or 0,
        "avg_wpm": _round(avg_wpm) or 0,
        "best_cpm": _round(best_cpm) or 0,
        "avg_cpm": _round(avg_cpm) or 0,
        "avg_accuracy": _round(avg_accuracy) or 0,
        "max_combo": max_combo,
        "total_score": int(total_score),
        "active_days": active_days,
        "last_run_at": last_run_at.isoformat() if last_run_at else None,
    }


def progress(user_id, days):
    end = today()
    start = end - timedelta(days=days - 1)
    day = local_date(Run.created_at).label("day")
    rows = db.session.execute(
        select(
            day,
            func.count(Run.id),
            func.avg(Run.wpm),
            func.max(Run.wpm),
            func.avg(Run.accuracy),
            func.sum(Run.errors),
            func.sum(Run.duration_ms),
        )
        .where(Run.user_id == user_id, day >= start, day <= end)
        .group_by(day)
    ).all()
    by_day = {row[0]: row[1:] for row in rows}

    points = []
    for offset in range(days):
        current = start + timedelta(days=offset)
        runs, avg_wpm, best_wpm, avg_accuracy, errors, duration_ms = by_day.get(
            current, (0, None, None, None, 0, 0)
        )
        points.append(
            {
                "date": current.isoformat(),
                "runs": runs,
                "avg_wpm": _round(avg_wpm),
                "best_wpm": _round(best_wpm),
                "avg_accuracy": _round(avg_accuracy),
                "errors": int(errors or 0),
                "duration_ms": int(duration_ms or 0),
            }
        )
    return {"range_days": days, "from": start.isoformat(), "to": end.isoformat(), "points": points}


def _stat_columns(model):
    error_rate = (model.errors * 100.0 / model.presses).label("error_rate")
    avg_latency = (model.latency_sum_ms * 1.0 / model.presses).label("avg_latency_ms")
    return error_rate, avg_latency


def _serialize(name, row):
    value, presses, errors, error_rate, avg_latency = row
    return {
        name: value,
        "presses": presses,
        "errors": errors,
        "error_rate": _round(error_rate),
        "avg_latency_ms": _round(avg_latency, 0),
    }


def _query(model, column, user_id):
    error_rate, avg_latency = _stat_columns(model)
    return select(column, model.presses, model.errors, error_rate, avg_latency).where(
        model.user_id == user_id, model.presses > 0
    )


def weakest(model, column, user_id, limit=WEAKEST_LIMIT, skip_whitespace=True):
    error_rate, avg_latency = _stat_columns(model)
    user_avg_latency = (
        select(func.sum(model.latency_sum_ms) * 1.0 / func.nullif(func.sum(model.presses), 0))
        .where(model.user_id == user_id)
        .scalar_subquery()
    )
    query = _query(model, column, user_id).where(
        model.presses >= MIN_PRESSES,
        (model.errors > 0) | (avg_latency > user_avg_latency * SLOW_FACTOR),
    )
    if skip_whitespace:
        for char in WHITESPACE:
            query = query.where(~column.contains(char))
    return db.session.execute(
        query.order_by(error_rate.desc(), avg_latency.desc()).limit(limit)
    ).all()


def weakest_keys(user_id, limit=WEAKEST_LIMIT):
    return [_serialize("key", row) for row in weakest(KeyStat, KeyStat.key, user_id, limit)]


def weakest_bigrams(user_id, limit=WEAKEST_LIMIT):
    return [
        _serialize("bigram", row)
        for row in weakest(BigramStat, BigramStat.bigram, user_id, limit)
    ]


def keys(user_id):
    rows = db.session.execute(_query(KeyStat, KeyStat.key, user_id).order_by(KeyStat.key)).all()
    return {
        "keys": [_serialize("key", row) for row in rows],
        "weakest_keys": weakest_keys(user_id),
        "weakest_bigrams": weakest_bigrams(user_id),
        "min_presses": MIN_PRESSES,
    }
