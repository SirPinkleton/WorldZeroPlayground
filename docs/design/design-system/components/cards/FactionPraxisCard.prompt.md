**FactionPraxisCard** — the companion to `FactionTaskCard`. A *praxis* is a filed submission for a task; the faction then votes on it. Each faction reframes the 1–5 vote in its own vocabulary and renders the praxis in its own physical language.

```jsx
<FactionPraxisCard faction="ephemerists" task="Trace a Myth" finding="The Saint Was A Surveyor"
  author="Vesper" excerpt="Followed the legend back through eleven retellings until the road ran out…"
  rating={4.3} marks={47} points={100} level={4} />
```

Factions → praxis archetype + vote reframe: `ua` gilt salon placard (the Critique: rough sketch → masterwork) · `gestalt` praxis.exe window (heart marks: a start → legendary) · `snide` closed-case file (the mob's stamped marks) · `ephemerists` sealed ephemeris leaf (the concordance: apocryphal → canonical) · `singularity` terminal log (ascii rating bar) · `everymen` union work report (the crew's star marks). Place several in a `display:flex; flex-wrap:wrap; gap:1rem` container.
