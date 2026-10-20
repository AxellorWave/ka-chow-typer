import { createStore } from 'zustand/vanilla'

export const POINTS_PER_CHAR = 10

export const COMBO_TIERS = [
  { from: 100, multiplier: 5 },
  { from: 50, multiplier: 3 },
  { from: 20, multiplier: 2 },
  { from: 0, multiplier: 1 },
]

export const comboMultiplier = (combo) => COMBO_TIERS.find((tier) => combo >= tier.from).multiplier

const initialState = () => ({ score: 0, combo: 0, maxCombo: 0 })

export function createScoreTracker() {
  const store = createStore(initialState)

  function hit(bonusMultiplier = 1) {
    const state = store.getState()
    const combo = state.combo + 1
    const score = state.score + POINTS_PER_CHAR * comboMultiplier(combo) * bonusMultiplier
    store.setState({ score, combo, maxCombo: Math.max(state.maxCombo, combo) })
  }

  function miss() {
    store.setState({ combo: 0 })
  }

  function reset() {
    store.setState(initialState())
  }

  return { store, hit, miss, reset }
}
