import client from './client.js'

export async function getText({ mode, lang, difficulty, trackId }) {
  const { data } = await client.get('/texts', {
    params: { mode, lang, difficulty, track_id: trackId },
  })
  return data
}
