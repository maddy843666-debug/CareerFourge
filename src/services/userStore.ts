import {
  UserProfileData,
  CareerGoalData,
  ClaimedSkillItem,
  ATSAnalysisResult,
  ReadinessScore,
  RoadmapTask,
  SkillGapItem
} from '../types';

export interface AssessmentAttempt {
  id: string;
  title: string;
  category: 'DSA' | 'Technical' | 'System Design' | 'Behavioral';
  score: number;
  completedAt: string;
}

export interface UserStoreData {
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  resumeAnalyzed: boolean;
  baselineCompleted: boolean;

  profile: UserProfileData;
  goal: CareerGoalData;
  claimedSkills: ClaimedSkillItem[];
  experienceList: string[];
  resumeFileName: string | null;

  atsResult: ATSAnalysisResult;
  categoryScores: {
    dsa: number;
    technical: number;
    systemDesign: number;
    interview: number;
  };
  readinessScore: number;
  previousReadinessScore: number;
  skillGaps: SkillGapItem[];
  roadmap: RoadmapTask[];
  assessmentAttempts: AssessmentAttempt[];
  nextBestAction: {
    title: string;
    category: string;
    estimatedMinutes: number;
    impact: string;
    reason: string;
    targetAssessmentId: string;
  };
}

const INITIAL_STORE_DATA: UserStoreData = {
  isAuthenticated: false,
  onboardingCompleted: false,
  resumeAnalyzed: false,
  baselineCompleted: false,

  profile: {
    fullName: 'Alex Mercer',
    age: '24',
    location: 'San Francisco, CA',
    educationLevel: 'Undergraduate',
    college: 'University of California',
    yearOfStudy: 'Graduate'
  },

  goal: {
    targetRole: 'Software Engineer',
    experienceLevel: '0–2 years',
    targetCompany: 'Google',
    jobDescription: ''
  },

  claimedSkills: [
    { skillName: 'Python', claimedLevel: 'Advanced' },
    { skillName: 'SQL', claimedLevel: 'Intermediate' },
    { skillName: 'DSA', claimedLevel: 'Advanced' },
    { skillName: 'FastAPI', claimedLevel: 'Intermediate' }
  ],

  experienceList: ['Online Voting System (Java + MySQL)', 'Distributed Task Queue (Python + Redis)'],
  resumeFileName: null,

  atsResult: {
    atsScore: 78,
    whatsWorking: [
      'Strong Python experience',
      'Relevant software projects',
      'Good technical skill coverage',
      'Relevant education'
    ],
    whatsMissing: [
      'Limited DSA evidence',
      'No measurable project impact',
      'Missing some keywords from the target role',
      'Limited system design evidence'
    ],
    targetRoleMatches: [
      { skill: 'Python', status: 'Strong' },
      { skill: 'SQL', status: 'Good' },
      { skill: 'DSA', status: 'Needs improvement' },
      { skill: 'System Design', status: 'Missing evidence' },
      { skill: 'FastAPI', status: 'Good' }
    ],
    calculationReasoning: 'Your score is based on how closely your resume matches the target role, including skills, experience, projects, education, and job-description requirements.'
  },

  categoryScores: {
    dsa: 62,
    technical: 74,
    systemDesign: 48,
    interview: 68
  },

  readinessScore: 68,
  previousReadinessScore: 64,

  skillGaps: [
    {
      skill_name: 'DSA',
      required_level: 'Advanced',
      verified_level: '62%',
      status: 'HIGH_PRIORITY_GAP',
      job_importance: 'HIGH',
      gap_score: 8.5,
      evidence: 'Baseline assessment shows weakness in binary search variations & complexity bounds.'
    },
    {
      skill_name: 'System Design',
      required_level: 'Advanced',
      verified_level: '48%',
      status: 'HIGH_PRIORITY_GAP',
      job_importance: 'HIGH',
      gap_score: 7.8,
      evidence: 'Baseline test indicates missing caching, database sharding & concurrency safety experience.'
    },
    {
      skill_name: 'Behavioral Interview',
      required_level: 'Intermediate',
      verified_level: '68%',
      status: 'NEEDS_IMPROVEMENT',
      job_importance: 'MEDIUM',
      gap_score: 4.2,
      evidence: 'Good technical responses, but structure can improve with STAR method framing.'
    }
  ],

  roadmap: [
    { day: 1, topic: 'Binary Search Basics', why_it_matters: 'Foundation for algorithm problem solving', difficulty: 'Medium', practice_goal: 'Implement standard logarithmic binary search', is_completed: true },
    { day: 2, topic: 'Rotated Sorted Array Search', why_it_matters: 'Primary weakness identified in baseline assessment', difficulty: 'Hard', practice_goal: 'Solve LeetCode #33 with pivot bounds', is_completed: true },
    { day: 3, topic: 'Time & Space Complexity', why_it_matters: 'Required for technical interview trade-off analysis', difficulty: 'Medium', practice_goal: 'Analyze Big-O notation & recurrence relations', is_completed: false },
    { day: 4, topic: 'Distributed Caching (Redis)', why_it_matters: 'High-priority gap for target Software Engineer position', difficulty: 'Hard', practice_goal: 'Study LRU eviction & cache invalidation strategies', is_completed: false },
    { day: 5, topic: 'Database Concurrency & Locks', why_it_matters: 'Addresses relational database race condition gap', difficulty: 'Hard', practice_goal: 'Implement optimistic vs pessimistic locking', is_completed: false },
    { day: 6, topic: 'Mock Practice & Problem Review', why_it_matters: 'Consolidates technical readiness', difficulty: 'Medium', practice_goal: 'Solve 3 timed algorithm challenges', is_completed: false },
    { day: 7, topic: 'Targeted Re-assessment', why_it_matters: 'Validate readiness improvement', difficulty: 'Hard', practice_goal: 'Complete CareerForge AI reassessment evaluation', is_completed: false }
  ],

  assessmentAttempts: [],

  nextBestAction: {
    title: 'Complete Binary Search Assessment',
    category: 'DSA',
    estimatedMinutes: 15,
    impact: 'High impact (+4% readiness)',
    reason: 'Your DSA assessment shows a gap in binary search variations and complexity analysis.',
    targetAssessmentId: 'binary-search'
  }
};

