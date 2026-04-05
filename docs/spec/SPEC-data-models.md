# World Zero — Data Models

## 5. Data Models

### Account
```
id
email                -- from OAuth provider, never public
created_at
is_active            -- for soft bans
```

### OAuthProvider
```
id
account_id           -- FK → Account
provider             -- e.g. "google", "github" (future)
provider_user_id     -- the ID from the OAuth provider
access_token         -- encrypted at rest
created_at
```
*This table is what makes adding new OAuth providers a config change, not a schema change.*

### Role
```
id
name                 -- e.g. "admin", "moderator", "trusted_user"
description
```

### AccountRole
```
id
account_id           -- FK → Account
role_id              -- FK → Role
granted_at
granted_by           -- FK → Account (who granted it)
```

### Character
```
id
account_id           -- FK → Account (private, never exposed in public API responses)
username             -- permanent, unique, public handle
display_name         -- editable
bio                  -- editable, rich text / markdown
avatar_url           -- editable
location             -- optional, editable
level                -- integer 0–8; derived from score, stored for query performance
score                -- sum of non-flagged submission scores for current era
all_time_score       -- cumulative, never resets
votes_available      -- spendable budget; formula and reset behaviour from EraConfig
faction_slug         -- FK → Faction.slug (nullable until level 3)
created_at
is_active            -- soft delete / ban flag
```

### Faction
```
slug                 -- PK, matches FactionConfig.slug in game_config.py
name
description
-- No multiplier columns: faction rules live in game_config.py, not the DB
-- This table exists for FK references and UI display only
```

### Task
```
id
title
description          -- rich text / markdown, can embed images and video
point_value          -- base point value
level_required       -- players must be >= this level to sign up
status               -- enum: pending | active | retired
created_by           -- FK → Character (admin character)
primary_faction_slug -- FK → Faction.slug
is_task_vision_eligible -- bool; Journeymen can sign up for these when pretired/retired
created_at
```

### TaskFaction (join table — future multi-faction support)
```
task_id
faction_slug
is_primary
```

### CharacterTask
```
id
character_id         -- FK → Character
task_id              -- FK → Task
signed_up_at
status               -- enum: in_progress | submitted | abandoned
```
*Active rows capped at `EraConfig.max_task_signups` per character, enforced at API layer.*

### Submission (aka "Praxis")
```
id
task_id              -- FK → Task
character_id         -- FK → Character
title
body_text            -- rich text / markdown
is_flagged           -- bool, default false
flagged_at
created_at
updated_at
```
*Score is computed on-the-fly from votes; not stored in v1.*

### MediaItem
```
id
submission_id        -- FK → Submission
type                 -- enum: image | video | audio
file_path            -- relative path (structured for S3 swap in v2)
display_order
created_at
```

### Vote
```
id
submission_id        -- FK → Submission
voter_character_id   -- FK → Character
voter_account_id     -- FK → Account (denormalized for anti-self-vote check)
stars                -- integer 1–5
duel_vote_for        -- FK → Character (nullable; Duels only)
created_at
updated_at           -- votes can be updated; update costs 0 additional budget
CONSTRAINT: unique(submission_id, voter_character_id)
```

### Flag
```
id
submission_id        -- FK → Submission
flagged_by           -- FK → Character
reason               -- optional text
created_at
```

### Relationship
```
id
from_character_id    -- FK → Character
to_character_id      -- FK → Character
type                 -- enum: friend | foe
status               -- enum: pending | accepted | blocked
created_at
CONSTRAINT: unique(from_character_id, to_character_id)
```
*Mutual friend + mutual foe = Rival (one per character). Foe is opt-in by both parties.*

### Message
```
id
from_character_id    -- FK → Character
to_character_id      -- FK → Character
body
read_at
created_at
```

### Era
```
id
name                 -- human label for the era
config_key           -- references EraConfig.config_key in game_config.py
started_at
started_by           -- FK → Account
notes
```

### MetaTask
```
id
name
description
faction_slug         -- FK → Faction (group-specific)
bonus_type           -- enum: flat | percentage
bonus_value
level_required
created_at
```

### SubmissionMetaTask
```
submission_id
meta_task_id
applied_at
```
