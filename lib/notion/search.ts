import { getNotionClient, getNotionDatabaseIds } from './client'
import { blocksToText } from './format'

export interface NotionResult {
  pageId: string
  title: string
  url: string
  snippet: string
}

const STOPWORDS = new Set([
  'the','and','for','are','but','not','you','all','can','her','was','one',
  'our','out','day','get','has','him','his','how','its','may','new','now',
  'old','see','two','way','who','did','does','what','when','with','this',
  'that','from','they','will','have','been','your','more','also',
])

export async function searchNotion(query: string): Promise<NotionResult[]> {
  const [notion, dbIds] = await Promise.all([getNotionClient(), getNotionDatabaseIds()])

  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w))
    .slice(0, 3)

  const tasks: Promise<{ results: Array<Record<string, unknown>> }>[] = [
    notion.search({ query, filter: { value: 'page', property: 'object' }, page_size: 5 })
      .then(r => ({ results: r.results as Array<Record<string, unknown>> })),
  ]

  for (const dbId of dbIds) {
    if (keywords.length > 0) {
      tasks.push(
        notion.databases.query({
          database_id: dbId,
          filter: { or: keywords.map(kw => ({ property: 'Name', title: { contains: kw } })) },
          page_size: 3,
        }).then(r => ({ results: r.results as Array<Record<string, unknown>> }))
      )
    }
  }

  const settled = await Promise.allSettled(tasks)
  const pageMap = new Map<string, NotionResult>()

  for (const result of settled) {
    if (result.status !== 'fulfilled') continue
    for (const page of result.value.results) {
      const id = String(page.id ?? '')
      if (pageMap.has(id)) continue
      const title = getPageTitle(page)
      const url = String(page.url ?? '')
      pageMap.set(id, { pageId: id, title, url, snippet: '' })
    }
  }

  const results: NotionResult[] = []
  for (const [pageId, entry] of pageMap) {
    try {
      const blocksResp = await notion.blocks.children.list({ block_id: pageId, page_size: 20 })
      entry.snippet = blocksToText(blocksResp.results as Parameters<typeof blocksToText>[0])
    } catch {
      entry.snippet = ''
    }
    results.push(entry)
    if (results.length >= 5) break
  }

  return results
}

function getPageTitle(page: Record<string, unknown>): string {
  const props = (page.properties ?? {}) as Record<string, unknown>
  for (const key of ['Name', 'Title', 'title', 'name']) {
    const prop = props[key] as { title?: Array<{ plain_text: string }> } | undefined
    if (prop?.title) return prop.title.map(t => t.plain_text).join('')
  }
  return 'Untitled'
}
