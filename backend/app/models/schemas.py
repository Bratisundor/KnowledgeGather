from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = ""

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    created_at: str
    chat_count: int = 0

class ParticipantStats(BaseModel):
    name: str
    message_count: int
    word_count: int
    voice_notes_count: int
    images_count: int
    avg_reply_time_mins: float
    late_night_msg_count: int
    percentage_of_chat: float

class Chat(BaseModel):
    id: str
    project_id: str
    name: str
    chat_type: str  # 'group' or 'direct'
    message_count: int = 0
    participant_count: int = 0
    participants: List[str] = []
    date_start: Optional[str] = None
    date_end: Optional[str] = None
    created_at: str

class MessageRecord(BaseModel):
    id: str
    chat_id: str
    project_id: str
    message_seq: int
    timestamp: str
    sender: str
    content: str
    media_type: Optional[str] = None  # text, voice, image, video, document, system
    media_caption: Optional[str] = None
    media_transcript: Optional[str] = None
    is_system: bool = False

class Citation(BaseModel):
    message_seq: int
    sender: str
    timestamp: str
    quote: str
    is_verified: bool = True
    match_score: float = 1.0
    verification_details: str = "Verified against database records"

class PersonaCard(BaseModel):
    participant_name: str
    chat_id: str
    group_role: str  # Planner, Meme-lord, Silent observer, Drama starter, Voice-note Podcaster, Late replier
    communication_style: str
    humour_type: str
    interests: List[str] = []
    habits: List[str] = []
    catchphrases: List[str] = []
    supporting_citations: List[Citation] = []

class AskRequest(BaseModel):
    query: str
    chat_id: Optional[str] = None
    participant: Optional[str] = None
    agent: Optional[str] = None  # deep_analyzer, roaster, reply_giver, memory_recall, or auto
    tone: Optional[str] = "spicy"  # mild, spicy, savage (for roaster)
    target_participant: Optional[str] = None

class ReplyOption(BaseModel):
    tone: str  # Safe, Funny, Savage
    reply_text: str
    explanation: str

class AgentResponse(BaseModel):
    agent: str
    scope: str
    answer: str
    citations: List[Citation] = []
    verifier_status: str = "passed"  # passed, flagged, failed
    verifier_badge: str = "100% Evidence Verified"
    verifier_notes: str = ""
    stats_payload: Optional[Dict[str, Any]] = None
    reply_options: Optional[List[ReplyOption]] = None
    roast_details: Optional[Dict[str, Any]] = None
    safety_passed: bool = True
    moderation_notes: Optional[str] = None

class IngestionProgress(BaseModel):
    stage: str
    progress: int
    details: str

