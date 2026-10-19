import client from './client.js'

export async function getMyRuns({ limit, offset }) {
  const { data } = await client.get('/runs/me', { params: { limit, offset } })
  return data
}
