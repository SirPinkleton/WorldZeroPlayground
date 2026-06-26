**FactionTaskCard** — World Zero's signature component. Each faction renders a totally different physical card archetype; the card type IS the faction identity. Use anywhere a task surfaces.

```jsx
<FactionTaskCard faction="snide" title="DO A KICKFLIP" description="Do a kickflip. Bonus if you don't use a skateboard." level={2} points={25} onSignup={signUp} />
```

Factions → archetype: `ua` gilt salon (heraldic crest in a gold frame, Playfair italic) · `gestalt` gestalt.exe desktop window · `snide` ransom dispatch (photocopier ink, cut-out letters, always dark) · `ephemerists` the discordant map (vellum, feuding coordinate grids) · `singularity` terminal printout (always dark) · `everymen` union/victory poster. (`journeymen` is a legacy alias for `ephemerists`.) Place several in a `display:flex; flex-wrap:wrap; gap:1rem` container — varied sizes and slight rotations are intentional, never a strict grid. Omit `onSignup` to hide the sign-up button.
