import { NextRequest, NextResponse } from 'next/server'
import {
  getOverviewStats, getItemBreakdown, getItemBreakdownByLocation, getBuildingLocationBreakdown, listSummaryRecords,
} from '@/lib/db/queries/inventory'
import { shapeItemBreakdown } from '@/lib/inventory/aggregation'
import { getDisplayStatus } from '@/lib/inventory/statusLabel'
import { LINEN_OWNER_LABELS, INVENTORY_STATUS_LABELS, ITEM_CATEGORY_LABELS } from '@/lib/inventory/types'
import type { LinenOwner, ItemCategory } from '@/lib/inventory/types'

export const dynamic = 'force-dynamic'

function parseFilters(searchParams: URLSearchParams) {
  return {
    inventory_date: searchParams.get('inventory_date') as never ?? undefined,
    building: searchParams.get('building')?.split(',').filter(Boolean) ?? undefined,
    location_option: searchParams.get('location_option')?.split(',').filter(Boolean) ?? undefined,
    linen_owner: searchParams.get('linen_owner')?.split(',').filter(Boolean) as never ?? undefined,
    personnel: searchParams.get('personnel')?.split(',').filter(Boolean) ?? undefined,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filters = parseFilters(searchParams)

    const [overview, itemRows, itemByLocationRows, buildingRows, records] = await Promise.all([
      getOverviewStats(filters),
      getItemBreakdown(filters),
      getItemBreakdownByLocation(filters),
      getBuildingLocationBreakdown(filters),
      listSummaryRecords({ ...filters, limit: 10000, page: 1 }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const xlsx = require('xlsx')
    const wb = xlsx.utils.book_new()

    const overviewSheetRows = [
      { Metric: 'Sheets Submitted', Value: overview.totalSubmitted },
      { Metric: 'Pieces Counted', Value: overview.totalPiecesCounted },
      { Metric: 'Item Lines Counted', Value: overview.totalItemsCounted },
      { Metric: 'Properties Covered', Value: overview.totalBuildings },
      { Metric: 'Locations Covered', Value: overview.totalLocations },
      { Metric: 'Nov 9 Sheets', Value: overview.sheetsNov9 },
      { Metric: 'Nov 10 Sheets', Value: overview.sheetsNov10 },
      { Metric: 'Needing Review', Value: overview.needingReview },
    ]
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(overviewSheetRows), 'Overview')

    const itemBreakdownRows = shapeItemBreakdown(itemRows).flatMap(cat =>
      cat.items.map(item => ({
        Category: cat.categoryLabel,
        Item: item.item_label,
        'Total Pieces': item.total_pieces,
        'Sheets Counted': item.sheets_counted,
      })),
    )
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(itemBreakdownRows), 'Item Breakdown')

    // Unlike the "Item Breakdown" sheet above (which totals each item across every
    // property/area), this keeps each property+area+owner's item counts separate, so
    // e.g. "Sheets 90 cm" at Arctic/Storeroom and at Arctic/Trolley show as distinct
    // rows rather than one combined number. Only items actually counted somewhere
    // appear — no zero-filling, since a blank item on a given sheet means "not
    // counted" there, not "counted as zero".
    const itemByLocationSheetRows = itemByLocationRows.map(r => ({
      Property: r.building,
      Area: r.location_label,
      Owner: r.linen_owner ? LINEN_OWNER_LABELS[r.linen_owner as LinenOwner] ?? r.linen_owner : '',
      Category: ITEM_CATEGORY_LABELS[r.category as ItemCategory] ?? r.category,
      Item: r.item_label,
      'Total Pieces': r.total_pieces,
      'Sheets Counted': r.sheets_counted,
    }))
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(itemByLocationSheetRows), 'Items by Property & Area')

    const propertyAreaRows = buildingRows.map(r => ({
      Property: r.building,
      Area: r.location_label,
      Owner: r.linen_owner ? LINEN_OWNER_LABELS[r.linen_owner as LinenOwner] ?? r.linen_owner : '',
      'Sheet Count': r.sheet_count,
      'Total Pieces': r.total_pieces,
    }))
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(propertyAreaRows), 'Property-Area Breakdown')

    const recordRows = records.sheets.map(s => ({
      'Sheet No.': s.sheet_no,
      Date: s.inventory_date,
      Time: s.time_of_count ?? '',
      Personnel: s.personnel_name,
      Property: s.building,
      Area: s.location_label,
      Owner: s.linen_owner ? LINEN_OWNER_LABELS[s.linen_owner as LinenOwner] ?? s.linen_owner : '',
      'Total Pieces': s.total_pieces,
      Status: INVENTORY_STATUS_LABELS[getDisplayStatus(s)],
    }))
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(recordRows), 'Detailed Records')

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const filename = `inventory-summary-${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/inventory/summary/export]', err)
    return NextResponse.json({ error: 'Failed to export summary' }, { status: 500 })
  }
}
