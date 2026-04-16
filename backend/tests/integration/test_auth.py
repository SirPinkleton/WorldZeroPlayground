"""Integration tests for /auth endpoints."""
from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from jose import jwt

from config import settings
from models.account import Account
from models.character import Character


@pytest.mark.asyncio
async def test_auth_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_no_character(client: AsyncClient, account: Account, auth_headers: dict):
    """Authenticated account with no character returns account_id + character=None."""
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["account_id"] == account.id
    assert data["character"] is None


@pytest.mark.asyncio
async def test_auth_me_with_character(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
):
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["account_id"] == account.id
    assert data["character"]["id"] == character.id
    assert data["character"]["username"] == character.username


@pytest.mark.asyncio
async def test_auth_logout(client: AsyncClient):
    resp = await client.post("/auth/logout")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_invalid_token(client: AsyncClient):
    resp = await client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# New tests for T.7
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_auth_me_returns_character_stats(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
):
    """GET /auth/me includes character stats fields (level, score, votes_available)."""
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    char = data["character"]
    assert char is not None
    # CharacterOut exposes stats
    assert "level" in char
    assert "score" in char
    assert char["level"] >= 0


@pytest.mark.asyncio
async def test_auth_me_not_admin_by_default(
    client: AsyncClient,
    account: Account,
    auth_headers: dict,
):
    """GET /auth/me returns is_admin=False for a non-admin account."""
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["is_admin"] is False


@pytest.mark.asyncio
async def test_auth_me_does_not_expose_email(
    client: AsyncClient,
    account: Account,
    auth_headers: dict,
):
    """GET /auth/me must never return email in the response body."""
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    body_text = resp.text
    assert account.email not in body_text
    assert "email" not in resp.json()


@pytest.mark.asyncio
async def test_auth_logout_clears_cookie(client: AsyncClient):
    """POST /auth/logout instructs the browser to clear the access_token cookie."""
    resp = await client.post("/auth/logout")
    assert resp.status_code == 200
    # The response should set a delete-cookie header for access_token
    set_cookie = resp.headers.get("set-cookie", "")
    assert "access_token" in set_cookie


@pytest.mark.asyncio
async def test_auth_logout_response_body(client: AsyncClient):
    """POST /auth/logout returns a JSON message."""
    resp = await client.post("/auth/logout")
    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data


@pytest.mark.asyncio
async def test_expired_token(client: AsyncClient, account: Account):
    """An expired JWT token returns 401."""
    expired_payload = {
        "sub": str(account.id),
        "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
    }
    expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm="HS256")

    resp = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_malformed_token_no_sub(client: AsyncClient):
    """A JWT with no 'sub' claim returns 401."""
    bad_payload = {
        "exp": datetime.now(timezone.utc) + timedelta(days=1),
        # deliberately omit 'sub'
    }
    bad_token = jwt.encode(bad_payload, settings.SECRET_KEY, algorithm="HS256")

    resp = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {bad_token}"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_token_wrong_signature(client: AsyncClient, account: Account):
    """A JWT signed with the wrong key returns 401."""
    wrong_key_payload = {
        "sub": str(account.id),
        "exp": datetime.now(timezone.utc) + timedelta(days=1),
    }
    wrong_token = jwt.encode(wrong_key_payload, "wrong-secret-key", algorithm="HS256")

    resp = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {wrong_token}"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_bearer_prefix_required(client: AsyncClient, auth_headers: dict):
    """Token without 'Bearer ' prefix is not recognized as a bearer token."""
    # Extract the raw token from auth_headers
    token = auth_headers["Authorization"].split(" ")[1]
    # Send without "Bearer" prefix — this should fail
    resp = await client.get("/auth/me", headers={"Authorization": token})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_with_character_username(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
):
    """GET /auth/me character field includes username and display_name."""
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    char = resp.json()["character"]
    assert char["username"] == character.username
    assert char["display_name"] == character.display_name


@pytest.mark.asyncio
async def test_auth_me_with_character_faction(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
):
    """GET /auth/me character field includes faction_slug."""
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    char = resp.json()["character"]
    assert char["faction_slug"] == character.faction_slug
