import { apiClient, unwrap } from './client'
import type { ApiResponse, Kategori } from '@/types/api'

export interface KategoriPayload {
  namaKategori: string
  deskripsi?: string
}

export const kategoriApi = {
  getAll: () => unwrap(apiClient.get<ApiResponse<Kategori[]>>('/kategori')),
  getById: (id: number) => unwrap(apiClient.get<ApiResponse<Kategori>>(`/kategori/${id}`)),
  create: (payload: KategoriPayload) =>
    unwrap(apiClient.post<ApiResponse<Kategori>>('/kategori', payload)),
  update: (id: number, payload: KategoriPayload) =>
    unwrap(apiClient.put<ApiResponse<Kategori>>(`/kategori/${id}`, payload)),
  remove: (id: number) => unwrap(apiClient.delete<ApiResponse<null>>(`/kategori/${id}`)),
}
