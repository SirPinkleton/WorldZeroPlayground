import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { getActivityFeed, type ActivityFeedItem } from '../../api/activityFeed'
import { relativeTime } from '../../utils/dates'
import { factionColor, factionName } from '../../utils/factions'
import { mediaUrl } from '../../utils/media'
import FeedBadge from '../feed/FeedBadge'
import { useMyActiveTasks } from '../../hooks/useMyActiveTasks'
import { useMyCharacterStats } from '../../hooks/useMyCharacterStats'
import { usePendingRequests } from '../../hooks/usePendingRequests'
import { useGameConfig } from '../../hooks/useGameConfig'

const DEFAULT_MAX_TASK_SLOTS = 20

/**
 * Always-on right sidebar (Style Guide §4.2).
 * Character card + pending requests + active tasks + recent global activity + propose button.
 */
export default function Sidebar() {
  const { user } = useAuth()
  const character = user?.character

  const { activeTasks } = useMyActiveTasks()
  const { votesReceived } = useMyCharacterStats(character?.id)
  const { pendingRequests } = usePendingRequests()
  const gameConfig = useGameConfig()
  const [globalActivity, setGlobalActivity] = useState<ActivityFeedItem[]>([])

  useEffect(() => {
    if (!user) return
    // Global activity from the unified feed API
    getActivityFeed({ filter: 'global', limit: 5 })
      .then((response) => setGlobalActivity(response.items))
      .catch(() => {})
  }, [user])

  const maxTaskSlots = gameConfig?.max_task_signups ?? DEFAULT_MAX_TASK_SLOTS
  const slotCount = activeTasks.length
  const slotPercent = Math.min((slotCount / maxTaskSlots) * 100, 100)

  return (
    <aside className="flex flex-col gap-3" style={{ width: 256 }}>
      {/* ── Character Card ── */}
      {character ? (
        <div className="sidebar-card">
          <div className="eyebrow" style={{ fontSize: 8, marginBottom: 8, color: 'var(--color-text-tertiary)' }}>
            Your Character
          </div>
          <div className="flex items-center gap-3 mb-3">
            {character.avatar_url ? (
              <img
                src={mediaUrl(character.avatar_url)}
                alt={character.display_name}
                className="shrink-0 rounded-full"
                style={{ width: 40, height: 40, objectFit: 'cover' }}
              />
            ) : (
              <div
                className="shrink-0 rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  background: `linear-gradient(135deg, ${factionColor(character.faction_slug)}, ${factionColor(character.faction_slug)}88)`,
                }}
              />
            )}
            <div className="min-w-0">
              <Link
                to={`/characters/${character.id}`}
                className="font-display italic text-sm block truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {character.display_name}
              </Link>
              <span
                className="font-body uppercase block truncate"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  color: factionColor(character.faction_slug),
                }}
              >
                {factionName(character.faction_slug)} · Level {character.level}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {[
              { label: 'Score', value: character.score?.toLocaleString() ?? '0' },
              { label: 'Votes', value: votesReceived.toLocaleString() },
              { label: 'Current', value: `Era 3`, sublabel: true },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center rounded-md py-1.5"
                style={{ background: 'var(--color-bg-surface-alt)' }}
              >
                <div className="font-body font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {stat.value}
                </div>
                <div className="eyebrow" style={{ fontSize: 7 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="sidebar-card">
          <p className="eyebrow text-center">No character yet</p>
        </div>
      )}

      {/* ── Pending Requests Panel ── */}
      {pendingRequests.length > 0 && (
        <div className="sidebar-card">
          <p className="eyebrow mb-2">
            Pending Requests · {pendingRequests.length}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pendingRequests.map((item, index) => {
              const actorColor = factionColor(item.actor_faction_slug)
              const isCollab = item.type === 'collab_invite'
              return (
                <div
                  key={`${item.type}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 0',
                    borderTop: index > 0 ? '1px dashed var(--color-border)' : undefined,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${actorColor}, ${actorColor}88)`,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="font-body" style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>
                      {item.actor_display_name}
                    </span>
                    <span className="eyebrow" style={{ color: 'var(--color-text-tertiary)' }}>
                      {isCollab ? 'Collab Invite' : 'Duel Challenge'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Active Tasks Panel ── */}
      <div className="sidebar-card">
        <p className="eyebrow mb-2">Your active tasks</p>

        {activeTasks.length === 0 ? (
          <p className="font-body text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            No active tasks
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeTasks.map((characterTask) => {
              const taskFactionColor = factionColor(characterTask.task.primary_faction_slug)
              const taskFactionName = factionName(characterTask.task.primary_faction_slug)
              return (
                <div
                  key={characterTask.id}
                  style={{
                    borderLeft: `3px solid ${taskFactionColor}`,
                    paddingLeft: 8,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <Link
                      to={`/tasks/${characterTask.task.id}`}
                      className="font-body"
                      style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none', display: 'block', lineHeight: 1.3 }}
                    >
                      {characterTask.task.title}
                    </Link>
                    <span className="font-body" style={{ fontSize: 8, color: 'var(--color-text-tertiary)' }}>
                      {taskFactionName} · lvl {characterTask.task.level_required}
                    </span>
                  </div>
                  <FeedBadge type="global" label="Solo" />
                </div>
              )
            })}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: 'var(--color-bg-surface-alt)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${slotPercent}%`,
                background: '#4f46e5',
                borderRadius: 2,
                transition: 'width 300ms',
              }}
            />
          </div>
          <p className="font-body" style={{ fontSize: 8, color: 'var(--color-text-tertiary)', marginTop: 3 }}>
            {slotCount} / {maxTaskSlots} slots
          </p>
        </div>
      </div>

      {/* ── Recent Global Activity Panel ── */}
      <div className="sidebar-card">
        <p className="eyebrow mb-2">Recent global activity</p>

        {globalActivity.length === 0 ? (
          <p className="font-body text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            No activity yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {globalActivity.map((item, index) => {
              const isTask = item.type === 'global_task'
              const isEra = item.type === 'era_announcement'
              return (
                <div
                  key={`${item.type}-${index}`}
                  style={{
                    padding: '5px 0',
                    borderTop: index > 0 ? '1px dashed var(--color-border)' : undefined,
                  }}
                >
                  <div className="font-body" style={{ fontSize: 9, lineHeight: 1.4 }}>
                    {isEra ? (
                      <span style={{ fontWeight: 700, color: '#c49a3a' }}>
                        {item.payload.era_name} has begun
                      </span>
                    ) : isTask ? (
                      <>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>New task: </span>
                        <Link
                          to={`/tasks/${item.payload.task_id}`}
                          style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                        >
                          {item.payload.task_title}
                        </Link>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {item.actor_display_name}
                        </span>
                        {' completed '}
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {item.payload.task_title || item.payload.submission_title || 'a task'}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="font-body" style={{ fontSize: 7, color: 'var(--color-text-tertiary)' }}>
                    {relativeTime(item.timestamp)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Propose a Task Button ── */}
      <Link
        to="/propose-task"
        className="btn-primary text-center w-full block"
      >
        Propose a Task
      </Link>
    </aside>
  )
}
