import React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ATSResultPageProps {
  onGoToDashboard: () => void;
}

export const ATSResultPage: React.FC<ATSResultPageProps> = ({ onGoToDashboard }) => {
  const whatsWorking = [
    "Strong Python experience",
    "Relevant software projects",
    "Good technical skill coverage",
    "Relevant education"
  ];

  const whatsMissing = [
    "Limited DSA evidence",
    "No measurable project impact",
    "Missing some keywords from the target role",
    "Limited system design evidence"
  ];

  const roleMatches = [
    { skill: "Python", status: "Strong", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { skill: "SQL", status: "Good", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { skill: "DSA", status: "Needs improvement", badge: "bg-amber-50 text-amber-800 border-amber-200" },
    { skill: "System Design", status: "Missing evidence", badge: "bg-red-50 text-red-700 border-red-200" },
    { skill: "FastAPI", status: "Good", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-[#0A192F]">
      
      {/* HEADER & LARGE SCORE DISPLAY */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Analysis Completed</span>
          <h1 className="text-3xl font-extrabold text-[#0A192F] mt-0.5">Your resume analysis</h1>
        </div>

        <button
          onClick={onGoToDashboard}
          className="px-6 py-3 rounded bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs transition-colors flex items-center shadow-sm"
        >
          Go to my dashboard <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
        </button>
      </div>

      {/* ATS SCORE CARD */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-xs font-mono text-[#64748B] uppercase block">ATS COMPATIBILITY SCORE</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-5xl font-extrabold text-[#0A192F]">78</span>
            <span className="text-sm font-semibold text-[#64748B]">/ 100</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">
            Measures resume-to-job requirement compatibility.
          </p>
        </div>

        <div className="bg-[#F8FAFC] p-4 rounded border border-[#E2E8F0] text-xs font-mono space-y-1">
          <div className="flex justify-between space-x-6 text-[#64748B]">
            <span>Target Role:</span>
            <strong className="text-[#0A192F]">Software Engineer</strong>
          </div>
          <div className="flex justify-between space-x-6 text-[#64748B]">
            <span>Match Level:</span>
            <strong className="text-emerald-700">Good Alignment</strong>
          </div>
        </div>
      </div>

      {/* WHAT'S WORKING vs WHAT'S MISSING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* What's Working */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block border-b border-[#E2E8F0] pb-2 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            WHAT'S WORKING
          </span>
          <ul className="space-y-2 text-xs text-[#0A192F]">
            {whatsWorking.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-emerald-600 font-bold mr-2">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What's Missing */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
          <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider block border-b border-[#E2E8F0] pb-2 flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
            WHAT'S MISSING
          </span>
          <ul className="space-y-2 text-xs text-[#0A192F]">
            {whatsMissing.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-amber-600 font-bold mr-2">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* TARGET ROLE MATCH BREAKDOWN */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#E2E8F0] pb-3">
          TARGET ROLE MATCH
        </span>

        <div className="space-y-2">
          {roleMatches.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <span className="font-bold text-[#0A192F]">{item.skill}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${item.badge}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HOW WE CALCULATED THIS */}
      <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#E2E8F0] text-xs space-y-1">
        <span className="font-bold text-[#0A192F] flex items-center">
          <Info className="w-4 h-4 text-[#427AB5] mr-1.5" />
          How we calculated this
        </span>
        <p className="text-[#64748B] leading-relaxed pt-1">
          Your score is based on how closely your resume matches the target role, including skills, experience, projects, education, and job-description requirements.
        </p>
      </div>

      {/* FOOTER CTA BUTTON */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onGoToDashboard}
          className="px-8 py-3 rounded bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs transition-colors flex items-center shadow-sm"
        >
          Go to my dashboard <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
        </button>
      </div>

    </div>
  );
};
