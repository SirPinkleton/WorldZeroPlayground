/**
 * Propose-task dispatcher.
 *
 * Drives all form state via `useProposeTask()` and selects the right
 * faction-archetype form based on the user-selected `factionSlug`. Every
 * archetype consumes the same `ProposeTaskState`; only the visual treatment
 * differs. Mirrors the other page dispatchers. The faction-agnostic login /
 * eligibility gates live here so archetypes only ever render the happy-path
 * form (or its success screen).
 */
import { useProposeTask, type ProposeTaskState } from "./proposeTask/useProposeTask";
import PageTitle from "../components/ui/PageTitle";
import { pickVariant } from "../utils/factionDispatch";
import DefaultProposeTask from "./proposeTask/archetypes/DefaultProposeTask";

type Archetype = (props: { state: ProposeTaskState }) => JSX.Element | null;

// Only factions with a bespoke proposal form are listed; everything else
// (incl. albescent / aged_out) falls through to DefaultProposeTask.
const ARCHETYPE_BY_SLUG: Record<string, Archetype> = {};

export default function ProposeTask() {
  const state = useProposeTask();

  if (!state.isLoggedIn) {
    return (
      <div className="py-8" style={{ maxWidth: 720, margin: "0 auto" }}>
        <PageTitle title="Propose a Task" />
        <p className="font-body text-muted">
          You need to be logged in to propose a task.
        </p>
      </div>
    );
  }

  if (!state.canProposeTask) {
    return (
      <div className="py-8" style={{ maxWidth: 720, margin: "0 auto" }}>
        <PageTitle title="Propose a Task" />
        <p
          className="font-body"
          style={{ color: "var(--color-text-secondary)" }}
        >
          You must be level 3 or higher to propose tasks. You are currently
          level {state.currentLevel}.
        </p>
      </div>
    );
  }

  const Archetype = pickVariant(ARCHETYPE_BY_SLUG, state.factionSlug, DefaultProposeTask);
  return <Archetype state={state} />;
}
