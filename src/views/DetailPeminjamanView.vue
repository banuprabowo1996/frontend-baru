<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { detailPeminjamanApi } from '@/api/detailPeminjaman'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { DetailPeminjaman, Kondisi } from '@/types/api'
import { formatRupiah } from '@/utils/format'
import { ArrowLeft, Package, Hash, Layers, Shield, Banknote } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const loading = ref(true)
const detail = ref<DetailPeminjaman | null>(null)
const kondisi = ref<Kondisi>('BAIK')
const saving = ref(false)

const id = Number(route.params.id)

async function load() {
  loading.value = true
  try {
    detail.value = await detailPeminjamanApi.getById(id)
    if (detail.value.kondisiKembali) {
      kondisi.value = detail.value.kondisiKembali as Kondisi
    }
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Detail tidak ditemukan', 'error')
    router.back()
  } finally {
    loading.value = false
  }
}

async function updateKondisi() {
  saving.value = true
  try {
    detail.value = await detailPeminjamanApi.updateKondisi(id, kondisi.value)
    toast.show('Kondisi kembali diperbarui', 'success')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Gagal memperbarui', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-2xl mx-auto animate-fade-up">
    <button
      type="button"
      class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-lab-600"
      @click="router.back()"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali
    </button>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="detail">
      <div class="glass-strong rounded-3xl overflow-hidden">
        <div
          class="h-32 bg-gradient-to-br from-lab-500 via-accent-500 to-lab-600 relative"
        >
          <div
            class="absolute inset-0 opacity-30"
            style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px); background-size: 24px 24px"
          />
          <div class="absolute bottom-4 left-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-white">
            <Package class="h-8 w-8" />
          </div>
        </div>

        <div class="p-6 lg:p-8 -mt-2">
          <p class="text-xs font-bold uppercase tracking-widest text-lab-600 dark:text-lab-400">
            Detail Peminjaman #{{ detail.idDetail }}
          </p>
          <h1 class="font-display text-2xl font-bold mt-1 dark:text-white">
            {{ detail.barang.namaBarang }}
          </h1>
          <p class="text-slate-500 text-sm mt-1">{{ detail.barang.kodeBarang }}</p>

          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div class="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
                <Hash class="h-3.5 w-3.5" />
                Jumlah Dipinjam
              </div>
              <p class="mt-2 font-display text-3xl font-bold text-lab-600 dark:text-lab-400">
                {{ detail.jumlah }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div class="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
                <Banknote class="h-3.5 w-3.5" />
                Harga / Unit
              </div>
              <p class="mt-2 font-display text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {{ formatRupiah(detail.barang.harga) }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div class="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
                <Layers class="h-3.5 w-3.5" />
                Stok Tersedia
              </div>
              <p class="mt-2 font-display text-3xl font-bold">
                {{ detail.barang.jumlahTersedia }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:col-span-2">
              <div class="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
                Total Nilai Pinjam
              </div>
              <p class="mt-2 font-display text-2xl font-bold text-lab-600 dark:text-lab-400">
                {{ formatRupiah((detail.barang.harga ?? 0) * detail.jumlah) }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:col-span-2">
              <div class="flex items-center gap-2 text-xs text-slate-500 uppercase font-semibold">
                <Shield class="h-3.5 w-3.5" />
                Kondisi Barang
              </div>
              <p class="mt-2 font-medium">{{ detail.barang.kondisi }}</p>
              <p class="text-xs text-slate-500 mt-1">Lokasi: {{ detail.barang.lokasi || '—' }}</p>
            </div>
          </div>

          <div
            v-if="auth.isStaff"
            class="mt-8 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50"
          >
            <label class="text-xs font-semibold uppercase text-slate-500">
              Kondisi Saat Kembali
            </label>
            <select
              v-model="kondisi"
              class="mt-2 w-full rounded-xl border py-2.5 px-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
            >
              <option value="BAIK">Baik</option>
              <option value="RUSAK_RINGAN">Rusak Ringan</option>
              <option value="RUSAK_BERAT">Rusak Berat</option>
            </select>
            <button
              type="button"
              :disabled="saving"
              class="mt-4 w-full rounded-xl bg-lab-600 py-3 text-sm font-semibold text-white hover:bg-lab-500 disabled:opacity-60"
              @click="updateKondisi"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan Kondisi' }}
            </button>
          </div>

          <p
            v-else-if="detail.kondisiKembali"
            class="mt-6 text-sm text-emerald-600 dark:text-emerald-400"
          >
            Kondisi kembali: <strong>{{ detail.kondisiKembali }}</strong>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
