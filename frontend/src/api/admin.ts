import api from './axios'
import type { TaskOut } from './tasks'
import type { SubmissionOut } from './submissions'

export interface PendingTaskOut extends TaskOut {
  created_by_name: string
}

export interface ContactMessageOut {
  id: number
  name: string
  email: string
  message: string
  is_archived: boolean
  created_at: string
}

export interface OverviewStats {
  accounts: number
  characters: number
  active_tasks: number
  submissions: number
  votes: number
  flagged_submissions: number
  suspended_accounts: number
}

export interface AccountSummary {
  id: number
  email: string
  status: string
  created_at: string
}

export interface CharacterBrief {
  id: number
  username: string
  display_name: string
  faction_slug: string
  status: string
}

export interface AccountDetail extends AccountSummary {
  characters: CharacterBrief[]
}

// ---------------------------------------------------------------------------
// Read / Inspect
// ---------------------------------------------------------------------------

export async function getOverview(): Promise<OverviewStats> {
  const { data } = await api.get<OverviewStats>('/admin/overview')
  return data
}

export async function getPendingTasks(): Promise<PendingTaskOut[]> {
  const { data } = await api.get<PendingTaskOut[]>('/admin/tasks/pending')
  return data
}

export async function getMessages(archived = false): Promise<ContactMessageOut[]> {
  const { data } = await api.get<ContactMessageOut[]>('/admin/messages', { params: { archived } })
  return data
}

export async function getFlaggedSubmissions(): Promise<SubmissionOut[]> {
  const { data } = await api.get<SubmissionOut[]>('/submissions', { params: { moderation_status: 'flagged' } })
  return data
}

export async function getAccounts(email?: string): Promise<AccountSummary[]> {
  const { data } = await api.get<AccountSummary[]>('/admin/accounts', { params: email ? { email } : {} })
  return data
}

export async function getAccountDetail(id: number): Promise<AccountDetail> {
  const { data } = await api.get<AccountDetail>(`/admin/accounts/${id}`)
  return data
}

export async function getAllTasks(): Promise<TaskOut[]> {
  const { data } = await api.get<TaskOut[]>('/tasks')
  return data
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function approveTask(id: number): Promise<TaskOut> {
  const { data } = await api.put<TaskOut>(`/admin/tasks/${id}/approve`)
  return data
}

export async function retireTask(id: number): Promise<TaskOut> {
  const { data } = await api.put<TaskOut>(`/admin/tasks/${id}/retire`)
  return data
}

export async function updateTaskStatus(id: number, status: string): Promise<TaskOut> {
  const { data } = await api.put<TaskOut>(`/admin/tasks/${id}/status`, { status })
  return data
}

export async function moderateSubmission(
  id: number,
  status: string,
  adminNote?: string,
): Promise<SubmissionOut> {
  const { data } = await api.patch<SubmissionOut>(`/admin/submissions/${id}/moderate`, {
    status,
    admin_note: adminNote || null,
  })
  return data
}

export async function archiveMessage(id: number): Promise<ContactMessageOut> {
  const { data } = await api.patch<ContactMessageOut>(`/admin/messages/${id}/archive`)
  return data
}

export async function suspendAccount(id: number, suspended: boolean): Promise<void> {
  await api.post(`/admin/accounts/${id}/suspend`, { suspended })
}

export async function banCharacter(id: number, banned: boolean): Promise<void> {
  await api.post(`/admin/characters/${id}/ban`, { banned })
}
