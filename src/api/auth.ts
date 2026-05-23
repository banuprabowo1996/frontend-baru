import { apiClient, unwrap } from './client'
import type { ApiResponse, AuthData, LoginPayload, RegisterPayload, User } from '@/types/api'

export const authApi = {
  login: (payload: LoginPayload) =>
    unwrap(apiClient.post<ApiResponse<AuthData>>('/auth/login', payload)),

  register: (payload: RegisterPayload) =>
    unwrap(apiClient.post<ApiResponse<User>>('/auth/register', payload)),
}
