<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle2, AlertCircle, Info } from '@lucide/vue'

const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl glass-strong min-w-[260px] max-w-sm animate-scale-in"
        >
          <CheckCircle2
            v-if="t.type === 'success'"
            class="h-5 w-5 shrink-0 text-emerald-500"
          />
          <AlertCircle
            v-else-if="t.type === 'error'"
            class="h-5 w-5 shrink-0 text-rose-500"
          />
          <Info v-else class="h-5 w-5 shrink-0 text-lab-500" />
          <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ t.message }}</p>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.95);
}
</style>
