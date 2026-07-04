/**
 * Guards Albescent's first-class identity (#232): the albescent→ua alias is
 * dropped, so faction dispatch and CSS both resolve to albescent's own tokens.
 * FACTION_ALIASES is now empty (aged_out retired with #428). If someone re-adds
 * an albescent alias, these fail.
 */
import { describe, it, expect } from 'vitest'
import { FACTION_ALIASES, factionCssVar, factionColor } from '../factions'

describe('Albescent is first-class (#232)', () => {
  it('is no longer an alias', () => {
    expect(FACTION_ALIASES['albescent']).toBeUndefined()
  })

  it('factionCssVar resolves albescent to its own tokens, not ua', () => {
    expect(factionCssVar('albescent', 'card-bg')).toBe('var(--faction-albescent-card-bg)')
    expect(factionCssVar('albescent', 'border')).toBe('var(--faction-albescent-border)')
    // bare (primary) must resolve to the albescent var, not fall back to ua
    expect(factionCssVar('albescent')).toBe('var(--faction-albescent)')
  })

  it('albescent raw color is the near-black ink, no hue', () => {
    expect(factionColor('albescent')).toBe('#1c1c1a')
  })
})
