import api from './axios'

export interface TauntMessageOut {
  id: number
  from_character_id: number
  to_character_id: number
  message: string
  trigger_type: string
  created_at: string
  from_display_name: string
  from_faction_slug: string
  from_avatar_url: string | null
}

export async function getTaunts(limit?: number): Promise<TauntMessageOut[]> {
  const { data } = await api.get<TauntMessageOut[]>('/taunts', { params: { limit } })
  return data
}
