import type { FactionAvatarProps } from './FactionAvatar'
import { mediaUrl } from '../../utils/media'

/** Crescent-moon sigil. */
function MoonGlyph({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16.5 12a6.5 6.5 0 0 1-8.4 6.2 7.5 7.5 0 1 0 0-12.4A6.5 6.5 0 0 1 16.5 12Z"
        fill={color}
      />
    </svg>
  )
}

/**
 * Gestalt avatar — the standard circle with a pink "coven" moon membership
 * badge clipped to the lower-right.
 */
export default function GestaltAvatar({ character, size = 'md' }: FactionAvatarProps) {
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
          style={{ width: dim, height: dim, border: '2px solid var(--faction-gestalt-win-border)' }}
        />
      ) : (
        <span
          className="rounded-full flex items-center justify-center font-bold"
          style={{
            width: dim,
            height: dim,
            border: '2px solid var(--faction-gestalt-win-border)',
            background: 'var(--faction-gestalt-notepad-bg)',
            color: 'var(--faction-gestalt-card-text)',
            fontFamily: 'var(--faction-gestalt-card-font)',
            fontSize: isSmall ? 13 : 16,
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
          background: 'var(--faction-gestalt)',
          border: '1.5px solid var(--faction-gestalt-notepad-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MoonGlyph size={badge - 5} color="var(--faction-gestalt-notepad-bg)" />
      </span>
    </span>
  )
}
