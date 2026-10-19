import random
import string

from sqlalchemy import func, select

from app.errors import ApiError
from app.extensions import db
from app.models import Text
from app.models.enums import Lang, Mode
from app.services.leveling import MODE_UNLOCK_LEVELS, is_mode_unlocked, max_difficulty

NATURAL_LANGS = (Lang.RU, Lang.EN)
CODE_LANGS = (Lang.PYTHON, Lang.JS, Lang.HTML_CSS)

MODE_LANGS = {
    Mode.WORDS: NATURAL_LANGS,
    Mode.SENTENCES: NATURAL_LANGS,
    Mode.QUOTES: NATURAL_LANGS,
    Mode.SYMBOLS: NATURAL_LANGS,
    Mode.CODE: CODE_LANGS,
}

DEFAULT_LANGS = {
    Mode.WORDS: Lang.RU,
    Mode.SENTENCES: Lang.RU,
    Mode.QUOTES: Lang.RU,
    Mode.SYMBOLS: Lang.RU,
    Mode.CODE: Lang.PYTHON,
}

LENGTH_LIMITS = {
    Mode.WORDS: (25, 100),
    Mode.SENTENCES: (3, 10),
    Mode.SYMBOLS: (20, 100),
}

GUEST_MODES = (Mode.WORDS, Mode.SENTENCES)

WORD_MIN_LENGTH = 2
WORD_MAX_LENGTH = 10

LETTERS = {
    Lang.RU: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    Lang.EN: string.ascii_lowercase,
}
SYMBOL_GROUP_LENGTH = (3, 6)
PUNCTUATION = ".,:;!?-'\""
SPECIAL_CHARS = "()[]{}<>@#$%^&*_+=/\\|~"


def check_access(user, mode, difficulty):
    if user is None:
        if mode not in GUEST_MODES:
            raise ApiError(403, "mode_locked", "Войдите, чтобы открыть этот режим")
        return
    if not is_mode_unlocked(mode, user.level):
        raise ApiError(
            403, "mode_locked", f"Режим откроется на {MODE_UNLOCK_LEVELS[mode]} уровне"
        )
    if difficulty > max_difficulty(user.level):
        raise ApiError(403, "difficulty_locked", "Эта сложность пока закрыта")


def generate_text(mode, lang=None, difficulty=1, length=None):
    mode = Mode(mode)
    lang = Lang(lang or DEFAULT_LANGS[mode])
    if length is None and mode in LENGTH_LIMITS:
        length = LENGTH_LIMITS[mode][0]
    if mode == Mode.WORDS:
        text, text_id = random_words(lang, difficulty, length), None
    elif mode == Mode.SENTENCES:
        text, text_id = random_sentences(lang, difficulty, length)
    elif mode == Mode.SYMBOLS:
        text, text_id = random_symbols(lang, difficulty, length), None
    else:
        record = random_texts(mode, lang, difficulty, 1)[0]
        text, text_id = record.content, record.id
    return {
        "mode": mode.value,
        "lang": lang.value,
        "difficulty": difficulty,
        "text": text,
        "text_id": text_id,
    }


def random_texts(mode, lang, difficulty, limit, *conditions):
    records = db.session.scalars(
        select(Text)
        .where(
            Text.mode == mode.value,
            Text.lang == lang.value,
            Text.difficulty == difficulty,
            *conditions,
        )
        .order_by(func.random())
        .limit(limit)
    ).all()
    if not records:
        raise ApiError(404, "texts_not_found", "Не нашли подходящих текстов")
    return records


def random_words(lang, difficulty, length):
    records = random_texts(
        Mode.WORDS,
        lang,
        difficulty,
        length,
        func.char_length(Text.content).between(WORD_MIN_LENGTH, WORD_MAX_LENGTH),
    )
    return " ".join(record.content for record in records)


def random_sentences(lang, difficulty, length):
    records = random_texts(Mode.SENTENCES, lang, difficulty, length)
    text_id = records[0].id if len(records) == 1 else None
    return " ".join(record.content for record in records), text_id


def symbol_alphabet(lang, difficulty):
    letters = LETTERS[lang]
    alphabet = letters
    if difficulty >= 2:
        alphabet += letters.upper()
    if difficulty >= 3:
        alphabet += string.digits
    if difficulty >= 4:
        alphabet += PUNCTUATION
    if difficulty >= 5:
        alphabet += SPECIAL_CHARS
    return alphabet


def random_symbols(lang, difficulty, length):
    alphabet = symbol_alphabet(lang, difficulty)
    return " ".join(
        "".join(random.choices(alphabet, k=random.randint(*SYMBOL_GROUP_LENGTH)))
        for _ in range(length)
    )
