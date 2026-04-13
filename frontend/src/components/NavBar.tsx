import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { loginWithGoogle, logout } from '../api/auth'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/tasks', label: 'Tasks' },
  { to: '/submissions', label: 'Praxis' },
  { to: '/leaderboard', label: 'Players' },
  { to: '/factions', label: 'Factions' },
  { to: '/updates', label: 'Updates' },
]

/** Nav link style — Courier Prime 10px uppercase (Style Guide §5.1) */
const NAV_LINK_BASE = {
  fontFamily: "'Courier Prime', monospace",
  fontSize: 10,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  paddingBottom: 2,
}

export default function NavBar() {
  const { user, refetch } = useAuth()

  const handleLogout = async () => {
    await logout()
    await refetch()
  }

  return (
    <nav
      className="sticky top-0"
      style={{
        zIndex: 10,
        background: 'rgba(247, 244, 238, 0.88)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* Wordmark — Lora italic with rainbow gradient underline */}
        <NavLink to="/" className="shrink-0 leading-none" style={{ textDecoration: 'none' }}>
          <span
            className="font-display italic"
            style={{
              fontSize: 19,
              color: 'var(--color-text-primary)',
              display: 'inline-block',
              borderBottom: '2px solid transparent',
              backgroundImage: 'linear-gradient(var(--color-bg-page), var(--color-bg-page)), linear-gradient(90deg, #4f46e5, #be185d, #f97316, #16a34a)',
              backgroundSize: '100% calc(100% - 2px), 100% 2px',
              backgroundPosition: 'top, bottom',
              backgroundRepeat: 'no-repeat',
              paddingBottom: 2,
            }}
          >
            World Zero
          </span>
        </NavLink>

        {/* Nav links */}
        <ul className="flex gap-5 flex-1 list-none">
          {links.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className="transition-colors"
                style={({ isActive }) => ({
                  ...NAV_LINK_BASE,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  borderBottom: isActive ? '1.5px solid var(--color-text-primary)' : '1.5px solid transparent',
                })}
              >
                {label}
              </NavLink>
            </li>
          ))}
          {user?.is_admin && (
            <li>
              <NavLink
                to="/admin"
                className="transition-colors"
                style={({ isActive }) => ({
                  ...NAV_LINK_BASE,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  borderBottom: isActive ? '1.5px solid var(--color-text-primary)' : '1.5px solid transparent',
                })}
              >
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        {/* User area */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              {user.character ? (
                <NavLink
                  to={`/characters/${user.character.id}/edit`}
                  className="font-body transition-colors"
                  style={{
                    fontSize: 10,
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {user.character.display_name}
                </NavLink>
              ) : (
                <NavLink
                  to="/characters/create"
                  className="font-body transition-colors"
                  style={{
                    fontSize: 10,
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '0.08em',
                  }}
                >
                  create character
                </NavLink>
              )}
              <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.25rem 0.75rem' }}>
                logout
              </button>
            </>
          ) : (
            <button onClick={loginWithGoogle} className="btn-primary">
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
