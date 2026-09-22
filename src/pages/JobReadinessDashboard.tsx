import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ReadinessScore } from '../types';
import { api } from '../services/api';

interface JobReadinessDashboardProps {
  readinessData: ReadinessScore | null;
  onProceedToRoadmap: () => void;
}

export const JobReadinessDashboard: React.FC<JobReadinessDashboardProps> = ({
  readinessData,
  onProceedToRoadmap
}) => {
  const [data, setData] = useState<ReadinessScore | null>(readinessData);
  const [loading, setLoading] = useState(!readinessData);

  useEffect(() => {
    if (!readinessData) {
      api.getReadinessScore().then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [readinessData]);

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#0A192F] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Computing Job Readiness Score...</p>
      </div>
    );
  }

  const breakdown = [
    { name: 'Resume Compatibility', score: data.resume_compatibility },
    { name: 'Technical Skills', score: data.technical_skills },
    { name: 'DSA & Algorithms', score: data.dsa_score },
    { name: 'Problem Solving', score: data.problem_solving },
    { name: 'Technical Communication', score: data.communication },
    { name: 'Project Knowledge', score: data.project_knowledge },
    { name: 'Python Coding', score: data.coding_score },
    { name: 'SQL Querying', score: data.sql_score },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Job Readiness Engine</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Readiness Score Breakdown</h1>
        </div>

        <button
          onClick={onProceedToRoadmap}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          View Roadmap <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">OVERALL READINESS</span>
          <div className="text-5xl font-black text-[#0A192F] mt-1">{data.overall_score}%</div>
          <p className="text-xs text-[#64748B] mt-2 max-w-md">{data.disclaimer}</p>
        </div>

        <div className="bg-[#F8FAFC] p-4 rounded border border-[#E2E8F0] text-xs space-y-1.5 w-full sm:w-auto font-mono">
          <div className="flex justify-between space-x-6 text-[#64748B]">
            <span>Target Role:</span>
            <strong className="text-[#0A192F]">Software Engineer</strong>
          </div>
          <div className="flex justify-between space-x-6 text-[#64748B]">
            <span>Threshold:</span>
            <strong className="text-emerald-700">80%+</strong>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <span className="text-xs font-mono font-bold text-[#64748B] uppercase block border-b border-[#E2E8F0] pb-3">
          COMPETENCY SCORE BREAKDOWN
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {breakdown.map((item, idx) => (
            <div key={idx} className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0] space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-[#0A192F]">{item.name}</span>
                <span className="font-mono text-[#64748B]">{Math.round(item.score)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden">
                <div
                  className="bg-[#0A192F] h-full rounded"
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
