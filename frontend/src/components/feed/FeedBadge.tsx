/** Reusable badge chip for feed items (FRIEND, YOUR STUFF, GLOBAL, DUEL, etc.) */

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  friend:    { bg: '#14532d', color: '#fff' },
  your_stuff: { bg: '#8a6a20', color: '#fff' },
  global:    { bg: '#6b6a7a', color: '#fff' },
  duel:      { bg: '#dc2626', color: '#fff' },
  collab:    { bg: '#15803d', color: '#fff' },
  admin:     { bg: '#1a1209', color: '#F7F4EE' },
}

interface FeedBadgeProps {
  type: string
  label?: string
}

export default function FeedBadge({ type, label }: FeedBadgeProps) {
  const style = BADGE_STYLES[type] ?? BADGE_STYLES.global
  const text = label ?? type.replace(/_/g, ' ')

  return (
    <span
      style={{
        display: 'inline-block',
        background: style.bg,
        color: style.color,
        fontFamily: "'Courier Prime', monospace",
        fontSize: 8,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '2px 8px',
        borderRadius: 3,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  )
}
