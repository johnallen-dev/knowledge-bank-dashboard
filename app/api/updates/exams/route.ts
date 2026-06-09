import { NextResponse } from 'next/server'
import { listAllExams } from '@/lib/db/queries/updates'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const exams = await listAllExams()
    return NextResponse.json({ exams })
  } catch (err) {
    console.error('[GET /api/updates/exams]', err)
    return NextResponse.json({ error: 'Failed to load exams' }, { status: 500 })
  }
}
