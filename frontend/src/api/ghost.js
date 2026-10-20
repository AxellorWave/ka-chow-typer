import client from './client.js'

export async function getGhost({ trackId, textId, who }) {
  try {
    const { data } = await client.get('/ghost', {
      params: { track_id: trackId, text_id: textId, who },
    })
    return data
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}
