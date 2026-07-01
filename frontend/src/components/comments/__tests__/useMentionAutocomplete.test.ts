import { describe, expect, it } from 'vitest'
import { getActiveMention, insertMention } from '../useMentionAutocomplete'

describe('getActiveMention', () => {
  it('detects a token at input start', () => {
    expect(getActiveMention('@mo', 3)).toEqual({ query: 'mo', start: 0, end: 3 })
  })

  it('detects a token after whitespace', () => {
    expect(getActiveMention('hi @mo', 6)).toEqual({ query: 'mo', start: 3, end: 6 })
  })

  it('does NOT trigger on an email (@ preceded by a non-space)', () => {
    expect(getActiveMention('email@x', 7)).toBeNull()
    expect(getActiveMention('a@bob', 5)).toBeNull()
  })

  it('returns an empty query for a bare "@" (caller suppresses the fetch)', () => {
    expect(getActiveMention('hi @', 4)).toEqual({ query: '', start: 3, end: 4 })
  })

  it('returns null when the caret is not inside a mention', () => {
    expect(getActiveMention('hi bob', 6)).toBeNull()
    expect(getActiveMention('', 0)).toBeNull()
  })

  it('spans the whole token when the caret sits mid-token', () => {
    // caret after "mol" but the token continues to "molly"
    expect(getActiveMention('@molly', 4)).toEqual({ query: 'molly', start: 0, end: 6 })
  })

  it('stops the token at non-token chars', () => {
    expect(getActiveMention('@mo! rest', 3)).toEqual({ query: 'mo', start: 0, end: 3 })
  })
})

describe('insertMention', () => {
  it('replaces the token with "@username " and puts the caret after it', () => {
    const active = getActiveMention('hi @mo', 6)!
    expect(insertMention('hi @mo', active, 'molly')).toEqual({
      next: 'hi @molly ',
      caret: 10,
    })
  })

  it('preserves text after the replaced token', () => {
    const active = getActiveMention('see @mo now', 6)!
    const { next, caret } = insertMention('see @mo now', active, 'molly')
    expect(next).toBe('see @molly  now')
    // caret lands right after "@molly " (before the original trailing text)
    expect(next.slice(0, caret)).toBe('see @molly ')
  })
})
