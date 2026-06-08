import type { ReactNode } from 'react'
import { Button } from './Button'

/** Full-area centered spinner. */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-400">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center animate-fade-in">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-2xl text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
        ✕
      </div>
      <h3 className="text-lg font-semibold">Bir şeyler ters gitti</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onRetry}>Tekrar dene</Button>
        </div>
      )}
    </div>
  )
}

export function EmptyState({ icon = '📭', title, hint, action }: {
  icon?: string; title: string; hint?: string; action?: ReactNode
}) {
  return (
    <div className="py-16 text-center animate-fade-in">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-3xl dark:bg-slate-800">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
