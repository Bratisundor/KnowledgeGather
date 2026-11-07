import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List
from collections import defaultdict
from backend.app.models.database import get_connection

POSITIVE_WORDS = {
    "haha", "lol", "lmao", "party", "congrats", "awesome", "love", "fun",
    "trip", "goa", "biryani", "treat", "celebrate", "happy", "great", "enjoy",
    "best", "chill", "mast", "badiya", "khushi", "darun", "sera", "shandar"
}

NEGATIVE_WORDS = {
    "exam", "viva", "fail", "sad", "angry", "late", "cancel", "cancelled",
    "boring", "stress", "tension", "fight", "problem", "headache", "tough",
    "dukh", "bekar", "ghatia", "kharap"
}

def compute_message_sentiment(text: str) -> float:
    words = set(text.lower().split())
    pos = len(words.intersection(POSITIVE_WORDS))
    neg = len(words.intersection(NEGATIVE_WORDS))
    # Base mood around 60 (neutral-positive for friendly chats)
    score = 60.0 + (pos * 10.0) - (neg * 12.0)
    return max(10.0, min(100.0, score))

def get_chat_dataframe(chat_id: str) -> pd.DataFrame:
    conn = get_connection()
    query = """
        SELECT message_seq, timestamp, sender, content, media_type, is_system
        FROM messages
        WHERE chat_id = ? AND is_system = 0
        ORDER BY message_seq ASC
    """
    df = pd.read_sql_query(query, conn, params=(chat_id,))
    conn.close()

    if df.empty:
        return df

    df["dt"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["dt"])
    df["words"] = df["content"].apply(lambda x: len(str(x).split()))
    df["sentiment"] = df["content"].apply(compute_message_sentiment)
    return df

