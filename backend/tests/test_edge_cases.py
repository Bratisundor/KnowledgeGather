import unittest
from backend.app.ingestion.parser import parse_whatsapp_text
from backend.app.ingestion.participant_detector import detect_participants_and_type
from backend.app.models.database import get_connection
from backend.app.main import create_project, delete_project, delete_chat, list_projects, list_chats
from backend.app.models.schemas import ProjectCreate

class TestEdgeCasesAndIsolation(unittest.TestCase):
    def test_malformed_lines(self):
        corrupted = """
        Random non-timestamped intro text
        12/01/2024, 10:15 - System: Clean message
        Some random garbage line that has no timestamp
        12/01/2024, 10:20 - User1: Hello world
        Another orphan line
        """
        msgs = parse_whatsapp_text(corrupted)
        self.assertEqual(len(msgs), 2)
        self.assertEqual(msgs[0]["sender"], "System")
        self.assertEqual(msgs[1]["sender"], "User1")
        self.assertIn("Another orphan line", msgs[1]["content"])

    def test_single_participant_chat(self):
        sample = """
        12/01/2024, 10:15 - Alice: Note to myself
        12/01/2024, 10:16 - Alice: Remember milk and eggs
        """
        msgs = parse_whatsapp_text(sample)
        participants, chat_type, counts = detect_participants_and_type(msgs)
        self.assertEqual(len(participants), 1)
        self.assertEqual(chat_type, "direct")

    def test_strict_isolation_and_cascade_delete(self):
        # Create temporary isolated project
        proj = create_project(ProjectCreate(name="Temporary Isolated Project", description="Testing deletion"))
        pid = proj.id

        projs_before = [p.id for p in list_projects()]
        self.assertIn(pid, projs_before)

        # Delete project
        delete_project(pid)

        projs_after = [p.id for p in list_projects()]
        self.assertNotIn(pid, projs_after)

        # Confirm no orphaned messages exist
        conn = get_connection()
        orphaned = conn.execute("SELECT COUNT(*) as cnt FROM messages WHERE project_id = ?", (pid,)).fetchone()["cnt"]
        conn.close()
        self.assertEqual(orphaned, 0)

if __name__ == "__main__":
    unittest.main()

