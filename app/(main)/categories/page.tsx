'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/lib/db/queries/categories'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Category "${newName}" created`)
      setNewName('')
      load()
    } catch {
      toast.error('Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Organize knowledge entries by category</p>
      </div>

      {/* Add new */}
      <form onSubmit={handleAdd} className="border rounded-lg p-5 space-y-4">
        <h2 className="font-medium">Add Category</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Pool & Gym"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <input
              id="color"
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              className="h-10 w-16 rounded-md border border-input cursor-pointer p-1"
            />
          </div>
          <Button type="submit" disabled={saving || !newName.trim()}>
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </form>

      {/* List */}
      <div className="border rounded-lg divide-y">
        {categories.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium text-sm">{cat.name}</span>
              </div>
              <Badge variant="secondary">{cat.entry_count ?? 0} entries</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
