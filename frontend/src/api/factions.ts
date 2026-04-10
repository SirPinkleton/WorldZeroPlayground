import api from './axios'

export interface FactionOut {
  slug: string
  name: string
  description: string | null
}

export async function getFactions(): Promise<FactionOut[]> {
  const res = await api.get<FactionOut[]>('/factions')
  return res.data
}

export async function updateFaction(slug: string, data: { name: string; description: string | null }): Promise<FactionOut> {
  const res = await api.put<FactionOut>(`/factions/${slug}`, data)
  return res.data
}
