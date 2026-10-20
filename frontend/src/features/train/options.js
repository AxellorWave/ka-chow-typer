export const MODES = [
  {
    id: 'words',
    label: 'Слова',
    glyph: 'аб',
    description: 'Частотные слова, 5 уровней сложности',
    length: '25 слов',
    unlockLevel: 1,
  },
  {
    id: 'sentences',
    label: 'Предложения',
    glyph: 'Аа.',
    description: 'Связный текст с пунктуацией и заглавными',
    length: '3 предл.',
    unlockLevel: 3,
  },
  {
    id: 'quotes',
    label: 'Цитаты',
    glyph: '«»',
    description: 'Фразы героев «Тачек», длинные и с тире',
    length: '1 цитата',
    unlockLevel: 3,
  },
  {
    id: 'code',
    label: 'Код',
    glyph: '{ }',
    description: 'Python, JavaScript, HTML/CSS с отступами',
    length: '1 фрагмент',
    unlockLevel: 7,
  },
  {
    id: 'symbols',
    label: 'Символы',
    glyph: '#%',
    description: 'Цифры, знаки и спецсимволы на скорость',
    length: '20 групп',
    unlockLevel: 5,
  },
]

export const GUEST_MODES = ['words']
export const GUEST_MAX_DIFFICULTY = 2

export const NATURAL_LANGS = [
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
]

export const CODE_LANGS = [
  { id: 'python', label: 'Python' },
  { id: 'js', label: 'JS' },
  { id: 'html_css', label: 'HTML/CSS' },
]

export const DIFFICULTIES = [
  { id: 1, label: 'Разминка', unlockLevel: 1 },
  { id: 2, label: 'Городская трасса', unlockLevel: 1 },
  { id: 3, label: 'Каньон', unlockLevel: 8 },
  { id: 4, label: 'Шоссе 66', unlockLevel: 10 },
  { id: 5, label: 'Кубок Поршня', unlockLevel: 12 },
]

export const langsForMode = (mode) => (mode === 'code' ? CODE_LANGS : NATURAL_LANGS)

export function modeLock(mode, user) {
  if (!user) {
    return GUEST_MODES.includes(mode.id) ? null : 'Войдите, чтобы открыть'
  }
  return user.unlocked_modes?.includes(mode.id) ? null : `Откроется на ${mode.unlockLevel} уровне`
}

export function difficultyLock(difficulty, user) {
  const max = user ? user.max_difficulty : GUEST_MAX_DIFFICULTY
  if (difficulty.id <= max) return null
  return user ? `Откроется на ${difficulty.unlockLevel} уровне` : 'Войдите, чтобы открыть'
}

export function normalizeSetup(setup, user) {
  const mode = MODES.find((item) => item.id === setup.mode && !modeLock(item, user)) ?? MODES[0]
  const langs = langsForMode(mode.id)
  const lang = langs.find((item) => item.id === setup.lang) ?? langs[0]
  const difficulty =
    DIFFICULTIES.find((item) => item.id === setup.difficulty && !difficultyLock(item, user)) ??
    DIFFICULTIES[0]
  return { mode: mode.id, lang: lang.id, difficulty: difficulty.id }
}

export function describeSetup({ mode, lang, difficulty }) {
  const modeLabel = MODES.find((item) => item.id === mode)?.label ?? mode
  const langLabel = langsForMode(mode).find((item) => item.id === lang)?.label ?? lang
  return `${modeLabel} · ${langLabel} · сложность ${difficulty}`
}
