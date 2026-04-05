# World Zero — Testing Strategy

## 12. Testing Strategy

### Philosophy
- Game logic lives in `services/` and is pure (accepts `EraConfig`, returns a value)
- Unit tests require no DB or running server — just import `game_config` and `services`
- Integration tests spin up a test DB (via `pytest` fixtures + SQLAlchemy)
- CI runs the full suite on every push and blocks merge on failure

### Test Structure
```
/backend/tests/
├── unit/
│   ├── test_scoring.py         # compute_submission_score, compute_vote_budget, compute_level
│   ├── test_era_config.py      # validates ERA_1, ERA_FOO etc. are internally consistent
│   ├── test_level_thresholds.py # level breakpoints fire at correct scores
│   └── test_era_reset.py       # reset logic applied correctly per EraConfig flags
├── integration/
│   ├── test_auth.py            # OAuth flow, JWT creation, /auth/me
│   ├── test_characters.py      # create, level gate, anti-self-vote
│   ├── test_tasks.py           # signup, max cap, level gate
│   ├── test_submissions.py     # create, edit, flag
│   ├── test_votes.py           # cast, update, budget deduction, anti-self-vote
│   └── test_admin.py           # task approval, era reset endpoint
└── conftest.py                 # shared fixtures: test DB, test client, seeded characters
```

### Config-Driven Test Principle
Tests that validate game rules should **import the config and assert against it**, not hardcode magic numbers. If a config value changes, the test either still passes (the rule held) or fails immediately and tells you exactly what broke.

```python
# Good — validates the rule using config values
def test_level_1_threshold():
    threshold = ERA_1.level_thresholds[1]
    assert compute_level(score=threshold - 1, era=ERA_1) == 0
    assert compute_level(score=threshold, era=ERA_1) == 1

# Bad — fragile, breaks silently if threshold changes
def test_level_1_threshold():
    assert compute_level(score=10) == 1
```

### Example Unit Tests

```python
# tests/unit/test_scoring.py
from game_config import ERA_1
from services.scoring import compute_vote_budget, compute_level, compute_submission_score

def test_vote_budget_era1_base():
    assert compute_vote_budget(score=0, era=ERA_1) == 100

def test_vote_budget_era1_with_score():
    assert compute_vote_budget(score=50, era=ERA_1) == 200  # 100 + 2*50

def test_level_0_at_start():
    assert compute_level(score=0, era=ERA_1) == 0

def test_level_1_threshold():
    assert compute_level(score=9, era=ERA_1) == 0
    assert compute_level(score=10, era=ERA_1) == 1

def test_submission_score():
    assert compute_submission_score(avg_stars=3.0, task_point_value=10) == 30.0


# tests/unit/test_era_config.py
from game_config import ERA_1, CURRENT_ERA

def test_all_factions_have_valid_multipliers():
    for slug, faction in ERA_1.factions.items():
        assert 0 < faction.point_multiplier <= 2.0

def test_level_thresholds_count():
    assert len(ERA_1.level_thresholds) == 9  # levels 0–8

def test_current_era_is_defined():
    assert CURRENT_ERA is not None
    assert CURRENT_ERA.config_key != ""
```

### GitHub Actions CI

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: worldzero
          POSTGRES_PASSWORD: test
          POSTGRES_DB: worldzero_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Run migrations
        run: alembic upgrade head
        working-directory: backend
        env:
          DATABASE_URL: postgresql://worldzero:test@localhost/worldzero_test
      - name: Run tests with coverage
        run: pytest --cov=. --cov-report=term-missing --cov-fail-under=80
        working-directory: backend
        env:
          DATABASE_URL: postgresql://worldzero:test@localhost/worldzero_test
```

Coverage threshold starts at 80% and should increase over time.
