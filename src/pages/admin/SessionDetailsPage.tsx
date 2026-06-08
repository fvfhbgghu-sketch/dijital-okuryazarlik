import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getResults } from '../../lib/api'
import type { SessionResults } from '../../lib/types'
import { cn, formatDateTime, formatSeconds, scoreTone } from '../../lib/utils'
import { Spinner, ErrorState } from '../../components/ui/States'

export function SessionDetailsPage() {
  const { sessionId = '' } = useParams()
  const [data, setData] = useState<SessionResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null); setData(null)
    getResults(sessionId).then(setData).catch((e) => setError(e.message))
  }
  useEffect(load, [sessionId])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <Spinner label="Oturum yükleniyor…" />

  const s = data.session
  return (
    <div className="animate-fade-in">
      <Link to="/admin" className="text-sm text-brand-600 hover:underline dark:text-brand-400">← Panele dön</Link>

      <div className="card mt-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{s.participant_name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.participant_email ?? 'E-posta yok'}</p>
            <p className="mt-1 text-xs text-slate-400">Oturum: {s.id}</p>
          </div>
          <div className={cn('text-right')}>
            <p className={cn('text-4xl font-extrabold', scoreTone(Number(s.percentage)))}>%{Number(s.percentage).toFixed(0)}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.correct_count}/{s.total_questions} doğru</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Info label="Başlangıç" value={formatDateTime(s.started_at)} />
          <Info label="Bitiş" value={formatDateTime(s.finished_at)} />
          <Info label="Süre" value={formatSeconds(s.duration_seconds)} />
          <Info label="Durum" value={s.status === 'submitted' ? 'Tamamlandı' : 'Devam ediyor'} />
        </div>
      </div>

      <h2 className="mb-3 mt-6 text-lg font-bold">Cevap Dökümü</h2>
      <div className="space-y-4">
        {data.questions.map((q) => (
          <div key={q.question_id} className="card p-5">
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
                {q.is_correct ? 'Doğru' : (q.selected_option_id ? 'Yanlış' : 'Boş')}
              </span>
            </div>
            <ul className="space-y-2">
              {q.options.map((o) => {
                const isSelected = q.selected_option_id === o.id
                return (
                  <li key={o.id} className={cn(
                    'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm',
                    o.is_correct && 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
                    isSelected && !o.is_correct && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    !o.is_correct && !isSelected && 'border-slate-200 dark:border-slate-700',
                  )}>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">{o.label}</span>
                    <span className="flex-1">{o.text}</span>
                    {o.is_correct && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Doğru cevap</span>}
                    {isSelected && !o.is_correct && <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Katılımcının cevabı</span>}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  )
}
