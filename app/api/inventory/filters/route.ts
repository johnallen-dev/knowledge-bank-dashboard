import { NextResponse } from 'next/server'
import { getDistinctBuildings, getDistinctLocationLabels, getDistinctPersonnel, getDistinctCustomItemLabels } from '@/lib/db/queries/inventory'
import { BUILDING_OPTIONS, LINEN_OWNER_OPTIONS, LINEN_OWNER_LABELS, INVENTORY_DATES } from '@/lib/inventory/types'

export const dynamic = 'force-dynamic'

/** Bundles distinct-value lookups for the Summary filter dropdowns. Buildings/items
 * merge the fixed lists with whatever custom values have actually been entered, so
 * filters work for custom buildings/items without a redeploy. */
export async function GET() {
  try {
    const [buildings, locationLabels, personnel, customItems] = await Promise.all([
      getDistinctBuildings(),
      getDistinctLocationLabels(),
      getDistinctPersonnel(),
      getDistinctCustomItemLabels(),
    ])
    const allBuildings = Array.from(new Set([...BUILDING_OPTIONS, ...buildings])).sort()

    return NextResponse.json({
      buildings: allBuildings,
      locationLabels,
      personnel,
      customItems,
      owners: LINEN_OWNER_OPTIONS.map(value => ({ value, label: LINEN_OWNER_LABELS[value] })),
      dates: INVENTORY_DATES,
    })
  } catch (err) {
    console.error('[GET /api/inventory/filters]', err)
    return NextResponse.json({ error: 'Failed to load filters' }, { status: 500 })
  }
}
