import { apiClient, unwrap } from './client'
import type { ApiResponse, DetailPeminjaman, DetailPeminjamanPayload, Kondisi } from '@/types/api'

export const detailPeminjamanApi = {
  getById: (id: number) =>
    unwrap(apiClient.get<ApiResponse<DetailPeminjaman>>(`/detail-peminjaman/${id}`)),
  create: (idPeminjaman: number, payload: DetailPeminjamanPayload) =>
    unwrap(
      apiClient.post<ApiResponse<DetailPeminjaman>>('/detail-peminjaman', payload, {
        params: { idPeminjaman },
      }),
    ),
  updateKondisi: (id: number, kondisiKembali: Kondisi) =>
    unwrap(
      apiClient.put<ApiResponse<DetailPeminjaman>>(`/detail-peminjaman/${id}`, {
        kondisiKembali,
      }),
    ),
  remove: (id: number) =>
    unwrap(apiClient.delete<ApiResponse<null>>(`/detail-peminjaman/${id}`)),
}
