import client from './client.js'

export async function getGarage() {
  const { data } = await client.get('/garage')
  return data
}

export async function saveGarage(patch) {
  const { data } = await client.put('/garage', patch)
  return data
}
