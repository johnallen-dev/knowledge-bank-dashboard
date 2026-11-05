import { NextRequest, NextResponse } from 'next/server'
import { getReadableHistory } from '@/lib/inventory/auditTrail'
import { listSheetRevisions } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const [history, revisions] = await Promise.all([getReadableHistory(id), listSheetRevisions(id)])
    return NextResponse.json({ history, revisions })
  } catch (err) {
    console.error('[GET /api/inventory/sheets/[id]/history]', err)
    return NextResponse.json({ error: 'Failed to load sheet history' }, { status: 500 })
  }
}
