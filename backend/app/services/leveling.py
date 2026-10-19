import math
from dataclasses import dataclass

from app.models.enums import Mode

XP_BASE = 100
XP_EXPONENT = 1.5
SCORE_PER_XP = 10

MODE_UNLOCK_LEVELS = {
    Mode.WORDS: 1,
    Mode.SENTENCES: 3,
    Mode.QUOTES: 3,
    Mode.SYMBOLS: 5,
    Mode.CODE: 7,
}

DIFFICULTY_UNLOCK_LEVELS = {
    1: 1,
    2: 1,
    3: 8,
    4: 10,
    5: 12,
}


@dataclass(frozen=True)
class LevelProgress:
    xp: int
    level: int
    previous_level: int
    xp_to_next: int

    @property
    def level_up(self):
        return self.level > self.previous_level

    @property
    def levels_gained(self):
        return self.level - self.previous_level


def xp_for_level(level):
    if level <= 1:
        return 0
    return math.ceil(XP_BASE * level**XP_EXPONENT)


def level_for_xp(xp):
    level = 1
    while xp >= xp_for_level(level + 1):
        level += 1
    return level


def xp_to_next_level(xp):
    return xp_for_level(level_for_xp(xp) + 1) - xp


def run_xp(score, multiplier=1):
    return max(0, math.floor(score * multiplier / SCORE_PER_XP))


def add_xp(xp, gained):
    total = xp + max(0, gained)
    return LevelProgress(
        xp=total,
        level=level_for_xp(total),
        previous_level=level_for_xp(xp),
        xp_to_next=xp_to_next_level(total),
    )


def unlocked_modes(level):
    return [mode.value for mode, required in MODE_UNLOCK_LEVELS.items() if level >= required]


def is_mode_unlocked(mode, level):
    return level >= MODE_UNLOCK_LEVELS[Mode(mode)]


def max_difficulty(level):
    return max(
        difficulty for difficulty, required in DIFFICULTY_UNLOCK_LEVELS.items() if level >= required
    )
