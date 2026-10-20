import client from './client.js'

export async function getTracks() {
  const { data } = await client.get('/tracks')
  return data
}
