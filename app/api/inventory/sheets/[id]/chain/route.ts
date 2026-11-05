import { NextRequest, NextResponse } from 'next/server'
import { getChainView } from '@/lib/inventory/recount'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const chain = await getChainView(id)
    return NextResponse.json({ chain })
  } catch (err) {
    console.error('[GET /api/inventory/sheets/[id]/chain]', err)
    return NextResponse.json({ error: 'Failed to load recount chain' }, { status: 500 })
  }
}
