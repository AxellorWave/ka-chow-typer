import argparse
import bz2
import html
import json
import math
import random
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

from spylls.hunspell import Dictionary

ROOT = Path(__file__).resolve().parent.parent
SEEDS_DIR = ROOT / "backend" / "app" / "seeds"
USER_AGENT = "ka-chow-typer-seed/1.0"

LANGS = ("ru", "en")
HUNSPELL = {"ru": "/usr/share/hunspell/ru_RU", "en": "/usr/share/hunspell/en_US"}
FREQUENCY_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/{lang}/{lang}_50k.txt"
TATOEBA_URL = "https://downloads.tatoeba.org/exports/per_language/{code}/{code}_sentences.tsv.bz2"
TATOEBA_CODES = {"ru": "rus", "en": "eng"}
GUTENBERG_URL = "https://www.gutenberg.org/cache/epub/{id}/pg{id}.txt"
WIKISOURCE_API = "https://ru.wikisource.org/w/api.php"

GUTENBERG_BOOKS = (
    11, 12, 16, 35, 36, 46, 55, 74, 76, 84, 98, 120, 158, 161, 219, 345,
    768, 1260, 1342, 1400, 1661, 2591, 2701, 1952, 514, 271, 113, 1184,
)
WIKISOURCE_WORKS = (
    "Каштанка (Чехов)",
    "Толстый и тонкий (Чехов)",
    "Хамелеон (Чехов)",
    "Ванька (Чехов)",
    "Человек в футляре (Чехов)",
    "Крыжовник (Чехов)",
    "О любви (Чехов)",
    "Дама с собачкой (Чехов)",
    "Степь (Чехов)",
    "Дом с мезонином (Чехов)",
    "Ионыч (Чехов)",
    "Попрыгунья (Чехов)",
    "Белолобый (Чехов)",
    "Мальчики (Чехов)",
    "Лошадиная фамилия (Чехов)",
    "Капитанская дочка (Пушкин)",
    "Повести покойного Ивана Петровича Белкина (Пушкин)",
    "Дубровский (Пушкин)",
    "Пиковая дама (Пушкин)",
    "Муму (Тургенев)",
    "Ася (Тургенев)",
    "Первая любовь (Тургенев)",
    "Записки охотника (Тургенев)",
    "Отцы и дети (Тургенев)",
    "Кавказский пленник (Толстой)",
    "После бала (Толстой)",
    "Детство (Толстой)",
    "Шинель (Гоголь)",
    "Нос (Гоголь)",
    "Тарас Бульба (Гоголь)",
    "Мёртвые души (Гоголь)",
    "Герой нашего времени (Лермонтов)",
    "Левша (Лесков)",
    "Олеся (Куприн)",
    "Белый пудель (Куприн)",
    "Гранатовый браслет (Куприн)",
    "Белые ночи (Достоевский)",
    "Обломов (Гончаров)",
    "Чёрная курица, или Подземные жители (Погорельский)",
    "Аленький цветочек (Аксаков)",
)

LETTERS = {"ru": "абвгдеёжзийклмнопрстуфхцчшщъыьэюя", "en": "abcdefghijklmnopqrstuvwxyz"}
SENTENCE_EXTRA_CHARS = " .,!?:;-'\"()0123456789"
REPLACEMENTS = (
    ("—", "-"), ("–", "-"), ("−", "-"), ("«", '"'), ("»", '"'), ("„", '"'),
    ("“", '"'), ("”", '"'), ("‘", "'"), ("’", "'"), ("…", "..."), (" ", " "),
    ("́", ""),
)

PROFANITY = {
    "ru": re.compile(
        r"ху[йяеёию]|пи[зс]д|пезд|бля|^(за|у|вы|по|на|от|до|при|раз|въ|отъ|съ|подъ|разъ|недо|про)?[её]б"
        r"|мудак|мудил|муда|^сук(а|и|у|ой|е|ам|ами|ах)?$|сучар|сучь|сучонок|говн|дерьм|жоп|^с[рс]а[тлн]"
        r"|сру|засран|обосра|шлюх|пидор|пидар|педик|педераст|г[ао]ндон|залуп|^манд|дроч|трах|шалав"
        r"|ублюд|^хер|нахер|похер|херн|секс|порн|проститут|насил|^жид|чурк|^хач|минет|оргазм|сперм|шлюш|педофил"
        r"|наркот|героин|кокаин|анал$|сиськ|сись|титьк|задниц|потаскух|сволоч|мразь|мраз[иью]|урод"
    ),
    "en": re.compile(
        r"fuck|shit|bitch|cunt|^dick(s|head)?$|^cock(s|sucker)?$|puss(y|ies)|whore|slut|bastard|^ass(es|hole|holes)?$"
        r"|goddamn|^damn|^crap|^piss|^fag|nigg|porn|^sex|rape|dildo|boob|^tits?$|penis|vagina|horny|bollock|wank"
        r"|twat|prick|retard|spastic|crackhead|cocaine|heroin|nazi|orgasm|sperm|hooker|bloody|bugger|^pee|clit|thong"
    ),
}
FREQUENT_NAMES = {
    "ru": re.compile(r"\b(Том|Тома|Тому|Томом|Томе|Мэри|Мэрри|Джон|Джона|Джону|Джоном|Алис|Сами|Лейла)\w*"),
    "en": re.compile(r"\b(Tom|Mary|John|Alice|Sami|Layla)\b"),
}
NAMES_SHARE = 0.1
ABBREVIATIONS = re.compile(r"\b(Mr|Mrs|Dr|St|Mt|Jr|Sr|vs|etc|т|г|гг|см|др|ст|им)\.$")

