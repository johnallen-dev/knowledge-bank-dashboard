'use client'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export interface SafeQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank'
  question: string
  options?: string[]
  points: number
}

interface Props {
  question: SafeQuestion
  index: number
  value: string
  onChange: (val: string) => void
}

export function QuestionRenderer({ question, index, value, onChange }: Props) {
  return (
    <div className="border rounded-xl p-5 space-y-4 bg-card">
      <div className="flex gap-3">
        <span className="shrink-0 h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <p className="text-sm font-medium leading-relaxed pt-0.5">
          {(question.type === 'fill_blank' || question.type.includes('fill'))
            ? question.question.replace(/_{2,}/g, '________')
            : question.question}
        </p>
      </div>

      {question.type === 'fill_blank' || question.type.includes('fill') ? (
        <div className="pl-10">
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Type your answer here…"
            className="max-w-sm"
          />
        </div>
      ) : (
        <div className="pl-10 space-y-2">
          {(question.options ?? []).map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                'w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors',
                value === opt
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-muted hover:border-primary/40 hover:bg-muted/30'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
