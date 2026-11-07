import sqlite3
import json
from typing import List, Dict, Any, Optional
from backend.app.config import DB_PATH

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        chat_type TEXT NOT NULL,
        message_count INTEGER DEFAULT 0,
        participant_count INTEGER DEFAULT 0,
        participants_json TEXT DEFAULT '[]',
        date_start TEXT,
        date_end TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        message_seq INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        media_type TEXT DEFAULT 'text',
        media_caption TEXT,
        media_transcript TEXT,
        is_system INTEGER DEFAULT 0,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_messages_chat_seq ON messages(chat_id, message_seq);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(chat_id, sender);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(chat_id, timestamp);
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS personas (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        participant_name TEXT NOT NULL,
        group_role TEXT NOT NULL,
        communication_style TEXT NOT NULL,
        humour_type TEXT NOT NULL,
        interests_json TEXT DEFAULT '[]',
        habits_json TEXT DEFAULT '[]',
        catchphrases_json TEXT DEFAULT '[]',
        citations_json TEXT DEFAULT '[]',
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        session_start TEXT NOT NULL,
        session_end TEXT NOT NULL,
        summary TEXT,
        message_count INTEGER DEFAULT 0,
        participants_json TEXT DEFAULT '[]',
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        date TEXT,
        participants_json TEXT DEFAULT '[]',
        description TEXT,
        message_ids_json TEXT DEFAULT '[]',
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inside_jokes (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        joke_text TEXT NOT NULL,
        origin_message_seq INTEGER,
        context TEXT,
        popularity_count INTEGER DEFAULT 1,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()

init_db()

