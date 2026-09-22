import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface ProjectDeepDiveProps {
  onProceedToCoding: () => void;
}

export const ProjectDeepDive: React.FC<ProjectDeepDiveProps> = ({ onProceedToCoding }) => {
  const [selected, setSelected] = useState(0);

  const probes = [
    {
      q: "1. Architecture: Why Java + MySQL for Online Voting System?",
      metric: "Evaluates relational schema choice and transaction ACID compliance.",
      finding: "Strong MySQL ACID understanding, but needs deeper familiarity with isolation levels."
    },
    {
      q: "2. Concurrency: How do you handle 10,000 concurrent votes?",
      metric: "Evaluates pessimistic vs optimistic locking and atomic Redis counters.",
      finding: "Relied on application loops instead of atomic database locks."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">Project Deep Dive</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Resume Project Architecture Probe</h1>
        </div>

        <button
          onClick={onProceedToCoding}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          Proceed to Coding <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-4">
        <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">TARGET PROJECT</span>
        <h3 className="text-base font-bold text-[#0A192F]">Online Voting System (Java + MySQL)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {probes.map((item, i) => (
            <div
              key={i}
              onClick={() => setSelected(i)}
              className={`p-4 rounded border cursor-pointer text-xs transition-all ${
                selected === i ? 'border-[#0A192F] bg-[#F8FAFC]' : 'border-[#E2E8F0] hover:border-slate-300'
              }`}
            >
              <h4 className="font-bold text-[#0A192F]">{item.q}</h4>
              <p className="text-[#64748B] text-[11px] mt-2">{item.metric}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
          <span className="font-bold text-[#0A192F]">Evidence Finding: </span>
          <span className="text-[#64748B]">{probes[selected].finding}</span>
        </div>
      </div>

    </div>
  );
};
