'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ResultsTable } from '@/components/updates/ResultsTable'
import { Lock, ClipboardList } from 'lucide-react'

export default function ResultsPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthed(sessionStorage.getItem('updates_auth') === 'true')
    }
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === '00000') {
      sessionStorage.setItem('updates_auth', 'true')
      setAuthed(true)
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-7 w-7 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">Restricted Access</h2>
            <p className="text-sm text-muted-foreground">Enter the admin password to view exam results.</p>
          </div>

          <form onSubmit={handleLogin} className="border rounded-xl bg-card p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwd">Password</Label>
              <Input
                id="pwd"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={!password}>
              Unlock
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Exam Results</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All submitted exam attempts</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { sessionStorage.removeItem('updates_auth'); setAuthed(false) }}
        >
          Lock
        </Button>
      </div>

      <ResultsTable />
    </div>
  )
}
