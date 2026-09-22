import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ReassessmentResult } from '../types';
import { api } from '../services/api';

interface ReassessmentSimulatorProps {
  onBackToDashboard: () => void;
}

export const ReassessmentSimulator: React.FC<ReassessmentSimulatorProps> = ({ onBackToDashboard }) => {
  const [result, setResult] = useState<ReassessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.runReassessment().then((res) => {
      setResult(res);
      setLoading(false);
    });
  }, []);

  if (loading || !result) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#0A192F] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Re-assessing Candidate Verified Skills...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="border-b border-[#E2E8F0] pb-4">
        <span className="text-[10px] font-mono text-[#64748B] uppercase block">Re-assessment Complete</span>
        <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Readiness Score Progression</h1>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">BEFORE</span>
          <div className="text-2xl font-bold text-[#64748B] mt-1">{result.previous_readiness_score}%</div>
        </div>

        <span className="text-[#427AB5] font-bold text-lg">→</span>

        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">NEW VERIFIED READINESS</span>
          <div className="text-4xl font-extrabold text-[#0A192F] mt-1">{result.new_readiness_score}%</div>
        </div>

        <div className="px-3 py-1 bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-200 rounded">
          +{result.score_delta}% Total Growth
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-3">
        <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-2">
          SKILL GAINS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {result.improved_skills.map((item, i) => (
            <div key={i} className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <span className="font-bold text-[#0A192F] block">{item.skill}</span>
              <span className="text-[11px] text-[#64748B]">{item.before}% → <strong className="text-emerald-700">{item.after}%</strong></span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={onBackToDashboard}
          className="px-6 py-2.5 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          Return to Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
        </button>
      </div>

    </div>
  );
};
