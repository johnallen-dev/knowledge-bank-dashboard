import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromBuffer } from '@/lib/updates/parsers'
import { createDocument } from '@/lib/db/queries/updates'

const MAX_BYTES = 50_000_000

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ALLOWED_EXTS = new Set(['pdf', 'xlsx', 'docx'])

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTS.has(ext)) {
      return NextResponse.json({ error: 'Unsupported file type. Upload PDF, XLSX, or DOCX.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const extractedText = await extractTextFromBuffer(buffer, file.type, file.name)

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Could not extract any text from the file.' }, { status: 422 })
    }

    const title = file.name.replace(/\.[^.]+$/, '')
    const documentId = await createDocument({
      title,
      filename: file.name,
      file_type: ext,
      extracted_text: extractedText,
    })

    return NextResponse.json({
      documentId,
      charCount: extractedText.length,
      preview: extractedText.slice(0, 1500),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/updates/upload]', message)
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 })
  }
}
