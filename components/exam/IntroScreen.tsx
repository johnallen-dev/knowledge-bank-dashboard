'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardList } from 'lucide-react'

const EXAMINEES = [
  'Sherilyn Susaya',
  'Jenuel Advincula',
  'John Carlo Susaya',
  'Inah Astrera',
  'Aaron Chico',
  'Deniece Valeza',
  'Elizabeth Antonio',
  'Patrick Tuazon',
  'Justine Marquez',
  'Gia Saclausa',
  'Cherie Josie Serafin',
  'John Allen Astrera',
]

interface Props {
  questionCount: number
  onStart: (name: string, date: string) => void
}

export function IntroScreen({ questionCount, onStart }: Props) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !date) return
    onStart(name, date)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Updates Exam</h1>
          <p className="text-muted-foreground text-sm">{questionCount} questions — multiple choice, true/false, and fill-in-the-blank</p>
        </div>

        <div className="border rounded-xl bg-card p-6 shadow-sm space-y-5">
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p>• Read each question carefully before answering.</p>
            <p>• All questions must be answered before submitting.</p>
            <p>• A digital signature is required after submission.</p>
            <p>• Your score is displayed immediately after signing.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Select value={name} onValueChange={setName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your name…" />
                </SelectTrigger>
                <SelectContent>
                  {EXAMINEES.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date of Examination *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                max={today}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!name || !date}>
              Start Exam
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
