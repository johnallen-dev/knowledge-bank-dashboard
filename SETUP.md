# Knowledge Bank Dashboard — Setup Guide

## Prerequisites

Install **Node.js 18+** from https://nodejs.org (LTS version recommended).

Verify installation:
```
node --version   # should show v18 or higher
npm --version
```

## 1. Install dependencies

Open a terminal in this folder and run:

```
npm install
```

This installs all packages listed in `package.json`.

## 2. Create your environment file

Copy the example and fill in your keys:

```
copy .env.example .env.local
```

Edit `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...          # Your Anthropic API key
NOTION_TOKEN=secret_...               # Your Notion integration token
NOTION_DATABASE_IDS=id1,id2           # Comma-separated Notion DB IDs (optional)
NEXT_PUBLIC_PROPERTY_NAME=Your Hotel  # Your property name shown in the UI
```

**Getting your Notion integration token:**
1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Copy the "Internal Integration Secret"
4. Share each Notion database you want to search with your integration (open the DB → ··· → Connections → add your integration)
5. Get each database ID from its URL: `notion.so/workspace/DATABASE_ID?v=...`

## 3. Start the development server

```
npm run dev
```

Open http://localhost:3000 — it redirects to the Guest section automatically.

## 4. First-time setup in the UI

1. Go to **Settings** in the sidebar
2. Paste your Notion token and database IDs
3. Click **Save Settings**
4. Go to **Add Knowledge** to add your first Q&A entries
5. Test by asking a question in the Guest or Staff section

## Project structure

```
app/
  (main)/
    guest/          → Guest Q&A page
    user/           → Staff Q&A page
    knowledge-base/ → Knowledge management
    categories/     → Category management
    analytics/      → Usage analytics
    settings/       → Notion & AI config
  api/              → REST API routes
lib/
  db/               → SQLite database (auto-created at data/knowledge-bank.db)
  ai/               → Claude AI pipeline
  notion/           → Notion search integration
components/         → React UI components
```

## Deploying to Vercel

1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variables (same as `.env.local`)
4. For SQLite persistence, add a Vercel KV or use Turso (libSQL) — contact support for guidance

## Troubleshooting

- **"better-sqlite3" build error**: Run `npm install` again; if it fails, install Visual Studio Build Tools from https://visualstudio.microsoft.com/downloads/
- **"Cannot find module"**: Run `npm install` to install all dependencies
- **Notion not returning results**: Ensure your integration has access to the databases (share each DB with your integration in Notion)
- **AI not responding**: Check that `ANTHROPIC_API_KEY` is set correctly in `.env.local`
