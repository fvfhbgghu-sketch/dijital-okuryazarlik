// Shared domain types, mirroring the Postgres schema and RPC return shapes.

export interface Exam {
  id: string
  slug: string
  title: string
  description: string | null
  question_count: number
  is_active: boolean
  created_at: string
}

export interface OptionPublic {
  id: string
  question_id: string
  option_label: string
  option_text: string
  sort_order: number
}

export interface QuestionPublic {
  id: string
  exam_id: string
  question_number: number
  question_text: string
  options: OptionPublic[]
}

/** Map of question_id -> selected option_id (null = unanswered). */
export type AnswerMap = Record<string, string | null>

export interface SessionSummary {
  session_id: string
  total_questions: number
  correct_count: number
  wrong_count: number
  percentage: number
  score: number
  status: 'in_progress' | 'submitted'
}

export interface ResultOption {
  id: string
  label: string
  text: string
  is_correct: boolean
}

export interface ResultQuestion {
  question_id: string
  question_number: number
  question_text: string
  selected_option_id: string | null
  is_correct: boolean
  options: ResultOption[]
}

export interface SessionResults {
  session: {
    id: string
    exam_id: string
    participant_name: string
    participant_email: string | null
    status: string
    total_questions: number
    correct_count: number
    wrong_count: number
    percentage: number
    score: number
    started_at: string
    finished_at: string | null
    duration_seconds: number | null
  }
  questions: ResultQuestion[]
}

export interface AdminStats {
  total_attempts: number
  avg_score: number
  highest_score: number
  lowest_score: number
  unique_participants: number
}

export interface AdminSessionRow {
  id: string
  exam_id: string
  participant_name: string
  participant_email: string | null
  status: string
  total_questions: number
  correct_count: number
  wrong_count: number
  percentage: number
  score: number
  started_at: string
  finished_at: string | null
}

export interface AdminQuestion {
  id: string
  exam_id: string
  question_number: number
  question_text: string
  options: {
    id: string
    option_label: string
    option_text: string
    is_correct: boolean
    sort_order: number
  }[]
}
