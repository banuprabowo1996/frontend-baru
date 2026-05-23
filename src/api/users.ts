import { apiClient, unwrap } from './client'
import type { ApiResponse, Role, User } from '@/types/api'

export interface UserUpdatePayload {
  nama?: string
  email?: string
  role?: Role
}

export const usersApi = {
  getAll: () => unwrap(apiClient.get<ApiResponse<User[]>>('/users')),
  getById: (id: number) => unwrap(apiClient.get<ApiResponse<User>>(`/users/${id}`)),
  update: (id: number, payload: UserUpdatePayload) =>
    unwrap(apiClient.put<ApiResponse<User>>(`/users/${id}`, payload)),
  remove: (id: number) => unwrap(apiClient.delete<ApiResponse<null>>(`/users/${id}`)),
}
