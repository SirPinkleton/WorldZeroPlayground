"""Integration tests for /praxes endpoints."""
import io

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.character import Character
from models.character_stats import CharacterStats
from models.era import Era
from models.praxis import MediaItem, ModerationStatus, Praxis
from models.task import CharacterTask, CharacterTaskStatus, Task


@pytest.mark.asyncio
async def test_list_praxes_public(client: AsyncClient):
    resp = await client.get("/praxes")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_praxis(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "My Praxis", "body_text": "I did the thing."},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["task_id"] == signed_up_task.id
    assert data["character_id"] == character.id
    assert data["title"] == "My Praxis"
    assert data["moderation_status"] == "visible"
    assert data["media"] == []


@pytest.mark.asyncio
async def test_create_praxis_requires_signup(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    """Creating a praxis without signing up first returns 403."""
    resp = await client.post(
        "/praxes",
        json={"task_id": active_task.id, "title": "No signup"},
        headers=auth_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_praxis_updates_stats(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
    era: Era,
):
    """Submitting a praxis awards base points and updates the character's stats."""
    # Verify score starts at 0
    result = await db_session.execute(
        select(CharacterStats).where(
            CharacterStats.character_id == character.id,
            CharacterStats.era_id == era.id,
        )
    )
    stats = result.scalar_one()
    assert stats.score == 0

    resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Score test"},
        headers=auth_headers,
    )
    assert resp.status_code == 201

    # Refresh stats from DB — score should now include base task points
    await db_session.refresh(stats)
    assert stats.score > 0
    assert stats.score >= signed_up_task.point_value


@pytest.mark.asyncio
async def test_get_praxis(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Test Praxis"},
        headers=auth_headers,
    )
    praxis_id = create_resp.json()["id"]
    resp = await client.get(f"/praxes/{praxis_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == praxis_id


@pytest.mark.asyncio
async def test_edit_praxis(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Original Title"},
        headers=auth_headers,
    )
    praxis_id = create_resp.json()["id"]
    resp = await client.put(
        f"/praxes/{praxis_id}",
        json={"task_id": signed_up_task.id, "title": "Updated Title"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"


@pytest.mark.asyncio
async def test_edit_praxis_wrong_owner(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "My Praxis"},
        headers=auth_headers,
    )
    praxis_id = create_resp.json()["id"]
    resp = await client.put(
        f"/praxes/{praxis_id}",
        json={"task_id": signed_up_task.id, "title": "Hacked"},
        headers=auth_headers2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_flag_praxis_level_gate(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
    character2: Character,
):
    """character2 (level 5) can flag; character (level 0) cannot."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Flaggable Praxis"},
        headers=auth_headers,
    )
    praxis_id = create_resp.json()["id"]

    # character (level 0) tries to flag — should fail
    resp_low = await client.post(
        f"/praxes/{praxis_id}/flag",
        params={"reason": "spam"},
        headers=auth_headers,
    )
    assert resp_low.status_code == 403

    # character2 (level 5) flags — should succeed
    resp_high = await client.post(
        f"/praxes/{praxis_id}/flag",
        params={"reason": "spam"},
        headers=auth_headers2,
    )
    assert resp_high.status_code == 200
    assert resp_high.json()["moderation_status"] == "flagged"


# ---------------------------------------------------------------------------
# New tests for T.4
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_praxes_filter_by_task_id(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    """GET /praxes?task_id=X returns only praxes for that task."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Filtered Praxis"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201

    resp = await client.get("/praxes", params={"task_id": signed_up_task.id})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for item in data:
        assert item["task_id"] == signed_up_task.id


@pytest.mark.asyncio
async def test_list_praxes_filter_by_character_id(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    """GET /praxes?character_id=X returns only praxes for that character."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Character Filter"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201

    resp = await client.get("/praxes", params={"character_id": character.id})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for item in data:
        assert item["character_id"] == character.id


@pytest.mark.asyncio
async def test_list_praxes_filter_by_both_task_and_character(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    """GET /praxes with both task_id and character_id filters combined."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Combined Filter"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201

    resp = await client.get(
        "/praxes",
        params={"task_id": signed_up_task.id, "character_id": character.id},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    for item in data:
        assert item["task_id"] == signed_up_task.id
        assert item["character_id"] == character.id


@pytest.mark.asyncio
async def test_get_praxis_hidden_returns_404(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """GET /praxes/{id} for a hidden praxis returns 404."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Hidden Praxis"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # Force the praxis to hidden status directly in DB
    praxis = await db_session.get(Praxis, praxis_id)
    praxis.moderation_status = ModerationStatus.hidden
    await db_session.commit()

    resp = await client.get(f"/praxes/{praxis_id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_nonexistent_praxis_returns_404(client: AsyncClient):
    """GET /praxes/99999 for a non-existent praxis returns 404."""
    resp = await client.get("/praxes/99999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_withdraw_praxis(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
    era: Era,
):
    """Withdrawing a praxis sets is_withdrawn and reverts CharacterTask to in_progress."""
    # Create praxis — this sets CharacterTask to submitted
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "To Be Withdrawn"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # Confirm CharacterTask is now submitted
    ct_result = await db_session.execute(
        select(CharacterTask).where(
            CharacterTask.character_id == character.id,
            CharacterTask.task_id == signed_up_task.id,
        )
    )
    character_task = ct_result.scalar_one()
    assert character_task.status == CharacterTaskStatus.submitted

    # Record score after submission
    stats_result = await db_session.execute(
        select(CharacterStats).where(
            CharacterStats.character_id == character.id,
            CharacterStats.era_id == era.id,
        )
    )
    stats = stats_result.scalar_one()
    await db_session.refresh(stats)
    score_before_withdraw = stats.score
    assert score_before_withdraw > 0

    # Withdraw
    resp = await client.post(f"/praxes/{praxis_id}/withdraw", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_withdrawn"] is True

    # CharacterTask should revert to in_progress
    await db_session.refresh(character_task)
    assert character_task.status == CharacterTaskStatus.in_progress

    # Score should decrease (or be zeroed out)
    await db_session.refresh(stats)
    assert stats.score < score_before_withdraw


@pytest.mark.asyncio
async def test_withdraw_praxis_wrong_owner_returns_403(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    """Withdrawing another character's praxis returns 403."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Someone Else Withdraws"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    resp = await client.post(f"/praxes/{praxis_id}/withdraw", headers=auth_headers2)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_withdraw_already_withdrawn_returns_422(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    """Withdrawing an already-withdrawn praxis returns 422."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Double Withdraw"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # First withdraw succeeds
    resp1 = await client.post(f"/praxes/{praxis_id}/withdraw", headers=auth_headers)
    assert resp1.status_code == 200

    # Second withdraw should fail
    resp2 = await client.post(f"/praxes/{praxis_id}/withdraw", headers=auth_headers)
    assert resp2.status_code == 422


@pytest.mark.asyncio
async def test_resubmit_praxis(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
    era: Era,
):
    """Resubmitting a withdrawn praxis restores is_withdrawn=False and CharacterTask to submitted."""
    # Create and withdraw praxis
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Resubmit Test"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    withdraw_resp = await client.post(f"/praxes/{praxis_id}/withdraw", headers=auth_headers)
    assert withdraw_resp.status_code == 200

    # Verify CharacterTask is in_progress
    ct_result = await db_session.execute(
        select(CharacterTask).where(
            CharacterTask.character_id == character.id,
            CharacterTask.task_id == signed_up_task.id,
        )
    )
    character_task = ct_result.scalar_one()
    await db_session.refresh(character_task)
    assert character_task.status == CharacterTaskStatus.in_progress

    # Record withdrawn score
    stats_result = await db_session.execute(
        select(CharacterStats).where(
            CharacterStats.character_id == character.id,
            CharacterStats.era_id == era.id,
        )
    )
    stats = stats_result.scalar_one()
    await db_session.refresh(stats)
    score_withdrawn = stats.score

    # Resubmit
    resp = await client.post(f"/praxes/{praxis_id}/resubmit", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_withdrawn"] is False

    # CharacterTask should be back to submitted
    await db_session.refresh(character_task)
    assert character_task.status == CharacterTaskStatus.submitted

    # Score should increase again
    await db_session.refresh(stats)
    assert stats.score > score_withdrawn


@pytest.mark.asyncio
async def test_resubmit_not_withdrawn_returns_422(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    """Resubmitting a praxis that is not withdrawn returns 422."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Not Withdrawn"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    resp = await client.post(f"/praxes/{praxis_id}/resubmit", headers=auth_headers)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_resubmit_wrong_owner_returns_403(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    """Resubmitting another character's praxis returns 403."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Wrong Owner Resubmit"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # Withdraw first so resubmit would otherwise be valid
    await client.post(f"/praxes/{praxis_id}/withdraw", headers=auth_headers)

    resp = await client.post(f"/praxes/{praxis_id}/resubmit", headers=auth_headers2)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_upload_media_smoke(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    """POST /praxes/{id}/media smoke test: image upload returns 201 with file_path."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Media Test"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # Upload a minimal PNG (1x1 white pixel)
    minimal_png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
        b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
        b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    resp = await client.post(
        f"/praxes/{praxis_id}/media",
        files={"file": ("test.png", io.BytesIO(minimal_png), "image/png")},
        data={"display_order": "0"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["type"] == "image"
    assert "test.png" in data["file_path"]


@pytest.mark.asyncio
async def test_upload_media_unsupported_type(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    """POST /praxes/{id}/media with unsupported content-type returns 422."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Bad Media"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    resp = await client.post(
        f"/praxes/{praxis_id}/media",
        files={"file": ("doc.txt", io.BytesIO(b"hello"), "text/plain")},
        data={"display_order": "0"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_upload_media_wrong_owner_returns_403(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    """POST /praxes/{id}/media by a different character returns 403."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Not Mine"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    minimal_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 20
    resp = await client.post(
        f"/praxes/{praxis_id}/media",
        files={"file": ("x.png", io.BytesIO(minimal_png), "image/png")},
        data={"display_order": "0"},
        headers=auth_headers2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_media(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """DELETE /praxes/{id}/media/{media_id} removes the media item."""
    # Create praxis
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Media Delete Test"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # Upload media first
    minimal_png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
        b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
        b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    upload_resp = await client.post(
        f"/praxes/{praxis_id}/media",
        files={"file": ("delete_me.png", io.BytesIO(minimal_png), "image/png")},
        data={"display_order": "0"},
        headers=auth_headers,
    )
    assert upload_resp.status_code == 201
    media_id = upload_resp.json()["id"]

    # Delete it
    del_resp = await client.delete(
        f"/praxes/{praxis_id}/media/{media_id}",
        headers=auth_headers,
    )
    assert del_resp.status_code == 204

    # Verify it's gone from DB
    media_item = await db_session.get(MediaItem, media_id)
    assert media_item is None


@pytest.mark.asyncio
async def test_delete_media_wrong_owner_returns_403(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
    db_session: AsyncSession,
):
    """DELETE /praxes/{id}/media/{media_id} by non-owner returns 403."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Media Not Mine"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # Upload media as owner
    minimal_png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
        b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
        b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    upload_resp = await client.post(
        f"/praxes/{praxis_id}/media",
        files={"file": ("myfile.png", io.BytesIO(minimal_png), "image/png")},
        data={"display_order": "0"},
        headers=auth_headers,
    )
    assert upload_resp.status_code == 201
    media_id = upload_resp.json()["id"]

    # Try to delete as a different character
    del_resp = await client.delete(
        f"/praxes/{praxis_id}/media/{media_id}",
        headers=auth_headers2,
    )
    assert del_resp.status_code == 403


@pytest.mark.asyncio
async def test_list_praxes_excludes_hidden(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """GET /praxes default listing does not include hidden praxes."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Will Be Hidden"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # Hide via direct DB update
    praxis = await db_session.get(Praxis, praxis_id)
    praxis.moderation_status = ModerationStatus.hidden
    await db_session.commit()

    resp = await client.get("/praxes", params={"character_id": character.id})
    assert resp.status_code == 200
    ids = [item["id"] for item in resp.json()]
    assert praxis_id not in ids
