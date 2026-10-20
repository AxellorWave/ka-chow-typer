from sqlalchemy import and_, func

from app.models import Run

MIN_RANKED_CHARS = 20


def is_ranked(text, correct_chars):
    return correct_chars == len(text) and correct_chars >= MIN_RANKED_CHARS


def ranked_run():
    return and_(
        Run.correct_chars == func.char_length(Run.text), Run.correct_chars >= MIN_RANKED_CHARS
    )
