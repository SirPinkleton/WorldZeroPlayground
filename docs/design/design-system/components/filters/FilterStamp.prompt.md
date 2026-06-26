**FilterStamp** — rectangular rubber-stamp toggle for status filters (All / active / retired / pending). Hard corners, inner dashed border.

```jsx
<FilterStamp label="active" active={status === "active"} onClick={() => setStatus("active")} />
```

Lay several out in a flex row with a `status:` eyebrow label.
