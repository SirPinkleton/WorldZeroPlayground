import React from "react";
import { canonicalSlug } from "../core/factions.js";

/**
 * FactionCommentBox — a single comment / thread post, reskinned per faction.
 *
 * Comments are the one surface where every faction speaks in the SAME thread,
 * so each faction needs an unmistakable bubble. The data model is identical
 * (author, handle, timestamp, body with @mentions, avatar); only the frame,
 * type and avatar treatment change:
 *
 *   ua          → gilt salon frame (gold leaf border, Cormorant italic)
 *   wow         → whimsy.exe chat window (pink titlebar + window buttons)
 *   snide       → ransom slip (black dispatch card, tape strip, Special Elite)
 *   ephemerists → marginalia (vellum, gold rule, EB Garamond italic)
 *   singularity → terminal line ( > handle@signal, blinking cursor )
 *   everymen    → union entry (red poster header bar, Bebas)
 *   albescent   → the register (white vellum card, Cormorant)
 *
 * Mentions (@handle) are auto-styled in the faction's voice. Built entirely on
 * global tokens so it flips light/dark with the rest of the system.
 */

const MENTION_STYLE = {
  ua: { color: "#c8601a", fontWeight: 700 },
  wow: { color: "#d23b7e", fontWeight: 700 },
  snide: { color: "#14110b", fontWeight: 700, background: "#b6ff2e", padding: "0 3px" },
  ephemerists: { color: "var(--eph-rubric)", fontStyle: "italic", fontWeight: 600 },
  singularity: { color: "#60a5fa", fontWeight: 700 },
  everymen: { color: "#d12027", fontWeight: 700 },
  albescent: { color: "#1c1c1a", borderBottom: "1px solid rgba(28,28,26,.4)", fontWeight: 600 },
};

const AVATAR_SKIN = {
  ua: { borderRadius: "50%", filter: "sepia(.3)", border: "2px solid #c9962f", boxShadow: "0 0 0 1px #a9781f, 0 0 0 3px #f0e2c0" },
  wow: { borderRadius: "8px", border: "2px solid #ec5f99", boxShadow: "2px 2px 0 #fbcfe2" },
  snide: { filter: "grayscale(1) contrast(1.5)", border: "1.5px solid #14110b" },
  ephemerists: { borderRadius: "50%", filter: "sepia(.5)", border: "2px solid #b0863a", boxShadow: "0 0 0 1px #2a1d12" },
  singularity: { filter: "grayscale(1) sepia(1) hue-rotate(175deg) saturate(2.6) brightness(.82)", border: "1px solid #60a5fa" },
  everymen: { filter: "grayscale(1) contrast(1.2) sepia(.25)", border: "2px solid #221a12" },
  albescent: { borderRadius: "50%", filter: "grayscale(1) brightness(1.05)" },
};

function Body({ body, faction }) {
  if (body == null) return null;
  const ms = MENTION_STYLE[faction] || { color: "var(--color-text-link)", fontWeight: 700 };
  return String(body)
    .split(/(@\w+)/g)
    .map((part, i) => (part[0] === "@" ? <span key={i} style={ms}>{part}</span> : <span key={i}>{part}</span>));
}

function Avatar({ faction, src, size = 42 }) {
  const base = { width: size, height: size, objectFit: "cover", display: "block", flex: "none" };
  return <img src={src} alt="" style={{ ...base, ...(AVATAR_SKIN[faction] || {}) }} />;
}

/* ── per-faction bubble bodies (avatar is rendered by the row wrapper) ── */

