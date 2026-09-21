import type { NewspaperProcess } from './types'

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDuration(process: NewspaperProcess): string {
  if (process.duration_type === 'date_range') {
    const start = process.duration_start ? formatDate(process.duration_start) : '—'
    const end = process.duration_end ? formatDate(process.duration_end) : '—'
    return `${start} – ${end}`
  }
  if (process.duration_type === 'fixed') {
    return 'Fixed — no expiration'
  }
  return process.duration_note || 'See note'
}
