<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { kategoriApi, type KategoriPayload } from '@/api/kategori'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import PageHeader from '@/components/ui/PageHeader.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Modal from '@/components/ui/Modal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { Kategori } from '@/types/api'
import { Plus, Pencil, Trash2 } from '@lucide/vue'

const auth = useAuthStore()
const toast = useToast()
const loading = ref(true)
const items = ref<Kategori[]>([])
const modalOpen = ref(false)
const editing = ref<Kategori | null>(null)
const saving = ref(false)

const form = ref<KategoriPayload>({
  namaKategori: '',
  deskripsi: '',
})

const columns = [
  { key: 'no', label: 'No', class: 'w-16' },
  { key: 'kategori', label: 'Kategori' },
  { key: 'deskripsi', label: 'Deskripsi Kategori' },
  { key: 'aksi', label: 'Aksi', class: 'w-28' },
]

async function load() {
  loading.value = true
  try {
    items.value = await kategoriApi.getAll()
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal memuat kategori', 'error')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = { namaKategori: '', deskripsi: '' }
  modalOpen.value = true
}

function openEdit(k: Kategori) {
  editing.value = k
  form.value = {
    namaKategori: k.namaKategori,
    deskripsi: k.deskripsi ?? '',
  }
  modalOpen.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await kategoriApi.update(editing.value.idKategori, form.value)
      toast.show('Kategori diperbarui', 'success')
    } else {
      await kategoriApi.create(form.value)
      toast.show('Kategori ditambahkan', 'success')
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
  if (!confirm('Hapus kategori ini?')) return
  try {
    await kategoriApi.remove(id)
    toast.show('Kategori dihapus', 'success')
    await load()
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal menghapus', 'error')
  }
}

onMounted(load)
</script>

<template>
  <div class="animate-fade-in">
    <PageHeader
      title="Kategori Inventaris"
      :breadcrumbs="[
        { label: 'Application', to: '/' },
        { label: 'Kategori' },
      ]"
    >
      <template v-if="auth.isStaff" #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-500 hover:-translate-y-0.5"
          @click="openCreate"
        >
          <Plus class="h-4 w-4" />
          Tambah Kategori
        </button>
      </template>
    </PageHeader>

    <LoadingSpinner v-if="loading" />

    <DataTable v-else :columns="columns" empty="Belum ada kategori">
      <tr
        v-for="(k, index) in items"
        :key="k.idKategori"
        class="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40"
      >
        <td class="px-5 py-4 text-slate-600 dark:text-slate-400">{{ index + 1 }}</td>
        <td class="px-5 py-4 font-medium text-slate-900 dark:text-white">
          {{ k.namaKategori }}
        </td>
        <td class="px-5 py-4 text-slate-600 dark:text-slate-300">
          {{ k.deskripsi || '—' }}
        </td>
        <td v-if="auth.isStaff" class="px-5 py-4">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-lab-600 dark:hover:bg-slate-800 dark:hover:text-lab-400 transition-colors"
              title="Edit"
              @click="openEdit(k)"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Hapus"
              @click="remove(k.idKategori)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </td>
        <td v-else class="px-5 py-4 text-slate-400 text-xs">—</td>
      </tr>
    </DataTable>

    <Modal
      v-model:open="modalOpen"
      :title="editing ? 'Edit Kategori' : 'Tambah Kategori'"
      size="md"
    >
      <div class="space-y-4">
        <div>
          <label class="text-xs font-semibold uppercase text-slate-500">Nama Kategori</label>
          <input
            v-model="form.namaKategori"
            required
            class="mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
          />
        </div>
        <div>
          <label class="text-xs font-semibold uppercase text-slate-500">Deskripsi</label>
          <textarea
            v-model="form.deskripsi"
            rows="3"
            class="mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
          />
        </div>
        <button
          type="button"
          :disabled="saving"
          class="w-full rounded-xl bg-accent-600 py-3 text-sm font-semibold text-white hover:bg-accent-500 disabled:opacity-60"
          @click="save"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </Modal>
  </div>
</template>
