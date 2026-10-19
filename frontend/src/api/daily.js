import { useAuthStore } from '../store/authStore.js'
import client from './client.js'

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000

const MOCK_TEXT = {
  text_id: null,
  mode: 'sentences',
  lang: 'ru',
  difficulty: 2,
  text: 'Он открыл окно, и в комнату ворвался свежий воздух. После долгой прогулки все проголодались и пошли обедать. В субботу мы решили съездить за город на велосипедах.',
}

const MOCK_RACERS = [
  { nickname: 'Молния_95', level: 9, color: 'color_red', wpm: 128, accuracy: 98.4 },
  { nickname: 'Салли', level: 7, color: 'color_blue', wpm: 96.5, accuracy: 97.1 },
  { nickname: 'Док_Хадсон', level: 8, color: 'color_blue', wpm: 88.2, accuracy: 99.2 },
  { nickname: 'Мэтр', level: 4, color: 'color_rust', wpm: 61.7, accuracy: 93.8 },
  { nickname: 'Рамон', level: 3, color: 'color_yellow', wpm: 54.3, accuracy: 95 },
  { nickname: 'Чико', level: 5, color: 'color_black', wpm: 47.9, accuracy: 91.6 },
]

const MOCK_ME = { attempts: 2, best_wpm: 74.2, best_accuracy: 97.5 }

function mskToday() {
  const msk = new Date(Date.now() + MSK_OFFSET_MS)
  const midnight = Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth(), msk.getUTCDate() + 1)
  return {
    date: msk.toISOString().slice(0, 10),
    ends_at: new Date(midnight - MSK_OFFSET_MS).toISOString(),
  }
}

const carConfig = (color) => ({
  color,
  decal: 'decal_bolt',
  wheels: 'wheels_stock',
  spoiler: 'spoiler_none',
})

function mockDaily() {
  const user = useAuthStore.getState().user
  const [leader] = MOCK_RACERS
  return {
    ...mskToday(),
    text: MOCK_TEXT,
    leader: { nickname: leader.nickname, wpm: leader.wpm },
    me: user ? MOCK_ME : null,
  }
}

function mockLeaderboard() {
  const user = useAuthStore.getState().user
  const rows = MOCK_RACERS.map((racer, index) => ({
    user_id: -(index + 1),
    nickname: racer.nickname,
    avatar_url: null,
    level: racer.level,
    car_config: carConfig(racer.color),
    value: racer.wpm,
    wpm: racer.wpm,
    accuracy: racer.accuracy,
  }))
  if (user) {
    rows.push({
      user_id: user.id,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      level: user.level,
      car_config: user.car_config,
      value: MOCK_ME.best_wpm,
      wpm: MOCK_ME.best_wpm,
      accuracy: MOCK_ME.best_accuracy,
    })
  }
  const items = rows
    .sort((a, b) => b.value - a.value)
    .map((row, index) => ({ ...row, position: index + 1 }))
  return {
    metric: 'wpm',
    items,
    total: items.length,
    me: user ? (items.find((row) => row.user_id === user.id) ?? null) : null,
  }
}

const withMock = (request, mock) =>
  request().catch((error) => {
    if (error.response?.status === 404) return mock()
    throw error
  })

export function getDaily() {
  return withMock(async () => (await client.get('/daily')).data, mockDaily)
}

export function getDailyLeaderboard({ date, limit }) {
  return withMock(
    async () => (await client.get('/daily/leaderboard', { params: { date, limit } })).data,
    mockLeaderboard,
  )
}
