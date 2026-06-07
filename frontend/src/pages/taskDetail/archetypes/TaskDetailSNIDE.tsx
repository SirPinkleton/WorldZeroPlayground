import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import PraxisCard from "../../../components/PraxisCard";
import { mediaUrl } from "../../../utils/media";
import { factionName } from "../../../utils/factions";
import { SnideSigil } from "../../../components/snide/snideAtoms";
import { ErrorBanner, relationOf } from "./shared";
import type { TaskSignupOut } from "../../../api/tasks";
import type { TaskDetailState } from "../useTaskDetail";

/**
 * S.N.I.D.E. task-detail archetype — the job rendered as an OPEN-CASE DOSSIER:
 * evidence file header, the brief, accomplices on file, a read-only mob verdict,
 * and a "PULL THIS JOB" sign-up CTA. Ported from the SNIDE design kit
 * (snide-task-detail.jsx); wired to the real {@link TaskDetailState}.
 *
 * Decorative / not backend-backed (marked inline): the "job no." (derived from
 * task.id), and the EvidenceTag labels are relabelled to honest counts.
 */

const INK = "var(--faction-snide-ink)";

/** The shared "rap sheet" CTA skin — a skewed, ink-shadowed slab button/link.
 *  `big` is the primary PULL size; default is the secondary edit/continue size. */
function rapSheetStyle(background: string, big = false): CSSProperties {
  return {
    display: "inline-block",
    cursor: "pointer",
    border: `2px solid ${INK}`,
    background,
    color: "#fff",
    fontFamily: "var(--faction-snide-font-black)",
    fontSize: big ? 20 : 18,
    letterSpacing: "0.04em",
    padding: big ? "16px 30px" : "14px 26px",
    textDecoration: "none",
    transform: "rotate(-1.5deg)",
    boxShadow: `5px 6px 0 ${INK}`,
  };
}

function EvidenceTag({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "10px 14px",
        border: `1.5px solid ${INK}`,
        background: accent ? INK : "transparent",
        transform: `rotate(${accent ? -1.5 : 1}deg)`,
        boxShadow: accent ? "2px 3px 0 var(--faction-snide-pink)" : "none",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 8,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accent
            ? "var(--faction-snide-acid)"
            : "color-mix(in srgb, var(--faction-snide-wall-text) 55%, transparent)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--faction-snide-font-impact)",
          fontSize: 26,
          lineHeight: 0.85,
          color: accent ? "var(--faction-snide-acid)" : "var(--faction-snide-wall-text)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** Section marker — acid tape tab with a marker-font label. */
function MarkerTab({ text, rot = -1.5 }: { text: string; rot?: number }) {
  return (
    <div
      style={{
        display: "inline-block",
        background: "var(--faction-snide-acid)",
        color: INK,
        fontFamily: "var(--faction-snide-font-marker)",
        fontSize: 16,
        padding: "3px 13px",
        transform: `rotate(${rot}deg)`,
        boxShadow: "2px 2px 0 var(--faction-snide-pink)",
        marginBottom: 13,
      }}
    >
      {text}
    </div>
  );
}

/** Accomplices on file — real signup avatars, tilted, with friend/foe dots. */
function AccompliceRow({
  signups,
  friends,
  foes,
}: {
  signups: TaskSignupOut[];
  friends: Set<number>;
  foes: Set<number>;
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
    >
      {signups.map((m, i) => {
        const rel = relationOf(m.character_id, friends, foes);
        const relColor = rel === "friend" ? "var(--faction-snide)" : "var(--faction-snide-pink)";
        return (
          <Link
            key={m.character_id}
            to={`/characters/${m.character_id}`}
            title={`${m.display_name}${rel ? ` · ${rel}` : ""}`}
            style={{
              position: "relative",
              width: 38,
              height: 38,
              flexShrink: 0,
              transform: `rotate(${i % 2 ? 4 : -3}deg)`,
              boxShadow: "1.5px 2px 0 rgba(0,0,0,0.35)",
            }}
          >
            {m.avatar_url ? (
              <img
                src={mediaUrl(m.avatar_url)}
                alt={m.display_name}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--faction-snide)",
                }}
              />
            ) : (
              <span
                style={{
                  display: "flex",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: INK,
                  border: "2px solid var(--faction-snide)",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--faction-snide-acid)",
                  fontFamily: "var(--faction-snide-font-impact)",
                  fontSize: 16,
                }}
              >
                {m.display_name[0]?.toUpperCase()}
              </span>
            )}
            {rel && (
              <span
                title={rel}
                style={{
                  position: "absolute",
                  right: -3,
                  bottom: -3,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: relColor,
                  border: "1.5px solid var(--faction-snide-paper)",
                }}
              />
            )}
          </Link>
        );
      })}
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "color-mix(in srgb, var(--faction-snide-wall-text) 55%, transparent)",
          marginLeft: 6,
        }}
      >
        on the job
      </span>
    </div>
  );
}

