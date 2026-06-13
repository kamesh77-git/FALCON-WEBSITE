import axios from 'axios'
import type { AuthUser } from '@/types'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use(config => {
  const raw = localStorage.getItem('falcons_auth')
  if (raw) {
    try {
      const auth: AuthUser = JSON.parse(raw)
      if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`
    } catch {
      // ignore parse errors
    }
  }
  return config
})

axiosInstance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(err)
  }
)

export default axiosInstance
