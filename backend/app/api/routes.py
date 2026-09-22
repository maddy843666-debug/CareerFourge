import os
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import (
    LoginRequest, RegisterRequest, AuthResponse,
    JobAnalysisRequest, JobAnalysisResponse, ResumeAnalysisRequest, ResumeAnalysisResponse,
    SkillTruthResponse, JobGapSimulatorResponse, QuestionResponse,
    AnswerRequest, AnswerEvaluationResponse, InterviewSetupRequest,
    InterviewReportResponse, InterviewWhatIfRequest, InterviewWhatIfResponse,
    CodingSubmitRequest, CodingEvaluationResponse, SQLSubmitRequest, SQLEvaluationResponse,
    ReadinessBreakdownSchema, PersonalizedRoadmapResponse, ReassessmentResponse,
    RecruiterDashboardResponse, RoleRoadmapRequest, RoleRoadmapResponse, AITutorRequest, AITutorResponse,
    InterviewChatRequest, InterviewChatResponse
)
from app.ai.services import (
    JobRequirementAnalyzer, ResumeParser, SkillTruthEngine,
    WeaknessDiscoveryEngine, JobGapAnalyzer, AdaptiveInterviewEngine,
    CodingEvaluator, SQLEvaluator, JobReadinessCalculator,
    ImprovementPlanner, RecruiterService, CareerRoadmapAgent,
    ConversationalInterviewManager
)

router = APIRouter()

@router.post("/auth/demo", response_model=AuthResponse)
@router.post("/auth/login", response_model=AuthResponse)
def login_user(payload: Optional[LoginRequest] = None):
    return AuthResponse(
        status="authenticated",
        token="readyrole_jwt_session_2026",
        user={
            "id": 1,
            "full_name": "Alex Mercer",
            "email": payload.email if payload else "alex.mercer@demo.com",
            "age": 24,
            "experience_years": 3.0,
            "target_job_title": "Software Engineer (Full Stack)",
            "current_position": "Junior Developer",
            "role": "candidate"
        }
    )

@router.post("/auth/register", response_model=AuthResponse)
def register_user(payload: RegisterRequest):
    return AuthResponse(
        status="authenticated",
        token="readyrole_jwt_session_2026",
        user={
            "id": 2,
            "full_name": payload.full_name,
            "email": payload.email,
            "age": payload.age or 24,
            "experience_years": payload.experience_years or 3.0,
            "target_job_title": payload.target_job_title or "Software Engineer (Full Stack)",
            "current_position": payload.current_position or "Software Engineer",
            "role": "candidate"
        }
    )

@router.post("/job/analyze", response_model=JobAnalysisResponse)
def analyze_job(req: JobAnalysisRequest):
    return JobRequirementAnalyzer().analyze_job(req.role_title, req.job_description)

@router.get("/job/{job_id}", response_model=JobAnalysisResponse)
def get_job(job_id: int):
    return JobRequirementAnalyzer().analyze_job("Software Engineer (Full Stack)")

@router.post("/resume/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(
    file: Optional[UploadFile] = File(None),
    role_title: Optional[str] = "Software Engineer",
    job_description: Optional[str] = None
):
    raw_text = ""
    if file:
        try:
            content = await file.read()
            raw_text = content.decode("utf-8", errors="ignore")
        except Exception:
            raw_text = file.filename or ""
    return ResumeParser().parse_resume(raw_text=raw_text, target_role=role_title or "Software Engineer", job_description=job_description)

@router.post("/resume/analyze", response_model=ResumeAnalysisResponse)
def analyze_resume_text(req: ResumeAnalysisRequest):
    return ResumeParser().parse_resume(raw_text=req.raw_text or "", target_role=req.target_role or "Software Engineer", job_description=req.job_description)


@router.get("/skills/truth", response_model=SkillTruthResponse)
def get_skill_truth():
    return SkillTruthEngine().evaluate_skills([])

@router.get("/gap/simulate", response_model=JobGapSimulatorResponse)
def simulate_job_gap():
    return JobGapAnalyzer().analyze_gaps()

