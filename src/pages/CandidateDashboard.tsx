import React from 'react';
import {
  Pencil, FileText, Code2, Server, Mic, Brain, Sparkles, Zap, BarChart3,
  ChevronRight, ArrowRight, AlertTriangle, CheckCircle2, Target
} from 'lucide-react';
import { useUserStore } from '../hooks/useUserStore';

interface CandidateDashboardProps {
  onNavigate: (tab: string, targetId?: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onNavigate }) => {
  const store = useUserStore();

  const readiness = store.readinessScore || 69;
  const prevReadiness = store.previousReadinessScore || 68;
  const scoreDiff = Math.max(readiness - prevReadiness, 1);
  const firstName = store.profile.fullName ? store.profile.fullName.split(' ')[0] : 'Alex';

  // SVG Circular Gauge calculation for 69%
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  return (
    <div className="p-8 max-w-[1300px] mx-auto space-y-7 font-sans text-[#0F172A]">
      
      {/* HEADER ROW */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
          Good morning, {firstName}.
        </h1>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#64748B]">
          <span>Target role:</span>
          <span className="font-bold text-[#0F172A]">{store.goal.targetRole || 'Software Engineer'}</span>
          <button className="text-[#64748B] hover:text-[#0F172A]">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROW 1: JOB READINESS & 4 METRIC CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* JOB READINESS CARD (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block">
              JOB READINESS
            </span>

            <div className="flex items-center space-x-4">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#F59E0B"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-2xl font-black text-[#0F172A] font-sans">
                  {readiness}%
                </span>
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FEF08A] text-[#854D0E]">
                  Good progress
                </span>
                <div className="flex items-center space-x-1.5 text-xs text-[#64748B] font-medium">
                  <span>Target:</span>
                  <span className="font-bold text-[#0F172A]">{store.goal.targetRole || 'Software Engineer'}</span>
                  <Pencil className="w-3 h-3 text-[#64748B] cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 METRIC CARDS (7 COLS) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* ATS MATCH */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center space-x-2 text-[#64748B]">
              <FileText className="w-4 h-4 text-[#0284C7]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">ATS MATCH</span>
            </div>
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {store.atsResult.atsScore}%
            </span>
          </div>

          {/* DSA VERIFIED */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center space-x-2 text-[#64748B]">
              <Code2 className="w-4 h-4 text-[#0284C7]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">DSA VERIFIED</span>
            </div>
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {store.categoryScores.dsa}%
            </span>
          </div>

          {/* SYSTEM DESIGN */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center space-x-2 text-[#64748B]">
              <Server className="w-4 h-4 text-[#0284C7]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">SYSTEM DESIGN</span>
            </div>
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {store.categoryScores.systemDesign}%
            </span>
          </div>

          {/* INTERVIEW */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center space-x-2 text-[#64748B]">
              <Mic className="w-4 h-4 text-[#0284C7]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">INTERVIEW</span>
            </div>
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {store.categoryScores.interview}%
            </span>
          </div>

        </div>

      </div>

      {/* ROW 2: TWO FEATURED MODULES (AI HR INTERVIEW & CAREER INTELLIGENCE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT FEATURED: AI HR INTERVIEW */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0284C7]" />
              <span className="font-extrabold text-sm text-[#0F172A] tracking-tight">AI HR INTERVIEW</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#FEF08A] text-[#854D0E]">
                AI
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Practice realistic interviews with an AI HR interviewer that adapts to your answers.
            </p>
          </div>

          {/* Inner Stats Box */}
          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] text-[#64748B] block font-mono">Last Interview</span>
              <span className="text-lg font-extrabold text-[#0F172A] mt-0.5 block">71%</span>
            </div>

            <div className="border-l border-[#E2E8F0] pl-4">
              <span className="text-[10px] text-[#64748B] block font-mono">Strong area</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#166534]">
                Communication
              </span>
            </div>

            <div className="border-l border-[#E2E8F0] pl-4">
              <span className="text-[10px] text-[#64748B] block font-mono">Needs improvement</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B]">
                Behavioral examples
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => onNavigate('interview')}
              className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#1E293B] text-white font-semibold text-xs rounded-lg transition-colors flex items-center shadow-sm"
            >
              Start AI Interview <ArrowRight className="w-3.5 h-3.5 ml-2 text-[#FEF08A]" />
            </button>

            <button
              onClick={() => onNavigate('interview')}
              className="px-5 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-xs rounded-lg transition-colors"
            >
              View report
            </button>
          </div>
        </div>

        {/* RIGHT FEATURED: CAREER INTELLIGENCE */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-[#0284C7]" />
              <span className="font-extrabold text-sm text-[#0F172A] tracking-tight">CAREER INTELLIGENCE</span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Evidence suggests a different proficiency level.
            </p>
          </div>

          {/* Verification Table */}
          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden text-xs">
            <div className="bg-[#F8FAFC] px-4 py-2 flex justify-between text-[10px] font-mono text-[#64748B] font-bold border-b border-[#E2E8F0]">
              <span className="w-24">SKILL</span>
              <span className="w-32 text-center">SELF-ASSESSMENT</span>
              <span className="w-36 text-right">VERIFIED EVIDENCE</span>
            </div>

            <div className="divide-y divide-[#E2E8F0] font-medium bg-white">
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="font-bold text-[#0F172A] w-24">DSA</span>
                <span className="text-[#64748B] w-32 text-center">Advanced →</span>
                <div className="w-36 flex items-center justify-end space-x-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF08A] text-[#854D0E]">
                    Intermediate
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                </div>
              </div>

              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="font-bold text-[#0F172A] w-24">Python</span>
                <span className="text-[#64748B] w-32 text-center">Advanced →</span>
                <div className="w-36 flex items-center justify-end space-x-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#166534]">
                    Advanced
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
              </div>

              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="font-bold text-[#0F172A] w-24">SQL</span>
                <span className="text-[#64748B] w-32 text-center">Advanced →</span>
                <div className="w-36 flex items-center justify-end space-x-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B]">
                    Intermediate
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => onNavigate('truth')}
              className="text-xs font-bold text-[#0284C7] hover:underline flex items-center"
            >
              View evidence <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

      </div>

      {/* ROW 3: THREE CARDS GRID (TOP SKILL GAPS, RECOMMENDED NEXT BEST ACTION, RECENT PROGRESS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1: TOP SKILL GAPS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-[#0F172A]">
              <Target className="w-4 h-4 text-[#0284C7]" />
              <span className="font-extrabold text-xs tracking-wider uppercase font-mono text-[#64748B]">
                TOP SKILL GAPS
              </span>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div 
                onClick={() => onNavigate('gap')}
                className="p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#0284C7] flex justify-between items-center cursor-pointer transition-colors"
              >
                <span>1. DSA</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B]">
                    High
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                </div>
              </div>

              <div 
                onClick={() => onNavigate('gap')}
                className="p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#0284C7] flex justify-between items-center cursor-pointer transition-colors"
              >
                <span>2. System Design</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B]">
                    High
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                </div>
              </div>

              <div 
                onClick={() => onNavigate('gap')}
                className="p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#0284C7] flex justify-between items-center cursor-pointer transition-colors"
              >
                <span>3. Behavioral Interview</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF08A] text-[#854D0E]">
                    Medium
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('gap')}
            className="text-xs font-bold text-[#0284C7] hover:underline flex items-center text-left"
          >
            View all gaps <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* CARD 2: RECOMMENDED NEXT BEST ACTION */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#0F172A]">
              <Zap className="w-4 h-4 text-[#0284C7]" />
              <span className="font-extrabold text-xs tracking-wider uppercase font-mono text-[#64748B]">
                RECOMMENDED NEXT BEST ACTION
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-[#0F172A]">
              Complete Binary Search Assessment
            </h3>

            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF08A] text-[#854D0E]">
              High impact • +4% readiness
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Your DSA assessment shows a gap in binary-search variations and complexity analysis.
            </p>
          </div>

          <button
            onClick={() => onNavigate('assessment-player', 'binary-search')}
            className="w-full py-2.5 bg-[#0A192F] hover:bg-[#1E293B] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center shadow-sm"
          >
            Start assessment <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FEF08A]" />
          </button>
        </div>

        {/* CARD 3: RECENT PROGRESS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-[#0F172A]">
              <BarChart3 className="w-4 h-4 text-[#0284C7]" />
              <span className="font-extrabold text-xs tracking-wider uppercase font-mono text-[#64748B]">
                RECENT PROGRESS
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-[10px] text-[#64748B] block font-mono">Previous readiness:</span>
                <span className="text-lg font-bold text-[#0F172A]">{prevReadiness}%</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-[#0F172A]">{readiness}%</span>
              </div>
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#166534]">
              +{scoreDiff}% Readiness growth
            </div>

            <p className="text-[11px] text-[#64748B]">
              Keep going! Every assessment helps you get closer to your goal.
            </p>
          </div>

          <button
            onClick={() => onNavigate('readiness')}
            className="text-xs font-bold text-[#0284C7] hover:underline flex items-center text-left"
          >
            View detailed progress <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

      </div>

    </div>
  );
};
