export type SheetStatus = 'draft' | 'submitted' | 'superseded'
export type DisplayStatus = 'draft' | 'submitted' | 'recounted' | 'superseded'

export type LocationCategory = 'hotel_storeroom' | 'laundry'
export type LinenOwner = 'ours_greenkey' | 'alvas_own' | 'customer' | 'not_sure'
export type ItemCategory = 'bed_linen' | 'towels' | 'kitchen' | 'other'
export type InventoryDateKey = '2026-11-09' | '2026-11-10'

export const BUILDING_OPTIONS = [
  'Aska Holt hotel',
  'B18 & B20',
  'Strand',
  'Alva Hallveigarstígur',
  'Alva Rauðarárstígur 27',
  'Alva Brautarholt',
  'Vesturgata',
  'Dalshraun',
  'Vellir',
  'Heiðmörk',
  'Arctic',
  'Lokastígur',
  'CityHub',
  'Aska Holt: apartments linen, staff room',
  'Vera',
  'Sóleyjargata',
  'Island apartments',
  'Laundry (Þvottahúsið)',
] as const

export const OTHER_BUILDING_VALUE = 'other'

export const INVENTORY_DATES: { value: InventoryDateKey; label: string }[] = [
  { value: '2026-11-09', label: 'November 9, 2026 (Monday)' },
  { value: '2026-11-10', label: 'November 10, 2026 (Tuesday)' },
]

export const LOCATION_GROUPS: Record<LocationCategory, { label: string; options: string[] }> = {
  hotel_storeroom: {
    label: 'At a Hotel',
    options: ['Storeroom', 'Corridor cupboard or open shelf', 'Trolley or cart', 'Somewhere else'],
  },
  laundry: {
    label: 'At the Laundry',
    options: [
      'Clean stock',
      'Packed for delivery',
      'Still in machines, dryers or folding',
      "Monday's dirty linen (Tuesday, at sorting)",
    ],
  },
}

export const LINEN_OWNER_LABELS: Record<LinenOwner, string> = {
  ours_greenkey: 'Ours (GreenKey)',
  alvas_own: "Alva's own",
  customer: 'Customer',
  not_sure: 'Not sure',
}

export const LINEN_OWNER_OPTIONS: LinenOwner[] = ['ours_greenkey', 'alvas_own', 'customer', 'not_sure']

export interface FixedItemDef {
  key: string
  label: string
}

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  bed_linen: 'Bed Linen',
  towels: 'Towels',
  kitchen: 'Kitchen',
  other: 'Other Items',
}

export const ITEM_CATEGORY_ORDER: ItemCategory[] = ['bed_linen', 'towels', 'kitchen', 'other']

export const FIXED_ITEMS: Record<Exclude<ItemCategory, 'other'>, FixedItemDef[]> = {
  bed_linen: [
    { key: 'sheets_90', label: 'Sheets 90 cm' },
    { key: 'sheets_140', label: 'Sheets 140 cm' },
    { key: 'sheets_160', label: 'Sheets 160 cm' },
    { key: 'sheets_180', label: 'Sheets 180 cm' },
    { key: 'duvet_single', label: 'Duvet covers, single' },
    { key: 'duvet_double', label: 'Duvet covers, double' },
    { key: 'pillowcases', label: 'Pillowcases' },
  ],
  towels: [
    { key: 'towels_big', label: 'Big towels' },
    { key: 'towels_small', label: 'Small towels' },
    { key: 'towels_face', label: 'Face towels' },
    { key: 'bath_mats', label: 'Bath mats' },
  ],
  kitchen: [
    { key: 'kitchen_towels', label: 'Kitchen towels' },
    { key: 'kitchen_cloths', label: 'Kitchen cloths' },
  ],
}

export const INVENTORY_RULES: string[] = [
  'None there? Write 0 (not a dash or X).',
  'Empty box means you did not count it.',
  'Wrong number? Cross out the previous number and write the new number.',
  'Count single pieces, not packs.',
  'Count clean linen only. Only the laundry counts dirty linen.',
  'Do not count linen inside guest rooms or guest apartments.',
  'Two owners in one place? Use two separate sheets.',
]

export const INVENTORY_STATUS_LABELS: Record<DisplayStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  recounted: 'Recounted',
  superseded: 'Superseded',
}

export interface InventorySheet {
  id: number
  sheet_no: string
  status: SheetStatus
  personnel_name: string
  inventory_date: InventoryDateKey | ''
  building: string
  building_is_custom: boolean
  location_category: LocationCategory | ''
  location_option: string
  location_label: string
  linen_owner: LinenOwner | ''
  linen_owner_customer_name: string | null
  time_of_count: string | null
  original_sheet_id: number | null
  needs_review: boolean
  needs_review_note: string | null
  created_by: string
  created_at: string
  submitted_by: string | null
  submitted_at: string | null
  last_edited_by: string | null
  last_edited_at: string | null
  updated_at: string
}

export interface InventorySheetItem {
  id: number
  sheet_id: number
  category: ItemCategory
  item_key: string
  item_label: string
  is_custom_item: boolean
  quantity: number | null
  sort_order: number
}

export interface InventorySheetWithItems extends InventorySheet {
  items: InventorySheetItem[]
  display_status: DisplayStatus
}

export type SheetEventType =
  | 'created_draft'
  | 'submitted'
  | 'edited'
  | 'recount_created'
  | 'superseded'
  | 'became_latest'

export interface InventorySheetEvent {
  id: number
  sheet_id: number
  event_type: SheetEventType
  actor: string | null
  related_sheet_id: number | null
  revision_id: number | null
  detail: Record<string, unknown> | null
  event_at: string
}

export interface InventorySheetRevision {
  id: number
  sheet_id: number
  snapshot: { sheet: Partial<InventorySheet>; items: InventorySheetItem[] }
  change_note: string | null
  edited_by: string
  edited_at: string
}

/** Input shape the form/API exchange for creating or updating a sheet's header + items. */
export interface SheetInput {
  personnel_name: string
  inventory_date: InventoryDateKey | ''
  building: string
  building_is_custom: boolean
  location_category: LocationCategory | ''
  location_option: string
  location_label: string
  linen_owner: LinenOwner | ''
  linen_owner_customer_name: string | null
  time_of_count: string | null
  original_sheet_id: number | null
  items: { category: ItemCategory; item_key: string; item_label: string; is_custom_item: boolean; quantity: number | null }[]
}

export interface SheetFilters {
  status?: SheetStatus | SheetStatus[]
  inventory_date?: InventoryDateKey
  building?: string | string[]
  location_label?: string | string[]
  linen_owner?: LinenOwner | LinenOwner[]
  personnel?: string | string[]
  needs_review?: boolean
  search?: string
  page?: number
  limit?: number
}
