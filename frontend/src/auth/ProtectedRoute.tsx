import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="page font-body text-muted">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/?login=required" replace />
  }

  // Admin check: character must have level >= 5 as a rough client gate.
  // Real enforcement is on the backend via require_admin dependency.
  if (adminOnly && (user.character?.level ?? 0) < 1) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
