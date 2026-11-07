import unittest
from backend.app.ingestion.parser import parse_whatsapp_text, clean_timestamp, detect_media_info

class TestWhatsAppParser(unittest.TestCase):
    def test_android_parsing(self):
        sample = """12/01/2024, 10:15 - Messages and calls are end-to-end encrypted.
12/01/2024, 10:18 - Suman: Welcome to the group!
Multi-line continuation line here.
12/01/2024, 10:20 - Priya: Thank you Suman!"""
        msgs = parse_whatsapp_text(sample)
        self.assertEqual(len(msgs), 3)
        self.assertTrue(msgs[0]["is_system"])
        self.assertEqual(msgs[1]["sender"], "Suman")
        self.assertIn("Multi-line continuation", msgs[1]["content"])
        self.assertEqual(msgs[2]["sender"], "Priya")

    def test_ios_parsing(self):
        sample = """[10/02/24, 11:30:15 AM] Suman: Shrimant, kalke lab e ashbi?
[10/02/24, 11:35:40 AM] Shrimant: PTT-20240210-WA0001.opus (file attached)"""
        msgs = parse_whatsapp_text(sample)
        self.assertEqual(len(msgs), 2)
        self.assertEqual(msgs[0]["sender"], "Suman")
        self.assertEqual(msgs[1]["sender"], "Shrimant")
        self.assertEqual(msgs[1]["media_type"], "voice")

    def test_media_detection(self):
        mtype, _ = detect_media_info("photo.jpg (file attached)")
        self.assertEqual(mtype, "image")
        mtype, _ = detect_media_info("audio.opus (file attached)")
        self.assertEqual(mtype, "voice")
        mtype, _ = detect_media_info("<Media omitted>")
        self.assertEqual(mtype, "voice")

if __name__ == "__main__":
    unittest.main()

