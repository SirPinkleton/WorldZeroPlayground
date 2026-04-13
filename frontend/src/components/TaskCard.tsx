import { Link } from 'react-router-dom'
import type { TaskOut } from '../api/tasks'

const FACTION_STYLES: Record<string, { stripe: string; dot: string; label: string }> = {
  ua:          { stripe: 'bg-ua',          dot: 'bg-ua',          label: 'University of Aesthematics' },
  journeymen:  { stripe: 'bg-journeymen',  dot: 'bg-journeymen',  label: 'Journeymen' },
  gestalt:     { stripe: 'bg-gestalt',     dot: 'bg-gestalt',     label: 'Gestalt' },
  geo:         { stripe: 'bg-geo',         dot: 'bg-geo',         label: 'Geoanalogue' },
  snide:       { stripe: 'bg-snide',       dot: 'bg-snide',       label: 'S.N.I.D.E.' },
  cm:          { stripe: 'bg-cm',          dot: 'bg-cm',          label: 'Creative Masters' },
}

const DEFAULT_STYLE = { stripe: 'bg-muted', dot: 'bg-muted', label: 'Unaffiliated' }

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCard({ task, onSignup }: Props) {
  const faction = FACTION_STYLES[task.primary_faction_slug ?? ''] ?? DEFAULT_STYLE

  return (
    <div className="card relative overflow-hidden flex flex-col transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5">
      {/* Faction color stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${faction.stripe}`} />

      <div className="pl-4 pr-4 pt-3 pb-3 flex flex-col gap-2 flex-1">
        {/* Faction + points */}
        <div className="flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${faction.dot}`} />
          <span className="font-body text-[0.68rem] uppercase tracking-widest text-muted font-bold">
            {faction.label} · {task.point_value} pts
          </span>
        </div>

        {/* Title */}
        <Link to={`/tasks/${task.id}`}>
          <h3 className="font-display text-xl font-semibold leading-tight hover:underline">
            {task.title}
          </h3>
        </Link>

        {/* Description */}
        {task.description && (
          <p className="font-body text-sm text-muted leading-relaxed flex-1 line-clamp-3">
            {task.description}
          </p>
        )}

        {/* Sign up */}
        {onSignup && (
          <button
            onClick={() => onSignup(task.id)}
            className="btn-primary self-start mt-1"
          >
            sign up
          </button>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 mt-auto border-t border-dashed border-border/40 font-body text-xs text-muted">
          <span>lvl {task.level_required}+</span>
          <span className="font-display text-sm font-bold text-ink">{task.point_value} pts</span>
        </div>
      </div>
    </div>
  )
}
