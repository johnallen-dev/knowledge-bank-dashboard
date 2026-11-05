import { NextRequest, NextResponse } from 'next/server'
import { isValidInventoryPassword } from '@/lib/inventory/auth'
import { editSubmittedSheet } from '@/lib/inventory/auditTrail'
import { normalizeItemsForSave } from '@/lib/inventory/items'
import type { SheetInput } from '@/lib/inventory/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization') ?? ''
  const password = authHeader.replace(/^Bearer\s+/i, '')
  if (!isValidInventoryPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = Number(params.id)
    const body = await req.json()
    const editedBy = String(body.edited_by ?? '').trim()
    if (!editedBy) {
      return NextResponse.json({ error: 'edited_by is required' }, { status: 400 })
    }

    const patch: Partial<SheetInput> = {
      personnel_name: body.personnel_name,
      inventory_date: body.inventory_date,
      building: body.building,
      building_is_custom: !!body.building_is_custom,
      location_category: body.location_category,
      location_option: body.location_option,
      location_label: body.location_label,
      linen_owner: body.linen_owner,
      linen_owner_customer_name: body.linen_owner_customer_name ?? null,
      time_of_count: body.time_of_count ?? null,
      items: Array.isArray(body.items) ? normalizeItemsForSave(body.items) : undefined,
    }

    const { sheet, changes } = await editSubmittedSheet(id, patch, editedBy, body.change_note ?? null)
    return NextResponse.json({ sheet, changes })
  } catch (err) {
    console.error('[POST /api/inventory/sheets/[id]/edit]', err)
    return NextResponse.json({ error: 'Failed to edit sheet' }, { status: 500 })
  }
}
