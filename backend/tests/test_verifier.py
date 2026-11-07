import unittest
from backend.app.agents.verifier import verify_and_enrich_citations
from backend.app.models.database import get_connection

class TestVerifier(unittest.TestCase):
    def setUp(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM chats LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        self.chat_id = row["id"] if row else "chat_1"

    def test_valid_citation_verification(self):
        text = "Suman welcomed everyone to the group [#4] and Priya agreed [#5]."
        citations, status, badge, notes = verify_and_enrich_citations(self.chat_id, text)
        self.assertIn(status, ["passed", "flagged"])
        if status == "passed":
            self.assertEqual(badge, "100% Evidence Verified")
            self.assertTrue(all(c["is_verified"] for c in citations))

    def test_invalid_citation_flagging(self):
        text = "An unverified statement citing fake message [#999999]."
        citations, status, badge, notes = verify_and_enrich_citations(self.chat_id, text)
        self.assertIn(status, ["flagged", "failed"])
        self.assertFalse(all(c["is_verified"] for c in citations))

if __name__ == "__main__":
    unittest.main()

