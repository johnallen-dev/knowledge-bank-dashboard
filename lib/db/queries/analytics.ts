import { getDb } from '../client'

export async function getAnalytics() {
  const db = await getDb()

  const { rows: tr } = await db.execute(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN section = 'guest' THEN 1 ELSE 0 END) as guest_total,
      SUM(CASE WHEN section = 'user' THEN 1 ELSE 0 END) as user_total,
      SUM(CASE WHEN confidence < 0.5 OR confidence IS NULL THEN 1 ELSE 0 END) as unanswered_total
    FROM question_log
  `)
  const totals = {
    total: Number(tr[0]?.total ?? 0),
    guest_total: Number(tr[0]?.guest_total ?? 0),
    user_total: Number(tr[0]?.user_total ?? 0),
    unanswered_total: Number(tr[0]?.unanswered_total ?? 0),
  }

  const { rows: tq } = await db.execute(`
    SELECT question_text, COUNT(*) as count
    FROM question_log
    GROUP BY lower(question_text)
    ORDER BY count DESC
    LIMIT 10
  `)
  const topQuestions = tq.map(r => ({
    question_text: String(r.question_text ?? ''),
    count: Number(r.count ?? 0),
  }))

  const { rows: uq } = await db.execute(`
    SELECT question_text, section, asked_at
    FROM question_log
    WHERE confidence < 0.5 OR confidence IS NULL
    ORDER BY asked_at DESC
    LIMIT 20
  `)
  const unanswered = uq.map(r => ({
    question_text: String(r.question_text ?? ''),
    section: String(r.section ?? ''),
    asked_at: String(r.asked_at ?? ''),
  }))

  const { rows: dd } = await db.execute(`
    SELECT
      date(asked_at) as date,
      COUNT(*) as total,
      SUM(CASE WHEN section = 'guest' THEN 1 ELSE 0 END) as guest,
      SUM(CASE WHEN section = 'user' THEN 1 ELSE 0 END) as user
    FROM question_log
    WHERE asked_at >= datetime('now', '-30 days')
    GROUP BY date(asked_at)
    ORDER BY date ASC
  `)
  const dailyData = dd.map(r => ({
    date: String(r.date ?? ''),
    total: Number(r.total ?? 0),
    guest: Number(r.guest ?? 0),
    user: Number(r.user ?? 0),
  }))

  const { rows: mb } = await db.execute(`
    SELECT match_type, COUNT(*) as count
    FROM question_log
    WHERE match_type IS NOT NULL
    GROUP BY match_type
  `)
  const matchBreakdown = mb.map(r => ({
    match_type: String(r.match_type ?? ''),
    count: Number(r.count ?? 0),
  }))

  return { totals, topQuestions, unanswered, dailyData, matchBreakdown }
}
