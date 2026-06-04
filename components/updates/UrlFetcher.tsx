'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  onFetched: (data: { documentId: number; charCount: number; preview: string }) => void
}

export function UrlFetcher({ onFetched }: Props) {
  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)

  async function handleFetch() {
    if (!url.trim()) return
    setFetching(true)
    try {
      const res = await fetch('/api/updates/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch URL')
      onFetched(data)
      toast.success('Page content extracted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch URL')
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label htmlFor="url">Page URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="https://example.com/page"
              className="pl-9"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the full URL of any public web page. The system will extract all text content and use it to generate exam questions.
        </p>
      </div>

      <div className="rounded-lg bg-muted/40 border p-4 text-xs text-muted-foreground space-y-1.5">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Link className="h-3.5 w-3.5" />
          Works best with:
        </div>
        <p>• Internal documentation pages</p>
        <p>• Training material websites</p>
        <p>• Procedure or policy pages</p>
        <p>• Any public page with readable text content</p>
      </div>

      <Button onClick={handleFetch} disabled={!url.trim() || fetching} className="w-full">
        {fetching ? 'Fetching page content…' : 'Extract Content from URL'}
      </Button>
    </div>
  )
}
