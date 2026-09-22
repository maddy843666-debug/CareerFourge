import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_course_interviews():
    print("--- 1. Testing Frontend Course Track & Non-Repetition ---")
    req_payload = {
        "action": "start",
        "course": "Frontend & Full-Stack React",
        "target_role": "Frontend Developer",
        "skills": ["React", "JavaScript", "TypeScript"],
        "difficulty": "Medium",
        "interview_type": "Technical",
        "num_questions": 5
    }
    r = requests.post(f"{BASE_URL}/interview/chat", json=req_payload)
    assert r.status_code == 200, f"Failed start: {r.text}"
    data = r.json()
    interview_id = data["interview_id"]
    q1 = data.get("current_question")
    print(f"Q1: {q1}")
    assert q1, "Q1 should not be empty"
    assert any(k in q1.lower() for k in ["react", "dom", "frontend", "rendering", "javascript", "web"]), f"Q1 not relevant: {q1}"

    questions_seen = [q1]

    # Answer Q1 through Q4
    answers = [
        "The virtual DOM is an in-memory representation of real DOM nodes. React uses reconciliation and diffing with keys to update only modified subtrees.",
        "SSR renders on the server using Node and sends hydrated HTML, while CSR sends an empty bundle that renders in the browser.",
        "We measure LCP and CLS using Lighthouse and PerformanceObserver, optimizing images with WebP and eliminating layout shifts.",
        "Microtasks like Promises run before the next event loop rendering step, whereas setTimeout tasks run in subsequent tick macrotask queues."
    ]

    for idx, ans in enumerate(answers):
        res = requests.post(f"{BASE_URL}/interview/chat", json={
            "interview_id": interview_id,
            "message": ans,
            "action": "chat"
        })
        assert res.status_code == 200, f"Error on answer {idx+1}: {res.text}"
        ans_data = res.json()
        next_q = ans_data.get("current_question")
        print(f"Verdict {idx+1}: {ans_data.get('verdict')} | Next Q: {next_q}")
        if ans_data.get("stage") == "completed":
            print(f"Interview completed! Final report score: {ans_data.get('final_report', {}).get('overall_score')}")
            break
        assert next_q not in questions_seen, f"Question repeated! {next_q} was already asked in {questions_seen}"
        questions_seen.append(next_q)

    print(f"Total Unique Questions in Frontend session: {len(questions_seen)}")
    assert len(questions_seen) == len(set(questions_seen)), "Duplicate questions detected!"

    print("\n--- 2. Testing Python Backend Course Track ---")
    r_py = requests.post(f"{BASE_URL}/interview/chat", json={
        "action": "start",
        "course": "Python & FastAPI / Django Backend",
        "target_role": "Backend Developer",
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "difficulty": "Medium",
        "interview_type": "Technical",
        "num_questions": 3
    })
    assert r_py.status_code == 200
    py_data = r_py.json()
    py_q1 = py_data.get("current_question")
    print(f"Python Q1: {py_q1}")
    assert any(k in py_q1.lower() for k in ["python", "gil", "asyncio", "fastapi", "concurrency", "django"]), f"Python Q1 not relevant: {py_q1}"

    print("\n--- 3. Testing DSA Course Track ---")
    r_dsa = requests.post(f"{BASE_URL}/interview/chat", json={
        "action": "start",
        "course": "Data Structures & Algorithms (DSA)",
        "target_role": "Software Engineer",
        "skills": ["Data Structures", "Algorithms"],
        "difficulty": "Hard",
        "interview_type": "Technical",
        "num_questions": 3
    })
    assert r_dsa.status_code == 200
    dsa_data = r_dsa.json()
    dsa_q1 = dsa_data.get("current_question")
    print(f"DSA Q1: {dsa_q1}")
    assert any(k in dsa_q1.lower() for k in ["hash", "collision", "pointer", "sliding window", "algorithm", "dsa", "complexity", "graph", "tree"]), f"DSA Q1 not relevant: {dsa_q1}"

    print("\nALL COURSE RELEVANCY & NON-REPETITION TESTS PASSED!")

if __name__ == "__main__":
    test_course_interviews()
