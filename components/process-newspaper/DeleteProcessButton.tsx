'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { PasswordPromptModal } from './PasswordPromptModal'
import { newspaperAuthHeader } from '@/lib/processNewspaper/auth'

interface DeleteProcessButtonProps {
  id: number
  title: string
  onDeleted: () => void
}

type Step = 'closed' | 'password' | 'confirm'

export function DeleteProcessButton({ id, title, onDeleted }: DeleteProcessButtonProps) {
  const [step, setStep] = useState<Step>('closed')
  const [deleting, setDeleting] = useState(false)

  function close() {
    setStep('closed')
    setDeleting(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/process-newspaper/processes/${id}`, {
        method: 'DELETE',
        headers: newspaperAuthHeader(),
      })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Process deleted')
      close()
      onDeleted()
    } catch {
      toast.error('Failed to delete process')
      setDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-red-50"
        onClick={() => setStep('password')}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      {step === 'password' && (
        <PasswordPromptModal
          title="Delete Process"
          message={`Enter the password to delete "${title}".`}
          onSuccess={() => setStep('confirm')}
          onCancel={close}
        />
      )}

      {step === 'confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h3 className="font-semibold">Confirm Delete</h3>
              </div>
              <button onClick={close} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              You are about to permanently delete <strong className="text-foreground">{title}</strong>. This removes it from
              the newspaper and headline rotation. This cannot be undone.
            </p>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" disabled={deleting} onClick={close}>Cancel</Button>
              <Button variant="destructive" className="flex-1" disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
