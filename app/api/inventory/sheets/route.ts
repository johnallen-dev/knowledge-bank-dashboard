import { NextRequest, NextResponse } from 'next/server'
import { createDraftSheet, listSheets, logSheetEvent, getSheetItems } from '@/lib/db/queries/inventory'
import { createRecountDraft, RecountConflictError } from '@/lib/inventory/recount'
import { normalizeItemsForSave } from '@/lib/inventory/items'
import type { SheetInput, SheetStatus } from '@/lib/inventory/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')
    const result = await listSheets({
      status: statusParam ? (statusParam.split(',') as SheetStatus[]) : undefined,
      inventory_date: searchParams.get('inventory_date') as never ?? undefined,
      building: searchParams.get('building') ?? undefined,
      personnel: searchParams.get('personnel') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/inventory/sheets]', err)
    return NextResponse.json({ error: 'Failed to list sheets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const createdBy = String(body.personnel_name ?? body.created_by ?? '').trim()
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
      items: normalizeItemsForSave(Array.isArray(body.items) ? body.items : []),
    }

    if (body.original_sheet_id) {
      const sheet = await createRecountDraft(Number(body.original_sheet_id), input, createdBy)
      const items = await getSheetItems(sheet.id)
      return NextResponse.json({ sheet, items }, { status: 201 })
    }

    const sheet = await createDraftSheet(input, createdBy)
    await logSheetEvent(sheet.id, 'created_draft', createdBy)
    const items = await getSheetItems(sheet.id)
    return NextResponse.json({ sheet, items }, { status: 201 })
  } catch (err) {
    if (err instanceof RecountConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error('[POST /api/inventory/sheets]', err)
    return NextResponse.json({ error: 'Failed to create sheet' }, { status: 500 })
  }
}
