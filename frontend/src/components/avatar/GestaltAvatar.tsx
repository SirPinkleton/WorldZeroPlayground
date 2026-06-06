import { BadgedAvatar, type FactionAvatarProps } from './FactionAvatar'

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
export default function GestaltAvatar({ character, size }: FactionAvatarProps) {
  return (
    <BadgedAvatar
      character={character}
      size={size}
      circle={{
        borderColor: 'var(--faction-gestalt-win-border)',
        bg: 'var(--faction-gestalt-notepad-bg)',
        textColor: 'var(--faction-gestalt-card-text)',
        fontFamily: 'var(--faction-gestalt-card-font)',
      }}
      badgeBg="var(--faction-gestalt)"
      badgeRing="var(--faction-gestalt-notepad-bg)"
      glyph={(s, color) => <MoonGlyph size={s} color={color} />}
    />
  )
}
