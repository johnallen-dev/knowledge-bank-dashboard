'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Save, Send, FileEdit } from 'lucide-react'
import { BuildingSelect } from './BuildingSelect'
import { LocationSelect } from './LocationSelect'
import { OwnershipSelect } from './OwnershipSelect'
import { RecountSelector } from './RecountSelector'
import { ItemQuantityTable } from './ItemQuantityTable'
import { RulesPanel } from './RulesPanel'
import { SubmitConfirmModal } from './SubmitConfirmModal'
import { PasswordPromptModal } from './PasswordPromptModal'
import { StatusBadge } from './StatusBadge'
import { inventoryAuthHeader } from '@/lib/inventory/auth'
import { getDisplayStatus } from '@/lib/inventory/statusLabel'
import { FIXED_ITEMS, INVENTORY_DATES, LINEN_OWNER_LABELS } from '@/lib/inventory/types'
import type { InventorySheet, InventorySheetItem, LocationCategory, LinenOwner, InventoryDateKey, SheetInput } from '@/lib/inventory/types'
import type { InventoryFormState, ItemRow } from './types'

function buildInitialItems(): ItemRow[] {
  const rows: ItemRow[] = []
  for (const category of ['bed_linen', 'towels', 'kitchen'] as const) {
    for (const def of FIXED_ITEMS[category]) {
      rows.push({ id: def.key, category, item_key: def.key, item_label: def.label, is_custom_item: false, qty: null })
    }
  }
  rows.push({ id: 'custom-1', category: 'other', item_key: 'custom-1', item_label: '', is_custom_item: true, qty: null })
  rows.push({ id: 'custom-2', category: 'other', item_key: 'custom-2', item_label: '', is_custom_item: true, qty: null })
  return rows
}

function itemsFromServer(serverItems: InventorySheetItem[]): ItemRow[] {
  const base = buildInitialItems()
  const byKey = new Map(serverItems.filter(i => !i.is_custom_item).map(i => [i.item_key, i]))
  const fixedRows = base.filter(r => !r.is_custom_item).map(r => {
    const server = byKey.get(r.item_key)
    return server ? { ...r, qty: server.quantity } : r
  })
  const customRows = serverItems.filter(i => i.is_custom_item).map(i => ({
    id: i.item_key, category: 'other' as const, item_key: i.item_key, item_label: i.item_label,
    is_custom_item: true, qty: i.quantity,
  }))
  // Always keep at least 2 blank custom rows available to add to.
  while (customRows.length < 2) {
    customRows.push({ id: `custom-new-${customRows.length}`, category: 'other', item_key: `custom-new-${customRows.length}`, item_label: '', is_custom_item: true, qty: null })
  }
  return [...fixedRows, ...customRows]
}

function emptyForm(): InventoryFormState {
  return {
    personnel_name: '',
    inventory_date: '',
    building: '',
    isOtherBuilding: false,
    otherBuildingName: '',
    location_category: '',
    location_option: '',
    location_label: '',
    linen_owner: '',
    customerName: '',
    items: buildInitialItems(),
    time_of_count: '',
    isRecount: false,
    original_sheet_id: null,
    originalSheetLabel: '',
  }
}

function sheetToForm(sheet: InventorySheet, items: InventorySheetItem[]): InventoryFormState {
  return {
    personnel_name: sheet.personnel_name,
    inventory_date: sheet.inventory_date,
    building: sheet.building_is_custom ? '' : sheet.building,
    isOtherBuilding: sheet.building_is_custom,
    otherBuildingName: sheet.building_is_custom ? sheet.building : '',
    location_category: sheet.location_category,
    location_option: sheet.location_option,
    location_label: sheet.location_label,
    linen_owner: sheet.linen_owner,
    customerName: sheet.linen_owner_customer_name ?? '',
    items: itemsFromServer(items),
    time_of_count: sheet.time_of_count ?? '',
    isRecount: sheet.original_sheet_id != null,
    original_sheet_id: sheet.original_sheet_id,
    originalSheetLabel: '',
  }
}

function toSheetInputItems(items: ItemRow[]): SheetInput['items'] {
  return items.map(i => ({
    category: i.category, item_key: i.item_key, item_label: i.item_label,
    is_custom_item: i.is_custom_item, quantity: i.qty,
  }))
}

