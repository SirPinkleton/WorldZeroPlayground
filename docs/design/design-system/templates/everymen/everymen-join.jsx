/* ════════════════════════════════════════════════════════════════
   THE EVERYMEN — recruitment poster (join / selection screen)
   A WW2-enlistment "we want you" bill: pointing sigil seal, giant
   call to arms, what-you-get list, and an ENLIST cta. Reuses tokens +
   poster atoms. Theme-aware.
   ════════════════════════════════════════════════════════════════ */
function RecruitPoster() {
  const { EM_CogMark, EM_Sunburst, EM_Halftone } = window;
  const [joined, setJoined] = React.useState(false);
  return (
    <div style={{ position: "relative", overflow: "hidden", border: "3px solid var(--everymen-ink)",
      background: "var(--everymen-field)", color: "var(--everymen-cream)",
      boxShadow: "0 0 0 4px var(--everymen-paper), 0 0 0 6px var(--everymen-ink)" }}>
      <EM_Sunburst color="var(--everymen-field-deep)" from="50% 32%" opacity={0.55} step={7.5} />
      <EM_Halftone color="var(--everymen-cream)" opacity={0.09} />

      {/* gold top rule + kicker */}
      <div style={{ position: "relative", zIndex: 2, background: "var(--everymen-ink)", color: "var(--everymen-gold)",
        textAlign: "center", fontFamily: "var(--font-accent)", fontSize: 15, letterSpacing: "0.34em", padding: "7px 0" }}>
        THE EVERYMEN WANT YOU
      </div>
      <div style={{ height: 4, background: "var(--everymen-gold)", position: "relative", zIndex: 2 }} />

      <div style={{ position: "relative", zIndex: 2, padding: "30px 34px 32px", textAlign: "center" }}>
        {/* sigil seal */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{ width: 110, height: 110, borderRadius: "50%", background: "var(--everymen-cream)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 0 4px var(--everymen-ink), inset 0 0 0 6px var(--everymen-red)" }}>
            <EM_CogMark size={58} color="var(--everymen-red)" />
          </div>
        </div>

        <div style={{ fontFamily: "var(--font-accent)", fontSize: 60, lineHeight: 0.84, letterSpacing: "0.01em",
          color: "var(--everymen-cream)", textShadow: "3px 3px 0 var(--everymen-ink)" }}>
          PICK UP<br />THE LOAD
        </div>
        <div style={{ display: "inline-block", marginTop: 16, background: "var(--everymen-ink)", color: "var(--everymen-gold)",
          fontFamily: "var(--font-accent)", fontSize: 16, letterSpacing: "0.2em", padding: "4px 16px", whiteSpace: "nowrap" }}>UNITED · WE · STAND</div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.65, maxWidth: 420, margin: "18px auto 0",
          color: "var(--everymen-cream)" }}>
          No tricks, no inner circle, no waiting to be chosen. The Everymen do the work that's in front of them and finish what they start. If you'll put in the shift, there's a place for you.
        </p>

        {/* what you get */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 380, margin: "22px auto 0", textAlign: "left" }}>
          {[
            "Honest tasks with honest points",
            "A faction that finishes what it starts",
            "Your work stamped by the people beside you",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderTop: "1px dashed color-mix(in srgb, var(--everymen-cream) 35%, transparent)" }}>
              <span style={{ flexShrink: 0, width: 22, height: 22, background: "var(--everymen-gold)", color: "var(--everymen-ink)",
                display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-accent)", fontSize: 14 }}>✓</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--everymen-cream)" }}>{t}</span>
            </div>
          ))}
        </div>

        {/* enlist */}
        <button onClick={() => setJoined(!joined)} style={{
          marginTop: 26, width: "100%", maxWidth: 380, border: "2px solid var(--everymen-ink)", cursor: "pointer",
          fontFamily: "var(--font-accent)", fontSize: 26, letterSpacing: "0.12em", padding: "12px",
          background: joined ? "var(--everymen-olive)" : "var(--everymen-gold)", color: "var(--everymen-ink)",
          transition: "background 150ms",
        }}>{joined ? "✓ ENLISTED — WELCOME" : "ENLIST NOW ▸"}</button>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--everymen-cream)", opacity: 0.8, marginTop: 11 }}>1,204 hands already on the line</div>
      </div>
    </div>
  );
}

Object.assign(window, { RecruitPoster });
