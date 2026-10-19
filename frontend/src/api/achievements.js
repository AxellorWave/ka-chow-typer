import client from './client.js'

export async function getAchievements() {
  const { data } = await client.get('/achievements')
  return data.items
}
