<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Sun, Moon, Monitor } from '@lucide/vue'

const theme = useThemeStore()

const icon = computed(() => {
  if (theme.mode === 'light') return Sun
  if (theme.mode === 'dark') return Moon
  return Monitor
})

const label = computed(() => {
  if (theme.mode === 'light') return 'Terang'
  if (theme.mode === 'dark') return 'Gelap'
  return 'Sistem'
})
</script>

<template>
  <button
    type="button"
    class="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    :title="`Tema: ${label}`"
    @click="theme.cycle()"
  >
    <component
      :is="icon"
      class="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-active:scale-90"
    />
    <span class="hidden sm:inline">{{ label }}</span>
  </button>
</template>
