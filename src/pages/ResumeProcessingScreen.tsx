import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface ResumeProcessingScreenProps {
  onComplete: () => void;
}

export const ResumeProcessingScreen: React.FC<ResumeProcessingScreenProps> = ({ onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const steps = [
    "Reading resume",
    "Extracting skills",
    "Identifying experience",
    "Comparing with target role",
    "Calculating ATS compatibility"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIdx(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 space-y-6 text-center">
        
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto text-[#0A192F]">
            <Loader2 className="w-5 h-5 animate-spin text-[#427AB5]" />
          </div>
          <h2 className="text-xl font-extrabold text-[#0A192F]">Analyzing your resume</h2>
          <p className="text-xs text-[#64748B]">Comparing resume claims with target Software Engineer requirements...</p>
        </div>

        {/* STEP CHECKLIST */}
        <div className="space-y-3 text-left border-t border-b border-[#E2E8F0] py-5 text-xs font-mono">
          {steps.map((stepText, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div key={idx} className="flex items-center space-x-3">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#427AB5] animate-spin shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}

                <span className={isDone ? 'text-[#0A192F] font-bold' : isCurrent ? 'text-[#427AB5] font-bold' : 'text-[#64748B]'}>
                  {stepText}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-full bg-[#F8FAFC] h-1.5 rounded overflow-hidden border border-[#E2E8F0]">
          <div
            className="bg-[#427AB5] h-full transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

      </div>
    </div>
  );
};
