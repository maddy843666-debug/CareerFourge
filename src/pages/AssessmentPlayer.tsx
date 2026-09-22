import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Award, Sparkles, HelpCircle } from 'lucide-react';
import { userStore } from '../services/userStore';

interface AssessmentPlayerProps {
  assessmentId: string;
  onComplete: () => void;
}

interface AssessmentDef {
  title: string;
  category: 'dsa' | 'technical' | 'systemDesign' | 'interview';
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIdx: number;
  }>;
}

const ASSESSMENTS_MAP: Record<string, AssessmentDef> = {
  'binary-search': {
    title: 'Binary Search Variations & Complexity Assessment',
    category: 'dsa',
    questions: [
      {
        id: 'bs1',
        question: 'When searching in a rotated sorted array without duplicates, how do you determine which half is sorted?',
        options: [
          'Compare arr[left] with arr[mid]; if arr[left] <= arr[mid], left half is sorted',
          'Compare arr[left] with arr[right]; if equal, array is reverse sorted',
          'Randomly select a pivot point',
          'Sort the array again in linear time O(N)'
        ],
        correctIdx: 0
      },
      {
        id: 'bs2',
        question: 'What is the upper bound time complexity when finding lower_bound in an array of N sorted elements?',
        options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
        correctIdx: 1
      },
      {
        id: 'bs3',
        question: 'To avoid integer overflow when computing the mid index in binary search, which expression is safest?',
        options: [
          'mid = (left + right) / 2',
          'mid = left + (right - left) / 2',
          'mid = left * right / 2',
          'mid = right - left / 2'
        ],
        correctIdx: 1
      }
    ]
  },
  'system-design': {
    title: 'Distributed Caching & Database Sharding Assessment',
    category: 'systemDesign',
    questions: [
      {
        id: 'sys1',
        question: 'In a high-throughput microservices architecture, what is the primary benefit of LRU Redis caching?',
        options: [
          'Reduces database load and sub-millisecond read latency for frequent queries',
          'Replaces relational database transactions entirely',
          'Ensures ACID compliance across multiple regions',
          'Eliminates the need for API authentication'
        ],
        correctIdx: 0
      },
      {
        id: 'sys2',
        question: 'Which sharding key strategy prevents write hotspots when partitioning customer data?',
        options: [
          'Sequential Auto-Increment ID',
          'Consistent Hashing based on Customer UUID hash',
          'Alphabetical sorting by Customer First Name',
          'Partitioning by Timestamp hour of registration'
        ],
        correctIdx: 1
      }
    ]
  },
  'interview-prep': {
    title: 'Mock Behavioral & Technical Interview Assessment',
    category: 'interview',
    questions: [
      {
        id: 'int1',
        question: 'When asked to explain a difficult technical trade-off you made in a past project, what is essential to highlight?',
        options: [
          'The alternatives considered, quantifiable metrics, and reason for choosing the final approach',
          'Claiming there were no trade-offs and your first solution was flawless',
          'Focusing only on the negative outcomes of alternative solutions',
          'Using complex jargon without explaining the underlying business impact'
        ],
        correctIdx: 0
      }
    ]
  }
};

export const AssessmentPlayer: React.FC<AssessmentPlayerProps> = ({ assessmentId, onComplete }) => {
  const assessment = ASSESSMENTS_MAP[assessmentId] || ASSESSMENTS_MAP['binary-search'];
  
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [earnedScore, setEarnedScore] = useState(0);

  const handleSelect = (qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const isAllAnswered = assessment.questions.every(q => selectedAnswers[q.id] !== undefined);

  const handleSubmit = () => {
    let correctCount = 0;
    assessment.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIdx) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);
    setEarnedScore(score);
    setIsSubmitted(true);

    // Save to store and trigger reactive recalculations across candidate profile!
    userStore.submitAssessmentResult(assessmentId, assessment.category, score);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-[#0A192F]">
      
      {/* HEADER */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-[#0A192F] text-[#FFDE59] font-mono text-[10px] font-bold uppercase">
            {assessment.category.toUpperCase()} ASSESSMENT
          </span>
          <span className="text-xs text-[#64748B] font-mono">{assessment.questions.length} Questions</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#0A192F]">
          {assessment.title}
        </h1>
        <p className="text-xs text-[#64748B]">
          Complete this evaluation to verify your proficiency and update your composite Job Readiness Score.
        </p>
      </div>

      {/* RESULT BANNER IF SUBMITTED */}
      {isSubmitted && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-6 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-emerald-900">Assessment Completed! Score: {earnedScore}%</h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your category score for <strong className="uppercase">{assessment.category}</strong> has been updated. Your Job Readiness Score has reactively increased!
              </p>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center shadow-sm"
          >
            Return to Dashboard & See Updated Readiness <ArrowRight className="w-3.5 h-3.5 ml-2 text-[#FFDE59]" />
          </button>
        </div>
      )}

      {/* QUESTIONS */}
      <div className="space-y-6">
        {assessment.questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 text-xs font-mono">
              <span className="font-bold text-[#427AB5]">Question {idx + 1} of {assessment.questions.length}</span>
            </div>

            <p className="text-sm font-bold text-[#0A192F] leading-snug">
              {q.question}
            </p>

            <div className="space-y-2 pt-1">
              {q.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[q.id] === optIdx;
                const isCorrect = isSubmitted && optIdx === q.correctIdx;
                const isWrong = isSubmitted && isSelected && optIdx !== q.correctIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(q.id, optIdx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-3 rounded text-xs border transition-colors flex items-start space-x-3 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-500 font-bold'
                        : isWrong
                        ? 'bg-red-100 text-red-900 border-red-400'
                        : isSelected
                        ? 'bg-[#0A192F] text-white border-[#0A192F]'
                        : 'bg-[#F8FAFC] text-[#0A192F] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      isSelected ? 'bg-[#FFDE59] text-[#0A192F]' : 'bg-white border border-[#E2E8F0] text-[#64748B]'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed mt-0.5">{opt}</span>
                  </button>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* SUBMIT BUTTON */}
      {!isSubmitted && (
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
            Submit Assessment & Update Readiness Score <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
          </button>
        </div>
      )}

    </div>
  );
};
