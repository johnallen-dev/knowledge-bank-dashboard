'use client'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface Props {
  preview: string
  charCount: number
  onConfirm: () => void
}

export function ExtractedTextPreview({ preview, charCount, onConfirm }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Extracted content preview</p>
        <span className="text-xs text-muted-foreground">{charCount.toLocaleString()} characters extracted</span>
      </div>
      <div className="border rounded-lg bg-muted/30 p-4 max-h-72 overflow-y-auto">
        <pre className="text-xs whitespace-pre-wrap text-muted-foreground font-mono leading-relaxed">
          {preview}
          {charCount > preview.length && `\n\n… (${(charCount - preview.length).toLocaleString()} more characters)`}
        </pre>
      </div>
      <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-xs text-green-700">
        Content successfully extracted. Review it above, then choose how many exam questions to generate.
      </div>
      <Button onClick={onConfirm} className="w-full">
        <CheckCircle className="h-4 w-4" />
        Looks good — continue to exam generation
      </Button>
    </div>
  )
}
