import { useEffect } from "react";

/* ────────────────────────────────────────────────────────────────
   useHead — inject a faction's web-font <link>s and its @keyframes /
   @font-face CSS into <head> once, keyed by id (de-duped across mounts).

   Each skin needs a few things that can't be inline styles: Google Font
   links and a couple of @keyframes (spin, blink, breathe, twinkle…).
   Rather than require app-level setup, each page calls useHead() so it
   is self-contained. In your app you'll probably hoist the font links
   into your document <head> / build pipeline instead.
   ──────────────────────────────────────────────────────────────── */

export function useHead(id: string, fontHref: string | null, keyframesCss: string): void {
  useEffect(() => {
    const nodes: Element[] = [];

    if (fontHref) {
      const linkId = `wz-font-${id}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = fontHref;
        document.head.appendChild(link);
        nodes.push(link);
      }
    }

    if (keyframesCss.trim()) {
      const styleId = `wz-kf-${id}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = keyframesCss;
        document.head.appendChild(style);
        nodes.push(style);
      }
    }

    // Left mounted intentionally (cheap, shared across instances).
    return () => {
      void nodes;
    };
  }, [id, fontHref, keyframesCss]);
}
