# DEPRECATED — use services/submission.py
# This file is a thin shim kept for backward compatibility while routers
# are updated in U.3. Do not add new logic here.
"""Backward-compat shim: re-exports from services/submission.py."""

from services.submission import (
    _build_invite_out,
    build_submission_card_out as build_collaboration_card_out,
    build_submission_out as build_collaboration_out,
    create_collab_submission as create_collaboration,
    get_submission_vote_summary as get_duel_vote_summary,
    invite_member,
    kick_member,
    list_published_submissions as list_published_collaborations,
    reopen_submission as reopen_collaboration,
    respond_to_invite,
    submit_for_member,
    update_document,
    update_member_content,
)

__all__ = [
    "build_collaboration_card_out",
    "build_collaboration_out",
    "create_collaboration",
    "get_duel_vote_summary",
    "invite_member",
    "kick_member",
    "list_published_collaborations",
    "reopen_collaboration",
    "respond_to_invite",
    "submit_for_member",
    "update_document",
    "update_member_content",
]
