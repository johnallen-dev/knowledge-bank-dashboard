import type { ProcessCategory } from './types'

export const CATEGORY_COLOR: Record<ProcessCategory, string> = {
  internal: '#234F70',
  guest_related: '#A44732',
  listing_related: '#52765C',
}

export const CATEGORY_TINT: Record<ProcessCategory, string> = {
  internal: '#eaf0f5',
  guest_related: '#f6e9e4',
  listing_related: '#e9f0ea',
}

export const PAPER = {
  background: '#FFFCF5',
  primaryText: '#1C1C1C',
  secondaryText: '#555555',
  divider: '#C8C0B2',
}
