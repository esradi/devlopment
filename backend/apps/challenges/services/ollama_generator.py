import requests
import json
import re
import os

# Ollama endpoint + model are env-driven so production can point at a remote
# host. In local dev Ollama runs on :11434. In production set OLLAMA_URL to a
# publicly reachable URL (Cloudflare Tunnel / ngrok / a VPS running Ollama).
# Without that, every call here will fail with a connection error because
# Railway containers can't reach your laptop.
OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3')


# ─────────────────────────────────────────────
# CHALLENGE GENERATION
# ─────────────────────────────────────────────

def _get_ollama_json(prompt: str) -> dict:
    """Helper to call Ollama and extract JSON robustly."""
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.3,
                "num_predict": 1024,
            }
        }, timeout=300)
        response.raise_for_status()
        
        raw = response.json().get("response", "{}").strip()
        
        # Robust JSON extraction: look for the first '{' and last '}'
        match = re.search(r'(\{.*\})', raw, re.DOTALL)
        if match:
            raw = match.group(1)
        
        return json.loads(raw)
    except Exception as e:
        print(f"[ollama] request error: {e}")
        return {}


def generate_challenge(skill_name: str, difficulty: str, language: str, challenge_type: str) -> dict:
    """Ask Ollama to generate a full challenge based on its type."""

    if challenge_type == "coding":
        prompt = f"""
You are a technical challenge designer for an internship platform.
Generate a coding challenge for the skill: "{skill_name}"
Difficulty: {difficulty}
Programming language: {language}

Return ONLY a valid JSON object with this exact structure:
{{
  "title": "Challenge title",
  "description": "Full problem description with real-world context, input/output format, and examples",
  "starter_code": "incomplete but valid code template in {language} — student fills the logic",
  "test_cases": [
    {{"input": "input1", "expected_output": "output1", "description": "basic case"}},
    {{"input": "input2", "expected_output": "output2", "description": "second case"}},
    {{"input": "input3", "expected_output": "output3", "description": "edge case"}}
  ],
  "time_limit_minutes": 15
}}
Return ONLY the JSON. No markdown, no explanation.
"""

    elif challenge_type == "qcm":
        prompt = f"""
You are a quiz designer for an internship platform.
Generate a 5-question QCM (multiple choice quiz) for the skill: "{skill_name}"
Difficulty: {difficulty}

Return ONLY a valid JSON object with this exact structure:
{{
  "title": "Quiz title",
  "description": "Brief intro to this quiz",
  "questions": [
    {{
      "index": 0,
      "question": "Question text?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A",
      "explanation": "Why A is correct"
    }},
    {{
      "index": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "B",
      "explanation": "..."
    }},
    {{
      "index": 2,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "C",
      "explanation": "..."
    }},
    {{
      "index": 3,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "D",
      "explanation": "..."
    }},
    {{
      "index": 4,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A",
      "explanation": "..."
    }}
  ],
  "time_limit_minutes": 10
}}
Return ONLY the JSON. No markdown, no explanation.
"""

    elif challenge_type == "text":
        prompt = f"""
You are an academic challenge designer for an internship platform.
Generate a written/essay challenge for the skill: "{skill_name}"
Difficulty: {difficulty}

Return ONLY a valid JSON object with this exact structure:
{{
  "title": "Challenge title",
  "description": "The full essay prompt or case study the student must respond to in detail",
  "evaluation_criteria": [
    "Criterion 1: clarity and structure of the response",
    "Criterion 2: accuracy of content",
    "Criterion 3: depth of analysis"
  ],
  "time_limit_minutes": 20
}}
Return ONLY the JSON. No markdown, no explanation.
"""
    else:
        raise ValueError(f"Unknown challenge type: {challenge_type}")

    return _get_ollama_json(prompt)


# ─────────────────────────────────────────────
# GRADING
# ─────────────────────────────────────────────

def grade_submission(challenge, submission_data: dict) -> dict:
    """Route grading to the correct method based on challenge type."""
    if challenge.challenge_type == "coding":
        return _grade_coding(challenge, submission_data.get("code", ""))
    elif challenge.challenge_type == "qcm":
        return _grade_qcm(challenge, submission_data.get("answers", {}))
    elif challenge.challenge_type == "text":
        return _grade_text(challenge, submission_data.get("text", ""))
    else:
        raise ValueError(f"Unknown challenge type: {challenge.challenge_type}")


def _grade_coding(challenge, code: str) -> dict:
    """Ollama grades coding submission against hidden test cases."""
    prompt = f"""
You are a code grader for an internship platform.
Skill: {challenge.skill_name} | Language: {challenge.language}

Student's submitted code:
```{challenge.language}
{code}
```

Test cases to evaluate against:
{json.dumps(challenge.test_cases, indent=2)}

Carefully analyze if the code would produce the correct output for each test case.

Return ONLY this JSON:
{{
  "score": 85,
  "passed_tests": 3,
  "total_tests": 3,
  "results": [
    {{"test_index": 0, "passed": true, "description": "...", "expected_output": "...", "actual_output": "..."}},
    {{"test_index": 1, "passed": false, "description": "...", "expected_output": "...", "actual_output": "...", "error": "why it failed"}}
  ],
  "overall_feedback": "Short constructive feedback for the student"
}}

score = round((passed_tests / total_tests) * 100)
Return ONLY the JSON. No markdown, no explanation.
"""
    return _get_ollama_json(prompt)


def _grade_qcm(challenge, answers: dict) -> dict:
    """
    Grade QCM locally — no Ollama needed.
    answers = {"0": "A", "1": "C", "2": "B", ...}
    """
    questions = challenge.questions or []
    total = len(questions)
    passed_count = 0
    results = []

    for q in questions:
        idx = str(q.get("index", ""))
        if not idx and "question" in q: # fallback if index is missing in JSON
             idx = str(questions.index(q))
             
        student_answer = answers.get(idx, "").strip().upper()
        correct = q.get("correct_answer", "").strip().upper()
        is_correct = student_answer == correct

        if is_correct:
            passed_count += 1

        results.append({
            "question_index": q.get("index", idx),
            "question": q.get("question", "N/A"),
            "your_answer": student_answer if student_answer else "No answer",
            "correct_answer": correct,
            "passed": is_correct,
            "explanation": q.get("explanation", ""),
        })

    score = round((passed_count / total) * 100) if total > 0 else 0

    return {
        "score": score,
        "passed_tests": passed_count,
        "total_tests": total,
        "results": results,
        "overall_feedback": f"You answered {passed_count} out of {total} questions correctly."
    }


def _grade_text(challenge, text: str) -> dict:
    """Ollama grades a written/essay response against evaluation criteria."""
    criteria = challenge.questions or []  # evaluation_criteria stored in questions field

    prompt = f"""
You are grading a written response for an internship platform.
Skill: {challenge.skill_name}

Student's response:
\"\"\"{text}\"\"\"

Evaluation criteria:
{json.dumps(criteria, indent=2)}

Grade the response against each criterion.

Return ONLY this JSON:
{{
  "score": 75,
  "results": [
    {{"criterion": "criterion text", "met": true, "comment": "why it was met"}},
    {{"criterion": "criterion text", "met": false, "comment": "what was missing"}}
  ],
  "overall_feedback": "Constructive and encouraging feedback for the student"
}}

score = round((criteria_met / total_criteria) * 100)
Return ONLY the JSON. No markdown, no explanation.
"""
    return _get_ollama_json(prompt)