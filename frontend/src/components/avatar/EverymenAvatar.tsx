import { BadgedAvatar, type FactionAvatarProps } from './FactionAvatar'

/** 8-tooth worker gear sigil. */
function CogMark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g fill={color}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="11"
            y="1"
            width="2"
            height="5"
            rx="0.5"
            transform={`rotate(${i * 45} 12 12)`}
          />
        ))}
        <circle cx="12" cy="12" r="6" />
      </g>
      <circle cx="12" cy="12" r="2.4" fill="var(--everymen-red)" />
    </svg>
  )
}

/**
 * Everymen avatar — the standard circle plus a red union membership badge
 * (cog sigil) clipped to the lower-right.
 */
export default function EverymenAvatar({ character, size }: FactionAvatarProps) {
  return (
    <BadgedAvatar
      character={character}
      size={size}
      circle={{
        borderColor: 'var(--everymen-ink)',
        bg: 'var(--everymen-paper)',
        textColor: 'var(--everymen-paper-text)',
        fontFamily: 'var(--font-display)',
      }}
      initialFontSize={[11, 14]}
      badgeBg="var(--everymen-red)"
      badgeRing="var(--everymen-cream)"
      glyph={(s, color) => <CogMark size={s} color={color} />}
    />
  )
}
