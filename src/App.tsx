import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { ResumeProcessingScreen } from './pages/ResumeProcessingScreen';
import { ATSResultPage } from './pages/ATSResultPage';
import { BaselineAssessmentPage } from './pages/BaselineAssessmentPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { AssessmentPlayer } from './pages/AssessmentPlayer';
import { TargetJobSetup } from './pages/TargetJobSetup';
import { ResumeUpload } from './pages/ResumeUpload';
import { SkillTruthProfile } from './pages/SkillTruthProfile';
import { JobGapSimulator } from './pages/JobGapSimulator';
import { VoiceInterview } from './pages/VoiceInterview';
import { ChatInterview } from './pages/ChatInterview';
import { ProjectDeepDive } from './pages/ProjectDeepDive';
import { CodingWorkspace } from './pages/CodingWorkspace';
import { AptitudeWorkspace } from './pages/AptitudeWorkspace';
import { SQLWorkspace } from './pages/SQLWorkspace';
import { JobReadinessDashboard } from './pages/JobReadinessDashboard';
import { PersonalizedRoadmapPage } from './pages/PersonalizedRoadmap';
import { ReassessmentSimulator } from './pages/ReassessmentSimulator';
import { TestCenter } from './pages/TestCenter';
import { userStore } from './services/userStore';
import { JobDetails, SkillTruthResponse, JobGapResponse, ReadinessScore, PersonalizedRoadmap, UserProfileData, CareerGoalData, ClaimedSkillItem } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('binary-search');

  // App State Data
  const [jobData, setJobData] = useState<JobDetails | null>(null);
  const [truthData, setTruthData] = useState<SkillTruthResponse | null>(null);
  const [gapData, setGapData] = useState<JobGapResponse | null>(null);
  const [readinessData, setReadinessData] = useState<ReadinessScore | null>(null);
  const [roadmapData, setRoadmapData] = useState<PersonalizedRoadmap | null>(null);

  const handleNavigate = (tab: string, targetId?: string) => {
    // Protected routes check
    const protectedTabs = [
      'dashboard', 'baseline', 'assessment-player', 'job', 'resume', 
      'truth', 'gap', 'interview', 'voice-interview', 'chat-interview', 'project', 'coding', 'aptitude', 'sql', 
      'readiness', 'roadmap', 'reassessment', 'test-center'
    ];

    if (!isAuthenticated && protectedTabs.includes(tab)) {
      setCurrentTab('login');
      return;
    }

    if (targetId) {
      setSelectedAssessmentId(targetId);
      setCurrentTab('assessment-player');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setCurrentTab(tab);
  };

  // SIGNUP HANDLER -> MUST GO TO ONBOARDING (NEVER DIRECTLY TO DASHBOARD)
  const handleSignupSuccess = (user: { name: string; email: string }) => {
    userStore.signup(user.name, user.email);
    setIsAuthenticated(true);
    setCurrentTab('onboarding');
  };

  // LOGIN HANDLER -> RETURNING USERS GO DIRECTLY TO DASHBOARD
  const handleLoginSuccess = (user: { name: string; email: string }) => {
    userStore.login(user.name, user.email);
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
  };

  // ONBOARDING COMPLETED HANDLER -> RESUME PROCESSING SCREEN
  const handleOnboardingComplete = (data: {
    profile: UserProfileData;
    goal: CareerGoalData;
    skills: ClaimedSkillItem[];
    resumeFile: string | null;
  }) => {
    userStore.saveOnboarding(data.profile, data.goal, data.skills, data.resumeFile);
    setCurrentTab('processing');
  };

  // PROCESSING SCREEN COMPLETED -> ATS RESULT PAGE
  const handleProcessingComplete = () => {
    setCurrentTab('ats-result');
  };

  // ATS RESULT GO TO BASELINE ASSESSMENT
  const handleATSGoToBaseline = () => {
    setCurrentTab('baseline');
  };

  // BASELINE ASSESSMENT COMPLETED -> DASHBOARD
  const handleBaselineComplete = () => {
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    userStore.logout();
    setIsAuthenticated(false);
    setCurrentTab('landing');
  };

  const currentStore = userStore.getSnapshot();

  // Full-bleed views (unauthenticated or wizard flows)
  const isFullBleed = !isAuthenticated || ['landing', 'login', 'signup', 'onboarding', 'processing', 'ats-result', 'baseline'].includes(currentTab);

  if (isFullBleed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0A192F] font-sans flex flex-col justify-between selection:bg-[#FFDE59]">
        <div>
          <Navbar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            isAuthenticated={isAuthenticated}
            userName={currentStore.profile.fullName}
            onLogout={handleLogout}
          />
          <main>
            {currentTab === 'landing' && (
              <LandingPage
                onGetStarted={() => handleNavigate('signup')}
                onSignIn={() => handleNavigate('login')}
              />
            )}
            {currentTab === 'login' && (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigateToSignup={() => handleNavigate('signup')}
              />
            )}
            {currentTab === 'signup' && (
              <SignupPage
                onSignupSuccess={handleSignupSuccess}
                onNavigateToLogin={() => handleNavigate('login')}
              />
            )}
            {currentTab === 'onboarding' && (
              <OnboardingWizard onComplete={handleOnboardingComplete} />
            )}
            {currentTab === 'processing' && (
              <ResumeProcessingScreen onComplete={handleProcessingComplete} />
            )}
            {currentTab === 'ats-result' && (
              <ATSResultPage onGoToDashboard={handleATSGoToBaseline} />
            )}
            {currentTab === 'baseline' && (
              <BaselineAssessmentPage onComplete={handleBaselineComplete} />
            )}
          </main>
        </div>
      </div>
    );
  }

  // Dashboard & Authenticated App Shell with Left Sidebar
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex selection:bg-[#FEF08A]">
      {/* Left Sidebar */}
      <Sidebar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Right Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          isAuthenticated={isAuthenticated}
          userName={currentStore.profile.fullName}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          {currentTab === 'dashboard' && (
            <CandidateDashboard onNavigate={handleNavigate} />
          )}

          {currentTab === 'assessment-player' && (
            <AssessmentPlayer
              assessmentId={selectedAssessmentId}
              onComplete={() => handleNavigate('dashboard')}
            />
          )}

          {currentTab === 'job' && (
            <TargetJobSetup
              currentJob={jobData}
              onJobUpdated={(j) => setJobData(j)}
              onProceed={() => handleNavigate('resume')}
            />
          )}

          {currentTab === 'resume' && (
            <ResumeUpload onProceed={() => handleNavigate('truth')} />
          )}

          {currentTab === 'truth' && (
            <SkillTruthProfile
              truthData={truthData}
              onProceedToGap={() => handleNavigate('gap')}
            />
          )}

          {currentTab === 'gap' && (
            <JobGapSimulator
              gapData={gapData}
              onProceedToInterview={() => handleNavigate('interview')}
            />
          )}

          {(currentTab === 'interview' || currentTab === 'voice-interview') && (
            <VoiceInterview
              onProceedToCoding={() => handleNavigate('coding')}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'chat-interview' && (
            <ChatInterview
              onProceedToCoding={() => handleNavigate('coding')}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'project' && (
            <ProjectDeepDive onProceedToCoding={() => handleNavigate('coding')} />
          )}

          {currentTab === 'aptitude' && (
            <AptitudeWorkspace onNavigateToCoding={() => handleNavigate('coding')} />
          )}

          {currentTab === 'coding' && (
            <CodingWorkspace onProceedToSQL={() => handleNavigate('sql')} />
          )}

          {currentTab === 'sql' && (
            <SQLWorkspace onProceedToReadiness={() => handleNavigate('readiness')} />
          )}

          {currentTab === 'readiness' && (
            <JobReadinessDashboard
              readinessData={readinessData}
              onProceedToRoadmap={() => handleNavigate('roadmap')}
            />
          )}

          {currentTab === 'roadmap' && (
            <PersonalizedRoadmapPage
              onRunReassessment={() => handleNavigate('reassessment')}
              onNavigateToAssessment={(targetId) => handleNavigate('assessment-player', targetId)}
            />
          )}

          {currentTab === 'reassessment' && (
            <ReassessmentSimulator
              onBackToDashboard={() => handleNavigate('dashboard')}
            />
          )}

          {currentTab === 'test-center' && (
            <TestCenter />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
