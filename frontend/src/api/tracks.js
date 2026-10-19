import { useAuthStore } from '../store/authStore.js'
import client from './client.js'

const cups = (bronze, silver, gold) =>
  [bronze, silver, gold].map(([wpm, accuracy]) => ({ wpm, accuracy }))

const MOCK_TRACKS = [
  {
    code: 'radiator_springs',
    title: 'Радиатор-Спрингс',
    description: 'Тихий городок на шоссе 66. Самое место для первых кругов.',
    mode: 'words',
    lang: 'ru',
    difficulty: 1,
    min_level: 1,
    cup_requirements: cups([15, 85], [25, 90], [35, 95]),
  },
  {
    code: 'route_66',
    title: 'Шоссе 66',
    description: 'Легендарная дорога и простые английские слова.',
    mode: 'words',
    lang: 'en',
    difficulty: 1,
    min_level: 1,
    cup_requirements: cups([15, 85], [25, 90], [35, 95]),
  },
  {
    code: 'willys_butte',
    title: 'Утёс Уиллис',
    description: 'Пыльная грунтовка, где Док учил поворачивать направо, чтобы уйти налево.',
    mode: 'words',
    lang: 'ru',
    difficulty: 3,
    min_level: 2,
    cup_requirements: cups([25, 88], [35, 92], [45, 96]),
  },
  {
    code: 'ornament_valley',
    title: 'Долина Орнамент',
    description: 'Живописная дорога через красные скалы. Первые связные предложения.',
    mode: 'sentences',
    lang: 'ru',
    difficulty: 2,
    min_level: 3,
    cup_requirements: cups([25, 88], [35, 92], [45, 96]),
  },
  {
    code: 'tailfin_pass',
    title: 'Перевал Тейлфин',
    description: 'Горный серпантин с английскими предложениями.',
    mode: 'sentences',
    lang: 'en',
    difficulty: 3,
    min_level: 3,
    cup_requirements: cups([30, 90], [40, 93], [50, 96]),
  },
  {
    code: 'motor_speedway',
    title: 'Мотор Спидвей',
    description: 'Овал, полный болельщиков. Печатай цитаты героев «Тачек».',
    mode: 'quotes',
    lang: 'ru',
    difficulty: 3,
    min_level: 4,
    cup_requirements: cups([30, 90], [40, 94], [55, 97]),
  },
  {
    code: 'thunder_hollow',
    title: 'Тандер Холлоу',
    description: 'Грязевое дерби: цифры, скобки и знаки препинания.',
    mode: 'symbols',
    lang: 'en',
    difficulty: 3,
    min_level: 5,
    cup_requirements: cups([15, 85], [22, 90], [30, 94]),
  },
  {
    code: 'florida_speedway',
    title: 'Флорида Спидвей',
    description: 'Длинные сложные предложения на самой быстрой трассе сезона.',
    mode: 'sentences',
    lang: 'ru',
    difficulty: 5,
    min_level: 6,
    cup_requirements: cups([40, 92], [55, 95], [70, 97]),
  },
  {
    code: 'tokyo_grand_prix',
    title: 'Гран-при Токио',
    description: 'Ночная городская трасса для тех, кто печатает код на Python.',
    mode: 'code',
    lang: 'python',
    difficulty: 3,
    min_level: 7,
    cup_requirements: cups([20, 90], [30, 93], [40, 96]),
  },
  {
    code: 'piston_cup_final',
    title: 'Финал Кубка Поршня',
    description: 'Решающая гонка сезона. Победит только чемпион.',
    mode: 'quotes',
    lang: 'en',
    difficulty: 5,
    min_level: 9,
    cup_requirements: cups([45, 93], [60, 96], [80, 98]),
  },
]

const MOCK_PROGRESS = [
  { cups: 3, best_wpm: 41.2 },
  { cups: 2, best_wpm: 31.5 },
]

function lockReason(index, items, level) {
  if (index === 0) return null
  if (items[index - 1].cups < 1) return 'previous'
  if (level < MOCK_TRACKS[index].min_level) return 'level'
  return null
}

function mockTracks() {
  const user = useAuthStore.getState().user
  const level = user?.level ?? 1
  const items = []
  MOCK_TRACKS.forEach((track, index) => {
    const progress = (user && MOCK_PROGRESS[index]) || { cups: 0, best_wpm: null }
    const reason = lockReason(index, items, level)
    items.push({
      id: index + 1,
      sort_order: index + 1,
      ...track,
      ...progress,
      unlocked: reason === null,
      lock_reason: reason,
    })
  })
  return {
    items,
    total_cups: items.reduce((sum, item) => sum + item.cups, 0),
    max_cups: items.length * 3,
  }
}

export async function getTracks() {
  try {
    const { data } = await client.get('/tracks')
    return data
  } catch (error) {
    if (error.response?.status === 404) return mockTracks()
    throw error
  }
}
