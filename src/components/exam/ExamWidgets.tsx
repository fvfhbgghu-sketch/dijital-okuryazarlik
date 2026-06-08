import { cn } from '../../lib/utils'
import type { AnswerMap, QuestionPublic } from '../../lib/types'

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>İlerleme</span>
        <span>%{pct}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function StatPills({ answered, total }: { answered: number; total: number }) {
  const remaining = total - answered
  return (
    <div className="grid grid-cols-3 gap-3">
      <Pill label="Toplam" value={total} tone="slate" />
      <Pill label="Cevaplanan" value={answered} tone="emerald" />
      <Pill label="Kalan" value={remaining} tone="amber" />
    </div>
  )
}

function Pill({ label, value, tone }: { label: string; value: number; tone: 'slate' | 'emerald' | 'amber' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  }
  return (
    <div className={cn('rounded-xl px-3 py-2 text-center', tones[tone])}>
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide">{label}</p>
    </div>
  )
}

export function QuestionNavigator({
  questions, answers, current, onJump,
}: {
  questions: QuestionPublic[]
  answers: AnswerMap
  current: number
  onJump: (index: number) => void
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-emerald-500" /> Cevaplı</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-brand-600" /> Geçerli</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-slate-300 dark:bg-slate-700" /> Boş</span>
      </div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6">
        {questions.map((q, i) => {
          const answered = Boolean(answers[q.id])
          const isCurrent = i === current
          return (
            <button
              key={q.id}
              onClick={() => onJump(i)}
              aria-label={`Soru ${q.question_number}`}
              aria-current={isCurrent}
              className={cn(
                'grid h-10 place-items-center rounded-lg text-sm font-semibold transition-all',
                isCurrent
                  ? 'bg-brand-600 text-white ring-2 ring-brand-300 dark:ring-brand-700'
                  : answered
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              )}
            >
              {q.question_number}
            </button>
          )
        })}
      </div>
    </div>
  )
}
