from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from models.taunt_message import TauntTriggerType


class TauntMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    from_character_id: int
    to_character_id: int
    message: str
    trigger_type: TauntTriggerType
    created_at: datetime
    # Enriched display fields (joined from Character)
    from_display_name: str = ""
    from_faction_slug: str = ""
    from_avatar_url: Optional[str] = None
