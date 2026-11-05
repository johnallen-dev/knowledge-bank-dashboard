import type { LocationCategory, LinenOwner, ItemCategory, InventoryDateKey } from '@/lib/inventory/types'

export interface ItemRow {
  id: string
  category: ItemCategory
  item_key: string
  item_label: string
  is_custom_item: boolean
  qty: number | null
}

export interface InventoryFormState {
  personnel_name: string
  inventory_date: InventoryDateKey | ''
  building: string
  isOtherBuilding: boolean
  otherBuildingName: string
  location_category: LocationCategory | ''
  location_option: string
  location_label: string
  linen_owner: LinenOwner | ''
  customerName: string
  items: ItemRow[]
  time_of_count: string
  isRecount: boolean
  original_sheet_id: number | null
  originalSheetLabel: string
}
