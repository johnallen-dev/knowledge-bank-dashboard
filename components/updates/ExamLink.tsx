'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  shareToken: string
  onReset: () => void
}

export function ExamLink({ shareToken, onReset }: Props) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(`${window.location.origin}/exam/${shareToken}`)
  }, [shareToken])

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-1">
        <p className="text-sm font-semibold text-green-800">Exam is ready!</p>
        <p className="text-xs text-green-700">Share the link below with your examinees.</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Shareable exam link</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 border rounded-md px-3 py-2 text-sm bg-muted/30 font-mono text-muted-foreground"
          />
          <Button variant="outline" size="icon" onClick={copy}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
          {url && (
            <Button variant="outline" size="icon" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
        The link is permanent and can be used multiple times. Each submission is stored separately.
      </div>

      <Button variant="outline" onClick={onReset} className="w-full">
        Upload Another Document
      </Button>
    </div>
  )
}
