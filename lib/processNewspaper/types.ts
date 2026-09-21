export type ProcessCategory = 'internal' | 'guest_related' | 'listing_related'
export type DurationType = 'date_range' | 'fixed' | 'other'
export type ProcessStatus = 'active' | 'upcoming' | 'expired' | 'disabled'

export interface NewspaperProcess {
  id: number
  uuid: string
  category: ProcessCategory
  title: string
  content_html: string
  duration_type: DurationType
  duration_start: string | null
  duration_end: string | null
  duration_note: string | null
  special_note: string | null
  is_disabled: boolean
  featured_in_cycle: boolean
  last_headline_at: string | null
  last_supporting_at: string | null
  created_at: string
  updated_at: string
}

export interface NewspaperProcessWithStatus extends NewspaperProcess {
  status: ProcessStatus
}

export interface ProcessInput {
  category: ProcessCategory
  title: string
  content_html: string
  duration_type: DurationType
  duration_start?: string | null
  duration_end?: string | null
  duration_note?: string | null
  special_note?: string | null
  is_disabled?: boolean
}

export interface NewspaperEdition {
  edition_date: string
  headline_process_id: number | null
  supporting_process_ids: number[]
  trivia_text: string | null
  created_at: string
}

export interface TodayEditionResponse {
  date: string
  headline: NewspaperProcess | null
  supporting: NewspaperProcess[]
  trivia: string | null
}

export const CATEGORY_LABELS: Record<ProcessCategory, string> = {
  internal: 'Internal',
  guest_related: 'Guest Related',
  listing_related: 'Listing Related',
}

export const STATUS_LABELS: Record<ProcessStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  expired: 'Expired',
  disabled: 'Disabled',
}
