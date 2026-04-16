# World Zero — Data Models

> Last synced with code: 2026-04-15

## 5. Data Models

### Account
```
id
email                -- from OAuth provider, never public
status               -- enum: active | suspended | deleted (AccountStatus)
created_at
updated_at
```

### OAuthProvider
```
id
account_id           -- FK -> Account
provider             -- e.g. "google", "github" (future)
provider_user_id     -- the ID from the OAuth provider
access_token         -- encrypted at rest
created_at
updated_at
```
*This table is what makes adding new OAuth providers a config change, not a schema change.*

### Role
```
id
name                 -- e.g. "admin", "moderator", "trusted_user"; unique
description
created_at
updated_at
```

### AccountRole
```
id
account_id           -- FK -> Account
role_id              -- FK -> Role
granted_at
granted_by           -- FK -> Account (who granted it)
```

### Character
```
id
account_id           -- FK -> Account (private, never exposed in public API responses)
username             -- permanent, unique, public handle
display_name         -- editable
bio                  -- editable, rich text / markdown (default "")
avatar_url           -- editable (default "")
location             -- editable (default "")
faction_slug         -- FK -> Faction.slug, NOT NULL, default "ua" (starting faction)
status               -- enum: active | paused | banned (CharacterStatus)
created_at
updated_at
```
*Score, level, votes_available, and all_time_score live in CharacterStats (star schema split).*
*Faction graduation (level >= 3 to pick a real faction) is enforced at API layer, not DB.*

### CharacterStats
```
id
character_id         -- FK -> Character
era_id               -- FK -> Era
score                -- sum of non-flagged submission scores for this era (default 0)
all_time_score       -- cumulative, never resets (default 0)
level                -- integer 0-8; derived from score (default 0)
votes_available      -- spendable budget; formula from EraConfig (default 0)
updated_at
CONSTRAINT: unique(character_id, era_id)
```
*One row per (character, era) pair. Era resets insert new rows; old rows are preserved
for historical queries. Character is a pure dimension table; all volatile game state
lives here.*

### Faction
```
slug                 -- PK, matches FactionConfig.slug in game_config.py
name
description          -- default ""
status               -- enum: visible | hidden | deprecated (FactionStatus)
created_at
updated_at
```
*No multiplier columns: faction rules live in game_config.py, not the DB.
This table exists for FK references and UI display only.*

### Task
```
id
title
description          -- rich text / markdown (default "")
point_value          -- base point value
level_required       -- players must be >= this level to sign up (default 0)
status               -- enum: pending | active | retired (TaskStatus)
created_by           -- FK -> Character (admin character)
primary_faction_slug -- FK -> Faction.slug, default "na" (cross-faction sentinel)
is_task_vision_eligible -- bool; Journeymen can sign up for these when pretired/retired
created_at
updated_at
```

### TaskFaction (join table -- future multi-faction support)
```
task_id              -- PK, FK -> Task
faction_slug         -- PK, FK -> Faction.slug
is_primary
```

### CharacterTask
```
id
character_id         -- FK -> Character
task_id              -- FK -> Task
signed_up_at
status               -- enum: in_progress | submitted | abandoned (CharacterTaskStatus)
updated_at
```
*Active rows capped at `EraConfig.max_task_signups` per character, enforced at API layer.*

### Submission (STI — all submission types)
Single-table inheritance. The `submission_type` discriminator column determines
which nullable columns are active. All three types share the `id`, `task_id`,
`moderation_status`, `is_withdrawn`, `admin_note`, `flagged_at`, `created_at`,
and `updated_at` columns.

```
id
task_id              -- FK -> Task (NOT NULL)
submission_type      -- enum: solo | collaboration | duel (SubmissionType); discriminator

-- Shared columns
moderation_status    -- enum: visible | flagged | hidden | failed (ModerationStatus); default "visible"
is_withdrawn         -- bool, default false
admin_note           -- text, nullable (set by admin on failed/hidden)
flagged_at           -- nullable; NULL means "not yet flagged"
created_at
updated_at

-- Solo-only (NULL when type is collaboration or duel)
character_id         -- FK -> Character (the submitting player)
title                -- submission title
body_text            -- rich text / markdown proof text

-- Collaboration/duel-only (NULL when type is solo)
created_by_id        -- FK -> Character (the player who initiated)
collab_mode          -- enum: collaboration | duel; mirrors submission_type for legacy compat
collab_status        -- enum: in_progress | published
collab_body_text     -- shared document; all members edit this (default "")
```
*Score is computed on-the-fly from votes; not stored.*
*Replaces the former `Praxis` (solo) and `Collaboration` (collab/duel) tables.*

