import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from dateutil import parser as date_parser

ANDROID_PATTERN = re.compile(
    r"^(\d{1,2}/\d{1,2}/\d{2,4},\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[apAP][mM])?)\s+-\s+(.*?)$"
)

IOS_PATTERN = re.compile(
    r"^\[(\d{1,2}/\d{1,2}/\d{2,4},\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[apAP][mM])?)\]\s+(.*?)$"
)

SYSTEM_PHRASES = [
    "end-to-end encrypted",
    "created group",
    "added",
    "left",
    "removed",
    "changed the subject",
    "changed the group icon",
    "security code changed",
    "you're now an admin",
    "disappearing messages",
    "joined using this group's invite link",
    "waiting for this message",
    "this message was deleted",
    "you deleted this message"
]

def clean_timestamp(ts_str: str) -> str:
    ts_str = ts_str.replace('\u202f', ' ').replace('\xa0', ' ').strip()
    try:
        # Standardize timestamp to ISO 8601 string
        dt = date_parser.parse(ts_str, dayfirst=True)
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return ts_str

def detect_media_info(content: str) -> tuple[str, Optional[str]]:
    content_lower = content.lower().strip()
    
    # WhatsApp audio files and voice notes (PTT = Push to Talk)
    if any(ext in content_lower for ext in [".opus", ".m4a", ".mp3", ".ogg", "ptt-", "audio", "voice note", "voice message"]):
        return "voice", "Voice message (audio note)"
    
    # WhatsApp videos
    if any(ext in content_lower for ext in [".mp4", ".mov", ".mkv", "video"]):
        return "video", "Video file"
    
    # WhatsApp images / photos
    if any(ext in content_lower for ext in [".jpg", ".jpeg", ".png", ".webp", "photo", "image omitted"]):
        return "image", "Image / Photograph"
        
    if "sticker omitted" in content_lower or ".webp" in content_lower:
        return "sticker", "Sticker"

    if "<media omitted>" in content_lower or "media omitted" in content_lower:
        return "voice", "Voice message (Media omitted)"

    if content.endswith("(file attached)"):
        return "document", content

    return "text", None

def parse_whatsapp_text(raw_text: str) -> List[Dict[str, Any]]:
    lines = raw_text.splitlines()
    messages: List[Dict[str, Any]] = []
    current_msg: Optional[Dict[str, Any]] = None
    seq = 1

    for line in lines:
        line_clean = line.strip('\ufeff').strip()
        if not line_clean:
            continue

        match_android = ANDROID_PATTERN.match(line_clean)
        match_ios = IOS_PATTERN.match(line_clean)

        match = match_android or match_ios
        if match:
            if current_msg:
                messages.append(current_msg)
                current_msg = None

            raw_ts = match.group(1).strip()
            rest = match.group(2).strip()
            iso_ts = clean_timestamp(raw_ts)

            # Check if this line is a sender message or a system notification
            if ":" in rest:
                sender_part, content_part = rest.split(":", 1)
                sender = sender_part.strip()
                content = content_part.strip()
                is_system = False

                # Handle edge cases like "Messages to this chat and calls are now secured with: end-to-end encryption"
                if any(phrase in sender.lower() for phrase in SYSTEM_PHRASES):
                    sender = "System"
                    content = rest
                    is_system = True
            else:
                sender = "System"
                content = rest
                is_system = True

            media_type, media_caption = detect_media_info(content)

            current_msg = {
                "message_seq": seq,
                "timestamp": iso_ts,
                "raw_timestamp": raw_ts,
                "sender": sender,
                "content": content,
                "media_type": media_type,
                "media_caption": media_caption,
                "media_transcript": None,
                "is_system": is_system
            }
            seq += 1
        else:
            # Multi-line message continuation
            if current_msg:
                current_msg["content"] += "\n" + line_clean
            else:
                # Leading lines before first message
                continue

    if current_msg:
        messages.append(current_msg)

    return messages
