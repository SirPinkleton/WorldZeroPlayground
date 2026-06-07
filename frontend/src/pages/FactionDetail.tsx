import { useEffect, useState, type CSSProperties, type ComponentType } from "react";
import { useParams, Link } from "react-router-dom";
import { getFactions, type FactionOut } from "../api/factions";
import { listCharacters, type CharacterOut } from "../api/characters";
import { listTasks, type TaskOut } from "../api/tasks";
import { listPraxes, type PraxisCardOut } from "../api/praxis";
import TaskCard from "../components/TaskCard";
import PraxisCard from "../components/PraxisCard";
import CharacterBadge from "../components/CharacterBadge";
import PageTitle from "../components/ui/PageTitle";
import { useAuth } from "../auth/AuthContext";
import { useGameConfig } from "../hooks/useGameConfig";
import { extractError } from "../utils/errors";
import { factionCssVar } from "../utils/factions";
import { computeDisplayPoints } from "../utils/points";
import { useFactionBackdrop } from "../components/backdrop/BackdropContext";
import EphemeristsFactionHero from "../components/cards/EphemeristsFactionHero";
import SnideFactionHero from "../components/cards/SnideFactionHero";

/**
 * Per-faction page-hero dispatcher (Tier-3 surface). A faction opts in to a
 * bespoke frontispiece by registering here; any slug not in the map falls back
 * to the shared title + description chrome below. Mirrors the other per-faction
 * dispatchers (TaskCard, VoteUI, FactionBackdrop, …).
 */
export interface FactionHeroProps {
  name: string;
  description?: string | null;
  /** Raw counts — each hero labels them in its own faction voice. */
  members: number;
  tasks: number;
  praxes: number;
}

const FACTION_HEROES: Record<string, ComponentType<FactionHeroProps>> = {
  journeymen: EphemeristsFactionHero,
  snide: SnideFactionHero,
};

/** Shared flex-wrap card grid — varied card sizes are intentional, not a CSS grid. */
const CARD_GRID: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  alignItems: "flex-start",
};

/**
 * Faction detail page (`/factions/:slug`). Per-faction surface #13 in
 * SPEC-faction-ui-profile.md: shows the faction's description, its members, its
 * tasks, and recently completed praxis.
 *
 * NOTE: the styling here is intentionally PLACEHOLDER — real per-faction visual
 * design is deferred to Claude design. Data wiring + structure are final; the
 * section chrome (header frame, member tiles, layout) is meant to be restyled.
 */
export default function FactionDetail() {
  const { slug } = useParams<{ slug: string }>();
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

  if (loading)
    return <div className="py-8 font-body text-muted">Loading...</div>;
  if (fetchError)
    return (
      <div className="py-8">
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
          {fetchError}{" "}
          <button onClick={() => window.location.reload()} className="underline">
            Try refreshing.
          </button>
        </p>
      </div>
    );
  if (!faction)
    return (
      <div className="py-8 font-body text-muted">
        Faction not found.{" "}
        <Link to="/factions" className="underline">
          Back to factions.
        </Link>
      </div>
    );

  const accent = factionCssVar(faction.slug, "border");

  // A faction may register a bespoke frontispiece in FACTION_HEROES; otherwise
  // the shared title + description chrome is used. The page backdrop is themed
  // per-faction by useFactionBackdrop above either way.
  const Hero = FACTION_HEROES[faction.slug];

  return (
    <div className="py-8">
      {Hero ? (
        <Hero
          name={faction.name}
          description={faction.description}
          members={members.length}
          tasks={tasks.length}
          praxes={recentPraxis.length}
        />
      ) : (
        <>
          <PageTitle title={faction.name} eyebrow="Faction" />

          {/* ── Description ── PLACEHOLDER: design to restyle ── */}
          <div
            className="sidebar-card mb-6"
            style={{ borderLeft: `4px solid ${accent}`, padding: "14px 16px" }}
          >
            <p className="font-body text-sm text-ink">
              {faction.description ?? "No description yet."}
            </p>
          </div>
        </>
      )}

      {/* ── Members ── PLACEHOLDER: design to restyle ── */}
      <section className="mb-8">
        <h2 className="eyebrow mb-3">Members · {members.length}</h2>
        {members.length === 0 ? (
          <p className="font-body text-muted text-sm">No members yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  border: `1px solid ${accent}`,
                  padding: "6px 10px",
                  background: "var(--color-bg-card)",
                }}
              >
                <CharacterBadge character={m} size="sm" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Tasks ── reuses the per-faction TaskCard archetype ── */}
      <section className="mb-8">
        <h2 className="eyebrow mb-3">Tasks · {tasks.length}</h2>
        {tasks.length === 0 ? (
          <p className="font-body text-muted text-sm">No tasks yet.</p>
        ) : (
          <div style={CARD_GRID}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                displayPoints={computeDisplayPoints(
                  task.point_value,
                  user?.character?.faction_slug,
                  task.primary_faction_slug,
                  gameConfig?.factions ?? [],
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Recently completed ── PLACEHOLDER: design to restyle ── */}
      <section className="mb-8">
        <h2 className="eyebrow mb-3">Recently completed</h2>
        {recentPraxis.length === 0 ? (
          <p className="font-body text-muted text-sm">
            No completed praxis yet.
          </p>
        ) : (
          <div style={CARD_GRID}>
            {recentPraxis.map((p) => (
              <PraxisCard key={p.id} praxis={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
