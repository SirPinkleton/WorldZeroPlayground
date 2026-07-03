/**
 * Guards Albescent's first-class identity (#232): the albescent→ua alias is
 * dropped, so faction dispatch and CSS both resolve to albescent's own tokens.
 * aged_out still aliases ua. If someone re-adds the alias, these fail.
 */
import { describe, it, expect } from 'vitest'
import { FACTION_ALIASES, factionCssVar, factionColor } from '../factions'

describe('Albescent is first-class (#232)', () => {
  it('is no longer an alias; aged_out still is', () => {
    expect(FACTION_ALIASES['albescent']).toBeUndefined()
    expect(FACTION_ALIASES['aged_out']).toBe('ua')
  })

  it('factionCssVar resolves albescent to its own tokens, not ua', () => {
    expect(factionCssVar('albescent', 'card-bg')).toBe('var(--faction-albescent-card-bg)')
    expect(factionCssVar('albescent', 'border')).toBe('var(--faction-albescent-border)')
    // bare (primary) must resolve to the albescent var, not fall back to ua
    expect(factionCssVar('albescent')).toBe('var(--faction-albescent)')
  })

  it('aged_out still resolves to ua tokens via the alias', () => {
    expect(factionCssVar('aged_out', 'card-bg')).toBe('var(--faction-ua-card-bg)')
  })

  it('albescent raw color is the near-black ink, no hue', () => {
    expect(factionColor('albescent')).toBe('#1c1c1a')
  })
})
