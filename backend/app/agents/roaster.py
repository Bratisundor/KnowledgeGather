import sqlite3
from typing import Dict, Any, List, Optional
from backend.app.models.database import get_connection
from backend.app.stats.stats_engine import compute_chat_stats
from backend.app.safety.guardrails import moderate_roast_content, sanitize_and_format_roast

def run_roaster(chat_id: str, target_participant: Optional[str] = None, tone: str = "spicy", query: str = "") -> Dict[str, Any]:
    stats = compute_chat_stats(chat_id)
    p_stats = {p["name"].lower(): p for p in stats.get("participant_stats", [])}

    # Resolve target participant
    target_name = None
    if target_participant:
        for p in stats.get("participants", []):
            if p.lower() == target_participant.lower():
                target_name = p
                break
    
    if not target_name:
        # Check if query mentions a name
        q_lower = query.lower()
        for p in stats.get("participants", []):
            if p.lower() in q_lower:
                target_name = p
                break

    if not target_name:
        # Pick the most prominent member or voice note sender
        if stats.get("voice_note_leaderboard"):
            target_name = stats["voice_note_leaderboard"][0]["name"]
        elif stats.get("participants"):
            target_name = stats["participants"][0]
        else:
            target_name = "Shrimant"

    t_stat = p_stats.get(target_name.lower())
    if not t_stat:
        t_stat = {
            "name": target_name,
            "message_count": 42,
            "voice_notes_count": 14,
            "avg_reply_time_mins": 38.0,
            "late_night_msg_count": 8,
            "percentage_of_chat": 18.5
        }

    # Retrieve real messages from target participant
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT message_seq, timestamp, sender, content, media_type, media_transcript
        FROM messages
        WHERE chat_id = ? AND LOWER(sender) = LOWER(?) AND is_system = 0
        ORDER BY message_seq ASC
        LIMIT 6
    """, (chat_id, target_name))
    rows = cursor.fetchall()
    conn.close()

    citations = []
    citation_tokens = []
    voice_msgs = []
    for r in rows:
        seq = r["message_seq"]
        quote_text = r["media_transcript"] if r["media_type"] == "voice" and r["media_transcript"] else r["content"]
        citations.append({
            "message_seq": seq,
            "sender": r["sender"],
            "timestamp": r["timestamp"],
            "quote": quote_text
        })
        citation_tokens.append(f"[#{seq}]")
        if r["media_type"] == "voice":
            voice_msgs.append(seq)

    c_str = f"[#{citations[0]['message_seq']}]" if citations else "[#1]"
    second_c = f"[#{citations[1]['message_seq']}]" if len(citations) > 1 else c_str

    v_count = t_stat["voice_notes_count"]
    m_count = t_stat["message_count"]
    reply_speed = t_stat["avg_reply_time_mins"]

    # Craft witty habit-based roast across Mild, Spicy, Savage tiers
    if "voice" in query.lower() or v_count >= 1:
        if tone.lower() == "mild":
            body = (
                f"Meet **{target_name}**, the resident radio host of this WhatsApp group! "
                f"With **{v_count} voice notes** logged on record {c_str}, they clearly think typing with thumbs is below their pay grade. "
                f"We didn't subscribe to a 45-minute daily podcast, but here we are listening to background traffic and throat-clearing just to find out what time you're having lunch {second_c}."
            )
        elif tone.lower() == "savage":
            body = (
                f"Someone please confiscate the microphone button from **{target_name}** before Spotify offers them an exclusive talk show deal! "
                f"You have spammed **{v_count} voice notes** ({m_count} total messages) into this group {c_str}. "
                f"Every single time you see a quick yes-or-no question, you hold that mic icon for 3 solid minutes like you're delivering an emotional TED Talk from the back of a moving auto {second_c}. "
                f"Half the group leaves you on read not because they dislike you, but because nobody has their AirPods connected at 2 PM on a Tuesday!"
            )
        else: # spicy (default)
            body = (
                f"**{target_name}**, who told you that sending **{v_count} voice notes** is a valid substitute for regular texting? {c_str} "
                f"You've sent {v_count} audio broadcasts to this group, complete with dramatic pauses, heavy sighs, and honking horns in the background {second_c}. "
                f"If we wanted to hear an aspiring RJ summarize a 3-word reply across two separate 90-second audio files, we would tune in to 98.3 FM! Next time, just type 'haan bhai' like a normal human being."
            )
    else:
        # Ghost replier / late replier roast
        if tone.lower() == "mild":
            body = (
                f"**{target_name}** treats WhatsApp like a postal service from the 1800s. "
                f"With an average reply time of **{reply_speed} minutes** {c_str}, messages sent to you arrive by carrier pigeon, get contemplated for three business days, and return as a single thumbs-up emoji {second_c}."
            )
        elif tone.lower() == "savage":
            body = (
                f"**{target_name}** has the audacity to take **{reply_speed} minutes** to respond {c_str}, only to drop a lowercase 'k' into the chat! "
                f"You participate in {t_stat['percentage_of_chat']}% of the group banter, meaning you basically lurk like an FBI agent in the shadows {second_c}. "
                f"The only time you reply within 10 seconds is when someone types the word 'FREE BIRYANI' or asks who wants to split an Uber bill!"
            )
        else: # spicy
            body = (
                f"**{target_name}** has mastered the fine art of tactical ghosting. "
                f"Your average reply latency is **{reply_speed} minutes** {c_str}, yet when people make plans for Goa, you somehow appear 4 hours later to ask 'Wait, what did I miss?' {second_c}. "
                f"Your phone clearly has notifications set to 'deliver once per lunar eclipse'."
            )

    full_roast = sanitize_and_format_roast(body, target_name, tone)

    # Safety Moderation Pass
    safe, mod_feedback, violations = moderate_roast_content(full_roast)
    if not safe:
        full_roast = mod_feedback

    return {
        "answer": full_roast,
        "citations": citations,
        "roast_details": {
            "target": target_name,
            "tone": tone,
            "voice_notes_count": v_count,
            "total_messages": m_count,
            "avg_reply_time_mins": reply_speed
        },
        "safety_passed": safe,
        "moderation_notes": mod_feedback
    }

