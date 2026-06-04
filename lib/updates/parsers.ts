const MAX_CHARS = 50_000

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('pdf-parse')
    const pdfParse = typeof mod === 'function' ? mod : (mod.default ?? mod)
    const result = await pdfParse(buffer, { max: 0 }) // max:0 = parse all pages
    if (!result || typeof result.text !== 'string') {
      throw new Error('pdf-parse returned no text')
    }
    return clean(result.text)
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    ext === 'xlsx'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const xlsx = require('xlsx')
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const parts: string[] = []
    for (const name of workbook.SheetNames) {
      parts.push(xlsx.utils.sheet_to_txt(workbook.Sheets[name]))
    }
    return clean(parts.join('\n\n'))
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return clean(result.value)
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}`)
}

function clean(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\S\n]+/g, ' ')   // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')  // collapse 3+ blank lines
    .trim()
    .slice(0, MAX_CHARS)
}
