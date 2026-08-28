'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, X } from 'lucide-react'
import { isValidQaReportPassword } from '@/lib/qaReport/auth'

interface PasswordPromptModalProps {
  title: string
  message: string
  onSuccess: () => void
  onCancel: () => void
}

export function PasswordPromptModal({ title, message, onSuccess, onCancel }: PasswordPromptModalProps) {
  const [password, setPassword] = useState('')

  function handleSubmit() {
    if (!isValidQaReportPassword(password)) {
      toast.error('Incorrect password')
      setPassword('')
      return
    }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Lock className="h-5 w-5 shrink-0" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1" disabled={!password} onClick={handleSubmit}>Continue</Button>
        </div>
      </div>
    </div>
  )
}
