'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileEdit } from 'lucide-react'

/** Navigates to the Inputs form in edit mode — InventoryForm itself prompts for the
 * authorization password (via PasswordPromptModal) before allowing any changes, so
 * this button doesn't need its own password step. */
export function EditSheetButton({ sheetId }: { sheetId: number }) {
  const router = useRouter()
  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/inventory/inputs?editId=${sheetId}`)}>
      <FileEdit className="h-3.5 w-3.5" />
      Edit
    </Button>
  )
}
