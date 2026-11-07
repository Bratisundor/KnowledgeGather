import uuid
import json
from datetime import datetime
from typing import Dict, Any, List
from backend.app.models.database import get_connection
from backend.app.ingestion.parser import parse_whatsapp_text
from backend.app.ingestion.participant_detector import detect_participants_and_type
from backend.app.ingestion.multimodal import enrich_multimodal_messages
from backend.app.memory.layered_memory import build_sessions_for_chat, extract_entities_and_events
from backend.app.memory.persona_builder import generate_personas_for_chat

def process_and_ingest_chat(project_id: str, chat_name: str, raw_text: str) -> Dict[str, Any]:
    # Step 1: Parse WhatsApp text
    raw_messages = parse_whatsapp_text(raw_text)
    if not raw_messages:
        raise ValueError("Could not parse any messages from the provided file.")

    # Step 2: Detect participants and chat type (group vs direct)
    participants, chat_type, counts = detect_participants_and_type(raw_messages)

    # Step 3: Multimodal enrichment (voice note transcription, OCR, video summaries)
    messages = enrich_multimodal_messages(raw_messages)

    chat_id = f"chat_{uuid.uuid4().hex[:8]}"
    created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    # Determine date range
    valid_dates = [m["timestamp"] for m in messages if m["timestamp"] and m["timestamp"] != "System"]
    date_start = min(valid_dates) if valid_dates else None
    date_end = max(valid_dates) if valid_dates else None

    # Step 4: Save chat record
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO chats (id, project_id, name, chat_type, message_count, participant_count, participants_json, date_start, date_end, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        chat_id,
        project_id,
        chat_name,
        chat_type,
        len(messages),
        len(participants),
        json.dumps(participants),
        date_start,
        date_end,
        created_at
    ))

    # Step 5: Save message records
    for msg in messages:
        m_id = f"{chat_id}_m{msg['message_seq']}"
        cursor.execute("""
            INSERT INTO messages (id, chat_id, project_id, message_seq, timestamp, sender, content, media_type, media_caption, media_transcript, is_system)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            m_id,
            chat_id,
            project_id,
            msg["message_seq"],
            msg["timestamp"],
            msg["sender"],
            msg["content"],
            msg.get("media_type", "text"),
            msg.get("media_caption"),
            msg.get("media_transcript"),
            1 if msg.get("is_system") else 0
        ))

    conn.commit()
    conn.close()

    # Step 6: Build Layered Memory (Sessions & Entities)
    build_sessions_for_chat(chat_id, project_id)
    extract_entities_and_events(chat_id, project_id)

    # Step 7: Build Persona Cards with Evidence Citations
    personas = generate_personas_for_chat(chat_id, project_id)

    return {
        "chat_id": chat_id,
        "name": chat_name,
        "chat_type": chat_type,
        "message_count": len(messages),
        "participant_count": len(participants),
        "participants": participants,
        "date_start": date_start,
        "date_end": date_end,
        "personas_count": len(personas)
    }

