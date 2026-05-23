<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { barangApi } from '@/api/barang'
import { kategoriApi } from '@/api/kategori'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/ui/Modal.vue'
import DataTable from '@/components/ui/DataTable.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { formatRupiah } from '@/utils/format'
import type { Barang, BarangPayload, Kategori } from '@/types/api'
import { Package, Plus, Search, Pencil, Trash2 } from '@lucide/vue'

const auth = useAuthStore()
const toast = useToast()
const loading = ref(true)
const items = ref<Barang[]>([])
const kategoriList = ref<Kategori[]>([])
const search = ref('')
const modalOpen = ref(false)
const editing = ref<Barang | null>(null)
const saving = ref(false)

const form = ref<BarangPayload>({
  namaBarang: '',
  kodeBarang: '',
  jumlahTotal: 0,
  idKategori: 0,
  lokasi: '',
  harga: 0,
})

const columns = computed(() => {
  const base = [
    { key: 'no', label: 'No', class: 'w-14' },
    { key: 'kode', label: 'Kode' },
    { key: 'nama', label: 'Nama Barang' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'stok', label: 'Stok' },
    { key: 'harga', label: 'Harga' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'kondisi', label: 'Kondisi' },
  ]
  if (auth.isStaff) {
    base.push({ key: 'aksi', label: 'Aksi', class: 'w-24' })
  }
  return base
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    (b) =>
      b.namaBarang.toLowerCase().includes(q) ||
      b.kodeBarang.toLowerCase().includes(q) ||
      b.lokasi?.toLowerCase().includes(q) ||
      formatRupiah(b.harga).toLowerCase().includes(q),
  )
})

async function load() {
  loading.value = true
  try {
    items.value = await barangApi.getAll()
    if (auth.isStaff) {
      try {
        kategoriList.value = await kategoriApi.getAll()
      } catch {
        /* optional */
      }
    }
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal memuat barang', 'error')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = {
    namaBarang: '',
    kodeBarang: '',
    jumlahTotal: 1,
    idKategori: kategoriList.value[0]?.idKategori ?? 1,
    lokasi: '',
    harga: 0,
  }
  modalOpen.value = true
}

function openEdit(b: Barang) {
  editing.value = b
  form.value = {
    namaBarang: b.namaBarang,
    kodeBarang: b.kodeBarang,
    jumlahTotal: b.jumlahTotal,
    idKategori: b.kategori?.idKategori ?? 1,
    lokasi: b.lokasi ?? '',
    harga: b.harga ?? 0,
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await barangApi.update(editing.value.idBarang, form.value)
      toast.show('Barang diperbarui', 'success')
    } else {
      await barangApi.create(form.value)
      toast.show('Barang ditambahkan', 'success')
    }
    modalOpen.value = false
    await load()
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal menyimpan', 'error')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Hapus barang ini?')) return
  try {
    await barangApi.remove(id)
    toast.show('Barang dihapus', 'success')
    await load()
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal menghapus', 'error')
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold dark:text-white">Barang</h1>
        <p class="text-slate-500 text-sm mt-1">
          Katalog peralatan & bahan — semua role dapat melihat harga
        </p>
      </div>
      <button
        v-if="auth.isStaff"
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lab-600 to-lab-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-lab-500/25 transition-all hover:-translate-y-0.5"
        @click="openCreate"
      >
        <Plus class="h-4 w-4" />
        Tambah Barang
      </button>
    </div>

    <div class="relative mb-6 max-w-md">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="search"
        placeholder="Cari nama, kode, lokasi, harga..."
        class="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm glass dark:border-slate-700"
      />
    </div>

    <LoadingSpinner v-if="loading" />

    <EmptyState
      v-else-if="!filtered.length"
      title="Tidak ada barang"
      description="Mulai dengan menambahkan item inventaris"
      :icon="Package"
    />

    <DataTable v-else :columns="columns" empty="Tidak ada barang">
      <tr
        v-for="(b, index) in filtered"
        :key="b.idBarang"
        class="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40"
      >
        <td class="px-5 py-4 text-slate-600 dark:text-slate-400">{{ index + 1 }}</td>
        <td class="px-5 py-4 font-mono text-xs font-semibold text-lab-700 dark:text-lab-400">
          {{ b.kodeBarang }}
        </td>
        <td class="px-5 py-4 font-medium text-slate-900 dark:text-white">
          {{ b.namaBarang }}
        </td>
        <td class="px-5 py-4 text-slate-600 dark:text-slate-300">
          {{ b.kategori?.namaKategori ?? '—' }}
        </td>
        <td class="px-5 py-4">
          <span class="font-semibold text-lab-600 dark:text-lab-400">{{ b.jumlahTersedia }}</span>
          <span class="text-slate-400 text-xs"> / {{ b.jumlahTotal }}</span>
        </td>
        <td class="px-5 py-4 font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
          {{ formatRupiah(b.harga) }}
        </td>
        <td class="px-5 py-4 text-slate-600 dark:text-slate-300">
          {{ b.lokasi || '—' }}
        </td>
        <td class="px-5 py-4">
          <span class="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
            {{ b.kondisi }}
          </span>
        </td>
        <td v-if="auth.isStaff" class="px-5 py-4">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-lab-600 dark:hover:bg-slate-800"
              title="Edit"
              @click="openEdit(b)"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              title="Hapus"
              @click="remove(b.idBarang)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    </DataTable>

    <Modal v-model:open="modalOpen" :title="editing ? 'Edit Barang' : 'Tambah Barang'" size="md">
      <div class="space-y-4">
        <div>
          <label class="text-xs font-semibold uppercase text-slate-500">Nama Barang</label>
          <input
            v-model="form.namaBarang"
            required
            class="mt-1 w-full rounded-xl border py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-semibold uppercase text-slate-500">Kode</label>
            <input
              v-model="form.kodeBarang"
              required
              class="mt-1 w-full rounded-xl border py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
            />
          </div>
          <div>
            <label class="text-xs font-semibold uppercase text-slate-500">Jumlah</label>
            <input
              v-model.number="form.jumlahTotal"
              type="number"
              min="0"
              class="mt-1 w-full rounded-xl border py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
            />
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase text-slate-500">Harga (Rp)</label>
          <input
            v-model.number="form.harga"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            class="mt-1 w-full rounded-xl border py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
          />
          <p v-if="form.harga" class="mt-1 text-xs text-slate-500">
            Preview: {{ formatRupiah(form.harga) }}
          </p>
        </div>
        <div v-if="kategoriList.length">
          <label class="text-xs font-semibold uppercase text-slate-500">Kategori</label>
          <select
            v-model.number="form.idKategori"
            class="mt-1 w-full rounded-xl border py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
          >
            <option v-for="k in kategoriList" :key="k.idKategori" :value="k.idKategori">
              {{ k.namaKategori }}
            </option>
          </select>
        </div>
        <div v-else>
          <label class="text-xs font-semibold uppercase text-slate-500">ID Kategori</label>
          <input
            v-model.number="form.idKategori"
            type="number"
            min="1"
            class="mt-1 w-full rounded-xl border py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
          />
        </div>
        <div>
          <label class="text-xs font-semibold uppercase text-slate-500">Lokasi</label>
          <input
            v-model="form.lokasi"
            class="mt-1 w-full rounded-xl border py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
          />
        </div>
        <button
          type="button"
          :disabled="saving"
          class="w-full rounded-xl bg-lab-600 py-3 text-sm font-semibold text-white hover:bg-lab-500 disabled:opacity-60"
          @click="save"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </Modal>
  </div>
</template>
