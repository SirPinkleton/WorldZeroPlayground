// Faction data is static — rules live in game_config.py, no API needed for v1
import PageTitle from '../components/ui/PageTitle'

import PageTitle from '../components/ui/PageTitle'
const FACTIONS = [
import PageTitle from '../components/ui/PageTitle'
  {
import PageTitle from '../components/ui/PageTitle'
    slug: 'ua',
import PageTitle from '../components/ui/PageTitle'
    name: 'University of Aesthematics',
import PageTitle from '../components/ui/PageTitle'
    theme: 'The self and the other',
import PageTitle from '../components/ui/PageTitle'
    colors: 'Purple and yellow',
import PageTitle from '../components/ui/PageTitle'
    gameplay: 'Starter faction. Full points on all tasks. Must leave at level 3.',
import PageTitle from '../components/ui/PageTitle'
    dotClass: 'bg-ua',
import PageTitle from '../components/ui/PageTitle'
  },
import PageTitle from '../components/ui/PageTitle'
  {
import PageTitle from '../components/ui/PageTitle'
    slug: 'journeymen',
import PageTitle from '../components/ui/PageTitle'
    name: 'The Journeymen',
import PageTitle from '../components/ui/PageTitle'
    theme: 'Time and space',
import PageTitle from '../components/ui/PageTitle'
    colors: 'Gold on blue',
import PageTitle from '../components/ui/PageTitle'
    gameplay: 'Task Vision — access to select retired tasks flagged for Journeymen.',
import PageTitle from '../components/ui/PageTitle'
    dotClass: 'bg-journeymen',
import PageTitle from '../components/ui/PageTitle'
  },
import PageTitle from '../components/ui/PageTitle'
  {
import PageTitle from '../components/ui/PageTitle'
    slug: 'gestalt',
import PageTitle from '../components/ui/PageTitle'
    name: 'Gestalt',
import PageTitle from '../components/ui/PageTitle'
    theme: 'Sociology and psychology',
import PageTitle from '../components/ui/PageTitle'
    colors: 'Gentle lilac and purple',
import PageTitle from '../components/ui/PageTitle'
    gameplay: 'Collab with another faction\'s player → points as if in that faction. 1.1× own, 0.7× others.',
import PageTitle from '../components/ui/PageTitle'
    dotClass: 'bg-gestalt',
import PageTitle from '../components/ui/PageTitle'
  },
import PageTitle from '../components/ui/PageTitle'
  {
import PageTitle from '../components/ui/PageTitle'
    slug: 'geo',
import PageTitle from '../components/ui/PageTitle'
    name: 'Geoanalogue',
import PageTitle from '../components/ui/PageTitle'
    theme: 'Terrain and contact',
import PageTitle from '../components/ui/PageTitle'
    colors: 'Earthen shades',
import PageTitle from '../components/ui/PageTitle'
    gameplay: 'Double Dipper — repeat one task per level for points.',
import PageTitle from '../components/ui/PageTitle'
    dotClass: 'bg-geo',
import PageTitle from '../components/ui/PageTitle'
  },
import PageTitle from '../components/ui/PageTitle'
  {
import PageTitle from '../components/ui/PageTitle'
    slug: 'snide',
import PageTitle from '../components/ui/PageTitle'
    name: 'S.N.I.D.E.',
import PageTitle from '../components/ui/PageTitle'
    theme: 'Chaos and illusion',
import PageTitle from '../components/ui/PageTitle'
    colors: 'Dastardly greens',
import PageTitle from '../components/ui/PageTitle'
    gameplay: 'Bonus points from duels (+10%). Collaborate with a player without their knowledge.',
import PageTitle from '../components/ui/PageTitle'
    dotClass: 'bg-snide',
import PageTitle from '../components/ui/PageTitle'
  },
import PageTitle from '../components/ui/PageTitle'
  {
import PageTitle from '../components/ui/PageTitle'
    slug: 'cm',
import PageTitle from '../components/ui/PageTitle'
    name: 'Creative Masters',
import PageTitle from '../components/ui/PageTitle'
    theme: 'Interpretation and imagination',
import PageTitle from '../components/ui/PageTitle'
    colors: 'Autumnal shades',
import PageTitle from '../components/ui/PageTitle'
    gameplay: '80% points from all sources — intentional disadvantage to level the field.',
import PageTitle from '../components/ui/PageTitle'
    dotClass: 'bg-cm',
import PageTitle from '../components/ui/PageTitle'
  },
import PageTitle from '../components/ui/PageTitle'
]
import PageTitle from '../components/ui/PageTitle'

import PageTitle from '../components/ui/PageTitle'
export default function Groups() {
import PageTitle from '../components/ui/PageTitle'
  return (
import PageTitle from '../components/ui/PageTitle'
    <div className="py-8">
import PageTitle from '../components/ui/PageTitle'
      <PageTitle title="Groups" />
import PageTitle from '../components/ui/PageTitle'
      <p className="font-body text-sm text-muted mb-6">Factions are chosen at level 3. Until then, you start in the University of Aesthematics.</p>
import PageTitle from '../components/ui/PageTitle'

import PageTitle from '../components/ui/PageTitle'
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
import PageTitle from '../components/ui/PageTitle'
        {FACTIONS.map((f) => (
import PageTitle from '../components/ui/PageTitle'
          <div key={f.slug} className="card p-5 flex flex-col gap-2 relative overflow-hidden transition-all">
import PageTitle from '../components/ui/PageTitle'
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${f.dotClass}`} />
import PageTitle from '../components/ui/PageTitle'
            <div className="pl-2">
import PageTitle from '../components/ui/PageTitle'
              <div className="flex items-center gap-2 mb-1">
import PageTitle from '../components/ui/PageTitle'
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${f.dotClass}`} />
import PageTitle from '../components/ui/PageTitle'
                <h2 className="font-display text-xl font-bold">{f.name}</h2>
import PageTitle from '../components/ui/PageTitle'
              </div>
import PageTitle from '../components/ui/PageTitle'
              <p className="font-body text-xs text-muted uppercase tracking-widest mb-2">{f.theme}</p>
import PageTitle from '../components/ui/PageTitle'
              <p className="font-body text-sm text-ink leading-relaxed">{f.gameplay}</p>
import PageTitle from '../components/ui/PageTitle'
              <p className="font-body text-xs text-muted mt-2">Colors: {f.colors}</p>
import PageTitle from '../components/ui/PageTitle'
            </div>
import PageTitle from '../components/ui/PageTitle'
          </div>
import PageTitle from '../components/ui/PageTitle'
        ))}
import PageTitle from '../components/ui/PageTitle'
      </div>
import PageTitle from '../components/ui/PageTitle'
    </div>
import PageTitle from '../components/ui/PageTitle'
  )
import PageTitle from '../components/ui/PageTitle'
}
import PageTitle from '../components/ui/PageTitle'
