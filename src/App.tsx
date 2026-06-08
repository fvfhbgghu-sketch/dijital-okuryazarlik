import { Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { isSupabaseConfigured } from './lib/supabase'
import { HomePage } from './pages/HomePage'
import { ExamPage } from './pages/ExamPage'
import { ResultsPage } from './pages/ResultsPage'
import { LoginPage } from './pages/admin/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { SessionDetailsPage } from './pages/admin/SessionDetailsPage'
import { QuestionsPage } from './pages/admin/QuestionsPage'
import { NotFoundPage } from './pages/NotFoundPage'

function ConfigWarning() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="card p-8">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-2xl dark:bg-amber-950/60">⚙️</div>
        <h1 className="text-xl font-bold">Supabase yapılandırması eksik</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          <code>.env.example</code> dosyasını <code>.env</code> olarak kopyalayın ve
          {' '}<code>VITE_SUPABASE_URL</code> ile <code>VITE_SUPABASE_ANON_KEY</code> değerlerini girin,
          ardından sunucuyu yeniden başlatın.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!isSupabaseConfigured ? (
          <ConfigWarning />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/exam/:slug" element={<ExamPage />} />
            <Route path="/results/:sessionId" element={<ResultsPage />} />

            <Route path="/loginadmin" element={<LoginPage />} />
            {/* Backwards-compatible alias */}
            <Route path="/admin/login" element={<Navigate to="/loginadmin" replace />} />
            <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin/sessions/:sessionId" element={<ProtectedRoute><SessionDetailsPage /></ProtectedRoute>} />
            <Route path="/admin/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        )}
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        Dijital Okuryazarlık Sınav Platformu
      </footer>
    </div>
  )
}
