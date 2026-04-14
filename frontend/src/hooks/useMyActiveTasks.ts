import { useCallback, useEffect, useState } from 'react'
import { getMyTasks, type CharacterTaskOut } from '../api/tasks'
import { useAuth } from '../auth/AuthContext'

/**
 * Hook to fetch the current character's in-progress task signups.
 * Re-fetches when the authenticated user changes.
 */
export function useMyActiveTasks() {
  const { user } = useAuth()
  const [activeTasks, setActiveTasks] = useState<CharacterTaskOut[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    if (!user) {
      setActiveTasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    getMyTasks('in_progress')
      .then(setActiveTasks)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { activeTasks, loading, refetch } as const
}
