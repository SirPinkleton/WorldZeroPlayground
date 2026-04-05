import { useEffect, useState } from 'react'
import { listSubmissions } from '../api/submissions'
import type { SubmissionOut } from '../api/submissions'
import SubmissionCard from '../components/SubmissionCard'

export default function Submissions() {
  const [submissions, setSubmissions] = useState<SubmissionOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listSubmissions().then(setSubmissions).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <h1 className="page-heading">Praxis</h1>
      <p className="font-body text-sm text-muted mb-6">
        Proof of action. All submissions from across World Zero.
      </p>

      {loading ? (
        <p className="font-body text-muted">Loading praxis...</p>
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
