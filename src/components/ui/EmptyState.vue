<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  description?: string
  icon?: Component
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-16 px-6 text-center dark:border-slate-700 animate-fade-in"
  >
    <div
      v-if="icon"
      class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lab-500/10 text-lab-600 dark:text-lab-400"
    >
      <component :is="icon" class="h-7 w-7" />
    </div>
    <h3 class="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </div>
</template>
