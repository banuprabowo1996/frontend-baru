import { apiClient, unwrap } from './client'
import type {
  ApiResponse,
  Peminjaman,
  PeminjamanPayload,
  ReturnDetailPayload,
} from '@/types/api'

export const peminjamanApi = {
  getAll: () => unwrap(apiClient.get<ApiResponse<Peminjaman[]>>('/peminjaman')),
  getMy: () => unwrap(apiClient.get<ApiResponse<Peminjaman[]>>('/peminjaman/my')),
  getById: (id: number) =>
    unwrap(apiClient.get<ApiResponse<Peminjaman>>(`/peminjaman/${id}`)),
  create: (payload: PeminjamanPayload) =>
    unwrap(apiClient.post<ApiResponse<Peminjaman>>('/peminjaman', payload)),
  approve: (id: number) =>
    unwrap(apiClient.put<ApiResponse<Peminjaman>>(`/peminjaman/${id}/setujui`)),
  reject: (id: number) =>
    unwrap(apiClient.put<ApiResponse<Peminjaman>>(`/peminjaman/${id}/tolak`)),
  return: (id: number, details?: ReturnDetailPayload[]) =>
    unwrap(
      apiClient.put<ApiResponse<Peminjaman>>(`/peminjaman/${id}/kembalikan`, details ?? []),
    ),
}
