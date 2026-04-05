import api from './axios'
import type { CharacterOut } from './auth'

export type { CharacterOut }

export interface CharacterCreate {
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  location?: string
}

export interface CharacterUpdate {
  display_name?: string
  bio?: string
  avatar_url?: string
  location?: string
}

export async function listCharacters(): Promise<CharacterOut[]> {
  const { data } = await api.get<CharacterOut[]>('/characters')
  return data
}

export async function getCharacter(id: number): Promise<CharacterOut> {
  const { data } = await api.get<CharacterOut>(`/characters/${id}`)
  return data
}

export async function createCharacter(body: CharacterCreate): Promise<CharacterOut> {
  const { data } = await api.post<CharacterOut>('/characters', body)
  return data
}

export async function updateCharacter(id: number, body: CharacterUpdate): Promise<CharacterOut> {
  const { data } = await api.put<CharacterOut>(`/characters/${id}`, body)
  return data
}
