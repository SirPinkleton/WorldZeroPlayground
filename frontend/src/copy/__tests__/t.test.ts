import { describe, it, expect } from 'vitest'
import { t, en } from '../en'

describe('t()', () => {
  it('resolves a nested key', () => {
    expect(t('vote.ephemerists.plausible')).toBe('plausible')
  })

  it('interpolates a {{var}}', () => {
    expect(t('form.charLimit.reached', { max: 200 })).toBe('200-character limit reached')
  })

  it('interpolates multiple {{vars}}', () => {
    expect(t('form.charLimit.approaching', { remaining: 42 })).toBe('42 characters remaining')
  })

  it('throws on a missing key', () => {
    // @ts-expect-error — deliberate invalid key for runtime test
    expect(() => t('vote.ephemerists.nonexistent')).toThrow('[t] missing catalog key')
  })

  it('throws on a missing interpolation var', () => {
    expect(() => t('form.charLimit.reached', {})).toThrow('{{max}}')
  })

  it('resolves a kebab key for multi-word labels', () => {
    expect(t('vote.everymen.a-start')).toBe('a start')
    expect(t('vote.snide.not-bad')).toBe('not bad')
  })

  it('resolves preserved-case values for all-caps labels', () => {
    expect(t('vote.singularity.verified')).toBe('VERIFIED')
    expect(t('vote.snide.anarchy')).toBe('ANARCHY')
  })

  it('resolves the salon-critique values for UA labels', () => {
    expect(t('vote.ua.masterwork')).toBe('masterwork')
    expect(t('vote.ua.distinguished')).toBe('distinguished')
  })
})

describe('en catalog shape', () => {
  const FACTION_SLUGS = ['ephemerists', 'everymen', 'wow', 'snide', 'singularity', 'ua'] as const
  const EXPECTED_TIER_COUNT = 5

  it('has a vote entry for every registered faction', () => {
    for (const slug of FACTION_SLUGS) {
      expect(en.vote).toHaveProperty(slug)
    }
  })

  it('has exactly 5 tier entries per faction', () => {
    for (const slug of FACTION_SLUGS) {
      const tiers = Object.keys(en.vote[slug])
      expect(tiers).toHaveLength(EXPECTED_TIER_COUNT)
    }
  })

  it('has non-empty string values for every tier', () => {
    for (const slug of FACTION_SLUGS) {
      for (const value of Object.values(en.vote[slug])) {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      }
    }
  })

  it('has the form.charLimit keys referenced by ADR-0010', () => {
    expect(en.form.charLimit).toHaveProperty('reached')
    expect(en.form.charLimit).toHaveProperty('approaching')
  })

  it('has the praxis.charLimit.terminal key referenced by ADR-0010', () => {
    expect(en.praxis.charLimit).toHaveProperty('terminal')
  })
})