WORD_MIN_LENGTH = 2
WORD_MAX_LENGTH = 10
SHORT_WORD_LENGTH = 2
SHORT_WORD_MAX_RANK = 300
SENTENCE_MIN_LENGTH = 20
SENTENCE_MAX_LENGTH = 130
SENTENCE_LENGTH_STEPS = (40, 55, 70, 90)
TATOEBA_PER_DIFFICULTY = 900
LIBRARY_PER_DIFFICULTY = 400
DIFFICULTIES = (1, 2, 3, 4, 5)


def download(url, path):
    if path.exists():
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=120) as response:
        path.write_bytes(response.read())
    return path


def wikisource(**params):
    params.update(format="json", formatversion="2")
    url = WIKISOURCE_API + "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return json.load(response)
        except OSError:
            time.sleep(2 ** attempt)
    return {}


def wikisource_pages(title):
    found = wikisource(action="query", list="prefixsearch", pssearch=title, pslimit=100)
    names = [page["title"] for page in found.get("query", {}).get("prefixsearch", [])]
    names = [name for name in names if name == title or name.startswith(title + "/")]
    return [name for name in names if not re.search(r"/(ДО|ВТ)\b", name)] or [title]


def wikisource_text(name):
    parsed = wikisource(action="parse", page=name, prop="text")
    text = parsed.get("parse", {}).get("text", "")
    text = re.sub(r"<(style|script|sup|table)[^>]*>.*?</\1>", "", text, flags=re.S)
    text = re.sub(r"<br\s*/?>|</p>|</div>|</li>|</h\d>", "\n\n", text)
    return html.unescape(re.sub(r"<[^>]+>", "", text))


def fetch_library(cache):
    texts = {"ru": [], "en": []}
    for book in GUTENBERG_BOOKS:
        path = download(GUTENBERG_URL.format(id=book), cache / "gutenberg" / f"{book}.txt")
        texts["en"].append(gutenberg_body(path.read_text(encoding="utf-8-sig")))
    for title in WIKISOURCE_WORKS:
        path = cache / "wikisource" / (re.sub(r"\W+", "_", title) + ".txt")
        if not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("\n\n".join(wikisource_text(name) for name in wikisource_pages(title)))
        texts["ru"].append(path.read_text())
    return texts


def gutenberg_body(text):
    start = re.search(r"\*\*\* ?START OF.*?\*\*\*", text)
    end = re.search(r"\*\*\* ?END OF", text)
    return text[start.end() if start else 0 : end.start() if end else len(text)]


def normalize(text):
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    return text


def is_clean(text, lang):
    words = re.findall(r"[a-zа-яё]+", text.lower())
    return not any(PROFANITY[lang].search(word) for word in words)


