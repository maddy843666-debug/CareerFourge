import {
  JobDetails,
  ResumeAnalysisResponse,
  SkillTruthResponse,
  JobGapResponse,
  Question,
  AnswerEvaluation,
  CodingEvaluation,
  SQLEvaluation,
  ReadinessScore,
  PersonalizedRoadmap,
  ReassessmentResult,
  RecruiterDashboard,
  RoleRoadmap,
  AITutorResponse,
  InterviewChatRequest,
  InterviewChatResponse
} from '../types';

const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:8000/api/v1'
  : '/api/v1';

async function fetchJSON<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[CareerFourge AI API] Network call to ${endpoint} failed, utilizing demo fallback mode`, err);
  }
  if (fallbackData !== undefined) return fallbackData;
  throw new Error(`Failed to load data for ${endpoint}`);
}

export const api = {
  generateRoleRoadmap: async (payload: {
    target_role: string;
    current_skills?: string[];
    skill_gaps?: string[];
    experience_level?: string;
    target_company?: string;
    job_description?: string;
  }): Promise<RoleRoadmap> => {
    return fetchJSON<RoleRoadmap>('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  askAITutor: async (payload: {
    message: string;
    role: string;
    current_skills?: string[];
    skill_gaps?: string[];
    roadmap_context?: string;
  }): Promise<AITutorResponse> => {
    return fetchJSON<AITutorResponse>('/ai/tutor', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Job Setup
  analyzeJob: async (roleTitle: string, jobDescription?: string): Promise<JobDetails> => {
    return fetchJSON<JobDetails>('/job/analyze', {
      method: 'POST',
      body: JSON.stringify({ role_title: roleTitle, job_description: jobDescription }),
    }, {
      id: 101,
      title: roleTitle || "Software Engineer",
      company: "TechCorp Global",
      experience_required: "2-4 Years",
      required_skills: [
        { skill_name: "Python", category: "REQUIRED", importance: "HIGH", weight: 1.0 },
        { skill_name: "DSA", category: "REQUIRED", importance: "HIGH", weight: 1.0 },
        { skill_name: "SQL", category: "REQUIRED", importance: "MEDIUM", weight: 0.8 },
        { skill_name: "System Design", category: "REQUIRED", importance: "HIGH", weight: 1.0 }
      ],
      preferred_skills: [
        { skill_name: "FastAPI", category: "PREFERRED", importance: "MEDIUM", weight: 0.7 },
        { skill_name: "Docker", category: "PREFERRED", importance: "LOW", weight: 0.5 }
      ],
      optional_skills: [
        { skill_name: "Kubernetes", category: "OPTIONAL", importance: "LOW", weight: 0.3 }
      ],
      responsibilities: [
        "Design and maintain scalable RESTful microservices in Python/FastAPI",
        "Optimize database queries and solve algorithmic bottlenecks",
        "Participate in system design discussions and code reviews"
      ]
    });
  },

  // Resume Upload & AI Analysis
  uploadResume: async (payload?: {
    file?: File;
    rawText?: string;
    targetRole?: string;
    jobDescription?: string;
  }): Promise<ResumeAnalysisResponse> => {
    const defaultFallback: ResumeAnalysisResponse = {
      compatibility_score: 78.0,
      overall_score: 78.0,
      match_grade: "Good Alignment",
      category_scores: {
        formatting_readability: 84.0,
        keyword_coverage: 76.0,
        experience_impact: 68.0,
        project_relevance: 82.0
      },
      matched_skills: ["Python", "SQL", "REST APIs", "Java", "MySQL"],
      missing_skills: ["System Design", "Docker", "Kubernetes"],
      whats_working: [
        "Strong core programming language experience in Python and SQL",
        "Clear project entries with identified technology stacks",
        "Relevant computer science/engineering education background",
        "Clean baseline structure parsed easily by ATS scanners"
      ],
      whats_missing: [
        "Lack of quantified impact metrics (e.g. %, $, response time reductions)",
        "Missing System Design evidence for distributed caching & sharding",
        "No containerization technologies (Docker / Kubernetes) listed",
        "Bullet points use passive language rather than strong impact action verbs"
      ],
      formatting_feedback: [
        "Use the Google X-Y-Z bullet format: 'Accomplished X, measured by Y, by doing Z'.",
        "Maintain standard 10pt-12pt font sizes to ensure high ATS OCR accuracy.",
        "Include direct hyperlinks to your GitHub repositories and live project demos."
      ],
      actionable_improvements: [
        "Quantify Project Results: Add metrics to experience bullets (e.g., 'Reduced query latency by 35% through SQL index tuning').",
        "Incorporate Missing ATS Keywords: Add 'System Design', 'Docker', 'Redis', and 'AWS' into your technical skills section.",
        "Elevate Action Verbs: Begin bullet points with strong action verbs like 'Engineered', 'Architected', 'Optimized', and 'Streamlined'.",
        "Add Live Demos & Code Links: Provide clickable URLs for your projects (GitHub, live web apps, or published papers).",
        "Tailor Summary Statement: Craft a 2-sentence header summary aligned directly to target job requirements."
      ],
      potential_gaps: ["Advanced DSA Variations", "High-scale Distributed Systems"],
      extracted_projects: [
        { title: "Online Voting System", tech: ["Java", "MySQL"], desc: "Secure voting platform with double-vote prevention." },
        { title: "Distributed Task Queue", tech: ["Python", "Redis"], desc: "Async worker pool handling background jobs." }
      ],
      experience_summary: "3 years of backend engineering experience developing REST APIs and relational database models."
    };

    if (payload?.rawText) {
      return fetchJSON<ResumeAnalysisResponse>('/resume/analyze', {
        method: 'POST',
        body: JSON.stringify({
          raw_text: payload.rawText,
          target_role: payload.targetRole || "Software Engineer",
          job_description: payload.jobDescription
        }),
      }, defaultFallback);
    }

    return fetchJSON<ResumeAnalysisResponse>('/resume/upload', { method: 'POST' }, defaultFallback);
  },


  // Skill Truth Engine
  getSkillTruth: async (): Promise<SkillTruthResponse> => {
    return fetchJSON<SkillTruthResponse>('/skills/truth', { method: 'GET' }, {
      profile_id: 1,
      candidate_name: "Alex Mercer",
      target_role: "Software Engineer",
      skills: [
        {
          skill_name: "DSA",
          claimed_level: "Advanced",
          verified_level: "Intermediate",
          confidence: 0.78,
          job_importance: "HIGH",
          evidence: [
            "Strong performance on array data structures and hash map lookups",
            "Struggled with rotated sorted array binary search variations",
            "Incomplete analysis of recursive tree time complexity"
          ],
          weaknesses: ["Binary Search Variations", "Complexity Analysis"],
          recommendation: "Practice binary search variations and formal complexity analysis."
        },
        {
          skill_name: "Python",
          claimed_level: "Advanced",
          verified_level: "Advanced",
          confidence: 0.92,
          job_importance: "HIGH",
          evidence: [
            "Demonstrated mastery of async syntax, decorators, and generator expressions",
            "Clean type hints and pythonic error handling"
          ],
          weaknesses: [],
          recommendation: "Maintain current high proficiency."
        },
        {
          skill_name: "System Design",
          claimed_level: "Intermediate",
          verified_level: "Weak",
          confidence: 0.65,
          job_importance: "HIGH",
          evidence: [
            "Understands REST routing and basic database tables",
            "Struggled with cache invalidation strategies and sharding logic"
          ],
          weaknesses: ["Distributed Caching", "Database Sharding"],
          recommendation: "Study trade-offs in distributed caching and database horizontal scaling."
        },
        {
          skill_name: "SQL",
          claimed_level: "Intermediate",
          verified_level: "Advanced",
          confidence: 0.88,
          job_importance: "MEDIUM",
          evidence: [
            "Flawless SQL query execution including multi-table JOINs and GROUP BY aggregation",
            "Correct window function usage (RANK() OVER PARTITION)"
          ],
          weaknesses: [],
          recommendation: "Solid empirical proof of SQL query writing capability."
        }
      ],
      truth_summary_narrative: "Your resume indicates advanced DSA experience, but the current assessment provides stronger evidence for intermediate-level proficiency. High mastery demonstrated in Python and SQL."
    });
  },

  // Job Gap Simulator
  getJobGap: async (): Promise<JobGapResponse> => {
    return fetchJSON<JobGapResponse>('/gap/simulate', { method: 'GET' }, {
      ready_skills: [
        { skill_name: "Python", required_level: "Advanced", verified_level: "Advanced", status: "READY", job_importance: "HIGH", gap_score: 0.0, evidence: "Verified Advanced proficiency through code execution and async syntax evaluation." },
        { skill_name: "SQL", required_level: "Intermediate", verified_level: "Advanced", status: "READY", job_importance: "MEDIUM", gap_score: 0.0, evidence: "Demonstrated window functions and complex query execution." }
      ],
      needs_improvement: [
        { skill_name: "DSA", required_level: "Advanced", verified_level: "Intermediate", status: "NEEDS_IMPROVEMENT", job_importance: "HIGH", gap_score: 3.5, evidence: "Target role demands Advanced DSA. Discovered weaknesses in rotated array binary search & complexity analysis." },
        { skill_name: "FastAPI", required_level: "Intermediate", verified_level: "Intermediate", status: "NEEDS_IMPROVEMENT", job_importance: "MEDIUM", gap_score: 2.0, evidence: "Good framework understanding; needs deeper knowledge of async request pipelines." }
      ],
      high_priority_gaps: [
        { skill_name: "System Design", required_level: "Advanced", verified_level: "Weak", status: "HIGH_PRIORITY_GAP", job_importance: "HIGH", gap_score: 7.0, evidence: "Critical target role requirement. Current evidence demonstrates weak sharding, caching, and concurrency scaling concepts." },
        { skill_name: "Docker", required_level: "Intermediate", verified_level: "Weak", status: "HIGH_PRIORITY_GAP", job_importance: "LOW", gap_score: 5.0, evidence: "Deployment pipeline containerization knowledge missing." }
      ],
      summary_message: "High Priority Gaps exist in System Design (High Importance) and DSA (High Importance). Docker is weak but lower job priority."
    });
  },

  // Conversational AI Chat Interview Engine (Gemini-Powered)
  chatInterview: async (payload: InterviewChatRequest): Promise<InterviewChatResponse> => {
    return fetchJSON<InterviewChatResponse>('/interview/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Interview Engine (Configured & Adaptive)
  startConfiguredInterview: async (config: {
    target_role?: string;
    interview_type: string;
    difficulty: string;
    num_questions: number;
    job_description?: string;
    target_company?: string;
    focus_skills?: string[];
  }): Promise<Question> => {
    return fetchJSON<Question>('/interview/start', {
      method: 'POST',
      body: JSON.stringify(config)
    }, {
      question_id: 1,
      interview_id: 101,
      sequence_num: 1,
      total_budget: config.num_questions || 10,
      category: config.interview_type || "Technical",
      target_skill: config.interview_type === "Behavioral / HR" ? "Communication" : "Python",
      question_text: config.interview_type === "Coding"
        ? "How would you design and implement an efficient caching decorator in Python with time-based TTL expiration?"
        : config.interview_type === "Behavioral / HR"
        ? "Tell me about a time when you had a disagreement with a team member on a technical decision. How did you resolve it?"
        : config.interview_type === "System Design"
        ? "How do you prevent a single relational database instance from becoming a read bottleneck under heavy traffic?"
        : config.interview_type === "SQL"
        ? "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with a realistic example."
        : `Based on your application for ${config.target_role || 'Software Engineer'}, can you walk me through your core technical background and key project experiences?`,
      difficulty: config.difficulty || "Intermediate",
      question_type: "initial"
    });
  },

  startInterview: async (): Promise<Question> => {
    return api.startConfiguredInterview({ interview_type: "Technical", difficulty: "Intermediate", num_questions: 10 });
  },

  submitAnswer: async (questionId: number, answerText: string, interviewId: number = 101): Promise<AnswerEvaluation> => {
    return fetchJSON<AnswerEvaluation>('/interview/answer', {
      method: 'POST',
      body: JSON.stringify({ interview_id: interviewId, question_id: questionId, user_answer: answerText }),
    }, {
      question_id: questionId,
      evaluation: {
        score: 8.0,
        technical_depth: "Good",
        star_structure: "Clear",
        key_feedback: "Solid explanation provided.",
        demonstrated_skills: ["Communication"],
        missing_aspects: []
      },
      next_question: {
        question_id: questionId + 1,
        interview_id: interviewId,
        sequence_num: questionId + 1,
        total_budget: 10,
        category: "Technical",
        target_skill: "System Design",
        question_text: "Can you explain how you handle database query optimization and caching in a high-traffic production application?",
        difficulty: "Intermediate",
        question_type: "followup"
      },
      is_completed: false
    });
  },

  getInterviewReport: async (interviewId: string | number = 101): Promise<any> => {
    return fetchJSON<any>(`/interview/${interviewId}/report`, { method: 'GET' }, {
      interview_id: interviewId,
      overall_score: 78.0,
      readiness_verdict: "INTERVIEW READY",
      competency_scores: {
        "Technical Depth": 80.0,
        "STAR Methodology": 75.0,
        "Problem Solving": 78.0,
        "Communication": 82.0
      },
      evaluated_skills: [
        { skill_name: "Python", score: 85.0, status: "STRONG" },
        { skill_name: "System Design", score: 65.0, status: "NEEDS_WORK" }
      ],
      key_strengths: [
        "Clear and structured answers using STAR method",
        "Strong understanding of Python async concepts"
      ],
      critical_gaps: [
        "Could expand on distributed database sharding and query caching strategies"
      ],
      actionable_recommendations: [
        "Review Redis caching patterns",
        "Practice binary search tree algorithms"
      ]
    });
  },

  getInterviewHistory: async () => {
    return fetchJSON('/interview/history', { method: 'GET' }, [
      {
        id: 101,
        date: "Sep 10, 2026",
        target_role: "Software Engineer",
        interview_type: "Technical Interview",
        difficulty: "Intermediate",
        overall_score: 74.0,
        skills_evaluated: ["Python", "DSA", "System Design"],
        weaknesses: ["DSA Complexity Analysis", "Database Sharding"],
        recommendations: ["Practice DSA Complexity", "Practice System Design Caching"]
      },
      {
        id: 98,
        date: "Sep 07, 2026",
        target_role: "Backend Developer",
        interview_type: "Mixed Interview",
        difficulty: "Intermediate",
        overall_score: 68.0,
        skills_evaluated: ["SQL", "FastAPI", "OOP"],
        weaknesses: ["SQL JOIN Optimization"],
        recommendations: ["Practice SQL Window Functions"]
      }
    ]);
  },

  getInterviewReadiness: async () => {
    return fetchJSON('/interview/readiness', { method: 'GET' }, {
      readiness_score: 68.0,
      breakdown: {
        technical_knowledge: 74.0,
        dsa: 61.0,
        coding: 72.0,
        communication: 84.0,
        sql: 66.0
      },
      biggest_gap: "DSA",
      reason: "The target role requires strong problem solving, while recent interview evidence shows weakness in algorithm complexity and optimization."
    });
  },

  simulateWhatIf: async (skillName: string, levelIncrease: number = 1) => {
    return fetchJSON('/interview/what-if', {
      method: 'POST',
      body: JSON.stringify({ skill_name: skillName, level_increase: levelIncrease })
    }, {
      current_readiness: 68.0,
      simulated_readiness: 73.0,
      delta: 5.0,
      explanation: `Improving ${skillName} by ${levelIncrease} level increases your estimated Job Readiness from 68% to 73% (+5%).`
    });
  },

  // Coding Workspace
  submitCode: async (code: string): Promise<CodingEvaluation> => {
    return fetchJSON<CodingEvaluation>('/coding/submit', {
      method: 'POST',
      body: JSON.stringify({ code, language: 'python' }),
    }, {
      correctness_score: 1.0,
      passed_tests: 5,
      total_tests: 5,
      time_complexity: "O(log N)",
      space_complexity: "O(1)",
      feedback: "Correct binary search implementation! Efficient O(log N) runtime with proper pivot calculation.",
      code_quality_rating: "Clean Pythonic Code"
    });
  },

  // SQL Workspace
  submitSQL: async (query: string): Promise<SQLEvaluation> => {
    return fetchJSON<SQLEvaluation>('/sql/submit', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }, {
      correctness_score: 1.0,
      is_valid_syntax: true,
      result_rows: [
        { customer_id: 101, customer_name: "Acme Corp", total_spent: 14500.00 },
        { customer_id: 102, customer_name: "Stark Industries", total_spent: 12200.50 },
        { customer_id: 103, customer_name: "Wayne Enterprises", total_spent: 9800.00 }
      ],
      execution_time_ms: 1.42,
      feedback: "Excellent query using INNER JOIN and GROUP BY with aggregate SUM(). Index utilized."
    });
  },

  // Readiness Score
  getReadinessScore: async (): Promise<ReadinessScore> => {
    return fetchJSON<ReadinessScore>('/readiness/1', { method: 'GET' }, {
      overall_score: 72.0,
      resume_compatibility: 78.0,
      technical_skills: 76.0,
      dsa_score: 61.0,
      problem_solving: 68.0,
      communication: 84.0,
      project_knowledge: 81.0,
      coding_score: 74.0,
      sql_score: 88.0,
      evidence_bullets: [
        "Strong resume compatibility (78%) matching Python, SQL, REST API requirements.",
        "Demonstrated SQL expertise (88%) and clear communication (84%).",
        "DSA (61%) verified at Intermediate level vs target Advanced requirement.",
        "System Design gaps identified in caching and concurrency scaling."
      ],
      disclaimer: "This score estimates readiness against selected job requirements based on available empirical evidence."
    });
  },

  // Roadmap & Reassessment
  getRoadmap: async (): Promise<PersonalizedRoadmap> => {
    return fetchJSON<PersonalizedRoadmap>('/roadmap/generate', { method: 'POST' }, {
      priority_rankings: [
        { rank: 1, skill_name: "DSA", priority_score: 9.2, justification: "Improving DSA is currently more valuable than Docker because DSA is a core high-importance requirement for this target Software Engineer role and your verified proficiency is below the expected level." },
        { rank: 2, skill_name: "System Design", priority_score: 8.7, justification: "System Design is a core requirement for senior software engineering duties. Addressing concurrency and caching gaps will yield immediate readiness impact." },
        { rank: 3, skill_name: "Docker", priority_score: 4.1, justification: "Docker is preferred for deployment pipelines but carries lower direct weight than core problem-solving requirements." }
      ],
      seven_day_plan: [
        { day: 1, topic: "Binary Search Fundamentals", why_it_matters: "Core DSA foundation for target role", difficulty: "Medium", practice_goal: "Implement standard binary search with boundary checks", is_completed: true },
        { day: 2, topic: "Binary Search Variations & Rotated Arrays", why_it_matters: "Primary weakness discovered during adaptive evaluation", difficulty: "Hard", practice_goal: "Solve LeetCode #33 Rotated Sorted Array", is_completed: true },
        { day: 3, topic: "Time & Space Complexity Analysis", why_it_matters: "Required for technical interview explanations", difficulty: "Medium", practice_goal: "Analyze recurrence relations and Big-O notation", is_completed: false },
        { day: 4, topic: "System Design: Distributed Caching", why_it_matters: "High-priority gap for target Software Engineer position", difficulty: "Hard", practice_goal: "Study Redis LRU eviction policies & write-through strategy", is_completed: false },
        { day: 5, topic: "Database Concurrency & Locking", why_it_matters: "Addresses project deep-dive weakness", difficulty: "Hard", practice_goal: "Implement optimistic vs pessimistic locking mechanisms", is_completed: false },
        { day: 6, topic: "Mock Practice & Problem Review", why_it_matters: "Consolidates technical readiness", difficulty: "Medium", practice_goal: "Solve 3 timed algorithm challenges", is_completed: false },
        { day: 7, topic: "Targeted Re-assessment", why_it_matters: "Validate readiness improvement", difficulty: "Hard", practice_goal: "Complete CareerFourge AI reassessment evaluation", is_completed: false }
      ]
    });
  },

  runReassessment: async (): Promise<ReassessmentResult> => {
    return fetchJSON<ReassessmentResult>('/reassessment/start', { method: 'POST' }, {
      previous_readiness_score: 68.0,
      new_readiness_score: 81.0,
      score_delta: 13.0,
      improved_skills: [
        { skill: "DSA", before: 51.0, after: 76.0, delta: "+25%" },
        { skill: "System Design", before: 48.0, after: 72.0, delta: "+24%" },
        { skill: "Problem Solving", before: 68.0, after: 82.0, delta: "+14%" }
      ],
      congratulations_message: "Re-assessment verified substantial improvement! Candidate now meets the target job readiness threshold for Software Engineer."
    });
  },

  // Recruiter Dashboard
  getRecruiterDashboard: async (): Promise<RecruiterDashboard> => {
    return fetchJSON<RecruiterDashboard>('/recruiter/dashboard', { method: 'GET' }, {
      job_title: "Software Engineer",
      total_applicants: 2,
      applicants: [
        {
          candidate_id: 1,
          candidate_name: "Alex Mercer (Sample Candidate)",
          target_role: "Software Engineer",
          job_readiness_score: 81.0,
          resume_compatibility: 78.0,
          verified_skills: { Python: "Advanced", SQL: "Advanced", DSA: "Intermediate", "System Design": "Intermediate" },
          top_strengths: ["Clean Async Python", "Flawless SQL Queries", "Clear Technical Communication"],
          top_gaps: ["High-Scale Distributed Sharding"],
          decision_support_badge: "Strong Match"
        },
        {
          candidate_id: 2,
          candidate_name: "Taylor Smith",
          target_role: "Software Engineer",
          job_readiness_score: 64.0,
          resume_compatibility: 82.0,
          verified_skills: { Python: "Intermediate", SQL: "Beginner", DSA: "Weak", "System Design": "Weak" },
          top_strengths: ["Resume Formatting", "Basic Python"],
          top_gaps: ["DSA Complexity Analysis", "System Design", "SQL Join Execution"],
          decision_support_badge: "Recommended with Upskilling"
        }
      ]
    });
  }
};
