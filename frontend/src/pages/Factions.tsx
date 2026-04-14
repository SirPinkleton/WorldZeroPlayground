import { useEffect, useState } from 'react'
import { getFactions, getFactionStatus, getInvitations, chooseFaction } from '../api/factions'
import type { FactionOut, FactionPageOut, InvitationLetterOut } from '../api/factions'
import PageTitle from '../components/ui/PageTitle'
import { extractError } from '../utils/errors'
import { factionColor, factionName } from '../utils/factions'
import { relativeTime } from '../utils/dates'
import { useAuth } from '../auth/AuthContext'

const AGED_OUT_SLUG = 'aged_out'
const NA_SLUG = 'na'

const STATUS_MEMBER = 'member'
const STATUS_INVITED = 'invited'
const STATUS_NOT_INVITED = 'not_invited'
const STATUS_DEFECTED = 'defected'
const STATUS_CAN_RETURN = 'can_return'

/** Factions that should be hidden from the player-facing grid */
const HIDDEN_SLUGS = new Set([NA_SLUG, AGED_OUT_SLUG, 'ua'])

export default function Factions() {
  const { user, refetch } = useAuth()
  const character = user?.character ?? null

  const [factions, setFactions] = useState<FactionOut[]>([])
  const [factionPage, setFactionPage] = useState<FactionPageOut | null>(null)
  const [invitations, setInvitations] = useState<InvitationLetterOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Join flow state
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const factionsData = await getFactions()
      setFactions(factionsData)

      if (character) {
        const [statusData, invitesData] = await Promise.all([
          getFactionStatus(),
          getInvitations(),
        ])
        setFactionPage(statusData)
        setInvitations(invitesData)
      }
    } catch (err) {
      setError(extractError(err, 'Could not load factions.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchAll() }, [character?.id])

  const statusFor = (slug: string): string => {
    if (!factionPage) return STATUS_NOT_INVITED
    const entry = factionPage.all_factions.find((f) => f.slug === slug)
    return entry?.status ?? STATUS_NOT_INVITED
  }

  const needsFactionChoice =
    character?.faction_slug === AGED_OUT_SLUG ||
    character?.faction_slug === NA_SLUG

  const handleJoin = async (slug: string) => {
    setJoining(true)
    setJoinError(null)
    try {
      await chooseFaction(slug)
      await refetch()
      setConfirmSlug(null)
      await fetchAll()
    } catch (err) {
      setJoinError(extractError(err, 'Could not join faction.'))
    } finally {
      setJoining(false)
    }
  }

  if (loading) return <div className="py-8 font-body text-muted">Loading...</div>

  // Build the visible faction list (exclude hidden system factions)
  const visibleFactions = factions.filter((f) => !HIDDEN_SLUGS.has(f.slug))

  // Sort: current member first, then invited, then can_return, then rest
  const statusPriority: Record<string, number> = {
    [STATUS_MEMBER]: 0,
    [STATUS_INVITED]: 1,
    [STATUS_CAN_RETURN]: 2,
    [STATUS_NOT_INVITED]: 3,
    [STATUS_DEFECTED]: 4,
  }
  const sortedFactions = [...visibleFactions].sort((a, b) => {
    const sa = statusPriority[statusFor(a.slug)] ?? 3
    const sb = statusPriority[statusFor(b.slug)] ?? 3
    return sa - sb
  })

  return (
    <div className="py-8">
      <PageTitle title="Factions" />

      {error && (
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2 mb-4">{error}</p>
      )}

      {/* Graduation prompt for aged_out / na characters */}
      {character && needsFactionChoice && (
        <div
          className="sidebar-card mb-6"
          style={{
            padding: '20px 24px',
            borderLeft: '4px solid var(--color-warning)',
            background: 'var(--color-warning-light)',
          }}
        >
          <p className="font-display italic" style={{ fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 6 }}>
            You've graduated from UA — choose your faction below.
          </p>
          <p className="font-body" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            Each faction has unique modifiers and abilities. Choose wisely — you can defect later, but you
            won't be able to rejoin most factions once you leave.
          </p>
        </div>
      )}

      {/* Invitation letters panel */}
      {character && invitations.length > 0 && (
        <div className="mb-6">
          <h3
            className="eyebrow mb-3"
            style={{ color: 'var(--color-text-tertiary)', fontSize: 9 }}
          >
            Recent Invitations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {invitations.map((inv) => {
              const color = factionColor(inv.faction_slug)
              return (
                <div
                  key={inv.faction_slug}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: `linear-gradient(135deg, ${color}10, transparent)`,
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <span style={{ fontSize: 12 }}>&#x2709;&#xFE0F;</span>
                  <span className="font-body" style={{ fontSize: 11, color: 'var(--color-text-primary)', flex: 1 }}>
                    You've been invited to join{' '}
                    <span style={{ fontWeight: 700, color }}>{inv.faction_name}</span>
                  </span>
                  <span className="eyebrow" style={{ color: 'var(--color-text-tertiary)', fontSize: 8 }}>
                    {relativeTime(inv.delivered_at)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Logged-out hint */}
      {!character && (
        <p className="font-body text-sm text-muted mb-6">
          Factions are chosen at level 3. Until then, you start in UA.
        </p>
      )}

      {/* Faction grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {sortedFactions.map((f) => {
          const color = factionColor(f.slug)
          const status = statusFor(f.slug)
          const isMember = status === STATUS_MEMBER
          const isInvited = status === STATUS_INVITED
          const isDefected = status === STATUS_DEFECTED
          const canReturn = status === STATUS_CAN_RETURN
          const canJoin = isInvited || canReturn || (needsFactionChoice && status !== STATUS_DEFECTED)
          const isConfirming = confirmSlug === f.slug

          return (
            <div
              key={f.slug}
              className="sidebar-card relative overflow-hidden"
              style={{
                borderLeft: `3px solid ${color}`,
                opacity: isDefected ? 0.5 : 1,
              }}
            >
              {/* Header row: name + status badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }}
                />
                <h2 className="font-display italic" style={{ fontSize: 18, color, flex: 1 }}>
                  {f.name}
                </h2>

                {/* Status badge */}
                {isMember && (
                  <span
                    className="eyebrow"
                    style={{
                      fontSize: 8,
                      background: '#14532d',
                      color: '#fff',
                      padding: '2px 8px',
                      letterSpacing: '0.1em',
                    }}
                  >
                    MEMBER
                  </span>
                )}
                {isInvited && (
                  <span
                    className="eyebrow"
                    style={{
                      fontSize: 8,
                      background: color,
                      color: '#fff',
                      padding: '2px 8px',
                      letterSpacing: '0.1em',
                    }}
                  >
                    &#x2709; INVITED
                  </span>
                )}
                {isDefected && (
                  <span
                    className="eyebrow"
                    style={{
                      fontSize: 8,
                      background: 'var(--color-danger)',
                      color: '#fff',
                      padding: '2px 8px',
                      letterSpacing: '0.1em',
                      textDecoration: 'line-through',
                    }}
                  >
                    BURNED
                  </span>
                )}
                {canReturn && (
                  <span
                    className="eyebrow"
                    style={{
                      fontSize: 8,
                      background: color,
                      color: '#fff',
                      padding: '2px 8px',
                      letterSpacing: '0.1em',
                    }}
                  >
                    WELCOME BACK
                  </span>
                )}
              </div>

              {/* Description */}
              {f.description && (
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: canJoin ? 12 : 0,
                  }}
                >
                  {f.description}
                </p>
              )}

              {/* Not invited hint */}
              {!character ? null : status === STATUS_NOT_INVITED && !needsFactionChoice && (
                <p className="font-body" style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 8, fontStyle: 'italic' }}>
                  Complete tasks from this faction to unlock an invitation.
                </p>
              )}

              {/* Join / Rejoin button */}
              {character && canJoin && !isConfirming && (
                <button
                  onClick={() => setConfirmSlug(f.slug)}
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: color,
                    color: '#fff',
                    border: 'none',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    marginTop: 4,
                  }}
                >
                  {canReturn ? 'Rejoin' : 'Join'}
                </button>
              )}

              {/* Confirmation step */}
              {isConfirming && (
                <div style={{ marginTop: 8 }}>
                  <p className="font-body" style={{ fontSize: 10, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                    {needsFactionChoice
                      ? `Join ${f.name}?`
                      : `Join ${f.name}? You won't be able to rejoin ${factionName(character?.faction_slug)} after leaving.`
                    }
                  </p>

                  {joinError && (
                    <p className="font-body" style={{ fontSize: 10, color: 'var(--color-danger)', marginBottom: 6 }}>
                      {joinError}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleJoin(f.slug)}
                      disabled={joining}
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        background: '#14532d',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 14px',
                        cursor: joining ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {joining ? 'Joining...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => { setConfirmSlug(null); setJoinError(null) }}
                      disabled={joining}
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                        padding: '5px 14px',
                        cursor: joining ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
