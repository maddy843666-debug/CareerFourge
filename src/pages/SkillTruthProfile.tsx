import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SkillTruthResponse } from '../types';
import { api } from '../services/api';

interface SkillTruthProfileProps {
  truthData: SkillTruthResponse | null;
  onProceedToGap: () => void;
}

export const SkillTruthProfile: React.FC<SkillTruthProfileProps> = ({ truthData, onProceedToGap }) => {
  const [data, setData] = useState<SkillTruthResponse | null>(truthData);
  const [loading, setLoading] = useState(!truthData);

  useEffect(() => {
    if (!truthData) {
      api.getSkillTruth().then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [truthData]);

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#0A192F] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Loading Skill Truth Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Primary Differentiator</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Skill Truth Profile</h1>
        </div>

        <button
          onClick={onProceedToGap}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          Open Skill Gap Simulator <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-2">
        <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">EVIDENCE NARRATIVE</span>
        <p className="text-xs text-[#0A192F] font-medium leading-relaxed">
          "{data.truth_summary_narrative}"
        </p>
      </div>

      <div className="space-y-4">
        {data.skills.map((skill, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0A192F]">{skill.skill_name}</h3>
                <span className="text-[11px] text-[#64748B]">Importance: {skill.job_importance}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-[#64748B]">Claimed: <strong className="text-[#0A192F]">{skill.claimed_level}</strong></span>
                <span className="text-[#64748B]">→</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[#0A192F] font-bold border border-[#E2E8F0]">
                  Verified: {skill.verified_level}
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">({Math.round(skill.confidence * 100)}% Conf)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
                <span className="font-semibold text-[#0A192F] block mb-1">Assessment Evidence</span>
                <ul className="space-y-1 text-[#64748B] text-[11px]">
                  {skill.evidence.map((ev, i) => (
                    <li key={i}>• {ev}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
                <span className="font-semibold text-[#0A192F] block mb-1">Recommendation</span>
                <p className="text-[#64748B] text-[11px]">{skill.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
