import { NextRequest, NextResponse } from 'next/server'
import { setSetting } from '@/lib/db/queries/settings'
import { resetNotionClient } from '@/lib/notion/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error || !code) {
    return NextResponse.redirect(
      `${appUrl}/settings?notion_error=${encodeURIComponent(error ?? 'access_denied')}`
    )
  }

  const clientId = process.env.NOTION_CLIENT_ID!
  const clientSecret = process.env.NOTION_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/notion/callback`

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      console.error('[notion/callback] Token exchange failed:', body)
      return NextResponse.redirect(`${appUrl}/settings?notion_error=token_exchange_failed`)
    }

    const data = await tokenRes.json() as {
      access_token: string
      workspace_name: string
      workspace_id: string
      bot_id: string
    }

    // Persist token and workspace info
    await setSetting('notion_token', data.access_token)
    await setSetting('notion_workspace_name', data.workspace_name ?? '')
    await setSetting('notion_workspace_id', data.workspace_id ?? '')
    await setSetting('notion_bot_id', data.bot_id ?? '')
    resetNotionClient()

    return NextResponse.redirect(`${appUrl}/settings?notion_connected=1`)
  } catch (err) {
    console.error('[notion/callback]', err)
    return NextResponse.redirect(`${appUrl}/settings?notion_error=server_error`)
  }
}
