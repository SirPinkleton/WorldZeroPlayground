import api from './axios'

export interface CharacterOut {
  id: number
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  location: string | null
  level: number
  score: number
  all_time_score: number
  faction_slug: string | null
  created_at: string
}

export interface CurrentUser {
  account_id: number
  character: CharacterOut | null
  is_admin: boolean
  /** Server-computed: this account meets the rules to create another character. */
  can_create_additional_character: boolean
  /** Server-computed: this account meets the rules to start a new character in /Albescent. */
  can_start_as_albescent: boolean
}

export async function getMe(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>('/auth/me')
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

/** Redirect the browser to start the Google OAuth flow */
export function loginWithGoogle(): void {
  window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/auth/google`
}

/** Dev-only: log in as a test account without Google OAuth */
export async function devLogin(): Promise<void> {
  await api.post('/auth/dev-login')
}
