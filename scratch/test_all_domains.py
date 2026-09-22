import requests

base_url = "http://127.0.0.1:8000/api/v1/interview/chat"

domains_to_test = [
    ("Frontend & Full-Stack React", "Frontend & React Developer", "Virtual DOM"),
    ("Java Enterprise & Spring Boot", "Java Enterprise Developer", "JVM"),
    ("DevOps, Cloud & Kubernetes", "DevOps & Cloud Engineer", "Docker"),
    ("Data Science & Machine Learning", "Data Scientist & ML Engineer", "gradient descent"),
    ("System Design & Distributed Systems", "Systems Architect", "distributed"),
]

for domain_title, expected_role, expected_keyword in domains_to_test:
    print(f"\n==========================================")
    print(f"Testing domain flow: '{domain_title}'")
    print(f"==========================================")
    
    # 1. Start session
    s_res = requests.post(base_url, json={"action": "start", "mode": "conversational"})
    assert s_res.status_code == 200, f"Failed start: {s_res.text}"
    s_data = s_res.json()
    assert s_data["stage"] == "setup", f"Expected stage 'setup', got {s_data['stage']}"
    assert "Priya Sharma" in s_data["message"]
    print(f"[PASS] Setup greeting received: '{s_data['message'][:80]}...'")
    
    interview_id = s_data["interview_id"]
    
    # 2. Select domain
    d_res = requests.post(base_url, json={
        "interview_id": interview_id,
        "action": "chat",
        "message": domain_title
    })
    assert d_res.status_code == 200, f"Failed domain select: {d_res.text}"
    d_data = d_res.json()
    assert d_data["stage"] == "interview", f"Expected stage 'interview', got {d_data['stage']}"
    assert d_data["target_role"] == expected_role, f"Expected role '{expected_role}', got '{d_data['target_role']}'"
    assert d_data["current_question_num"] == 1
    print(f"[PASS] Domain mapped to Role: {d_data['target_role']}")
    print(f"[PASS] Question 1: {d_data['current_question']}")
    
    # 3. Submit an incorrect / nonsense answer to test strict verdict
    ans_res = requests.post(base_url, json={
        "interview_id": interview_id,
        "action": "chat",
        "message": "I don't know, this is related to pizza and bicycles."
    })
    ans_data = ans_res.json()
    assert ans_data["verdict"] == "incorrect", f"Expected 'incorrect', got {ans_data['verdict']}"
    print(f"[PASS] Nonsense answer properly evaluated: verdict = {ans_data['verdict']}")
    print(f"[PASS] Verdict Explanation: {ans_data['verdict_explanation']}")
    print(f"[PASS] Transitioned to Question {ans_data['current_question_num']}: {ans_data['current_question'][:70]}...")

print("\n[SUCCESS] ALL DOMAIN FLOWS AND STRICT CORRECTNESS EVALUATIONS PASSED PERFECTLY!")
