import type { AxiosError } from 'axios'

/**
 * Extracts a user-friendly error message from an axios error.
 *
 * Priority:
 *   1. FastAPI `detail` string from response body (skip generic "Internal Server Error")
 *   2. FastAPI `detail` array (Pydantic validation errors) — uses first item's msg
 *   3. Server error (5xx) with no useful detail — server-side problem message
 *   4. Network error (no response at all) — connection message
 *   5. Caller-provided fallback, or generic default
 */
export function extractError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  const e = err as AxiosError<{ detail?: string | Array<{ msg: string }> }>

  const status = e?.response?.status
  const detail = e?.response?.data?.detail

  // Surface meaningful detail strings from the backend (e.g. "Task requires level 3")
  if (detail) {
    if (typeof detail === 'string' && detail !== 'Internal Server Error') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  }

  // 5xx with no useful detail — the server hit an unhandled error
  if (status && status >= 500) {
    return 'The server ran into an unexpected problem. Try again in a moment.'
  }

  // 4xx we didn't already handle (missing detail, unusual format)
  if (status && status >= 400) {
    return fallback
  }

  // No response object at all — genuine network failure
  if (e?.message === 'Network Error' || !e?.response) {
    return 'Unable to reach the server. Check your connection and try again.'
  }

  return fallback
}
