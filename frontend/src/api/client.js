import axios from 'axios'
import { useAuthStore } from '../store/authStore.js'

const API_BASE_URL = '/api'
const NO_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let refreshPromise = null

export function refreshAccessToken() {
  refreshPromise ??= axios
    .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
    .then(({ data }) => {
      useAuthStore.getState().setAccessToken(data.access_token)
      return data.access_token
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const canRefresh =
      response?.status === 401 && config && !config._retry && !NO_REFRESH_URLS.includes(config.url)
    if (!canRefresh) {
      return Promise.reject(error)
    }

    config._retry = true
    try {
      await refreshAccessToken()
    } catch {
      useAuthStore.getState().clearSession()
      return Promise.reject(error)
    }
    return client(config)
  },
)

export default client
