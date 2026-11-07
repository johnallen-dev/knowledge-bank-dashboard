import { NextResponse } from 'next/server'
import { getDistinctBuildings, getDistinctPersonnel, getDistinctCustomItemLabels } from '@/lib/db/queries/inventory'
import { BUILDING_OPTIONS, LOCATION_GROUPS, LINEN_OWNER_OPTIONS, LINEN_OWNER_LABELS, INVENTORY_DATES } from '@/lib/inventory/types'

export const dynamic = 'force-dynamic'

const LOCATION_OPTIONS = Object.values(LOCATION_GROUPS).flatMap(g => g.options)

/** Bundles distinct-value lookups for the Summary filter dropdowns. Buildings/items
 * merge the fixed lists with whatever custom values have actually been entered, so
 * filters work for custom buildings/items without a redeploy. Location options are a
 * closed list (location_option is always one of LOCATION_GROUPS' values), so no
 * distinct-value lookup is needed there. */
export async function GET() {
  try {
    const [buildings, personnel, customItems] = await Promise.all([
      getDistinctBuildings(),
      getDistinctPersonnel(),
      getDistinctCustomItemLabels(),
    ])
    const allBuildings = Array.from(new Set([...BUILDING_OPTIONS, ...buildings])).sort()

    return NextResponse.json({
      buildings: allBuildings,
      locationOptions: LOCATION_OPTIONS,
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
