const VALID_CATEGORIES = ['internal', 'guest_related', 'listing_related']
const VALID_DURATION_TYPES = ['date_range', 'fixed', 'other']

export function validateProcessInput(body: Record<string, unknown>): string | null {
  const { category, title, content_html, duration_type, duration_start, duration_end, duration_note } = body

  if (!category || !VALID_CATEGORIES.includes(String(category))) return 'A valid category is required'
  if (!title || !String(title).trim()) return 'Title is required'
  if (!content_html || !String(content_html).trim()) return 'Process content is required'
  if (!duration_type || !VALID_DURATION_TYPES.includes(String(duration_type))) return 'A valid duration option is required'

  if (duration_type === 'date_range') {
    if (!duration_start || !duration_end) return 'Start date and end date are required'
    if (String(duration_end) < String(duration_start)) return 'End date must not be earlier than start date'
  }
  if (duration_type === 'other' && !String(duration_note ?? '').trim()) {
    return 'A note explaining the duration is required'
  }

  return null
}
