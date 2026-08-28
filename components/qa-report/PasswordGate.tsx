'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'
import { isValidQaReportPassword } from '@/lib/qaReport/auth'

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidQaReportPassword(password)) {
      setError('Incorrect password')
      setPassword('')
      return
    }
    setError('')
    setUnlocked(true)
  }

  if (unlocked) return <>{children}</>

  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-full max-w-sm space-y-4 border rounded-xl bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-semibold">Password Required</h2>
          <p className="text-sm text-muted-foreground">This report is password-protected.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="gate-password">Password</Label>
            <Input
              id="gate-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={!password}>Unlock</Button>
        </form>
      </div>
    </div>
  )
}
