'use client'
import { Fragment, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { X, History, GitCompare, Flag } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { EditSheetButton } from './EditSheetButton'
import { InventoryAuditHistory } from './InventoryAuditHistory'
import { InventoryRecountCompare } from './InventoryRecountCompare'
import { getDisplayStatus } from '@/lib/inventory/statusLabel'
import { ITEM_CATEGORY_ORDER, ITEM_CATEGORY_LABELS, LINEN_OWNER_LABELS } from '@/lib/inventory/types'
import type { InventorySheet, InventorySheetItem, LinenOwner } from '@/lib/inventory/types'

type View = 'detail' | 'compare' | 'history'

interface SheetDetailData {
  sheet: InventorySheet
  items: InventorySheetItem[]
  recountOf: InventorySheet | null
  recountedBy: InventorySheet | null
}

export function InventorySheetDetail({ sheetId, onClose, onChanged }: { sheetId: number; onClose: () => void; onChanged: () => void }) {
  const [view, setView] = useState<View>('detail')
  const [data, setData] = useState<SheetDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    fetch(`/api/inventory/sheets/${sheetId}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => toast.error('Failed to load sheet'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [sheetId])

  async function toggleNeedsReview() {
    if (!data) return
    const flagged = !data.sheet.needs_review
    try {
      const res = await fetch(`/api/inventory/sheets/${sheetId}/review`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flagged }),
      })
      if (!res.ok) throw new Error()
      toast.success(flagged ? 'Flagged for review' : 'Review flag cleared')
      load()
      onChanged()
    } catch {
      toast.error('Failed to update review flag')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">
            {view === 'detail' ? 'Sheet Detail' : view === 'compare' ? 'Recount Comparison' : 'Audit History'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading || !data ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : view === 'history' ? (
          <>
            <InventoryAuditHistory sheetId={sheetId} />
            <Button variant="outline" size="sm" onClick={() => setView('detail')}>Back</Button>
          </>
        ) : view === 'compare' ? (
          <>
            <InventoryRecountCompare sheetId={sheetId} />
            <Button variant="outline" size="sm" onClick={() => setView('detail')}>Back</Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-sm">{data.sheet.sheet_no}</span>
              <StatusBadge status={getDisplayStatus(data.sheet)} />
              {data.sheet.needs_review && <span className="text-xs text-red-600 font-medium">Flagged for review</span>}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Field label="Name" value={data.sheet.personnel_name} />
              <Field label="Date" value={data.sheet.inventory_date} />
              <Field label="Building" value={data.sheet.building} />
              <Field label="Location" value={data.sheet.location_label} />
              <Field label="Owner" value={data.sheet.linen_owner ? LINEN_OWNER_LABELS[data.sheet.linen_owner as LinenOwner] : '—'} />
              {data.sheet.linen_owner_customer_name && <Field label="Customer" value={data.sheet.linen_owner_customer_name} />}
              <Field label="Time" value={data.sheet.time_of_count ?? '—'} />
              <Field label="Submitted" value={data.sheet.submitted_at ?? '—'} />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {ITEM_CATEGORY_ORDER.map(category => {
                    const rows = data.items.filter(i => i.category === category)
                    if (rows.length === 0) return null
                    return (
                      <Fragment key={category}>
                        <tr className="bg-muted/30">
                          <th colSpan={2} className="px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            {ITEM_CATEGORY_LABELS[category]}
                          </th>
                        </tr>
                        {rows.map(item => (
                          <tr key={item.item_key}>
                            <td className="px-3 py-1.5">{item.item_label}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">{item.quantity ?? '—'}</td>
                          </tr>
                        ))}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(data.recountOf || data.recountedBy) && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setView('compare')}>
                  <GitCompare className="h-3.5 w-3.5" />
                  Compare Recount
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setView('history')}>
                <History className="h-3.5 w-3.5" />
                Audit History
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={toggleNeedsReview}>
                <Flag className="h-3.5 w-3.5" />
                {data.sheet.needs_review ? 'Clear Review Flag' : 'Flag for Review'}
              </Button>
              {(data.sheet.status === 'submitted') && <EditSheetButton sheetId={sheetId} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  )
}
