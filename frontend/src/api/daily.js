import client from './client.js'

export async function getDaily() {
  const { data } = await client.get('/daily')
  return data
}

export async function getDailyLeaderboard({ date, limit }) {
  const { data } = await client.get('/daily/leaderboard', { params: { date, limit } })
  return data
}