class UserStore {
  private data: UserStoreData;
  private listeners: (() => void)[] = [];

  constructor() {
    const saved = localStorage.getItem('careerforge_user_store');
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch {
        this.data = { ...INITIAL_STORE_DATA };
      }
    } else {
      this.data = { ...INITIAL_STORE_DATA };
    }
  }

  private save() {
    localStorage.setItem('careerforge_user_store', JSON.stringify(this.data));
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getSnapshot(): UserStoreData {
    return this.data;
  }

  // --- ACTIONS ---

  login(name: string, email: string) {
    this.data.isAuthenticated = true;
    this.data.profile.fullName = name || this.data.profile.fullName;
    // Check if onboarding complete
    if (this.data.onboardingCompleted && this.data.baselineCompleted) {
      this.recalculateAll();
    }
    this.save();
  }

  signup(name: string, email: string) {
    this.data.isAuthenticated = true;
    this.data.onboardingCompleted = false;
    this.data.resumeAnalyzed = false;
    this.data.baselineCompleted = false;
    this.data.profile.fullName = name || 'New Candidate';
    this.save();
  }

  logout() {
    this.data.isAuthenticated = false;
    this.save();
  }

  saveOnboarding(profile: UserProfileData, goal: CareerGoalData, skills: ClaimedSkillItem[], resumeFile: string | null) {
    this.data.profile = profile;
    this.data.goal = goal;
    this.data.claimedSkills = skills;
    this.data.resumeFileName = resumeFile;
    this.data.onboardingCompleted = true;
    
    // Deterministic ATS Score Calculation
    this.calculateATSScore();
    this.save();
  }

  calculateATSScore() {
    const hasPython = this.data.claimedSkills.some(s => s.skillName.toLowerCase() === 'python');
    const hasSQL = this.data.claimedSkills.some(s => s.skillName.toLowerCase() === 'sql');
    const hasDSA = this.data.claimedSkills.some(s => s.skillName.toLowerCase() === 'dsa');
    const hasSysDesign = this.data.claimedSkills.some(s => s.skillName.toLowerCase() === 'system design');

    let base = 65;
    if (hasPython) base += 5;
    if (hasSQL) base += 4;
    if (hasDSA) base += 2;
    if (hasSysDesign) base += 2;

    this.data.atsResult.atsScore = Math.min(Math.max(base, 60), 92);
    this.data.resumeAnalyzed = true;
  }

  submitBaselineAssessment(answers: Record<string, string>) {
    // Deterministic baseline evaluation
    this.data.categoryScores.dsa = 62;
    this.data.categoryScores.technical = 74;
    this.data.categoryScores.systemDesign = 48;
    this.data.categoryScores.interview = 68;

    this.data.baselineCompleted = true;
    this.recalculateAll();
    this.save();
  }

  // RECALCULATION ENGINE (COMPLETING ASSESSMENT UPDATES EVERYTHING REACTIVELY)
  submitAssessmentResult(assessmentId: string, category: 'dsa' | 'technical' | 'systemDesign' | 'interview', earnedScore: number) {
    // 1. Save Attempt
    this.data.assessmentAttempts.push({
      id: assessmentId,
      title: assessmentId.replace('-', ' ').toUpperCase(),
      category: category === 'dsa' ? 'DSA' : category === 'systemDesign' ? 'System Design' : category === 'technical' ? 'Technical' : 'Behavioral',
      score: earnedScore,
      completedAt: new Date().toLocaleDateString()
    });

    // 2. Update specific category score
    const oldCategoryScore = this.data.categoryScores[category];
    const newCategoryScore = Math.min(Math.round((oldCategoryScore + earnedScore) / 2 + 10), 95);
    this.data.categoryScores[category] = newCategoryScore;

    // 3. Recalculate Composite Readiness Score & Gaps
    this.recalculateAll();
    this.save();
  }

  recalculateAll() {
    this.data.previousReadinessScore = this.data.readinessScore;

    // Weighted Formula: Readiness = 0.25*ATS + 0.25*Tech + 0.25*DSA + 0.15*SystemDesign + 0.10*Interview
    const ats = this.data.atsResult.atsScore;
    const tech = this.data.categoryScores.technical;
    const dsa = this.data.categoryScores.dsa;
    const sys = this.data.categoryScores.systemDesign;
    const int = this.data.categoryScores.interview;

    const computed = Math.round(
      0.25 * ats +
      0.25 * tech +
      0.25 * dsa +
      0.15 * sys +
      0.10 * int
    );

    this.data.readinessScore = computed;

    // Update Top Skill Gaps
    this.data.skillGaps = [
      {
        skill_name: 'DSA',
        required_level: 'Advanced',
        verified_level: `${dsa}%`,
        status: dsa < 75 ? 'HIGH_PRIORITY_GAP' : 'READY',
        job_importance: 'HIGH',
        gap_score: 85 - dsa,
        evidence: `Assessment score ${dsa}%. Weaknesses in binary search variations & complexity bounds.`
      },
      {
        skill_name: 'System Design',
        required_level: 'Advanced',
        verified_level: `${sys}%`,
        status: sys < 70 ? 'HIGH_PRIORITY_GAP' : 'READY',
        job_importance: 'HIGH',
        gap_score: 80 - sys,
        evidence: `Assessment score ${sys}%. Missing distributed caching, sharding & concurrency safety.`
      },
      {
        skill_name: 'Behavioral Interview',
        required_level: 'Intermediate',
        verified_level: `${int}%`,
        status: int < 75 ? 'NEEDS_IMPROVEMENT' : 'READY',
        job_importance: 'MEDIUM',
        gap_score: 75 - int,
        evidence: `Assessment score ${int}%. Structure can improve using the STAR method.`
      }
    ];

    // Dynamic Next Best Action
    if (dsa < 75) {
      this.data.nextBestAction = {
        title: 'Complete Binary Search Assessment',
        category: 'DSA',
        estimatedMinutes: 15,
        impact: 'High impact (+4% readiness)',
        reason: 'Your DSA assessment shows a gap in binary search variations and complexity analysis.',
        targetAssessmentId: 'binary-search'
      };
    } else if (sys < 70) {
      this.data.nextBestAction = {
        title: 'Complete Distributed Caching Module',
        category: 'System Design',
        estimatedMinutes: 20,
        impact: 'High impact (+5% readiness)',
        reason: 'System design is highly important for your target Software Engineer role.',
        targetAssessmentId: 'system-design'
      };
    } else {
      this.data.nextBestAction = {
        title: 'Complete Mock Technical Interview',
        category: 'Interview',
        estimatedMinutes: 15,
        impact: 'Medium impact (+3% readiness)',
        reason: 'Consolidate your readiness for your target Software Engineer applications.',
        targetAssessmentId: 'interview-prep'
      };
    }
  }

  resetStore() {
    this.data = { ...INITIAL_STORE_DATA };
    this.save();
  }
}

export const userStore = new UserStore();
