/** Date divider for the activity feed (TODAY, YESTERDAY, or formatted date). */

export function getDateLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (itemDate.getTime() === today.getTime()) return 'Today'
  if (itemDate.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

interface FeedDateDividerProps {
  label: string
}

export default function FeedDateDivider({ label }: FeedDateDividerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      <span
        style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: 9,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--color-text-tertiary)',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  )
}