function UaBubble({ name, meta, body }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: 4, borderRadius: 5, background: "linear-gradient(135deg,#ecd089 0%,#c9962f 26%,#a9781f 50%,#e3c06a 76%,#c9a23c 100%)", boxShadow: "0 2px 11px rgba(150,108,32,.28)" }}>
      <div style={{ background: "#f9f2e2", border: "1px solid rgba(176,122,58,.4)", borderRadius: 3, padding: "13px 16px 14px" }}>
        <div style={{ fontFamily: "var(--font-faction-engraved)", fontSize: 8, letterSpacing: ".22em", textTransform: "uppercase", color: "#c8601a" }}>University of Asthmatics</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: "var(--font-faction-codex-script)", fontStyle: "italic", fontWeight: 600, fontSize: 21, color: "#2a1a10", lineHeight: 1 }}>{name}</span>
          <span style={{ fontFamily: "var(--font-faction-engraved)", fontSize: 7, letterSpacing: ".14em", textTransform: "uppercase", color: "#b07a3a", border: "1px solid rgba(201,150,47,.65)", padding: "1px 5px" }}>UA</span>
          <span style={{ fontFamily: "var(--font-faction-codex-script)", fontStyle: "italic", fontSize: 12, color: "#b07a3a", marginLeft: "auto" }}>{meta}</span>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,#c9962f,transparent)", margin: "9px 0" }} />
        <div style={{ fontFamily: "var(--font-faction-codex-script)", fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: "#3a2616" }}><Body body={body} faction="ua" /></div>
      </div>
    </div>
  );
}

function WowBubble({ name, handle, meta, body }) {
  return (
    <div style={{ flex: 1, minWidth: 0, position: "relative", background: "var(--gestalt-card-bg)", border: "2px solid var(--gestalt-pink-deep)", borderRadius: 8, boxShadow: "4px 4px 0 var(--gestalt-pink-lt)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(#f9b6d4,#ec5f99)", padding: "4px 9px", borderBottom: "2px solid #d23b7e" }}>
        <span style={{ fontFamily: "var(--font-faction-script)", fontSize: 18, color: "#fff", textShadow: "1px 1px 0 #a83a6e", lineHeight: .9 }}>✦ {name}.exe</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
          <span style={{ width: 11, height: 11, background: "#fff", border: "1.5px solid #a83a6e", borderRadius: 3 }} />
          <span style={{ width: 11, height: 11, background: "#fde2ee", border: "1.5px solid #a83a6e", borderRadius: 3 }} />
        </span>
      </div>
      <div style={{ padding: "9px 12px 11px" }}>
        <div style={{ fontFamily: "var(--font-faction-script)", fontSize: 20, lineHeight: 1.2, color: "var(--gestalt-ink)" }}><Body body={body} faction="wow" /></div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 8, color: "var(--gestalt-ink-soft)", marginTop: 4 }}>{handle} · {meta}</div>
      </div>
    </div>
  );
}

function SnideBubble({ name, meta, body }) {
  return (
    <div style={{ flex: 1, minWidth: 0, position: "relative", background: "#14110b", padding: "13px 15px 14px", boxShadow: "3px 4px 0 rgba(0,0,0,.3)", transform: "rotate(.4deg)" }}>
      <div style={{ position: "absolute", top: -9, left: 30, width: 74, height: 20, background: "rgba(228,214,120,.5)", transform: "rotate(-4deg)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.2)" }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-faction-anton)", fontSize: 16, letterSpacing: ".04em", textTransform: "uppercase", color: "#f4f1e8", lineHeight: 1 }}>{name}</span>
        <span style={{ fontFamily: "var(--font-faction-anton)", fontSize: 8, letterSpacing: ".06em", color: "#14110b", background: "#b6ff2e", padding: "1px 4px" }}>SNIDE</span>
        <span style={{ fontFamily: "var(--font-faction-typewriter)", fontSize: 8, color: "#8b897d", marginLeft: "auto" }}>{meta}</span>
      </div>
      <div style={{ fontFamily: "var(--font-faction-typewriter)", fontSize: 11, lineHeight: 1.6, color: "#e7e4d8", marginTop: 6 }}><Body body={body} faction="snide" /></div>
    </div>
  );
}

