import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, RotateCcw,
  Sparkles, Award, BookOpen, ChevronRight, BarChart2, ShieldCheck
} from 'lucide-react';
import { userStore } from '../services/userStore';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const APTITUDE_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Quantitative Aptitude',
    question: 'A train 150 meters long is running at a speed of 54 km/hr. How long will it take to cross a platform 210 meters long?',
    options: ['18 seconds', '24 seconds', '20 seconds', '15 seconds'],
    correctAnswer: 1, // '24 seconds'
    explanation: 'Total distance to cover = 150m + 210m = 360m. Speed in m/s = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 360 / 15 = 24 seconds.'
  },
  {
    id: 2,
    category: 'Quantitative Aptitude',
    question: 'If 12 men or 18 women can construct a wall in 14 days, then in how many days can 8 men and 16 women construct the same wall?',
    options: ['9 days', '10 days', '12 days', '8 days'],
    correctAnswer: 0, // '9 days'
    explanation: 'Work of 12 men = Work of 18 women => 1 man = 1.5 women. 8 men + 16 women = 8*(1.5) + 16 = 28 women. Required time = (18 * 14) / 28 = 9 days.'
  },
  {
    id: 3,
    category: 'Logical Reasoning',
    question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
    correctAnswer: 1, // '(1/8)'
    explanation: 'This is a geometric division series where each number is halved (divided by 2) to get the next number: 1/4 / 2 = 1/8.'
  },
  {
    id: 4,
    category: 'Logical Reasoning',
    question: 'Statements: All mangoes are golden. No golden thing is cheap. Conclusions: I. All mangoes are cheap. II. No mango is cheap.',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Either I or II follows', 'Neither I nor II follows'],
    correctAnswer: 1, // 'Only conclusion II follows'
    explanation: 'Since all mangoes are golden and no golden thing is cheap, it directly implies that no mango can be cheap. Thus, Conclusion II follows.'
  },
  {
    id: 5,
    category: 'Core CS & Data Interpretation',
    question: 'What is the worst-case time complexity of QuickSort when selecting the first element as the pivot?',
    options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(log N)'],
    correctAnswer: 1, // 'O(N^2)'
    explanation: 'In the worst case (e.g. when the input array is already sorted or reverse sorted), picking the first element as pivot partitions the array into size 0 and N-1, leading to O(N^2) time complexity.'
  }
];

