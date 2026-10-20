from sqlalchemy import func, select

from app.errors import ApiError
from app.extensions import db
from app.models import Run, Text
from app.services.tracks import get_track

MAX_TIMELINE_POINTS = 200


def ghost_not_found():
    return ApiError(404, "ghost_not_found", "Призрака для этого заезда пока нет")


def completed_run():
    return Run.correct_chars == func.char_length(Run.text)


def find_ghost(user, who, text_id, track_id):
    query = select(Run).where(completed_run())
    if track_id is not None:
        get_track(track_id)
        query = query.where(Run.track_id == track_id)
    else:
        if db.session.get(Text, text_id) is None:
            raise ApiError(404, "text_not_found", "Текст не найден")
        query = query.where(Run.text_id == text_id)
    if who == "self":
        query = query.where(Run.user_id == user.id)
    run = db.session.scalars(
        query.order_by(Run.wpm.desc(), Run.duration_ms, Run.id).limit(1)
    ).first()
    if run is None:
        raise ghost_not_found()
    return run


def thin(points, limit):
    if len(points) <= limit:
        return points
    step = (len(points) - 1) / (limit - 1)
    return [points[round(index * step)] for index in range(limit)]


def build_timeline(run):
    length = len(run.text)
    points = [[0, 0.0]]
    correct = 0
    for _, t_ms, ok in run.keystrokes:
        if ok:
            correct += 1
            points.append([round(t_ms), round(correct / length, 4)])
    points.append([run.duration_ms, 1.0])
    return thin(points, MAX_TIMELINE_POINTS)


def ghost(user, who, text_id, track_id):
    run = find_ghost(user, who, text_id, track_id)
    return {
        "run_id": run.id,
        "who": who,
        "user": {"nickname": run.user.nickname, "car_config": run.user.car_config},
        "wpm": run.wpm,
        "duration_ms": run.duration_ms,
        "timeline": build_timeline(run),
    }


def get_ghost_run(run_id):
    run = db.session.scalars(select(Run).where(Run.id == run_id, completed_run())).first()
    if run is None:
        raise ghost_not_found()
    return run


def ghost_matches(ghost_run, data):
    if data["track_id"] is not None:
        return ghost_run.track_id == data["track_id"]
    return data["text_id"] is not None and ghost_run.text_id == data["text_id"]


def check_ghost_beaten(data, ghost_run_id):
    if ghost_run_id is None:
        return False
    ghost_run = get_ghost_run(ghost_run_id)
    if not ghost_matches(ghost_run, data):
        raise ApiError(400, "ghost_mismatch", "Призрак проехал другой текст или трассу")
    completed = data["correct_chars"] == len(data["text"])
    return completed and data["duration_ms"] < ghost_run.duration_ms
