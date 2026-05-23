import type { StatusPeminjaman } from '@/types/api'

export const statusConfig: Record<
  StatusPeminjaman,
  { label: string; class: string; dot: string }
> = {
  MENUNGGU: {
    label: 'Menunggu',
    class:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  DISETUJUI: {
    label: 'Disetujui',
    class: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  DIPINJAM: {
    label: 'Dipinjam',
    class:
      'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  DIKEMBALIKAN: {
    label: 'Dikembalikan',
    class:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  DITOLAK: {
    label: 'Ditolak',
    class: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
}
