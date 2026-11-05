export const INVENTORY_PASSWORD = '0915'

export function isValidInventoryPassword(input: string): boolean {
  return input === INVENTORY_PASSWORD
}

export function inventoryAuthHeader(): Record<string, string> {
  return { Authorization: `Bearer ${INVENTORY_PASSWORD}` }
}
