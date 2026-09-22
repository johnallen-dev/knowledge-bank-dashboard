import type { ProcessCategory } from './types'

export const CATEGORY_COLOR: Record<ProcessCategory, string> = {
  internal: '#1d4ed8',
  guest_related: '#b91c1c',
  listing_related: '#15803d',
}

export const CATEGORY_TINT: Record<ProcessCategory, string> = {
  internal: '#eff4ff',
  guest_related: '#fdf1ef',
  listing_related: '#f0f9f1',
}
