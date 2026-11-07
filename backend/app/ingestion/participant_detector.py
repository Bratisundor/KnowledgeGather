from typing import List, Dict, Any, Tuple
from collections import Counter

def detect_participants_and_type(messages: List[Dict[str, Any]]) -> Tuple[List[str], str, Dict[str, int]]:
    """
    Analyzes senders across the message history to:
    1. Extract verified human participants (excluding 'System')
    2. Determine whether the conversation is a 'group' or 'direct' (1-to-1)
    3. Return message counts per participant
    """
    senders = [
        msg["sender"].strip()
        for msg in messages
        if not msg.get("is_system", False) and msg.get("sender") != "System" and msg.get("sender", "").strip()
    ]

    counter = Counter(senders)
    participants = [p for p, _ in counter.most_common()]

    if len(participants) <= 2:
        chat_type = "direct"
    else:
        chat_type = "group"

    return participants, chat_type, dict(counter)

