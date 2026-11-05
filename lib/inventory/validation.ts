import { BUILDING_OPTIONS, OTHER_BUILDING_VALUE, INVENTORY_DATES, LOCATION_GROUPS, LINEN_OWNER_OPTIONS } from './types'
import type { SheetInput } from './types'

const VALID_DATE_KEYS = INVENTORY_DATES.map(d => d.value)

export function validateSheetDate(date: unknown): string | null {
  if (!date || !VALID_DATE_KEYS.includes(date as never)) {
    return 'Date must be either November 9, 2026 or November 10, 2026.'
  }
  return null
}

export function validateBuildingField(building: unknown, isCustom: unknown): string | null {
  if (isCustom) {
    if (!String(building ?? '').trim()) return 'Custom building name is required.'
    return null
  }
  if (!building || !BUILDING_OPTIONS.includes(building as never)) {
    return 'A valid building must be selected.'
  }
  return null
}

export function validateLocationField(input: {
  location_category?: unknown
  location_option?: unknown
  location_label?: unknown
}): string | null {
  const { location_category, location_option, location_label } = input
  if (!location_category || !(location_category === 'hotel_storeroom' || location_category === 'laundry')) {
    return 'A location category must be selected.'
  }
  const group = LOCATION_GROUPS[location_category as 'hotel_storeroom' | 'laundry']
  if (!location_option || !group.options.includes(String(location_option))) {
    return 'A valid location option must be selected.'
  }
  if (!String(location_label ?? '').trim()) {
    return 'Please name this place (e.g. "Storeroom, 2nd floor").'
  }
  return null
}

export function validateOwnerField(owner: unknown, customerName: unknown): string | null {
  if (!owner || !LINEN_OWNER_OPTIONS.includes(owner as never)) {
    return 'Whose linen this is must be selected.'
  }
  if (owner === 'customer' && !String(customerName ?? '').trim()) {
    return 'Customer name is required when "Customer" is selected.'
  }
  return null
}

/** Full server-side validation before a sheet can move from draft to submitted —
 * never trust the client-side form checks alone. */
export function validateRequiredForSubmit(input: Partial<SheetInput>): string[] {
  const errors: string[] = []

  if (!String(input.personnel_name ?? '').trim()) errors.push('Name is required.')

  const dateError = validateSheetDate(input.inventory_date)
  if (dateError) errors.push(dateError)

  const buildingError = validateBuildingField(input.building, input.building_is_custom)
  if (buildingError) errors.push(buildingError)

  const locationError = validateLocationField(input)
  if (locationError) errors.push(locationError)

  const ownerError = validateOwnerField(input.linen_owner, input.linen_owner_customer_name)
  if (ownerError) errors.push(ownerError)

  const hasAnyCountedItem = (input.items ?? []).some(i => i.quantity !== null && i.quantity !== undefined)
  if (!hasAnyCountedItem) errors.push('At least one item must be counted (entered as a number, including 0) before submitting.')

  return errors
}

export { OTHER_BUILDING_VALUE }
