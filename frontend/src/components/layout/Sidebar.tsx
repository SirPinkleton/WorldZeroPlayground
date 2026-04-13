import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

/** Faction display names keyed by slug */
const FACTION_NAMES: Record<string, string> = {
  ua: 'UA',
  analog: 'Analog',
  gestalt: 'Gestalt',
  snide: 'S.N.I.D.E.',
  journeymen: 'Journeymen',
  singularity: 'Singularity',
  'ua-masters': 'UA Masters',
}

/** Faction color for the avatar orb gradient */
const FACTION_COLORS: Record<string, string> = {
  ua: '#6b6a7a',
  analog: '#15803d',
  gestalt: '#14532d',
  snide: '#8a6a20',
  journeymen: '#c49a3a',
  singularity: '#7c3aed',
  'ua-masters': '#555555',
}

/**
 * Always-on right sidebar (Style Guide §4.2).
 *
 * Phase 1: Character card + placeholder active tasks + propose-a-task button.
 * Phase 2 will wire up active tasks data and recent activity panel.
 */
export default function Sidebar() {
  const { user } = useAuth()
  const character = user?.character

  return (
    <aside className="flex flex-col gap-3" style={{ width: 256 }}>
      {/* ── Character Card ── */}
      {character ? (
        <div className="sidebar-card">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar orb */}
            <div
              className="shrink-0 rounded-full"
              style={{
                width: 40,
                height: 40,
                background: `linear-gradient(135deg, ${FACTION_COLORS[character.faction_slug ?? ''] ?? '#6b6a7a'}, ${FACTION_COLORS[character.faction_slug ?? ''] ?? '#6b6a7a'}88)`,
              }}
            />
            <div className="min-w-0">
              <Link
                to={`/characters/${character.id}`}
                className="font-display italic text-sm block truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {character.display_name}
              </Link>
              <span
                className="font-body uppercase block truncate"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  color: FACTION_COLORS[character.faction_slug ?? ''] ?? 'var(--color-text-tertiary)',
                }}
              >
                {FACTION_NAMES[character.faction_slug ?? ''] ?? 'Unaffiliated'} · Level {character.level}
              </span>
            </div>
          </div>

          {/* 3-column stat grid */}
          <div className="grid grid-cols-3 gap-1">
            {[
              { label: 'Score', value: character.score },
              { label: 'Level', value: character.level },
              { label: 'Era', value: 1 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center rounded-md py-1.5"
                style={{ background: 'var(--color-bg-surface-alt)' }}
              >
                <div className="font-body font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {stat.value}
                </div>
                <div className="eyebrow" style={{ fontSize: 7 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="sidebar-card">
          <p className="eyebrow text-center">No character yet</p>
        </div>
      )}

      {/* ── Active Tasks Panel (placeholder) ── */}
      <div className="sidebar-card">
        <p className="eyebrow mb-2">Your active tasks</p>
        <p className="font-body text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          No active tasks
        </p>
      </div>

      {/* ── Propose a Task Button ── */}
      <Link
        to="/propose-task"
        className="btn-primary text-center w-full block"
      >
        Propose a Task
      </Link>
    </aside>
  )
}
