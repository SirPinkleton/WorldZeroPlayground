import type { FactionOut } from '../../api/factions'

/**
 * Faction filter — Diagonal Banner Tabs (Style Guide §5.3).
 * Pennant shape via clip-path, faction-colored, inactive: desaturated + low opacity.
 */

/** Faction slug → color mapping */
const FACTION_COLORS: Record<string, string> = {
  ua: '#6b6a7a',
  analog: '#15803d',
  gestalt: '#14532d',
  snide: '#8a6a20',
  journeymen: '#c49a3a',
  singularity: '#7c3aed',
  ua_masters: '#555555',
  albescent: '#6b6a7a',
  aged_out: '#6b6a7a',
}

interface Props {
  factions: FactionOut[]
  value: string
  onChange: (slug: string) => void
}

export default function FilterFactionTabs({ factions, value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <span className="eyebrow">faction:</span>
      {factions.map((faction) => {
        const active = value === faction.slug
        const color = FACTION_COLORS[faction.slug] ?? '#6b6a7a'
        return (
          <button
            key={faction.slug}
            onClick={() => onChange(value === faction.slug ? '' : faction.slug)}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
              background: color,
              color: 'white',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              padding: '4px 12px',
              cursor: 'pointer',
              border: 'none',
              borderRadius: 0,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              opacity: active ? 1 : 0.42,
              filter: active ? 'none' : 'saturate(0.3)',
              transition: 'all 120ms',
            }}
          >
            {faction.name}
          </button>
        )
      })}
    </div>
  )
}
