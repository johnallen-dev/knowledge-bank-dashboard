import { NextRequest, NextResponse } from 'next/server'
import { deleteExam } from '@/lib/db/queries/updates'

const ADMIN_PASSWORD = '00000'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (req.headers.get('authorization') !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await deleteExam(Number(params.id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/updates/exams/:id]', err)
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 })
  }
}
