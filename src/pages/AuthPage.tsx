import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, Briefcase, Target, Upload, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';

interface AuthPageProps {
  onAuthSuccess: (userData: { full_name: string; email: string; target_role: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: Role details, 3: Resume Upload with Effect

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('24');
  const [expYears, setExpYears] = useState('3.0');
  const [targetRole, setTargetRole] = useState('Software Engineer (Full Stack)');
  const [currentPos, setCurrentPos] = useState('Junior Backend Engineer');

  // Resume scanning effect state
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthSuccess({
      full_name: fullName || 'Alex Mercer',
      email: email || 'alex.mercer@demo.com',
      target_role: targetRole || 'Software Engineer (Full Stack)'
    });
  };

  const handleSocialAuth = (provider: string) => {
    onAuthSuccess({
      full_name: `${provider} Candidate User`,
      email: `user@${provider.toLowerCase()}.com`,
      target_role: targetRole
    });
  };

  const handleStartScanEffect = async () => {
    setIsScanning(true);
    setScanComplete(false);

    // Simulate futuristic AI resume scan animation effect
    setTimeout(() => {
      setExtractedSkills(['Python', 'SQL', 'DSA (Claimed: Advanced)', 'FastAPI', 'Java', 'MySQL']);
      setIsScanning(false);
      setScanComplete(true);
    }, 2200);
  };

  const handleCompleteOnboarding = () => {
    onAuthSuccess({
      full_name: fullName || 'New Registered Candidate',
      email: email || 'candidate@readyrole.ai',
      target_role: targetRole
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Top Branding Header */}
        <div className="bg-navy-900 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-slate-blue/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-navy-800 text-mustard-400 font-black text-2xl mx-auto flex items-center justify-center shadow-lg border border-navy-700">
              RR
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mt-3">READY<span className="text-slate-blue">ROLE</span></h2>
            <p className="text-xs text-slate-300 mt-1">Know where you stand before you apply.</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-navy-800 border border-navy-700 text-xs font-semibold">
            <button
              onClick={() => { setMode('signin'); setSignupStep(1); }}
              className={`px-5 py-2 rounded-lg transition-all ${
                mode === 'signin' ? 'bg-mustard-400 text-navy-900 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-5 py-2 rounded-lg transition-all ${
                mode === 'signup' ? 'bg-mustard-400 text-navy-900 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              New Candidate Sign Up
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Social Auth Buttons (Google, Apple, GitHub) */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block text-center">
              Quick One-Click Sign In
            </span>
            <div className="grid grid-cols-3 gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Google
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleSocialAuth('Apple')}
                className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.81 1.44-.61.71-1.15 1.86-1 2.97 1.07.08 2.16-.56 2.82-1.37z"/>
                </svg>
                Apple
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => handleSocialAuth('GitHub')}
                className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-mono uppercase">Or enter credentials</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* MODE 1: SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.mercer@candidate.com"
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors shadow-lg flex items-center justify-center"
              >
                Sign In & Open Dashboard <ArrowRight className="w-4 h-4 ml-1.5 text-mustard-400" />
              </button>
            </form>
          )}

          {/* MODE 2: SIGN UP ONBOARDING FLOW */}
          {mode === 'signup' && (
            <div className="space-y-6">
              
              {/* Onboarding Progress Steps Indicator */}
              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
                <span className={`font-bold ${signupStep === 1 ? 'text-navy-900 font-extrabold' : 'text-slate-400'}`}>
                  1. Basic Details
                </span>
                <span className="text-slate-300">→</span>
                <span className={`font-bold ${signupStep === 2 ? 'text-navy-900 font-extrabold' : 'text-slate-400'}`}>
                  2. Role Goals
                </span>
                <span className="text-slate-300">→</span>
                <span className={`font-bold ${signupStep === 3 ? 'text-navy-900 font-extrabold' : 'text-slate-400'}`}>
                  3. Resume Effect
                </span>
              </div>

              {/* STEP 1: Candidate Basic Info */}
              {signupStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Mercer"
                        className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Age</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Years Experience</label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={expYears}
                          onChange={(e) => setExpYears(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.mercer@demo.com"
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>

                  <button
                    onClick={() => setSignupStep(2)}
                    className="w-full py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors flex items-center justify-center"
                  >
                    Next: Target Role Details <ArrowRight className="w-4 h-4 ml-1.5 text-mustard-400" />
                  </button>
                </div>
              )}

              {/* STEP 2: Role Details */}
              {signupStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Target Job Title</label>
                    <div className="relative">
                      <Target className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="Software Engineer (Full Stack)"
                        className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Current Position</label>
                    <input
                      type="text"
                      value={currentPos}
                      onChange={(e) => setCurrentPos(e.target.value)}
                      placeholder="Junior Backend Developer"
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => setSignupStep(1)}
                      className="w-1/3 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 hover:bg-slate-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setSignupStep(3)}
                      className="w-2/3 py-3.5 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 flex items-center justify-center"
                    >
                      Next: Upload Resume with Effect <Sparkles className="w-4 h-4 ml-1.5 text-mustard-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Resume Upload with Animated Visual Scan Effect */}
              {signupStep === 3 && (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-3">
                    <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block">
                      Candidate Resume AI Initialization
                    </span>

                    {!isScanning && !scanComplete && (
                      <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:border-navy-900 transition-all flex flex-col items-center space-y-3">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-xs text-slate-600 font-medium">Upload PDF Resume or Load Preset Candidate Data</span>
                        <button
                          onClick={handleStartScanEffect}
                          className="px-5 py-2.5 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 flex items-center shadow"
                        >
                          <Zap className="w-3.5 h-3.5 mr-1.5 text-mustard-400" />
                          Start AI Resume Scan Effect
                        </button>
                      </div>
                    )}

                    {/* ANIMATED SCAN EFFECT */}
                    {isScanning && (
                      <div className="relative p-8 rounded-xl bg-navy-900 text-white overflow-hidden shadow-2xl border border-navy-800 space-y-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-mustard-400/20 to-transparent animate-pulse"></div>
                        <div className="w-12 h-12 rounded-full bg-navy-800 text-mustard-400 flex items-center justify-center mx-auto animate-bounce">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h4 className="font-extrabold text-sm text-mustard-400">AI SKILL TRUTH SCAN IN PROGRESS...</h4>
                        <p className="text-xs text-slate-300 font-mono">Extracting claimed technical proficiencies & project evidence</p>
                        
                        {/* Scanning Laser Line */}
                        <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden mt-3">
                          <div className="bg-gradient-to-r from-slate-blue via-mustard-400 to-emerald-400 h-full w-full animate-pulse"></div>
                        </div>
                      </div>
                    )}

                    {/* SCAN COMPLETE CONFIRMATION */}
                    {scanComplete && (
                      <div className="p-6 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 space-y-3 text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                        <h4 className="font-extrabold text-sm text-emerald-900">Resume Parsed & Baseline Initialized!</h4>
                        <div className="flex flex-wrap gap-1.5 justify-center text-[11px] font-mono">
                          {extractedSkills.map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300">
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCompleteOnboarding}
                    disabled={!scanComplete}
                    className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors shadow-lg flex items-center justify-center disabled:opacity-50"
                  >
                    Complete Registration & Launch Engine <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
