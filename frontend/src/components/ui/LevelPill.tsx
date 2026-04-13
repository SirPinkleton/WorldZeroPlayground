/**
 * Dark pill showing level requirement, shared by all faction cards (Style Guide §6).
 * In dark mode, accepts factionColor to use as background instead of default dark ink.
 */
export default function LevelPill({ level, factionColor }: { level: number; factionColor?: string }) {
  return (
    <span
      style={{
        background: factionColor ?? '#1a1209',
        color: factionColor ? 'var(--color-bg-page)' : 'white',
        fontSize: 7,
        padding: '1px 6px',
        borderRadius: 6,
        textTransform: 'uppercase',
        fontFamily: "'Courier Prime', monospace",
        letterSpacing: '0.08em',
      }}
    >
      lvl {level}+
    </span>
  )
}