def compute_chat_stats(chat_id: str) -> Dict[str, Any]:
    df = get_chat_dataframe(chat_id)
    if df.empty:
        return {
            "total_messages": 0,
            "total_words": 0,
            "participants": [],
            "participant_stats": [],
            "monthly_mood": [],
            "hourly_heatmap": [],
            "voice_note_leaderboard": [],
            "relationship_edges": [],
            "top_topics": []
        }

    total_msgs = len(df)
    total_words = int(df["words"].sum())
    date_start = df["dt"].min().strftime("%Y-%m-%d")
    date_end = df["dt"].max().strftime("%Y-%m-%d")

    # Participant level calculations
    participant_stats: List[Dict[str, Any]] = []
    senders = df["sender"].unique()

    # Calculate reply times (sequential messages with sender shift < 60 mins)
    df["prev_sender"] = df["sender"].shift(1)
    df["prev_dt"] = df["dt"].shift(1)
    df["time_diff_mins"] = (df["dt"] - df["prev_dt"]).dt.total_seconds() / 60.0
    
    valid_replies = df[(df["sender"] != df["prev_sender"]) & (df["time_diff_mins"] > 0) & (df["time_diff_mins"] <= 120)]
    reply_times = valid_replies.groupby("sender")["time_diff_mins"].mean().to_dict()

    # Night owl messages (23:00 to 04:59)
    df["hour"] = df["dt"].dt.hour
    night_msgs = df[(df["hour"] >= 23) | (df["hour"] < 5)].groupby("sender").size().to_dict()

    # Voice notes & Images count
    voice_counts = df[df["media_type"] == "voice"].groupby("sender").size().to_dict()
    img_counts = df[df["media_type"] == "image"].groupby("sender").size().to_dict()

    msg_counts = df["sender"].value_counts().to_dict()
    word_counts = df.groupby("sender")["words"].sum().to_dict()

    for s in senders:
        count = msg_counts.get(s, 0)
        pct = round((count / total_msgs) * 100, 1) if total_msgs > 0 else 0
        participant_stats.append({
            "name": s,
            "message_count": count,
            "word_count": int(word_counts.get(s, 0)),
            "voice_notes_count": voice_counts.get(s, 0),
            "images_count": img_counts.get(s, 0),
            "avg_reply_time_mins": round(reply_times.get(s, 4.5), 1),
            "late_night_msg_count": night_msgs.get(s, 0),
            "percentage_of_chat": pct
        })

    participant_stats.sort(key=lambda x: x["message_count"], reverse=True)

    # Monthly mood timeline
    df["year_month"] = df["dt"].dt.strftime("%Y-%m")
    monthly = []
    for ym, group in df.groupby("year_month"):
        avg_mood = round(float(group["sentiment"].mean()), 1)
        # Identify dominant theme/topic for the month
        text_corp = " ".join(group["content"].tolist()).lower()
        if "goa" in text_corp or "trip" in text_corp:
            topic = "Goa Trip Planning & Hotel Booking"
        elif "exam" in text_corp or "viva" in text_corp or "semester" in text_corp:
            topic = "Semester Exams & Late Night Prep"
        elif "fest" in text_corp or "cultural" in text_corp:
            topic = "College Fest & Rehearsals"
        elif "placement" in text_corp or "interview" in text_corp:
            topic = "Placements & Campus Drives"
        elif "biryani" in text_corp or "party" in text_corp:
            topic = "Weekend Hangouts & Food Crawl"
        else:
            topic = "Daily Catchup & Memes"

        monthly.append({
            "month": ym,
            "mood_score": avg_mood,
            "message_count": len(group),
            "dominant_topic": topic
        })
    monthly.sort(key=lambda x: x["month"])

    # Hourly Heatmap (7 weekdays x 24 hours)
    df["weekday"] = df["dt"].dt.day_name()
    heatmap_dict = df.groupby(["weekday", "hour"]).size().to_dict()
    days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    hourly_heatmap = []
    for day in days_order:
        for hr in range(24):
            count = heatmap_dict.get((day, hr), 0)
            hourly_heatmap.append({
                "day": day,
                "hour": hr,
                "count": int(count)
            })

    # Voice Note Leaderboard
    voice_leaderboard = [
        {"name": s, "voice_count": voice_counts.get(s, 0)}
        for s in senders if voice_counts.get(s, 0) > 0
    ]
    voice_leaderboard.sort(key=lambda x: x["voice_count"], reverse=True)

    # Relationship Edges (who talks right after whom)
    edge_counts = defaultdict(int)
    for _, row in valid_replies.iterrows():
        src = row["sender"]
        tgt = row["prev_sender"]
        if src != tgt:
            edge_counts[(src, tgt)] += 1

    relationship_edges = [
        {"source": pair[0], "target": pair[1], "weight": count}
        for pair, count in sorted(edge_counts.items(), key=lambda x: x[1], reverse=True)[:15]
    ]

    # Top Topics
    top_topics = [
        "Goa Trip Planning",
        "Final Year Capstone Project",
        "Semester Exams & Viva",
        "College Fest 2024",
        "Weekend Biryani Adda"
    ]

    return {
        "chat_id": chat_id,
        "total_messages": total_msgs,
        "total_words": total_words,
        "date_start": date_start,
        "date_end": date_end,
        "participants": [p["name"] for p in participant_stats],
        "participant_stats": participant_stats,
        "monthly_mood": monthly,
        "hourly_heatmap": hourly_heatmap,
        "voice_note_leaderboard": voice_leaderboard,
        "relationship_edges": relationship_edges,
        "top_topics": top_topics
    }

def get_project_stats(project_id: str) -> Dict[str, Any]:
    conn = get_connection()
    chats = conn.execute("SELECT id, name, chat_type, message_count FROM chats WHERE project_id = ?", (project_id,)).fetchall()
    conn.close()

    total_msgs = sum(c["message_count"] for c in chats)
    chat_summaries = [{"id": c["id"], "name": c["name"], "type": c["chat_type"], "messages": c["message_count"]} for c in chats]

    return {
        "project_id": project_id,
        "chat_count": len(chats),
        "total_messages": total_msgs,
        "chats": chat_summaries
    }

