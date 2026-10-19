import client from './client.js'

export async function getSummary() {
  const { data } = await client.get('/stats/summary')
  return data
}

export async function getProgress(range) {
  const { data } = await client.get('/stats/progress', { params: { range } })
  return data
}

export async function getKeyStats() {
  const { data } = await client.get('/stats/keys')
  return data
}
