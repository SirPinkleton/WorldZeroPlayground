import api from './axios'

export interface MetaTaskOut {
  id: number
  name: string
  description: string
  faction_slug: string
  bonus_type: string
  bonus_value: number
  level_required: number
}

export async function getMetaTasks(taskId: number): Promise<MetaTaskOut[]> {
  const { data } = await api.get<MetaTaskOut[]>('/meta-tasks', { params: { task_id: taskId } })
  return data
}
