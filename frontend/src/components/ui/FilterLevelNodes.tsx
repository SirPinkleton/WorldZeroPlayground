import { useTheme } from '../../hooks/useTheme'

/**
 * Level filter — Connected Nodes (Style Guide §5.3).
 * Row of circles connected by horizontal bars. Active: dark fill, scale(1.15).
 * Dark active: inverted to cream on dark-bg.
 */

interface Props {
  levels: number[]
  value: number | ''
  onChange: (level: number | '') => void
}

export default function FilterLevelNodes({ levels, value, onChange }: Props) {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <span className="eyebrow" style={{ marginRight: 8 }}>level:</span>
      {levels.map((level, index) => {
        const active = value === level
        return (
          <div key={level} style={{ display: 'flex', alignItems: 'center' }}>
            {index > 0 && (
              <div style={{ width: 12, height: 2, background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)' }} />
            )}
            <button
              onClick={() => onChange(value === level ? '' : level)}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: `2px solid ${active ? (dark ? '#f0e6d0' : '#1a1209') : (dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}`,
                background: active ? (dark ? '#f0e6d0' : '#1a1209') : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'),
                color: active ? (dark ? '#13121a' : '#F7F4EE') : 'var(--color-text-tertiary)',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: active ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 120ms',
                padding: 0,
              }}
            >
              {level}+
            </button>
          </div>
        )
      })}
    </div>
  )
}
