**Button** — World Zero's core action control; uppercase Courier Prime, hard corners, flat opacity hover. Use for every press action.

```jsx
<Button variant="primary" onClick={signUp}>sign up</Button>
<Button variant="outline" size="sm">logout</Button>
```

Variants: `primary` (solid ink, inverts in dark mode), `outline` (frosted + border). Sizes: `sm` (in-card sign-up), `md` (default), `lg` (hero CTA). Never render a `disabled` button for a permission gate — hide the control instead.
