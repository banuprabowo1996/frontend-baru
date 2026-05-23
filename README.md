# LabVault — Frontend Inventaris Laboratorium

Frontend modern untuk sistem inventaris & peminjaman laboratorium, dibangun dengan **Vue 3**, **TypeScript**, dan **Tailwind CSS v4**.

Terhubung ke backend Spring Boot: [backend-inventory-labs](https://github.com/alifkhasan01/backend-inventory-labs)

## Fitur

- Login & Register (JWT)
- Dashboard ringkasan stok & peminjaman
- Manajemen barang (CRUD untuk Admin/Petugas)
- Peminjaman — ajukan, setujui, tolak, kembalikan
- Detail peminjaman per item
- Tema **Terang / Gelap / Sistem**
- Animasi & UI glassmorphism (bukan tampilan inventaris generik)

## Halaman

| Route | Deskripsi |
|-------|-----------|
| `/login` | Masuk |
| `/register` | Daftar akun |
| `/` | Dashboard |
| `/kategori` | Kategori inventaris (Admin/Petugas) |
| `/barang` | Katalog barang |
| `/users` | Manajemen pengguna (Admin) |
| `/peminjaman` | Daftar peminjaman |
| `/peminjaman/:id` | Detail transaksi peminjaman |
| `/detail-peminjaman/:id` | Detail item dalam peminjaman |

## Menjalankan

### 1. Backend (wajib)

```bash
# Clone & jalankan backend
git clone https://github.com/alifkhasan01/backend-inventory-labs.git
cd backend-inventory-labs
# Buat database MySQL: db_peminjaman
.\mvnw.cmd spring-boot:run
```

Backend berjalan di `http://localhost:4000/api`  
Swagger: `http://localhost:4000/api/swagger-ui.html`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`

### Environment

Salin `.env.example` ke `.env` jika perlu mengubah URL API:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

Proxy Vite (`vite.config.ts`) meneruskan `/api` ke backend saat development.

## Role

| Role | Kemampuan utama |
|------|-----------------|
| `PEMINJAM` | Ajukan peminjaman, lihat riwayat sendiri |
| `PETUGAS` / `ADMIN` | Kelola barang, setujui/tolak/kembalikan peminjaman |

## Build produksi

```bash
npm run build
npm run preview
```
