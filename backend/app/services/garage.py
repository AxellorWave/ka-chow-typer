from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models import Achievement, GarageItem, UserAchievement
from app.models.enums import GarageSlot, UnlockType

SLOTS = [slot.value for slot in GarageSlot]

DEFAULT_CONFIG = {
    GarageSlot.COLOR.value: "color_red",
    GarageSlot.DECAL.value: "decal_bolt",
    GarageSlot.WHEELS.value: "wheels_stock",
    GarageSlot.SPOILER.value: "spoiler_none",
}


def _achievement_titles():
    return dict(db.session.execute(select(Achievement.code, Achievement.title)).all())


def _user_achievement_codes(user):
    return set(
        db.session.scalars(
            select(Achievement.code)
            .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
            .where(UserAchievement.user_id == user.id)
        )
    )


def _is_unlocked(item, level, achievements):
    if item.unlock_type == UnlockType.LEVEL:
        return level >= int(item.unlock_value)
    if item.unlock_type == UnlockType.ACHIEVEMENT:
        return item.unlock_value in achievements
    return True


def _unlock_label(item, titles):
    if item.unlock_type == UnlockType.LEVEL:
        return f"Уровень {item.unlock_value}"
    if item.unlock_type == UnlockType.ACHIEVEMENT:
        return f"Ачивка {titles.get(item.unlock_value, item.unlock_value)}"
    return "Открыт"


def _items():
    return db.session.scalars(select(GarageItem).order_by(GarageItem.sort_order, GarageItem.id)).all()


def current_config(user, items_by_code):
    saved = user.car_config or {}
    config = dict(DEFAULT_CONFIG)
    for slot in SLOTS:
        item = items_by_code.get(saved.get(slot))
        if item is not None and item.slot == slot:
            config[slot] = item.code
    return config


def garage_payload(user):
    items = _items()
    titles = _achievement_titles()
    achievements = _user_achievement_codes(user)
    by_code = {item.code: item for item in items}
    return {
        "config": current_config(user, by_code),
        "slots": [
            {
                "slot": slot,
                "items": [
                    {
                        "code": item.code,
                        "title": item.title,
                        "asset": item.asset,
                        "unlocked": _is_unlocked(item, user.level, achievements),
                        "unlock": {
                            "type": item.unlock_type,
                            "value": item.unlock_value,
                            "label": _unlock_label(item, titles),
                        },
                    }
                    for item in items
                    if item.slot == slot
                ],
            }
            for slot in SLOTS
        ],
    }


def update_garage(user, patch):
    db.session.refresh(user, with_for_update=True)
    items = {item.code: item for item in _items()}
    achievements = _user_achievement_codes(user)
    titles = _achievement_titles()
    for slot, code in patch.items():
        item = items.get(code)
        if item is None or item.slot != slot:
            raise ApiError(
                400,
                "validation_error",
                "Такой детали нет в гараже",
                {slot: ["Такой детали нет в этом слоте"]},
            )
        if not _is_unlocked(item, user.level, achievements):
            raise ApiError(403, "item_locked", f"«{item.title}» ещё не открыт: {_unlock_label(item, titles)}")
    user.car_config = {**current_config(user, items), **patch}
    db.session.commit()
    return {"config": user.car_config}
