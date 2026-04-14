import type { ActivityFeedItem } from '../../api/activityFeed'
import FeedCardEraAnnouncement from './FeedCardEraAnnouncement'
import FeedCardVoteNotification from './FeedCardVoteNotification'
import FeedCardFoeTaunt from './FeedCardFoeTaunt'
import FeedCardFriendActivity from './FeedCardFriendActivity'
import FeedCardCollabInvite from './FeedCardCollabInvite'
import FeedCardDuelChallenge from './FeedCardDuelChallenge'
import FeedCardGlobalTask from './FeedCardGlobalTask'
import FeedCardFriendSignup from './FeedCardFriendSignup'
import FeedCardInvitationLetter from './FeedCardInvitationLetter'
import FeedCardFriendDefection from './FeedCardFriendDefection'
import FeedCardFoeCompletion from './FeedCardFoeCompletion'

const CARD_MAP: Record<string, React.ComponentType<{ item: ActivityFeedItem }>> = {
  era_announcement: FeedCardEraAnnouncement,
  vote_on_mine: FeedCardVoteNotification,
  foe_taunt: FeedCardFoeTaunt,
  foe_completion: FeedCardFoeCompletion,
  friend_completion: FeedCardFriendActivity,
  collab_invite: FeedCardCollabInvite,
  duel_challenge: FeedCardDuelChallenge,
  global_task: FeedCardGlobalTask,
  friend_signup: FeedCardFriendSignup,
  invitation_letter: FeedCardInvitationLetter,
  friend_defection: FeedCardFriendDefection,
}

interface Props {
  item: ActivityFeedItem
}

export default function FeedCardRouter({ item }: Props) {
  const Card = CARD_MAP[item.type]
  if (!Card) return null
  return <Card item={item} />
}
