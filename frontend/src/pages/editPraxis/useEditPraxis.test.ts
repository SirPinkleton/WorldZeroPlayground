/**
 * Guards the mode-switch confirm logic behind #155: once a second member joins,
 * the picker must stay usable (confirm-then-drop), not silently lock.
 */
import { describe, it, expect } from "vitest";
import { modeSwitchPrompt } from "./useEditPraxis";

describe("modeSwitchPrompt", () => {
  it("does not lock once a second member joins — it offers a confirm (#155)", () => {
    // A non-null prompt means the switch proceeds after confirm, not a hard block.
    expect(modeSwitchPrompt(2, true)).not.toBeNull();
    expect(modeSwitchPrompt(3, false)).not.toBeNull();
  });

  it("warns that co-authors will be dropped when collaborators have joined", () => {
    expect(modeSwitchPrompt(2, false)).toMatch(/co-authors/i);
  });

  it("warns about discarding an unsaved solo draft", () => {
    expect(modeSwitchPrompt(1, true)).toMatch(/discard/i);
  });

  it("proceeds without a confirm for an empty solo praxis", () => {
    expect(modeSwitchPrompt(1, false)).toBeNull();
  });
});
