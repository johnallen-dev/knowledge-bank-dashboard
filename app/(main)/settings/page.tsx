'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    notion_database_ids: '',
    ai_model: 'claude-sonnet-4-6',
    guest_system_prompt_override: '',
    user_system_prompt_override: '',
  })

  // Handle OAuth redirect feedback
  useEffect(() => {
    if (searchParams.get('notion_connected') === '1') {
      toast.success('Notion connected successfully!')
      window.history.replaceState({}, '', '/settings')
    }
    const err = searchParams.get('notion_error')
    if (err) {
      toast.error(`Notion connection failed: ${err}`)
      window.history.replaceState({}, '', '/settings')
    }
  }, [searchParams])

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        setSettings(data)
        setForm(prev => ({
          ...prev,
          notion_database_ids: data.notion_database_ids ?? '',
          ai_model: data.ai_model ?? 'claude-sonnet-4-6',
          guest_system_prompt_override: data.guest_system_prompt_override ?? '',
          user_system_prompt_override: data.user_system_prompt_override ?? '',
        }))
      })
      .catch(() => {})
  }, [])

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: form }),
      })
      if (!res.ok) throw new Error()
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function disconnectNotion() {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          notion_token: '',
          notion_workspace_name: '',
          notion_workspace_id: '',
        },
      }),
    })
    setSettings(prev => ({ ...prev, notion_token: '', notion_workspace_name: '' }))
    toast.success('Notion disconnected')
  }

  const isNotionConnected = !!settings.notion_token
  const workspaceName = settings.notion_workspace_name

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure integrations and AI behavior</p>
      </div>

      {/* Notion OAuth Section */}
      <div className="space-y-4">
        <h2 className="font-medium">Notion Integration</h2>
        <Separator />

        <div className="rounded-lg border p-5 space-y-4">
          {isNotionConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-sm">Connected to Notion</span>
                {workspaceName && (
                  <Badge variant="secondary">{workspaceName}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your Notion account is linked. The AI will search all pages and databases you shared during authorization.
              </p>
              <Button variant="outline" size="sm" onClick={disconnectNotion}>
                Disconnect Notion
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-sm text-muted-foreground">Not connected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the button below to log in with your Notion account (Gmail or any login method your Notion uses). You&apos;ll choose which pages and databases to share.
              </p>
              <Button asChild>
                <a href="/api/notion/connect">
                  <ExternalLink className="h-4 w-4" />
                  Connect with Notion
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Optional: specific DB IDs */}
        <div className="space-y-2">
          <Label htmlFor="notion_database_ids">
            Specific Database IDs <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="notion_database_ids"
            value={form.notion_database_ids}
            onChange={e => set('notion_database_ids', e.target.value)}
            placeholder="abc123, def456  — leave blank to search all shared pages"
          />
          <p className="text-xs text-muted-foreground">
            By default the AI searches all pages you shared during authorization. Add specific database IDs here to limit the search scope.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-8">
        {/* AI Config */}
        <div className="space-y-4">
          <h2 className="font-medium">AI Configuration</h2>
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="ai_model">Model</Label>
            <Input
              id="ai_model"
              value={form.ai_model}
              onChange={e => set('ai_model', e.target.value)}
              placeholder="claude-sonnet-4-6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest_prompt">
              Guest System Prompt Override <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="guest_prompt"
              value={form.guest_system_prompt_override}
              onChange={e => set('guest_system_prompt_override', e.target.value)}
              placeholder="Leave blank to use the default prompt..."
              className="min-h-[100px] text-xs font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_prompt">
              Staff System Prompt Override <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="user_prompt"
              value={form.user_system_prompt_override}
              onChange={e => set('user_system_prompt_override', e.target.value)}
              placeholder="Leave blank to use the default prompt..."
              className="min-h-[100px] text-xs font-mono"
            />
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  )
}
