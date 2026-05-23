<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import type { Role } from '@/types/api'
import { FlaskConical, User, Mail, Lock, ArrowRight, Loader2 } from '@lucide/vue'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const nama = ref('')
const email = ref('')
const password = ref('')
const role = ref<Role>('PEMINJAM')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await auth.register({
      nama: nama.value,
      email: email.value,
      password: password.value,
      role: role.value,
    })
    toast.show('Registrasi berhasil! Silakan login.', 'success')
    router.push('/login')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Registrasi gagal', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-dvh items-center justify-center p-4">
    <div class="absolute top-4 right-4 z-10">
      <ThemeToggle />
    </div>

    <form
      class="glass-strong w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scale-in"
      @submit.prevent="submit"
    >
      <div class="mb-6 flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lab-500 to-accent-500 text-white"
        >
          <FlaskConical class="h-5 w-5" />
        </div>
        <div>
          <h2 class="font-display text-xl font-bold">Buat akun</h2>
          <p class="text-xs text-slate-500">LabVault Inventaris</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase text-slate-500">Nama</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              v-model="nama"
              required
              class="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm dark:border-slate-700 dark:bg-slate-900/50"
            />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase text-slate-500">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              v-model="email"
              type="email"
              required
              class="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm dark:border-slate-700 dark:bg-slate-900/50"
            />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase text-slate-500">Password</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm dark:border-slate-700 dark:bg-slate-900/50"
            />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase text-slate-500">Peran</label>
          <select
            v-model="role"
            class="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm dark:border-slate-700 dark:bg-slate-900/50"
          >
            <option value="PEMINJAM">Peminjam</option>
            <option value="PETUGAS">Petugas</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-lab-500 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
        <template v-else>
          Daftar
          <ArrowRight class="h-4 w-4" />
        </template>
      </button>

      <p class="mt-5 text-center text-sm text-slate-500">
        Sudah punya akun?
        <RouterLink to="/login" class="font-semibold text-lab-600 dark:text-lab-400">
          Masuk
        </RouterLink>
      </p>
    </form>
  </div>
</template>
