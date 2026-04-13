/**
 * Status filter — Rubber Stamps (Style Guide §5.3).
 * Rectangular, no border-radius, inner dashed border, bold uppercase.
 */

interface Props {
  options: string[]
  value: string
  onChange: (value: string) => void
}

export default function FilterStamps({ options, value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span className="eyebrow">status:</span>
      {options.map((option) => {
        const active = value === option
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            style={{
              position: 'relative',
              border: `2px solid ${active ? '#1a1209' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: 0,
              background: active ? '#1a1209' : 'rgba(255,255,255,0.6)',
              color: active ? '#F7F4EE' : 'var(--color-text-primary)',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '5px 10px',
              cursor: 'pointer',
              transition: 'all 120ms',
            }}
          >
            {/* Inner dashed border */}
            <span
              style={{
                position: 'absolute',
                inset: 2,
                border: `1px dashed ${active ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                pointerEvents: 'none',
              }}
            />
            {option}
          </button>
        )
      })}
    </div>
  )
}
