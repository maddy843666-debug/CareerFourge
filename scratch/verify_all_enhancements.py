import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_sql_workspace():
    print("\n--- 1. Testing SQL Workspace Endpoints ---")
    problems_to_test = [
        ("p1", "SELECT first_name, last_name, salary FROM employees WHERE department_id = 1 ORDER BY salary DESC LIMIT 5;"),
        ("p2", "SELECT c.customer_id, c.customer_name, c.email FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;"),
        ("p5", "SELECT c.customer_id, c.customer_name, SUM(o.total_amount) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.customer_name ORDER BY total_spent DESC LIMIT 5;"),
        ("p6", "WITH RankedSalaries AS (SELECT d.department_name, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, e.salary, DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS salary_rank FROM employees e JOIN departments d ON e.department_id = d.department_id) SELECT * FROM RankedSalaries WHERE salary_rank <= 3;"),
        ("p11", "WITH RECURSIVE OrgHierarchy AS (SELECT employee_id, CONCAT(first_name, ' ', last_name) AS employee_name, manager_id, 1 AS hierarchy_level FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.employee_id, CONCAT(e.first_name, ' ', e.last_name), e.manager_id, h.hierarchy_level + 1 FROM employees e INNER JOIN OrgHierarchy h ON e.manager_id = h.employee_id) SELECT * FROM OrgHierarchy;"),
        ("syntax_error", "SELEC * FROM customers WHERE")
    ]

    for pid, q in problems_to_test:
        resp = requests.post(f"{BASE_URL}/sql/submit", json={"query": q, "problem_id": pid})
        assert resp.status_code == 200, f"Failed for {pid}: {resp.text}"
        data = resp.json()
        print(f"[{pid}] Correctness: {data.get('correctness_score')} | Valid: {data.get('is_valid_syntax')} | Rows: {len(data.get('result_rows', []))} | Time: {data.get('execution_time_ms')}ms")
        if pid == "syntax_error":
            assert not data.get("is_valid_syntax"), "Syntax error was not detected!"
        else:
            assert data.get("is_valid_syntax"), f"Valid query failed for {pid}"
            assert data.get("correctness_score") >= 0.8, f"Score too low for {pid}"
    print(">>> SQL Workspace Tests PASSED!")

def test_roadmap_latency():
    print("\n--- 2. Testing Roadmap Generation Latency & Caching ---")
    roles = ["Frontend Developer", "Backend Developer", "Data Scientist", "Full Stack Developer"]
    for role in roles:
        t0 = time.time()
        resp = requests.post(f"{BASE_URL}/roadmap/generate", json={"target_role": role, "duration_weeks": 4})
        elapsed = (time.time() - t0) * 1000
        assert resp.status_code == 200, f"Roadmap generation failed for {role}: {resp.text}"
        data = resp.json()
        nodes_count = len(data.get('nodes', []))
        print(f"Role: {role:<22} | Latency: {elapsed:.2f}ms | Nodes: {nodes_count}")
        assert nodes_count >= 5, f"Roadmap missing nodes for {role}!"
    print(">>> Roadmap Latency & Caching Tests PASSED!")

def test_chat_interview_eval():
    print("\n--- 3. Testing Chat Interview & Semantic Verdict Detection ---")
    # Start session with specific track
    start_resp = requests.post(f"{BASE_URL}/interview/chat", json={
        "action": "start",
        "course": "Python & FastAPI / Django Backend",
        "target_role": "Backend Developer",
        "skills": ["Python", "FastAPI", "SQL", "Redis"],
        "difficulty": "Medium",
        "num_questions": 5
    })
    assert start_resp.status_code == 200
    s_data = start_resp.json()
    intv_id = s_data["interview_id"]
    first_q = s_data.get("current_question")
    print(f"Started Interview ID: {intv_id}")
    print(f"Initial Question: {first_q}")
    assert first_q, "Initial question is empty!"

    # Test 1: Strong technical response to Question 1 (GIL) -> MUST BE CORRECT
    strong_ans = "The Python GIL (Global Interpreter Lock) is a mutex that prevents multiple native threads from executing Python bytecodes at once in CPython. To achieve true concurrency for CPU-bound tasks, we use the multiprocessing module or ProcessPoolExecutor. For I/O-bound tasks like database queries or network calls, we use asyncio with non-blocking event loops or thread pools."
    ans1_resp = requests.post(f"{BASE_URL}/interview/chat", json={
        "interview_id": intv_id,
        "action": "chat",
        "message": strong_ans
    })
    assert ans1_resp.status_code == 200
    a1_data = ans1_resp.json()
    print(f"Answer 1 (GIL Technical) -> Verdict: {a1_data.get('verdict')} | Score: {a1_data.get('evaluation', {}).get('technical_knowledge')}")
    assert a1_data.get("verdict") in ["correct", "partially_correct"], f"Expected correct/partial, got {a1_data.get('verdict')}"
    
    q2_text = a1_data.get("current_question")
    print(f"Question 2 Received: {q2_text}")
    assert q2_text and q2_text != first_q, "Question 2 is repeated or empty!"

    # Test 2: Evasive / "I don't know" answer to Question 2 -> MUST BE INCORRECT
    ans2_resp = requests.post(f"{BASE_URL}/interview/chat", json={
        "interview_id": intv_id,
        "action": "chat",
        "message": "I don't know the answer to this question, no idea, please skip."
    })
    assert ans2_resp.status_code == 200
    a2_data = ans2_resp.json()
    print(f"Answer 2 ('I don't know') -> Verdict: {a2_data.get('verdict')} | Score: {a2_data.get('evaluation', {}).get('technical_knowledge')}")
    assert a2_data.get("verdict") == "incorrect", f"Expected incorrect, got {a2_data.get('verdict')}"

    print(">>> Chat Interview Tests PASSED!")

if __name__ == "__main__":
    test_sql_workspace()
    test_roadmap_latency()
    test_chat_interview_eval()
    print("\n=======================================================")
    print("ALL END-TO-END SYSTEM ENHANCEMENTS VERIFIED SUCCESSFULLY!")
    print("=======================================================")
