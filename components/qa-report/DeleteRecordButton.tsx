'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { PasswordPromptModal } from './PasswordPromptModal'

export interface DeleteTarget {
  key: 'qa' | 'feedback'
  label: string
  onDelete: () => Promise<void>
}

interface DeleteRecordButtonProps {
  targets: DeleteTarget[]
  recordLabel: string
  onDeleted: () => void
}

type Step = 'closed' | 'password' | 'confirm'

export function DeleteRecordButton({ targets, recordLabel, onDeleted }: DeleteRecordButtonProps) {
  const [step, setStep] = useState<Step>('closed')
  const [deleting, setDeleting] = useState(false)

  function close() {
    setStep('closed')
    setDeleting(false)
  }

  async function runDelete(keys: Array<'qa' | 'feedback'>) {
    setDeleting(true)
    try {
      await Promise.all(targets.filter(t => keys.includes(t.key)).map(t => t.onDelete()))
      toast.success('Record deleted')
      close()
      onDeleted()
    } catch {
      toast.error('Failed to delete record')
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
          title="Delete Record"
          message={`Enter the password to delete this record for ${recordLabel}.`}
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

            {targets.length > 1 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  This record combines a QA Portal entry and an Agent Portal entry for <strong className="text-foreground">{recordLabel}</strong>.
                  What would you like to delete? This cannot be undone.
                </p>
                <div className="flex flex-col gap-2">
                  {targets.map(t => (
                    <Button
                      key={t.key}
                      variant="destructive"
                      disabled={deleting}
                      onClick={() => runDelete([t.key])}
                    >
                      Delete {t.label}
                    </Button>
                  ))}
                  <Button
                    variant="destructive"
                    disabled={deleting}
                    onClick={() => runDelete(targets.map(t => t.key))}
                  >
                    Delete Both
                  </Button>
                  <Button variant="outline" disabled={deleting} onClick={close}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  You are about to permanently delete the {targets[0]?.label ?? 'record'} for{' '}
                  <strong className="text-foreground">{recordLabel}</strong>. This cannot be undone.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" disabled={deleting} onClick={close}>Cancel</Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={deleting}
                    onClick={() => runDelete(targets.map(t => t.key))}
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
