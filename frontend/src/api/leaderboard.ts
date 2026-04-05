import api from './axios'
import type { CharacterOut } from './auth'

export async function getLeaderboard(params?: { limit?: number; offset?: number }): Promise<CharacterOut[]> {
  const { data } = await api.get<CharacterOut[]>('/leaderboard', { params })
  return data
}
