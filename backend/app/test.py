# backend/app/test_ask.py
import requests

def main():
    url = "http://127.0.0.1:8000/api/ask"
    payload = {
        "session_id": "session-123",
        "question": "What rebate offers are available?",
        "model": "llama3.2:latest",
    }
    resp = requests.post(url, json=payload)
    print("Status Code:", resp.status_code)
    print("Response Body:", resp.json())

if __name__ == "__main__":
    main()
