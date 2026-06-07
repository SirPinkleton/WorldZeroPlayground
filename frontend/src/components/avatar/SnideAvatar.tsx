import { BadgedAvatar, type FactionAvatarProps } from './FactionAvatar'

/** Circled-A anarchy sigil. */
function CircledAGlyph({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="19" stroke={color} strokeWidth="3.5" />
      <path
        d="M14 34 L24 12 L34 34 M18 27 H30"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * S.N.I.D.E. avatar — the standard circle on photocopier ink with an acid
 * circled-A membership badge clipped to the lower-right.
 */
export default function SnideAvatar({ character, size }: FactionAvatarProps) {
  return (
    <BadgedAvatar
      character={character}
      size={size}
      circle={{
        borderColor: 'var(--faction-snide-acid)',
        bg: 'var(--faction-snide-ink)',
        textColor: 'var(--faction-snide-acid)',
        fontFamily: 'var(--faction-snide-font-marker)',
      }}
      badgeBg="var(--faction-snide-ink)"
      badgeRing="var(--faction-snide-acid)"
      glyph={(s, color) => <CircledAGlyph size={s} color={color} />}
    />
  )
}
