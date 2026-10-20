from sqlalchemy import func, select

from app.errors import ApiError
from app.extensions import db
from app.models import Run, Track, UserTrack
from app.services.texts import generate_text

CUPS_PER_TRACK = 3


def all_tracks():
    return db.session.scalars(select(Track).order_by(Track.sort_order, Track.id)).all()


def get_track(track_id):
    track = db.session.get(Track, track_id)
    if track is None:
        raise ApiError(404, "track_not_found", "Трасса не найдена")
    return track


def user_cups(user):
    if user is None:
        return {}
    rows = db.session.execute(
        select(UserTrack.track_id, UserTrack.cups).where(UserTrack.user_id == user.id)
    )
    return dict(rows.all())


def user_best_wpm(user):
    if user is None:
        return {}
    rows = db.session.execute(
        select(Run.track_id, func.max(Run.wpm))
        .where(Run.user_id == user.id, Run.track_id.is_not(None))
        .group_by(Run.track_id)
    )
    return dict(rows.all())


def lock_reason(user, track, previous_cups):
    if previous_cups is None:
        return None
    if previous_cups < 1:
        return "previous"
    if (user.level if user else 1) < track.min_level:
        return "level"
    return None


def career(user):
    cups = user_cups(user)
    best_wpm = user_best_wpm(user)
    items = []
    previous_cups = None
    for track in all_tracks():
        reason = lock_reason(user, track, previous_cups)
        previous_cups = cups.get(track.id, 0)
        items.append(
            {
                "id": track.id,
                "code": track.code,
                "title": track.title,
                "description": track.description,
                "sort_order": track.sort_order,
                "mode": track.mode,
                "lang": track.lang,
                "difficulty": track.difficulty,
                "min_level": track.min_level,
                "cup_requirements": track.cup_requirements,
                "cups": previous_cups,
                "best_wpm": best_wpm.get(track.id),
                "unlocked": reason is None,
                "lock_reason": reason,
            }
        )
    return {
        "items": items,
        "total_cups": sum(item["cups"] for item in items),
        "max_cups": len(items) * CUPS_PER_TRACK,
    }


def check_track_unlocked(user, track):
    tracks = all_tracks()
    index = next(i for i, item in enumerate(tracks) if item.id == track.id)
    previous = tracks[index - 1] if index > 0 else None
    previous_cups = user_cups(user).get(previous.id, 0) if previous else None
    reason = lock_reason(user, track, previous_cups)
    if reason == "previous":
        raise ApiError(403, "track_locked", f"Сначала возьмите бронзу на трассе «{previous.title}»")
    if reason == "level":
        raise ApiError(403, "track_locked", f"Трасса откроется на {track.min_level} уровне")


def track_text(user, track_id):
    track = get_track(track_id)
    check_track_unlocked(user, track)
    return generate_text(track.mode, track.lang, track.difficulty)
