import os
from pathlib import Path
from datetime import datetime
from backend.app.models.database import get_connection, init_db
from backend.app.ingestion.pipeline import process_and_ingest_chat

def seed_suman_demo_project():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    project_id = "project_suman"
    cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
    if cursor.fetchone():
        print(f"Project '{project_id}' already exists. Re-seeding...")
        cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        conn.commit()

    created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO projects (id, name, description, created_at)
        VALUES (?, ?, ?, ?)
    """, (
        project_id,
        "Suman",
        "Multi-chat intelligence project containing College Friends group and Shrimant 1-on-1 chat",
        created_at
    ))
    conn.commit()
    conn.close()

    sample_dir = Path(__file__).resolve().parent

    # 1. Ingest College Friends (Group Chat, 20 members)
    group_file = sample_dir / "college_friends_group.txt"
    if group_file.exists():
        with open(group_file, "r", encoding="utf-8") as f:
            content = f.read()
        res_group = process_and_ingest_chat(project_id, "College Friends", content)
        print(f"Ingested '{res_group['name']}': type={res_group['chat_type']}, {res_group['participant_count']} participants, {res_group['message_count']} messages.")

    # 2. Ingest Shrimant (1-on-1 Chat)
    shrimant_file = sample_dir / "shrimant_1on1.txt"
    if shrimant_file.exists():
        with open(shrimant_file, "r", encoding="utf-8") as f:
            content = f.read()
        res_shrimant = process_and_ingest_chat(project_id, "Shrimant", content)
        print(f"Ingested '{res_shrimant['name']}': type={res_shrimant['chat_type']}, {res_shrimant['participant_count']} participants, {res_shrimant['message_count']} messages.")

    print("\nSuccessfully seeded 'Suman' project with both conversations!")

if __name__ == "__main__":
    seed_suman_demo_project()

