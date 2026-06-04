'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Table, CheckCircle, ArrowLeft, X, File, Folder, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import {
  parseCsvText, csvRowsToEntries, parseMarkdownText, type ParsedEntry,
} from '@/lib/importParsers'
import { saveDraft, loadDraft, clearDraft } from '@/lib/importStore'

// ── Single-file drop zone (CSV) ───────────────────────────────────────────────
function SingleDropZone({ accept, onFile }: { accept: string; onFile: (name: string, text: string) => void }) {
  const [dragging, setDragging] = useState(false)

  const handle = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => onFile(file.name, e.target?.result as string)
    reader.readAsText(file, 'utf-8')
  }, [onFile])

  return (
    <label
      className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors ${
        dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
      }`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault(); setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handle(file)
      }}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">Drop your file here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">Accepts {accept}</p>
      </div>
      <input type="file" accept={accept} className="hidden" onChange={e => {
        const file = e.target.files?.[0]
        if (file) handle(file)
      }} />
    </label>
  )
}

// ── Multi-file drop zone (Markdown) ──────────────────────────────────────────
function MultiDropZone({
  accept,
  onFiles,
  fileList,
  onRemoveFile,
}: {
  accept: string
  onFiles: (files: File[]) => void
  fileList: string[]
  onRemoveFile: (name: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [open, setOpen] = useState(false)

  const handle = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    setOpen(true)
    onFiles(Array.from(files))
  }, [onFiles])

  return (
    <div className="space-y-3">
      <label
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault(); setDragging(false)
          handle(e.dataTransfer.files)
        }}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">
            Multiple <code className="bg-muted px-1 rounded">.md</code> files supported — select all at once
          </p>
        </div>
        <input
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={e => handle(e.target.files)}
        />
      </label>

      {/* Collapsible folder */}
      {fileList.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          {/* Folder header — always visible */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
          >
            {open
              ? <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
              : <Folder className="h-4 w-4 text-amber-500 shrink-0" />
            }
            <span className="text-sm font-medium flex-1">
              Uploaded files
            </span>
            <Badge variant="secondary" className="text-xs">{fileList.length}</Badge>
            {open
              ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            }
          </button>

          {/* File list — shown only when expanded, capped at 200 for render performance */}
          {open && (
            <div className="divide-y max-h-64 overflow-y-auto">
              {fileList.slice(0, 200).map(name => (
                <div key={name} className="flex items-center gap-3 px-3 py-2 group hover:bg-muted/30">
                  <File className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm flex-1 truncate">{name}</span>
                  <button
                    onClick={() => onRemoveFile(name)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {fileList.length > 200 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                  +{fileList.length - 200} more files not shown
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Preview table ─────────────────────────────────────────────────────────────
const PREVIEW_CAP = 200

function PreviewTable({ entries, onRemove }: { entries: ParsedEntry[]; onRemove: (i: number) => void }) {
  if (!entries.length) return null
  const visible = entries.slice(0, PREVIEW_CAP)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{entries.length.toLocaleString()} entries ready to import</p>
        <Badge variant="secondary">{entries.length.toLocaleString()}</Badge>
      </div>
      <div className="border rounded-lg divide-y max-h-72 overflow-y-auto">
        {visible.map((e, i) => (
          <div key={i} className="p-3 flex items-start gap-3 hover:bg-muted/30">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium line-clamp-1">{e.question}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{e.answer}</p>
              {e.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {e.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              )}
            </div>
            <button onClick={() => onRemove(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {entries.length > PREVIEW_CAP && (
          <div className="p-3 text-xs text-muted-foreground text-center">
            Showing {PREVIEW_CAP} of {entries.length.toLocaleString()} — all will be imported
          </div>
        )}
      </div>
    </div>
  )
}

const FILE_READ_BATCH = 50   // concurrent FileReaders at a time
const IMPORT_BATCH    = 500  // entries per API request

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ImportPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<ParsedEntry[]>([])
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [readProgress, setReadProgress]     = useState(0)
  const [reading, setReading]               = useState(false)

  // CSV state
  const [csvFileName, setCsvFileName] = useState('')
  const [csvHeaders, setCsvHeaders]   = useState<string[]>([])
  const [csvRows, setCsvRows]         = useState<Record<string, string>[]>([])
  const [qCol, setQCol]               = useState('')
  const [aCol, setACol]               = useState('')
  const [tagsCol, setTagsCol]         = useState('none')

  // Markdown multi-file state
  const [mdFileMap, setMdFileMap] = useState<Record<string, ParsedEntry[]>>({})

  // hydrated batches with data setters so the persist effect never fires with
  // stale empty state before the restore is complete
  const [hydrated, setHydrated] = useState(false)

  // Debounce timer for IndexedDB saves
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Restore from IndexedDB on mount
  useEffect(() => {
    loadDraft().then(s => {
      if (s) {
        const m = s.mdFileMap as Record<string, ParsedEntry[]> | undefined
        if (m && Object.keys(m).length > 0) setMdFileMap(m)
        const e = s.entries as ParsedEntry[] | undefined
        if (e?.length) setEntries(e)
        if (s.csvFileName) setCsvFileName(s.csvFileName as string)
        if ((s.csvHeaders as string[] | undefined)?.length) setCsvHeaders(s.csvHeaders as string[])
        if ((s.csvRows as Record<string, string>[] | undefined)?.length) setCsvRows(s.csvRows as Record<string, string>[])
        if (s.qCol) setQCol(s.qCol as string)
        if (s.aCol) setACol(s.aCol as string)
        if (s.tagsCol) setTagsCol(s.tagsCol as string)
      }
    }).catch(() => {}).finally(() => setHydrated(true))
  }, [])

  // ── Persist to IndexedDB (debounced 800ms)
  useEffect(() => {
    if (!hydrated) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveDraft({ mdFileMap, entries, csvFileName, csvHeaders, csvRows, qCol, aCol, tagsCol }).catch(() => {})
    }, 800)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [hydrated, mdFileMap, entries, csvFileName, csvHeaders, csvRows, qCol, aCol, tagsCol])

  const mdFileNames   = Object.keys(mdFileMap)
  const mdEntryCount  = Object.values(mdFileMap).reduce((s, e) => s + e.length, 0)

  function removeEntry(i: number) {
    setEntries(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── CSV handlers
  function handleCsvFile(name: string, text: string) {
    const { headers, rows } = parseCsvText(text)
    setCsvFileName(name); setCsvHeaders(headers); setCsvRows(rows); setEntries([])
    setQCol(headers.find(h => /question|name|title|q\b/i.test(h)) ?? headers[0] ?? '')
    setACol(headers.find(h => /answer|content|body|description|notes|a\b/i.test(h)) ?? headers[1] ?? '')
  }

  function applyCsvMapping() {
    if (!qCol || !aCol) { toast.error('Select both a Question and Answer column'); return }
    const parsed = csvRowsToEntries(csvRows, qCol, aCol, tagsCol === 'none' ? undefined : tagsCol)
    if (!parsed.length) { toast.error('No valid rows found with the selected columns'); return }
    setEntries(parsed)
    toast.success(`${parsed.length} entries parsed`)
  }

  // ── Markdown: read files in batches to avoid spawning thousands of FileReaders
  async function handleMarkdownFiles(files: File[]) {
    setReading(true)
    setReadProgress(0)
    const newMap: Record<string, ParsedEntry[]> = {}

    for (let i = 0; i < files.length; i += FILE_READ_BATCH) {
      const batch = files.slice(i, i + FILE_READ_BATCH)
      await Promise.all(batch.map(file => new Promise<void>(resolve => {
        const reader = new FileReader()
        reader.onload = e => {
          newMap[file.name] = parseMarkdownText(e.target?.result as string)
          resolve()
        }
        reader.onerror = () => resolve() // skip unreadable files
        reader.readAsText(file, 'utf-8')
      })))
      setReadProgress(Math.round(((i + batch.length) / files.length) * 100))
    }

    setReading(false)
    setReadProgress(0)
    setMdFileMap(prev => {
      const merged = { ...prev, ...newMap }
      const total     = Object.values(merged).reduce((s, e) => s + e.length, 0)
      const fileCount = Object.keys(merged).length
      toast.success(`${fileCount.toLocaleString()} files loaded — ${total.toLocaleString()} entries detected`)
      return merged
    })
  }

  function removeMarkdownFile(name: string) {
    setMdFileMap(prev => { const next = { ...prev }; delete next[name]; return next })
  }

  function previewMarkdownEntries() {
    const all = Object.values(mdFileMap).flat()
    if (!all.length) { toast.error('No entries found in the uploaded files'); return }
    setEntries(all)
  }

  // ── Import: send in batches of IMPORT_BATCH entries
  async function handleImport() {
    if (!entries.length) return
    setImporting(true)
    setImportProgress(0)
    let created = 0, updated = 0, skipped = 0

    try {
      for (let i = 0; i < entries.length; i += IMPORT_BATCH) {
        const batch = entries.slice(i, i + IMPORT_BATCH)
        const res   = await fetch('/api/knowledge/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: batch }),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error ?? 'Import failed')
        created += result.created ?? 0
        updated += result.updated ?? 0
        skipped += result.skipped ?? 0
        setImportProgress(Math.round(((i + batch.length) / entries.length) * 100))
      }

      const parts: string[] = []
      if (created) parts.push(`${created.toLocaleString()} new`)
      if (updated) parts.push(`${updated.toLocaleString()} updated`)
      if (skipped) parts.push(`${skipped.toLocaleString()} skipped`)
      toast.success(`Import complete — ${parts.join(', ')}`)

      await clearDraft()
      router.push('/knowledge-base')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed. Please try again.')
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  async function clearAll() {
    setEntries([]); setCsvHeaders([]); setCsvFileName(''); setCsvRows([])
    setQCol(''); setACol(''); setTagsCol('none'); setMdFileMap({})
    await clearDraft().catch(() => {})
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/knowledge-base"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Import from Notion Export</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload Notion-exported files to bulk-add knowledge entries
          </p>
        </div>
      </div>

      {/* How-to */}
      <div className="rounded-lg bg-muted/50 border p-4 text-sm space-y-2">
        <p className="font-medium">How to export from Notion:</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
          <li>Open a Notion page or database</li>
          <li>Click <strong>···</strong> (top right) → <strong>Export</strong></li>
          <li>Choose <strong>Markdown &amp; CSV</strong> → Export</li>
          <li>Unzip and upload the <code className="bg-muted px-1 rounded">.md</code> or <code className="bg-muted px-1 rounded">.csv</code> files below</li>
        </ol>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="markdown">
        <TabsList>
          <TabsTrigger value="markdown" className="gap-2"><FileText className="h-4 w-4" />Markdown (Pages)</TabsTrigger>
          <TabsTrigger value="csv" className="gap-2"><Table className="h-4 w-4" />CSV (Database)</TabsTrigger>
        </TabsList>

        {/* ── Markdown tab */}
        <TabsContent value="markdown" className="space-y-5 mt-5">
          <MultiDropZone
            accept=".md,.txt"
            onFiles={handleMarkdownFiles}
            fileList={mdFileNames}
            onRemoveFile={removeMarkdownFile}
          />

          <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">How the Markdown is parsed:</p>
            <p>• Each <code className="bg-muted px-1 rounded">## Heading</code> becomes a separate knowledge entry</p>
            <p>• A page with only one <code className="bg-muted px-1 rounded"># H1</code> becomes a single entry</p>
            <p>• <strong>Bold questions</strong> followed by a paragraph are also detected automatically</p>
            <p>• Each file is parsed independently then combined into one import batch</p>
          </div>

          {reading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Reading files…</span><span>{readProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${readProgress}%` }} />
              </div>
            </div>
          )}

          {mdFileNames.length > 0 && !entries.length && !reading && (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={previewMarkdownEntries}>
                Preview {mdEntryCount.toLocaleString()} entries from {mdFileNames.length.toLocaleString()} file{mdFileNames.length !== 1 ? 's' : ''}
              </Button>
              <Button variant="ghost" onClick={() => { setMdFileMap({}); setEntries([]); clearDraft().catch(() => {}) }}>Clear files</Button>
            </div>
          )}
        </TabsContent>

        {/* ── CSV tab */}
        <TabsContent value="csv" className="space-y-5 mt-5">
          <SingleDropZone accept=".csv" onFile={handleCsvFile} />

          {csvHeaders.length > 0 && (
            <div className="space-y-4 border rounded-lg p-4">
              <p className="text-sm font-medium">Map columns from <span className="text-primary">{csvFileName}</span></p>
              <p className="text-xs text-muted-foreground">{csvRows.length} rows detected · {csvHeaders.length} columns</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Question column *</Label>
                  <Select value={qCol} onValueChange={setQCol}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Answer column *</Label>
                  <Select value={aCol} onValueChange={setACol}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags column (optional)</Label>
                  <Select value={tagsCol} onValueChange={setTagsCol}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="outline" onClick={applyCsvMapping}>Preview entries</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview + import */}
      {entries.length > 0 && (
        <div className="space-y-4 border-t pt-6">
          <PreviewTable entries={entries} onRemove={removeEntry} />
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 space-y-0.5">
            <p className="font-medium">Safe to re-import</p>
            <p>Entries with the same question are updated in-place — no duplicates are created. New entries are added. Nothing is deleted.</p>
          </div>
          {importing && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Importing entries…</span><span>{importProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${importProgress}%` }} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={handleImport} disabled={importing || entries.length === 0}>
              {importing ? 'Importing…' : (
                <><CheckCircle className="h-4 w-4" />Import {entries.length.toLocaleString()} entries</>
              )}
            </Button>
            <Button variant="ghost" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      )}
    </div>
  )
}
