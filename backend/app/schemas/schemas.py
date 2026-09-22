from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & Onboarding Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    age: Optional[int] = 24
    experience_years: Optional[float] = 3.0
    target_job_title: Optional[str] = "Software Engineer (Full Stack)"
    current_position: Optional[str] = "Junior Backend Developer"

class AuthResponse(BaseModel):
    status: str
    token: str = "demo_jwt_token_readyrole_2026"
    user: Dict[str, Any]

# --- Job Schemas ---
class JobRequirementSchema(BaseModel):
    skill_name: str
    category: str = "REQUIRED" # REQUIRED, PREFERRED, OPTIONAL
    importance: str = "HIGH" # HIGH, MEDIUM, LOW
    weight: float = 1.0

class JobAnalysisRequest(BaseModel):
    role_title: str
    job_description: Optional[str] = None
    predefined_id: Optional[str] = None

class JobAnalysisResponse(BaseModel):
    id: int
    title: str
    company: str
    experience_required: str
    required_skills: List[JobRequirementSchema]
    preferred_skills: List[JobRequirementSchema]
    optional_skills: List[JobRequirementSchema]
    responsibilities: List[str]

# --- Resume Schemas ---
class ResumeAnalysisRequest(BaseModel):
    raw_text: Optional[str] = None
    file_name: Optional[str] = None
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    compatibility_score: float # e.g. 78.0
    overall_score: float = 78.0 # Score out of 100
    match_grade: str = "Good Alignment"
    category_scores: Dict[str, float] = {
        "formatting_readability": 84.0,
        "keyword_coverage": 76.0,
        "experience_impact": 68.0,
        "project_relevance": 82.0
    }
    matched_skills: List[str]
    missing_skills: List[str]
    whats_working: List[str] = []
    whats_missing: List[str] = []
    formatting_feedback: List[str] = []
    actionable_improvements: List[str] = []
    potential_gaps: List[str] = []
    extracted_projects: List[Dict[str, Any]] = []
    experience_summary: str = ""


# --- Skill Truth Schemas ---
class SkillTruthItem(BaseModel):
    skill_name: str
    claimed_level: str # Advanced, Intermediate, Beginner
    verified_level: str # Expert, Advanced, Intermediate, Beginner
    confidence: float # 0.0 to 1.0
    job_importance: str # HIGH, MEDIUM, LOW
    evidence: List[str]
    weaknesses: List[str]
    recommendation: str

class SkillTruthResponse(BaseModel):
    profile_id: int
    candidate_name: str
    target_role: str
    skills: List[SkillTruthItem]
    truth_summary_narrative: str

# --- Job Gap Simulator Schemas ---
class SkillGapItem(BaseModel):
    skill_name: str
    required_level: str
    verified_level: str
    status: str # READY, NEEDS_IMPROVEMENT, HIGH_PRIORITY_GAP
    job_importance: str
    gap_score: float # 0 to 10
    evidence: str

class JobGapSimulatorResponse(BaseModel):
    ready_skills: List[SkillGapItem]
    needs_improvement: List[SkillGapItem]
    high_priority_gaps: List[SkillGapItem]
    summary_message: str

# --- Conversational AI Chat Interview Schemas ---
class InterviewChatRequest(BaseModel):
    interview_id: Optional[str] = None
    message: Optional[str] = None
    action: Optional[str] = "chat" # "start" | "chat" | "finalize"

class InterviewChatResponse(BaseModel):
    interview_id: str
    stage: str # "setup" | "interview" | "completed" | "error"
    message: str
    interview_type: Optional[str] = None
    target_role: Optional[str] = None
    skills: List[str] = []
    difficulty: Optional[str] = "Medium"
    num_questions: int = 5
    current_question_num: int = 0
    total_questions: int = 5
    current_question: Optional[str] = None
    evaluation: Optional[Dict[str, Any]] = None
    feedback: Optional[str] = None
    verdict: Optional[str] = None # "correct" | "partially_correct" | "incorrect"
    verdict_explanation: Optional[str] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    final_report: Optional[Dict[str, Any]] = None

