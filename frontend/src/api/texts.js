import client from './client.js'

export async function getText({ mode, lang, difficulty }) {
  const { data } = await client.get('/texts', { params: { mode, lang, difficulty } })
  return data
}
