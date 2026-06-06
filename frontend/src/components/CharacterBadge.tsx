import { Link } from 'react-router-dom'
import type { CharacterOut } from '../api/auth'
import FactionAvatar from './avatar/FactionAvatar'

interface Props {
  character: CharacterOut
  size?: 'sm' | 'md'
}

export default function CharacterBadge({ character, size = 'md' }: Props) {
  const isSmall = size === 'sm'
  return (
    <Link
      to={`/characters/${character.id}`}
      className="inline-flex items-center gap-2 hover:underline"
    >
      <FactionAvatar character={character} size={size} />
      <span className={`font-body text-ink ${isSmall ? 'text-xs' : 'text-sm'}`}>
        {character.username}
      </span>
    </Link>
  )
}
