/**
 * useFactionDetail — extracts the data plumbing from the legacy FactionDetail.tsx
 * so the page body (members / tasks / recent-praxis) can dispatch per faction the
 * same way the hero already does, without re-implementing the fetch.
 *
 * Behaviour preserved 1:1 from the original page (out-of-order-safe fetch keyed
 * on slug, faction-cleared-before-refetch, not-found when the slug has no match,
 * page backdrop themed to the faction). The returned {@link FactionDetailState}
 * is the stable contract every faction-body archetype consumes.
 */
import { useEffect, useState } from "react";
import { getFactions, type FactionOut } from "../../api/factions";
import { listCharacters, type CharacterOut } from "../../api/characters";
import { listTasks, type TaskOut } from "../../api/tasks";
import { listPraxes, type PraxisCardOut } from "../../api/praxis";
import { useAuth } from "../../auth/AuthContext";
import { useGameConfig } from "../../hooks/useGameConfig";
import { extractError } from "../../utils/errors";
import { useFactionBackdrop } from "../../components/backdrop/BackdropContext";
import type { FactionConfigOut } from "../../api/gameConfig";

export interface FactionDetailState {
  // Routing / loading
  slug: string | undefined;
  loading: boolean;
  faction: FactionOut | null;
  fetchError: string | null;

  // Entities
  members: CharacterOut[];
  tasks: TaskOut[];
  recentPraxis: PraxisCardOut[];

  // Viewer context — for per-faction display-point multipliers in the task list
  viewerFactionSlug: string | null | undefined;
  gameFactions: FactionConfigOut[];
}

export function useFactionDetail(
  slug: string | undefined,
): FactionDetailState {
  const { user } = useAuth();

  const [faction, setFaction] = useState<FactionOut | null>(null);
  const [members, setMembers] = useState<CharacterOut[]>([]);
  const [tasks, setTasks] = useState<TaskOut[]>([]);
  const [recentPraxis, setRecentPraxis] = useState<PraxisCardOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // App-wide cached game config — used for per-faction display-point multipliers.
  const gameConfig = useGameConfig();

  // Theme the page backdrop to this faction (Tier-3 surface #10). Falls back to
  // the global watercolor for factions without a backdrop variant.
  useFactionBackdrop(slug);

  useEffect(() => {
    if (!slug) return;
    // Guard against out-of-order responses: if the slug changes mid-fetch, the
    // stale request must not overwrite the newer faction's data.
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    // Clear any prior faction so an unknown slug falls through to "not found"
    // instead of showing the previously-viewed faction during/after the fetch.
    setFaction(null);
    Promise.all([
      getFactions(),
      listCharacters({ faction: slug }),
      listTasks({ faction: slug, status: "active" }),
      listPraxes({ faction: slug, status: "submitted", limit: 12 }),
    ])
      .then(([factions, mems, tsks, praxis]) => {
        if (cancelled) return;
        const match = factions.find((f) => f.slug === slug);
        if (!match) return; // faction stays null → renders the not-found state
        setFaction(match);
        setMembers(mems);
        setTasks(tsks);
        setRecentPraxis(praxis);
      })
      .catch((err) => {
        if (!cancelled)
          setFetchError(extractError(err, "Couldn't load this faction."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return {
    slug,
    loading,
    faction,
    fetchError,

    members,
    tasks,
    recentPraxis,

    viewerFactionSlug: user?.character?.faction_slug,
    gameFactions: gameConfig?.factions ?? [],
  };
}
