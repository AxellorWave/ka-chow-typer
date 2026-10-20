import client, { API_BASE_URL } from './client.js'

export const oauthStartUrl = (provider) => `${API_BASE_URL}/auth/${provider}/start`

export async function getOAuthProviders() {
  const { data } = await client.get('/auth/providers')
  return data.providers
}

export async function login(credentials) {
  const { data } = await client.post('/auth/login', credentials)
  return data
}

export async function register(payload) {
  const { data } = await client.post('/auth/register', payload)
  return data
}

export async function getMe() {
  const { data } = await client.get('/auth/me')
  return data.user
}

export async function logout() {
  await client.post('/auth/logout')
}
