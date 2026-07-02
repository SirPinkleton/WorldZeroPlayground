import type { FactionContract, FactionSlug } from "./types";
import { UaFactionPage } from "./factions/UaFactionPage";
import { WowFactionPage } from "./factions/WowFactionPage";
import { SnideFactionPage } from "./factions/SnideFactionPage";
import { EphemeristsFactionPage } from "./factions/EphemeristsFactionPage";
import { SingularityFactionPage } from "./factions/SingularityFactionPage";
import { EverymenFactionPage } from "./factions/EverymenFactionPage";
import { AlbescentFactionPage } from "./factions/AlbescentFactionPage";

/* ────────────────────────────────────────────────────────────────
   FactionPage — the one entry point.

   This is the whole "one contract, seven skins" architecture in a
   single switch: the server hands you a FactionContract, and its
   `slug` selects the skin that renders it. Every skin takes the exact
   same `data` prop and renders the same six sections in the same order
   (hero+stats · about · join/gate · tasks · praxis · members).
   ──────────────────────────────────────────────────────────────── */

const SKINS: Record<FactionSlug, (p: { data?: FactionContract }) => JSX.Element> = {
  ua: UaFactionPage,
  wow: WowFactionPage,
  snide: SnideFactionPage,
  ephemerists: EphemeristsFactionPage,
  singularity: SingularityFactionPage,
  everymen: EverymenFactionPage,
  albescent: AlbescentFactionPage,
};

export function FactionPage({ data }: { data: FactionContract }) {
  const Skin = SKINS[data.slug];
  if (!Skin) {
    // Legacy alias safety: `journeymen` → `ephemerists`.
    if ((data.slug as string) === "journeymen") return <EphemeristsFactionPage data={data} />;
    throw new Error(`No faction skin registered for slug "${data.slug}".`);
  }
  return <Skin data={data} />;
}
