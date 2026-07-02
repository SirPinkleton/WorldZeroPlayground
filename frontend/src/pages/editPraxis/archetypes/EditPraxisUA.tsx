/**
 * The University of Asthmatics (UA) edit-praxis archetype — THE ATELIER.
 *
 * The gilt-salon counterpart to the read-page sheet (UAPraxisDetail) and UAVote:
 * a work-in-progress acquisition being prepared on the salon's workbench. Gilt
 * frames, parchment grounds, Playfair italic display, EB-Garamond serif body,
 * Marcellus small-caps regalia, burnt-amber accent. The salon never dims — UA
 * is always-light, so every --ua-* token reads identically in both themes and
 * we style with them directly without touching data-theme.
 *
 * Behaviour (autosave, mode-switch guards, invite, media, publish) comes from
 * the shared control primitives; this archetype owns only presentation. All
 * colors via --ua-* tokens (index.css) — never hardcode hex (CLAUDE.md).
 */
import { mediaUrl } from "../../../utils/media";
import { type PraxisType } from "../../../api/praxis";
import type { CSSProperties, ReactNode } from "react";
import MediaArt from "../blocks/MediaArt";
import { pickArtKey } from "../blocks/useMediaArt";
import {
  Breadcrumb,
  ErrorBanner,
  TaskMetaInline,
  TitleCounter,
  formatAutosave,
} from "./shared";
import {
  BodyPreview,
  BodyTextarea,
  DropButton,
  FilePicker,
  InviteSearch,
  MetatasksList,
  ModePicker,
  PublishButton,
  TitleField,
} from "./controls";
import type { EditPraxisState } from "../useEditPraxis";

interface Props {
  state: EditPraxisState;
}

const DISPLAY = "'Playfair Display', serif";
const REGALIA = "'Marcellus SC', serif";
const SERIF = "'EB Garamond', serif";
const MONO = "'Courier Prime', monospace";

const MODE_OPTIONS: Array<{ key: PraxisType; label: string; desc: string }> = [
  { key: "solo", label: "Sole", desc: "a sole acquisition" },
  { key: "collab", label: "Joint", desc: "a joint acquisition" },
  { key: "duel", label: "Contested", desc: "a contested acquisition" },
];

/** A gilt-framed card — the recurring salon surface for each editor region. */
function Plate({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--ua-paper)",
        border: "1px solid var(--ua-line)",
        boxShadow:
          "0 8px 22px color-mix(in srgb, var(--ua-ink) 12%, transparent), inset 0 0 0 4px var(--ua-paper), inset 0 0 0 5px var(--ua-line-soft)",
        padding: "20px 24px",
        marginBottom: 22,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Small-caps section label with a fading gold rule, like the read sheet. */
function RegaliaLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontFamily: REGALIA, fontSize: 9, letterSpacing: "0.2em", color: "var(--ua-gold)", whiteSpace: "nowrap" }}>
        {children}
      </span>
      <div style={{ height: 1, flex: 1, background: "var(--ua-line-soft)" }} />
    </div>
  );
}

