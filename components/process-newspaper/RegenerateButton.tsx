'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { PasswordPromptModal } from './PasswordPromptModal'
import { newspaperAuthHeader } from '@/lib/processNewspaper/auth'
import type { TodayEditionResponse } from '@/lib/processNewspaper/types'

interface RegenerateButtonProps {
  onRegenerated: (edition: TodayEditionResponse) => void
}

export function RegenerateButton({ onRegenerated }: RegenerateButtonProps) {
  const [promptOpen, setPromptOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegenerate() {
    setPromptOpen(false)
    setLoading(true)
    try {
      const res = await fetch('/api/process-newspaper/regenerate', {
        method: 'POST',
        headers: newspaperAuthHeader(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to re-create today's edition")
      onRegenerated(data.edition)
      toast.success("Today's edition re-created")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to re-create today's edition")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 bg-white/70"
        disabled={loading}
        onClick={() => setPromptOpen(true)}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Re-creating…' : 'Re-Create'}
      </Button>

      {promptOpen && (
        <PasswordPromptModal
          title="Re-Create Today's Edition"
          message="Enter the password to regenerate today's newspaper from the current process library. This may select a new headline and supporting articles."
          onSuccess={handleRegenerate}
          onCancel={() => setPromptOpen(false)}
        />
      )}
    </>
  )
}
