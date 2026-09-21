import type { NewspaperProcess, ProcessStatus } from './types'

export function getProcessStatus(process: NewspaperProcess, todayStr: string): ProcessStatus {
  if (process.is_disabled) return 'disabled'
  if (process.duration_type === 'date_range') {
    if (process.duration_start && todayStr < process.duration_start) return 'upcoming'
    if (process.duration_end && todayStr > process.duration_end) return 'expired'
  }
  return 'active'
}

export function isProcessEligible(process: NewspaperProcess, todayStr: string): boolean {
  return getProcessStatus(process, todayStr) === 'active'
}
