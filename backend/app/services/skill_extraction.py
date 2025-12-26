import re
import spacy
from app.core.skill_ontology import SKILL_ONTOLOGY

nlp = spacy.load("en_core_web_lg")


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9+,\s]", " ", text)
    return text


def is_short_skill(skill: str) -> bool:
    """
    Identify short skills like 'c', 'r', etc.
    """
    return len(skill) <= 2


def extract_skills(resume_text: str) -> list[str]:
    if not resume_text:
        return []

    cleaned_text = clean_text(resume_text)
    doc = nlp(cleaned_text)

    found_skills = set()

    # 1️⃣ Substring matching (ONLY for non-short skills)
    for canonical, variants in SKILL_ONTOLOGY.items():
        for variant in variants:
            if is_short_skill(variant):
                continue  # handled separately
            if variant in cleaned_text:
                found_skills.add(canonical)

    # 2️⃣ Strict word-boundary matching for short skills (like 'c')
    for canonical, variants in SKILL_ONTOLOGY.items():
        for variant in variants:
            if is_short_skill(variant):
                pattern = rf"\b{re.escape(variant)}\b"
                if re.search(pattern, cleaned_text):
                    found_skills.add(canonical)

    # 3️⃣ Comma / bullet separated lists
    chunks = re.split(r",|\n|•|-", cleaned_text)
    for chunk in chunks:
        chunk = chunk.strip()
        for canonical, variants in SKILL_ONTOLOGY.items():
            if chunk in variants:
                found_skills.add(canonical)

    return sorted(found_skills)
