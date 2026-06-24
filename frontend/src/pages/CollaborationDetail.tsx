import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  getPraxis,
  updatePraxis,
  submitPraxis,
  withdrawPraxis,
  kickMember,
  inviteToPraxis,
  votePraxis,
  getPraxisVotes,
  type PraxisOut,
  type DuelVoteSummary,
} from "../api/praxis";
import { listCharacters, type CharacterOut } from "../api/characters";
import { useAuth } from "../auth/AuthContext";
import { factionColor, factionName } from "../utils/factions";
import { formatTimestamp } from "../utils/dates";

const RAINBOW_COLORS = [
  "#fbbf24",
  "#be185d",
  "#4f46e5",
  "#0e7490",
  "var(--color-success)",
  "#f97316",
  "#fbbf24",
  "#be185d",
];

export default function CollaborationDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const myCharacterId = user?.character?.id;

  // Invite errors passed via navigation state when some invites failed on collab creation
  const locationState = location.state as { inviteErrors?: string[] } | null;
  const [startupInviteErrors] = useState<string[]>(
    locationState?.inviteErrors ?? [],
  );

  const [collab, setCollab] = useState<PraxisOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Document editing
  const [editing, setEditing] = useState(false);
  const [docDraft, setDocDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Invite
  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteResults, setInviteResults] = useState<CharacterOut[]>([]);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Duel votes
  const [duelVotes, setDuelVotes] = useState<DuelVoteSummary[]>([]);
  const [votingForMemberId, setVotingForMemberId] = useState<number | null>(
    null,
  );
  const [voteStars, setVoteStars] = useState(0);
  const [castingVote, setCastingVote] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [voteSuccess, setVoteSuccess] = useState(false);

  // Action errors
  const [actionError, setActionError] = useState("");

  const praxisId = id ? parseInt(id, 10) : null;

  const loadCollab = useCallback(async () => {
    if (!praxisId) return;
    try {
      const data = await getPraxis(praxisId);
      setCollab(data);
      if (!editing) setDocDraft(data.body_text ?? "");
    } catch {
      setFetchError("Could not load collaboration.");
    } finally {
      setLoading(false);
    }
  }, [praxisId, editing]);

  const loadDuelVotes = useCallback(async () => {
    if (!praxisId || !collab || collab.type !== "duel") return;
    try {
      const votes = await getPraxisVotes(praxisId);
      setDuelVotes(votes as DuelVoteSummary[]);
    } catch {
      /* non-fatal */
    }
  }, [praxisId, collab]);

  useEffect(() => {
    loadCollab();
  }, [loadCollab]);

  useEffect(() => {
    if (collab?.type === "duel") loadDuelVotes();
  }, [collab, loadDuelVotes]);

  if (loading) {
    return (
      <div className="py-8" style={{ maxWidth: 720, margin: "0 auto" }}>
        <p className="eyebrow">Loading...</p>
      </div>
    );
  }
  if (fetchError || !collab) {
    return (
      <div className="py-8" style={{ maxWidth: 720, margin: "0 auto" }}>
        <p className="eyebrow" style={{ color: "var(--color-danger)" }}>
          {fetchError ?? "Not found."}
        </p>
      </div>
    );
  }

  const isMember = collab.members.some((m) => m.character_id === myCharacterId);
  const myMember = collab.members.find((m) => m.character_id === myCharacterId);
  const isPublished = collab.status === "submitted";
  const isDuel = collab.type === "duel";
  const isCollab = collab.type === "collab";
  const modeLabel = isDuel ? "Duel" : "Collaboration";
  const modeColor = isDuel ? "var(--color-danger)" : "var(--color-success)";

  const winningStars = duelVotes.length
    ? Math.max(...duelVotes.map((v) => v.total_stars))
    : 0;

  const handleSaveDocument = async () => {
    if (!praxisId) return;
    setSaving(true);
    try {
      const updated = await updatePraxis(praxisId, { body_text: docDraft });
      setCollab(updated);
      setDocDraft(updated.body_text ?? "");
      setEditing(false);
    } catch {
      setActionError("Could not save document.");
    }
    setSaving(false);
  };

  const handleSubmit = async () => {
    if (!praxisId) return;
    setActionError("");
    try {
      const updated = await submitPraxis(praxisId);
      setCollab(updated);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setActionError(axiosErr?.response?.data?.detail ?? "Could not submit.");
    }
  };

  const handleReopen = async () => {
    if (!praxisId) return;
    setActionError("");
    try {
      const updated = await withdrawPraxis(praxisId);
      setCollab(updated);
      setEditing(false);
    } catch {
      setActionError("Could not move back to editing.");
    }
  };

  const handleKick = async (memberId: number, name: string) => {
    if (
      !praxisId ||
      !window.confirm(`Remove ${name} from this ${modeLabel.toLowerCase()}?`)
    )
      return;
    setActionError("");
    try {
      await kickMember(praxisId, memberId);
      await loadCollab();
    } catch {
      setActionError("Could not remove member.");
    }
  };

  const handleInviteSearch = async (query: string) => {
    setInviteQuery(query);
    if (query.length < 2) {
      setInviteResults([]);
      setShowInviteDropdown(false);
      return;
    }
    try {
      const results = await listCharacters({ search: query, limit: 8 });
      const memberIds = new Set(collab.members.map((m) => m.character_id));
      const filtered = results.filter(
        (c) => c.id !== myCharacterId && !memberIds.has(c.id),
      );
      setInviteResults(filtered);
      setShowInviteDropdown(filtered.length > 0);
    } catch {
      setInviteResults([]);
    }
  };

  const handleSendInvite = async (character: CharacterOut) => {
    if (!praxisId) return;
    setInviteError("");
    setInviteQuery("");
    setShowInviteDropdown(false);
    try {
      await inviteToPraxis(praxisId, character.id);
      await loadCollab();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setInviteError(
        axiosErr?.response?.data?.detail ?? "Could not send invite.",
      );
    }
  };

  const handleCastVote = async () => {
    if (!praxisId || !votingForMemberId || !voteStars) return;
    setCastingVote(true);
    setVoteError("");
    try {
      await votePraxis(praxisId, {
        stars: voteStars,
        praxis_member_id: votingForMemberId,
      });
      setVoteSuccess(true);
      setVotingForMemberId(null);
      setVoteStars(0);
      await loadDuelVotes();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setVoteError(axiosErr?.response?.data?.detail ?? "Could not cast vote.");
    }
    setCastingVote(false);
  };

  return (
    <div className="py-8" style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <nav
        className="font-body mb-4"
        style={{
          fontSize: 9,
          letterSpacing: "0.1em",
          color: "var(--color-text-tertiary)",
        }}
      >
        <Link to="/tasks" style={{ color: "inherit", textDecoration: "none" }}>
          Tasks
        </Link>
        {" › "}
        <Link
          to={`/tasks/${collab.task_id}`}
          style={{
            color: "var(--color-text-secondary)",
            textDecoration: "none",
          }}
        >
          {collab.task_title}
        </Link>
        {" › "}
        <span style={{ color: "var(--color-text-primary)" }}>{modeLabel}</span>
      </nav>

      {/* Header */}
      <div
        className="sidebar-card mb-5"
        style={{ padding: "16px 20px", borderLeft: `4px solid ${modeColor}` }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 8,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "2px 8px",
                background: modeColor,
                color: "var(--color-text-on-accent)",
                marginBottom: 6,
                display: "inline-block",
              }}
            >
              {modeLabel}
            </span>
            <Link
              to={`/tasks/${collab.task_id}`}
              className="font-display italic"
              style={{
                fontSize: 20,
                color: modeColor,
                textDecoration: "none",
                display: "block",
              }}
            >
              {collab.task_title}
            </Link>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 8,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "3px 10px",
                background: isPublished
                  ? "var(--color-success)"
                  : "var(--color-bg-surface-alt)",
                color: isPublished
                  ? "var(--color-text-on-accent)"
                  : "var(--color-text-secondary)",
                border: isPublished ? "none" : "1px solid var(--color-border)",
              }}
            >
              {isPublished ? "Published" : "In Progress"}
            </span>
            <div className="eyebrow" style={{ marginTop: 4, fontSize: 7 }}>
              {formatTimestamp(collab.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="sidebar-card mb-4" style={{ padding: "16px 20px" }}>
        <p className="eyebrow mb-3">
          {isDuel ? "Competitors" : "Members"} ({collab.members.length})
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {collab.members.map((member) => {
            const color = factionColor(null);
            const isMe = member.character_id === myCharacterId;
            return (
              <div
                key={member.character_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "var(--color-bg-surface-alt)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${color}, ${color}88)`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/characters/${member.character_id}`}
                    className="font-body"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      textDecoration: "none",
                    }}
                  >
                    {member.character_display_name}
                    {isMe && (
                      <span
                        className="eyebrow"
                        style={{ marginLeft: 6, fontSize: 7 }}
                      >
                        (you)
                      </span>
                    )}
                  </Link>
                </div>
                <span
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 8,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    background: member.has_submitted
                      ? "var(--color-success)"
                      : "transparent",
                    color: member.has_submitted
                      ? "var(--color-text-on-accent)"
                      : "var(--color-text-tertiary)",
                    border: member.has_submitted
                      ? "none"
                      : "1px solid var(--color-border)",
                  }}
                >
                  {member.has_submitted ? "Submitted" : "Drafting"}
                </span>
                {/* Kick button — any member can kick others (not themselves) */}
                {isMember && !isMe && !isPublished && (
                  <button
                    onClick={() =>
                      handleKick(member.id, member.character_display_name)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-tertiary)",
                      fontSize: 10,
                      fontFamily: "'Courier Prime', monospace",
                      padding: "2px 6px",
                    }}
                    title="Remove from collaboration"
                  >
                    &times;
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Pending invites */}
        {collab.invites && collab.invites.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p className="eyebrow" style={{ marginBottom: 6, fontSize: 7 }}>
              Pending invites
            </p>
            {collab.invites.map((invite) => (
              <div
                key={invite.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 12px",
                  opacity: 0.7,
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9,
                  color: "var(--color-text-secondary)",
                }}
              >
                <span>→ {invite.invitee_display_name}</span>
                <span className="eyebrow" style={{ fontSize: 7 }}>
                  invited
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Invite more (collaboration only, in-progress, is member) */}
        {isMember && !isPublished && isCollab && (
          <div style={{ marginTop: 12 }}>
            <p className="eyebrow" style={{ marginBottom: 6, fontSize: 7 }}>
              Invite more members
            </p>
            <div style={{ position: "relative", display: "flex", gap: 6 }}>
              <input
                type="text"
                value={inviteQuery}
                onChange={(e) => handleInviteSearch(e.target.value)}
                placeholder="Search by name"
                onFocus={() => {
                  if (inviteResults.length > 0) setShowInviteDropdown(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowInviteDropdown(false), 200)
                }
                style={{
                  flex: 1,
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 11,
                  padding: "6px 10px",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                  outline: "none",
                }}
              />
              {showInviteDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {inviteResults.map((character) => (
                    <button
                      key={character.id}
                      type="button"
                      onMouseDown={() => handleSendInvite(character)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "8px 12px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${factionColor(character.faction_slug)}, ${factionColor(character.faction_slug)}88)`,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        className="font-body"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {character.display_name}
                      </span>
                      <span
                        className="eyebrow"
                        style={{ marginLeft: "auto", fontSize: 7 }}
                      >
                        {factionName(character.faction_slug)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {inviteError && (
              <p
                className="eyebrow"
                style={{ color: "var(--color-danger)", marginTop: 4 }}
              >
                {inviteError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Shared Document */}
      <div className="sidebar-card mb-4" style={{ padding: "16px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <p className="eyebrow">Shared Document</p>
          {isMember && !editing && (
            <button
              onClick={() => {
                setEditing(true);
                setDocDraft(collab.body_text ?? "");
              }}
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 8,
                fontWeight: 700,
                textTransform: "uppercase",
                background: "transparent",
                border: "1px solid var(--color-border)",
                padding: "3px 10px",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
              }}
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div>
            <textarea
              value={docDraft}
              onChange={(e) => setDocDraft(e.target.value)}
              rows={14}
              placeholder="Write your shared document here... (supports markdown)"
              style={{
                width: "100%",
                fontFamily: "'Lora', serif",
                fontSize: 14,
                color: "var(--color-text-primary)",
                lineHeight: 1.75,
                minHeight: 200,
                background: "transparent",
                border: "1px solid var(--color-border)",
                outline: "none",
                resize: "vertical",
                padding: "10px 12px",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleSaveDocument}
                disabled={saving}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: modeColor,
                  color: "var(--color-text-on-accent)",
                  border: "none",
                  padding: "6px 16px",
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  padding: "6px 16px",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : collab.body_text ? (
          <div
            className="markdown-preview font-display"
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: "var(--color-text-primary)",
            }}
          >
            <ReactMarkdown>{collab.body_text}</ReactMarkdown>
          </div>
        ) : (
          <p
            className="font-body"
            style={{
              fontSize: 12,
              color: "var(--color-text-tertiary)",
              fontStyle: "italic",
            }}
          >
            {isMember
              ? "No document yet. Click Edit to start writing."
              : "No document yet."}
          </p>
        )}
      </div>

      {/* Duel vote tally */}
      {isDuel && (
        <div className="sidebar-card mb-4" style={{ padding: "16px 20px" }}>
          <p className="eyebrow mb-3">Vote Tally</p>
          {duelVotes.length === 0 ? (
            <p
              className="font-body"
              style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}
            >
              No votes yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {duelVotes.map((v) => {
                const isWinning =
                  winningStars > 0 && v.total_stars === winningStars;
                return (
                  <div
                    key={v.member_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                      background: isWinning
                        ? "rgba(220,38,38,0.07)"
                        : "var(--color-bg-surface-alt)",
                      border: `1px solid ${isWinning ? "var(--color-danger)" : "var(--color-border)"}`,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--color-bg-surface-alt)",
                        border: "1px solid var(--color-border)",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="font-body"
                      style={{ fontSize: 12, fontWeight: 700, flex: 1 }}
                    >
                      {v.character_display_name}
                      {isWinning && (
                        <span
                          style={{
                            marginLeft: 8,
                            color: "var(--color-danger)",
                            fontSize: 10,
                          }}
                        >
                          leading
                        </span>
                      )}
                    </span>
                    <span className="eyebrow" style={{ fontSize: 9 }}>
                      {v.total_stars} stars ({v.vote_count} votes)
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cast vote (non-members only, published collab) */}
          {!isMember && isPublished && (
            <div
              style={{
                marginTop: 14,
                borderTop: "1px dashed var(--color-border)",
                paddingTop: 14,
              }}
            >
              <p className="eyebrow mb-2" style={{ fontSize: 8 }}>
                Cast your vote
              </p>
              {voteSuccess ? (
                <p
                  className="eyebrow"
                  style={{ color: "var(--color-success)" }}
                >
                  Vote recorded!
                </p>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {collab.members.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <button
                          onClick={() =>
                            setVotingForMemberId(
                              votingForMemberId === member.id
                                ? null
                                : member.id,
                            )
                          }
                          style={{
                            fontFamily: "'Courier Prime', monospace",
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "4px 12px",
                            background:
                              votingForMemberId === member.id
                                ? "var(--color-danger)"
                                : "transparent",
                            color:
                              votingForMemberId === member.id
                                ? "var(--color-text-on-accent)"
                                : "var(--color-text-primary)",
                            border: `1px solid ${votingForMemberId === member.id ? "var(--color-danger)" : "var(--color-border)"}`,
                            cursor: "pointer",
                          }}
                        >
                          {member.character_display_name}
                        </button>
                        {votingForMemberId === member.id && (
                          <div style={{ display: "flex", gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setVoteStars(star)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 18,
                                  lineHeight: 1,
                                  padding: "0 2px",
                                  color:
                                    star <= voteStars
                                      ? "var(--color-text-primary)"
                                      : "var(--color-border)",
                                  transition: "color 100ms",
                                }}
                                aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {votingForMemberId !== null && voteStars > 0 && (
                    <button
                      onClick={handleCastVote}
                      disabled={castingVote}
                      style={{
                        marginTop: 10,
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: "var(--color-danger)",
                        color: "var(--color-text-on-accent)",
                        border: "none",
                        padding: "6px 18px",
                        cursor: castingVote ? "wait" : "pointer",
                      }}
                    >
                      {castingVote ? "Submitting..." : "Submit Vote"}
                    </button>
                  )}
                  {voteError && (
                    <p
                      className="eyebrow"
                      style={{ color: "var(--color-danger)", marginTop: 6 }}
                    >
                      {voteError}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit / Reopen controls */}
      {isMember && !isPublished && (
        <div className="sidebar-card mb-4" style={{ padding: "16px 20px" }}>
          <p className="eyebrow mb-2">Submit</p>
          <p
            className="font-body"
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              marginBottom: 12,
            }}
          >
            {isDuel
              ? "When both competitors submit, the duel is published and voting opens."
              : "When all members submit, the collaboration is published."}
          </p>
          {myMember?.has_submitted ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="eyebrow"
                style={{ color: "var(--color-success)" }}
              >
                You have submitted
              </span>
              <button
                onClick={handleReopen}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  padding: "4px 12px",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                }}
              >
                Reopen for editing
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: modeColor,
                color: "var(--color-text-on-accent)",
                border: "none",
                padding: "8px 20px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 3,
                  border: "1px dashed rgba(255,255,255,0.25)",
                  pointerEvents: "none",
                }}
              />
              Mark as submitted
            </button>
          )}
        </div>
      )}

      {isPublished && (
        <div
          className="sidebar-card mb-4"
          style={{
            padding: "14px 20px",
            borderLeft: "4px solid var(--color-success)",
          }}
        >
          <p className="eyebrow" style={{ color: "var(--color-success)" }}>
            Published
          </p>
          <p
            className="font-body"
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              marginTop: 4,
            }}
          >
            {isDuel
              ? "Duel complete. Points have been awarded."
              : "Collaboration published. All members have been scored."}
          </p>
        </div>
      )}

      {startupInviteErrors.length > 0 && (
        <div
          className="sidebar-card mb-4"
          style={{
            padding: "12px 16px",
            borderLeft: "3px solid var(--color-warning)",
          }}
        >
          <p
            className="eyebrow"
            style={{ color: "var(--color-warning)", marginBottom: 6 }}
          >
            Some invites could not be sent
          </p>
          {startupInviteErrors.map((err, i) => (
            <p
              key={i}
              className="font-body"
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 2,
              }}
            >
              {err}
            </p>
          ))}
          <p
            className="eyebrow"
            style={{
              fontSize: 7,
              marginTop: 6,
              color: "var(--color-text-tertiary)",
            }}
          >
            You can invite eligible players from the Members section above.
          </p>
        </div>
      )}

      {actionError && (
        <p className="eyebrow mb-4" style={{ color: "var(--color-danger)" }}>
          {actionError}
        </p>
      )}

      {/* Rainbow footer bar */}
      <div style={{ display: "flex", height: 3, marginTop: 24, opacity: 0.4 }}>
        {RAINBOW_COLORS.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
    </div>
  );
}
