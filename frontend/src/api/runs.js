import client from './client.js'

export async function saveRun(payload) {
  const { data } = await client.post('/runs', payload)
  return data
}

export async function getMyRuns({ limit, offset }) {
  const { data } = await client.get('/runs/me', { params: { limit, offset } })
  return data
}
