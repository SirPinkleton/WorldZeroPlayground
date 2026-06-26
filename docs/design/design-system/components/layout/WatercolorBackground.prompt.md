**WatercolorBackground** — the full-bleed paint-bleed backdrop present on every World Zero page. Blurred SVG ellipses in four corners; opacity dims automatically in dark mode.

```jsx
<div style={{ position: "relative", minHeight: "100vh" }}>
  <WatercolorBackground />
  <main style={{ position: "relative", zIndex: 5 }}>…</main>
</div>
```

Use `fixed={false}` when scoping it inside a `position:relative` container instead of the viewport.
