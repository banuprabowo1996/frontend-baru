<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { barangApi } from '@/api/barang'
import { peminjamanApi } from '@/api/peminjaman'
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/ui/StatCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { formatDate, formatRupiah } from '@/utils/format'
import type { Barang, Peminjaman } from '@/types/api'
import {
  Package,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from '@lucide/vue'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(true)
const barangList = ref<Barang[]>([])
const peminjamanList = ref<Peminjaman[]>([])

const stats = computed(() => {
  const lowStock = barangList.value.filter((b) => b.jumlahTersedia <= 2).length
  const waiting = peminjamanList.value.filter((p) => p.status === 'MENUNGGU').length
  const active = peminjamanList.value.filter((p) =>
    ['DISETUJUI', 'DIPINJAM'].includes(p.status),
  ).length
  return {
    totalBarang: barangList.value.length,
    lowStock,
    totalPeminjaman: peminjamanList.value.length,
    waiting,
    active,
  }
})

const recentPeminjaman = computed(() =>
  [...peminjamanList.value]
    .sort((a, b) => b.idPeminjaman - a.idPeminjaman)
    .slice(0, 5),
)

const lowStockItems = computed(() =>
  barangList.value.filter((b) => b.jumlahTersedia <= 3).slice(0, 5),
)

onMounted(async () => {
  try {
    const [barang, peminjaman] = await Promise.all([
      barangApi.getAll(),
      auth.isStaff ? peminjamanApi.getAll() : peminjamanApi.getMy(),
    ])
    barangList.value = barang
    peminjamanList.value = peminjaman
  } catch {
    /* dashboard tolerates partial failure */
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-8">
      <h1 class="font-display text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl">
        Dashboard
      </h1>
      <p class="mt-1 text-slate-500">
        Ringkasan inventaris & aktivitas peminjaman hari ini
      </p>
    </div>

    <LoadingSpinner v-if="loading" />

    <template v-else>
      <div class="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Barang"
          :value="stats.totalBarang"
          sub="Item terdaftar"
          :icon="Package"
          accent="cyan"
        />
        <StatCard
          label="Stok Menipis"
          :value="stats.lowStock"
          sub="≤ 2 unit tersedia"
          :icon="AlertTriangle"
          accent="amber"
        />
        <StatCard
          label="Peminjaman Aktif"
          :value="stats.active"
          :icon="TrendingUp"
          accent="violet"
        />
        <StatCard
          v-if="auth.isStaff"
          label="Menunggu Persetujuan"
          :value="stats.waiting"
          :icon="ClipboardList"
          accent="emerald"
        />
        <StatCard
          v-else
          label="Pengajuan Saya"
          :value="stats.totalPeminjaman"
          :icon="ClipboardList"
          accent="emerald"
        />
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-5">
        <!-- Recent peminjaman -->
        <div class="glass rounded-2xl p-6 lg:col-span-3 card-hover">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="font-display font-semibold text-lg">Peminjaman Terbaru</h2>
            <button
              type="button"
              class="flex items-center gap-1 text-sm font-medium text-lab-600 hover:text-lab-500 dark:text-lab-400"
              @click="router.push('/peminjaman')"
            >
              Lihat semua
              <ArrowRight class="h-4 w-4" />
            </button>
          </div>
          <div v-if="recentPeminjaman.length" class="space-y-3">
            <button
              v-for="p in recentPeminjaman"
              :key="p.idPeminjaman"
              type="button"
              class="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left transition-colors hover:border-lab-200 hover:bg-lab-50/50 dark:border-slate-800 dark:hover:border-lab-800 dark:hover:bg-lab-950/30"
              @click="router.push(`/peminjaman/${p.idPeminjaman}`)"
            >
              <div>
                <p class="font-medium text-sm">
                  #{{ p.idPeminjaman }} — {{ p.peminjam.nama }}
                </p>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ formatDate(p.tglPinjam) }} → {{ formatDate(p.tglKembali) }}
                </p>
              </div>
              <StatusBadge :status="p.status" />
            </button>
          </div>
          <p v-else class="text-sm text-slate-500 py-8 text-center">Belum ada peminjaman</p>
        </div>

        <!-- Low stock -->
        <div class="glass rounded-2xl p-6 lg:col-span-2 card-hover">
          <h2 class="font-display font-semibold text-lg mb-5">Stok Kritis</h2>
          <div v-if="lowStockItems.length" class="space-y-3">
            <div
              v-for="b in lowStockItems"
              :key="b.idBarang"
              class="flex items-center justify-between rounded-xl bg-amber-50/80 px-4 py-3 dark:bg-amber-950/20"
            >
              <div>
                <p class="text-sm font-medium">{{ b.namaBarang }}</p>
                <p class="text-xs text-slate-500">
                  {{ b.kodeBarang }} · {{ formatRupiah(b.harga) }}
                </p>
              </div>
              <div class="text-right">
                <span class="font-display text-lg font-bold text-amber-600 dark:text-amber-400">
                  {{ b.jumlahTersedia }}
                </span>
                <p class="text-[10px] text-slate-500">stok</p>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500 py-8 text-center">Semua stok aman ✓</p>
        </div>
      </div>
    </template>
  </div>
</template>
