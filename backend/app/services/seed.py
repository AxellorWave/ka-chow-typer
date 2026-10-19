import json
from pathlib import Path

from sqlalchemy import literal_column
from sqlalchemy.dialects.postgresql import insert

from app.extensions import db
from app.models import Achievement, GarageItem, Text, Track
from app.models.enums import GarageSlot, Lang, Mode, UnlockType

SEEDS_DIR = Path(__file__).resolve().parent.parent / "seeds"

TEXT_FILES = (
    "words_ru.json",
    "words_en.json",
    "sentences_ru.json",
    "sentences_en.json",
    "quotes_cars.json",
    "code_python.json",
    "code_js.json",
    "code_html_css.json",
)


def load_json(filename):
    with open(SEEDS_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


def upsert(model, rows, conflict_columns):
    if not rows:
        return 0, 0
    stmt = insert(model).values(rows)
    update_columns = {
        column: stmt.excluded[column] for column in rows[0] if column not in conflict_columns
    }
    stmt = stmt.on_conflict_do_update(index_elements=conflict_columns, set_=update_columns)
    stmt = stmt.returning(literal_column("xmax = 0"))
    flags = db.session.execute(stmt).scalars().all()
    inserted = sum(flags)
    return inserted, len(flags) - inserted


def text_rows():
    rows = {}
    for filename in TEXT_FILES:
        data = load_json(filename)
        mode = Mode(data["mode"])
        for item in data["items"]:
            lang = Lang(item.get("lang", data.get("lang")))
            difficulty = int(item["difficulty"])
            if not 1 <= difficulty <= 5:
                raise ValueError(f"{filename}: difficulty {difficulty} is out of range 1-5")
            rows[(mode, lang, item["content"])] = {
                "mode": mode.value,
                "lang": lang.value,
                "difficulty": difficulty,
                "content": item["content"],
            }
    return list(rows.values())


def achievement_rows():
    return [
        {
            "code": item["code"],
            "title": item["title"],
            "description": item["description"],
            "icon": item.get("icon"),
            "condition": item["condition"],
            "sort_order": index,
        }
        for index, item in enumerate(load_json("achievements.json"), start=1)
    ]


def track_rows():
    rows = []
    for index, item in enumerate(load_json("tracks.json"), start=1):
        if len(item["cup_requirements"]) != 3:
            raise ValueError(f"track {item['code']}: expected 3 cup requirements")
        rows.append(
            {
                "code": item["code"],
                "title": item["title"],
                "description": item.get("description"),
                "sort_order": index,
                "mode": Mode(item["mode"]).value,
                "lang": Lang(item["lang"]).value,
                "difficulty": item["difficulty"],
                "min_level": item.get("min_level", 1),
                "cup_requirements": item["cup_requirements"],
            }
        )
    return rows


def garage_rows(achievement_codes):
    rows = []
    for index, item in enumerate(load_json("garage.json"), start=1):
        unlock_type = UnlockType(item.get("unlock_type", UnlockType.DEFAULT))
        if unlock_type == UnlockType.ACHIEVEMENT and item["unlock_value"] not in achievement_codes:
            raise ValueError(f"garage item {item['code']}: unknown achievement {item['unlock_value']}")
        rows.append(
            {
                "code": item["code"],
                "slot": GarageSlot(item["slot"]).value,
                "title": item["title"],
                "asset": item.get("asset"),
                "unlock_type": unlock_type.value,
                "unlock_value": item.get("unlock_value"),
                "sort_order": index,
            }
        )
    return rows


def run_seed():
    achievements = achievement_rows()
    achievement_codes = {row["code"] for row in achievements}
    try:
        report = {
            "texts": upsert(Text, text_rows(), ["mode", "lang", "content"]),
            "achievements": upsert(Achievement, achievements, ["code"]),
            "tracks": upsert(Track, track_rows(), ["code"]),
            "garage_items": upsert(GarageItem, garage_rows(achievement_codes), ["code"]),
        }
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
    return report
