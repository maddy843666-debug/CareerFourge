import requests
import json

base_url = "http://127.0.0.1:8000/api/v1/interview/chat"

print("--- 1. Testing conversational start ---")
res = requests.post(base_url, json={"action": "start", "mode": "conversational"})
print("Status:", res.status_code)
data = res.json()
print("Stage:", data.get("stage"))
print("Message:", data.get("message")[:120], "...")
interview_id = data.get("interview_id")

print("\n--- 2. Sending domain selection 'Python & Backend' ---")
res2 = requests.post(base_url, json={
    "interview_id": interview_id,
    "action": "chat",
    "message": "I'd like to interview for Python & Backend"
})
data2 = res2.json()
print("Stage:", data2.get("stage"))
print("Target Role:", data2.get("target_role"))
print("Question #:", data2.get("current_question_num"))
print("Current Question:", data2.get("current_question"))
print("Message snippet:", data2.get("message")[:150], "...")

print("\n--- 3. Answering Question 1 ---")
res3 = requests.post(base_url, json={
    "interview_id": interview_id,
    "action": "chat",
    "message": "The Global Interpreter Lock in CPython prevents multiple native threads from executing Python bytecodes simultaneously, ensuring thread-safe memory management for reference counts. For CPU-bound tasks, we use multiprocessing."
})
data3 = res3.json()
print("Verdict:", data3.get("verdict"))
print("Verdict Exp:", data3.get("verdict_explanation"))
print("Question 2:", data3.get("current_question"))
