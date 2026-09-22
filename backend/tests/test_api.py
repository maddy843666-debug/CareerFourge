from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "READYROLE"

def test_job_analysis():
    response = client.post("/api/v1/job/analyze", json={"role_title": "Software Engineer"})
    assert response.status_code == 200
    assert "required_skills" in response.json()

def test_skill_truth():
    response = client.get("/api/v1/skills/truth")
    assert response.status_code == 200
    assert "skills" in response.json()
    assert response.json()["skills"][0]["claimed_level"] == "Advanced"

def test_job_gap():
    response = client.get("/api/v1/gap/simulate")
    assert response.status_code == 200
    assert "ready_skills" in response.json()

def test_readiness_score():
    response = client.get("/api/v1/readiness/1")
    assert response.status_code == 200
    assert response.json()["overall_score"] == 72.0
