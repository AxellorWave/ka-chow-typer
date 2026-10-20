from enum import StrEnum


class Mode(StrEnum):
    WORDS = "words"
    SENTENCES = "sentences"
    QUOTES = "quotes"
    CODE = "code"
    SYMBOLS = "symbols"


class Lang(StrEnum):
    RU = "ru"
    EN = "en"
    PYTHON = "python"
    JS = "js"
    HTML_CSS = "html_css"


class OAuthProvider(StrEnum):
    VK = "vk"
    YANDEX = "yandex"


class GarageSlot(StrEnum):
    HERO = "hero"
    COLOR = "color"
    DECAL = "decal"
    WHEELS = "wheels"
    SPOILER = "spoiler"


class UnlockType(StrEnum):
    DEFAULT = "default"
    LEVEL = "level"
    ACHIEVEMENT = "achievement"
