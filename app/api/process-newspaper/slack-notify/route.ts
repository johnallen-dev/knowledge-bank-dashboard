import { NextRequest, NextResponse } from 'next/server'
import { generateOrGetTodayEdition } from '@/lib/processNewspaper/rotation'

export const dynamic = 'force-dynamic'
// Cold (first-of-day) generation runs trivia + layout selection + summary backfill
// in parallel before this route can respond — measured ~8s locally with everything
// already cached; slower in production against Turso + the Anthropic API. Extend past
// Vercel's default 10s function timeout so the cron doesn't 504 before Slack gets sent.
export const maxDuration = 60

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set on the
  // project — verify it if configured, so this endpoint can't be triggered by anyone else.
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.get('authorization') ?? ''
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[GET /api/process-newspaper/slack-notify] SLACK_WEBHOOK_URL is not configured')
    return NextResponse.json({ error: 'SLACK_WEBHOOK_URL is not configured' }, { status: 500 })
  }

  try {
    const edition = await generateOrGetTodayEdition()

    if (!edition.headline) {
      // Nothing eligible today — skip rather than spamming Slack with an empty reminder.
      return NextResponse.json({ skipped: true, reason: 'no eligible processes today' })
    }

    const newspaperUrl = `${getAppUrl()}/process-newspaper`
    const dateLabel = new Date().toLocaleDateString('en-US', {
      timeZone: 'Asia/Manila', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📰 Process Newspaper', emoji: true },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: dateLabel }],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Today's Headline:*\n${edition.headline.title}` },
      },
      ...(edition.trivia ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `💡 *Did you know?*\n${edition.trivia}` },
      }] : []),
      {
        type: 'actions',
        elements: [{
          type: 'button',
          text: { type: 'plain_text', text: 'Read Today\'s Newspaper', emoji: true },
          url: newspaperUrl,
          style: 'primary',
        }],
      },
    ]

    const slackRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })

    if (!slackRes.ok) {
      const body = await slackRes.text()
      console.error('[GET /api/process-newspaper/slack-notify] Slack rejected the message', slackRes.status, body)
      return NextResponse.json({ error: 'Slack rejected the message' }, { status: 502 })
    }

    return NextResponse.json({ success: true, headline: edition.headline.title })
  } catch (err) {
    console.error('[GET /api/process-newspaper/slack-notify]', err)
    return NextResponse.json({ error: 'Failed to send Slack notification' }, { status: 500 })
  }
}
