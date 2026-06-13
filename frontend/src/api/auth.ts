import axiosInstance from './axiosInstance'
import type { ApiResponse, AuthUser } from '@/types'

export const loginApi = (email: string, password: string) =>
  axiosInstance.post<ApiResponse<AuthUser>>('/api/auth/login', { email, password })
