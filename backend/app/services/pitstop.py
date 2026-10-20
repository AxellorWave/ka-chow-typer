import random
from itertools import cycle

from sqlalchemy import func, select

from app.extensions import db
from app.models import Run, Text
from app.models.enums import Lang, Mode
from app.services import stats
from app.services.texts import (
    LENGTH_LIMITS,
    LETTERS,
    NATURAL_LANGS,
    WORD_MAX_LENGTH,
    WORD_MIN_LENGTH,
    random_words,
)

PITSTOP_LANGS = NATURAL_LANGS
FOCUS_LIMIT = 8
CANDIDATES_LIMIT = 50
TARGET_SECONDS = 45
DEFAULT_CPM = 200
MIN_CHARS = 150
MAX_CHARS = 450
DRILL_TARGETS = 3
DRILL_REPEATS = 3
WORDS_BETWEEN_DRILLS = 6


def pitstop_text(user, lang):
    lang = Lang(lang)
    target = target_chars(user.id)
    focus = {
        "keys": focus_items(stats.weakest_keys(user.id, CANDIDATES_LIMIT), "key", lang),
        "bigrams": focus_items(stats.weakest_bigrams(user.id, CANDIDATES_LIMIT), "bigram", lang),
    }
    fallback = not focus["keys"] and not focus["bigrams"]
    if fallback:
        text = fit_length(random_words(lang, 1, LENGTH_LIMITS[Mode.WORDS][1]).split(), target)
    else:
        text = focus_text(focus, lang, target)
    return {
        "mode": Mode.WORDS.value,
        "lang": lang.value,
        "difficulty": 1,
        "text_id": None,
        "text": text,
        "focus": focus,
        "fallback": fallback,
    }


def target_chars(user_id):
    avg_cpm = db.session.scalar(select(func.avg(Run.cpm)).where(Run.user_id == user_id))
    cpm = float(avg_cpm) if avg_cpm else DEFAULT_CPM
    return max(MIN_CHARS, min(MAX_CHARS, round(cpm * TARGET_SECONDS / 60)))


def focus_items(items, field, lang):
    letters = LETTERS[lang]
    return [item for item in items if all(char in letters for char in item[field])][:FOCUS_LIMIT]


def focus_weights(focus):
    weights = {}
    for field, items in (("key", focus["keys"]), ("bigram", focus["bigrams"])):
        for item in items:
            weights[item[field]] = item["error_rate"] + 1
    return weights


def dictionary(lang):
    return db.session.scalars(
        select(Text.content)
        .where(
            Text.mode == Mode.WORDS.value,
            Text.lang == lang.value,
            func.char_length(Text.content).between(WORD_MIN_LENGTH, WORD_MAX_LENGTH),
        )
        .distinct()
    ).all()


def weighted_words(words, weights):
    scored = []
    for word in words:
        score = sum(weight * word.count(pattern) for pattern, weight in weights.items())
        if score > 0:
            scored.append((random.random() ** (1 / score), word))
    scored.sort(reverse=True)
    return [word for _, word in scored] or random.sample(words, len(words))


def drills(focus):
    patterns = [item["bigram"] for item in focus["bigrams"]] + [
        item["key"] * 2 for item in focus["keys"]
    ]
    return [" ".join([pattern] * DRILL_REPEATS) for pattern in patterns[:DRILL_TARGETS]]


def fit_length(parts, target):
    result = []
    length = 0
    for part in parts:
        if length >= target:
            break
        result.append(part)
        length += len(part) + 1
    return " ".join(result)


def with_drills(words, pending):
    words_since_drill = 0
    for word in words:
        if pending and words_since_drill == WORDS_BETWEEN_DRILLS:
            yield pending.pop(0)
            words_since_drill = 0
        yield word
        words_since_drill += 1


def focus_text(focus, lang, target):
    words = cycle(weighted_words(dictionary(lang), focus_weights(focus)))
    return fit_length(with_drills(words, drills(focus)), target)
