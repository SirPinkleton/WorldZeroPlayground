import api from './axios'

export interface ActivityFeedItem {
  type: string
  timestamp: string
  actor_display_name: string | null
  actor_faction_slug: string | null
  actor_avatar_url: string | null
  payload: Record<string, any>
}

export interface FeedCounts {
  all: number
  friends: number
  foes: number
  your_stuff: number
  global_count: number
  requests: number
}

export interface ActivityFeedResponse {
  items: ActivityFeedItem[]
  counts: FeedCounts
  next_cursor: string | null
}

export async function getActivityFeed(params?: {
  filter?: string
  before?: string
  limit?: number
}): Promise<ActivityFeedResponse> {
  const { data } = await api.get<ActivityFeedResponse>('/activity-feed', { params })
  return data
}
