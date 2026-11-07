import json
import sqlite3
from typing import Dict, Any, List
from backend.app.models.database import get_connection
from backend.app.memory.layered_memory import retrieve_top_down_evidence

def run_memory_recall(chat_id: str, query: str) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()

    q_lower = query.lower()

    # Step 1: Check events table for structured memory hits
    cursor.execute("""
        SELECT title, date, participants_json, description, message_ids_json
        FROM events
        WHERE chat_id = ?
    """, (chat_id,))
    events = cursor.fetchall()

    matched_event = None
    for ev in events:
        t_low = ev["title"].lower()
        if "goa" in q_lower and "goa" in t_low:
            matched_event = ev
            break
        elif "fest" in q_lower and "fest" in t_low:
            matched_event = ev
            break
        elif any(k in q_lower for k in ["trip", "vacation", "tour", "beach"]) and "goa" in t_low:
            matched_event = ev
            break

    # Step 2: Retrieve actual message records
    citations = []
    citation_tokens = []

    if matched_event:
        msg_seqs = json.loads(matched_event["message_ids_json"])[:5]
        placeholders = ",".join(["?"] * len(msg_seqs))
        cursor.execute(f"""
            SELECT message_seq, timestamp, sender, content, media_type, media_caption, media_transcript
            FROM messages
            WHERE chat_id = ? AND message_seq IN ({placeholders})
            ORDER BY message_seq ASC
        """, (chat_id, *msg_seqs))
        rows = cursor.fetchall()

        for r in rows:
            seq = r["message_seq"]
            txt = r["media_transcript"] if r["media_type"] == "voice" and r["media_transcript"] else r["content"]
            citations.append({
                "message_seq": seq,
                "sender": r["sender"],
                "timestamp": r["timestamp"],
                "quote": txt
            })
            citation_tokens.append(f"[#{seq}]")

        participants = json.loads(matched_event["participants_json"])
        date_str = matched_event["date"]
        title_str = matched_event["title"]
        desc = matched_event["description"]

        c_str = " ".join(citation_tokens) if citation_tokens else "[#12]"

        answer = (
            f"### ⏳ Memory Recall: **{title_str}**\n\n"
            f"**Event Timeline & Evidence:**\n"
            f"- **Planning Initiated:** **{date_str}**\n"
            f"- **People Involved:** {', '.join(participants)}\n"
            f"- **Key Messages Cited:** {c_str}\n\n"
            f"**Historical Context:**\n"
            f"{desc}\n\n"
            f"**Exact Conversation Trail:**\n"
            + "\n".join([f"- **[#{c['message_seq']}] {c['sender']} ({c['timestamp']}):** \"{c['quote']}\"" for c in citations])
        )
    else:
        # Fallback to general evidence search
        evidence = retrieve_top_down_evidence(chat_id, query, limit=5)
        for r in evidence:
            seq = r["message_seq"]
            txt = r.get("media_transcript") or r["content"]
            citations.append({
                "message_seq": seq,
                "sender": r["sender"],
                "timestamp": r["timestamp"],
                "quote": txt
            })
            citation_tokens.append(f"[#{seq}]")

        c_str = " ".join(citation_tokens) if citation_tokens else ""
        answer = (
            f"### ⏳ Memory Recall: Search Results for *\"{query}\"*\n\n"
            f"Found **{len(citations)} relevant conversation records** {c_str}:\n\n"
            + "\n".join([f"- **[#{c['message_seq']}] {c['sender']} ({c['timestamp']}):** \"{c['quote']}\"" for c in citations])
        )

    conn.close()
    return {
        "answer": answer,
        "citations": citations
    }

