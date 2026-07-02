/**
 * Full-adoption feed (#376): the faction owns every "someone did X" row via one
 * slot-driven body; the four structural/interactive events keep bespoke cards.
 * This guards (a) the normalizer maps each faction event to the right slots and
 * leaves the four companions alone, and (b) the row renders its invariant slots.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { normalizeFeedItem, FACTION_ROW_TYPES } from '../feed/normalizeFeedItem'
import FeedRowContent from '../feed/FeedRowContent'
import type { ActivityFeedItem } from '../../api/activityFeed'

function item(type: string, payload: Record<string, unknown>): ActivityFeedItem {
  return {
    type,
    timestamp: '2026-01-01T00:00:00Z',
    actor_display_name: 'Ada',
    actor_faction_slug: 'wow',
    actor_avatar_url: null,
    payload,
    context_faction_slug: 'wow',
  }
}

describe('normalizeFeedItem', () => {
  it('maps a friend completion to actor/action/headline slots', () => {
    const row = normalizeFeedItem(item('friend_completion', { character_id: 3, praxis_id: 7, task_title: 'Reforest', task_point_value: 40 }))!
    expect(row.actor).toBe('Ada')
    expect(row.action).toBe('completed a task')
    expect(row.actorHref).toBe('/characters/3')
    expect(row.headline).toBe('Reforest')
    expect(row.headlineHref).toBe('/praxes/7')
    expect(row.points).toBe('40 pts')
    expect(row.badge?.label).toBe('Friend')
  })

  it('quotes a taunt and drops points', () => {
    const row = normalizeFeedItem(item('foe_taunt', { from_character_id: 9, message: 'you fell behind' }))!
    expect(row.action).toBe('taunts you')
    expect(row.headline).toBe('you fell behind')
    expect(row.headlineQuoted).toBe(true)
    expect(row.points).toBeNull()
  })

  it('has an actorless system row for a global task', () => {
    const row = normalizeFeedItem(item('global_task', { task_id: 5, task_title: 'New job', task_point_value: 10, task_level_required: 2 }))!
    expect(row.actor).toBeNull()
    expect(row.headlineHref).toBe('/tasks/5')
    expect(row.level).toBe(2)
  })

  it('returns null for the four companion (structural/interactive) types', () => {
    for (const type of ['era_announcement', 'invitation_letter', 'duel_challenge', 'collab_invite']) {
      expect(normalizeFeedItem(item(type, {})), type).toBeNull()
    }
  })

  it('normalizes every registered faction-row type without throwing', () => {
    for (const type of FACTION_ROW_TYPES) {
      expect(normalizeFeedItem(item(type, {})), type).not.toBeNull()
    }
  })
})

describe('FeedRowContent', () => {
  it('renders actor, action, and headline slots', () => {
    const row = normalizeFeedItem(item('friend_completion', { character_id: 3, praxis_id: 7, task_title: 'Reforest', task_point_value: 40 }))!
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <FeedRowContent row={row} avatarUrl={null} />
      </MemoryRouter>,
    )
    expect(html).toContain('Ada')
    expect(html).toContain('completed a task')
    expect(html).toContain('Reforest')
    expect(html).toContain('href="/praxes/7"')
  })
})
