import { useEffect, useState, useRef } from 'react'
import { getAccounts, getAccountDetail, suspendAccount, banCharacter } from '../../api/admin'
import type { AccountSummary, AccountDetail } from '../../api/admin'
import { extractError } from '../../utils/errors'
import { formatTimestamp } from '../../utils/dates'

export default function AccountsTab() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<AccountDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const refresh = (email?: string) => {
    setError(null)
    getAccounts(email || undefined)
      .then(setAccounts)
      .catch((err) => setError(extractError(err, "Couldn't load accounts.")))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const handleSearch = (value: string) => {
    setSearchEmail(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      refresh(value)
    }, 300)
  }

  const handleExpand = async (accountId: number) => {
    if (expandedId === accountId) {
      setExpandedId(null)
      setDetail(null)
      return
    }
    setExpandedId(accountId)
    try {
      const d = await getAccountDetail(accountId)
      setDetail(d)
    } catch (err) {
      setActionError(extractError(err, 'Could not load account detail.'))
    }
  }

  const handleSuspend = async (accountId: number, suspended: boolean) => {
    setActionError(null)
    try {
      await suspendAccount(accountId, suspended)
      refresh(searchEmail)
      if (expandedId === accountId) {
        const d = await getAccountDetail(accountId)
        setDetail(d)
      }
    } catch (err) {
      setActionError(extractError(err, 'Could not update account.'))
    }
  }

  const handleBan = async (characterId: number, banned: boolean) => {
    setActionError(null)
    try {
      await banCharacter(characterId, banned)
      if (expandedId) {
        const d = await getAccountDetail(expandedId)
        setDetail(d)
      }
    } catch (err) {
      setActionError(extractError(err, 'Could not update character.'))
    }
  }

  if (loading) return <div className="font-body text-muted text-sm">Loading...</div>
  if (error) return <p className="font-body text-sm text-red-600">{error}</p>

  return (
    <div>
      {actionError && (
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2 mb-4">
          {actionError}
        </p>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search by email..."
        value={searchEmail}
        onChange={(e) => handleSearch(e.target.value)}
        className="border-2 border-border bg-card px-3 py-2 font-body text-sm focus:outline-none focus:border-ink w-full mb-4"
      />

      {/* Accounts list */}
      {accounts.length === 0 ? (
        <p className="font-body text-sm text-muted">No accounts found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((account) => (
            <div key={account.id} className="card px-4 py-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => void handleExpand(account.id)}
                  className="flex-1 text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <p className="font-display text-lg font-bold">{account.email}</p>
                  <p className="font-body text-xs text-muted">
                    <span
                      style={{
                        color: account.status === 'suspended' ? '#dc2626' : '#16a34a',
                        fontWeight: 700,
                      }}
                    >
                      {account.status}
                    </span>
                    {' '}&middot; ID #{account.id} &middot; {formatTimestamp(account.created_at)}
                  </p>
                </button>
                <button
                  onClick={() => void handleSuspend(account.id, account.status !== 'suspended')}
                  className="btn-outline text-xs shrink-0"
                  style={account.status === 'suspended'
                    ? { borderColor: '#16a34a', color: '#16a34a' }
                    : { borderColor: 'rgba(220,38,38,0.5)', color: '#dc2626' }
                  }
                >
                  {account.status === 'suspended' ? 'unsuspend' : 'suspend'}
                </button>
              </div>

              {/* Expanded: characters */}
              {expandedId === account.id && detail && (
                <div className="mt-3 ml-4 border-l-2 border-border pl-4">
                  <p className="eyebrow mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    Characters ({detail.characters.length})
                  </p>
                  {detail.characters.length === 0 ? (
                    <p className="font-body text-xs text-muted">No characters.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {detail.characters.map((character) => (
                        <div key={character.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <span className="font-body text-sm font-bold">{character.display_name}</span>
                            <span className="font-body text-xs text-muted ml-2">
                              @{character.username} &middot; {character.faction_slug}
                            </span>
                            <span
                              className="ml-2 font-body text-xs"
                              style={{
                                color: character.status === 'banned' ? '#dc2626'
                                  : character.status === 'paused' ? '#d97706'
                                  : '#16a34a',
                                fontWeight: 700,
                              }}
                            >
                              {character.status}
                            </span>
                          </div>
                          <button
                            onClick={() => void handleBan(character.id, character.status !== 'banned')}
                            className="btn-outline text-xs"
                            style={character.status === 'banned'
                              ? { borderColor: '#16a34a', color: '#16a34a', fontSize: 9, padding: '2px 8px' }
                              : { borderColor: 'rgba(220,38,38,0.5)', color: '#dc2626', fontSize: 9, padding: '2px 8px' }
                            }
                          >
                            {character.status === 'banned' ? 'unban' : 'ban'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
