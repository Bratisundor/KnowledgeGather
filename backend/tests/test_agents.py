import unittest
from backend.app.agents.orchestrator import route_and_execute

class TestAgents(unittest.TestCase):
    def test_deep_analyzer(self):
        res = route_and_execute("project_suman", "Who drives most conversations?")
        self.assertEqual(res["agent"], "deep_analyzer")
        self.assertEqual(res["verifier_status"], "passed")
        self.assertIn("Conversation Driver", res["answer"])
        self.assertTrue(len(res["citations"]) > 0)

    def test_roaster_spicy(self):
        res = route_and_execute("project_suman", "Roast Shrimant for voice notes", requested_agent="roaster", tone="spicy")
        self.assertEqual(res["agent"], "roaster")
        self.assertEqual(res["verifier_status"], "passed")
        self.assertIn("Shrimant", res["answer"])
        self.assertIn("voice note", res["answer"].lower())

    def test_reply_giver(self):
        res = route_and_execute("project_suman", "How to reply to Shrimant?")
        self.assertEqual(res["agent"], "reply_giver")
        self.assertIn("Personalized Reply Generator", res["answer"])
        self.assertEqual(len(res["reply_options"]), 3)

    def test_memory_recall_goa(self):
        res = route_and_execute("project_suman", "When did we plan the Goa trip?")
        self.assertEqual(res["agent"], "memory_recall")
        self.assertIn("Goa Trip Planning", res["answer"])
        self.assertTrue(len(res["citations"]) > 0)

if __name__ == "__main__":
    unittest.main()
