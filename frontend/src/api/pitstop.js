import client from './client.js'

export async function getPitstop({ lang }) {
  const { data } = await client.get('/texts/pitstop', { params: { lang } })
  return data
}
