import { useEffect, useState } from 'react'
import { getActivityFeed, type ActivityFeedItem } from '../api/activityFeed'
import { useAuth } from '../auth/AuthContext'

/**
 * Hook to fetch pending collab invites and duel challenges.
 * Re-fetches when the authenticated user changes.
 */
export function usePendingRequests() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<ActivityFeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPendingRequests([])
      setLoading(false)
      return
    }
    setLoading(true)
    getActivityFeed({ filter: 'requests', limit: 5 })
      .then((response) => setPendingRequests(response.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  return { pendingRequests, loading } as const
}
