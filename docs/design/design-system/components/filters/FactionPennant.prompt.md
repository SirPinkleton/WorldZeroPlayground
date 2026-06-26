**FactionPennant** — diagonal pennant tab in a faction's color, for faction filters. Always full saturation; inactive drops opacity.

```jsx
<FactionPennant slug="snide" name="S.N.I.D.E." active={faction === "snide"} onClick={() => toggle("snide")} />
```

Render the seven factions in a flex row with a `faction:` eyebrow.
