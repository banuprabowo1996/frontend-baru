<script setup lang="ts">
import { computed } from 'vue'
import { statusConfig } from '@/utils/status'
import type { StatusPeminjaman } from '@/types/api'

const props = defineProps<{ status: StatusPeminjaman }>()
const config = computed(() => statusConfig[props.status])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="config.class"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="config.dot" />
    {{ config.label }}
  </span>
</template>
