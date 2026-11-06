'use client'
import { Button } from '@/components/ui/button'
import { CheckCircle2, X, AlertTriangle } from 'lucide-react'

interface SubmitConfirmModalProps {
  mode: 'submit' | 'edit'
  building: string
  locationLabel: string
  ownerLabel: string
  totalPieces: number
  blankFixedItemCount: number
  submitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function SubmitConfirmModal({
  mode, building, locationLabel, ownerLabel, totalPieces, blankFixedItemCount, submitting, onConfirm, onCancel,
}: SubmitConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <h3 className="font-semibold">{mode === 'edit' ? 'Save Changes' : 'Submit Inventory'}</h3>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-sm space-y-1 text-muted-foreground">
          <p><span className="text-foreground font-medium">Property:</span> {building || '—'}</p>
          <p><span className="text-foreground font-medium">Location:</span> {locationLabel || '—'}</p>
          <p><span className="text-foreground font-medium">Owner:</span> {ownerLabel || '—'}</p>
          <p><span className="text-foreground font-medium">Total Pieces Counted:</span> {totalPieces}</p>
        </div>

        {blankFixedItemCount > 0 && (
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{blankFixedItemCount} fixed item(s) were left blank (not counted). That&apos;s fine if intentional — double-check before continuing.</span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" disabled={submitting} onClick={onCancel}>Cancel</Button>
          <Button className="flex-1" disabled={submitting} onClick={onConfirm}>
            {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
