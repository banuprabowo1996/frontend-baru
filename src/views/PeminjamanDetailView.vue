<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { peminjamanApi } from '@/api/peminjaman'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { formatDate, formatRupiah } from '@/utils/format'
import type { Kondisi, Peminjaman, ReturnDetailPayload } from '@/types/api'
import {
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  User,
  Calendar,
  Package,
  ChevronRight,
} from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const loading = ref(true)
const actionLoading = ref(false)
const peminjaman = ref<Peminjaman | null>(null)

const returnKondisi = ref<Record<number, Kondisi>>({})

const id = Number(route.params.id)

async function load() {
  loading.value = true
  try {
    peminjaman.value = await peminjamanApi.getById(id)
    peminjaman.value.details?.forEach((d) => {
      returnKondisi.value[d.idDetail] = (d.kondisiKembali as Kondisi) || 'BAIK'
    })
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Data tidak ditemukan', 'error')
    router.push('/peminjaman')
  } finally {
    loading.value = false
  }
}

async function approve() {
  actionLoading.value = true
  try {
    peminjaman.value = await peminjamanApi.approve(id)
    toast.show('Peminjaman disetujui', 'success')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal menyetujui', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function reject() {
  actionLoading.value = true
  try {
    peminjaman.value = await peminjamanApi.reject(id)
    toast.show('Peminjaman ditolak', 'info')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal menolak', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function doReturn() {
  actionLoading.value = true
  const details: ReturnDetailPayload[] =
    peminjaman.value?.details?.map((d) => ({
      idDetail: d.idDetail,
      kondisiKembali: returnKondisi.value[d.idDetail] ?? 'BAIK',
    })) ?? []
  try {
    peminjaman.value = await peminjamanApi.return(id, details)
    toast.show('Barang berhasil dikembalikan', 'success')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal proses pengembalian', 'error')
  } finally {
    actionLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <button
      type="button"
      class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-lab-600 transition-colors"
      @click="router.push('/peminjaman')"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali ke daftar
    </button>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="peminjaman">
      <div class="glass-strong rounded-3xl p-6 lg:p-8 animate-fade-up">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-lab-600 dark:text-lab-400">
              Peminjaman #{{ peminjaman.idPeminjaman }}
            </p>
            <h1 class="font-display text-2xl font-bold mt-1 dark:text-white">Detail Peminjaman</h1>
            <div class="mt-3">
              <StatusBadge :status="peminjaman.status" />
            </div>
          </div>

          <div v-if="auth.isStaff" class="flex flex-wrap gap-2">
            <button
              v-if="peminjaman.status === 'MENUNGGU'"
              type="button"
              :disabled="actionLoading"
              class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
              @click="approve"
            >
              <Check class="h-4 w-4" />
              Setujui
            </button>
            <button
              v-if="peminjaman.status === 'MENUNGGU'"
              type="button"
              :disabled="actionLoading"
              class="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              @click="reject"
            >
              <X class="h-4 w-4" />
              Tolak
            </button>
            <button
              v-if="['DISETUJUI', 'DIPINJAM'].includes(peminjaman.status)"
              type="button"
              :disabled="actionLoading"
              class="inline-flex items-center gap-2 rounded-xl bg-lab-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-lab-500 disabled:opacity-60"
              @click="doReturn"
            >
              <RotateCcw class="h-4 w-4" />
              Kembalikan
            </button>
          </div>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-slate-50/80 p-4 dark:bg-slate-800/50">
            <div class="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
              <User class="h-3.5 w-3.5" />
              Peminjam
            </div>
            <p class="mt-2 font-medium">{{ peminjaman.peminjam.nama }}</p>
            <p class="text-xs text-slate-500">{{ peminjaman.peminjam.email }}</p>
          </div>
          <div class="rounded-xl bg-slate-50/80 p-4 dark:bg-slate-800/50">
            <div class="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
              <User class="h-3.5 w-3.5" />
              Petugas
            </div>
            <p class="mt-2 font-medium">{{ peminjaman.petugas?.nama ?? '—' }}</p>
          </div>
          <div class="rounded-xl bg-slate-50/80 p-4 dark:bg-slate-800/50">
            <div class="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
              <Calendar class="h-3.5 w-3.5" />
              Periode
            </div>
            <p class="mt-2 font-medium text-sm">
              {{ formatDate(peminjaman.tglPinjam) }} — {{ formatDate(peminjaman.tglKembali) }}
            </p>
          </div>
          <div v-if="peminjaman.catatan" class="rounded-xl bg-slate-50/80 p-4 dark:bg-slate-800/50 sm:col-span-2 lg:col-span-1">
            <p class="text-xs text-slate-500 uppercase font-semibold">Catatan</p>
            <p class="mt-2 text-sm">{{ peminjaman.catatan }}</p>
          </div>
        </div>
      </div>

      <h2 class="font-display font-semibold text-lg mt-8 mb-4 flex items-center gap-2">
        <Package class="h-5 w-5 text-lab-500" />
        Item Dipinjam
      </h2>

      <div class="space-y-3 stagger">
        <div
          v-for="d in peminjaman.details"
          :key="d.idDetail"
          class="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 card-hover"
        >
          <div class="flex-1">
            <p class="font-semibold">{{ d.barang.namaBarang }}</p>
            <p class="text-xs text-slate-500">
              {{ d.barang.kodeBarang }} · {{ d.jumlah }} unit ·
              {{ formatRupiah(d.barang.harga) }}/unit
            </p>
            <p class="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
              Subtotal: {{ formatRupiah((d.barang.harga ?? 0) * d.jumlah) }}
            </p>
            <p v-if="d.kondisiKembali" class="text-xs mt-1 text-emerald-600">
              Kondisi kembali: {{ d.kondisiKembali }}
            </p>
          </div>

          <div
            v-if="auth.isStaff && ['DISETUJUI', 'DIPINJAM'].includes(peminjaman.status)"
            class="flex items-center gap-2"
          >
            <label class="text-xs text-slate-500">Kondisi:</label>
            <select
              v-model="returnKondisi[d.idDetail]"
              class="rounded-lg border py-1.5 px-2 text-sm dark:border-slate-700 dark:bg-slate-900/50"
            >
              <option value="BAIK">Baik</option>
              <option value="RUSAK_RINGAN">Rusak Ringan</option>
              <option value="RUSAK_BERAT">Rusak Berat</option>
            </select>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-1 text-sm font-medium text-lab-600 hover:text-lab-500 shrink-0"
            @click="router.push(`/detail-peminjaman/${d.idDetail}`)"
          >
            Detail item
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
