import type { Client } from '@libsql/client'

export async function runMigrations(db: Client): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS categories (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL UNIQUE,
      slug      TEXT NOT NULL UNIQUE,
      color     TEXT DEFAULT '#6366f1',
      icon      TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS knowledge_entries (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid          TEXT NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(16)))),
      question      TEXT NOT NULL,
      answer        TEXT NOT NULL,
      category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      tags          TEXT DEFAULT '[]',
      source_type   TEXT DEFAULT 'manual',
      source_url    TEXT,
      notion_page_id TEXT,
      related_ids   TEXT DEFAULT '[]',
      is_archived   INTEGER DEFAULT 0,
      confidence    REAL DEFAULT 1.0,
      view_count    INTEGER DEFAULT 0,
      helpful_count INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS knowledge_revisions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id    INTEGER NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
      question    TEXT NOT NULL,
      answer      TEXT NOT NULL,
      changed_by  TEXT DEFAULT 'staff',
      change_note TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS question_log (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text    TEXT NOT NULL,
      section          TEXT NOT NULL,
      matched_entry_id INTEGER REFERENCES knowledge_entries(id) ON DELETE SET NULL,
      match_type       TEXT,
      confidence       REAL,
      answer_given     TEXT,
      sources_used     TEXT DEFAULT '[]',
      was_helpful      INTEGER,
      response_ms      INTEGER,
      asked_at         TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_entries_category ON knowledge_entries(category_id);
    CREATE INDEX IF NOT EXISTS idx_entries_archived ON knowledge_entries(is_archived);
    CREATE INDEX IF NOT EXISTS idx_entries_updated ON knowledge_entries(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_log_section ON question_log(section);
    CREATE INDEX IF NOT EXISTS idx_log_asked_at ON question_log(asked_at DESC);
  `)

  // FTS5 (separate — may fail on SQLite builds without FTS5)
  try {
    await db.executeMultiple(`
      CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
        question,
        answer,
        tags,
        content='knowledge_entries',
        content_rowid='id'
      );

      CREATE TRIGGER IF NOT EXISTS knowledge_fts_insert
      AFTER INSERT ON knowledge_entries BEGIN
        INSERT INTO knowledge_fts(rowid, question, answer, tags)
        VALUES (new.id, new.question, new.answer, new.tags);
      END;

      CREATE TRIGGER IF NOT EXISTS knowledge_fts_update
      AFTER UPDATE ON knowledge_entries BEGIN
        INSERT INTO knowledge_fts(knowledge_fts, rowid, question, answer, tags)
        VALUES ('delete', old.id, old.question, old.answer, old.tags);
        INSERT INTO knowledge_fts(rowid, question, answer, tags)
        VALUES (new.id, new.question, new.answer, new.tags);
      END;

      CREATE TRIGGER IF NOT EXISTS knowledge_fts_delete
      AFTER DELETE ON knowledge_entries BEGIN
        INSERT INTO knowledge_fts(knowledge_fts, rowid, question, answer, tags)
        VALUES ('delete', old.id, old.question, old.answer, old.tags);
      END;
    `)
  } catch (_e) {
    // FTS5 not available
  }

  // ── Updates Module ────────────────────────────────────────────────────────────
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS update_documents (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      title          TEXT NOT NULL,
      filename       TEXT NOT NULL,
      file_type      TEXT NOT NULL,
      extracted_text TEXT NOT NULL,
      created_at     TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exams (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id    INTEGER NOT NULL REFERENCES update_documents(id) ON DELETE CASCADE,
      question_count INTEGER NOT NULL,
      questions_json TEXT NOT NULL,
      share_token    TEXT NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(8)))),
      created_at     TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exam_attempts (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id        INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      examinee_name  TEXT NOT NULL,
      exam_date      TEXT NOT NULL,
      answers_json   TEXT NOT NULL,
      score          INTEGER NOT NULL,
      max_score      INTEGER NOT NULL,
      signature_b64  TEXT NOT NULL,
      submitted_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_exams_document ON exams(document_id);
    CREATE INDEX IF NOT EXISTS idx_exams_token    ON exams(share_token);
    CREATE INDEX IF NOT EXISTS idx_attempts_exam  ON exam_attempts(exam_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_name  ON exam_attempts(examinee_name);
  `)

  await seedCategories(db)
}

const DEFAULT_CATEGORIES = [
  { name: 'Reservations', slug: 'reservations', color: '#3b82f6', icon: 'Calendar' },
  { name: 'Check-In', slug: 'check-in', color: '#10b981', icon: 'LogIn' },
  { name: 'Check-Out', slug: 'check-out', color: '#f59e0b', icon: 'LogOut' },
  { name: 'Payments', slug: 'payments', color: '#8b5cf6', icon: 'CreditCard' },
  { name: 'Breakfast', slug: 'breakfast', color: '#f97316', icon: 'Coffee' },
  { name: 'Housekeeping', slug: 'housekeeping', color: '#06b6d4', icon: 'Sparkles' },
  { name: 'Maintenance', slug: 'maintenance', color: '#ef4444', icon: 'Wrench' },
  { name: 'Booking.com', slug: 'booking-com', color: '#1a56db', icon: 'Globe' },
  { name: 'Airbnb', slug: 'airbnb', color: '#ff385c', icon: 'Home' },
  { name: 'Operations', slug: 'operations', color: '#6366f1', icon: 'Settings' },
  { name: 'Guest Communication', slug: 'guest-communication', color: '#14b8a6', icon: 'MessageSquare' },
  { name: 'Internal Procedures', slug: 'internal-procedures', color: '#78716c', icon: 'FileText' },
]

async function seedCategories(db: Client): Promise<void> {
  const { rows } = await db.execute('SELECT COUNT(*) as c FROM categories')
  if (Number(rows[0].c) > 0) return
  for (const cat of DEFAULT_CATEGORIES) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO categories (name, slug, color, icon) VALUES (?, ?, ?, ?)',
      args: [cat.name, cat.slug, cat.color, cat.icon],
    })
  }
}
