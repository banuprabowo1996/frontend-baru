<script setup lang="ts">
import type { Role } from '@/types/api'

defineProps<{ role: Role }>()

const styles: Record<Role, string> = {
  ADMIN:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  PETUGAS:
    'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  PEMINJAM:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}
</script>

<template>
  <span
    class="inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
    :class="styles[role]"
  >
    {{ role }}
  </span>
</template>
