import { Client } from '@notionhq/client'
import { getSetting } from '@/lib/db/queries/settings'

let notionClient: Client | null = null

export async function getNotionClient(): Promise<Client> {
  const token = await (async () => {
    try { return await getSetting('notion_token') } catch { return null }
  })() ?? process.env.NOTION_TOKEN

  if (!token) throw new Error('Notion token not configured')

  if (!notionClient) {
    notionClient = new Client({ auth: token })
  }
  return notionClient
}

export function resetNotionClient(): void {
  notionClient = null
}

export async function getNotionDatabaseIds(): Promise<string[]> {
  const fromSettings = await (async () => {
    try { return await getSetting('notion_database_ids') } catch { return null }
  })()
  const raw = fromSettings ?? process.env.NOTION_DATABASE_IDS ?? ''
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}
