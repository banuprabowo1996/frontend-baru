<script setup lang="ts">
import { X } from '@lucide/vue'

defineProps<{ title: string; size?: 'sm' | 'md' | 'lg' }>()
const open = defineModel<boolean>('open', { default: false })

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="open = false"
      >
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
        <div
          class="relative w-full glass-strong rounded-3xl p-6 shadow-2xl animate-scale-in"
          :class="sizeClass[size ?? 'md']"
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <h2 class="font-display text-xl font-bold text-slate-900 dark:text-white">
              {{ title }}
            </h2>
            <button
              type="button"
              class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              @click="open = false"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
