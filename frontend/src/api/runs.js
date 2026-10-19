import client from './client.js'

export async function saveRun(payload) {
  const { data } = await client.post('/runs', payload)
  return data
}
