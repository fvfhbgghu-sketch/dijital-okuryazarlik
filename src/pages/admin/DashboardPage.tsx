import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, listExams, listSessions } from '../../lib/api'
import type { AdminSessionRow, AdminStats, Exam } from '../../lib/types'
import { cn, formatDateTime, formatDuration, scoreTone } from '../../lib/utils'
import { Spinner, ErrorState, EmptyState } from '../../components/ui/States'

type SortKey = 'started_at' | 'participant_name' | 'percentage' | 'score'
type StatusFilter = 'all' | 'submitted' | 'in_progress'
const PAGE_SIZE = 10

export function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [sessions, setSessions] = useState<AdminSessionRow[] | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [error, setError] = useState<string | null>(null)

  // table controls
  const [search, setSearch] = useState('')
  const [examId, setExamId] = useState<string>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('started_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)

  const load = () => {
    setError(null); setStats(null); setSessions(null)
    Promise.all([getDashboardStats(), listSessions(), listExams()])
      .then(([st, ss, ex]) => { setStats(st); setSessions(ss); setExams(ex) })
      .catch((e) => setError(e.message))
  }
  useEffect(load, [])

  const examName = useMemo(() => {
    const m = new Map(exams.map((e) => [e.id, e.title]))
    return (id: string) => m.get(id) ?? '—'
  }, [exams])

  const filtered = useMemo(() => {
    if (!sessions) return []
    let rows = sessions
    if (examId !== 'all') rows = rows.filter((r) => r.exam_id === examId)
    if (status !== 'all') rows = rows.filter((r) => r.status === status)
    if (search.trim()) {
      const q = search.trim().toLocaleLowerCase('tr')
      rows = rows.filter((r) =>
        r.participant_name.toLocaleLowerCase('tr').includes(q) ||
        (r.participant_email ?? '').toLocaleLowerCase('tr').includes(q))
    }
    const dir = sortAsc ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv, 'tr') * dir
      return ((av as number) - (bv as number)) * dir
    })
  }, [sessions, examId, status, search, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, examId, status, sortKey, sortAsc])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!stats || !sessions) return <Spinner label="Panel yükleniyor…" />

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Yönetici Paneli</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sınav istatistikleri ve oturumlar</p>
        </div>
        <Link to="/admin/questions" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Soru Yönetimi →
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon="📝" label="Toplam Deneme" value={stats.total_attempts} />
        <StatCard icon="📊" label="Ortalama" value={`%${Number(stats.avg_score).toFixed(1)}`} />
        <StatCard icon="🏆" label="En Yüksek" value={`%${Number(stats.highest_score).toFixed(0)}`} />
        <StatCard icon="📉" label="En Düşük" value={`%${Number(stats.lowest_score).toFixed(0)}`} />
        <StatCard icon="👥" label="Katılımcı" value={stats.unique_participants} />
      </div>

      {/* Controls */}
      <div className="card mt-6 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input max-w-xs flex-1"
            placeholder="🔍 İsim veya e-posta ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input max-w-[180px]" value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="all">Tüm sınavlar</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <select className="input max-w-[160px]" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="all">Tüm durumlar</option>
            <option value="submitted">Tamamlandı</option>
            <option value="in_progress">Devam ediyor</option>
          </select>
          <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">{filtered.length} kayıt</span>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState title="Kayıt bulunamadı" hint="Filtreleri değiştirmeyi deneyin." />
          ) : (
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
                  <Th onClick={() => toggleSort('participant_name')} active={sortKey === 'participant_name'} asc={sortAsc}>Katılımcı</Th>
                  <th className="px-3 py-2.5 font-semibold">Sınav</th>
                  <Th onClick={() => toggleSort('started_at')} active={sortKey === 'started_at'} asc={sortAsc}>Başlangıç</Th>
                  <th className="px-3 py-2.5 font-semibold">Süre</th>
                  <th className="px-3 py-2.5 font-semibold">D / Y</th>
                  <Th onClick={() => toggleSort('percentage')} active={sortKey === 'percentage'} asc={sortAsc}>Yüzde</Th>
                  <Th onClick={() => toggleSort('score')} active={sortKey === 'score'} asc={sortAsc}>Puan</Th>
                  <th className="px-3 py-2.5 font-semibold">Durum</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                    <td className="px-3 py-3">
                      <Link to={`/admin/sessions/${r.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                        {r.participant_name}
                      </Link>
                      <div className="text-xs text-slate-400">{r.participant_email ?? '—'}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{examName(r.exam_id)}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatDateTime(r.started_at)}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatDuration(r.started_at, r.finished_at)}</td>
                    <td className="px-3 py-3">
                      <span className="text-emerald-600 dark:text-emerald-400">{r.correct_count}</span>
                      {' / '}
                      <span className="text-rose-600 dark:text-rose-400">{r.wrong_count}</span>
                    </td>
                    <td className={cn('px-3 py-3 font-semibold', scoreTone(Number(r.percentage)))}>%{Number(r.percentage).toFixed(0)}</td>
                    <td className="px-3 py-3 font-semibold">{r.score}</td>
                    <td className="px-3 py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        r.status === 'submitted'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
                      )}>
                        {r.status === 'submitted' ? 'Tamamlandı' : 'Devam'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Sayfa {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">← Önceki</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700">Sonraki →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">{icon}</span>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

function Th({ children, onClick, active, asc }: {
  children: React.ReactNode; onClick: () => void; active: boolean; asc: boolean
}) {
  return (
    <th className="px-3 py-2.5 font-semibold">
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-brand-600">
        {children}
        <span className="text-[10px]">{active ? (asc ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  )
}
