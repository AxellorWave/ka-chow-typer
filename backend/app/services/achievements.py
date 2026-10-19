from sqlalchemy import distinct, extract, func, select
from sqlalchemy.dialects.postgresql import insert

from app.extensions import db
from app.models import Achievement, Run, UserAchievement, UserTrack

GOLD_CUPS = 3
TIMEZONE = "Europe/Moscow"


def runs_count(user, condition):
    return func.count(Run.id)


def mode_runs(user, condition):
    return func.count(Run.id).filter(Run.mode == condition["mode"])


def daily_runs(user, condition):
    return func.count(distinct(Run.daily_date))


def total_chars(user, condition):
    return func.sum(Run.correct_chars)


def distinct_langs(user, condition):
    expression = func.count(distinct(Run.lang))
    if "langs" in condition:
        expression = expression.filter(Run.lang.in_(condition["langs"]))
    return expression


def run_metric(user, condition):
    expression = func.max(getattr(Run, condition["metric"]))
    if "min_chars" in condition:
        expression = expression.filter(Run.correct_chars >= condition["min_chars"])
    return expression


def flawless_run(user, condition):
    return func.max(Run.correct_chars).filter(Run.errors == 0)


def night_run(user, condition):
    hour = extract("hour", func.timezone(TIMEZONE, Run.created_at))
    return func.count(Run.id).filter(hour >= condition["from_hour"], hour < condition["to_hour"])


def gold_cups(user, condition):
    return (
        select(func.count())
        .where(UserTrack.user_id == user.id, UserTrack.cups >= GOLD_CUPS)
        .scalar_subquery()
    )


RUN_CHECKS = {
    "runs_count": runs_count,
    "mode_runs": mode_runs,
    "daily_runs": daily_runs,
    "total_chars": total_chars,
    "distinct_langs": distinct_langs,
    "run_metric": run_metric,
    "flawless_run": flawless_run,
    "night_run": night_run,
    "gold_cups": gold_cups,
}

USER_CHECKS = {
    "level": lambda user, condition: user.level,
    "streak": lambda user, condition: max(user.streak_best, user.streak_current),
    "ghost_beaten": lambda user, condition: 0,
}


def progress_values(user, achievements):
    values = {}
    columns = []
    for achievement in achievements:
        condition = achievement.condition
        check_type = condition["type"]
        if check_type in RUN_CHECKS:
            columns.append(RUN_CHECKS[check_type](user, condition).label(achievement.code))
        elif check_type in USER_CHECKS:
            values[achievement.code] = USER_CHECKS[check_type](user, condition)
        else:
            values[achievement.code] = 0
    if columns:
        row = db.session.execute(select(*columns).where(Run.user_id == user.id)).one()
        values.update(row._asdict())
    return {code: int(value or 0) for code, value in values.items()}


def progress(achievement, value):
    target = achievement.condition["threshold"]
    return {"current": min(value, target), "target": target}


def unlocked_dates(user):
    rows = db.session.execute(
        select(UserAchievement.achievement_id, UserAchievement.unlocked_at).where(
            UserAchievement.user_id == user.id
        )
    )
    return dict(rows.all())


def all_achievements():
    return db.session.scalars(
        select(Achievement).order_by(Achievement.sort_order, Achievement.id)
    ).all()


def check_achievements(user, run):
    unlocked = unlocked_dates(user)
    pending = [item for item in all_achievements() if item.id not in unlocked]
    if not pending:
        return []
    values = progress_values(user, pending)
    earned = [item for item in pending if values[item.code] >= item.condition["threshold"]]
    if not earned:
        return []
    statement = (
        insert(UserAchievement)
        .values([{"user_id": user.id, "achievement_id": item.id} for item in earned])
        .on_conflict_do_nothing()
        .returning(UserAchievement.achievement_id)
    )
    inserted = set(db.session.execute(statement).scalars())
    return [
        {
            "code": item.code,
            "title": item.title,
            "description": item.description,
            "icon": item.icon,
        }
        for item in earned
        if item.id in inserted
    ]


def list_achievements(user):
    achievements = all_achievements()
    unlocked = unlocked_dates(user)
    values = progress_values(user, [item for item in achievements if item.id not in unlocked])
    return [
        {
            "code": item.code,
            "title": item.title,
            "description": item.description,
            "icon": item.icon,
            "unlocked": item.id in unlocked,
            "unlocked_at": unlocked.get(item.id),
            "progress": progress(
                item,
                item.condition["threshold"] if item.id in unlocked else values[item.code],
            ),
        }
        for item in achievements
    ]
