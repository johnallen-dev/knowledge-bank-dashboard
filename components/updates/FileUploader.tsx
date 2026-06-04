'use client'
import { useState, useCallback } from 'react'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  onUploaded: (data: { documentId: number; charCount: number; preview: string }) => void
}

export function FileUploader({ onUploaded }: Props) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const accept = '.pdf,.xlsx,.docx'

  const handleFile = useCallback((f: File) => setFile(f), [])

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/updates/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      onUploaded(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault(); setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) handleFile(f)
        }}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Drop your file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, Excel (.xlsx), or Word (.docx) — max 10 MB</p>
        </div>
        <input type="file" accept={accept} className="hidden" onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }} />
      </label>

      {file && (
        <div className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-muted/30">
          <File className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
        {uploading ? 'Extracting content…' : 'Upload & Extract Content'}
      </Button>
    </div>
  )
}
