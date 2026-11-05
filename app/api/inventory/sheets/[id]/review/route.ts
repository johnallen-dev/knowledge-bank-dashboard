import { NextRequest, NextResponse } from 'next/server'
import { setNeedsReview, getSheetById } from '@/lib/db/queries/inventory'

export const dynamic = 'force-dynamic'

/** Manual "needs review" flag only — no automatic discrepancy detection, per
 * product decision (there's no defined threshold for an automatic trigger). Any
 * user can toggle this from the Summary records table to flag a sheet for a human
 * to double-check later. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await req.json()
    await setNeedsReview(id, !!body.flagged, body.note ?? null)
    const sheet = await getSheetById(id)
    if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 })
    return NextResponse.json({ sheet })
  } catch (err) {
    console.error('[POST /api/inventory/sheets/[id]/review]', err)
    return NextResponse.json({ error: 'Failed to update review flag' }, { status: 500 })
  }
}
