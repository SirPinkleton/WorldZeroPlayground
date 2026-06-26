import { BadgedAvatar, type FactionAvatarProps } from "./FactionAvatar";

/**
 * The Singularity membership sigil — a terminal prompt (`>`) trailed by a
 * blinking-cursor block, the faction's pervasive boot-line motif rendered at
 * badge scale. Drawn in the badge ring color so the dispatcher can recolor it.
 */
function SingularitySigil(size: number, color: string) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* terminal prompt caret ">" */}
      <polyline
        points="2,3 5,6 2,9"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* cursor block */}
      <rect x="7" y="7.5" width="3" height="1.6" fill={color} />
    </svg>
  );
}

/**
 * The Singularity avatar — a terminal-black circle in faction monospace plus a
 * blue membership badge carrying the prompt/cursor sigil. Singularity is
 * always-dark: its tokens are identical across themes, so no theme mutation is
 * needed. Colors via --faction-singularity-* tokens.
 */
export default function SingularityAvatar({ character, size }: FactionAvatarProps) {
  return (
    <BadgedAvatar
      character={character}
      size={size}
      circle={{
        borderColor: "var(--faction-singularity-border-hard)",
        bg: "var(--faction-singularity-card-bg)",
        textColor: "var(--faction-singularity-card-text)",
        fontFamily: "var(--font-faction-terminal)",
      }}
      badgeBg="var(--faction-singularity-card-bg)"
      badgeRing="var(--faction-singularity-card-muted)"
      glyph={(s, _color) => SingularitySigil(s, "var(--faction-singularity-card-accent)")}
    />
  );
}
