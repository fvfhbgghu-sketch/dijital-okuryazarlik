import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from '../lib/utils'

type ToastKind = 'success' | 'error' | 'info'
interface Toast { id: number; kind: ToastKind; message: string }
interface ToastCtx { notify: (message: string, kind?: ToastKind) => void }

const Ctx = createContext<ToastCtx | undefined>(undefined)
let counter = 0

const ICONS: Record<ToastKind, string> = { success: '✓', error: '✕', info: 'ℹ' }
const TONES: Record<ToastKind, string> = {
  success: 'border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
  error: 'border-rose-500/30 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200',
  info: 'border-brand-500/30 bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-200',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++counter
    setToasts((t) => [...t, { id, kind, message }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg animate-slide-in',
              TONES[t.kind],
            )}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/60 text-xs dark:bg-black/30">
              {ICONS[t.kind]}
            </span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
