import { supabase } from './supabase'
import type {
  AdminQuestion, AdminSessionRow, AdminStats, Exam, QuestionPublic,
  SessionResults, SessionSummary,
} from './types'

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message)
  if (data == null) throw new Error('Beklenmeyen boş yanıt')
  return data
}

// ---------- Public (participant) ----------

export async function listExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams').select('*').eq('is_active', true).order('created_at')
  return unwrap(data, error)
}

export async function getExam(slug: string): Promise<Exam> {
  const { data, error } = await supabase
    .from('exams').select('*').eq('slug', slug).single()
  return unwrap(data, error)
}

export async function getExamQuestions(examId: string): Promise<QuestionPublic[]> {
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, exam_id, question_number, question_text')
    .eq('exam_id', examId)
    .order('question_number')
  if (qErr) throw new Error(qErr.message)

  const ids = (questions ?? []).map((q) => q.id)
  const { data: options, error: oErr } = await supabase
    .from('question_options_public')
    .select('*')
    .in('question_id', ids)
    .order('sort_order')
  if (oErr) throw new Error(oErr.message)

  return (questions ?? []).map((q) => ({
    ...q,
    options: (options ?? []).filter((o) => o.question_id === q.id),
  }))
}

export async function startSession(
  examId: string, name: string, email: string | null,
): Promise<string> {
  const { data, error } = await supabase.rpc('start_exam_session', {
    p_exam_id: examId, p_name: name, p_email: email,
  })
  return unwrap(data as string, error)
}

export async function saveAnswer(
  sessionId: string, questionId: string, optionId: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('save_answer', {
    p_session_id: sessionId, p_question_id: questionId, p_option_id: optionId,
  })
  if (error) throw new Error(error.message)
}

export async function getSessionState(sessionId: string): Promise<{
  session: { status: string; participant_name: string } | null
  answers: { question_id: string; selected_option_id: string | null }[]
}> {
  const { data, error } = await supabase.rpc('get_session_state', { p_session_id: sessionId })
  return unwrap(data, error)
}

export async function submitExam(
  sessionId: string,
  answers: { question_id: string; option_id: string | null }[],
): Promise<SessionSummary> {
  const { data, error } = await supabase.rpc('submit_exam', {
    p_session_id: sessionId, p_answers: answers,
  })
  return unwrap(data as SessionSummary, error)
}

export async function getResults(sessionId: string): Promise<SessionResults> {
  const { data, error } = await supabase.rpc('get_session_results', { p_session_id: sessionId })
  return unwrap(data as SessionResults, error)
}

// ---------- Admin ----------

export async function getDashboardStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_dashboard_stats')
  const stats = unwrap(data as AdminStats & { error?: string }, error)
  if ((stats as { error?: string }).error) throw new Error('Yetkisiz erişim')
  return stats
}

export async function listSessions(): Promise<AdminSessionRow[]> {
  const { data, error } = await supabase
    .from('exam_sessions').select('*').order('started_at', { ascending: false })
  return unwrap(data, error)
}

export async function listAdminQuestions(examId: string): Promise<AdminQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, exam_id, question_number, question_text, ' +
      'question_options(id, option_label, option_text, is_correct, sort_order)')
    .eq('exam_id', examId)
    .order('question_number')
  if (error) throw new Error(error.message)
  return (data ?? []).map((q) => {
    const row = q as unknown as AdminQuestion & { question_options: AdminQuestion['options'] }
    return { ...row, options: [...row.question_options].sort((a, b) => a.sort_order - b.sort_order) }
  })
}

export interface QuestionInput {
  examId: string
  questionNumber: number
  questionText: string
  options: { label: string; text: string; isCorrect: boolean }[]
}

export async function createQuestion(input: QuestionInput): Promise<void> {
  const { data: q, error: qErr } = await supabase
    .from('questions')
    .insert({ exam_id: input.examId, question_number: input.questionNumber, question_text: input.questionText })
    .select('id').single()
  if (qErr) throw new Error(qErr.message)
  const rows = input.options.map((o, i) => ({
    question_id: q!.id, option_label: o.label, option_text: o.text,
    is_correct: o.isCorrect, sort_order: i,
  }))
  const { error: oErr } = await supabase.from('question_options').insert(rows)
  if (oErr) throw new Error(oErr.message)
}

export async function updateQuestion(questionId: string, input: QuestionInput): Promise<void> {
  const { error: qErr } = await supabase
    .from('questions')
    .update({ question_number: input.questionNumber, question_text: input.questionText })
    .eq('id', questionId)
  if (qErr) throw new Error(qErr.message)
  // Replace options wholesale — simplest correct approach for edits.
  const { error: delErr } = await supabase.from('question_options').delete().eq('question_id', questionId)
  if (delErr) throw new Error(delErr.message)
  const rows = input.options.map((o, i) => ({
    question_id: questionId, option_label: o.label, option_text: o.text,
    is_correct: o.isCorrect, sort_order: i,
  }))
  const { error: oErr } = await supabase.from('question_options').insert(rows)
  if (oErr) throw new Error(oErr.message)
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (error) throw new Error(error.message)
}
