import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.NOTION_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'NOTION_CLIENT_ID is not configured in .env.local' },
      { status: 500 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/notion/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    owner: 'user',
  })

  return NextResponse.redirect(
    `https://api.notion.com/v1/oauth/authorize?${params}`
  )
}
