import { describeSetup } from '../train/options.js'

export const CUPS = [
  { id: 1, label: 'Бронза', tone: 'bronze' },
  { id: 2, label: 'Серебро', tone: 'silver' },
  { id: 3, label: 'Золото', tone: 'gold' },
]

export const ZONES = [
  { id: 'town', title: 'Радиатор-Спрингс', subtitle: 'Первые круги по городку', lastOrder: 3 },
  { id: 'canyon', title: 'Каньон', subtitle: 'Серпантины и связный текст', lastOrder: 7 },
  {
    id: 'stadium',
    title: 'Стадион Кубка Поршня',
    subtitle: 'Большие гонки сезона',
    lastOrder: Infinity,
  },
]

export function groupByZone(items) {
  return ZONES.map((zone, index) => {
    const firstOrder = index === 0 ? -Infinity : ZONES[index - 1].lastOrder
    const tracks = items.filter(
      (track) => track.sort_order > firstOrder && track.sort_order <= zone.lastOrder,
    )
    return { ...zone, tracks }
  }).filter((zone) => zone.tracks.length > 0)
}

export function lockText(track, items) {
  if (track.lock_reason === 'level') return `Откроется на ${track.min_level} уровне`
  if (track.lock_reason === 'previous') {
    const previous = items.filter((item) => item.sort_order < track.sort_order).at(-1)
    return previous
      ? `Возьми бронзу на трассе «${previous.title}»`
      : 'Возьми бронзу на прошлой трассе'
  }
  return null
}

export function trackSetup(track) {
  return { mode: track.mode, lang: track.lang, difficulty: track.difficulty, trackId: track.id }
}

export const trackMeta = describeSetup
