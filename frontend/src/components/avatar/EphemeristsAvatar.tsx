import { BadgedAvatar, type FactionAvatarProps } from "./FactionAvatar";
import { EphMark } from "../cards/ephemeristsAtoms";

/**
 * The Ephemerists avatar — the standard circle plus a lapis membership badge
 * carrying the faction sigil (the watching wanderer). Colors via --eph-* tokens.
 */
export default function EphemeristsAvatar({ character, size }: FactionAvatarProps) {
  return (
    <BadgedAvatar
      character={character}
      size={size}
      circle={{
        borderColor: "var(--eph-ink)",
        bg: "var(--eph-vellum)",
        textColor: "var(--eph-vellum-text)",
        fontFamily: "var(--eph-display)",
      }}
      initialFontSize={[11, 14]}
      badgeBg="var(--eph-lapis)"
      badgeRing="var(--eph-vellum)"
      glyph={(s, _color) => <EphMark size={s} color="var(--eph-gold-light)" stroke={1.4} />}
    />
  );
}