### SubmissionMember
```
id
submission_id        -- FK -> Submission (collaboration/duel only)
character_id         -- FK -> Character
has_submitted        -- bool; whether this member has pressed Submit (resets on edit or kick)
title                -- per-member title (nullable)
body_text            -- per-member body text (nullable)
joined_at
CONSTRAINT: unique(submission_id, character_id)
```

### SubmissionInvite
```
id
submission_id        -- FK -> Submission
inviter_id           -- FK -> Character
invitee_id           -- FK -> Character
invite_type          -- enum: collaboration | duel
status               -- enum: pending | accepted | declined (SubmissionInviteStatus)
created_at
```
*Only one pending invite per (submission_id, inviter_id, invitee_id) is allowed — enforced at service layer.*

### MediaItem
```
id
submission_id        -- FK -> Submission
type                 -- enum: image | video | audio (MediaType)
file_path            -- relative path (structured for S3 swap in v2)
display_order        -- default 0
created_at
```

### Vote
```
id
submission_id        -- FK -> Submission (NOT NULL)
voter_character_id   -- FK -> Character
voter_account_id     -- FK -> Account (denormalized for anti-self-vote check)
stars                -- integer 1-5
duel_vote_for        -- FK -> Character (nullable; Duels only — which player this vote is for)
created_at
updated_at           -- votes can be updated; update costs 0 additional budget
CONSTRAINT: unique(submission_id, voter_character_id)             -- solo/collab votes
CONSTRAINT: unique(submission_id, voter_character_id, duel_vote_for)  -- duel votes
```
*For duel votes, duel_vote_for is required.*
*Anti-self-vote: duel members cannot vote on their own submission.*

### Flag
```
id
submission_id        -- FK -> Submission
flagged_by           -- FK -> Character
reason               -- text (default "")
created_at
```

### Relationship
```
id
from_character_id    -- FK -> Character
to_character_id      -- FK -> Character
type                 -- enum: friend | foe (RelationshipType)
status               -- enum: active | blocked (RelationshipStatus)
created_at
updated_at
CONSTRAINT: unique(from_character_id, to_character_id)
```
*Relationships are instant declarations -- no pending state. Mutual friend + mutual foe = Rival
(one per character). Foe is opt-in by both parties.*

### Message
```
id
from_character_id    -- FK -> Character
to_character_id      -- FK -> Character
body
read_at              -- nullable; NULL = unread
created_at
```

### TauntMessage
```
id
from_character_id    -- FK -> Character
to_character_id      -- FK -> Character
message              -- text
trigger_type         -- enum: score_overtake | level_up | submission_complete (TauntTriggerType)
created_at
```
*Auto-generated messages between foes triggered by game events. Templates live in game_config.py.*

### Era
```
id
name                 -- human label for the era
config_key           -- references EraConfig.config_key in game_config.py
started_at
started_by           -- FK -> Account
notes                -- default ""
updated_at
```

### MetaTask
```
id
name
description
faction_slug         -- FK -> Faction (group-specific)
bonus_type           -- enum: flat | percentage (BonusType)
bonus_value          -- float
level_required       -- default 0
created_at
updated_at
```

### SubmissionMetaTask
```
submission_id        -- PK, FK -> Submission
meta_task_id         -- PK, FK -> MetaTask
applied_at
```

### ContactMessage
```
id
name                 -- String(100)
email                -- String(254)
message              -- text
is_archived          -- bool, default false
created_at
```
*Public contact form capture. Not part of the game system.*

---

## Enum Summary

| Enum | Values | Used By |
|------|--------|---------|
| AccountStatus | active, suspended, deleted | Account.status |
| CharacterStatus | active, paused, banned | Character.status |
| FactionStatus | visible, hidden, deprecated | Faction.status |
| TaskStatus | pending, active, retired | Task.status |
| CharacterTaskStatus | in_progress, submitted, abandoned | CharacterTask.status |
| MediaType | image, video, audio | MediaItem.type |
| SubmissionType | solo, collaboration, duel | Submission.submission_type |
| CollabModeEnum | collaboration, duel | Submission.collab_mode, SubmissionInvite.invite_type |
| SubmissionStatus | in_progress, published | Submission.collab_status |
| SubmissionInviteStatus | pending, accepted, declined | SubmissionInvite.status |
| ModerationStatus | visible, flagged, hidden, failed | Submission.moderation_status |
| RelationshipType | friend, foe | Relationship.type |
| RelationshipStatus | active, blocked | Relationship.status |
| BonusType | flat, percentage | MetaTask.bonus_type |
| TauntTriggerType | score_overtake, level_up, submission_complete | TauntMessage.trigger_type |
