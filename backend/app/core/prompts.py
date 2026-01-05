# app/core/prompts.py

def build_prompt(job_description: str, difficulty: str) -> str:
    return f"""
You are a professional interviewer.

Job Description:
{job_description}

Difficulty Level:
{difficulty}

Generate:
- EXACTLY 10 technical interview questions
- EXACTLY 5 behavioral interview questions

Rules:
- One sentence per question
- No explanations
- No paragraphs
- No merged questions

Return ONLY in this format:

TECHNICAL:
1.
2.
3.
4.
5.
6.
7.
8.
9.
10.

BEHAVIORAL:
1.
2.
3.
4.
5.
"""
