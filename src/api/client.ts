import axios, { type AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('labvault-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan pada server'
    return Promise.reject(new Error(message))
  },
)

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  if (!data.success) throw new Error(data.message)
  return data.data
}
