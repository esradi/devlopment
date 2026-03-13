import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def call_ollama(prompt: str):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        },
        timeout=60
    )
    response.raise_for_status()
    data = response.json()
    return data.get("response", "")

if __name__ == "__main__":
    msg = "Give me a very simple programming challenge in one sentence."
    answer = call_ollama(msg)
    print("AI reply:\n", answer)
