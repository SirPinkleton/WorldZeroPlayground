import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboard } from '../api/leaderboard'
import type { CharacterOut } from '../api/auth'

export default function Leaderboard() {
  const [characters, setCharacters] = useState<CharacterOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard({ limit: 50 }).then(setCharacters).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page max-w-2xl">
      <h1 className="page-heading">Leaderboard</h1>

      {loading ? (
        <p className="font-body text-muted">Loading...</p>
      ) : characters.length === 0 ? (
        <p className="font-body text-muted">No players yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {characters.map((c, i) => (
            <div key={c.id} className="card px-4 py-3 flex items-center gap-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sketch-lg">
              <span className="font-display text-2xl font-bold text-muted w-8 shrink-0 text-right">
                {i + 1}
              </span>
              <Link to={`/characters/${c.id}`} className="flex-1 font-body text-sm font-bold hover:underline">
                {c.display_name}
                <span className="text-muted font-normal ml-1">@{c.username}</span>
              </Link>
              <span className="font-body text-xs text-muted">lvl {c.level}</span>
              <span className="font-display text-lg font-bold text-ink">{c.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
