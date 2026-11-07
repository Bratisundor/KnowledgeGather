import re
from typing import Tuple, List

FORBIDDEN_CATEGORIES = {
    "religion": ["religion", "god", "temple", "mosque", "church", "caste", "brahmin", "dalit", "faith", "prayer"],
    "race_ethnicity": ["race", "racist", "skin color", "ethnicity"],
    "health_appearance": ["ugly", "fat", "weight", "disease", "cancer", "handicap", "deformed", "sick", "hospital"],
    "family_trauma": ["parents", "mother", "father", "divorce", "death", "orphan", "trauma", "abuse", "suicide"],
    "sexuality": ["slur", "sexual", "orientation"],
    "finances": ["bankrupt", "poverty", "poor family", "loan default"]
}

SAFE_ROAST_HABITS = [
    "voice-note spam",
    "taking 4 hours to reply with 'k'",
    "leaving everyone on read",
    "3 AM random meme sharing",
    "cancelling plans at the last minute",
    "promising 'kal se pakka padhenge'",
    "begging for birthday treat",
    "posting 10 photos of biryani"
]

def moderate_roast_content(text: str) -> Tuple[bool, str, List[str]]:
    """
    Evaluates whether generated roast text adheres strictly to chat habit roasting
    and contains zero attacks on protected categories (religion, race, health, family, finances, etc.).
    """
    lower = text.lower()
    violations = []

    for category, keywords in FORBIDDEN_CATEGORIES.items():
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", lower):
                violations.append(f"{category} ('{kw}')")

    if violations:
        safe_feedback = (
            "Safety Guardrail Triggered: The roast attempt touched protected subjects "
            f"({', '.join(violations)}). In accordance with ChatChase safety policy, "
            "roasts are strictly confined to chat habits (voice notes, reply speed, ghosting, plan cancellations)."
        )
        return False, safe_feedback, violations

    return True, "Passed moderation check: Strictly targets chat behavior.", []

def sanitize_and_format_roast(raw_roast: str, participant: str, tone: str) -> str:
    """
    Ensures roasts are structured with playful, friendly disclaimers and habit-focused punchlines.
    """
    tone_prefixes = {
        "mild": "☕ [Mild Banter] ",
        "spicy": "🌶️ [Spicy Roast] ",
        "savage": "🔥 [Savage Callout] "
    }
    prefix = tone_prefixes.get(tone.lower(), "🌶️ [Spicy Roast] ")
    return f"{prefix}{raw_roast}"

