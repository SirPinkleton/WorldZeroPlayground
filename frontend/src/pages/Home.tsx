import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { listPraxes, type PraxisOut } from '../api/praxis'
import { loginWithGoogle, devLogin } from '../api/auth'
import PraxisCard from '../components/PraxisCard'
import PageTitle from '../components/ui/PageTitle'

export default function Home() {
  const { user, refetch } = useAuth()
  const [searchParams] = useSearchParams()
  const loginRequired = searchParams.get('login') === 'required'
  const [feed, setFeed] = useState<PraxisOut[]>([])

  useEffect(() => {
    if (user) {
      listPraxes().then(setFeed).catch(() => setFeed([]))
    }
  }, [user])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        {loginRequired && (
          <p className="font-body text-sm text-muted mb-6 border-2 border-border px-4 py-2 inline-block">
            You need to log in to access that page.
          </p>
        )}
        <h1 className="font-display text-5xl font-bold mb-4">World Zero</h1>
        <p className="font-body text-muted text-lg mb-8 leading-relaxed">
          A community game. Complete real-world tasks. Post proof. Earn points.
          <br />Inspired by the original SF0.
        </p>
        <button onClick={loginWithGoogle} className="btn-primary text-base px-8 py-2">
          Login with Google
        </button>
        {import.meta.env.DEV && (
          <button
            onClick={async () => { await devLogin(); await refetch() }}
            className="btn-outline text-xs px-4 py-1 mt-4"
          >
            dev login (no OAuth)
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="py-8">
      <PageTitle title="Recent Praxis" eyebrow={`${feed.length} praxes`} />
      {feed.length === 0 ? (
        <p className="font-body text-muted">No praxes yet. Be the first!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {feed.map((s) => <PraxisCard key={s.id} praxis={s} />)}
        </div>
      )}
    </div>
  )
}
