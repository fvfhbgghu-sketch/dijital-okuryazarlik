import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  getExam, getExamQuestions, getSessionState, saveAnswer, startSession, submitExam,
} from '../lib/api'
import type { AnswerMap, Exam, QuestionPublic } from '../lib/types'
import { clearSession, cn, recallSession, rememberSession } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Spinner, ErrorState } from '../components/ui/States'
import { ProgressBar, QuestionNavigator, StatPills } from '../components/exam/ExamWidgets'
import { useToast } from '../context/ToastContext'

type Phase = 'loading' | 'intro' | 'active' | 'error'

export function ExamPage() {
  const { slug = '' } = useParams()
  const nav = useNavigate()
  const { notify } = useToast()

  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState<string | null>(null)
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<QuestionPublic[]>([])
  const [resumeId, setResumeId] = useState<string | null>(null)

  // intro form
  const [name, setName] = useState('')
  const [starting, setStarting] = useState(false)

  // active exam state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [current, setCurrent] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ---- initial load -------------------------------------------------------
  useEffect(() => {
    let active = true
    setPhase('loading'); setError(null)
    ;(async () => {
      try {
        const ex = await getExam(slug)
        const qs = await getExamQuestions(ex.id)
        if (!active) return
        setExam(ex); setQuestions(qs)
        const prev = recallSession(ex.id)
        if (prev) {
          const state = await getSessionState(prev)
          if (state.session && state.session.status === 'in_progress') {
            setResumeId(prev)
          } else {
            clearSession()
          }
        }
        setPhase('intro')
      } catch (e) {
        if (active) { setError((e as Error).message); setPhase('error') }
      }
    })()
    return () => { active = false }
  }, [slug])

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id]).length, [questions, answers],
  )

  function hydrate(sid: string, restored: AnswerMap) {
    setSessionId(sid)
    setAnswers(restored)
    setCurrent(0)
    setPhase('active')
  }

  async function handleStart() {
    if (!exam) return
    if (name.trim().length < 2) { notify('Lütfen adınızı girin.', 'error'); return }
    setStarting(true)
    try {
      const sid = await startSession(exam.id, name.trim(), null)
      rememberSession(exam.id, sid)
      hydrate(sid, {})
      notify('Sınav başladı. Başarılar!', 'success')
    } catch (e) {
      notify((e as Error).message, 'error')
    } finally {
      setStarting(false)
    }
  }

  async function handleResume() {
    if (!resumeId) return
    try {
      const state = await getSessionState(resumeId)
      const restored: AnswerMap = {}
      for (const a of state.answers) restored[a.question_id] = a.selected_option_id
      hydrate(resumeId, restored)
      notify('Önceki oturum geri yüklendi.', 'info')
    } catch (e) {
      notify((e as Error).message, 'error')
    }
  }

  function handleDiscardResume() { clearSession(); setResumeId(null) }

  async function pick(questionId: string, optionId: string) {
    if (!sessionId) return
    const next = answers[questionId] === optionId ? null : optionId // toggle off allowed
    setAnswers((a) => ({ ...a, [questionId]: next }))
    try {
      await saveAnswer(sessionId, questionId, next)
    } catch (e) {
      notify('Cevap kaydedilemedi: ' + (e as Error).message, 'error')
    }
  }

  async function handleSubmit() {
    if (!sessionId) return
    setSubmitting(true)
    try {
      const payload = questions.map((q) => ({ question_id: q.id, option_id: answers[q.id] ?? null }))
      await submitExam(sessionId, payload)
      clearSession()
      nav(`/results/${sessionId}`)
    } catch (e) {
      notify((e as Error).message, 'error')
      setSubmitting(false)
    }
  }

  if (phase === 'loading') return <Spinner label="Sınav hazırlanıyor…" />
  if (phase === 'error') return <ErrorState message={error ?? 'Sınav bulunamadı'} onRetry={() => nav(0)} />

  // ---- Intro --------------------------------------------------------------
  if (phase === 'intro' && exam) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <Link to="/" className="text-sm text-brand-600 hover:underline dark:text-brand-400">← Sınavlar</Link>
        <div className="card mt-3 p-7">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          {exam.description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{exam.description}</p>}
          <div className="mt-4 flex gap-3 text-sm">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold dark:bg-slate-800">{exam.question_count} soru</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold dark:bg-slate-800">Çoktan seçmeli</span>
          </div>

          {resumeId && (
            <div className="mt-6 rounded-xl border border-brand-300 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/40">
              <p className="text-sm font-medium text-brand-800 dark:text-brand-200">
                Tamamlanmamış bir oturumunuz var. Kaldığınız yerden devam edebilirsiniz.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={handleResume}>Devam Et</Button>
                <Button size="sm" variant="ghost" onClick={handleDiscardResume}>Yeni Başlat</Button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Ad Soyad <span className="text-rose-500">*</span></label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Adınız Soyadınız" autoComplete="name"
                onKeyDown={(e) => { if (e.key === 'Enter') handleStart() }} />
            </div>
            <Button size="lg" className="w-full" loading={starting} onClick={handleStart}>
              Sınava Başla
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Active exam --------------------------------------------------------
  const q = questions[current]
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div className="order-2 lg:order-1">
        <div className="card p-6 sm:p-7 animate-fade-in" key={q.id}>
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
              Soru {q.question_number} / {questions.length}
            </span>
            {answers[q.id] && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✓ Kaydedildi</span>}
          </div>

          <p className="whitespace-pre-line text-lg font-medium leading-relaxed">{q.question_text}</p>

          <div className="mt-6 space-y-3">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => pick(q.id, opt.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                    selected
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/30 dark:bg-brand-950/40'
                      : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
                  )}
                >
                  <span className={cn(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold',
                    selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                  )}>
                    {opt.option_label}
                  </span>
                  <span className="pt-0.5 text-sm sm:text-base">{opt.option_text}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              ← Önceki
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => c + 1)}>Sonraki →</Button>
            ) : (
              <Button variant="success" onClick={() => setConfirmOpen(true)}>Sınavı Bitir ✓</Button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="order-1 space-y-5 lg:order-2">
        <div className="card p-5">
          <ProgressBar value={answeredCount} total={questions.length} />
          <div className="mt-4"><StatPills answered={answeredCount} total={questions.length} /></div>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold">Soru Haritası</h3>
          <QuestionNavigator questions={questions} answers={answers} current={current} onJump={setCurrent} />
          <Button variant="success" className="mt-5 w-full" onClick={() => setConfirmOpen(true)}>
            Sınavı Bitir
          </Button>
        </div>
      </aside>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Sınavı bitirmek istiyor musunuz?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Vazgeç</Button>
            <Button variant="success" loading={submitting} onClick={handleSubmit}>Evet, Bitir</Button>
          </>
        }
      >
        <p>
          {questions.length} sorudan <b>{answeredCount}</b> tanesini cevapladınız.
          {answeredCount < questions.length && (
            <> <b className="text-amber-600 dark:text-amber-400">{questions.length - answeredCount}</b> soru boş kalacak.</>
          )}
          {' '}Gönderdikten sonra cevaplarınızı değiştiremezsiniz.
        </p>
      </Modal>
    </div>
  )
}
