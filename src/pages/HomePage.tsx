import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listExams } from '../lib/api'
import type { Exam } from '../lib/types'
import { Spinner, ErrorState, EmptyState } from '../components/ui/States'

export function HomePage() {
  const [exams, setExams] = useState<Exam[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null); setExams(null)
    listExams().then(setExams).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  return (
    <div className="animate-fade-in">
      <section className="mb-10 text-center">
        <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
          Çevrimiçi Sınav
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Dijital Okuryazarlık Sınavına Hoş Geldiniz
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
          Aşağıdaki sınavlardan birini seçin. Sorular tek tek gösterilir, cevaplarınız
          otomatik kaydedilir ve dilediğiniz zaman geri dönüp değiştirebilirsiniz.
        </p>
      </section>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && exams === null && <Spinner label="Sınavlar yükleniyor…" />}
      {!error && exams?.length === 0 && (
        <EmptyState title="Henüz sınav yok" hint="Yönetici panelinden sınav ve soru ekleyebilirsiniz." />
      )}

      {exams && exams.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {exams.map((exam, i) => (
            <div key={exam.id} className="card flex flex-col p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-xl text-white">
                  {i === 0 ? '📘' : '📗'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {exam.question_count} soru
                </span>
              </div>
              <h2 className="text-lg font-bold">{exam.title}</h2>
              {exam.description && (
                <p className="mt-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{exam.description}</p>
              )}
              <Link
                to={`/exam/${exam.slug}`}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
              >
                Sınava Başla →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
