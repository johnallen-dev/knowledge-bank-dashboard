import { NextRequest, NextResponse } from 'next/server'
import {
  getSheetById, getSheetItems, updateDraftSheet, deleteDraftSheet,
  getRecountOf, getRecountedBy,
} from '@/lib/db/queries/inventory'
import { getDisplayStatus } from '@/lib/inventory/statusLabel'
import { normalizeItemsForSave } from '@/lib/inventory/items'
import type { SheetInput } from '@/lib/inventory/types'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const sheet = await getSheetById(id)
    if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 })

    const [items, recountOf, recountedBy] = await Promise.all([
      getSheetItems(id),
      getRecountOf(id),
      getRecountedBy(id),
    ])

    return NextResponse.json({
      sheet, items,
      displayStatus: getDisplayStatus(sheet),
      recountOf, recountedBy,
    })
  } catch (err) {
    console.error('[GET /api/inventory/sheets/[id]]', err)
    return NextResponse.json({ error: 'Failed to load sheet' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await req.json()
    const input: Partial<SheetInput> = {
      personnel_name: body.personnel_name ?? '',
      inventory_date: body.inventory_date ?? '',
      building: body.building ?? '',
      building_is_custom: !!body.building_is_custom,
      location_category: body.location_category ?? '',
      location_option: body.location_option ?? '',
      location_label: body.location_label ?? '',
      linen_owner: body.linen_owner ?? '',
      linen_owner_customer_name: body.linen_owner_customer_name ?? null,
      time_of_count: body.time_of_count ?? null,
      original_sheet_id: body.original_sheet_id ?? null,
      items: Array.isArray(body.items) ? normalizeItemsForSave(body.items) : undefined,
    }
    const ok = await updateDraftSheet(id, input)
    if (!ok) return NextResponse.json({ error: 'Sheet not found or is no longer a draft' }, { status: 409 })

    const sheet = await getSheetById(id)
    const items = await getSheetItems(id)
    return NextResponse.json({ sheet, items })
  } catch (err) {
    console.error('[PATCH /api/inventory/sheets/[id]]', err)
    return NextResponse.json({ error: 'Failed to update sheet' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const ok = await deleteDraftSheet(id)
    if (!ok) return NextResponse.json({ error: 'Sheet not found or is no longer a draft' }, { status: 409 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/inventory/sheets/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete sheet' }, { status: 500 })
  }
}
