import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui/States'

/** Gate admin routes: must be authenticated AND present in admin_users. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAuth()
  const loc = useLocation()

  if (loading) return <Spinner label="Yetki doğrulanıyor…" />
  if (!session || !isAdmin) {
    return <Navigate to="/loginadmin" replace state={{ from: loc.pathname }} />
  }
  return <>{children}</>
}
