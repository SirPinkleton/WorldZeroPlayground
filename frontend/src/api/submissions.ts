import api from './axios'

// ---------------------------------------------------------------------------
// Types — match backend schemas/submission.py exactly
// ---------------------------------------------------------------------------

export interface MediaItemOut {
  id: number
  type: string
  file_path: string
  display_order: number
}

export interface SubmissionMemberOut {
  character_id: number
  display_name: string
  faction_slug: string | null
  has_submitted: boolean
  title: string | null
  body_text: string | null
  joined_at: string
}

export interface SubmissionInviteOut {
  id: number
  submission_id: number
  inviter_id: number
  inviter_display_name: string
  invitee_id: number
  invitee_display_name: string
  invite_type: string
  status: string
  created_at: string
}

export interface SubmissionOut {
  id: number
  submission_type: string       // "solo" | "collaboration" | "duel"
  task_id: number
  task_title: string
  task_point_value: number
  task_faction_slug: string | null
  moderation_status: string
  is_withdrawn: boolean
  admin_note: string | null
  created_at: string
  updated_at: string
  // Solo fields
  character_id: number | null
  character_display_name: string | null
  character_avatar_url: string | null
  title: string | null
  body_text: string | null
  score: number | null
  media: MediaItemOut[]
  // Collab/duel fields
  collab_mode: string | null    // "collaboration" | "duel"
  collab_status: string | null  // "in_progress" | "published"
  created_by_id: number | null
  collab_body_text: string | null
  members: SubmissionMemberOut[]
  invites: SubmissionInviteOut[]
}

export interface SubmissionMemberCardOut {
  character_id: number
  display_name: string
  faction_slug: string | null
  score: number | null
}

export interface SubmissionCardOut {
  id: number
  task_id: number
  task_title: string
  task_faction_slug: string | null
  submission_type: string
  collab_mode: string | null
  collab_status: string | null
  created_at: string
  members: SubmissionMemberCardOut[]
}

export interface DuelVoteSummary {
  character_id: number
  display_name: string
  total_stars: number
  is_winning: boolean
}

// ---------------------------------------------------------------------------
// List / detail
// ---------------------------------------------------------------------------

export async function listSubmissions(params?: {
  type?: string
  task_id?: number
  character_id?: number
  moderation_status?: string
  is_flagged?: boolean
  limit?: number
  offset?: number
}): Promise<SubmissionOut[]> {
  const { data } = await api.get<SubmissionOut[]>('/submissions', { params })
  return data
}

/** Returns lightweight SubmissionCardOut list for published collab/duel. */
export async function listPublishedSubmissions(): Promise<SubmissionCardOut[]> {
  const { data } = await api.get<SubmissionCardOut[]>('/submissions', {
    params: { type: 'published' },
  })
  return data
}

export async function getSubmission(id: number): Promise<SubmissionOut> {
  const { data } = await api.get<SubmissionOut>(`/submissions/${id}`)
  return data
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface SoloSubmissionCreate {
  task_id: number
  title: string
  body_text?: string
  meta_task_id?: number
}

export async function createSoloSubmission(body: SoloSubmissionCreate): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>('/submissions', {
    submission_type: 'solo',
    task_id: body.task_id,
    title: body.title,
    body_text: body.body_text ?? null,
    meta_task_id: body.meta_task_id ?? null,
  })
  return data
}

export async function createCollabSubmission(
  task_id: number,
  mode: 'collaboration' | 'duel',
): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>('/submissions', {
    submission_type: mode,
    task_id,
    collab_mode: mode,
  })
  return data
}

// ---------------------------------------------------------------------------
// Edit / lifecycle (solo)
// ---------------------------------------------------------------------------

export async function updateSubmission(
  id: number,
  body: { title: string; body_text?: string },
): Promise<SubmissionOut> {
  const { data } = await api.put<SubmissionOut>(`/submissions/${id}`, body)
  return data
}

/** Withdraw a submission (pauses points and votes). */
export async function withdrawSubmission(id: number): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>(`/submissions/${id}/withdraw`)
  return data
}

export async function resubmitSubmission(id: number): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>(`/submissions/${id}/resubmit`)
  return data
}

/** Flag a submission for admin review. reason is sent as a query param. */
export async function flagSubmission(id: number, reason: string): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>(
    `/submissions/${id}/flag`,
    null,
    { params: { reason } },
  )
  return data
}

// ---------------------------------------------------------------------------
// Media (solo)
// ---------------------------------------------------------------------------

/** Upload a media file to a submission. Returns the created MediaItemOut. */
export async function addMedia(
  submissionId: number,
  file: File,
  display_order = 0,
): Promise<MediaItemOut> {
  const form = new FormData()
  form.append('file', file)
  form.append('display_order', String(display_order))
  const { data } = await api.post<MediaItemOut>(`/submissions/${submissionId}/media`, form)
  return data
}

/** Delete a media item from a submission. */
export async function deleteMedia(
  submissionId: number,
  mediaId: number,
): Promise<void> {
  await api.delete(`/submissions/${submissionId}/media/${mediaId}`)
}

// ---------------------------------------------------------------------------
// Collaboration / duel operations
// ---------------------------------------------------------------------------

export async function inviteMember(
  submissionId: number,
  invitee_character_id: number,
): Promise<SubmissionInviteOut> {
  const { data } = await api.post<SubmissionInviteOut>(
    `/submissions/${submissionId}/invite`,
    { invitee_character_id },
  )
  return data
}

export async function respondToInvite(
  submissionId: number,
  invite_id: number,
  accept: boolean,
  drop_task_id?: number,
): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>(
    `/submissions/${submissionId}/invites/${invite_id}/respond`,
    { accept, drop_task_id: drop_task_id ?? null },
  )
  return data
}

export async function submitForMember(submissionId: number): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>(`/submissions/${submissionId}/submit`)
  return data
}

export async function reopenSubmission(submissionId: number): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>(`/submissions/${submissionId}/reopen`)
  return data
}

export async function kickMember(
  submissionId: number,
  target_character_id: number,
): Promise<SubmissionOut> {
  const { data } = await api.post<SubmissionOut>(
    `/submissions/${submissionId}/kick/${target_character_id}`,
  )
  return data
}

/** Update the shared document body for a collab/duel submission. */
export async function updateDocument(
  submissionId: number,
  body_text: string,
): Promise<SubmissionOut> {
  const { data } = await api.put<SubmissionOut>(
    `/submissions/${submissionId}/document`,
    { body_text },
  )
  return data
}

/** Update the current member's individual proof (title + body_text). */
export async function updateMemberContent(
  submissionId: number,
  title: string,
  body_text: string | undefined,
): Promise<SubmissionOut> {
  const { data } = await api.put<SubmissionOut>(
    `/submissions/${submissionId}/my-content`,
    { title, body_text: body_text ?? null },
  )
  return data
}

// ---------------------------------------------------------------------------
// Voting (duel)
// ---------------------------------------------------------------------------

export async function getDuelVoteSummary(submissionId: number): Promise<DuelVoteSummary[]> {
  const { data } = await api.get<DuelVoteSummary[]>(`/submissions/${submissionId}/votes`)
  return data
}

export async function castDuelVote(
  submissionId: number,
  target_character_id: number,
  stars: number,
): Promise<void> {
  await api.post(`/submissions/${submissionId}/vote`, { target_character_id, stars })
}
