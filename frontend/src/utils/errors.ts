import type { AxiosError } from 'axios'

/**
 * Extracts a user-friendly error message from an axios error.
 *
 * Priority:
 *   1. FastAPI `detail` string from response body
 *   2. FastAPI `detail` array (Pydantic validation errors) — uses first item's msg
 *   3. Network error (no response) — connection message
 *   4. Caller-provided fallback, or generic default
 */
export function extractError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  const e = err as AxiosError<{ detail?: string | Array<{ msg: string }> }>

  if (e?.response?.data?.detail) {
    const d = e.response.data.detail
    if (typeof d === 'string') return d
    if (Array.isArray(d) && d[0]?.msg) return d[0].msg
  }

  if (e?.message === 'Network Error') {
    return 'Unable to reach the server. Check your connection and try again.'
  }

  return fallback
}
