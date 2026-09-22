import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { JobGapResponse } from '../types';
import { api } from '../services/api';

interface JobGapSimulatorProps {
  gapData: JobGapResponse | null;
  onProceedToInterview: () => void;
}

export const JobGapSimulator: React.FC<JobGapSimulatorProps> = ({ gapData, onProceedToInterview }) => {
  const [data, setData] = useState<JobGapResponse | null>(gapData);
  const [loading, setLoading] = useState(!gapData);

  useEffect(() => {
    if (!gapData) {
      api.getJobGap().then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [gapData]);

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#0A192F] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Analyzing Skill Gap Matrix...</p>
      </div>
    );
  }

  const allSkills = [
    { skill_name: "Python", status: "Strong", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", req: "Required" },
    { skill_name: "SQL", status: "Strong", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", req: "Required" },
    { skill_name: "DSA", status: "Developing", badge: "bg-amber-50 text-amber-800 border-amber-200", req: "Required" },
    { skill_name: "System Design", status: "Needs Work", badge: "bg-red-50 text-red-700 border-red-200", req: "Required" },
    { skill_name: "Cloud & Docker", status: "Developing", badge: "bg-amber-50 text-amber-800 border-amber-200", req: "Preferred" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Skill Gap Analysis</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Target Role Requirements vs Verified Skills</h1>
        </div>

        <button
          onClick={onProceedToInterview}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          Launch Adaptive Interview <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-xs font-mono text-[#64748B] uppercase border-b border-[#E2E8F0] pb-3">
          <span>Target Skill</span>
          <span>Requirement Level</span>
          <span>Verified Status</span>
        </div>

        <div className="space-y-3">
          {allSkills.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium"
            >
              <span className="font-bold text-[#0A192F] w-1/3">{item.skill_name}</span>
              <span className="text-[#64748B] w-1/3">{item.req}</span>
              <div className="w-1/3 text-right">
                <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold border ${item.badge}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Key Insight:</span> Improving System Design and DSA will yield the highest direct increase in your job readiness for Software Engineer.
        </p>
      </div>

    </div>
  );
};
