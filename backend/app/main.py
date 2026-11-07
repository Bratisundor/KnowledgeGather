import uuid
import json
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import APP_NAME, APP_VERSION
from backend.app.models.database import get_connection, init_db
from backend.app.models.schemas import (
    Project, ProjectCreate, Chat, AskRequest, AgentResponse, PersonaCard
)
from backend.app.ingestion.pipeline import process_and_ingest_chat
from backend.app.stats.stats_engine import compute_chat_stats, get_project_stats
from backend.app.memory.persona_builder import get_personas_by_chat
from backend.app.agents.orchestrator import route_and_execute
from backend.sample_data.seed_demo import seed_suman_demo_project

init_db()

app = FastAPI(
    title=f"{APP_NAME} API",
    version=APP_VERSION,
    description="Evidence-First Multi-Agent Chat Intelligence Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": APP_NAME, "version": APP_VERSION}

# ==========================================
# Projects API
# ==========================================
@app.get("/projects", response_model=List[Project])
def list_projects():
    conn = get_connection()
    rows = conn.execute("""
        SELECT p.id, p.name, p.description, p.created_at,
               COUNT(c.id) as chat_count
        FROM projects p
        LEFT JOIN chats c ON p.id = c.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    """).fetchall()
    conn.close()

    return [
        Project(
            id=r["id"],
            name=r["name"],
            description=r["description"] or "",
            created_at=r["created_at"],
            chat_count=r["chat_count"]
        )
        for r in rows
    ]

@app.post("/projects", response_model=Project)
def create_project(data: ProjectCreate):
    conn = get_connection()
    pid = f"proj_{uuid.uuid4().hex[:8]}"
    created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn.execute("""
        INSERT INTO projects (id, name, description, created_at)
        VALUES (?, ?, ?, ?)
    """, (pid, data.name, data.description or "", created_at))
    conn.commit()
    conn.close()

    return Project(
        id=pid,
        name=data.name,
        description=data.description or "",
        created_at=created_at,
        chat_count=0
    )

@app.get("/projects/{project_id}")
def get_project(project_id: str):
    conn = get_connection()
    row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    chats = conn.execute("SELECT * FROM chats WHERE project_id = ? ORDER BY created_at DESC", (project_id,)).fetchall()
    conn.close()

    chat_list = []
    for c in chats:
        chat_list.append({
            "id": c["id"],
            "name": c["name"],
            "chat_type": c["chat_type"],
            "message_count": c["message_count"],
            "participant_count": c["participant_count"],
            "participants": json.loads(c["participants_json"]),
            "date_start": c["date_start"],
            "date_end": c["date_end"],
            "created_at": c["created_at"]
        })

    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"] or "",
        "created_at": row["created_at"],
        "chats": chat_list
    }

@app.delete("/projects/{project_id}")
def delete_project(project_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    cursor.execute("DELETE FROM messages WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM personas WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM sessions WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM events WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM inside_jokes WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM chats WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()

    return {"status": "deleted", "project_id": project_id, "message": "Project and all memories erased."}

# ==========================================
# Chats & Ingestion API
# ==========================================
@app.get("/projects/{project_id}/chats")
def list_chats(project_id: str):
    conn = get_connection()
    rows = conn.execute("SELECT * FROM chats WHERE project_id = ? ORDER BY created_at DESC", (project_id,)).fetchall()
    conn.close()

    return [
        {
            "id": r["id"],
            "project_id": r["project_id"],
            "name": r["name"],
            "chat_type": r["chat_type"],
            "message_count": r["message_count"],
            "participant_count": r["participant_count"],
            "participants": json.loads(r["participants_json"]),
            "date_start": r["date_start"],
            "date_end": r["date_end"],
            "created_at": r["created_at"]
        }
        for r in rows
    ]

@app.post("/projects/{project_id}/chats")
async def upload_chat(
    project_id: str,
    file: UploadFile = File(...),
    chat_name: Optional[str] = Form(None)
):
    conn = get_connection()
    p = conn.execute("SELECT id FROM projects WHERE id = ?", (project_id,)).fetchone()
    conn.close()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    content_bytes = await file.read()
    try:
        raw_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raw_text = content_bytes.decode("latin-1")

    display_name = chat_name.strip() if chat_name else file.filename.replace(".txt", "")

    try:
        result = process_and_ingest_chat(project_id, display_name, raw_text)
        return {"status": "success", "chat": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ingestion failed: {str(e)}")

@app.delete("/projects/{project_id}/chats/{chat_id}")
def delete_chat(project_id: str, chat_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM chats WHERE id = ? AND project_id = ?", (chat_id, project_id))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Chat not found in project")

    # Strict isolation cleanup: delete chat and all associated memories
    cursor.execute("DELETE FROM messages WHERE chat_id = ?", (chat_id,))
    cursor.execute("DELETE FROM personas WHERE chat_id = ?", (chat_id,))
    cursor.execute("DELETE FROM sessions WHERE chat_id = ?", (chat_id,))
    cursor.execute("DELETE FROM events WHERE chat_id = ?", (chat_id,))
    cursor.execute("DELETE FROM inside_jokes WHERE chat_id = ?", (chat_id,))
    cursor.execute("DELETE FROM chats WHERE id = ?", (chat_id,))
    conn.commit()
    conn.close()

    return {"status": "deleted", "chat_id": chat_id, "message": "Chat and all memories removed permanently."}

@app.get("/projects/{project_id}/chats/{chat_id}/messages")
def get_chat_messages(
    project_id: str,
    chat_id: str,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    conn = get_connection()
    rows = conn.execute("""
        SELECT message_seq, timestamp, sender, content, media_type, media_caption, media_transcript, is_system
        FROM messages
        WHERE chat_id = ?
        ORDER BY message_seq ASC
        LIMIT ? OFFSET ?
    """, (chat_id, limit, offset)).fetchall()
    total = conn.execute("SELECT COUNT(*) as cnt FROM messages WHERE chat_id = ?", (chat_id,)).fetchone()["cnt"]
    conn.close()

    return {
        "chat_id": chat_id,
        "total": total,
        "offset": offset,
        "limit": limit,
        "messages": [dict(r) for r in rows]
    }

@app.get("/projects/{project_id}/chats/{chat_id}/stats")
def get_chat_statistics(project_id: str, chat_id: str):
    return compute_chat_stats(chat_id)

@app.get("/projects/{project_id}/chats/{chat_id}/personas")
def get_chat_personas(project_id: str, chat_id: str):
    return get_personas_by_chat(chat_id)

# ==========================================
# Specialized Agents & Question Answering
# ==========================================
@app.post("/projects/{project_id}/ask", response_model=AgentResponse)
def ask_agent(project_id: str, req: AskRequest):
    res = route_and_execute(
        project_id=project_id,
        query=req.query,
        chat_id=req.chat_id,
        requested_agent=req.agent,
        tone=req.tone or "spicy",
        target_participant=req.target_participant or req.participant
    )
    return AgentResponse(**res)

# ==========================================
# Demo & Seed Endpoint
# ==========================================
@app.post("/demo/seed")
def seed_demo():
    seed_suman_demo_project()
    return {"status": "success", "message": "Demo scenario 'Suman' project seeded successfully!"}

