import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getResults } from '../lib/api'
import type { ResultQuestion, SessionResults } from '../lib/types'
import { cn, scoreTone } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Spinner, ErrorState } from '../components/ui/States'

export function ResultsPage() {
  const { sessionId = '' } = useParams()
  const [data, setData] = useState<SessionResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const load = () => {
    setError(null); setData(null)
    getResults(sessionId).then(setData).catch((e) => setError(e.message))
  }
  useEffect(load, [sessionId])

  const visible = useMemo<ResultQuestion[]>(() => {
    if (!data) return []
    return showAll ? data.questions : data.questions.filter((q) => !q.is_correct)
  }, [data, showAll])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <Spinner label="Sonuçlar hesaplanıyor…" />

  const s = data.session
  const pct = Number(s.percentage)

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      {/* Score summary */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white">
          <p className="text-sm font-medium opacity-90">{s.participant_name} · Sonuç</p>
          <div className="mt-3 text-6xl font-extrabold">%{pct.toFixed(0)}</div>
          <p className="mt-2 text-sm opacity-90">
            {s.correct_count} / {s.total_questions} doğru
          </p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4 sm:divide-y-0 dark:divide-slate-800">
          <Metric label="Toplam Soru" value={s.total_questions} />
          <Metric label="Doğru" value={s.correct_count} tone="text-emerald-600 dark:text-emerald-400" />
          <Metric label="Yanlış / Boş" value={s.wrong_count} tone="text-rose-600 dark:text-rose-400" />
          <Metric label="Puan" value={s.score} tone={scoreTone(pct)} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant={showAll ? 'secondary' : 'primary'} onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Sadece Yanlışları Göster' : 'Tüm Soruları İncele'}
        </Button>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          Sınavı Tekrar Çöz
        </Link>
      </div>

      {/* Review list */}
      <div className="mt-6 space-y-4">
        {visible.length === 0 && (
          <div className="card p-8 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl dark:bg-emerald-950/60">🎉</div>
            <h3 className="text-lg font-semibold">Tebrikler! Yanlış cevabınız yok.</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tüm soruları görmek için “Tüm Soruları İncele”ye basın.</p>
          </div>
        )}

        {visible.map((q) => (
          <ReviewCard key={q.question_id} q={q} />
        ))}
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="p-4 text-center">
      <p className={cn('text-2xl font-bold', tone)}>{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

function ReviewCard({ q }: { q: ResultQuestion }) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="whitespace-pre-line font-medium leading-relaxed">
          <span className="mr-2 text-slate-400">{q.question_number}.</span>{q.question_text}
        </h3>
        <span className={cn(
          'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold',
          q.is_correct
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        )}>
          {q.is_correct ? 'Doğru' : 'Yanlış'}
        </span>
      </div>
      <ul className="space-y-2">
        {q.options.map((o) => {
          const isSelected = q.selected_option_id === o.id
          const correct = o.is_correct
          return (
            <li
              key={o.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm',
                correct && 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
                isSelected && !correct && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                !correct && !isSelected && 'border-slate-200 dark:border-slate-700',
              )}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                {o.label}
              </span>
              <span className="flex-1">{o.text}</span>
              {correct && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ Doğru cevap</span>}
              {isSelected && !correct && <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">✗ Sizin cevabınız</span>}
            </li>
          )
        })}
      </ul>
      {!q.selected_option_id && (
        <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">Bu soruyu boş bıraktınız.</p>
      )}
    </div>
  )
}
