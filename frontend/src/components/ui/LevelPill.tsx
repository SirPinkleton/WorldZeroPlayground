/** Dark pill showing level requirement, shared by all faction cards (Style Guide §6). */
export default function LevelPill({ level }: { level: number }) {
  return (
    <span
      style={{
        background: '#1a1209',
        color: 'white',
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