export const AptitudeWorkspace: React.FC<{ onNavigateToCoding?: () => void }> = ({ onNavigateToCoding }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 mins

  // Filter questions
  const questions = selectedCategory === 'All'
    ? APTITUDE_QUESTIONS
    : APTITUDE_QUESTIONS.filter(q => q.category === selectedCategory);

  const currentQ = questions[currentIdx] || questions[0];

  useEffect(() => {
    if (showResults) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults]);

  const handleSelectOption = (optIdx: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleFinishAssessment = () => {
    setShowResults(true);
    let correct = 0;
    APTITUDE_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });
    const scorePct = Math.round((correct / APTITUDE_QUESTIONS.length) * 100);
    userStore.submitAssessmentResult('aptitude-assessment', 'technical', scorePct);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getScoreSummary = () => {
    let correct = 0;
    APTITUDE_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });
    return {
      correct,
      total: APTITUDE_QUESTIONS.length,
      pct: Math.round((correct / APTITUDE_QUESTIONS.length) * 100)
    };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0A192F]">

      {/* HEADER BAR */}
      <div className="px-8 py-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold tracking-wider block">CAREERFORGE PRACTICE</span>
          <h1 className="text-xl font-extrabold text-[#0A192F] mt-0.5">Aptitude & Technical Reasoning</h1>
        </div>

        {/* TIMER & FINISH BUTTON */}
        <div className="flex items-center space-x-4">
          <div className="bg-slate-50 border border-[#E2E8F0] px-4 py-2 rounded-xl flex items-center space-x-2 font-mono text-xs text-[#0A192F]">
            <Clock className="w-4 h-4 text-sky-600" />
            <span className="font-bold">{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleFinishAssessment}
            className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Submit Assessment
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">

        {/* CATEGORY SELECTOR TABS */}
        <div className="flex items-center space-x-2 bg-white p-1.5 border border-[#E2E8F0] rounded-xl text-xs font-semibold max-w-fit shadow-sm">
          {['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Core CS & Data Interpretation'].map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentIdx(0); }}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === cat ? 'bg-[#0A192F] text-white font-bold shadow-sm' : 'text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ASSESSMENT MAIN GRID */}
        {!showResults ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT QUESTION CARD (8 COLS) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4">
                <span className="px-3 py-1 bg-sky-50 text-sky-700 font-mono font-bold text-xs rounded-full">
                  {currentQ.category}
                </span>
                <span className="text-xs text-[#64748B] font-mono font-semibold">
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>

              {/* QUESTION TEXT */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#0A192F] leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* OPTIONS LIST */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                          : 'bg-white text-[#0A192F] border-[#E2E8F0] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          isSelected ? 'bg-white text-[#0A192F]' : 'bg-slate-100 text-[#64748B]'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FFDE59]" />}
                    </button>
                  );
                })}
              </div>

              {/* EXPLANATION PREVIEW IF ANSWERED */}
              {userAnswers[currentQ.id] !== undefined && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-sans">
                  <div className="font-bold text-[#0A192F] flex items-center">
                    <BookOpen className="w-4 h-4 mr-1.5 text-sky-600" /> Explanation Rationale:
                  </div>
                  <p className="text-[#475569] leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* FOOTER NAV BUTTONS */}
              <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 border border-[#E2E8F0] disabled:opacity-40 rounded-xl text-xs font-semibold text-[#0A192F]"
                >
                  Previous Question
                </button>

                <button
                  onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIdx === questions.length - 1}
                  className="px-6 py-2 bg-[#0A192F] hover:bg-[#112240] disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* RIGHT QUESTION NAVIGATOR GRID (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider font-mono">
                  Question Palette ({questions.length})
                </h3>

                <div className="grid grid-cols-5 gap-2.5">
                  {questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentIdx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-10 rounded-xl font-mono text-xs font-bold transition-all border ${
                          isCurrent
                            ? 'ring-2 ring-sky-500 bg-[#0A192F] text-white border-[#0A192F]'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-slate-50 text-[#64748B] border-[#E2E8F0] hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] space-y-2 text-[11px] text-[#64748B] font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></span>
                    <span>Answered Question</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-slate-50 border border-[#E2E8F0]"></span>
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* RESULTS VIEW */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2 border-b border-[#E2E8F0] pb-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0A192F]">Aptitude Assessment Summary</h2>
              <p className="text-xs text-[#64748B]">Results saved to Skill Truth Engine & Candidate Profile.</p>
            </div>

            {(() => {
              const summary = getScoreSummary();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">Accuracy Score</span>
                      <span className="text-3xl font-black text-sky-600 mt-1 block">{summary.pct}%</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">Correct Answers</span>
                      <span className="text-3xl font-black text-emerald-600 mt-1 block">{summary.correct} / {summary.total}</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase block font-bold">Readiness Impact</span>
                      <span className="text-3xl font-black text-purple-600 mt-1 block">+12%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => { setShowResults(false); setUserAnswers({}); setCurrentIdx(0); }}
                      className="px-6 py-2.5 border border-[#E2E8F0] text-[#0A192F] font-semibold text-xs rounded-xl"
                    >
                      Retake Quiz
                    </button>

                    {onNavigateToCoding && (
                      <button
                        onClick={onNavigateToCoding}
                        className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-bold text-xs rounded-xl flex items-center"
                      >
                        <span>Proceed to Coding Assessment</span>
                        <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
};
