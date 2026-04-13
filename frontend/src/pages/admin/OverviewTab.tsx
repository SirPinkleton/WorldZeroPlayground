import { useEffect, useState } from 'react'
import { getOverview } from '../../api/admin'
import type { OverviewStats } from '../../api/admin'
import { extractError } from '../../utils/errors'

export default function OverviewTab() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOverview()
      .then(setStats)
      .catch((err) => setError(extractError(err, "Couldn't load overview.")))
  }, [])

  if (error) return <p className="font-body text-sm text-red-600">{error}</p>
  if (!stats) return <div className="font-body text-muted text-sm">Loading...</div>

  const items = [
    { label: 'Accounts', value: stats.accounts },
    { label: 'Characters', value: stats.characters },
    { label: 'Active Tasks', value: stats.active_tasks },
    { label: 'Submissions', value: stats.submissions },
    { label: 'Votes', value: stats.votes },
    { label: 'Flagged', value: stats.flagged_submissions, highlight: stats.flagged_submissions > 0 },
    { label: 'Suspended', value: stats.suspended_accounts, highlight: stats.suspended_accounts > 0 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map(({ label, value, highlight }) => (
        <div
          key={label}
          className="card px-4 py-3 text-center"
          style={highlight ? { borderColor: 'rgba(220,38,38,0.4)' } : {}}
        >
          <p
            className="font-display text-3xl font-bold"
            style={highlight ? { color: '#dc2626' } : {}}
          >
            {value}
          </p>
          <p className="eyebrow mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}