# --- Interview Prep Module Endpoints ---
@router.post("/interview/start", response_model=QuestionResponse)
def start_interview(payload: Optional[InterviewSetupRequest] = None):
    req = payload or InterviewSetupRequest()
    return AdaptiveInterviewEngine().start_interview(
        target_role=req.target_role or "Software Engineer",
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        num_questions=req.num_questions,
        job_description=req.job_description,
        target_company=req.target_company,
        focus_skills=req.focus_skills
    )

@router.post("/interview/chat", response_model=InterviewChatResponse)
def chat_interview(payload: InterviewChatRequest):
    return ConversationalInterviewManager.get_instance().start_or_continue_chat(payload)

@router.post("/interview/answer", response_model=AnswerEvaluationResponse)
def submit_answer(payload: AnswerRequest):
    return AdaptiveInterviewEngine().evaluate_answer(
        interview_id=payload.interview_id,
        question_id=payload.question_id,
        user_answer=payload.user_answer
    )

@router.post("/interview/{interview_id}/submit", response_model=InterviewReportResponse)
@router.get("/interview/{interview_id}/report", response_model=InterviewReportResponse)
def get_interview_report(interview_id: str):
    return ConversationalInterviewManager.get_instance().get_report(str(interview_id))

@router.get("/interview/history")
def get_interview_history():
    return ConversationalInterviewManager.get_instance().get_history()


@router.get("/interview/readiness")
def get_interview_readiness():
    return AdaptiveInterviewEngine().get_readiness()

@router.get("/interview/what-changed")
def get_what_changed():
    return AdaptiveInterviewEngine().get_what_changed()

@router.post("/interview/what-if", response_model=InterviewWhatIfResponse)
def simulate_what_if(payload: InterviewWhatIfRequest):
    return AdaptiveInterviewEngine().simulate_what_if(payload.skill_name, payload.level_increase)

@router.post("/coding/submit", response_model=CodingEvaluationResponse)
def submit_code(payload: CodingSubmitRequest):
    return CodingEvaluator().evaluate(payload.code)

@router.post("/sql/submit", response_model=SQLEvaluationResponse)
def submit_sql(payload: SQLSubmitRequest):
    return SQLEvaluator().evaluate(payload.query)

@router.get("/readiness/{profile_id}", response_model=ReadinessBreakdownSchema)
def get_readiness_score(profile_id: int):
    return JobReadinessCalculator().calculate_readiness()

@router.post("/roadmap/generate", response_model=RoleRoadmapResponse)
def generate_role_roadmap(payload: RoleRoadmapRequest):
    return CareerRoadmapAgent().generate_role_roadmap(payload)

@router.post("/roadmap/legacy", response_model=PersonalizedRoadmapResponse)
def generate_legacy_roadmap():
    return ImprovementPlanner().generate_plan()

@router.post("/ai/tutor", response_model=AITutorResponse)
def ai_tutor(payload: AITutorRequest):
    return CareerRoadmapAgent().tutor(payload)

@router.post("/reassessment/start", response_model=ReassessmentResponse)
def run_reassessment():
    return ImprovementPlanner().simulate_reassessment()

@router.get("/recruiter/dashboard", response_model=RecruiterDashboardResponse)
def get_recruiter_dashboard():
    return RecruiterService().get_dashboard()

# --- DIAGNOSTIC ENDPOINTS (Requirements 11, 12, 13) ---
@router.post("/interview/debug-rag")
def debug_rag(payload: dict):
    from app.ai.rag import InterviewRAG
    rag = InterviewRAG()
    jd = payload.get("job_description", "")
    query = payload.get("query", "What backend technologies are required?")
    interview_id = 999999
    rag.index_job_description(interview_id, jd)
    chunks = rag.retrieve(interview_id, query, top_k=5)
    return {
        "query": query,
        "chunks_found": len(chunks),
        "context": chunks
    }

@router.post("/interview/debug-llm")
def debug_llm(payload: dict):
    from app.ai.llm import InterviewLLM
    llm = InterviewLLM()
    context = payload.get("context", "The company requires Python, FastAPI and PostgreSQL.")
    role = payload.get("role", "Python Backend Developer")
    res = llm.generate_question(
        role=role,
        company="TechCorp",
        interview_type="Technical",
        difficulty="Intermediate",
        context=context,
        previous_questions=[]
    )
    return res

