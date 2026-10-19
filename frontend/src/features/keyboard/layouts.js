export const FINGERS = {
  leftPinky: { hand: 'left', type: 'pinky', label: 'Левый мизинец' },
  leftRing: { hand: 'left', type: 'ring', label: 'Левый безымянный' },
  leftMiddle: { hand: 'left', type: 'middle', label: 'Левый средний' },
  leftIndex: { hand: 'left', type: 'index', label: 'Левый указательный' },
  thumb: { hand: 'both', type: 'thumb', label: 'Большой палец' },
  rightIndex: { hand: 'right', type: 'index', label: 'Правый указательный' },
  rightMiddle: { hand: 'right', type: 'middle', label: 'Правый средний' },
  rightRing: { hand: 'right', type: 'ring', label: 'Правый безымянный' },
  rightPinky: { hand: 'right', type: 'pinky', label: 'Правый мизинец' },
}

const ROWS = [
  [
    ['Backquote', 'leftPinky'],
    ['Digit1', 'leftPinky'],
    ['Digit2', 'leftRing'],
    ['Digit3', 'leftMiddle'],
    ['Digit4', 'leftIndex'],
    ['Digit5', 'leftIndex'],
    ['Digit6', 'rightIndex'],
    ['Digit7', 'rightIndex'],
    ['Digit8', 'rightMiddle'],
    ['Digit9', 'rightRing'],
    ['Digit0', 'rightPinky'],
    ['Minus', 'rightPinky'],
    ['Equal', 'rightPinky'],
    ['Backspace', 'rightPinky', 2, '⌫'],
  ],
  [
    ['Tab', 'leftPinky', 1.5, 'Tab'],
    ['KeyQ', 'leftPinky'],
    ['KeyW', 'leftRing'],
    ['KeyE', 'leftMiddle'],
    ['KeyR', 'leftIndex'],
    ['KeyT', 'leftIndex'],
    ['KeyY', 'rightIndex'],
    ['KeyU', 'rightIndex'],
    ['KeyI', 'rightMiddle'],
    ['KeyO', 'rightRing'],
    ['KeyP', 'rightPinky'],
    ['BracketLeft', 'rightPinky'],
    ['BracketRight', 'rightPinky'],
    ['Backslash', 'rightPinky', 1.5],
  ],
  [
    ['CapsLock', 'leftPinky', 1.75, 'Caps'],
    ['KeyA', 'leftPinky'],
    ['KeyS', 'leftRing'],
    ['KeyD', 'leftMiddle'],
    ['KeyF', 'leftIndex'],
    ['KeyG', 'leftIndex'],
    ['KeyH', 'rightIndex'],
    ['KeyJ', 'rightIndex'],
    ['KeyK', 'rightMiddle'],
    ['KeyL', 'rightRing'],
    ['Semicolon', 'rightPinky'],
    ['Quote', 'rightPinky'],
    ['Enter', 'rightPinky', 2.25, 'Enter'],
  ],
  [
    ['ShiftLeft', 'leftPinky', 2.25, 'Shift'],
    ['KeyZ', 'leftPinky'],
    ['KeyX', 'leftRing'],
    ['KeyC', 'leftMiddle'],
    ['KeyV', 'leftIndex'],
    ['KeyB', 'leftIndex'],
    ['KeyN', 'rightIndex'],
    ['KeyM', 'rightIndex'],
    ['Comma', 'rightMiddle'],
    ['Period', 'rightRing'],
    ['Slash', 'rightPinky'],
    ['ShiftRight', 'rightPinky', 2.75, 'Shift'],
  ],
  [['Space', 'thumb', 6.25, '']],
]

const CHARACTER_CODES = [
  'Backquote',
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
  'Digit0',
  'Minus',
  'Equal',
  'KeyQ',
  'KeyW',
  'KeyE',
  'KeyR',
  'KeyT',
  'KeyY',
  'KeyU',
  'KeyI',
  'KeyO',
  'KeyP',
  'BracketLeft',
  'BracketRight',
  'Backslash',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyF',
  'KeyG',
  'KeyH',
  'KeyJ',
  'KeyK',
  'KeyL',
  'Semicolon',
  'Quote',
  'KeyZ',
  'KeyX',
  'KeyC',
  'KeyV',
  'KeyB',
  'KeyN',
  'KeyM',
  'Comma',
  'Period',
  'Slash',
]

const CHARACTERS = {
  en: {
    base: "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./",
    shift: '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?',
  },
  ru: {
    base: 'ё1234567890-=йцукенгшщзхъ\\фывапролджэячсмитьбю.',
    shift: 'Ё!"№;%:?*()_+ЙЦУКЕНГШЩЗХЪ/ФЫВАПРОЛДЖЭЯЧСМИТЬБЮ,',
  },
}

const SPECIAL_CHARS = {
  ' ': { code: 'Space', shift: false },
  '\n': { code: 'Enter', shift: false },
  '\t': { code: 'Tab', shift: false },
}

export const LAYOUT_TITLES = { ru: 'ЙЦУКЕН', en: 'QWERTY' }

export const layoutForLang = (lang) => (lang === 'ru' ? 'ru' : 'en')

const fingerByCode = new Map(ROWS.flat().map(([code, finger]) => [code, finger]))

function buildLayout({ base, shift }) {
  const baseChars = Array.from(base)
  const shiftChars = Array.from(shift)
  const labels = new Map()
  const charMap = new Map(Object.entries(SPECIAL_CHARS))

  CHARACTER_CODES.forEach((code, index) => {
    labels.set(code, { base: baseChars[index], shift: shiftChars[index] })
    if (!charMap.has(shiftChars[index])) {
      charMap.set(shiftChars[index], { code, shift: true })
    }
    charMap.set(baseChars[index], { code, shift: false })
  })

  const rows = ROWS.map((row) =>
    row.map(([code, finger, width = 1, caption]) => {
      const label = labels.get(code)
      return {
        code,
        finger,
        width,
        caption: caption ?? label.shift,
        hint: caption === undefined && label.shift.toLowerCase() !== label.base ? label.base : null,
      }
    }),
  )

  return { rows, charMap }
}

export const LAYOUTS = {
  en: buildLayout(CHARACTERS.en),
  ru: buildLayout(CHARACTERS.ru),
}

const shiftKeyFor = (finger) => (FINGERS[finger].hand === 'left' ? 'ShiftRight' : 'ShiftLeft')

export function resolveChar(char, layout) {
  if (char === undefined) return null
  const entry = LAYOUTS[layout].charMap.get(char) ?? LAYOUTS.en.charMap.get(char)
  if (!entry) return null
  const finger = fingerByCode.get(entry.code)
  if (!entry.shift) {
    return { code: entry.code, finger, shiftCode: null, shiftFinger: null }
  }
  const shiftCode = shiftKeyFor(finger)
  return { code: entry.code, finger, shiftCode, shiftFinger: fingerByCode.get(shiftCode) }
}