export default function TaskDetailSNIDE({
  state,
}: {
  state: TaskDetailState;
}) {
  const {
    task,
    signups,
    submissions,
    friends,
    foes,
    mySubmission,
    isInProgress,
    inProgressPraxisId,
    canSignUp,
    modifiedPoints,
    avgVoteNumber,
    voteCount,
    sortedSubmissions,
    submissionSort,
    setSubmissionSort,
    signupError,
    handleSignup,
    handleDrop,
  } = state;

  // Guarded non-null by the dispatcher.
  if (!task) return null;

  const wall = "var(--faction-snide-wall-text)";
  const muted = "color-mix(in srgb, var(--faction-snide-wall-text) 55%, transparent)";
  // Decorative: SNIDE invents a "case file number" — derive it from the real id.
  const caseNo = String(task.id).padStart(4, "0");
  const isMeta = task.task_type === "metatask";

  return (
    <div className="py-8" style={{ fontFamily: "var(--font-body)", color: wall }}>
      {/* ── Breadcrumb ── */}
      <nav
        className="font-body mb-4"
        style={{ fontSize: 9, letterSpacing: "0.1em", color: muted }}
      >
        <Link
          to="/tasks"
          style={{ color: "var(--faction-snide)", textDecoration: "none" }}
        >
          Tasks
        </Link>
        {" › "}
        <span style={{ fontFamily: "var(--faction-snide-font-cond)", letterSpacing: "0.12em" }}>
          S.N.I.D.E.
        </span>
        {" › "}
        <span style={{ color: wall }}>{task.title}</span>
      </nav>

      <div style={{ maxWidth: 760 }}>
        {/* ── Open-case dossier header ── */}
        <div
          style={{
            position: "relative",
            background: "var(--faction-snide-paper)",
            color: INK,
            border: `1.5px solid ${INK}`,
            boxShadow: "6px 7px 0 rgba(0,0,0,0.25)",
            transform: "rotate(-0.5deg)",
            marginBottom: 30,
            overflow: "hidden",
          }}
        >
          <div
            className="ht-dots"
            style={{
              position: "absolute",
              inset: 0,
              color: "rgba(20,17,11,0.04)",
              pointerEvents: "none",
            }}
          />
          {/* margin stripe (acid-on-green) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 7,
              background: "var(--faction-snide)",
              backgroundImage:
                "repeating-linear-gradient(180deg, transparent 0 13px, rgba(0,0,0,0.25) 13px 14px)",
            }}
          />
          <div style={{ position: "relative", display: "flex", gap: 0 }}>
            {/* mugshot panel */}
            <div
              style={{
                flexShrink: 0,
                width: 110,
                background: INK,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px 8px",
                backgroundImage:
                  "repeating-linear-gradient(180deg, transparent 0 13px, rgba(182,255,46,0.18) 13px 14px)",
              }}
            >
              <SnideSigil size={48} color="var(--faction-snide-acid)" />
              <div
                style={{
                  fontFamily: "var(--faction-snide-font-cond)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  color: "var(--faction-snide-acid)",
                  marginTop: 8,
                }}
              >
                JOB FILE
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 8,
                  color: "#a0c080",
                  letterSpacing: "0.08em",
                  marginTop: 2,
                }}
              >
                OPEN CASE
              </div>
            </div>
            {/* case details */}
            <div
              style={{
                flex: 1,
                padding: "18px 20px 18px 16px",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 8.5,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#6b6253",
                  marginBottom: 6,
                }}
              >
                S.N.I.D.E. Case File · job no. {caseNo}
              </div>
              <h1
                style={{
                  fontFamily: "var(--faction-snide-font-impact)",
                  fontSize: 38,
                  lineHeight: 0.86,
                  margin: "0 0 12px",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  transform: "skewX(-4deg)",
                  color: INK,
                }}
              >
                {task.title}
              </h1>
              {isMeta && (
                <div
                  style={{
                    fontFamily: "var(--faction-snide-font-cond)",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--faction-snide-pink-deep)",
                    marginBottom: 10,
                  }}
                >
                  ↳ metatask for {factionName(task.metatask_faction_slug)}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <EvidenceTag label="Points" value={modifiedPoints} accent />
                <EvidenceTag label="Level" value={`LVL ${task.level_required}`} />
                {/* Honest counts (kit's "filed N times" → real in-progress / closed) */}
                <EvidenceTag label="Filed" value={`${signups.length}`} />
                <EvidenceTag label="Closed" value={`${submissions.length}`} />
              </div>
              {/* OPEN CASE stamp */}
              <span
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  fontFamily: "var(--faction-snide-font-cond)",
                  fontSize: 15,
                  letterSpacing: "0.14em",
                  color: "rgba(190,24,93,0.75)",
                  border: "2.5px solid rgba(190,24,93,0.7)",
                  padding: "3px 12px",
                  transform: "rotate(-7deg)",
                }}
              >
                {task.status === "active" ? "OPEN CASE" : task.status.toUpperCase()}
              </span>
            </div>
          </div>
          {/* tape top-right */}
          <div
            className="snide-tape"
            style={{ top: -8, right: 38, width: 56, height: 18, transform: "rotate(6deg)" }}
          />
        </div>

        {/* ── The brief ── */}
        <div style={{ marginBottom: 28 }}>
          <MarkerTab text="the brief" rot={-1.5} />
          <div
            style={{
              position: "relative",
              background: "var(--faction-snide-paper)",
              color: INK,
              border: `1.5px solid ${INK}`,
              borderLeft: "4px solid var(--faction-snide)",
              padding: "16px 18px",
              backgroundImage:
                "repeating-linear-gradient(180deg, transparent 0 27px, rgba(20,17,11,0.09) 27px 28px)",
              transform: "rotate(0.4deg)",
              boxShadow: "3px 4px 0 rgba(0,0,0,0.18)",
            }}
          >
            <div
              className="snide-tape"
              style={{ top: -8, left: 30, width: 56, height: 17, transform: "rotate(-5deg)" }}
            />
            <p
              style={{
                fontFamily: "var(--faction-snide-font-type)",
                fontSize: 13,
                lineHeight: "28px",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {task.description || "No brief on file. Figure it out."}
            </p>
          </div>
        </div>

        {/* ── Accomplices on file ── */}
        {signups.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <MarkerTab text="accomplices on file" rot={1} />
            <AccompliceRow signups={signups} friends={friends} foes={foes} />
          </div>
        )}

        {/* ── Mob verdict (read-only aggregate) ── */}
        <div style={{ marginBottom: 30 }}>
          <MarkerTab text="mob verdict" rot={-1} />
          {voteCount > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <span
                style={{
                  fontFamily: "var(--faction-snide-font-impact)",
                  fontSize: 54,
                  lineHeight: 0.8,
                  color: "var(--faction-snide)",
                }}
              >
                {avgVoteNumber.toFixed(1)}
              </span>
              <div style={{ paddingBottom: 6 }}>
                <div
                  style={{
                    fontFamily: "var(--faction-snide-font-cond)",
                    fontSize: 16,
                    letterSpacing: "0.06em",
                    color: wall,
                  }}
                >
                  OUT OF 5
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    color: muted,
                  }}
                >
                  {voteCount} on file ·{" "}
                  <span style={{ fontFamily: "var(--faction-snide-font-marker)", color: "var(--faction-snide-pink)" }}>
                    nobody's impressed
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--faction-snide-font-marker)", fontSize: 14, color: "var(--faction-snide-pink)" }}>
              no verdict yet. be the first to pull it off.
            </p>
          )}
        </div>

        {/* ── Pull this job / signed-up states ── */}
        <div
          style={{
            borderTop:
              "2px dashed color-mix(in srgb, var(--faction-snide-wall-text) 22%, transparent)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          {canSignUp && (
            <>
              <button onClick={handleSignup} style={rapSheetStyle("var(--faction-snide)", true)}>
                ★ PULL THIS JOB ★
              </button>
              <div
                style={{
                  fontFamily: "var(--faction-snide-font-marker)",
                  fontSize: 14,
                  color: "var(--faction-snide-pink)",
                  transform: "rotate(-1.5deg)",
                }}
              >
                ↳ nobody's watching. probably.
              </div>
            </>
          )}

          {mySubmission && (
            <>
              <Link
                to={`/praxes/${mySubmission.id}/edit`}
                style={rapSheetStyle("var(--faction-snide-pink)")}
              >
                → EDIT THE RAP SHEET
              </Link>
              <div
                style={{
                  fontFamily: "var(--faction-snide-font-marker)",
                  fontSize: 14,
                  color: "var(--faction-snide)",
                  transform: "rotate(-1.5deg)",
                }}
              >
                ↳ filed. on the record.
              </div>
            </>
          )}

          {!mySubmission && isInProgress && inProgressPraxisId !== null && (
            <>
              <Link
                to={`/praxes/${inProgressPraxisId}/edit`}
                style={rapSheetStyle("var(--faction-snide)")}
              >
                → CONTINUE THE RAP SHEET
              </Link>
              <button
                onClick={handleDrop}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--faction-snide-font-marker)",
                  fontSize: 14,
                  color: "var(--faction-snide-pink)",
                  transform: "rotate(-1.5deg)",
                }}
              >
                ↳ ditch the job
              </button>
            </>
          )}
        </div>
        <ErrorBanner
          message={signupError}
          style={{
            background: "rgba(255,45,139,0.08)",
            border: "1px solid rgba(255,45,139,0.3)",
          }}
        />

        {/* ── The record (completed praxis) ── */}
        <div style={{ marginTop: 34 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <MarkerTab text={`the record · ${submissions.length}`} rot={-1} />
            <div style={{ display: "flex", gap: 0 }}>
              {(["score", "recent"] as const).map((sort) => {
                const on = submissionSort === sort;
                return (
                  <button
                    key={sort}
                    onClick={() => setSubmissionSort(sort)}
                    style={{
                      fontFamily: "var(--faction-snide-font-cond)",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "5px 12px",
                      background: on ? INK : "transparent",
                      color: on ? "var(--faction-snide-acid)" : muted,
                      border: `1.5px solid ${on ? INK : "color-mix(in srgb, var(--faction-snide-wall-text) 30%, transparent)"}`,
                      cursor: "pointer",
                    }}
                  >
                    {sort === "score" ? "top rated" : "recent"}
                  </button>
                );
              })}
            </div>
          </div>

          {sortedSubmissions.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--faction-snide-font-marker)",
                fontSize: 15,
                color: "var(--faction-snide-pink)",
              }}
            >
              no files yet. nobody's pulled it off.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 items-start">
                {sortedSubmissions.slice(0, 4).map((s) => (
                  <PraxisCard key={s.id} praxis={s} />
                ))}
              </div>
              {submissions.length > 4 && (
                <div style={{ marginTop: 16 }}>
                  <Link
                    to={`/praxes?task_id=${task.id}`}
                    style={{
                      fontFamily: "var(--faction-snide-font-marker)",
                      fontSize: 15,
                      color: "var(--faction-snide)",
                      textDecoration: "none",
                    }}
                  >
                    open all {submissions.length} files &rarr;
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
