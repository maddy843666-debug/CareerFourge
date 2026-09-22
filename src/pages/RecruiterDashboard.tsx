import React, { useEffect, useState } from 'react';
import { RecruiterDashboard } from '../types';
import { api } from '../services/api';

export const RecruiterDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecruiterDashboard().then((data) => {
      setDashboard(data);
      setLoading(false);
    });
  }, []);

  if (loading || !dashboard) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#0A192F] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Loading Recruiter View...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="border-b border-[#E2E8F0] pb-4">
        <span className="text-[10px] font-mono text-[#64748B] uppercase block">Recruiter Portal</span>
        <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Candidate Readiness Overview</h1>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-sm text-xs text-[#64748B]">
        <span className="font-bold text-[#0A192F]">Human-in-the-Loop Notice: </span>
        CareerFourge AI provides empirical evidence to support human recruiter decisions. Final hiring responsibility remains with human recruiters.
      </div>

      <div className="space-y-4">
        {dashboard.applicants.map((cand) => (
          <div key={cand.candidate_id} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#0A192F]">{cand.candidate_name}</h3>
                <span className="text-xs text-[#64748B]">Role: {cand.target_role}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] block uppercase">Readiness</span>
                <span className="text-lg font-extrabold text-[#0A192F]">{cand.job_readiness_score}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="font-semibold text-[#0A192F] block mb-1">Top Strengths</span>
                <ul className="text-[11px] text-[#64748B] space-y-0.5">
                  {cand.top_strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="font-semibold text-[#0A192F] block mb-1">Top Gaps</span>
                <ul className="text-[11px] text-[#64748B] space-y-0.5">
                  {cand.top_gaps.map((g, i) => <li key={i}>• {g}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
