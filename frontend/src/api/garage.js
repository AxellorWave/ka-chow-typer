import { withDefaults } from '../components/car/carConfig.js'
import { useAuthStore } from '../store/authStore.js'
import client from './client.js'

const SLOTS = ['color', 'decal', 'wheels', 'spoiler']

const ACHIEVEMENT_TITLES = {
  ka_chow: 'Ka-chow!',
  night_racer: 'Ночной гонщик',
  piston_cup: 'Кубок Поршня',
  steel_finger: 'Стальной палец',
  typing_genius: 'Печатный гений',
  week_on_track: 'Неделя на трассе',
}

const MOCK_ITEMS = [
  ['color', 'color_red', 'Красный Маквин', 'default', null],
  ['color', 'color_yellow', 'Жёлтая Круз', 'level', '2'],
  ['color', 'color_blue', 'Голубая Салли', 'level', '4'],
  ['color', 'color_rust', 'Ржавчина Мэтра', 'achievement', 'ka_chow'],
  ['color', 'color_black', 'Чёрный Шторм', 'level', '10'],
  ['decal', 'decal_none', 'Без наклеек', 'default', null],
  ['decal', 'decal_bolt', 'Молния 95', 'default', null],
  ['decal', 'decal_flames', 'Языки пламени', 'level', '5'],
  ['decal', 'decal_stars', 'Звёздная россыпь', 'achievement', 'night_racer'],
  ['decal', 'decal_checkered', 'Финишные шашки', 'achievement', 'piston_cup'],
  ['wheels', 'wheels_stock', 'Заводские', 'default', null],
  ['wheels', 'wheels_whitewall', 'Белые боковины', 'level', '3'],
  ['wheels', 'wheels_lightyear', 'Шины Lightyear', 'achievement', 'steel_finger'],
  ['wheels', 'wheels_offroad', 'Внедорожные', 'level', '6'],
  ['wheels', 'wheels_gold', 'Золотые диски', 'achievement', 'typing_genius'],
  ['spoiler', 'spoiler_none', 'Без спойлера', 'default', null],
  ['spoiler', 'spoiler_standard', 'Стандартный', 'level', '2'],
  ['spoiler', 'spoiler_carbon', 'Карбоновый', 'level', '5'],
  ['spoiler', 'spoiler_wing', 'Высокое крыло', 'achievement', 'week_on_track'],
  ['spoiler', 'spoiler_champion', 'Спойлер чемпиона', 'level', '12'],
].map(([slot, code, title, type, value]) => ({ slot, code, title, type, value }))

const MOCK_ACHIEVEMENTS = new Set(['ka_chow'])

let mock = { userId: null, config: null }

function unlockLabel({ type, value }) {
  if (type === 'level') return `Уровень ${value}`
  if (type === 'achievement') return `Ачивка ${ACHIEVEMENT_TITLES[value] ?? value}`
  return 'Открыт'
}

function isUnlocked({ type, value }, level) {
  if (type === 'level') return level >= Number(value)
  if (type === 'achievement') return MOCK_ACHIEVEMENTS.has(value)
  return true
}

function currentMockConfig() {
  const user = useAuthStore.getState().user
  if (mock.userId !== user?.id) mock = { userId: user?.id, config: withDefaults(user?.car_config) }
  return mock.config
}

function mockGarage() {
  const level = useAuthStore.getState().user?.level ?? 1
  return {
    config: currentMockConfig(),
    slots: SLOTS.map((slot) => ({
      slot,
      items: MOCK_ITEMS.filter((item) => item.slot === slot).map((item) => ({
        code: item.code,
        title: item.title,
        asset: null,
        unlocked: isUnlocked(item, level),
        unlock: { type: item.type, value: item.value, label: unlockLabel(item) },
      })),
    })),
  }
}

function mockError(status, error, message) {
  return Object.assign(new Error(message), { response: { status, data: { error, message } } })
}

function mockSave(patch) {
  const level = useAuthStore.getState().user?.level ?? 1
  for (const [slot, code] of Object.entries(patch)) {
    const item = MOCK_ITEMS.find((candidate) => candidate.code === code)
    if (!SLOTS.includes(slot) || !item || item.slot !== slot) {
      throw mockError(400, 'validation_error', 'Такой детали нет в гараже.')
    }
    if (!isUnlocked(item, level)) {
      throw mockError(403, 'item_locked', `«${item.title}» ещё не открыт: ${unlockLabel(item)}.`)
    }
  }
  mock.config = { ...currentMockConfig(), ...patch }
  return { config: mock.config }
}

export async function getGarage() {
  try {
    const { data } = await client.get('/garage')
    return data
  } catch (error) {
    if (error.response?.status === 404) return mockGarage()
    throw error
  }
}

export async function saveGarage(patch) {
  try {
    const { data } = await client.put('/garage', patch)
    return data
  } catch (error) {
    if (error.response?.status === 404) return mockSave(patch)
    throw error
  }
}
