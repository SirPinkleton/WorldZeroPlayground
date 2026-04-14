import { useEffect, useState } from 'react'
import { getVotesReceived } from '../api/characters'

/**
 * Hook to fetch votes-received count for a character.
 * Re-fetches when characterId changes.
 */
export function useMyCharacterStats(characterId: number | undefined) {
  const [votesReceived, setVotesReceived] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (characterId === undefined) {
      setVotesReceived(0)
      setLoading(false)
      return
    }
    setLoading(true)
    getVotesReceived(characterId)
      .then((data) => setVotesReceived(data.votes_received))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [characterId])

  return { votesReceived, loading } as const
}
