import api from './axios'

export interface VoteOut {
  id: number
  submission_id: number
  voter_character_id: number
  stars: number
  created_at: string
  updated_at: string
}

export interface VoteSummary {
  submission_id: number
  total_votes: number
  average_stars: number
  total_score: number
}

export async function castVote(submissionId: number, stars: number): Promise<VoteOut> {
  const { data } = await api.post<VoteOut>(`/submissions/${submissionId}/vote`, { stars })
  return data
}

export async function getVotes(submissionId: number): Promise<VoteSummary> {
  const { data } = await api.get<VoteSummary>(`/submissions/${submissionId}/votes`)
  return data
}
