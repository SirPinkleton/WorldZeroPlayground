/**
 * Feed-frame dispatch guard (per-faction surface #12).
 *
 * The activity feed is neutral; each card themes to its faction via a frame.
 * This guards the wiring seam so a future design-file drop-in works: an
 * unregistered/neutral slug must pass the card through untouched (no content
 * swallowed), and a registered faction frame must actually wrap the card.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, afterEach } from "vitest";
import FactionFeedFrame, {
  FACTION_FEED_FRAMES,
} from "../feed/FactionFeedFrame";

const CARD = <span>card-body</span>;

afterEach(() => {
  // Frames are registered into a module-level map; keep tests isolated.
  for (const key of Object.keys(FACTION_FEED_FRAMES)) {
    delete FACTION_FEED_FRAMES[key];
  }
});

describe("FactionFeedFrame dispatch", () => {
  it("passes the card through unchanged when no frame is registered", () => {
    for (const slug of [null, undefined, "", "ua", "everymen"]) {
      const html = renderToStaticMarkup(
        <FactionFeedFrame slug={slug}>{CARD}</FactionFeedFrame>,
      );
      expect(html).toBe("<span>card-body</span>");
    }
  });

  it("wraps the card in a registered faction frame (design drop-in)", () => {
    FACTION_FEED_FRAMES.everymen = ({ children }) => (
      <div className="everymen-feed-frame">{children}</div>
    );
    const html = renderToStaticMarkup(
      <FactionFeedFrame slug="everymen">{CARD}</FactionFeedFrame>,
    );
    expect(html).toBe(
      '<div class="everymen-feed-frame"><span>card-body</span></div>',
    );
  });
});
