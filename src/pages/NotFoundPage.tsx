import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="py-24 text-center animate-fade-in">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-3 text-xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Ana sayfaya dön
      </Link>
    </div>
  )
}
