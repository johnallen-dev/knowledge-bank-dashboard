'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  documentId: number
  onGenerated: (shareToken: string) => void
}

export function ExamGenerator({ documentId, onGenerated }: Props) {
  const [count, setCount] = useState<10 | 20>(10)
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/updates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, questionCount: count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      onGenerated(data.shareToken)
      toast.success(`${count}-question exam created!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate exam')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium mb-3">Number of exam questions</p>
        <div className="flex gap-3">
          {([10, 20] as const).map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 border rounded-lg py-4 text-center transition-colors ${
                count === n
                  ? 'border-primary bg-primary/5 text-primary font-semibold'
                  : 'border-muted hover:border-primary/50 text-muted-foreground'
              }`}
            >
              <span className="text-2xl font-bold block">{n}</span>
              <span className="text-xs">questions</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">What will be generated:</p>
        <p>• ~{Math.round(count * 0.5)} multiple-choice questions (4 options each)</p>
        <p>• ~{Math.round(count * 0.25)} true / false questions</p>
        <p>• ~{count - Math.round(count * 0.5) - Math.round(count * 0.25)} fill-in-the-blank questions</p>
        <p>• All questions are based on the uploaded document content</p>
      </div>

      <Button onClick={handleGenerate} disabled={generating} className="w-full">
        <Sparkles className="h-4 w-4" />
        {generating ? 'Generating exam with AI…' : `Generate ${count}-Question Exam`}
      </Button>
    </div>
  )
}
