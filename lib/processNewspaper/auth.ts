export const NEWSPAPER_PASSWORD = '0915'

export function isValidNewspaperPassword(input: string): boolean {
  return input === NEWSPAPER_PASSWORD
}

export function newspaperAuthHeader(): Record<string, string> {
  return { Authorization: `Bearer ${NEWSPAPER_PASSWORD}` }
}
