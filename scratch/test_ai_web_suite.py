import requests
import json
import sys
import traceback

BASE_URL = "http://127.0.0.1:8000/api/v1"

passed = []
failed = []

def run_test(name, fn):
    print(f"\n[AI-TEST] >>> {name}...", flush=True)
    try:
        fn()
        print(f"[AI-TEST] PASS: {name}", flush=True)
        passed.append(name)
    except Exception as e:
        print(f"[AI-TEST] FAIL: {name} -> {e}", flush=True)
        traceback.print_exc()
        failed.append((name, str(e)))

def test_auth():
    # Login
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": "alex@careerfourge.ai", "password": "password123"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    assert data["status"] == "authenticated"
    assert "token" in data

    # Register
    res_reg = requests.post(f"{BASE_URL}/auth/register", json={
        "full_name": "Jordan Doe",
        "email": "jordan@careerfourge.ai",
        "password": "password123",
        "target_job_title": "Full Stack Engineer"
    })
    assert res_reg.status_code == 200, f"Register failed: {res_reg.text}"

def test_job_analysis():
    res = requests.post(f"{BASE_URL}/job/analyze", json={
        "role_title": "Senior Backend Developer",
        "job_description": "We are seeking a Python and FastAPI expert with PostgreSQL and Docker experience."
    })
    assert res.status_code == 200, f"Job analyze failed: {res.text}"
    data = res.json()
    assert "required_skills" in data
    assert len(data["required_skills"]) > 0
    assert any("python" in s["skill_name"].lower() for s in data["required_skills"])

def test_resume_analysis():
    res = requests.post(f"{BASE_URL}/resume/analyze", json={
        "raw_text": "Experienced Python and PostgreSQL developer with 4 years building scalable microservices and Docker containers.",
        "target_role": "Backend Developer",
        "job_description": "Python, FastAPI, SQL"
    })
    assert res.status_code == 200, f"Resume analyze failed: {res.text}"
    data = res.json()
    assert "compatibility_score" in data
    assert "matched_skills" in data
    assert "category_scores" in data

def test_skill_truth():
    res = requests.get(f"{BASE_URL}/skills/truth")
    assert res.status_code == 200, f"Skill truth failed: {res.text}"
    data = res.json()
    assert "skills" in data
    assert len(data["skills"]) > 0
    assert "candidate_name" in data

def test_job_gap_simulation():
    res = requests.get(f"{BASE_URL}/gap/simulate")
    assert res.status_code == 200, f"Gap simulate failed: {res.text}"
    data = res.json()
    assert "ready_skills" in data
    assert "needs_improvement" in data
    assert "summary_message" in data

def test_adaptive_interview_lifecycle():
    # 1. Start interview
    res = requests.post(f"{BASE_URL}/interview/start", json={
        "target_role": "Software Engineer",
        "interview_type": "Technical",
        "difficulty": "Medium",
        "num_questions": 3
    })
    assert res.status_code == 200, f"Start interview failed: {res.text}"
    qdata = res.json()
    assert "question_text" in qdata
    interview_id = qdata.get("interview_id", 100)
    question_id = qdata.get("question_id", 1)

    # 2. Answer question
    ans_res = requests.post(f"{BASE_URL}/interview/answer", json={
        "interview_id": interview_id,
        "question_id": question_id,
        "user_answer": "Binary search divides the search space in half at each step, achieving O(log N) runtime on sorted arrays."
    })
    assert ans_res.status_code == 200, f"Answer failed: {ans_res.text}"
    adata = ans_res.json()
    assert "evaluation" in adata
    assert "overall_score" in adata["evaluation"]
    assert "feedback" in adata["evaluation"]

    # 3. Conversational chat
    chat_res = requests.post(f"{BASE_URL}/interview/chat", json={
        "interview_id": str(interview_id),
        "message": "I'm ready to explain my architectural experience.",
        "action": "chat"
    })
    assert chat_res.status_code == 200, f"Chat failed: {chat_res.text}"
    cdata = chat_res.json()
    assert "message" in cdata

    # 4. History, Readiness, What-If
    h_res = requests.get(f"{BASE_URL}/interview/history")
    assert h_res.status_code == 200, f"History failed: {h_res.text}"

    r_res = requests.get(f"{BASE_URL}/interview/readiness")
    assert r_res.status_code == 200, f"Readiness failed: {r_res.text}"

    c_res = requests.get(f"{BASE_URL}/interview/what-changed")
    assert c_res.status_code == 200, f"What-changed failed: {c_res.text}"

    w_res = requests.post(f"{BASE_URL}/interview/what-if", json={
        "skill_name": "DSA",
        "level_increase": 1
    })
    assert w_res.status_code == 200, f"What-if failed: {w_res.text}"

    # 5. Report
    rep_res = requests.get(f"{BASE_URL}/interview/{interview_id}/report")
    assert rep_res.status_code == 200, f"Report failed: {rep_res.text}"
    rdata = rep_res.json()
    assert "overall_score" in rdata
    assert "recommendations" in rdata

