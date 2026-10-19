import client from './client.js'

export async function getLeaderboard({ metric, period, limit }) {
  const { data } = await client.get('/leaderboard', { params: { metric, period, limit } })
  return data
}
