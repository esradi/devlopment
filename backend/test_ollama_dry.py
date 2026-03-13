import json
import requests
import re

# Mocking the constants from the service
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"

def _get_ollama_json(prompt: str) -> dict:
    try:
        print(f"Calling Ollama at {OLLAMA_URL}...")
        response = requests.post(OLLAMA_URL, json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }, timeout=120)
        response.raise_for_status()
        raw = response.json().get("response", "{}").strip()
        print(f"Raw response length: {len(raw)}")
        
        match = re.search(r'(\{.*\})', raw, re.DOTALL)
        if match:
            raw = match.group(1)
        
        return json.loads(raw)
    except Exception as e:
        print(f"Error: {e}")
        return {}

def dry_run():
    print("Test 1: Simple JSON Extraction")
    sample_raw = "Sure, here is your JSON: {\"title\": \"Test\"} Hope that helps!"
    match = re.search(r'(\{.*\})', sample_raw, re.DOTALL)
    if match and json.loads(match.group(1))["title"] == "Test":
        print("Success: Regex extraction works.")
    else:
        print("Failure: Regex extraction failed.")

    print("\nTest 2: Real Ollama Call (if available)")
    prompt = "Generate a JSON with a single key 'status' and value 'ok'. Return ONLY JSON."
    res = _get_ollama_json(prompt)
    if res.get("status") == "ok":
        print("Success: Ollama communication and parsing works!")
    else:
        print(f"Failure or Ollama not running. Result: {res}")

if __name__ == "__main__":
    dry_run()