# --- Interview Module Schemas ---
class InterviewSetupRequest(BaseModel):
    target_role: Optional[str] = "Software Engineer"
    interview_type: str = "Technical" # Technical, Coding, Behavioral / HR, System Design, SQL, Mixed
    difficulty: str = "Intermediate" # Beginner, Intermediate, Advanced
    num_questions: int = 10 # 5, 10, 15
    job_description: Optional[str] = None
    target_company: Optional[str] = None
    focus_skills: Optional[List[str]] = None

class QuestionResponse(BaseModel):
    question_id: int
    interview_id: int
    sequence_num: int
    total_budget: int = 10
    category: str # Technical, Coding, Behavioral, System Design, SQL, Mixed
    target_skill: str
    question_text: str
    difficulty: str
    question_type: str = "initial"

class AnswerRequest(BaseModel):
    interview_id: int
    question_id: int
    user_answer: str

class AnswerEvaluationSchema(BaseModel):
    technical_accuracy: float = 8.0 # 1-10
    concept_understanding: float = 7.0 # 1-10
    problem_solving: float = 7.0 # 1-10
    completeness: float = 7.0 # 1-10
    communication: float = 8.0 # 1-10
    clarity: float = 8.0 # 1-10
    reasoning: float = 7.0 # 1-10
    examples: float = 6.0 # 1-10
    overall_score: float = 7.4 # 0-10
    answer_confidence: float = 0.84 # 0.0-1.0
    strengths: List[str] = []
    weaknesses: List[str] = []
    skills_detected: List[str] = []
    feedback: str
    follow_up_required: bool = False
    next_question_type: str = "deeper_concept"

class AnswerEvaluationResponse(BaseModel):
    interview_id: int
    question_id: int
    evaluation: AnswerEvaluationSchema
    is_completed: bool = False
    next_question: Optional[QuestionResponse] = None

class InterviewEvidenceItem(BaseModel):
    skill_name: str
    claimed_level: str
    verified_level: str
    confidence: float
    evidence_bullets: List[str]
    weaknesses: List[str]
    question_references: List[int]

class InterviewRecommendationItem(BaseModel):
    id: Optional[int] = None
    title: str
    category: str
    reason: str
    action_type: str # practice_dsa, practice_sql, practice_sys_design, retake_interview

class InterviewReportResponse(BaseModel):
    interview_id: int
    target_role: str
    interview_type: str
    difficulty: str
    overall_score: float # 74%
    technical_knowledge: float # 78%
    problem_solving: float # 71%
    communication: float # 82%
    answer_quality: float # 76%
    strong_areas: List[str]
    areas_to_improve: List[str]
    key_observations: str
    why_did_i_get_this_score: List[InterviewEvidenceItem]
    recommendations: List[InterviewRecommendationItem]

class InterviewHistoryItem(BaseModel):
    id: int
    date: str
    target_role: str
    interview_type: str
    difficulty: str
    overall_score: float
    skills_evaluated: List[str]
    weaknesses: List[str]
    recommendations: List[str]

class InterviewReadinessBreakdown(BaseModel):
    readiness_score: float # 68%
    technical_knowledge: float # 74%
    dsa: float # 61%
    coding: float # 72%
    communication: float # 84%
    sql: float # 66%
    biggest_gap: str # DSA
    reason: str

class InterviewWhatChangedItem(BaseModel):
    change: str # "+4% DSA improvement"
    delta: float # 4.0

class InterviewWhatChangedResponse(BaseModel):
    previous_readiness: float
    current_readiness: float
    changes: List[InterviewWhatChangedItem]

class InterviewWhatIfRequest(BaseModel):
    skill_name: str # DSA, SQL, System Design, Communication
    level_increase: int = 1 # 1 level

