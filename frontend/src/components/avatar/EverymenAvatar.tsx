import type { FactionAvatarProps } from './FactionAvatar'
import { mediaUrl } from '../../utils/media'

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
export default function EverymenAvatar({ character, size = 'md' }: FactionAvatarProps) {
  const isSmall = size === 'sm'
  const dim = isSmall ? 24 : 32
  const badge = isSmall ? 12 : 16
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: dim, height: dim }}>
      {character.avatar_url ? (
        <img
          src={mediaUrl(character.avatar_url)}
          alt={character.username}
          className="rounded-full object-cover"
          style={{ width: dim, height: dim, border: '2px solid var(--everymen-ink)' }}
        />
      ) : (
        <span
          className="rounded-full flex items-center justify-center font-display font-bold"
          style={{
            width: dim,
            height: dim,
            border: '2px solid var(--everymen-ink)',
            background: 'var(--everymen-paper)',
            color: 'var(--everymen-paper-text)',
            fontSize: isSmall ? 11 : 14,
          }}
        >
          {character.username[0]?.toUpperCase()}
        </span>
      )}
      <span
        style={{
          position: 'absolute',
          right: -3,
          bottom: -3,
          width: badge,
          height: badge,
          borderRadius: '50%',
          background: 'var(--everymen-red)',
          border: '1.5px solid var(--everymen-cream)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CogMark size={badge - 5} color="var(--everymen-cream)" />
      </span>
    </span>
  )
}
