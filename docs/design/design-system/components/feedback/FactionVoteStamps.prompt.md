**FactionVoteStamps** — World Zero's rating control. Five rectangular stamps (1–5) with word labels — a start / solid / good / excellent / legendary — and value-specific colors. Replaces star ratings everywhere. This is the generic/default rendering; each faction kit ships its own reskin of the same 1–5 model.

```jsx
<FactionVoteStamps value={3} average={3.6} totalVotes={12} onVote={cast} />
```

The active stamp fills with its color and shows an inner dashed border.
