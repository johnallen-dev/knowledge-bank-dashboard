'use client'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { InventorySheetDetail } from './InventorySheetDetail'
import { EditSheetButton } from './EditSheetButton'
import { DeleteSheetButton } from './DeleteSheetButton'
import { LINEN_OWNER_LABELS } from '@/lib/inventory/types'
import type { InventorySheet, LinenOwner, DisplayStatus } from '@/lib/inventory/types'
import type { SummaryFilters } from './InventoryFilters'

type RecordRow = InventorySheet & { total_pieces: number; displayStatus: DisplayStatus }

function toQuery(filters: SummaryFilters, page: number, limit: number): string {
  const params = new URLSearchParams()
  if (filters.buildings.length) params.set('building', filters.buildings.join(','))
  if (filters.owners.length) params.set('linen_owner', filters.owners.join(','))
  if (filters.personnel.length) params.set('personnel', filters.personnel.join(','))
  if (filters.places.length) params.set('location_option', filters.places.join(','))
  if (filters.inventory_date) params.set('inventory_date', filters.inventory_date)
  params.set('page', String(page))
  params.set('limit', String(limit))
  return params.toString()
}

export function InventoryRecordsTable({ filters, onDataChanged }: { filters: SummaryFilters; onDataChanged?: () => void }) {
  const [rows, setRows] = useState<RecordRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [openSheetId, setOpenSheetId] = useState<number | null>(null)
  const limit = 20

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/inventory/summary/records?${toQuery(filters, page, limit)}`)
      const data = await res.json()
      setRows(data.sheets ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { setPage(1) }, [filters])
  useEffect(() => { fetchRows() }, [fetchRows])

  function handleChanged() {
    fetchRows()
    onDataChanged?.()
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-3">
      {openSheetId != null && (
        <InventorySheetDetail sheetId={openSheetId} onClose={() => setOpenSheetId(null)} onChanged={handleChanged} />
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading records…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No records match the selected filters.</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {['Sheet No.', 'Date', 'Time', 'Personnel', 'Property', 'Location', 'Owner', 'Total Pieces', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setOpenSheetId(r.id)}>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{r.sheet_no}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{r.inventory_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{r.time_of_count ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.personnel_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.building}</td>
                    <td className="px-4 py-3">{r.location_label}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.linen_owner ? LINEN_OWNER_LABELS[r.linen_owner as LinenOwner] : '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.total_pieces}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={r.displayStatus} />
                        {r.original_sheet_id != null && (
                          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" aria-label={`Recount of sheet #${r.original_sheet_id}`} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {r.status === 'submitted' && <EditSheetButton sheetId={r.id} />}
                        <DeleteSheetButton id={r.id} sheetNo={r.sheet_no} onDeleted={handleChanged} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
