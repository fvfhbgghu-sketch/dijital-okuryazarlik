/** Tailwind className combiner (filters falsy values). */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/** Format an ISO timestamp for display (tr-TR). */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/** Human-readable duration between two ISO timestamps. */
export function formatDuration(startIso: string | null, endIso: string | null): string {
  if (!startIso || !endIso) return '—'
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (Number.isNaN(ms) || ms < 0) return '—'
  return formatSeconds(Math.floor(ms / 1000))
}

export function formatSeconds(totalSeconds: number | null): string {
  if (totalSeconds == null || Number.isNaN(totalSeconds)) return '—'
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}sa ${m % 60}dk`
  }
  return `${m}dk ${s}sn`
}

/** Color band for a percentage score. */
export function scoreTone(pct: number): string {
  if (pct >= 85) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

const SESSION_KEY = 'exam:lastSession'

/** Remember the last in-progress session per exam so a refresh can resume. */
export function rememberSession(examId: string, sessionId: string): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ examId, sessionId }))
  } catch { /* ignore */ }
}
export function recallSession(examId: string): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { examId: string; sessionId: string }
    return parsed.examId === examId ? parsed.sessionId : null
  } catch {
    return null
  }
}
export function clearSession(): void {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
}
