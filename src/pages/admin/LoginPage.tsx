import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../context/ToastContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const { notify } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await signIn(email.trim(), password)
      // Verify admin role server-side before letting them in.
      const { data: isAdmin } = await supabase.rpc('is_admin')
      if (!isAdmin) {
        await supabase.auth.signOut()
        throw new Error('Bu hesabın yönetici yetkisi yok.')
      }
      notify('Giriş başarılı.', 'success')
      nav('/admin', { replace: true })
    } catch (err) {
      notify((err as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <div className="card p-7">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-2xl text-white">🔐</div>
          <h1 className="text-xl font-bold">Yönetici Girişi</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Supabase hesabınızla giriş yapın.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">E-posta</label>
            <input id="email" type="email" required className="input" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="admin@kurum.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Parola</label>
            <input id="password" type="password" required className="input" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={busy}>Giriş Yap</Button>
        </form>
      </div>
    </div>
  )
}
