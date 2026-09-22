import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { JobDetails } from '../types';
import { api } from '../services/api';

interface TargetJobSetupProps {
  currentJob: JobDetails | null;
  onJobUpdated: (job: JobDetails) => void;
  onProceed: () => void;
}

const PREDEFINED = [
  { id: 'swe-fullstack', title: 'Software Engineer', exp: '2-4 Years' },
  { id: 'backend-dev', title: 'Senior Backend Engineer', exp: '4-6 Years' },
  { id: 'data-engineer', title: 'Data Platform Engineer', exp: '3-5 Years' }
];

export const TargetJobSetup: React.FC<TargetJobSetupProps> = ({ currentJob, onJobUpdated, onProceed }) => {
  const [selected, setSelected] = useState('swe-fullstack');
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<JobDetails | null>(currentJob);

  const handleAnalyze = async () => {
    setLoading(true);
    const roleObj = PREDEFINED.find(r => r.id === selected);
    const res = await api.analyzeJob(roleObj ? roleObj.title : 'Software Engineer');
    setJob(res);
    onJobUpdated(res);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="border-b border-[#E2E8F0] pb-4">
        <span className="text-[10px] font-mono text-[#64748B] uppercase block">Step 1</span>
        <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Target Job Setup</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PREDEFINED.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`p-4 rounded border cursor-pointer text-xs transition-all ${
              selected === r.id ? 'border-[#0A192F] bg-white font-bold' : 'border-[#E2E8F0] bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[#64748B] block text-[10px] font-mono">{r.exp}</span>
            <span className="text-[#0A192F] block mt-1">{r.title}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-4">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2.5 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Requirements'}
        </button>

        {job && (
          <div className="pt-4 border-t border-[#E2E8F0] space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#0A192F]">{job.title} ({job.company})</h3>
              <button
                onClick={onProceed}
                className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold flex items-center"
              >
                Proceed to Resume Analysis <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
              </button>
            </div>
            <div className="space-y-1 text-[#64748B]">
              <span className="font-semibold text-[#0A192F] block">Required Skills:</span>
              <p>{job.required_skills.map(s => s.skill_name).join(', ')}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
