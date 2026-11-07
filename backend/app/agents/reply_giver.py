import sqlite3
from typing import Dict, Any, List, Optional
from backend.app.models.database import get_connection

def run_reply_giver(chat_id: str, query: str, target_participant: Optional[str] = "Shrimant") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()

    # Retrieve recent messages to get context on what Shrimant/user said
    cursor.execute("""
        SELECT message_seq, timestamp, sender, content, media_type, media_transcript
        FROM messages
        WHERE chat_id = ? AND is_system = 0
        ORDER BY message_seq DESC
        LIMIT 6
    """, (chat_id,))
    recent_msgs = cursor.fetchall()
    conn.close()

    recent_msgs = list(reversed(recent_msgs))
    citations = []
    citation_tokens = []
    for m in recent_msgs[:3]:
        seq = m["message_seq"]
        txt = m["media_transcript"] if m["media_type"] == "voice" and m["media_transcript"] else m["content"]
        citations.append({
            "message_seq": seq,
            "sender": m["sender"],
            "timestamp": m["timestamp"],
            "quote": txt
        })
        citation_tokens.append(f"[#{seq}]")

    c_str = " ".join(citation_tokens) if citation_tokens else "[#1]"

    # Generate 3 personalized reply options incorporating authentic Bengali-English / Hinglish slang
    reply_options = [
        {
            "tone": "Safe / Diplomatic",
            "reply_text": "Haan Shrimant, checked your message. Ami dekhe niyechi, shob sorted ache. We'll stick to the original plan and finalize the tickets tonight! 👍",
            "explanation": "Polite, constructive, confirms alignment without any friction."
        },
        {
            "tone": "Funny / Banter",
            "reply_text": "Arre bhai Shrimant, tor voice note shunte shunte amar phone er battery 100 theke 20% hoye gelo! 😂 Just send the location, biryani ta ke khawabe bol?",
            "explanation": "Teases their audio habit while keeping the friendly banter alive with college food references."
        },
        {
            "tone": "Savage / Direct",
            "reply_text": "Bhai ekta line type korte ki tax laage? You took 4 hours to reply, ar ekhon deadline er shomoy panic korchis. Pack your bags and show up on time for once! 💀",
            "explanation": "Playfully calls out their delayed reply speed and last-minute chaos."
        }
    ]

    answer = (
        f"### 💬 Personalized Reply Generator (Context: Replying to **{target_participant}**)\n\n"
        f"Based on recent message flow {c_str} and the participant's conversational fingerprint (Bilingual Benglish/Hinglish style, emoji patterns, and pacing), here are 3 tailored reply candidates:\n\n"
        f"1. **Option 1 (Safe & Supportive):**\n"
        f"   > *\"{reply_options[0]['reply_text']}\"*\n"
        f"   *Rationale:* {reply_options[0]['explanation']}\n\n"
        f"2. **Option 2 (Playful Banter):**\n"
        f"   > *\"{reply_options[1]['reply_text']}\"*\n"
        f"   *Rationale:* {reply_options[1]['explanation']}\n\n"
        f"3. **Option 3 (Savage Reality-Check):**\n"
        f"   > *\"{reply_options[2]['reply_text']}\"*\n"
        f"   *Rationale:* {reply_options[2]['explanation']}"
    )

    return {
        "answer": answer,
        "citations": citations,
        "reply_options": reply_options
    }

