# DEPRECATED — use schemas/submission.py
# This file is a thin shim kept for backward compatibility while routers
# are updated in U.3. Do not add new logic here.
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from schemas.submission import MediaItemOut, SubmissionOut, SubmissionCreate


class PraxisOut(SubmissionOut):
    """Backward-compat alias for SubmissionOut (solo type)."""
    pass


class PraxisCreate(BaseModel):
    task_id: int
    title: str = Field(..., max_length=200)
    body_text: Optional[str] = Field(None, max_length=10000)
    meta_task_id: Optional[int] = None


__all__ = ["PraxisOut", "PraxisCreate", "MediaItemOut"]
