import client from './client.js'

export async function updateProfile(payload) {
  const { data } = await client.patch('/profile', payload)
  return data.user
}

export async function uploadAvatar(blob) {
  const form = new FormData()
  form.append('file', blob, 'avatar.webp')
  const { data } = await client.post('/profile/avatar', form)
  return data.user
}

export async function removeAvatar() {
  const { data } = await client.delete('/profile/avatar')
  return data.user
}
