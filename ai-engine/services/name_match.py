"""
Fuzzy name matching — business names vary in formatting across documents
("ABC Pvt Ltd" vs "ABC Private Limited"), so exact string match is too strict.
"""

import re


def _normalize(name: str) -> str:
    name = name.lower()
    # common legal-suffix variants get collapsed to one token
    replacements = {
        "private limited": "pvt ltd",
        "pvt. ltd.": "pvt ltd",
        "pvt.ltd": "pvt ltd",
        "limited": "ltd",
        "&": "and",
    }
    for old, new in replacements.items():
        name = name.replace(old, new)
    name = re.sub(r"[^a-z0-9 ]", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def names_match(name_a: str, name_b: str, threshold: float = 0.82) -> bool:
    """Simple token-overlap similarity - no extra dependency required.
    Good enough for demo purposes; swap for rapidfuzz/Levenshtein if you
    want a stronger match later.
    """
    a, b = _normalize(name_a), _normalize(name_b)
    if a == b:
        return True

    tokens_a, tokens_b = set(a.split()), set(b.split())
    if not tokens_a or not tokens_b:
        return False

    overlap = len(tokens_a & tokens_b)
    union = len(tokens_a | tokens_b)
    similarity = overlap / union
    return similarity >= threshold