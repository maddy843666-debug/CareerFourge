export interface UserProfileData {
  fullName: string;
  age: string;
  location: string;
  educationLevel: 'High School' | 'Diploma' | 'Undergraduate' | 'Postgraduate' | 'Other';
  college: string;
  yearOfStudy: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Graduate' | 'Working Professional';
}

export interface CareerGoalData {
  targetRole: string;
  experienceLevel: 'Student' | 'Fresher' | '0–2 years' | '2–5 years' | '5+ years';
  targetCompany: string;
  jobDescription?: string;
}

export interface ClaimedSkillItem {
  skillName: string;
  claimedLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ATSAnalysisResult {
  atsScore: number; // 78
  whatsWorking: string[];
  whatsMissing: string[];
  targetRoleMatches: { skill: string; status: 'Strong' | 'Good' | 'Needs improvement' | 'Missing evidence' }[];
  calculationReasoning: string;
}

export interface ResumeAnalysisResponse {
  compatibility_score: number;
  overall_score?: number;
  match_grade?: string;
  category_scores?: {
    formatting_readability: number;
    keyword_coverage: number;
    experience_impact: number;
    project_relevance: number;
  };
  matched_skills: string[];
  missing_skills: string[];
  whats_working?: string[];
  whats_missing?: string[];
  formatting_feedback?: string[];
  actionable_improvements?: string[];
  potential_gaps?: string[];
  extracted_projects?: { title: string; tech: string[]; desc: string }[];
  experience_summary?: string;
}


export interface JobRequirement {
  skill_name: string;
  category: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
}

export interface JobDetails {
  id: number;
  title: string;
  company: string;
  experience_required: string;
  required_skills: JobRequirement[];
  preferred_skills: JobRequirement[];
  optional_skills: JobRequirement[];
  responsibilities: string[];
}

export interface SkillTruthItem {
  skill_name: string;
  claimed_level: string;
  verified_level: string;
  confidence: number;
  job_importance: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface SkillTruthResponse {
  profile_id: number;
  candidate_name: string;
  target_role: string;
  skills: SkillTruthItem[];
  truth_summary_narrative: string;
}

export interface SkillGapItem {
  skill_name: string;
  required_level: string;
  verified_level: string;
  status: 'READY' | 'NEEDS_IMPROVEMENT' | 'HIGH_PRIORITY_GAP';
  job_importance: 'HIGH' | 'MEDIUM' | 'LOW';
  gap_score: number;
  evidence: string;
}

export interface JobGapResponse {
  ready_skills: SkillGapItem[];
  needs_improvement: SkillGapItem[];
  high_priority_gaps: SkillGapItem[];
  summary_message: string;
}

export interface InterviewChatMessage {
  sender: 'AI HR Interviewer' | 'You';
  text: string;
  time: string;
  verdict?: 'correct' | 'partially_correct' | 'incorrect';
  verdict_explanation?: string;
  evaluation?: {
    answer_quality?: number;
    technical_knowledge?: number;
    problem_solving?: number;
    communication?: number;
    depth?: number;
  };
}

export interface InterviewChatRequest {
  interview_id?: string;
  message?: string;
  action?: 'start' | 'chat' | 'finalize';
  target_role?: string;
  course?: string;
  custom_domain?: string;
  skills?: string[];
  difficulty?: string;
  interview_type?: string;
  num_questions?: number;
  mode?: 'conversational' | 'direct';
  is_hint?: boolean;
}

export interface InterviewChatResponse {
  interview_id: string;
  stage: 'setup' | 'interview' | 'completed' | 'error';
  message: string;
  interview_type?: string;
  target_role?: string;
  domain?: string;
  skills?: string[];
  difficulty?: string;
  num_questions?: number;
  current_question_num?: number;
  total_questions?: number;
  current_question?: string;
  is_clarification?: boolean;
  evaluation?: {
    answer_quality?: number;
    technical_knowledge?: number;
    problem_solving?: number;
    communication?: number;
    depth?: number;
  };
  feedback?: string;
  verdict?: 'correct' | 'partially_correct' | 'incorrect';
  verdict_explanation?: string;
  strengths?: string[];
  weaknesses?: string[];
  final_report?: {
    overall_score: number;
    technical_knowledge: number;
    problem_solving: number;
    communication: number;
    answer_quality: number;
    depth: number;
    correct_answers?: number;
    partially_correct_answers?: number;
    incorrect_answers?: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    final_feedback: string;
  };
}

export interface Question {
  question_id: number;
  interview_id?: number;
  sequence_num: number;
  total_budget: number;
  category: string;
  target_skill: string;
  question_text: string;
  difficulty: string;
  question_type?: string;
}

export interface AnswerEvaluation {
  question_id: number;
  clarity_score?: number;
  relevance_score?: number;
  technical_depth_score?: number;
  discovered_weakness?: string | null;
  feedback?: string;
  is_followup_needed?: boolean;
  is_completed?: boolean;
  evaluation?: any;
  next_question?: Question;
}

export interface CodingEvaluation {
  correctness_score: number;
  passed_tests: number;
  total_tests: number;
  time_complexity: string;
  space_complexity: string;
  feedback: string;
  code_quality_rating: string;
}

export interface AIHintResponse {
  hint: string;
  time_complexity_target: string;
  space_complexity_target: string;
  algorithmic_pattern: string;
}

export interface SQLEvaluation {
  correctness_score: number;
  is_valid_syntax: boolean;
  result_rows: Record<string, any>[];
  execution_time_ms: number;
  feedback: string;
  optimization_tips?: string[];
}

export interface ReadinessScore {
  overall_score: number;
  resume_compatibility: number;
  technical_skills: number;
  dsa_score: number;
  problem_solving: number;
  communication: number;
  project_knowledge: number;
  coding_score: number;
  sql_score: number;
  evidence_bullets: string[];
  disclaimer: string;
}

export interface RoadmapTask {
  day: number;
  topic: string;
  why_it_matters: string;
  difficulty: string;
  practice_goal: string;
  is_completed: boolean;
}

export interface RoadmapPriority {
  rank: number;
  skill_name: string;
  priority_score: number;
  justification: string;
}

export interface PersonalizedRoadmap {
  priority_rankings: RoadmapPriority[];
  seven_day_plan: RoadmapTask[];
}


export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_hours: number;
  prerequisites: string[];
  skills: string[];
  projects: string[];
  resources: string[];
}

export interface RoleRoadmap {
  role: string;
  audience: string;
  estimated_months: number;
  summary: string;
  tracks: string[];
  nodes: RoadmapNode[];
}

export interface AITutorResponse {
  reply: string;
  suggested_actions: string[];
}

export interface ReassessmentResult {
  previous_readiness_score: number;
  new_readiness_score: number;
  score_delta: number;
  improved_skills: { skill: string; before: number; after: number; delta: string }[];
  congratulations_message: string;
}

export interface RecruiterCandidate {
  candidate_id: number;
  candidate_name: string;
  target_role: string;
  job_readiness_score: number;
  resume_compatibility: number;
  verified_skills: Record<string, string>;
  top_strengths: string[];
  top_gaps: string[];
  decision_support_badge: 'Strong Match' | 'Recommended with Upskilling' | 'High Risk Gap';
}

export interface RecruiterDashboard {
  job_title: string;
  total_applicants: number;
  applicants: RecruiterCandidate[];
}
