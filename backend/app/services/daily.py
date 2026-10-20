import random
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.errors import ApiError
from app.extensions import db
from app.models import DailyChallenge, Run, Text, User
from app.models.enums import Lang, Mode
from app.schemas.runs import MAX_DURATION_MS
from app.services.clock import msk_day_end, msk_now, msk_today

DAILY_TEXT_MODE = "daily"
DAILY_MODE = Mode.SENTENCES
DAILY_LANG = Lang.RU
DAILY_DIFFICULTY = 2
SENTENCES_PER_DAY = 3
LATE_FINISH_WINDOW = timedelta(milliseconds=MAX_DURATION_MS)


def compose_text(day):
    candidates = db.session.scalars(
        select(Text.content)
        .where(
            Text.mode == DAILY_MODE.value,
            Text.lang == DAILY_LANG.value,
            Text.difficulty == DAILY_DIFFICULTY,
        )
        .order_by(Text.id)
    ).all()
    if len(candidates) < SENTENCES_PER_DAY:
        raise ApiError(503, "daily_unavailable", "Заезд дня пока недоступен")
    return " ".join(random.Random(day.toordinal()).sample(candidates, SENTENCES_PER_DAY))


def get_challenge(day, create=True):
    challenge = db.session.get(DailyChallenge, day)
    if challenge is not None or not create:
        return challenge

    content = compose_text(day)
    db.session.execute(
        insert(Text)
        .values(
            mode=DAILY_TEXT_MODE,
            lang=DAILY_LANG.value,
            difficulty=DAILY_DIFFICULTY,
            content=content,
        )
        .on_conflict_do_nothing(index_elements=[Text.mode, Text.lang, Text.content])
    )
    text_id = db.session.scalar(
        select(Text.id).where(
            Text.mode == DAILY_TEXT_MODE, Text.lang == DAILY_LANG.value, Text.content == content
        )
    )
    db.session.execute(
        insert(DailyChallenge)
        .values(date=day, text_id=text_id)
        .on_conflict_do_nothing(index_elements=[DailyChallenge.date])
    )
    db.session.commit()
    return db.session.get(DailyChallenge, day)


def _leader(day):
    row = db.session.execute(
        select(User.nickname, Run.wpm)
        .join(User, User.id == Run.user_id)
        .where(Run.daily_date == day)
        .order_by(Run.wpm.desc(), Run.created_at.asc())
        .limit(1)
    ).first()
    return {"nickname": row.nickname, "wpm": round(row.wpm, 1)} if row else None


def _my_results(day, user):
    attempts = db.session.scalar(
        select(func.count(Run.id)).where(Run.daily_date == day, Run.user_id == user.id)
    )
    best = db.session.execute(
        select(Run.wpm, Run.accuracy)
        .where(Run.daily_date == day, Run.user_id == user.id)
        .order_by(Run.wpm.desc(), Run.created_at.asc())
        .limit(1)
    ).first()
    return {
        "attempts": attempts,
        "best_wpm": round(best.wpm, 1) if best else None,
        "best_accuracy": round(best.accuracy, 1) if best else None,
    }


def daily_payload(user=None):
    day = msk_today()
    challenge = get_challenge(day)
    return {
        "date": day.isoformat(),
        "ends_at": msk_day_end(day).isoformat(),
        "text": {
            "text_id": challenge.text_id,
            "mode": DAILY_MODE.value,
            "lang": DAILY_LANG.value,
            "difficulty": DAILY_DIFFICULTY,
            "text": challenge.text.content,
        },
        "leader": _leader(day),
        "me": _my_results(day, user) if user is not None else None,
    }


def is_daily_open(day):
    return day <= msk_today() and msk_now() < msk_day_end(day) + LATE_FINISH_WINDOW


def validate_daily_run(data):
    day = data["daily_date"]
    if not is_daily_open(day):
        raise ApiError(400, "daily_closed", "Этот заезд дня уже закончился")
    challenge = get_challenge(day, create=False)
    if challenge is None:
        raise ApiError(404, "daily_not_found", "Ежедневное испытание не найдено")
    expected = (challenge.text_id, DAILY_MODE, DAILY_LANG, DAILY_DIFFICULTY)
    actual = (data["text_id"], data["mode"], data["lang"], data["difficulty"])
    if actual != expected or data["text"] != challenge.text.content:
        raise ApiError(400, "daily_mismatch", "Текст заезда не совпадает с заездом дня")
