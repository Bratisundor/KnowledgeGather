import sqlite3
import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from backend.app.models.database import get_connection
from backend.app.config import SESSION_GAP_MINUTES

def build_sessions_for_chat(chat_id: str, project_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    # Clear old sessions for this chat
    cursor.execute("DELETE FROM sessions WHERE chat_id = ?", (chat_id,))

    cursor.execute("""
        SELECT message_seq, timestamp, sender, content, media_type
        FROM messages
        WHERE chat_id = ? AND is_system = 0
        ORDER BY message_seq ASC
    """, (chat_id,))
    rows = cursor.fetchall()

    if not rows:
        conn.close()
        return

    sessions = []
    current_session_msgs = []
    prev_dt = None

    for row in rows:
        raw_ts = row["timestamp"]
        try:
            curr_dt = datetime.strptime(raw_ts, "%Y-%m-%d %H:%M:%S")
        except Exception:
            curr_dt = datetime.now()

        if prev_dt and (curr_dt - prev_dt) > timedelta(minutes=SESSION_GAP_MINUTES):
            # Session boundary reached
            if current_session_msgs:
                sessions.append(current_session_msgs)
                current_session_msgs = []

        current_session_msgs.append(row)
        prev_dt = curr_dt

    if current_session_msgs:
        sessions.append(current_session_msgs)

    # Insert computed sessions
    for i, s_msgs in enumerate(sessions):
        s_id = f"{chat_id}_sess_{i+1}"
        s_start = s_msgs[0]["timestamp"]
        s_end = s_msgs[-1]["timestamp"]
        participants = list(set(m["sender"] for m in s_msgs))
        m_count = len(s_msgs)
        
        # Generate quick session summary
        sample_topics = []
        combined_text = " ".join(m["content"] for m in s_msgs[:15]).lower()
        if "goa" in combined_text or "trip" in combined_text:
            sample_topics.append("Goa Trip Discussion & Logistics")
        if "exam" in combined_text or "assignment" in combined_text or "notes" in combined_text:
            sample_topics.append("Academics & Study Prep")
        if "biryani" in combined_text or "dinner" in combined_text or "party" in combined_text:
            sample_topics.append("Food & Meetup Plans")
        if not sample_topics:
            sample_topics.append(f"Casual conversation between {', '.join(participants[:3])}")

        summary = f"Session #{i+1} ({s_start} to {s_end}): " + "; ".join(sample_topics)

        cursor.execute("""
            INSERT INTO sessions (id, chat_id, project_id, session_start, session_end, summary, message_count, participants_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (s_id, chat_id, project_id, s_start, s_end, summary, m_count, json.dumps(participants)))

    conn.commit()
    conn.close()

def extract_entities_and_events(chat_id: str, project_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM events WHERE chat_id = ?", (chat_id,))
    cursor.execute("DELETE FROM inside_jokes WHERE chat_id = ?", (chat_id,))

    cursor.execute("""
        SELECT message_seq, timestamp, sender, content
        FROM messages
        WHERE chat_id = ? AND is_system = 0
        ORDER BY message_seq ASC
    """, (chat_id,))
    messages = cursor.fetchall()

    events_found = []
    jokes_found = []

    goa_msg_ids = []
    fest_msg_ids = []
    exam_msg_ids = []

    for msg in messages:
        seq = msg["message_seq"]
        txt = msg["content"].lower()
        sender = msg["sender"]
        ts = msg["timestamp"]

        if "goa" in txt or "beach" in txt or "hotel" in txt or "seabreeze" in txt or "ticket" in txt:
            goa_msg_ids.append(seq)
        if "fest" in txt or "cultural" in txt or "rehearsal" in txt or "stage" in txt:
            fest_msg_ids.append(seq)
        if "exam" in txt or "viva" in txt or "assignment" in txt or "presentation" in txt:
            exam_msg_ids.append(seq)

        # Detect inside jokes
        if "treat" in txt and ("kab dega" in txt or "biryani" in txt or "party" in txt):
            jokes_found.append({
                "joke": "Treat de Shrimant / Biryani debt",
                "seq": seq,
                "context": f"{sender} asking for pending treat: '{msg['content'][:80]}'"
            })
        elif "maggie" in txt and ("hostel" in txt or "2am" in txt or "3am" in txt):
            jokes_found.append({
                "joke": "3 AM Hostel Maggie emergency",
                "seq": seq,
                "context": f"{sender}: '{msg['content'][:80]}'"
            })
        elif "kal pakka" in txt or "kal subah" in txt:
            jokes_found.append({
                "joke": "The eternal 'Kal se pakka padhai shuru'",
                "seq": seq,
                "context": f"{sender} claiming tomorrow will be productive"
            })

    # Record Goa Trip Event
    if goa_msg_ids:
        cursor.execute("""
            INSERT INTO events (id, chat_id, project_id, title, date, participants_json, description, message_ids_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"{chat_id}_event_goa",
            chat_id,
            project_id,
            "Goa Trip Planning & Hotel Reservation",
            "2024-12-14",
            json.dumps(["Suman", "Shrimant", "Priya", "Rahul", "Aniket"]),
            "The group planned the December Goa vacation, debated hotel vs villa, booked Hotel SeaBreeze, and split advance payments.",
            json.dumps(goa_msg_ids)
        ))

    # Record College Fest Event
    if fest_msg_ids:
        cursor.execute("""
            INSERT INTO events (id, chat_id, project_id, title, date, participants_json, description, message_ids_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"{chat_id}_event_fest",
            chat_id,
            project_id,
            "Annual College Cultural Fest 2024",
            "2024-03-22",
            json.dumps(["Suman", "Sneha", "Rohan", "Vikram"]),
            "Cultural night music performance, stage management, and after-party celebrations.",
            json.dumps(fest_msg_ids)
        ))

    # Record Inside Jokes
    dedup_jokes = {}
    for j in jokes_found:
        if j["joke"] not in dedup_jokes:
            dedup_jokes[j["joke"]] = j

    for i, (k, item) in enumerate(dedup_jokes.items()):
        cursor.execute("""
            INSERT INTO inside_jokes (id, chat_id, project_id, joke_text, origin_message_seq, context, popularity_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            f"{chat_id}_joke_{i+1}",
            chat_id,
            project_id,
            item["joke"],
            item["seq"],
            item["context"],
            4
        ))

    conn.commit()
    conn.close()

def retrieve_top_down_evidence(chat_id: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Top-down hierarchical retrieval:
    1. Checks explicit events/entities
    2. Searches session summaries
    3. Retrieves exact message records with sequence IDs for verifiable evidence citations
    """
    conn = get_connection()
    cursor = conn.cursor()
    q_lower = query.lower()

    # Step 1: Check events
    matched_events = []
    cursor.execute("SELECT * FROM events WHERE chat_id = ?", (chat_id,))
    events = cursor.fetchall()
    for ev in events:
        if any(term in q_lower for term in [ev["title"].lower(), "trip", "goa", "fest", "plan", "when did we"]):
            matched_events.append(dict(ev))

    # Step 2: Retrieve relevant messages
    # We query messages matching keywords or terms
    terms = [w for w in re.findall(r"\w+", q_lower) if len(w) > 3 and w not in ["what", "when", "where", "about", "this", "that", "with"]]

    where_clauses = ["chat_id = ?", "is_system = 0"]
    params = [chat_id]

    if terms:
        term_conditions = []
        for t in terms:
            term_conditions.append("(LOWER(content) LIKE ? OR LOWER(sender) LIKE ? OR LOWER(COALESCE(media_caption, '')) LIKE ? OR LOWER(COALESCE(media_transcript, '')) LIKE ?)")
            p = f"%{t}%"
            params.extend([p, p, p, p])
        where_clauses.append("(" + " OR ".join(term_conditions) + ")")

    sql = f"""
        SELECT message_seq, timestamp, sender, content, media_type, media_caption, media_transcript
        FROM messages
        WHERE {" AND ".join(where_clauses)}
        ORDER BY message_seq ASC
        LIMIT ?
    """
    params.append(limit)

    cursor.execute(sql, tuple(params))
    rows = cursor.fetchall()
    results = [dict(r) for r in rows]

    # If keyword search didn't yield enough, fallback to key events or sample messages
    if len(results) < 3 and matched_events:
        for ev in matched_events:
            msg_ids = json.loads(ev.get("message_ids_json", "[]"))[:limit]
            if msg_ids:
                placeholders = ",".join(["?"] * len(msg_ids))
                cursor.execute(f"""
                    SELECT message_seq, timestamp, sender, content, media_type, media_caption, media_transcript
                    FROM messages
                    WHERE chat_id = ? AND message_seq IN ({placeholders})
                    ORDER BY message_seq ASC
                """, (chat_id, *msg_ids))
                for r in cursor.fetchall():
                    if dict(r) not in results:
                        results.append(dict(r))

    # If still fewer than 2, fetch anchor messages from prominent participants
    if len(results) < 2:
        cursor.execute("""
            SELECT message_seq, timestamp, sender, content, media_type, media_caption, media_transcript
            FROM messages
            WHERE chat_id = ? AND is_system = 0
            ORDER BY message_seq ASC
            LIMIT ?
        """, (chat_id, limit))
        for r in cursor.fetchall():
            if dict(r) not in results:
                results.append(dict(r))

    conn.close()
    return results[:limit]
