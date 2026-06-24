"""Tests for foe taunts: service generation + /taunts endpoint."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.character import Character
from models.taunt_message import TauntTriggerType
from services.taunt_service import (
    generate_taunt,
    get_taunts_for_character,
    pick_taunt_template,
)


def test_pick_taunt_template_falls_back_to_default():
    """An unconfigured faction slug falls back to the default templates."""
    template = pick_taunt_template("ua", TauntTriggerType.score_overtake.value)
    assert isinstance(template, str) and template


def test_pick_taunt_template_unknown_trigger_returns_none():
    """A trigger with no template (and no default) yields None."""
    assert pick_taunt_template("ua", "no_such_trigger") is None


@pytest.mark.asyncio
async def test_generate_taunt_persists_and_is_returned_by_endpoint(
    client: AsyncClient,
    db_session: AsyncSession,
    character: Character,
    character2: Character,
    auth_headers: dict,
):
    """generate_taunt writes a row; GET /taunts returns it enriched with sender info."""
    taunt = await generate_taunt(
        from_character=character2,
        to_character=character,
        trigger_type=TauntTriggerType.score_overtake,
        session=db_session,
    )
    assert taunt is not None
    await db_session.commit()

    resp = await client.get("/taunts", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 1
    entry = body[0]
    assert entry["to_character_id"] == character.id
    assert entry["from_character_id"] == character2.id
    assert entry["from_display_name"] == character2.display_name
    assert entry["trigger_type"] == "score_overtake"


@pytest.mark.asyncio
async def test_get_taunts_for_character_empty(
    db_session: AsyncSession, character: Character
):
    """A character with no taunts gets an empty list."""
    assert await get_taunts_for_character(character.id, db_session) == []
