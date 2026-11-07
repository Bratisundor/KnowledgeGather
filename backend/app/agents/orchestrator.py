import re
from typing import Dict, Any, Optional
from backend.app.agents.deep_analyzer import run_deep_analyzer
from backend.app.agents.roaster import run_roaster
from backend.app.agents.reply_giver import run_reply_giver
from backend.app.agents.memory_recall import run_memory_recall
from backend.app.agents.verifier import verify_and_enrich_citations
from backend.app.models.database import get_connection

def detect_agent_from_query(query: str, requested_agent: Optional[str] = None) -> str:
    if requested_agent and requested_agent in ["deep_analyzer", "roaster", "reply_giver", "memory_recall"]:
        return requested_agent

    q = query.lower()

    if any(k in q for k in ["roast", "burn", "cook", "mock", "make fun", "voice-note habit", "spicy roast"]):
        return "roaster"
    if any(k in q for k in ["reply to", "how to reply", "suggest reply", "what should i say", "write a reply", "respond to"]):
        return "reply_giver"
    if any(k in q for k in ["when did we", "when was", "recall", "remember", "trip to goa", "goa trip", "what date", "which day"]):
        return "memory_recall"

    return "deep_analyzer"

def route_and_execute(
    project_id: str,
    query: str,
    chat_id: Optional[str] = None,
    requested_agent: Optional[str] = None,
    tone: str = "spicy",
    target_participant: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()

    # If chat_id not explicitly provided, resolve default chat in the project
    if not chat_id:
        cursor.execute("SELECT id FROM chats WHERE project_id = ? ORDER BY message_count DESC LIMIT 1", (project_id,))
        row = cursor.fetchone()
        if row:
            chat_id = row["id"]
        else:
            conn.close()
            return {
                "agent": "router",
                "scope": "project",
                "answer": "No chats found in this project. Please upload a WhatsApp export to begin.",
                "citations": [],
                "verifier_status": "warning",
                "verifier_badge": "No Data",
                "verifier_notes": "Please upload a chat."
            }
    conn.close()

    agent_type = detect_agent_from_query(query, requested_agent)

    # Execute selected agent
    if agent_type == "roaster":
        res = run_roaster(chat_id=chat_id, target_participant=target_participant, tone=tone, query=query)
    elif agent_type == "reply_giver":
        res = run_reply_giver(chat_id=chat_id, query=query, target_participant=target_participant or "Shrimant")
    elif agent_type == "memory_recall":
        res = run_memory_recall(chat_id=chat_id, query=query)
    else:
        res = run_deep_analyzer(chat_id=chat_id, query=query)

    # Independent Verifier Pass: Evidence first!
    raw_answer = res.get("answer", "")
    citations_draft = res.get("citations", [])

    verified_citations, verifier_status, verifier_badge, verifier_notes = verify_and_enrich_citations(
        chat_id=chat_id,
        text=raw_answer,
        initial_citations=citations_draft
    )

    return {
        "agent": agent_type,
        "scope": f"chat:{chat_id}",
        "answer": raw_answer,
        "citations": verified_citations,
        "verifier_status": verifier_status,
        "verifier_badge": verifier_badge,
        "verifier_notes": verifier_notes,
        "stats_payload": res.get("stats_payload"),
        "reply_options": res.get("reply_options"),
        "roast_details": res.get("roast_details"),
        "safety_passed": res.get("safety_passed", True),
        "moderation_notes": res.get("moderation_notes")
    }

