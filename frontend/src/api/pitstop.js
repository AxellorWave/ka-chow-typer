import { useAuthStore } from '../store/authStore.js'
import client from './client.js'

const MOCK_FOCUS = {
  ru: {
    keys: [
      { key: 'щ', presses: 40, errors: 9, error_rate: 22.5, avg_latency_ms: 410 },
      { key: 'ъ', presses: 18, errors: 3, error_rate: 16.7, avg_latency_ms: 455 },
      { key: 'ю', presses: 52, errors: 6, error_rate: 11.5, avg_latency_ms: 360 },
    ],
    bigrams: [
      { bigram: 'щи', presses: 12, errors: 4, error_rate: 33.3, avg_latency_ms: 380 },
      { bigram: 'ъе', presses: 10, errors: 2, error_rate: 20, avg_latency_ms: 420 },
    ],
  },
  en: {
    keys: [
      { key: 'z', presses: 30, errors: 7, error_rate: 23.3, avg_latency_ms: 430 },
      { key: 'q', presses: 22, errors: 4, error_rate: 18.2, avg_latency_ms: 395 },
      { key: 'x', presses: 35, errors: 4, error_rate: 11.4, avg_latency_ms: 350 },
    ],
    bigrams: [
      { bigram: 'qu', presses: 14, errors: 4, error_rate: 28.6, avg_latency_ms: 370 },
      { bigram: 'zz', presses: 8, errors: 2, error_rate: 25, avg_latency_ms: 410 },
    ],
  },
}

const MOCK_WORDS = {
  ru: 'щука щит ещё подъезд щётка объём юла вьюга щавель съезд пища юбка площадь разъезд клюква роща объявление юность щенок съел',
  en: 'zebra quiz box zone queen fox lazy quick axe pizza quest relax zoom equal mix freeze quote taxi puzzle quiet',
}

const MOCK_WARMUP = {
  ru: 'дом сад лес мир кот сок лук нос рот год сон мост лист снег день дым вода река поле луна',
  en: 'sun day car road home tree bird fish rain wind blue song time hand book door star moon fire lake',
}

const repeat = (words, times) => Array.from({ length: times }, () => words).join(' ')

function mockPitstop({ lang }) {
  const user = useAuthStore.getState().user
  const fallback = !user?.xp
  return {
    mode: 'words',
    lang,
    difficulty: 1,
    text_id: null,
    text: repeat(fallback ? MOCK_WARMUP[lang] : MOCK_WORDS[lang], 2),
    focus: fallback ? { keys: [], bigrams: [] } : MOCK_FOCUS[lang],
    fallback,
  }
}

export async function getPitstop({ lang }) {
  try {
    const { data } = await client.get('/texts/pitstop', { params: { lang } })
    return data
  } catch (error) {
    if (error.response?.status === 404) return mockPitstop({ lang })
    throw error
  }
}
