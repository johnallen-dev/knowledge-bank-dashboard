export const QA_REPORT_PASSWORD = '0915'

export function isValidQaReportPassword(input: string): boolean {
  return input === QA_REPORT_PASSWORD
}

export function qaReportAuthHeader(): Record<string, string> {
  return { Authorization: `Bearer ${QA_REPORT_PASSWORD}` }
}
