/**
 * Unique ID format: MMDDYYYY + first 3 letters of the agent's (first) name, lowercase.
 * e.g. date "2026-08-28", agent "Allen" -> "08282026all"
 */
export function generateUniqueId(dateStr: string, agentName: string): string {
  const [year, month, day] = dateStr.split('-')
  const mmddyyyy = `${month}${day}${year}`
  const firstName = agentName.trim().split(/\s+/)[0] ?? ''
  const suffix = firstName.slice(0, 3).toLowerCase()
  return `${mmddyyyy}${suffix}`
}
