import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { userStore } from '../services/userStore';

interface BaselineAssessmentPageProps {
  onComplete: () => void;
}

const BASELINE_QUESTIONS = [
  {
    id: 'dsa_1',
    category: 'DSA',
    title: 'Data Structures & Algorithms',
    question: 'What is the optimal time complexity to find an element in a sorted array of N elements?',
    options: [
      { key: 'A', text: 'O(N) linear time' },
      { key: 'B', text: 'O(log N) logarithmic time using binary search', correct: true },
      { key: 'C', text: 'O(N^2) quadratic time' },
      { key: 'D', text: 'O(1) constant time' }
    ]
  },
  {
    id: 'sys_1',
    category: 'System Design',
    title: 'System Architecture & Scalability',
    question: 'How do you prevent a single database instance from becoming a bottleneck under heavy read traffic?',
    options: [
      { key: 'A', text: 'Implement horizontal read replicas with an in-memory caching layer (e.g., Redis)', correct: true },
      { key: 'B', text: 'Increase the CPU core count on the primary database server indefinitely' },
      { key: 'C', text: 'Disable database indexes to speed up write latency' },
      { key: 'D', text: 'Execute all queries synchronously on a single thread' }
    ]
  },
  {
    id: 'tech_1',
    category: 'Technical Knowledge',
    title: 'Software Engineering & Async Logic',
    question: 'In modern Web APIs (FastAPI / Node.js), what is the primary benefit of async non-blocking I/O?',
    options: [
      { key: 'A', text: 'It makes single-threaded CPU computations 10x faster' },
      { key: 'B', text: 'It allows the thread to serve other requests while waiting for network/DB I/O operations', correct: true },
      { key: 'C', text: 'It automatically encrypts all HTTP headers' },
      { key: 'D', text: 'It removes the need for database transactions' }
    ]
  },
  {
    id: 'int_1',
    category: 'Behavioral & Communication',
    title: 'Interview & Communication Safety',
    question: 'When asked about a past project failure in a technical interview, how should you structure your response?',
    options: [
      { key: 'A', text: 'Blame external team members or changing management requirements' },
      { key: 'B', text: 'Use the STAR method: describe the Situation, Task, Action taken, and key Lessons learned', correct: true },
      { key: 'C', text: 'Claim you have never experienced a project failure' },
      { key: 'D', text: 'Pivot immediately to an unrelated success story' }
    ]
  }
];

export const BaselineAssessmentPage: React.FC<BaselineAssessmentPageProps> = ({ onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const handleSelectOption = (qId: string, optKey: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optKey }));
  };

  const isAllAnswered = BASELINE_QUESTIONS.every(q => selectedAnswers[q.id]);

  const handleSubmit = () => {
    userStore.submitBaselineAssessment(selectedAnswers);
    onComplete();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-[#0A192F]">
      
      {/* HEADER */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-[#0A192F] text-[#FFDE59] font-mono text-[10px] font-bold">
            BASELINE DIAGNOSTIC
          </span>
          <span className="text-xs text-[#64748B] font-mono">Step 3 of 3</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#0A192F]">
          Initial Skill Verification
        </h1>
        <p className="text-xs text-[#64748B] leading-relaxed max-w-xl">
          Answer these 4 diagnostic questions to benchmark your baseline readiness across DSA, Technical Knowledge, System Design, and Interview Communication.
        </p>
      </div>

      {/* QUESTION LIST */}
      <div className="space-y-6">
        {BASELINE_QUESTIONS.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 text-xs">
              <span className="font-mono font-bold text-[#427AB5] uppercase">
                {idx + 1}. {q.title}
              </span>
              <span className="text-[10px] font-mono bg-[#F8FAFC] text-[#64748B] px-2 py-0.5 rounded border border-[#E2E8F0]">
                {q.category}
              </span>
            </div>

            <p className="text-sm font-bold text-[#0A192F] leading-snug">
              {q.question}
            </p>

            <div className="space-y-2 pt-1">
              {q.options.map((opt) => {
                const isSelected = selectedAnswers[q.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(q.id, opt.key)}
                    className={`w-full text-left p-3 rounded text-xs border transition-colors flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-[#0A192F] text-white border-[#0A192F]'
                        : 'bg-[#F8FAFC] text-[#0A192F] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      isSelected ? 'bg-[#FFDE59] text-[#0A192F]' : 'bg-white border border-[#E2E8F0] text-[#64748B]'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="leading-relaxed mt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isAllAnswered}
          className={`px-8 py-3 rounded font-semibold text-xs transition-colors flex items-center shadow-sm ${
            isAllAnswered
              ? 'bg-[#0A192F] hover:bg-[#112240] text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Calculate My Job Readiness Score <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
        </button>
      </div>

    </div>
  );
};