def build_words(lang, cache, checker):
    path = download(FREQUENCY_URL.format(lang=lang), cache / f"words_{lang}.txt")
    letters = set(LETTERS[lang])
    ranked = {}
    for rank, line in enumerate(path.read_text(encoding="utf-8").splitlines()):
        word = line.split(" ")[0].strip().lower()
        if (
            WORD_MIN_LENGTH <= len(word) <= WORD_MAX_LENGTH
            and (len(word) > SHORT_WORD_LENGTH or rank < SHORT_WORD_MAX_RANK)
            and set(word) <= letters
            and word not in ranked
            and is_clean(word, lang)
            and (checker.lookup(word) or checker.lookup(word.replace("ё", "е")))
        ):
            ranked[word] = len(ranked)
    total = len(ranked)
    scored = sorted(ranked, key=lambda word: len(word) + 3 * math.sqrt(ranked[word] / total))
    bucket = math.ceil(total / len(DIFFICULTIES))
    return [
        {"difficulty": index // bucket + 1, "content": word} for index, word in enumerate(scored)
    ]


def sentence_difficulty(sentence):
    if re.search(r"\d", sentence):
        return 5
    return 1 + sum(len(sentence) > step for step in SENTENCE_LENGTH_STEPS)


def is_good_sentence(sentence, lang):
    allowed = set(LETTERS[lang]) | set(LETTERS[lang].upper()) | set(SENTENCE_EXTRA_CHARS)
    return (
        SENTENCE_MIN_LENGTH <= len(sentence) <= SENTENCE_MAX_LENGTH
        and set(sentence) <= allowed
        and sentence[0].isupper()
        and sentence[-1] in ".!?"
        and sentence.count('"') % 2 == 0
        and sentence.count("(") == sentence.count(")")
        and "  " not in sentence
        and not re.search(r"\b[A-ZА-ЯЁ]{2,}\b", sentence)
        and not ABBREVIATIONS.search(sentence)
        and not re.search(r"\d[^\W\d]|\b[^\W\d]\.", sentence)
        and is_clean(sentence, lang)
    )


def tatoeba_sentences(lang, cache):
    code = TATOEBA_CODES[lang]
    path = download(TATOEBA_URL.format(code=code), cache / f"tatoeba_{code}.tsv.bz2")
    with bz2.open(path, "rt", encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) == 3:
                yield normalize(parts[2]).strip()


def library_sentences(texts):
    for text in texts:
        for paragraph in re.split(r"\n\s*\n", normalize(text)):
            paragraph = re.sub(r"\s+", " ", paragraph.replace("_", "")).strip()
            paragraph = re.sub(r"^-\s*", "", paragraph)
            if re.search(r"\s-\s", paragraph) and paragraph.count('"') == 0:
                continue
            for sentence in re.split(r"(?<=[.!?])\s+(?=[A-ZА-ЯЁ])", paragraph):
                yield sentence.strip()


def pick(sentences, lang, per_difficulty, rng, exclude):
    pools = {difficulty: [] for difficulty in DIFFICULTIES}
    seen = set(exclude)
    for sentence in sentences:
        key = sentence.lower()
        if key in seen or not is_good_sentence(sentence, lang):
            continue
        seen.add(key)
        pools[sentence_difficulty(sentence)].append(sentence)
    chosen = []
    for difficulty, pool in pools.items():
        rng.shuffle(pool)
        named = [s for s in pool if FREQUENT_NAMES[lang].search(s)]
        plain = [s for s in pool if not FREQUENT_NAMES[lang].search(s)]
        named_limit = int(per_difficulty * NAMES_SHARE)
        selected = (plain[: per_difficulty - named_limit] + named[:named_limit])[:per_difficulty]
        chosen += [{"difficulty": difficulty, "content": s} for s in sorted(selected)]
    return chosen


def load_seed(filename):
    return json.loads((SEEDS_DIR / filename).read_text(encoding="utf-8"))


def write_seed(filename, mode, lang, items):
    lines = [
        "    " + json.dumps(item, ensure_ascii=False)
        for item in sorted(items, key=lambda item: item["difficulty"])
    ]
    body = ",\n".join(lines)
    (SEEDS_DIR / filename).write_text(
        f'{{\n  "mode": "{mode}",\n  "lang": "{lang}",\n  "items": [\n{body}\n  ]\n}}\n',
        encoding="utf-8",
    )
    print(f"{filename}: {len(items)}")


def main():
    parser = argparse.ArgumentParser(description="Сборка сидов слов и предложений")
    parser.add_argument("--cache", type=Path, default=ROOT / ".cache" / "texts")
    args = parser.parse_args()
    rng = random.Random(164)
    library = fetch_library(args.cache)
    for lang in LANGS:
        checker = Dictionary.from_files(HUNSPELL[lang])
        write_seed(f"words_{lang}.json", "words", lang, build_words(lang, args.cache, checker))
        known = {item["content"].lower() for item in load_seed(f"sentences_{lang}.json")["items"]}
        tatoeba = pick(tatoeba_sentences(lang, args.cache), lang, TATOEBA_PER_DIFFICULTY, rng, known)
        known |= {item["content"].lower() for item in tatoeba}
        classics = pick(library_sentences(library[lang]), lang, LIBRARY_PER_DIFFICULTY, rng, known)
        write_seed(f"sentences_{lang}_tatoeba.json", "sentences", lang, tatoeba)
        write_seed(f"sentences_{lang}_classics.json", "sentences", lang, classics)


if __name__ == "__main__":
    main()
