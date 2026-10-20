from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.errors import ApiError
from app.extensions import db
from app.models import BigramStat, KeyStat, Run, Text, Track, UserTrack
from app.services.achievements import check_achievements
from app.services.daily import validate_daily_run
from app.services.leveling import add_xp, run_xp, xp_for_level
from app.services.streaks import update_streak
from app.services.texts import check_access
from app.services.tracks import check_track_unlocked, get_track

POINTS_PER_CHAR = 10
MAX_COMBO_MULTIPLIER = 5
MAX_BONUS_MULTIPLIER = 1.5


def save_run(user, data):
    db.session.refresh(user, with_for_update=True)
    if data["daily_date"] is not None:
        validate_daily_run(data)
    elif data["track_id"] is None:
        check_access(user, data["mode"], data["difficulty"])
    validate_references(user, data)
    aggregates = aggregate_keystrokes(data["text"], data["keystrokes"])
    validate_totals(data, aggregates)

    xp_earned = run_xp(data["score"])
    progress = add_xp(user.xp, xp_earned)
    user.xp, user.level = progress.xp, progress.level

    run = Run(
        user_id=user.id,
        mode=data["mode"].value,
        lang=data["lang"].value,
        xp_earned=xp_earned,
        **{key: value for key, value in data.items() if key not in ("mode", "lang")},
    )
    db.session.add(run)
    db.session.flush()

    upsert_stats(KeyStat, KeyStat.key, user.id, aggregates.keys)
    upsert_stats(BigramStat, BigramStat.bigram, user.id, aggregates.bigrams)
    cups = update_cups(user, run)
    update_streak(user)
    new_achievements = check_achievements(user, run)
    db.session.commit()

    return {
        "run_id": run.id,
        "xp_earned": xp_earned,
        "xp": progress.xp,
        "level": progress.level,
        "level_up": progress.level_up,
        "levels_gained": progress.levels_gained,
        "xp_to_next": progress.xp_to_next,
        "level_xp": xp_for_level(progress.level),
        "next_level_xp": xp_for_level(progress.level + 1),
        "new_achievements": new_achievements,
        "cups": cups,
    }


def validate_references(user, data):
    if data["text_id"] is not None and db.session.get(Text, data["text_id"]) is None:
        raise ApiError(404, "text_not_found", "Текст не найден")
    if data["track_id"] is None:
        return
    track = get_track(data["track_id"])
    if (track.mode, track.lang, track.difficulty) != (
        data["mode"].value,
        data["lang"].value,
        data["difficulty"],
    ):
        raise ApiError(400, "track_mismatch", "Параметры заезда не совпадают с трассой")
    check_track_unlocked(user, track)


class KeystrokeAggregates:
    def __init__(self):
        self.keys = defaultdict(lambda: [0, 0, 0])
        self.bigrams = defaultdict(lambda: [0, 0, 0])
        self.correct = 0
        self.errors = 0

    @staticmethod
    def add(stats, key, ok, latency):
        entry = stats[key]
        entry[0] += 1
        entry[1] += 0 if ok else 1
        entry[2] += latency


def aggregate_keystrokes(text, keystrokes):
    aggregates = KeystrokeAggregates()
    position = 0
    previous_ms = 0
    for char, t_ms, ok in keystrokes:
        if position >= len(text):
            raise ApiError(400, "run_mismatch", "Нажатий больше, чем символов в тексте")
        expected = text[position]
        if ok and char != expected:
            raise ApiError(400, "run_mismatch", "Нажатия не совпадают с текстом")
        if t_ms < previous_ms:
            raise ApiError(400, "run_mismatch", "Время нажатий должно возрастать")
        latency = round(t_ms - previous_ms)
        previous_ms = t_ms
        aggregates.add(aggregates.keys, expected, ok, latency)
        if position > 0:
            aggregates.add(aggregates.bigrams, text[position - 1] + expected, ok, latency)
        if ok:
            aggregates.correct += 1
            position += 1
        else:
            aggregates.errors += 1
    return aggregates


def validate_totals(data, aggregates):
    if (aggregates.correct, aggregates.errors) != (data["correct_chars"], data["errors"]):
        raise ApiError(400, "run_mismatch", "Метрики не совпадают с нажатиями")
    max_score = (
        data["correct_chars"] * POINTS_PER_CHAR * MAX_COMBO_MULTIPLIER * MAX_BONUS_MULTIPLIER
    )
    if data["score"] > max_score:
        raise ApiError(400, "run_mismatch", "Очков больше, чем возможно за заезд")


def upsert_stats(model, key_column, user_id, stats):
    if not stats:
        return
    rows = [
        {
            "user_id": user_id,
            key_column.key: key,
            "presses": presses,
            "errors": errors,
            "latency_sum_ms": latency,
        }
        for key, (presses, errors, latency) in stats.items()
    ]
    statement = insert(model).values(rows)
    db.session.execute(
        statement.on_conflict_do_update(
            index_elements=[model.user_id, key_column],
            set_={
                "presses": model.presses + statement.excluded.presses,
                "errors": model.errors + statement.excluded.errors,
                "latency_sum_ms": model.latency_sum_ms + statement.excluded.latency_sum_ms,
            },
        )
    )


def earned_cups(track, run):
    cups = 0
    for requirement in track.cup_requirements:
        if run.wpm < requirement["wpm"] or run.accuracy < requirement["accuracy"]:
            break
        cups += 1
    return cups


def update_cups(user, run):
    if run.track_id is None:
        return None
    track = db.session.get(Track, run.track_id)
    cups = earned_cups(track, run)
    record = db.session.get(UserTrack, (user.id, track.id), with_for_update=True)
    if record is None:
        record = UserTrack(user_id=user.id, track_id=track.id, cups=0)
        db.session.add(record)
    previous = record.cups
    best_wpm = (
        db.session.scalar(select(Run.wpm).where(Run.id == record.best_run_id))
        if record.best_run_id
        else None
    )
    if best_wpm is None or cups > previous or run.wpm > best_wpm:
        record.best_run_id = run.id
    record.cups = max(previous, cups)
    return {"track_id": track.id, "cups": record.cups, "new_cups": record.cups - previous}


def list_runs(user, limit, offset):
    query = select(Run).where(Run.user_id == user.id)
    total = db.session.scalar(select(func.count()).select_from(query.subquery()))
    runs = db.session.scalars(
        query.order_by(Run.created_at.desc(), Run.id.desc()).limit(limit).offset(offset)
    ).all()
    return runs, total
