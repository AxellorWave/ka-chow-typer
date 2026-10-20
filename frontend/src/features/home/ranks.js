const RANKS = [
  { from: 1, title: 'Новичок' },
  { from: 3, title: 'Гонщик' },
  { from: 6, title: 'Пилот' },
  { from: 10, title: 'Профи' },
  { from: 15, title: 'Ас' },
  { from: 20, title: 'Легенда' },
]

export function rankFor(level) {
  return [...RANKS].reverse().find((rank) => level >= rank.from) ?? RANKS[0]
}

export function nextRank(level) {
  return RANKS.find((rank) => rank.from > level) ?? null
}
