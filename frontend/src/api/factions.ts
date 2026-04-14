import api from './axios'

export interface FactionOut {
  slug: string
  name: string
  description: string | null
}

export interface FactionStatusOut {
  slug: string
  name: string
  status: string // member, invited, not_invited, defected, can_return
}

export interface FactionPageOut {
  current_faction_slug: string
  all_factions: FactionStatusOut[]
}

export interface InvitationLetterOut {
  faction_slug: string
  faction_name: string
  delivered_at: string
}

export async function getFactions(): Promise<FactionOut[]> {
  const res = await api.get<FactionOut[]>('/factions')
  return res.data
}

export async function updateFaction(slug: string, data: { name: string; description: string | null }): Promise<FactionOut> {
  const res = await api.put<FactionOut>(`/factions/${slug}`, data)
  return res.data
}

export async function getFactionStatus(): Promise<FactionPageOut> {
  const res = await api.get<FactionPageOut>('/factions/status')
  return res.data
}

export async function getInvitations(): Promise<InvitationLetterOut[]> {
  const res = await api.get<InvitationLetterOut[]>('/factions/invitations')
  return res.data
}

export async function chooseFaction(factionSlug: string): Promise<FactionOut> {
  const res = await api.post<FactionOut>('/factions/choose', { faction_slug: factionSlug })
  return res.data
}
