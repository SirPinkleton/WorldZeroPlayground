import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSubmission, flagSubmission, type SubmissionOut } from '../api/submissions'
import { getVotes, type VoteSummary } from '../api/votes'
import MediaGallery from '../components/MediaGallery'
import StarRating from '../components/StarRating'
import { useAuth } from '../auth/AuthContext'

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [submission, setSubmission] = useState<SubmissionOut | null>(null)
  const [votes, setVotes] = useState<VoteSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [flagging, setFlagging] = useState(false)

  useEffect(() => {
    if (!id) return
    const sid = parseInt(id, 10)
    Promise.all([getSubmission(sid), getVotes(sid)])
      .then(([s, v]) => { setSubmission(s); setVotes(v) })
      .finally(() => setLoading(false))
  }, [id])

  const handleFlag = async () => {
    if (!submission) return
    const reason = window.prompt('Reason for flagging:')
    if (!reason) return
    setFlagging(true)
    try {
      const updated = await flagSubmission(submission.id, reason)
      setSubmission(updated)
    } catch {
      alert('Could not flag — requires level 4+.')
    } finally {
      setFlagging(false)
    }
  }

  if (loading) return <div className="page font-body text-muted">Loading...</div>
  if (!submission) return <div className="page font-body text-muted">Not found.</div>

  const canFlag = (user?.character?.level ?? 0) >= 4 && user?.character?.id !== submission.character_id

  return (
    <div className="page max-w-2xl">
      <Link to={`/tasks/${submission.task_id}`} className="font-body text-xs text-muted hover:underline">
        ← back to task
      </Link>

      <div className="card p-5 my-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-bold leading-tight">{submission.title}</h1>
          <Link to={`/characters/${submission.character_id}`} className="font-body text-xs text-muted shrink-0 hover:underline">
            by #{submission.character_id}
          </Link>
        </div>

        {submission.body_text && (
          <p className="font-body text-base text-ink mt-4 leading-relaxed whitespace-pre-wrap">
            {submission.body_text}
          </p>
        )}

        {submission.media.length > 0 && (
          <div className="mt-5">
            <MediaGallery media={submission.media} />
          </div>
        )}
      </div>

      {/* Voting */}
      <div className="card p-4 my-4">
        <h2 className="font-display text-xl font-bold mb-3">Rate this Praxis</h2>
        <StarRating
          submissionId={submission.id}
          averageStars={votes?.average_stars}
          totalVotes={votes?.total_votes}
        />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 font-body text-xs text-muted mt-2">
        <span>Submitted {new Date(submission.created_at).toLocaleDateString()}</span>
        {submission.is_flagged && (
          <span className="border border-red-400 text-red-600 px-2 py-0.5">flagged</span>
        )}
        {canFlag && !submission.is_flagged && (
          <button onClick={handleFlag} disabled={flagging} className="hover:underline text-muted">
            flag this
          </button>
        )}
      </div>
    </div>
  )
}
