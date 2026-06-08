import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

export function Navbar() {
  const { isAdmin, signOut } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()
  const onAdmin = loc.pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">✓</span>
          <div className="leading-tight">
            <p className="text-sm font-bold sm:text-base">Dijital Okuryazarlık</p>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Sınav Platformu</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {/* Admin links appear only inside the admin area once authenticated.
              There is no public "Yönetici" button — admins reach login via /loginadmin. */}
          {onAdmin && isAdmin && (
            <>
              <Link to="/admin" className="hidden rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 sm:block">Panel</Link>
              <Link to="/admin/questions" className="hidden rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 sm:block">Sorular</Link>
              <Button size="sm" variant="ghost" onClick={async () => { await signOut(); nav('/loginadmin') }}>Çıkış</Button>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
