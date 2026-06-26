**FactionCommentBox** — one comment / thread post, reskinned per faction. Comments are the one surface where all seven factions speak in the same thread, so each needs an unmistakable bubble: UA's gilt salon frame, the Warriors of Whimsy's whimsy.exe chat window, S.N.I.D.E.'s ransom slip, the Ephemerists' vellum marginalia, Singularity's terminal line, the Everymen's union entry, Albescent's register. The data model is identical (author / handle / timestamp / body / avatar); only the frame, type and avatar treatment change.

```jsx
<FactionCommentBox
  faction="snide"
  name="V. Slander" handle="@slander" meta="048H AGO"
  body="crossed it twice to prove it's rigged. it is. @no6 plant the evidence."
  avatar="https://randomuser.me/api/portraits/women/52.jpg"
/>
```

`@handle` runs inside `body` are auto-styled in the faction's voice. Renders the avatar + bubble as one flex row; wrap multiple in a column with `gap` to build a thread.