class InterviewWhatIfResponse(BaseModel):
    current_readiness: float
    simulated_readiness: float
    delta: float
    explanation: str

# --- Coding & SQL Schemas ---
class CodingSubmitRequest(BaseModel):
    code: str
    language: str = "python"

class CodingEvaluationResponse(BaseModel):
    correctness_score: float
    passed_tests: int
    total_tests: int
    time_complexity: str
    space_complexity: str
    feedback: str
    code_quality_rating: str

class SQLSubmitRequest(BaseModel):
    query: str

class SQLEvaluationResponse(BaseModel):
    correctness_score: float
    is_valid_syntax: bool
    result_rows: List[Dict[str, Any]]
    execution_time_ms: float
    feedback: str

# --- Project Deep Dive Schemas ---
class ProjectQuestionRequest(BaseModel):
    project_title: str

class ProjectEvaluationResponse(BaseModel):
    project_title: str
    architecture_score: float
    scalability_eval: str
    security_eval: str
    tradeoffs_understood: bool
    feedback: str

# --- Job Readiness Score Schemas ---
class ReadinessBreakdownSchema(BaseModel):
    overall_score: float # 72.0
    resume_compatibility: float # 78.0
    technical_skills: float # 76.0
    dsa_score: float # 61.0
    problem_solving: float # 68.0
    communication: float # 84.0
    project_knowledge: float # 81.0
    coding_score: float # 74.0
    sql_score: float # 88.0
    evidence_bullets: List[str]
    disclaimer: str = "This score estimates readiness against selected job requirements based on available empirical evidence."

# --- Personalized Roadmap Schemas ---
class RoadmapTaskSchema(BaseModel):
    day: int
    topic: str
    why_it_matters: str
    difficulty: str
    practice_goal: str
    is_completed: bool = False

class RoadmapPrioritySchema(BaseModel):
    rank: int
    skill_name: str
    priority_score: float
    justification: str

class PersonalizedRoadmapResponse(BaseModel):
    priority_rankings: List[RoadmapPrioritySchema]
    seven_day_plan: List[RoadmapTaskSchema]

class ReassessmentResponse(BaseModel):
    previous_readiness_score: float
    new_readiness_score: float
    score_delta: float
    improved_skills: List[Dict[str, Any]]
    congratulations_message: str

# --- AI Role Roadmap Schemas ---
class RoadmapNodeSchema(BaseModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: str = "Beginner"
    estimated_hours: int = 4
    prerequisites: List[str] = []
    skills: List[str] = []
    projects: List[str] = []
    resources: List[str] = []

class RoleRoadmapRequest(BaseModel):
    target_role: str = "Full Stack Developer"
    current_skills: List[str] = []
    skill_gaps: List[str] = []
    experience_level: str = "Beginner"
    target_company: Optional[str] = None
    job_description: Optional[str] = None

class RoleRoadmapResponse(BaseModel):
    role: str
    audience: str
    estimated_months: int
    summary: str
    tracks: List[str]
    nodes: List[RoadmapNodeSchema]

class AITutorRequest(BaseModel):
    message: str
    role: str = "Full Stack Developer"
    current_skills: List[str] = []
    skill_gaps: List[str] = []
    roadmap_context: Optional[str] = None

class AITutorResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []

# --- Recruiter Dashboard Schemas ---
class RecruiterCandidateSchema(BaseModel):
    candidate_id: int
    candidate_name: str
    target_role: str
    job_readiness_score: float
    resume_compatibility: float
    verified_skills: Dict[str, str]
    top_strengths: List[str]
    top_gaps: List[str]
    decision_support_badge: str # "Strong Match", "Recommended with Upskilling", "High Risk Gap"

class RecruiterDashboardResponse(BaseModel):
    job_title: str
    total_applicants: int
    applicants: List[RecruiterCandidateSchema]
