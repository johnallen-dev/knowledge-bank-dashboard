import { Suspense } from 'react'
import { InventoryForm } from '@/components/inventory/InventoryForm'

export default function InventoryInputsPage() {
  return (
    <Suspense>
      <InventoryForm />
    </Suspense>
  )
}
