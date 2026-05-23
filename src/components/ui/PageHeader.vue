<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Bell } from '@lucide/vue'

defineProps<{
  title: string
  breadcrumbs?: { label: string; to?: string }[]
}>()
</script>

<template>
  <div class="mb-6">
    <div class="mb-4 flex items-center justify-between">
      <nav class="flex items-center gap-1.5 text-xs text-slate-500">
        <template v-for="(crumb, i) in breadcrumbs" :key="i">
          <span v-if="i > 0" class="text-slate-300 dark:text-slate-600">/</span>
          <RouterLink
            v-if="crumb.to"
            :to="crumb.to"
            class="hover:text-lab-600 dark:hover:text-lab-400 transition-colors"
          >
            {{ crumb.label }}
          </RouterLink>
          <span v-else class="text-slate-400">{{ crumb.label }}</span>
        </template>
      </nav>
      <button
        type="button"
        class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell class="h-5 w-5" />
      </button>
    </div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="font-display text-xl font-bold text-slate-900 dark:text-white lg:text-2xl">
        {{ title }}
      </h1>
      <slot name="actions" />
    </div>
  </div>
</template>
