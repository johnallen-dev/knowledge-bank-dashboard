import { NextRequest, NextResponse } from 'next/server'
import { createDocument } from '@/lib/db/queries/updates'

const MAX_CHARS = 50_000

function htmlToText(html: string): string {
  return html
    // Remove script and style blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    // Replace block-level tags with newlines
    .replace(/<\/?(p|div|section|article|header|footer|h[1-6]|li|tr|td|th|br)[^>]*>/gi, '\n')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    // Clean whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_CHARS)
}

function titleFromUrl(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname + u.pathname
  } catch {
    return url
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string }

    if (!url?.trim()) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate it's a real URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url.trim())
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only http/https URLs are supported')
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL. Please enter a full URL starting with https://' }, { status: 400 })
    }

    // Fetch the page
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GreenKeyBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(20_000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Could not fetch URL (HTTP ${response.status})` }, { status: 422 })
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return NextResponse.json({ error: 'URL must point to an HTML page' }, { status: 422 })
    }

    const html = await response.text()
    const extractedText = htmlToText(html)

    if (!extractedText.trim() || extractedText.length < 100) {
      return NextResponse.json({ error: 'Could not extract meaningful text from this page.' }, { status: 422 })
    }

    const title = titleFromUrl(parsedUrl.toString())
    const documentId = await createDocument({
      title,
      filename: parsedUrl.toString(),
      file_type: 'url',
      extracted_text: extractedText,
    })

    return NextResponse.json({
      documentId,
      charCount: extractedText.length,
      preview: extractedText.slice(0, 1500),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/updates/fetch-url]', message)
    return NextResponse.json({ error: `Failed to fetch URL: ${message}` }, { status: 500 })
  }
}
