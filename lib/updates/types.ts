export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank'

export interface ExamQuestion {
  id: string
  type: QuestionType
  question: string
  options?: string[]            // MC: 4 items; TF: ["True","False"]
  correct_answer: string
  acceptable_variants?: string[]// fill_blank only, all lowercase
  points: number                // always 1
}

export interface UpdateDocument {
  id: number
  title: string
  filename: string
  file_type: string
  extracted_text: string
  created_at: string
}

export interface Exam {
  id: number
  document_id: number
  question_count: number
  questions: ExamQuestion[]
  share_token: string
  created_at: string
}

export interface ExamAttempt {
  id: number
  exam_id: number
  examinee_name: string
  exam_date: string
  answers: Record<string, string>
  score: number
  max_score: number
  signature_b64: string
  duration_seconds: number
  submitted_at: string
  // joined fields
  document_title?: string
  question_count?: number
  share_token?: string
  questions?: ExamQuestion[]
}
