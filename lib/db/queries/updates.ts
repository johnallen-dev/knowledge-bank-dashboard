import { getDb } from '../client'
import type { UpdateDocument, Exam, ExamAttempt, ExamQuestion } from '@/lib/updates/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDocument(row: Record<string, unknown>): UpdateDocument {
  return {
    id: Number(row.id),
    title: String(row.title ?? ''),
    filename: String(row.filename ?? ''),
    file_type: String(row.file_type ?? ''),
    extracted_text: String(row.extracted_text ?? ''),
    created_at: String(row.created_at ?? ''),
  }
}

function toExam(row: Record<string, unknown>): Exam {
  let questions: ExamQuestion[] = []
  try { questions = JSON.parse(String(row.questions_json ?? '[]')) } catch { /* */ }
  return {
    id: Number(row.id),
    document_id: Number(row.document_id),
    question_count: Number(row.question_count),
    questions,
    share_token: String(row.share_token ?? ''),
    created_at: String(row.created_at ?? ''),
  }
}

function toAttempt(row: Record<string, unknown>): ExamAttempt {
  let answers: Record<string, string> = {}
  try { answers = JSON.parse(String(row.answers_json ?? '{}')) } catch { /* */ }
  return {
    id: Number(row.id),
    exam_id: Number(row.exam_id),
    examinee_name: String(row.examinee_name ?? ''),
    exam_date: String(row.exam_date ?? ''),
    answers,
    score: Number(row.score),
    max_score: Number(row.max_score),
    signature_b64: String(row.signature_b64 ?? ''),
    submitted_at: String(row.submitted_at ?? ''),
    document_title: row.document_title ? String(row.document_title) : undefined,
    question_count: row.question_count ? Number(row.question_count) : undefined,
    share_token: row.share_token ? String(row.share_token) : undefined,
  }
}

// ── update_documents ──────────────────────────────────────────────────────────

export async function createDocument(input: {
  title: string
  filename: string
  file_type: string
  extracted_text: string
}): Promise<number> {
  const db = await getDb()
  const result = await db.execute({
    sql: 'INSERT INTO update_documents (title, filename, file_type, extracted_text) VALUES (?, ?, ?, ?)',
    args: [input.title, input.filename, input.file_type, input.extracted_text],
  })
  return Number(result.lastInsertRowid)
}

export async function getDocument(id: number): Promise<UpdateDocument | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM update_documents WHERE id = ?', args: [id] })
  return rows[0] ? toDocument(rows[0] as Record<string, unknown>) : null
}

export async function listDocuments(): Promise<UpdateDocument[]> {
  const db = await getDb()
  const { rows } = await db.execute('SELECT * FROM update_documents ORDER BY created_at DESC')
  return rows.map(r => toDocument(r as Record<string, unknown>))
}

// ── exams ─────────────────────────────────────────────────────────────────────

export async function createExam(input: {
  document_id: number
  question_count: number
  questions_json: string
}): Promise<number> {
  const db = await getDb()
  const result = await db.execute({
    sql: 'INSERT INTO exams (document_id, question_count, questions_json) VALUES (?, ?, ?)',
    args: [input.document_id, input.question_count, input.questions_json],
  })
  return Number(result.lastInsertRowid)
}

export async function getExamByToken(token: string): Promise<Exam | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM exams WHERE share_token = ?', args: [token] })
  return rows[0] ? toExam(rows[0] as Record<string, unknown>) : null
}

export async function getExamById(id: number): Promise<Exam | null> {
  const db = await getDb()
  const { rows } = await db.execute({ sql: 'SELECT * FROM exams WHERE id = ?', args: [id] })
  return rows[0] ? toExam(rows[0] as Record<string, unknown>) : null
}

export async function getExamsByDocument(docId: number): Promise<Exam[]> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: 'SELECT * FROM exams WHERE document_id = ? ORDER BY created_at DESC',
    args: [docId],
  })
  return rows.map(r => toExam(r as Record<string, unknown>))
}

// ── exam_attempts ─────────────────────────────────────────────────────────────

export async function createAttempt(input: {
  exam_id: number
  examinee_name: string
  exam_date: string
  answers_json: string
  score: number
  max_score: number
  signature_b64: string
}): Promise<number> {
  const db = await getDb()
  const result = await db.execute({
    sql: `INSERT INTO exam_attempts
          (exam_id, examinee_name, exam_date, answers_json, score, max_score, signature_b64)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.exam_id, input.examinee_name, input.exam_date,
      input.answers_json, input.score, input.max_score, input.signature_b64,
    ],
  })
  return Number(result.lastInsertRowid)
}

export async function listAttempts(filter?: { search?: string }): Promise<ExamAttempt[]> {
  const db = await getDb()
  const search = filter?.search?.trim()
  const sql = `
    SELECT
      ea.*,
      ud.title  AS document_title,
      e.question_count,
      e.share_token
    FROM exam_attempts ea
    JOIN exams e          ON ea.exam_id = e.id
    JOIN update_documents ud ON e.document_id = ud.id
    ${search ? 'WHERE ea.examinee_name LIKE ? OR ea.exam_date LIKE ?' : ''}
    ORDER BY ea.submitted_at DESC
  `
  const args = search ? [`%${search}%`, `%${search}%`] : []
  const { rows } = await db.execute({ sql, args })
  return rows.map(r => toAttempt(r as Record<string, unknown>))
}

export async function getAttempt(id: number): Promise<ExamAttempt | null> {
  const db = await getDb()
  const { rows } = await db.execute({
    sql: `SELECT ea.*, ud.title AS document_title, e.question_count, e.share_token
          FROM exam_attempts ea
          JOIN exams e ON ea.exam_id = e.id
          JOIN update_documents ud ON e.document_id = ud.id
          WHERE ea.id = ?`,
    args: [id],
  })
  return rows[0] ? toAttempt(rows[0] as Record<string, unknown>) : null
}