function EphBubble({ name, meta, body }) {
  return (
    <div style={{ flex: 1, minWidth: 0, position: "relative", background: "var(--eph-vellum)", borderLeft: "2px solid var(--eph-gold)", padding: "12px 15px 13px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-faction-engraved)", fontSize: 13, letterSpacing: ".05em", color: "var(--eph-vellum-text)", lineHeight: 1 }}>{name}</span>
        <span style={{ fontFamily: "var(--font-faction-engraved)", fontSize: 7, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--eph-rubric)", border: "1px solid var(--eph-gold)", padding: "1px 4px" }}>Ephemerists</span>
        <span style={{ fontFamily: "var(--font-faction-codex)", fontStyle: "italic", fontSize: 10, color: "var(--eph-muted)", marginLeft: "auto" }}>{meta}</span>
      </div>
      <div style={{ fontFamily: "var(--font-faction-codex)", fontSize: 15, fontStyle: "italic", lineHeight: 1.5, color: "var(--eph-vellum-text)", marginTop: 5 }}><Body body={body} faction="ephemerists" /></div>
    </div>
  );
}

function SingularityBubble({ handle, meta, body }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: "#040a12", border: "1px solid #2563eb", boxShadow: "0 0 0 1px rgba(37,99,235,.3)", padding: "11px 14px 12px" }}>
      <div style={{ fontFamily: "var(--font-faction-terminal)", fontSize: 10, color: "#60a5fa" }}>
        &gt; {handle}@signal <span style={{ color: "#3a5f9c" }}>[{meta}]</span>{" "}
        <span style={{ color: "#60a5fa", border: "1px solid #60a5fa", padding: "0 3px", fontSize: 8 }}>SINGULARITY</span>
      </div>
      <div style={{ fontFamily: "var(--font-faction-terminal)", fontSize: 11, lineHeight: 1.55, color: "#9fc2ff", marginTop: 5 }}>
        <Body body={body} faction="singularity" />
        <span style={{ animation: "wzcb-blink 1s step-end infinite" }}>_</span>
      </div>
    </div>
  );
}

function EverymenBubble({ name, meta, body }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: "var(--everymen-paper)", border: "1px solid var(--everymen-red-deep)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#d12027", padding: "5px 13px" }}>
        <span style={{ fontFamily: "var(--font-faction-poster)", fontSize: 17, letterSpacing: ".05em", color: "#f4ecd6", lineHeight: 1 }}>{name}</span>
        <span style={{ fontFamily: "var(--font-faction-poster)", fontSize: 9, letterSpacing: ".12em", color: "#f4ecd6", opacity: .8, marginLeft: "auto" }}>The Everymen · {meta}</span>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, lineHeight: 1.6, color: "var(--everymen-paper-text)", padding: "10px 13px 12px" }}><Body body={body} faction="everymen" /></div>
    </div>
  );
}

function AlbescentBubble({ name, meta, body }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: "var(--al-surface)", border: "1px solid var(--al-border)", boxShadow: "var(--al-shadow)", padding: "14px 17px 15px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-faction-vellum)", fontSize: 15, letterSpacing: ".04em", color: "var(--al-text)", lineHeight: 1 }}>{name}</span>
        <span style={{ fontFamily: "var(--font-faction-vellum)", fontStyle: "italic", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--al-text-muted)", borderBottom: "1px solid var(--al-border)" }}>Albescent</span>
        <span style={{ fontFamily: "var(--font-faction-vellum)", fontStyle: "italic", fontSize: 11, color: "var(--al-text-muted)", marginLeft: "auto" }}>{meta}</span>
      </div>
      <div style={{ fontFamily: "var(--font-faction-vellum)", fontSize: 16, lineHeight: 1.55, color: "var(--al-ink)", marginTop: 5 }}><Body body={body} faction="albescent" /></div>
    </div>
  );
}

const BUBBLE = {
  ua: UaBubble,
  wow: WowBubble,
  snide: SnideBubble,
  ephemerists: EphBubble,
  singularity: SingularityBubble,
  everymen: EverymenBubble,
  albescent: AlbescentBubble,
};

export function FactionCommentBox({ faction = "ua", name, handle, meta, body, avatar }) {
  const f = canonicalSlug(faction);
  const Bubble = BUBBLE[f] || UaBubble;
  const h = handle && handle[0] === "@" ? handle : handle ? "@" + handle : "";
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start", margin: "0" }}>
      <style>{"@keyframes wzcb-blink{0%,49%{opacity:1}50%,100%{opacity:0}}"}</style>
      <div style={{ flex: "none" }}>
        <Avatar faction={f} src={avatar} />
      </div>
      <Bubble name={name} handle={h} meta={meta} body={body} />
    </div>
  );
}
