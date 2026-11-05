import { NextRequest, NextResponse } from 'next/server'
import { getSheetById, getSheetItems, updateDraftSheet } from '@/lib/db/queries/inventory'
import { submitOriginalSheet, submitRecount, RecountConflictError } from '@/lib/inventory/recount'
import { validateRequiredForSubmit } from '@/lib/inventory/validation'
import { normalizeItemsForSave } from '@/lib/inventory/items'
import type { SheetInput } from '@/lib/inventory/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const existing = await getSheetById(id)
    if (!existing) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 })
    if (existing.status !== 'draft') {
      return NextResponse.json({ error: 'Only a draft sheet can be submitted' }, { status: 409 })
    }

    const body = await req.json().catch(() => ({}))
    // Allow a final round of field edits to be submitted alongside the submit action,
    // same as the draft PATCH route — the submit button saves-then-submits in one call.
    if (Object.keys(body).length > 0) {
      const input: Partial<SheetInput> = {
        personnel_name: body.personnel_name ?? existing.personnel_name,
        inventory_date: body.inventory_date ?? existing.inventory_date,
        building: body.building ?? existing.building,
        building_is_custom: body.building_is_custom ?? existing.building_is_custom,
        location_category: body.location_category ?? existing.location_category,
        location_option: body.location_option ?? existing.location_option,
        location_label: body.location_label ?? existing.location_label,
        linen_owner: body.linen_owner ?? existing.linen_owner,
        linen_owner_customer_name: body.linen_owner_customer_name ?? existing.linen_owner_customer_name,
        time_of_count: body.time_of_count ?? existing.time_of_count,
        original_sheet_id: body.original_sheet_id ?? existing.original_sheet_id,
        items: Array.isArray(body.items) ? normalizeItemsForSave(body.items) : undefined,
      }
      await updateDraftSheet(id, input)
    }

    const current = await getSheetById(id)
    const items = await getSheetItems(id)
    const errors = validateRequiredForSubmit({
      personnel_name: current!.personnel_name,
      inventory_date: current!.inventory_date,
      building: current!.building,
      building_is_custom: current!.building_is_custom,
      location_category: current!.location_category,
      location_option: current!.location_option,
      location_label: current!.location_label,
      linen_owner: current!.linen_owner,
      linen_owner_customer_name: current!.linen_owner_customer_name,
      items,
    })
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    const submittedBy = String(body.submitted_by ?? current!.personnel_name ?? '').trim() || current!.personnel_name
    const sheet = current!.original_sheet_id
      ? await submitRecount(id, submittedBy)
      : await submitOriginalSheet(id, submittedBy)

    return NextResponse.json({ sheet, items: await getSheetItems(id) })
  } catch (err) {
    if (err instanceof RecountConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error('[POST /api/inventory/sheets/[id]/submit]', err)
    return NextResponse.json({ error: 'Failed to submit sheet' }, { status: 500 })
  }
}
