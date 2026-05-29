import jsonServer from 'json-server'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = jsonServer.create()
const dbPath = path.join(__dirname, 'db.json')
const db = jsonServer.router(dbPath).db

const API_PREFIX = '/api'
const DIST = path.join(__dirname, 'dist')
const isProd = fs.existsSync(DIST)

const idFieldMap = {
  users: 'idUser',
  kategori: 'idKategori',
  barang: 'idBarang',
  peminjaman: 'idPeminjaman',
  'detail-peminjaman': 'idDetail',
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function wrap(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

function wrapError(message = 'Error', status = 400) {
  return {
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString(),
  }
}

function getUserByEmail(email) {
  return db.get('users').find({ email }).value()
}

// CORS
server.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})
server.use(jsonServer.bodyParser)

// Static files: dist/ (prod) or public/ (dev)
const staticDir = isProd ? DIST : path.join(__dirname, 'public')
server.use(express.static(staticDir))

// ---- CUSTOM ROUTES ----

// Auth: Login
server.post(`${API_PREFIX}/auth/login`, (req, res) => {
  const { email, password } = req.body
  const user = getUserByEmail(email)
  if (!user || user.password !== password) {
    return res.status(401).json(wrapError('Email atau password salah', 401))
  }
  const token = generateToken()
  const { password: _, ...userData } = user
  res.json(wrap({ token, user: userData }, 'Login berhasil'))
})

// Auth: Register
server.post(`${API_PREFIX}/auth/register`, (req, res) => {
  const { nama, email, password, role } = req.body
  if (getUserByEmail(email)) {
    return res.status(400).json(wrapError('Email sudah terdaftar', 400))
  }
  const users = db.get('users')
  const maxId = users.maxBy('idUser').value()?.idUser || 0
  const newUser = { idUser: maxId + 1, nama, email, password, role: role || 'PEMINJAM' }
  users.push(newUser).write()
  const token = generateToken()
  const { password: _, ...userData } = newUser
  res.status(201).json(wrap({ token, user: userData }, 'Registrasi berhasil'))
})

// Peminjaman: Get my loans
server.get(`${API_PREFIX}/peminjaman/my`, (req, res) => {
  const data = db.get('peminjaman').value()
  res.json(wrap(data, 'Berhasil mendapatkan data peminjaman'))
})

// Peminjaman: Approve
server.post(`${API_PREFIX}/peminjaman/:id/setujui`, (req, res) => {
  const id = Number(req.params.id)
  const item = db.get('peminjaman').find({ idPeminjaman: id }).value()
  if (!item) return res.status(404).json(wrapError('Peminjaman tidak ditemukan', 404))
  if (item.status !== 'MENUNGGU') return res.status(400).json(wrapError('Status peminjaman tidak valid', 400))
  item.status = 'DISETUJUI'
  item.idPetugas = 1
  item.petugas = { idUser: 1, nama: 'Admin Lab', email: 'admin@lab.com', role: 'ADMIN' }
  db.get('peminjaman').find({ idPeminjaman: id }).assign(item).write()
  res.json(wrap(item, 'Peminjaman disetujui'))
})

// Peminjaman: Reject
server.post(`${API_PREFIX}/peminjaman/:id/tolak`, (req, res) => {
  const id = Number(req.params.id)
  const item = db.get('peminjaman').find({ idPeminjaman: id }).value()
  if (!item) return res.status(404).json(wrapError('Peminjaman tidak ditemukan', 404))
  if (item.status !== 'MENUNGGU') return res.status(400).json(wrapError('Status peminjaman tidak valid', 400))
  item.status = 'DITOLAK'
  item.idPetugas = 1
  item.petugas = { idUser: 1, nama: 'Admin Lab', email: 'admin@lab.com', role: 'ADMIN' }
  db.get('peminjaman').find({ idPeminjaman: id }).assign(item).write()
  res.json(wrap(item, 'Peminjaman ditolak'))
})

// Peminjaman: Return items
server.post(`${API_PREFIX}/peminjaman/:id/kembalikan`, (req, res) => {
  const id = Number(req.params.id)
  const item = db.get('peminjaman').find({ idPeminjaman: id }).value()
  if (!item) return res.status(404).json(wrapError('Peminjaman tidak ditemukan', 404))
  if (item.status !== 'DIPINJAM') return res.status(400).json(wrapError('Status peminjaman tidak valid', 400))
  item.status = 'DIKEMBALIKAN'
  db.get('peminjaman').find({ idPeminjaman: id }).assign(item).write()
  res.json(wrap(item, 'Barang berhasil dikembalikan'))
})

// Barang: Search
server.get(`${API_PREFIX}/barang/search`, (req, res) => {
  const q = (req.query.q || '').toLowerCase()
  const data = db.get('barang').filter(
    (b) => b.namaBarang.toLowerCase().includes(q) || b.kodeBarang.toLowerCase().includes(q)
  ).value()
  res.json(wrap(data, 'Hasil pencarian barang'))
})

// ---- GENERIC CRUD HANDLER (with custom ID fields) ----

server.use((req, res, next) => {
  const match = req.path.match(new RegExp(`^${API_PREFIX}/([\\w-]+)(/.*)?$`))
  if (!match) return next()

  const resource = match[1]
  const rest = match[2] || ''
  const idField = idFieldMap[resource]

  if (!idField) return next()

  const collection = db.get(resource)
  const idMatch = rest.match(/^\/(\d+)/)
  const paramId = idMatch ? Number(idMatch[1]) : null

  // GET /api/:resource (list all)
  if (req.method === 'GET' && !paramId) {
    return res.json(wrap(collection.value()))
  }

  // GET /api/:resource/:id
  if (req.method === 'GET' && paramId) {
    const item = collection.find({ [idField]: paramId }).value()
    if (!item) return res.status(404).json(wrapError('Data tidak ditemukan', 404))
    return res.json(wrap(item))
  }

  // POST /api/:resource
  if (req.method === 'POST' && !paramId) {
    const maxId = collection.maxBy(idField).value()?.[idField] || 0
    const newItem = { ...req.body, [idField]: maxId + 1 }
    collection.push(newItem).write()
    return res.status(201).json(wrap(newItem, 'Berhasil ditambahkan'))
  }

  // PUT /api/:resource/:id
  if (req.method === 'PUT' && paramId) {
    const existing = collection.find({ [idField]: paramId }).value()
    if (!existing) return res.status(404).json(wrapError('Data tidak ditemukan', 404))
    const updated = { ...existing, ...req.body, [idField]: paramId }
    collection.find({ [idField]: paramId }).assign(updated).write()
    return res.json(wrap(updated, 'Berhasil diubah'))
  }

  // DELETE /api/:resource/:id
  if (req.method === 'DELETE' && paramId) {
    const removed = collection.remove({ [idField]: paramId }).write()
    if (!removed.length) return res.status(404).json(wrapError('Data tidak ditemukan', 404))
    return res.json(wrap(removed[0], 'Berhasil dihapus'))
  }

  next()
})

// ---- SPA FALLBACK (production) ----
if (isProd) {
  server.get('*', (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
  })
}

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`\n  Server running on http://localhost:${PORT}`)
  console.log(`  API: http://localhost:${PORT}${API_PREFIX}`)
  console.log()
  console.log('  Credentials:')
  console.log(`    Admin:   admin@lab.com / admin123`)
  console.log(`    Petugas: petugas@lab.com / petugas123`)
  console.log(`    User:    ahmad@mail.com / user123`)
  console.log()
})
