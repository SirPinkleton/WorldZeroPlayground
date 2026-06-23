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
import { useProposeTask } from "./proposeTask/useProposeTask";
import PageTitle from "../components/ui/PageTitle";
import DefaultProposeTask from "./proposeTask/archetypes/DefaultProposeTask";

// ponytail: no faction has a bespoke proposal form yet — everyone renders
// DefaultProposeTask. Add a pickVariant dispatch here when one does.
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

  return <DefaultProposeTask state={state} />;
}
