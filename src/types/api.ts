export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export type Role = 'ADMIN' | 'PETUGAS' | 'PEMINJAM'

export type StatusPeminjaman =
  | 'MENUNGGU'
  | 'DISETUJUI'
  | 'DIPINJAM'
  | 'DIKEMBALIKAN'
  | 'DITOLAK'

export type Kondisi = 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT'

export interface User {
  idUser: number
  nama: string
  email: string
  role: Role
}

export interface Kategori {
  idKategori: number
  namaKategori: string
  deskripsi?: string
}

export interface Barang {
  idBarang: number
  kategori: Kategori | null
  namaBarang: string
  kodeBarang: string
  jumlahTotal: number
  jumlahTersedia: number
  kondisi: string
  lokasi: string
  harga?: number
}

export interface DetailPeminjaman {
  idDetail: number
  barang: Barang
  jumlah: number
  kondisiKembali: string | null
}

export interface Peminjaman {
  idPeminjaman: number
  peminjam: User
  petugas: User | null
  tglPinjam: string
  tglKembali: string
  status: StatusPeminjaman
  catatan: string | null
  details: DetailPeminjaman[]
}

export interface AuthData {
  token: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nama: string
  email: string
  password: string
  role?: Role
}

export interface BarangPayload {
  namaBarang: string
  kodeBarang: string
  jumlahTotal: number
  idKategori: number
  lokasi?: string
  harga?: number
}

export interface DetailPeminjamanPayload {
  idBarang: number
  jumlah: number
}

export interface PeminjamanPayload {
  tglPinjam: string
  tglKembali: string
  details: DetailPeminjamanPayload[]
  catatan?: string
}

export interface ReturnDetailPayload {
  idDetail: number
  kondisiKembali: Kondisi
}
