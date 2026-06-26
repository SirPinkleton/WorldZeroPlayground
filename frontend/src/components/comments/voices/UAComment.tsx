import { Link } from 'react-router-dom'
import FactionAvatar from '../../avatar/FactionAvatar'
import { formatCommentTime } from '../../../utils/commentTime'
import { type CommentProps, authorToCharacter, ComposerControls, MentionText } from '../shared'

/**
 * UA — University of Asthmatics. Orange/gold scholarly letterhead (ADR-0018).
 * Ivory card, gilt border, Marcellus labels + Playfair Display italic body.
 * (Comment-scoped orange; the global UA rebrand is out of scope.)
 */
const IVORY = '#f9f2e2'
const GOLD = '#c9a23c'
const ORANGE = '#c8601a'
const INK = '#2a1a10'
const BRONZE = '#b07a3a'
const SERIF = "'Playfair Display', Georgia, serif"
const LABEL = "'Marcellus', Georgia, serif"

function frame(): React.CSSProperties {
  return {
    background: IVORY,
    color: INK,
    border: `1.5px solid ${GOLD}`,
    boxShadow: `inset 0 0 0 1px #ecd089`,
    borderRadius: 6,
    padding: '13px 18px',
  }
}

export default function UAComment(props: CommentProps) {
  if (props.mode === 'composer') {
    const { character, value, onChange, onSubmit, submitting } = props
    return (
      <div style={{ ...frame(), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <FactionAvatar character={character} size="sm" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: LABEL, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE, marginBottom: 6 }}>
            University of Asthmatics
          </div>
          <ComposerControls value={value} onChange={onChange} onSubmit={onSubmit} submitting={submitting} accent={ORANGE} bg="#fffdf6" text={INK} />
        </div>
      </div>
    )
  }
  const { comment } = props
  const slug = comment.author.faction_slug
  return (
    <div style={{ ...frame(), display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <FactionAvatar character={authorToCharacter(comment.author)} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: LABEL, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE }}>
          University of Asthmatics
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <Link to={`/characters/${comment.author.id}`} style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 18, color: INK, textDecoration: 'none' }}>
            {comment.author.display_name}
          </Link>
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 12, color: BRONZE, whiteSpace: 'nowrap' }}>
            {formatCommentTime(slug, comment.created_at)}
            {comment.is_edited ? ' · edited' : ''}
          </span>
        </div>
        <div style={{ height: 1, background: 'rgba(201,150,47,0.55)', margin: '8px 0 9px' }} />
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, lineHeight: 1.5, color: INK }}>
          <MentionText body={comment.body_text} mentions={comment.mentions} accent={ORANGE} />
        </div>
      </div>
    </div>
  )
}
