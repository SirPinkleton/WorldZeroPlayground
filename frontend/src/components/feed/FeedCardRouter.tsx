import type { ActivityFeedItem } from '../../api/activityFeed'
import FactionFeedFrame from './FactionFeedFrame'
import FeedRowContent from './FeedRowContent'
import { normalizeFeedItem } from './normalizeFeedItem'
import FeedCardEraAnnouncement from './FeedCardEraAnnouncement'
import FeedCardCollabInvite from './FeedCardCollabInvite'
import FeedCardDuelChallenge from './FeedCardDuelChallenge'
import FeedCardInvitationLetter from './FeedCardInvitationLetter'

/**
 * Full adoption (#376): the faction owns every "someone did X" row. Those types
 * normalize into one slot-driven `FeedRowContent` inside the faction frame — no
 * per-event-type card. The remaining four are structural / interactive and keep
 * their bespoke companion cards (the design's factionless announcement + the
 * interactive challenge cards); the interactive ones own real accept/decline
 * handlers that must NOT collapse into slots.
 */
const COMPANION_MAP: Record<string, React.ComponentType<{ item: ActivityFeedItem }>> = {
  era_announcement: FeedCardEraAnnouncement,
  invitation_letter: FeedCardInvitationLetter,
  duel_challenge: FeedCardDuelChallenge,
  collab_invite: FeedCardCollabInvite,
}

interface Props {
  item: ActivityFeedItem
}

export default function FeedCardRouter({ item }: Props) {
  const row = normalizeFeedItem(item)
  if (row) {
    return (
      <FactionFeedFrame slug={row.slug}>
        <FeedRowContent row={row} avatarUrl={item.actor_avatar_url} />
      </FactionFeedFrame>
    )
  }

  const Companion = COMPANION_MAP[item.type]
  if (!Companion) return null
  // Companions bring their own chrome (announcement is dark; the interactive
  // cards are neutral) — still framed by faction context where one exists.
  return (
    <FactionFeedFrame slug={item.context_faction_slug}>
      <Companion item={item} />
    </FactionFeedFrame>
  )
}
