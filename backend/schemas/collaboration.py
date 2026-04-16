# DEPRECATED — use schemas/submission.py
# This file is a thin shim kept for backward compatibility while routers
# are updated in U.3. Do not add new logic here.
from schemas.submission import (
    DuelVoteSummary,
    InviteResponse,
    SubmissionCardOut as CollaborationCardOut,
    SubmissionCreate as CollaborationCreate,
    SubmissionDocumentUpdate as CollaborationDocumentUpdate,
    SubmissionInviteCreate as CollaborationInviteCreate,
    SubmissionInviteOut as CollaborationInviteOut,
    SubmissionMemberCardOut as CollaborationMemberCardOut,
    SubmissionMemberContentUpdate as CollaborationMemberContentUpdate,
    SubmissionMemberOut as CollaborationMemberOut,
    SubmissionOut as CollaborationOut,
    SubmissionVoteIn as CollaborationVoteIn,
)

__all__ = [
    "CollaborationCreate",
    "CollaborationMemberOut",
    "CollaborationInviteOut",
    "CollaborationOut",
    "CollaborationMemberContentUpdate",
    "CollaborationInviteCreate",
    "InviteResponse",
    "CollaborationDocumentUpdate",
    "DuelVoteSummary",
    "CollaborationVoteIn",
    "CollaborationMemberCardOut",
    "CollaborationCardOut",
]
