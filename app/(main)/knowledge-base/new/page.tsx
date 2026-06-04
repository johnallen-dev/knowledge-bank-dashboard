'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Sparkles, FileEdit, CheckCircle, Upload } from 'lucide-react'
import { KnowledgeForm } from '@/components/knowledge/KnowledgeForm'
import { parseQAText, type ParsedEntry } from '@/lib/importParsers'

// ── Preview card ──────────────────────────────────────────────────────────────
function EntryPreview({
  entries,
  onRemove,
}: {
  entries: ParsedEntry[]
  onRemove: (i: number) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} detected
        </p>
        <Badge variant="secondary">{entries.length}</Badge>
      </div>
      <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
        {entries.map((e, i) => (
          <div key={i} className="p-3 flex items-start gap-3 group hover:bg-muted/30 transition-colors">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium">{e.question}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">{e.answer}</p>
            </div>
            <button
              onClick={() => onRemove(i)}
              className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Bulk paste tab ────────────────────────────────────────────────────────────
function BulkPasteTab({ defaultText }: { defaultText?: string }) {
  const router = useRouter()
  const [text, setText] = useState(defaultText ?? '')
  const [entries, setEntries] = useState<ParsedEntry[]>([])
  const [saving, setSaving] = useState(false)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const content = ev.target?.result as string
      setText(content)
      setEntries([])
      toast.success(`"${file.name}" loaded — click Detect entries to continue`)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  function handleParse() {
    const parsed = parseQAText(text)
    if (!parsed.length) {
      toast.error('No Q&A pairs detected. Check the format guide below.')
      return
    }
    setEntries(parsed)
    toast.success(`${parsed.length} ${parsed.length === 1 ? 'entry' : 'entries'} detected — review below`)
  }

  function removeEntry(i: number) {
    setEntries(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!entries.length) return
    setSaving(true)
    try {
      const res = await fetch('/api/knowledge/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      const parts: string[] = []
      if (result.created > 0) parts.push(`${result.created} added`)
      if (result.updated > 0) parts.push(`${result.updated} updated`)
      if (result.skipped > 0) parts.push(`${result.skipped} skipped`)
      toast.success(`Saved — ${parts.join(', ')}`)

      router.push('/knowledge-base')
      router.refresh()
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Upload .txt file */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
          <Upload className="h-4 w-4" />
          Upload .txt file
          <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
        </label>
        <p className="text-xs text-muted-foreground">or paste directly below</p>
      </div>

      {/* Text input */}
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={e => { setText(e.target.value); setEntries([]) }}
          placeholder={`Paste your Q&A pairs here. Example:\n\nQ: What time is check-in?\nA: Check-in starts at 3:00 PM. Early check-in is available on request.\n\nQ: Is breakfast included?\nA: Breakfast is included for all deluxe room guests.\n\nQ: Do you provide airport transfers?\nA: Yes, we offer airport transfers. Please book at least 24 hours in advance.`}
          className="min-h-[280px] text-sm font-mono resize-y"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {text.trim() ? `${text.length} characters` : 'Paste one or many Q&A pairs'}
          </p>
          <Button
            onClick={handleParse}
            variant="outline"
            size="sm"
            disabled={!text.trim()}
          >
            <Sparkles className="h-4 w-4" />
            Detect entries
          </Button>
        </div>
      </div>

      {/* Format guide */}
      {!entries.length && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-xs">
          <p className="font-medium text-sm">Supported formats — use any, or mix them:</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px]">Format 1 — Q: / A: labels</p>
              <pre className="bg-background rounded p-2 text-xs leading-relaxed border whitespace-pre-wrap">{`Q: What time is check-in?
A: Check-in starts at 3:00 PM.

Q: Is breakfast included?
A: Yes, for deluxe rooms.`}</pre>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px]">Format 2 — bold question</p>
              <pre className="bg-background rounded p-2 text-xs leading-relaxed border whitespace-pre-wrap">{`**What time is check-in?**
Check-in starts at 3:00 PM.

**Is breakfast included?**
Yes, for deluxe rooms.`}</pre>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px]">Format 3 — numbered list</p>
              <pre className="bg-background rounded p-2 text-xs leading-relaxed border whitespace-pre-wrap">{`1. What time is check-in?
Check-in starts at 3:00 PM.

2. Is breakfast included?
Yes, for deluxe rooms.`}</pre>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px]">Format 4 — plain pairs</p>
              <pre className="bg-background rounded p-2 text-xs leading-relaxed border whitespace-pre-wrap">{`What time is check-in?
Check-in starts at 3:00 PM.

Is breakfast included?
Yes, for deluxe rooms.`}</pre>
            </div>
          </div>

          <p className="text-muted-foreground">
            Separate each pair with a blank line. The app auto-detects the format — no special setup needed.
          </p>
        </div>
      )}

      {/* Preview */}
      {entries.length > 0 && (
        <div className="space-y-4 border-t pt-5">
          <EntryPreview entries={entries} onRemove={removeEntry} />

          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
            Existing entries with the same question are updated — no duplicates created.
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving || !entries.length}>
              {saving ? 'Saving…' : (
                <><CheckCircle className="h-4 w-4" />Save {entries.length} {entries.length === 1 ? 'entry' : 'entries'}</>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setEntries([])}>
              Re-edit
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
import { Suspense } from 'react'

function NewKnowledgeContent() {
  const searchParams = useSearchParams()
  const prefillQ = searchParams.get('q') ?? undefined

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Add Knowledge</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add entries one at a time, or paste a whole batch at once
        </p>
      </div>

      <Tabs defaultValue={prefillQ ? 'single' : 'bulk'}>
        <TabsList>
          <TabsTrigger value="single" className="gap-2">
            <FileEdit className="h-4 w-4" />Single Entry
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Sparkles className="h-4 w-4" />Paste Multiple
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6">
          <KnowledgeForm defaultQuestion={prefillQ} />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <BulkPasteTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function NewKnowledgePage() {
  return (
    <Suspense>
      <NewKnowledgeContent />
    </Suspense>
  )
}
