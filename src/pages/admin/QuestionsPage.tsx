import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteQuestion, listAdminQuestions, listExams } from '../../lib/api'
import type { AdminQuestion, Exam } from '../../lib/types'
import { Spinner, ErrorState, EmptyState } from '../../components/ui/States'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { QuestionForm } from '../../components/admin/QuestionForm'
import { useToast } from '../../context/ToastContext'

export function QuestionsPage() {
  const { notify } = useToast()
  const [exams, setExams] = useState<Exam[]>([])
  const [examId, setExamId] = useState<string>('')
  const [questions, setQuestions] = useState<AdminQuestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminQuestion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminQuestion | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    listExams().then((ex) => {
      setExams(ex)
      if (ex.length) setExamId((cur) => cur || ex[0].id)
    }).catch((e) => setError(e.message))
  }, [])

  const loadQuestions = () => {
    if (!examId) return
    setError(null); setQuestions(null)
    listAdminQuestions(examId).then(setQuestions).catch((e) => setError(e.message))
  }
  useEffect(loadQuestions, [examId])

  const filtered = useMemo(() => {
    if (!questions) return []
    const q = search.trim().toLocaleLowerCase('tr')
    if (!q) return questions
    return questions.filter((x) => x.question_text.toLocaleLowerCase('tr').includes(q))
  }, [questions, search])

  const nextNumber = (questions?.reduce((m, q) => Math.max(m, q.question_number), 0) ?? 0) + 1

  function openNew() { setEditing(null); setFormOpen(true) }
  function openEdit(q: AdminQuestion) { setEditing(q); setFormOpen(true) }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteQuestion(deleteTarget.id)
      notify('Soru silindi.', 'success')
      setDeleteTarget(null)
      loadQuestions()
    } catch (e) {
      notify((e as Error).message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="text-sm text-brand-600 hover:underline dark:text-brand-400">← Panel</Link>
          <h1 className="text-2xl font-bold">Soru Yönetimi</h1>
        </div>
        <Button onClick={openNew} disabled={!examId}>+ Yeni Soru</Button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select className="input max-w-xs" value={examId} onChange={(e) => setExamId(e.target.value)}>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.title} ({e.question_count})</option>)}
          </select>
          <input className="input max-w-xs flex-1" placeholder="🔍 Soru ara…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
          {questions && <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">{filtered.length} soru</span>}
        </div>
      </div>

      <div className="mt-5">
        {error && <ErrorState message={error} onRetry={loadQuestions} />}
        {!error && questions === null && <Spinner label="Sorular yükleniyor…" />}
        {!error && questions && filtered.length === 0 && (
          <EmptyState title="Soru yok" hint="Bu sınava ilk soruyu ekleyin."
            action={<Button onClick={openNew}>+ Yeni Soru</Button>} />
        )}

        <div className="space-y-3">
          {filtered.map((q) => (
            <div key={q.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line font-medium leading-relaxed">
                    <span className="mr-2 text-slate-400">{q.question_number}.</span>{q.question_text}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.options.map((o) => (
                      <span key={o.id} className={
                        'rounded-lg px-2.5 py-1 text-xs ' +
                        (o.is_correct
                          ? 'bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')
                      }>
                        {o.option_label}) {o.option_text}{o.is_correct ? ' ✓' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(q)}>Düzenle</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(q)}>Sil</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {formOpen && examId && (
        <QuestionForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={loadQuestions}
          examId={examId}
          nextNumber={nextNumber}
          editing={editing}
        />
      )}

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Soruyu sil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Vazgeç</Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>Sil</Button>
          </>
        }
      >
        <p><b>{deleteTarget?.question_number}.</b> soruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
      </Modal>
    </div>
  )
}