def test_coding_assessments():
    # 1. Rotated Array
    rot_code = """
def search_rotated(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1
"""
    res1 = requests.post(f"{BASE_URL}/coding/submit", json={
        "code": rot_code,
        "language": "python",
        "problem_id": "rotated-array"
    })
    assert res1.status_code == 200, f"Rotated array submit failed: {res1.text}"
    d1 = res1.json()
    assert d1["correctness_score"] == 1.0
    assert d1["passed_tests"] == 5

    # 2. Two Sum
    two_sum_code = """
def two_sum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        curr = numbers[l] + numbers[r]
        if curr == target:
            return [l + 1, r + 1]
        elif curr < target:
            l += 1
        else:
            r -= 1
    return []
"""
    res2 = requests.post(f"{BASE_URL}/coding/submit", json={
        "code": two_sum_code,
        "language": "python",
        "problem_id": "two-sum"
    })
    assert res2.status_code == 200, f"Two sum submit failed: {res2.text}"
    d2 = res2.json()
    assert d2["correctness_score"] == 1.0

    # 3. Valid Parentheses
    paren_code = """
def is_valid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack
"""
    res3 = requests.post(f"{BASE_URL}/coding/submit", json={
        "code": paren_code,
        "language": "python",
        "problem_id": "valid-parentheses"
    })
    assert res3.status_code == 200, f"Valid parentheses failed: {res3.text}"
    d3 = res3.json()
    assert d3["correctness_score"] == 1.0

    # 4. AI Hint
    hint_res = requests.post(f"{BASE_URL}/coding/hint", json={
        "problem_id": "lru-cache",
        "code": "class LRUCache: pass",
        "language": "python"
    })
    assert hint_res.status_code == 200, f"Hint failed: {hint_res.text}"
    hdata = hint_res.json()
    assert "hint" in hdata
    assert "algorithmic_pattern" in hdata

def test_sql_workspace():
    res = requests.post(f"{BASE_URL}/sql/submit", json={
        "query": "SELECT customer_id, SUM(amount) as total_spent FROM orders GROUP BY customer_id HAVING total_spent > 1000 ORDER BY total_spent DESC;"
    })
    assert res.status_code == 200, f"SQL submit failed: {res.text}"
    data = res.json()
    assert data["is_valid_syntax"] is True
    assert len(data["result_rows"]) > 0

def test_roadmap_and_tutor():
    # Role roadmap
    res = requests.post(f"{BASE_URL}/roadmap/generate", json={
        "target_role": "Backend Engineer",
        "experience_level": "Mid",
        "current_skills": ["Python", "FastAPI"],
        "skill_gaps": ["Kubernetes", "System Design"]
    })
    assert res.status_code == 200, f"Roadmap generate failed: {res.text}"
    data = res.json()
    assert "nodes" in data
    assert len(data["nodes"]) > 0

    # AI Tutor
    tutor_res = requests.post(f"{BASE_URL}/ai/tutor", json={
        "message": "Can you explain how database indexing accelerates queries?",
        "role": "Backend Engineer"
    })
    assert tutor_res.status_code == 200, f"AI tutor failed: {tutor_res.text}"
    tdata = tutor_res.json()
    assert "reply" in tdata

    # Reassessment
    reassess_res = requests.post(f"{BASE_URL}/reassessment/start")
    assert reassess_res.status_code == 200, f"Reassessment failed: {reassess_res.text}"

def test_recruiter():
    res = requests.get(f"{BASE_URL}/recruiter/dashboard")
    assert res.status_code == 200, f"Recruiter dashboard failed: {res.text}"
    data = res.json()
    assert "job_title" in data
    assert "applicants" in data
    assert len(data["applicants"]) > 0

def main():
    run_test("Authentication (Login & Register)", test_auth)
    run_test("Job Requirement Analysis", test_job_analysis)
    run_test("Resume Parsing & ATS Matching", test_resume_analysis)
    run_test("Skill Truth Engine", test_skill_truth)
    run_test("Job Gap Simulation", test_job_gap_simulation)
    run_test("Adaptive Interview Lifecycle & Voice/Chat", test_adaptive_interview_lifecycle)
    run_test("Coding Assessments (Multi-pattern & AI Hint)", test_coding_assessments)
    run_test("SQL Query Workspace", test_sql_workspace)
    run_test("Career Roadmap & AI Tutor", test_roadmap_and_tutor)
    run_test("Recruiter Decision Dashboard", test_recruiter)

    print("\n" + "="*60, flush=True)
    print(f"AI TEST SUITE RESULTS: {len(passed)} PASSED, {len(failed)} FAILED", flush=True)
    print("="*60, flush=True)

    if failed:
        for name, err in failed:
            print(f"FAILED: {name}: {err}", flush=True)
        sys.exit(1)
    else:
        print("ALL 10 MODULES PASSED WITH 100% ACCURACY!", flush=True)

if __name__ == "__main__":
    main()
