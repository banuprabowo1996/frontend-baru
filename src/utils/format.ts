export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = value.includes('T') ? new Date(value) : new Date(value + 'T00:00:00')
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRupiah(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
