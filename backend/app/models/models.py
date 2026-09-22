from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="candidate") # candidate, recruiter, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate_profiles = relationship("CandidateProfile", back_populates="user")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="Software Engineer Candidate")
    experience_years = Column(Float, default=3.0)
    target_job_title = Column(String, default="Software Engineer")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="candidate_profiles")
    resumes = relationship("Resume", back_populates="profile")
    candidate_skills = relationship("CandidateSkill", back_populates="profile")
    projects = relationship("Project", back_populates="profile")
    interviews = relationship("Interview", back_populates="profile")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    filename = Column(String)
    raw_text = Column(Text)
    compatibility_score = Column(Float, default=78.0)
    parsed_skills = Column(JSON, default=list) # ["Python", "SQL", "DSA", "FastAPI"]
    extracted_projects = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="resumes")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, default="TechCorp Global")
    description = Column(Text, nullable=False)
    experience_required = Column(String, default="2-4 Years")
    created_at = Column(DateTime, default=datetime.utcnow)

    requirements = relationship("JobRequirement", back_populates="job")

class JobRequirement(Base):
    __tablename__ = "job_requirements"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    skill_name = Column(String, nullable=False) # e.g. DSA, Python, System Design
    category = Column(String, default="REQUIRED") # REQUIRED, PREFERRED, OPTIONAL
    importance = Column(String, default="HIGH") # HIGH, MEDIUM, LOW
    weight = Column(Float, default=1.0)

    job = relationship("Job", back_populates="requirements")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, default="Technical")

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    skill_name = Column(String, nullable=False)
    claimed_level = Column(String, nullable=False) # Beginner, Intermediate, Advanced
    verified_level = Column(String, nullable=False) # Novice, Beginner, Intermediate, Advanced, Expert
    confidence = Column(Float, default=0.75) # 0.0 to 1.0 (75%)
    job_importance = Column(String, default="HIGH") # HIGH, MEDIUM, LOW
    evidence = Column(JSON, default=list) # Bullet points supporting verification
    weaknesses = Column(JSON, default=list) # Bullet points of discovered gaps
    recommendation = Column(Text)
    last_evaluated = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="candidate_skills")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    tech_stack = Column(JSON, default=list) # ["Java", "MySQL"]
    architecture_notes = Column(Text)
    security_eval = Column(String, default="Medium")
    scalability_eval = Column(String, default="Medium")

    profile = relationship("CandidateProfile", back_populates="projects")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    target_role = Column(String, default="Software Engineer")
    interview_type = Column(String, default="Technical") # Technical, Coding, Behavioral / HR, System Design, SQL, Mixed
    difficulty = Column(String, default="Intermediate") # Beginner, Intermediate, Advanced
    max_questions = Column(Integer, default=10) # 5, 10, 15
    questions_asked = Column(Integer, default=0)
    job_description = Column(Text, nullable=True)
    target_company = Column(String, nullable=True)
    focus_skills = Column(JSON, default=list) # ["Python", "DSA", "SQL"]
    status = Column(String, default="in_progress") # configured, in_progress, completed
    overall_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CandidateProfile", back_populates="interviews")
    questions = relationship("Question", back_populates="interview")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    sequence_num = Column(Integer, nullable=False)
    category = Column(String, default="Technical") # Technical, Coding, Behavioral, System Design, SQL, Mixed
    target_skill = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    difficulty = Column(String, default="Intermediate")
    question_type = Column(String, default="initial") # initial, adaptive_foundational, adaptive_deeper
    info_value_score = Column(Float, default=0.85)

    interview = relationship("Interview", back_populates="questions")
    answer = relationship("Answer", uselist=False, back_populates="question")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_answer = Column(Text, nullable=False)
    evaluated = Column(Boolean, default=False)
    
    # Multidimensional Answer Evaluation
    technical_accuracy = Column(Float, default=7.0) # 1-10
    concept_understanding = Column(Float, default=7.0) # 1-10
    problem_solving = Column(Float, default=7.0) # 1-10
    completeness = Column(Float, default=7.0) # 1-10
    communication = Column(Float, default=8.0) # 1-10
    clarity = Column(Float, default=8.0) # 1-10
    reasoning = Column(Float, default=7.0) # 1-10
    examples = Column(Float, default=6.0) # 1-10
    answer_confidence = Column(Float, default=0.8) # 0.0 to 1.0 (evidence-based)
    overall_score = Column(Float, default=7.2) # 0 to 10
    
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    skills_detected = Column(JSON, default=list)
    feedback = Column(Text)
    follow_up_required = Column(Boolean, default=False)
    next_question_type = Column(String, default="deeper_concept") # foundational, deeper_concept

    question = relationship("Question", back_populates="answer")

class InterviewSkillEvidence(Base):
    __tablename__ = "interview_skill_evidences"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    skill_name = Column(String, nullable=False)
    claimed_level = Column(String, nullable=False) # Advanced, Intermediate, Beginner
    verified_level = Column(String, nullable=False) # Intermediate, Advanced, Weak
    confidence = Column(Float, default=0.84) # 84%
    evidence_bullets = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    question_references = Column(JSON, default=list) # [2, 4, 7, 9]
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewReport(Base):
    __tablename__ = "interview_reports"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    overall_score = Column(Float, default=74.0)
    technical_knowledge = Column(Float, default=78.0)
    problem_solving = Column(Float, default=71.0)
    communication = Column(Float, default=82.0)
    answer_quality = Column(Float, default=76.0)
    strong_areas = Column(JSON, default=list)
    areas_to_improve = Column(JSON, default=list)
    key_observations = Column(Text)
    evidence_breakdown = Column(JSON, default=dict) # Why did I get this score breakdown
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewRecommendation(Base):
    __tablename__ = "interview_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    title = Column(String, nullable=False) # Practice DSA Complexity
    category = Column(String, nullable=False) # DSA, SQL, System Design, Technical
    reason = Column(Text, nullable=False)
    action_type = Column(String, nullable=False) # practice_dsa, practice_sql, practice_sys_design, retake_interview
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    problem_title = Column(String, default="Rotated Sorted Array Search")
    language = Column(String, default="python")
    code = Column(Text, nullable=False)
    correctness_score = Column(Float, default=1.0)
    time_complexity = Column(String, default="O(log N)")
    space_complexity = Column(String, default="O(1)")
    feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class SQLSubmission(Base):
    __tablename__ = "sql_submissions"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    problem_title = Column(String, default="Find Top Customers & Total Spent")
    query = Column(Text, nullable=False)
    correctness_score = Column(Float, default=1.0)
    efficiency_score = Column(Float, default=0.9)
    feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReadinessScore(Base):
    __tablename__ = "readiness_scores"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    overall_score = Column(Float, default=72.0) # 0 to 100
    resume_compatibility = Column(Float, default=78.0)
    technical_skills = Column(Float, default=76.0)
    dsa_score = Column(Float, default=61.0)
    problem_solving = Column(Float, default=68.0)
    communication = Column(Float, default=84.0)
    project_knowledge = Column(Float, default=81.0)
    coding_score = Column(Float, default=74.0)
    sql_score = Column(Float, default=88.0)
    evidence_summary = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class ImprovementPlan(Base):
    __tablename__ = "improvement_plans"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    days_plan = Column(JSON, default=list) # Array of day tasks
    priority_order = Column(JSON, default=list) # Priority list with justification
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
