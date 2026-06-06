import type { ComponentType } from 'react'
import type { CharacterOut } from '../../api/auth'
import { mediaUrl } from '../../utils/media'
import EverymenAvatar from './EverymenAvatar'
import GestaltAvatar from './GestaltAvatar'

/**
 * Per-faction avatar + membership-badge dispatcher (Tier-3 surface). Keyed by
 * the character's MEMBER faction (character.faction_slug). Faction variants
 * (cog sigil, moon glyph, …) register in Sessions 3-4. The default below is the
 * plain avatar circle previously inlined in CharacterBadge — no membership
 * badge — so behavior is unchanged until a variant opts in.
 */
export interface FactionAvatarProps {
  character: CharacterOut
  size?: 'sm' | 'md'
}

function DefaultAvatar({ character, size = 'md' }: FactionAvatarProps) {
  const isSmall = size === 'sm'
  return character.avatar_url ? (
    <img
      src={mediaUrl(character.avatar_url)}
      alt={character.username}
      className={`rounded-full border-2 border-border object-cover ${isSmall ? 'w-6 h-6' : 'w-8 h-8'}`}
    />
  ) : (
    <span
      className={`rounded-full border-2 border-border bg-paper flex items-center justify-center font-display font-bold text-ink ${
        isSmall ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
      }`}
    >
      {character.username[0]?.toUpperCase()}
    </span>
  )
}

const FACTION_AVATARS: Record<string, ComponentType<FactionAvatarProps>> = {
  everymen: EverymenAvatar,
  gestalt: GestaltAvatar,
}

export default function FactionAvatar({ character, size }: FactionAvatarProps) {
  const Variant =
    (character.faction_slug && FACTION_AVATARS[character.faction_slug]) ||
    DefaultAvatar
  return <Variant character={character} size={size} />
}