export default function EditPraxisUA({ state }: Props) {
  const praxis = state.praxis!;
  const task = state.task;
  const allowedModes = task?.allowed_modes ?? ["solo", "collab", "duel"];

  return (
    <div
      style={{
        background:
          "radial-gradient(color-mix(in srgb, var(--ua-ink) 4%, transparent) 1px, transparent 1px), var(--ua-wall)",
        backgroundSize: "22px 22px, 100% 100%",
        fontFamily: SERIF,
        color: "var(--ua-ink)",
        padding: "32px 24px 56px",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Breadcrumb
          praxisId={praxis.id}
          taskId={praxis.task_id}
          taskTitle={praxis.task_title}
          inkColor="var(--ua-gold)"
        />

        {/* Masthead — the acquisition sheet's letterhead */}
        <Plate style={{ padding: 0, marginBottom: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              padding: "12px 24px",
              borderBottom: "1px solid var(--ua-line-soft)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--ua-gold-pale) 28%, var(--ua-paper)), var(--ua-paper))",
            }}
          >
            <span style={{ fontFamily: REGALIA, fontSize: 10, letterSpacing: "0.14em", color: "var(--ua-gold)" }}>
              University of Asthmatics · The Atelier
            </span>
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ua-sub)", fontStyle: "italic" }}>
              {state.autosaveAt ? `sketched ${formatAutosave(state.autosaveAt)}` : "unsaved"}
            </span>
          </div>
          <div style={{ padding: "20px 24px 22px" }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ua-muted)", marginBottom: 8 }}>
              Preparing an acquisition
            </div>
            <h1 style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 600, fontSize: 34, lineHeight: 1.08, color: "var(--ua-ink)", margin: "0 0 6px" }}>
              re: {praxis.task_title}
            </h1>
            <TaskMetaInline praxis={praxis} task={task} textColor="var(--ua-muted)" />
          </div>
        </Plate>

        {/* Mode — engraved plates */}
        {!state.controlsLocked && (
          <div style={{ marginBottom: 24 }}>
            <RegaliaLabel>The manner of acquisition</RegaliaLabel>
            <ModePicker
              state={state}
              skin={{
                containerStyle: { display: "flex", gap: 12, flexWrap: "wrap" },
                options: MODE_OPTIONS,
                allowedModes,
                renderOption: (opt, { active, disabled, onSelect }) => (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={active}
                    onClick={onSelect}
                    disabled={disabled && !active}
                    style={{
                      minWidth: 150,
                      textAlign: "left",
                      padding: "12px 16px",
                      cursor: disabled && !active ? "not-allowed" : "pointer",
                      background: active ? "var(--ua-gilt)" : "var(--ua-paper)",
                      border: active ? "none" : "1px solid var(--ua-line)",
                      boxShadow: active
                        ? "0 4px 10px color-mix(in srgb, var(--ua-ink) 22%, transparent), inset 0 0 0 1px color-mix(in srgb, white 40%, transparent)"
                        : "none",
                    }}
                  >
                    <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 700, fontSize: 18, color: active ? "var(--ua-paper)" : "var(--ua-ink)", lineHeight: 1 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase", color: active ? "var(--ua-paper)" : "var(--ua-muted)", marginTop: 5 }}>
                      {opt.desc}
                    </div>
                  </button>
                ),
              }}
            />
          </div>
        )}

        {/* Invite — the other hands */}
        {state.showInviteBox && (
          <Plate>
            <RegaliaLabel>{praxis.type === "duel" ? "The challenger" : "The other hands"}</RegaliaLabel>
            <InviteSearch
              state={state}
              skin={{
                fontFamily: SERIF,
                inputBg: "var(--ua-paper-warm)",
                inputColor: "var(--ua-ink)",
                inputBorder: "1px solid var(--ua-line)",
                dropdownBg: "var(--ua-paper)",
                dropdownBorder: "1px solid var(--ua-line)",
                acceptedBg: "var(--ua-orange)",
                acceptedColor: "var(--ua-paper)",
                placeholder: "name or @handle",
              }}
            />
          </Plate>
        )}

        {/* Title */}
        <Plate>
          <RegaliaLabel>The title of the work</RegaliaLabel>
          <TitleField
            state={state}
            skin={{
              placeholder: "name this acquisition",
              inputStyle: {
                width: "100%",
                fontFamily: DISPLAY,
                fontStyle: "italic",
                fontSize: 30,
                fontWeight: 600,
                color: "var(--ua-ink)",
                background: "transparent",
                border: "none",
                outline: "none",
                borderBottom: "1px solid var(--ua-line-soft)",
                padding: "2px 0 8px",
              },
            }}
          />
          <div style={{ marginTop: 8 }}>
            <TitleCounter length={state.title.length} color="var(--ua-muted)" />
          </div>
        </Plate>

        {/* Body — the process */}
        <Plate>
          <RegaliaLabel>The Process · {state.wordCount} words · markdown</RegaliaLabel>
          <BodyTextarea
            state={state}
            skin={{
              rows: 10,
              placeholder: "an account of the work…",
              textareaStyle: {
                width: "100%",
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 1.75,
                color: "var(--ua-sub)",
                background: "var(--ua-paper-warm)",
                border: "1px solid var(--ua-line-soft)",
                outline: "none",
                resize: "vertical",
                minHeight: 200,
                padding: "12px 14px",
              },
            }}
          />
          <BodyPreview
            state={state}
            skin={{
              wrapperStyle: { borderTop: "1px solid var(--ua-line-soft)", marginTop: 14, paddingTop: 12 },
              label: (
                <div style={{ fontFamily: REGALIA, fontSize: 9, letterSpacing: "0.2em", color: "var(--ua-gold)", marginBottom: 8 }}>
                  As it will read
                </div>
              ),
              markdownStyle: { fontFamily: SERIF, fontSize: 14, lineHeight: 1.85, color: "var(--ua-sub)" },
            }}
          />
        </Plate>

        {/* The plates — media */}
        <div style={{ marginBottom: 22 }}>
          <RegaliaLabel>The plates</RegaliaLabel>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            {state.media.map((item) => {
              const filename = item.file_path.split("/").pop() ?? item.file_path;
              const src = mediaUrl(item.file_path);
              return (
                <GiltPlate key={item.id} caption={filename} onRemove={() => void state.removeMedia(item)}>
                  {item.type === "image" ? (
                    <img src={src} alt="" style={{ width: 140, height: 100, objectFit: "cover", display: "block" }} />
                  ) : item.type === "video" ? (
                    <video src={src} style={{ width: 140, height: 100, objectFit: "cover", display: "block" }} />
                  ) : (
                    <MediaArt art={pickArtKey(filename, "audio")} />
                  )}
                </GiltPlate>
              );
            })}
            <FilePicker
              state={state}
              skin={{
                buttonStyle: {
                  width: 152,
                  height: 130,
                  background: "var(--ua-paper-warm)",
                  border: "2px dashed var(--ua-line)",
                  cursor: "pointer",
                  fontFamily: REGALIA,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ua-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 4,
                },
                buttonLabel: "+ affix a plate",
                errorColor: "var(--ua-orange-deep)",
                helperText: "images · video · audio · max 50mb",
                helperStyle: { fontFamily: MONO, fontSize: 8, letterSpacing: "0.08em", color: "var(--ua-muted)", marginTop: 8, fontStyle: "italic" },
              }}
            />
          </div>
        </div>

        {/* Metatasks */}
        {state.showMetatasks && (
          <Plate>
            <RegaliaLabel>Further merit</RegaliaLabel>
            <MetatasksList
              state={state}
              skin={{
                rowStyle: (selected) => ({
                  padding: "8px 10px",
                  background: selected ? "color-mix(in srgb, var(--ua-gold-pale) 22%, var(--ua-paper))" : "transparent",
                  border: selected ? "1px solid var(--ua-line)" : "1px solid transparent",
                  marginBottom: 4,
                  fontFamily: SERIF,
                }),
                titleColor: "var(--ua-ink)",
                descColor: "var(--ua-sub)",
                pointsActiveColor: "var(--ua-orange)",
                pointsIdleColor: "var(--ua-muted)",
              }}
            />
          </Plate>
        )}

        <ErrorBanner message={state.error} />

        {/* CTAs */}
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 26, flexWrap: "wrap" }}>
          <PublishButton
            state={state}
            skin={{
              idleLabel: "File the acquisition",
              busyLabel: "filing…",
              style: {
                background: "var(--ua-orange)",
                color: "var(--ua-paper)",
                fontFamily: REGALIA,
                fontSize: 13,
                letterSpacing: "0.1em",
                padding: "12px 24px",
                border: "none",
                borderRadius: 0,
                cursor: state.submitting ? "wait" : "pointer",
                boxShadow: "0 4px 10px color-mix(in srgb, var(--ua-ink) 22%, transparent)",
              },
            }}
          />
          <DropButton
            state={state}
            skin={{
              label: "discard this work",
              style: {
                background: "transparent",
                border: "none",
                color: "var(--ua-muted)",
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 14,
                textDecoration: "underline",
                cursor: "pointer",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** A gilt-framed plate for one piece of evidence — the salon's polaroid. */
function GiltPlate({
  children,
  caption,
  onRemove,
}: {
  children: ReactNode;
  caption: string;
  onRemove: () => void;
}) {
  return (
    <div style={{ position: "relative", background: "var(--ua-gilt)", padding: 5, boxShadow: "0 8px 18px color-mix(in srgb, var(--ua-ink) 20%, transparent)" }}>
      <div style={{ background: "var(--ua-paper)", padding: 4 }}>
        <div style={{ width: 140, height: 100, overflow: "hidden" }}>{children}</div>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.04em", color: "var(--ua-muted)", textAlign: "center", marginTop: 4, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {caption}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${caption}`}
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "var(--ua-paper)",
          border: "1.5px solid var(--ua-orange)",
          color: "var(--ua-orange)",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