@router.get("/interview/diagnostic")
def run_diagnostic():
    from app.ai.rag import InterviewRAG
    from app.ai.llm import InterviewLLM
    from app.ai.services import AdaptiveInterviewEngine

    rag_pass = False
    llm_pass = False
    pipeline_pass = False
    details = []

    try:
        # 1. RAG Diagnostic
        rag = InterviewRAG()
        sample_jd = (
            "We are looking for a Python Backend Developer.\n"
            "Requirements:\n"
            "- Strong Python programming skills\n"
            "- Experience with FastAPI and building REST APIs\n"
            "- PostgreSQL knowledge and SQL database optimization\n"
            "- Docker experience and Redis caching"
        )
        test_id = 888888
        rag.index_job_description(test_id, sample_jd)
        context = rag.build_context(test_id, "FastAPI PostgreSQL")
        if "FastAPI" in context or "Python" in context or len(context) > 20:
            rag_pass = True
            details.append("[✓] RAG indexing and retrieval succeeded")
        else:
            details.append("[X] RAG retrieval returned empty context")
    except Exception as e:
        details.append(f"[X] RAG error: {e}")

    try:
        # 2. LLM Diagnostic
        llm = InterviewLLM()
        q = llm.generate_question(
            role="Python Backend Developer",
            company="TechCorp",
            interview_type="Technical",
            difficulty="Intermediate",
            context=context,
            previous_questions=[]
        )
        if q and "question_text" in q and len(q["question_text"]) > 10:
            llm_pass = True
            details.append(f"[✓] LLM generated question: {q['question_text']}")
        else:
            details.append("[X] LLM response invalid")
    except Exception as e:
        details.append(f"[X] LLM error: {e}")

    try:
        # 3. Pipeline Test
        engine = AdaptiveInterviewEngine()
        res = engine.start_interview(
            target_role="Python Backend Developer",
            interview_type="Technical",
            difficulty="Intermediate",
            num_questions=5,
            job_description=sample_jd,
            focus_skills=["Python", "FastAPI", "PostgreSQL"]
        )
        if res and "question_text" in res:
            pipeline_pass = True
            details.append(f"[✓] Interview Pipeline created session {res['interview_id']}")
    except Exception as e:
        details.append(f"[X] Pipeline error: {e}")

    report_text = "\n".join([
        "========================================",
        "CAREERFORGE AI INTERVIEW DIAGNOSTIC",
        "========================================",
        *details,
        "========================================",
        f"RAG STATUS: {'PASS' if rag_pass else 'FAIL'}",
        f"LLM STATUS: {'PASS' if llm_pass else 'FAIL'}",
        f"INTERVIEW PIPELINE: {'PASS' if pipeline_pass else 'FAIL'}",
        "========================================"
    ])

    return {
        "rag_status": "PASS" if rag_pass else "FAIL",
        "llm_status": "PASS" if llm_pass else "FAIL",
        "pipeline_status": "PASS" if pipeline_pass else "FAIL",
        "report": report_text
    }

# --- MCP TEST AGENT ENDPOINTS ---
@router.post("/test/run")
def run_test_suite(payload: Optional[dict] = None):
    from app.mcp.runner import CareerForgeTestRunner
    scope = (payload or {}).get("scope", "full")
    runner = CareerForgeTestRunner()

    if scope == "frontend":
        runner.test_frontend_pages()
    elif scope == "api":
        runner.test_backend_apis()
    elif scope == "rag":
        runner.test_rag_pipeline()
    elif scope == "llm":
        runner.test_llm_and_question_relevance()
    elif scope == "interview":
        runner.test_full_interview_workflow()
    else:
        return runner.run_all_tests()

    runner.generate_ai_report()
    return runner.evidence

@router.get("/test/latest")
def get_latest_test_results():
    results_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "test-results")
    evidence_path = os.path.join(results_dir, "test_evidence.json")
    if os.path.exists(evidence_path):
        with open(evidence_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"status": "no_runs_yet", "message": "Run tests from the Test Center or runner script to generate evidence."}

@router.post("/mcp/invoke")
def invoke_mcp_action(payload: dict):
    from app.mcp.server import MCPServer
    server = MCPServer()
    return server.handle_request(payload)


