import { NextRequest, NextResponse } from 'next/server'
import { getAllSettings, setSetting } from '@/lib/db/queries/settings'
import { resetNotionClient } from '@/lib/notion/client'

export async function GET() {
  try {
    return NextResponse.json(await getAllSettings())
  } catch (err) {
    console.error('[GET /api/settings]', err)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const settings: Record<string, string> = body.settings ?? body
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string') await setSetting(key, value)
    }
    if (settings.notion_token) resetNotionClient()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/settings]', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
