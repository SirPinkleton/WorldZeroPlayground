**LevelNodes** — connected circle nodes for filtering by minimum level. Active node fills with ink and scales up.

```jsx
<LevelNodes levels={[0,1,2,3,4,5]} value={level} onChange={setLevel} />
```

Self-contained row; pair with a `level:` eyebrow label. Pass `value=""` for no filter.
