import unittest
from backend.app.main import (
    health_check,
    list_projects,
    list_chats,
    get_chat_statistics,
    get_chat_personas,
    ask_agent
)
from backend.app.models.schemas import AskRequest

class TestDirectAPIEndpoints(unittest.TestCase):
    def test_health_check(self):
        res = health_check()
        self.assertEqual(res["status"], "ok")
        self.assertEqual(res["app"], "ChatChase")

    def test_list_projects(self):
        projects = list_projects()
        self.assertTrue(len(projects) >= 1)
        names = [p.name for p in projects]
        self.assertIn("Suman", names)

    def test_list_chats(self):
        chats = list_chats("project_suman")
        self.assertEqual(len(chats), 2)
        types = {c["name"]: c["chat_type"] for c in chats}
        self.assertEqual(types.get("College Friends"), "group")
        self.assertEqual(types.get("Shrimant"), "direct")

    def test_stats_and_personas(self):
        chats = list_chats("project_suman")
        group_chat = [c for c in chats if c["name"] == "College Friends"][0]
        stats = get_chat_statistics("project_suman", group_chat["id"])
        self.assertGreater(stats["total_messages"], 30)
        self.assertEqual(len(stats["participant_stats"]), 20)

        personas = get_chat_personas("project_suman", group_chat["id"])
        self.assertGreaterEqual(len(personas), 2)

    def test_ask_deep_analyzer(self):
        req = AskRequest(query="Who drives most conversations and how did mood change?")
        resp = ask_agent("project_suman", req)
        self.assertEqual(resp.agent, "deep_analyzer")
        self.assertEqual(resp.verifier_status, "passed")
        self.assertEqual(resp.verifier_badge, "100% Evidence Verified")
        self.assertTrue(len(resp.citations) > 0)

    def test_ask_roaster(self):
        req = AskRequest(
            query="Roast Shrimant for voice notes",
            agent="roaster",
            tone="spicy"
        )
        resp = ask_agent("project_suman", req)
        self.assertEqual(resp.agent, "roaster")
        self.assertEqual(resp.verifier_status, "passed")
        self.assertIn("Shrimant", resp.answer)

    def test_ask_reply_giver(self):
        req = AskRequest(query="How to reply to Shrimant?")
        resp = ask_agent("project_suman", req)
        self.assertEqual(resp.agent, "reply_giver")
        self.assertEqual(len(resp.reply_options), 3)

    def test_ask_memory_recall(self):
        req = AskRequest(query="When did we plan the Goa trip?")
        resp = ask_agent("project_suman", req)
        self.assertEqual(resp.agent, "memory_recall")
        self.assertIn("Goa Trip", resp.answer)
        self.assertTrue(len(resp.citations) > 0)

if __name__ == "__main__":
    unittest.main()
