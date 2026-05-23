<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usersApi } from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import PageHeader from '@/components/ui/PageHeader.vue'
import DataTable from '@/components/ui/DataTable.vue'
import RoleBadge from '@/components/ui/RoleBadge.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { User } from '@/types/api'
import { Trash2 } from '@lucide/vue'

const auth = useAuthStore()
const toast = useToast()
const loading = ref(true)
const users = ref<User[]>([])

const columns = [
  { key: 'no', label: 'No', class: 'w-16' },
  { key: 'nama', label: 'Nama Pengguna' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Hak Akses Role' },
  { key: 'aksi', label: 'Aksi', class: 'w-20' },
]

async function load() {
  loading.value = true
  try {
    users.value = await usersApi.getAll()
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal memuat pengguna', 'error')
  } finally {
    loading.value = false
  }
}

async function remove(user: User) {
  if (user.idUser === auth.user?.idUser) {
    toast.show('Tidak dapat menghapus akun sendiri', 'error')
    return
  }
  if (!confirm(`Hapus pengguna "${user.nama}"?`)) return
  try {
    await usersApi.remove(user.idUser)
    toast.show('Pengguna dihapus', 'success')
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
      title="Manajemen Pengguna (User Access)"
      :breadcrumbs="[
        { label: 'Application', to: '/' },
        { label: 'Users' },
      ]"
    />

    <LoadingSpinner v-if="loading" />

    <DataTable v-else :columns="columns" empty="Belum ada pengguna">
      <tr
        v-for="(u, index) in users"
        :key="u.idUser"
        class="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40"
      >
        <td class="px-5 py-4 text-slate-600 dark:text-slate-400">{{ index + 1 }}</td>
        <td class="px-5 py-4 font-medium text-slate-900 dark:text-white">{{ u.nama }}</td>
        <td class="px-5 py-4 text-slate-600 dark:text-slate-300">{{ u.email }}</td>
        <td class="px-5 py-4">
          <RoleBadge :role="u.role" />
        </td>
        <td class="px-5 py-4">
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            title="Hapus"
            :disabled="u.idUser === auth.user?.idUser"
            @click="remove(u)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </td>
      </tr>
    </DataTable>
  </div>
</template>
