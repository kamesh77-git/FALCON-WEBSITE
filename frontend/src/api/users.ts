import axiosInstance from './axiosInstance'
import type { ApiResponse, CreateUserRequest, UpdateUserRequest, UpdateUserRoleRequest, UserResponse } from '@/types'

export const getAllUsers = () =>
  axiosInstance.get<ApiResponse<UserResponse[]>>('/api/users')
export const getUserById = (id: number) =>
  axiosInstance.get<ApiResponse<UserResponse>>(`/api/users/${id}`)
export const createUser = (data: CreateUserRequest) =>
  axiosInstance.post<ApiResponse<UserResponse>>('/api/users', data)
export const updateUser = (id: number, data: UpdateUserRequest) =>
  axiosInstance.put<ApiResponse<UserResponse>>(`/api/users/${id}`, data)
export const updateUserRole = (id: number, data: UpdateUserRoleRequest) =>
  axiosInstance.patch<ApiResponse<UserResponse>>(`/api/users/${id}/role`, data)
export const deactivateUser = (id: number) =>
  axiosInstance.delete<ApiResponse<null>>(`/api/users/${id}`)
