import api from './axios'

export interface MessageOut {
  id: number
  from_character_id: number
  to_character_id: number
  body: string
  read_at: string | null
  created_at: string
}

export async function getMessages(): Promise<MessageOut[]> {
  const { data } = await api.get<MessageOut[]>('/messages')
  return data
}

export async function sendMessage(to_character_id: number, body: string): Promise<MessageOut> {
  const { data } = await api.post<MessageOut>('/messages', { to_character_id, body })
  return data
}

export async function getMessage(id: number): Promise<MessageOut> {
  const { data } = await api.get<MessageOut>(`/messages/${id}`)
  return data
}
