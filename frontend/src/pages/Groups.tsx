// Faction data is static — rules live in game_config.py, no API needed for v1

const FACTIONS = [
  {
    slug: 'ua',
    name: 'University of Aesthematics',
    theme: 'The self and the other',
    colors: 'Purple and yellow',
    gameplay: 'Starter faction. Full points on all tasks. Must leave at level 3.',
    dotClass: 'bg-ua',
  },
  {
    slug: 'journeymen',
    name: 'The Journeymen',
    theme: 'Time and space',
    colors: 'Gold on blue',
    gameplay: 'Task Vision — access to select retired tasks flagged for Journeymen.',
    dotClass: 'bg-journeymen',
  },
  {
    slug: 'gestalt',
    name: 'Gestalt',
    theme: 'Sociology and psychology',
    colors: 'Gentle lilac and purple',
    gameplay: 'Collab with another faction\'s player → points as if in that faction. 1.1× own, 0.7× others.',
    dotClass: 'bg-gestalt',
  },
  {
    slug: 'geo',
    name: 'Geoanalogue',
    theme: 'Terrain and contact',
    colors: 'Earthen shades',
    gameplay: 'Double Dipper — repeat one task per level for points.',
    dotClass: 'bg-geo',
  },
  {
    slug: 'snide',
    name: 'S.N.I.D.E.',
    theme: 'Chaos and illusion',
    colors: 'Dastardly greens',
    gameplay: 'Bonus points from duels (+10%). Collaborate with a player without their knowledge.',
    dotClass: 'bg-snide',
  },
  {
    slug: 'cm',
    name: 'Creative Masters',
    theme: 'Interpretation and imagination',
    colors: 'Autumnal shades',
    gameplay: '80% points from all sources — intentional disadvantage to level the field.',
    dotClass: 'bg-cm',
  },
]

export default function Groups() {
  return (
    <div className="py-8">
      <h1 className="page-heading">Groups</h1>
      <p className="font-body text-sm text-muted mb-6">Factions are chosen at level 3. Until then, you start in the University of Aesthematics.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FACTIONS.map((f) => (
          <div key={f.slug} className="card p-5 flex flex-col gap-2 relative overflow-hidden transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${f.dotClass}`} />
            <div className="pl-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${f.dotClass}`} />
                <h2 className="font-display text-xl font-bold">{f.name}</h2>
              </div>
              <p className="font-body text-xs text-muted uppercase tracking-widest mb-2">{f.theme}</p>
              <p className="font-body text-sm text-ink leading-relaxed">{f.gameplay}</p>
              <p className="font-body text-xs text-muted mt-2">Colors: {f.colors}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