export function InventoryForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const draftId = searchParams.get('draftId')
  const editId = searchParams.get('editId')

  const [form, setForm] = useState<InventoryFormState>(emptyForm)
  const [sheetId, setSheetId] = useState<number | null>(null)
  const [sheetNo, setSheetNo] = useState<string | null>(null)
  const [displayStatus, setDisplayStatus] = useState<'draft' | 'submitted' | 'recounted' | 'superseded'>('draft')
  const [loading, setLoading] = useState(!!draftId || !!editId)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [editAuthed, setEditAuthed] = useState(false)
  const [drafts, setDrafts] = useState<InventorySheet[]>([])

  const isEditingSubmitted = !!editId
  const isResumingDraft = !!draftId

  const set = useCallback(<K extends keyof InventoryFormState>(key: K, value: InventoryFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  // Load a draft or a submitted sheet to edit.
  useEffect(() => {
    const id = draftId ?? editId
    if (!id) return
    setLoading(true)
    fetch(`/api/inventory/sheets/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.sheet) { toast.error('Sheet not found'); return }
        setForm(sheetToForm(data.sheet, data.items ?? []))
        setSheetId(data.sheet.id)
        setSheetNo(data.sheet.sheet_no)
        setDisplayStatus(getDisplayStatus(data.sheet))
      })
      .catch(() => toast.error('Failed to load sheet'))
      .finally(() => setLoading(false))
  }, [draftId, editId])

  // List drafts available to resume, only on a fresh (non-loaded) form.
  useEffect(() => {
    if (draftId || editId) return
    fetch('/api/inventory/sheets?status=draft&limit=10')
      .then(res => res.json())
      .then(data => setDrafts(data.sheets ?? []))
      .catch(() => setDrafts([]))
  }, [draftId, editId])

  const totalPieces = useMemo(
    () => form.items.reduce((sum, i) => sum + (i.qty ?? 0), 0),
    [form.items],
  )
  const blankFixedItemCount = useMemo(
    () => form.items.filter(i => !i.is_custom_item && i.qty === null).length,
    [form.items],
  )

  function buildPayload(): Partial<SheetInput> {
    return {
      personnel_name: form.personnel_name,
      inventory_date: form.inventory_date,
      building: form.isOtherBuilding ? form.otherBuildingName : form.building,
      building_is_custom: form.isOtherBuilding,
      location_category: form.location_category,
      location_option: form.location_option,
      location_label: form.location_label,
      linen_owner: form.linen_owner,
      linen_owner_customer_name: form.linen_owner === 'customer' ? form.customerName : null,
      time_of_count: form.time_of_count || null,
      original_sheet_id: form.original_sheet_id,
      items: toSheetInputItems(form.items),
    }
  }

  async function handleSaveDraft() {
    setSaving(true)
    try {
      const payload = buildPayload()
      const res = sheetId
        ? await fetch(`/api/inventory/sheets/${sheetId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
        : await fetch('/api/inventory/sheets', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save draft')
      setSheetId(data.sheet.id)
      setSheetNo(data.sheet.sheet_no)
      setDisplayStatus(getDisplayStatus(data.sheet))
      toast.success('Draft saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  async function ensureDraftExists(): Promise<number | null> {
    if (sheetId) return sheetId
    const payload = buildPayload()
    const res = await fetch('/api/inventory/sheets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'Failed to start sheet'); return null }
    setSheetId(data.sheet.id)
    setSheetNo(data.sheet.sheet_no)
    return data.sheet.id
  }

  async function handleSubmitClick() {
    if (isEditingSubmitted) {
      setShowConfirm(true)
      return
    }
    const id = await ensureDraftExists()
    if (!id) return
    setShowConfirm(true)
  }

  async function handleConfirmSubmit() {
    setSubmitting(true)
    try {
      if (isEditingSubmitted && sheetId) {
        const res = await fetch(`/api/inventory/sheets/${sheetId}/edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...inventoryAuthHeader() },
          body: JSON.stringify({ ...buildPayload(), edited_by: form.personnel_name }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to save changes')
        toast.success('Changes saved')
        setShowConfirm(false)
        router.push(`/inventory/summary`)
        return
      }

      const id = sheetId
      if (!id) throw new Error('Sheet not ready yet')
      const res = await fetch(`/api/inventory/sheets/${id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (!res.ok) {
        const details = Array.isArray(data.details) ? `: ${data.details.join(' ')}` : ''
        throw new Error((data.error || 'Failed to submit') + details)
      }
      toast.success(`Sheet ${data.sheet.sheet_no} submitted`)
      setShowConfirm(false)
      setDisplayStatus(getDisplayStatus(data.sheet))
      router.push('/inventory/summary')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  function updateQty(id: string, qty: number | null) {
    setForm(prev => ({ ...prev, items: prev.items.map(i => (i.id === id ? { ...i, qty } : i)) }))
  }
  function updateCustomName(id: string, name: string) {
    setForm(prev => ({ ...prev, items: prev.items.map(i => (i.id === id ? { ...i, item_label: name } : i)) }))
  }
  function addCustomRow() {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { id: `custom-${Date.now()}`, category: 'other', item_key: `custom-${Date.now()}`, item_label: '', is_custom_item: true, qty: null }],
    }))
  }
  function removeCustomRow(id: string) {
    setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }))
  }

  if (isEditingSubmitted && !editAuthed && !loading) {
    return (
      <PasswordPromptModal
        title="Authorize Edit"
        message="Enter the authorization password to edit this submitted sheet."
        onSuccess={() => setEditAuthed(true)}
        onCancel={() => router.push('/inventory/summary')}
      />
    )
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
  }

  const ownerLabel = form.linen_owner ? LINEN_OWNER_LABELS[form.linen_owner] : ''
  const buildingLabel = form.isOtherBuilding ? form.otherBuildingName : form.building

  return (
    <div className="space-y-6 max-w-5xl">
      {showConfirm && (
        <SubmitConfirmModal
          mode={isEditingSubmitted ? 'edit' : 'submit'}
          building={buildingLabel}
          locationLabel={form.location_label}
          ownerLabel={ownerLabel}
          totalPieces={totalPieces}
          blankFixedItemCount={blankFixedItemCount}
          submitting={submitting}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {isEditingSubmitted ? 'Edit Submitted Sheet' : isResumingDraft ? 'Continue Draft' : 'New Inventory Count'}
          </h2>
          <p className="text-sm text-muted-foreground">Count and record hotel linen inventory.</p>
        </div>
        {sheetNo && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">{sheetNo}</span>
            <StatusBadge status={displayStatus} />
          </div>
        )}
      </div>

      {!draftId && !editId && drafts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Resume a draft</p>
            <div className="flex flex-wrap gap-2">
              {drafts.map(d => (
                <Button key={d.id} variant="outline" size="sm" onClick={() => router.push(`/inventory/inputs?draftId=${d.id}`)}>
                  {d.sheet_no} — {d.building || 'Untitled'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="personnel_name">Name *</Label>
          <Input id="personnel_name" value={form.personnel_name} onChange={e => set('personnel_name', e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Select value={form.inventory_date} onValueChange={v => set('inventory_date', v as InventoryDateKey)}>
            <SelectTrigger>
              <SelectValue placeholder="Select date…" />
            </SelectTrigger>
            <SelectContent>
              {INVENTORY_DATES.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <BuildingSelect
        building={form.building}
        isOther={form.isOtherBuilding}
        otherName={form.otherBuildingName}
        onChangeBuilding={(b, isOther) => { set('building', b); set('isOtherBuilding', isOther) }}
        onChangeOtherName={name => set('otherBuildingName', name)}
      />

      <LocationSelect
        category={form.location_category}
        option={form.location_option}
        label={form.location_label}
        onChangeCategory={(c: LocationCategory) => { set('location_category', c); set('location_option', '') }}
        onChangeOption={opt => set('location_option', opt)}
        onChangeLabel={label => set('location_label', label)}
      />

      <OwnershipSelect
        owner={form.linen_owner}
        customerName={form.customerName}
        onChangeOwner={(o: LinenOwner) => set('linen_owner', o)}
        onChangeCustomerName={name => set('customerName', name)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ItemQuantityTable
            items={form.items}
            onChangeQty={updateQty}
            onChangeCustomName={updateCustomName}
            onAddCustomRow={addCustomRow}
            onRemoveCustomRow={removeCustomRow}
          />
        </div>
        <div className="lg:col-span-1 order-first lg:order-last">
          <RulesPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="time_of_count">Time</Label>
          <Input id="time_of_count" type="time" value={form.time_of_count} onChange={e => set('time_of_count', e.target.value)} />
        </div>
      </div>

      {!isEditingSubmitted && (
        <RecountSelector
          isRecount={form.isRecount}
          originalSheetId={form.original_sheet_id}
          originalSheetLabel={form.originalSheetLabel}
          onToggle={isRecount => { set('isRecount', isRecount); if (!isRecount) { set('original_sheet_id', null); set('originalSheetLabel', '') } }}
          onSelect={sheet => {
            set('original_sheet_id', sheet.id)
            set('originalSheetLabel', `${sheet.sheet_no} — ${sheet.building}, ${sheet.location_label}`)
          }}
        />
      )}

      <div className="flex gap-3 pt-2">
        {!isEditingSubmitted && (
          <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save as Draft'}
          </Button>
        )}
        <Button type="button" onClick={handleSubmitClick} disabled={saving} className="gap-2">
          {isEditingSubmitted ? <FileEdit className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {isEditingSubmitted ? 'Save Changes' : 'Submit Inventory'}
        </Button>
      </div>
    </div>
  )
}
