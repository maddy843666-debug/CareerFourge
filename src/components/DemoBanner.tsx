import React from 'react';
import { RotateCcw, ChevronRight } from 'lucide-react';

interface DemoBannerProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  onResetDemo: () => void;
}

export const DEMO_STEPS = [
  { id: 1, name: "Landing", path: "landing" },
  { id: 2, name: "Login", path: "login" },
  { id: 3, name: "Signup", path: "signup" },
  { id: 4, name: "Dashboard", path: "dashboard" },
  { id: 5, name: "Target Job", path: "job" },
  { id: 6, name: "Resume", path: "resume" },
  { id: 7, name: "Skill Truth", path: "truth" },
  { id: 8, name: "Skill Gap", path: "gap" },
  { id: 9, name: "Interview", path: "interview" },
  { id: 10, name: "Coding", path: "coding" },
  { id: 11, name: "SQL", path: "sql" },
  { id: 12, name: "Readiness Score", path: "readiness" },
  { id: 13, name: "Roadmap", path: "roadmap" },
  { id: 14, name: "Reassessment", path: "reassessment" },
  { id: 15, name: "Recruiter View", path: "recruiter" },
];

export const DemoBanner: React.FC<DemoBannerProps> = ({ currentStep, onSelectStep, onResetDemo }) => {
  return (
    <div className="bg-[#0A192F] text-white border-b border-[#112240] px-4 py-2 text-xs font-sans sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex items-center px-2 py-0.5 rounded bg-[#FFDE59] text-[#0A192F] font-bold text-[10px]">
            DEMO MODE
          </span>
          <span className="text-slate-300 hidden md:inline text-[11px]">
            Step {currentStep} of {DEMO_STEPS.length}
          </span>
        </div>

        <div className="flex items-center overflow-x-auto py-0.5 scrollbar-none space-x-1 max-w-2xl">
          {DEMO_STEPS.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`whitespace-nowrap px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#427AB5] text-white font-bold'
                    : 'bg-[#112240] text-slate-300 hover:text-white'
                }`}
              >
                {step.id}. {step.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          {currentStep < DEMO_STEPS.length && (
            <button
              onClick={() => onSelectStep(currentStep + 1)}
              className="flex items-center px-2 py-1 rounded bg-[#427AB5] hover:bg-blue-600 text-white font-medium text-[11px]"
            >
              Next <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          )}
          <button
            onClick={onResetDemo}
            className="flex items-center px-2 py-1 rounded bg-[#112240] hover:bg-slate-700 text-slate-300 text-[11px]"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};
