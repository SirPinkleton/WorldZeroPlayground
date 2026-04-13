import { useEffect, useState } from 'react'
import { listSubmissions } from '../api/submissions'
import type { SubmissionOut } from '../api/submissions'
import SubmissionCard from '../components/SubmissionCard'
import PageTitle from '../components/ui/PageTitle'
import { extractError } from '../utils/errors'

export default function Submissions() {
  const [submissions, setSubmissions] = useState<SubmissionOut[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    listSubmissions()
      .then(setSubmissions)
      .catch((err) => setFetchError(extractError(err, "Couldn't load submissions.")))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="py-8">
      <PageTitle title="Praxis" />
      <p className="font-body text-sm text-muted mb-6">
        Proof of action. All submissions from across World Zero.
      </p>

      {loading ? (
        <p className="font-body text-muted">Loading praxis...</p>
      ) : fetchError ? (
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
          {fetchError}{' '}
          <button onClick={() => window.location.reload()} className="underline">Try refreshing.</button>
        </p>
      ) : submissions.length === 0 ? (
        <p className="font-body text-muted">No submissions yet. Be the first.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {submissions.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  )
}
