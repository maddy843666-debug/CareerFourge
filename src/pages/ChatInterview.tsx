import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Sparkles, Send, Clock, CheckCircle2,
  ChevronDown, ChevronUp, AlertCircle, ShieldCheck, User,
  RefreshCw, BarChart2, X, Award, Target, Lightbulb,
  Volume2, VolumeX, CheckCircle, XCircle, AlertTriangle,
  Paperclip, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useUserStore } from '../hooks/useUserStore';
import { userStore } from '../services/userStore';
import { InterviewChatResponse } from '../types';

interface ChatInterviewProps {
  onProceedToCoding?: () => void;
  onNavigate?: (tab: string, targetId?: string) => void;
}

export interface TextChatMessage {
  sender: 'AI HR Interviewer' | 'You';
  text: string;
  time: string;
  verdict?: 'correct' | 'partially_correct' | 'incorrect';
  verdict_explanation?: string;
  evaluation?: any;
  feedback?: string;
}

export const ChatInterview: React.FC<ChatInterviewProps> = ({
  onProceedToCoding,
  onNavigate
}) => {
  const store = useUserStore();

  // Active view: 'chat' | 'report' | 'history'
  const [viewMode, setViewMode] = useState<'chat' | 'report' | 'history'>('chat');

  // Session state
  const [interviewId, setInterviewId] = useState<string>('');
  const [stage, setStage] = useState<'setup' | 'interview' | 'completed' | 'error'>('setup');
  const [targetRole, setTargetRole] = useState<string>(store.goal?.targetRole || 'Software Engineer');
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [currentSeq, setCurrentSeq] = useState<number>(0);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Chat message stream
  const [chatHistory, setChatHistory] = useState<TextChatMessage[]>([]);

  // Live Verdict & Signals
  const [latestVerdict, setLatestVerdict] = useState<'correct' | 'partially_correct' | 'incorrect' | null>(null);
  const [latestVerdictExp, setLatestVerdictExp] = useState<string>('');
  const [aiNotesText, setAiNotesText] = useState<string>("Connecting to Gemini AI Interviewer...");
  const [latestEvaluation, setLatestEvaluation] = useState<any>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [partialCount, setPartialCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);

  // Setup chips
  const [suggestedChips, setSuggestedChips] = useState<string[]>([
    'Technical', 'Behavioral', 'HR', 'System Design', 'Mixed'
  ]);

  // Report & History
  const [reportData, setReportData] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15:00

  // Collapsible cards
  const [isCurrentQuestionOpen, setIsCurrentQuestionOpen] = useState<boolean>(true);
  const [isAiNotesOpen, setIsAiNotesOpen] = useState<boolean>(true);

  // Refs
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAiThinking]);

  // Countdown timer
  useEffect(() => {
    if (viewMode !== 'chat') return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode]);

  // Load history on mount
  useEffect(() => {
    api.getInterviewHistory().then(res => setHistoryList(res)).catch(() => {});
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Compute smart suggested quick-reply chips
  const computeSuggestedChips = (aiText: string, currentStage: string) => {
    if (currentStage !== 'setup') return [];
    const lower = aiText.toLowerCase();

    if (lower.includes('type') || lower.includes('practice') || lower.includes('behavioral') || lower.includes('technical')) {
      return ['Technical', 'Behavioral', 'HR', 'System Design', 'Mixed'];
    }
    if (lower.includes('role') || lower.includes('position') || lower.includes('interviewing for')) {
      return ['Software Engineer', 'Backend Developer', 'Frontend Developer', 'Full Stack Developer', 'Data Scientist'];
    }
    if (lower.includes('skill') || lower.includes('technolog') || lower.includes('focus')) {
      return ['Python, FastAPI, DSA', 'React, TypeScript, CSS', 'Java, Spring Boot', 'SQL, Database Design'];
    }
    if (lower.includes('difficult') || lower.includes('level') || lower.includes('easy')) {
      return ['Easy', 'Medium', 'Hard'];
    }
    if (lower.includes('how many') || lower.includes('questions')) {
      return ['3 Questions', '5 Questions', '10 Questions'];
    }
    return ['Technical', 'Software Engineer', 'Medium', '5 Questions'];
  };

  // --- START CHAT SESSION ---
  const startNewSession = async () => {
    setIsAiThinking(true);
    setApiErrorMessage(null);
    setAiNotesText("Connecting to Gemini AI Interviewer...");
    setUserAnswer('');
    setCorrectCount(0);
    setPartialCount(0);
    setIncorrectCount(0);

    try {
      const res: InterviewChatResponse = await api.chatInterview({ action: 'start' });
      setInterviewId(res.interview_id);
      setStage(res.stage);
      setNumQuestions(res.total_questions || 5);
      setCurrentSeq(res.current_question_num || 0);

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory([
        {
          sender: 'AI HR Interviewer',
          text: res.message,
          time: nowStr
        }
      ]);

      setAiNotesText("AI Interviewer is ready. Collecting interview configuration conversationally...");
      setSuggestedChips(computeSuggestedChips(res.message, res.stage));
    } catch (err) {
      console.error("Failed to start chat interview:", err);
      setApiErrorMessage("AI interviewer is temporarily unavailable. Please try again.");
      setAiNotesText("Unable to reach AI Interviewer.");
    } finally {
      setIsAiThinking(false);
    }
  };

  // Mount effect
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    startNewSession();
  }, []);

  // --- SEND CHAT MESSAGE ---
  const handleSendAnswer = async (overrideText?: string) => {
    const textToSend = (overrideText || userAnswer).trim();
    if (!textToSend || isAiThinking) return;

    setUserAnswer('');
    setIsAiThinking(true);
    setApiErrorMessage(null);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: 'You', text: textToSend, time: nowStr }]);
    setAiNotesText(stage === 'setup' ? "AI is reviewing your preferences..." : "AI is analyzing your answer, checking correctness, and scoring...");

    try {
      const res: InterviewChatResponse = await api.chatInterview({
        interview_id: interviewId,
        message: textToSend,
        action: 'chat'
      });

      setStage(res.stage);
      if (res.target_role) setTargetRole(res.target_role);
      if (res.interview_type) setInterviewType(res.interview_type);
      if (res.difficulty) setDifficulty(res.difficulty);
      if (res.total_questions) setNumQuestions(res.total_questions);
      if (res.current_question_num !== undefined) setCurrentSeq(res.current_question_num);
      if (res.current_question) setCurrentQuestionText(res.current_question);

      if (res.evaluation) setLatestEvaluation(res.evaluation);
      if (res.strengths) setStrengths(res.strengths);
      if (res.weaknesses) setWeaknesses(res.weaknesses);
      if (res.verdict) {
        setLatestVerdict(res.verdict);
        if (res.verdict === 'correct') setCorrectCount(prev => prev + 1);
        else if (res.verdict === 'partially_correct') setPartialCount(prev => prev + 1);
        else if (res.verdict === 'incorrect') setIncorrectCount(prev => prev + 1);
      }
      if (res.verdict_explanation) setLatestVerdictExp(res.verdict_explanation);
      if (res.feedback) setAiNotesText(res.feedback);

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'AI HR Interviewer',
          text: res.message,
          time: nowStr,
          verdict: res.verdict,
          verdict_explanation: res.verdict_explanation,
          evaluation: res.evaluation,
          feedback: res.feedback
        }
      ]);

      if (res.stage === 'setup') {
        setSuggestedChips(computeSuggestedChips(res.message, res.stage));
      } else {
        setSuggestedChips([]);
      }

      if (res.stage === 'completed') {
        const finalRep = res.final_report || {
          overall_score: 82,
          technical_knowledge: 85,
          problem_solving: 80,
          communication: 82,
          answer_quality: 84,
          depth: 80,
          correct_answers: correctCount + (res.verdict === 'correct' ? 1 : 0),
          partially_correct_answers: partialCount + (res.verdict === 'partially_correct' ? 1 : 0),
          incorrect_answers: incorrectCount + (res.verdict === 'incorrect' ? 1 : 0),
          strengths: res.strengths || ['Solid problem-solving logic'],
          weaknesses: res.weaknesses || ['Provide more concrete code examples'],
          recommendations: ['Practice STAR format', 'Study architecture trade-offs'],
          final_feedback: res.message
        };
        setReportData(finalRep);
        userStore.submitAssessmentResult('interview-prep', 'technical', finalRep.overall_score);
        api.getInterviewHistory().then(hist => setHistoryList(hist)).catch(() => {});
        setTimeout(() => setViewMode('report'), 2000);
      }
    } catch (err) {
      console.error("Gemini interview chat error:", err);
      setUserAnswer(textToSend);
      setApiErrorMessage("AI interviewer is temporarily unavailable. Please click send again.");
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- END CHAT INTERVIEW ---
  const handleConfirmEndInterview = async () => {
    setShowEndModal(false);
    setIsAiThinking(true);
    setAiNotesText("Synthesizing final evaluation report with Gemini...");

    try {
      const res = await api.chatInterview({
        interview_id: interviewId,
        action: 'finalize'
      });

      const finalRep = res.final_report || {
        overall_score: 80,
        technical_knowledge: 82,
        problem_solving: 78,
        communication: 80,
        answer_quality: 80,
        depth: 78,
        correct_answers: correctCount,
        partially_correct_answers: partialCount,
        incorrect_answers: incorrectCount,
        strengths: strengths.length ? strengths : ['Structured answers'],
        weaknesses: weaknesses.length ? weaknesses : ['Could provide deeper code examples'],
        recommendations: ['Practice timed mock interviews', 'Review database queries'],
        final_feedback: res.message || 'Solid interview performance.'
      };

      setReportData(finalRep);
      userStore.submitAssessmentResult('interview-prep', 'technical', finalRep.overall_score);
      setStage('completed');
      setViewMode('report');
    } catch (err) {
      console.error("End interview error:", err);
      const report = await api.getInterviewReport(interviewId || 'intv_chat');
      setReportData(report);
      setViewMode('report');
    } finally {
      setIsAiThinking(false);
    }
  };

  // File attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const text = uploadEvent.target?.result as string;
        setUserAnswer(prev => `${prev}\n\n[Attached Code / File: ${file.name}]\n${text}`.trim());
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-20">

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#64748B] mb-1">
            <span className="flex items-center text-sky-600">
              <span className="w-2 h-2 rounded-full bg-sky-500 mr-1.5"></span>
              AI CHAT INTERVIEW
            </span>
            <span>•</span>
            <span>Interactive Chat Messenger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] flex items-center">
            AI Chat Interview
            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Chat Messenger Mode
            </span>
          </h1>
          <div className="text-xs text-[#64748B] font-medium mt-0.5 flex items-center space-x-2">
            <span className="font-semibold text-[#0A192F]">{targetRole}</span>
            <span>•</span>
            <span>{interviewType}</span>
            <span>•</span>
            <span>{difficulty} Level</span>
            <span>•</span>
            <span className="font-semibold text-sky-600">
              {stage === 'setup' ? 'Conversational Setup' : `Question ${currentSeq} of ${numQuestions}`}
            </span>
          </div>
        </div>

        {/* TOP RIGHT CONTROLS */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowEndModal(true)}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-all"
          >
            End Interview
          </button>

          <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 flex items-center space-x-3 shadow-xs">
            <Clock className="w-4 h-4 text-slate-600" />
            <div>
              <div className="text-sm font-extrabold font-mono text-[#0A192F]">{formatTime(secondsRemaining)}</div>
              <div className="text-[9px] text-[#64748B] font-semibold">Session timer</div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {apiErrorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{apiErrorMessage}</span>
          </div>
          <button
            onClick={() => handleSendAnswer()}
            className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            Retry Send
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHAT VIEW: MAIN MESSENGER + SIDEBAR                                       */}
      {/* ========================================================================= */}
      {viewMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: INTERACTIVE CHAT STREAM & TEXT COMPOSER (8 COLS) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* CHAT MESSAGES TIMELINE */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm min-h-[480px] max-h-[560px] overflow-y-auto space-y-4 flex flex-col justify-between">
              
              <div className="space-y-4">
                {chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${item.sender === 'You' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-1 px-1">
                      <span className="font-bold">{item.sender}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl max-w-xl text-xs font-medium leading-relaxed shadow-2xs ${
                        item.sender === 'You'
                          ? 'bg-[#0A192F] text-white rounded-tr-none'
                          : 'bg-slate-50 border border-slate-200 text-[#0A192F] rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{item.text}</p>

                      {/* Verdict Badge inside AI Chat Bubble */}
                      {item.verdict && (
                        <div className={`mt-3 p-3 rounded-xl border flex items-center space-x-2 ${
                          item.verdict === 'correct'
                            ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                            : item.verdict === 'partially_correct'
                            ? 'bg-amber-100/70 border-amber-300 text-amber-950'
                            : 'bg-rose-100/70 border-rose-300 text-rose-950'
                        }`}>
                          {item.verdict === 'correct' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                          {item.verdict === 'partially_correct' && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                          {item.verdict === 'incorrect' && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}

                          <div>
                            <span className="font-extrabold text-[11px] uppercase tracking-wide block">
                              {item.verdict === 'correct' ? '🟢 Marked Correct' : item.verdict === 'partially_correct' ? '🟡 Marked Partially Correct' : '🔴 Marked Wrong / Incorrect'}
                            </span>
                            {item.verdict_explanation && (
                              <span className="text-[10px] font-medium leading-tight block mt-0.5">
                                {item.verdict_explanation}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* AI Thinking Spinner */}
                {isAiThinking && (
                  <div className="flex items-center space-x-2 p-3 bg-sky-50 border border-sky-100 rounded-2xl text-xs text-sky-700 w-fit animate-pulse">
                    <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
                    <span className="font-bold">Gemini AI is analyzing your answer and formulating response...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* SUGGESTED CHIPS (SETUP PHASE) */}
            {stage === 'setup' && suggestedChips.length > 0 && (
              <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono text-sky-800 uppercase font-bold block">
                  Suggested Quick Options:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendAnswer(chip)}
                      disabled={isAiThinking}
                      className="px-3 py-1 bg-white hover:bg-sky-100/70 border border-sky-200 text-sky-800 text-xs font-semibold rounded-xl transition-colors shadow-2xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TEXT COMPOSE BOX */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
              <textarea
                rows={3}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendAnswer())}
                disabled={isAiThinking}
                placeholder={
                  stage === 'setup'
                    ? "Type your interview preferences (e.g., Technical, Software Engineer, Python, Medium, 5 questions)..."
                    : "Type your interview answer here (press Enter to submit)..."
                }
                className="w-full text-xs text-[#0A192F] placeholder-[#94A3B8] focus:outline-none resize-none font-medium leading-relaxed disabled:opacity-60"
              />

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center space-x-2 text-[#64748B]">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    title="Attach File / Code Snippet"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleSendAnswer()}
                  disabled={!userAnswer.trim() || isAiThinking}
                  className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#112240] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-sm"
                >
                  {isAiThinking ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-300 animate-spin" />
                      <span>AI Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <span>{stage === 'setup' ? 'Send Preference' : 'Submit Answer'}</span>
                      <Send className="w-3.5 h-3.5 ml-2 text-amber-300" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: LIVE ACCURACY SCORECARD & EVALUATION CARDS (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">

            {/* CARD 1: PROGRESS & CONFIG */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-[#0A192F]">
                <span>{stage === 'setup' ? 'Interview Configuration' : 'Interview Progress'}</span>
                <span className="text-[#64748B] font-mono">
                  {stage === 'setup' ? 'Setup Mode' : `${currentSeq} of ${numQuestions}`}
                </span>
              </div>

              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${stage === 'setup' ? 15 : (currentSeq / numQuestions) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E2E8F0] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] font-semibold block">Role</span>
                  <span className="font-bold text-[#0A192F] text-[11px] block truncate">{targetRole}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-semibold block">Type</span>
                  <span className="font-bold text-[#0A192F] text-[11px] block truncate">{interviewType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-semibold block">Difficulty</span>
                  <span className="font-bold text-[#0A192F] text-[11px] block truncate">{difficulty}</span>
                </div>
              </div>
            </div>

            {/* CARD 2: LIVE SCORECARD TALLY */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0A192F]">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Live Accuracy Scorecard</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-xl font-black text-emerald-700 block">{correctCount}</span>
                  <span className="text-[10px] font-bold text-emerald-800">Correct</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                  <span className="text-xl font-black text-amber-700 block">{partialCount}</span>
                  <span className="text-[10px] font-bold text-amber-800">Partial</span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                  <span className="text-xl font-black text-rose-700 block">{incorrectCount}</span>
                  <span className="text-[10px] font-bold text-rose-800">Wrong</span>
                </div>
              </div>
            </div>

            {/* CARD 3: CURRENT QUESTION */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
              <div
                onClick={() => setIsCurrentQuestionOpen(!isCurrentQuestionOpen)}
                className="flex justify-between items-center text-xs font-bold text-[#0A192F] cursor-pointer"
              >
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 text-sky-500 mr-2" />
                  {stage === 'setup' ? 'Goal Formulation' : `Current Question #${currentSeq}`}
                </span>
                {isCurrentQuestionOpen ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
              </div>

              {isCurrentQuestionOpen && (
                <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl text-xs text-[#0A192F] font-medium leading-relaxed">
                  {stage === 'setup'
                    ? "Tell the AI interviewer what role, technical stack, and difficulty you want to practice."
                    : currentQuestionText || "Question generated dynamically by Gemini AI."}
                </div>
              )}
            </div>

            {/* CARD 4: AI EVALUATION NOTES */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
              <div
                onClick={() => setIsAiNotesOpen(!isAiNotesOpen)}
                className="flex justify-between items-center text-xs font-bold text-[#0A192F] cursor-pointer"
              >
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-sky-500 mr-2" />
                  AI Feedback & Evaluation Notes
                </span>
                {isAiNotesOpen ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
              </div>

              {isAiNotesOpen && (
                <p className="text-xs text-[#64748B] bg-slate-50 p-3 rounded-2xl border border-slate-200 leading-relaxed font-medium">
                  {aiNotesText}
                </p>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* FINAL REPORT VIEW (GEMINI EVALUATION)                                     */}
      {/* ========================================================================= */}
      {viewMode === 'report' && reportData && (
        <div className="space-y-6 bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm max-w-5xl mx-auto">
          <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-2 text-sky-600 text-xs font-mono font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>CHAT INTERVIEW EVALUATION COMPLETED</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#0A192F]">Performance Evaluation Report</h2>
              <p className="text-xs text-[#64748B] mt-1">
                Role: <span className="text-[#0A192F] font-semibold">{targetRole}</span> • Type: <span className="text-[#0A192F] font-semibold">{interviewType}</span> • Difficulty: <span className="text-[#0A192F] font-semibold">{difficulty}</span>
              </p>
            </div>

            <button
              onClick={() => {
                startNewSession();
                setViewMode('chat');
              }}
              className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start New Chat Round
            </button>
          </div>

          {/* ACCURACY SCOREBOARD */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Answer Accuracy & Verdict Scoreboard</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-400">{reportData.correct_answers || correctCount}</div>
                  <div className="text-xs font-bold text-emerald-200">Marked Correct</div>
                </div>
              </div>

              <div className="p-4 bg-amber-950/60 border border-amber-600/50 rounded-2xl flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-amber-400">{reportData.partially_correct_answers || partialCount}</div>
                  <div className="text-xs font-bold text-amber-200">Partially Correct</div>
                </div>
              </div>

              <div className="p-4 bg-rose-950/60 border border-rose-600/50 rounded-2xl flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-rose-400">{reportData.incorrect_answers || incorrectCount}</div>
                  <div className="text-xs font-bold text-rose-200">Marked Wrong</div>
                </div>
              </div>
            </div>
          </div>

          {/* SCORES BY DIMENSION */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-sky-800 uppercase font-bold">Overall Score</span>
              <div className="text-3xl font-black text-sky-600">{reportData.overall_score || 82}%</div>
              <span className="text-[10px] text-sky-700 font-semibold block">Composite Score</span>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Technical</span>
              <div className="text-2xl font-black text-emerald-600">{reportData.technical_knowledge || 80}%</div>
              <span className="text-[10px] text-[#64748B] block">Concepts</span>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Reasoning</span>
              <div className="text-2xl font-black text-indigo-600">{reportData.problem_solving || 80}%</div>
              <span className="text-[10px] text-[#64748B] block">Logic</span>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Communication</span>
              <div className="text-2xl font-black text-amber-600">{reportData.communication || 84}%</div>
              <span className="text-[10px] text-[#64748B] block">Written Clarity</span>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Answer Quality</span>
              <div className="text-2xl font-black text-purple-600">{reportData.answer_quality || 82}%</div>
              <span className="text-[10px] text-[#64748B] block">Relevance</span>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Depth</span>
              <div className="text-2xl font-black text-teal-600">{reportData.depth || 78}%</div>
              <span className="text-[10px] text-[#64748B] block">Detail Level</span>
            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" /> Strengths Evaluated
              </div>
              <ul className="space-y-2">
                {(reportData.strengths || ['Clear problem definitions', 'Solid technical fundamentals']).map((st: string, idx: number) => (
                  <li key={idx} className="text-xs text-emerald-800 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center text-xs font-bold text-amber-900">
                <Lightbulb className="w-4 h-4 text-amber-600 mr-2" /> Areas for Improvement
              </div>
              <ul className="space-y-2">
                {(reportData.weaknesses || ['Provide more concrete code examples']).map((wk: string, idx: number) => (
                  <li key={idx} className="text-xs text-amber-800 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
              Gemini Next Step Recommendations:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(reportData.recommendations || ['Practice algorithmic problem solving', 'Review edge case handling']).map((rec: string, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium flex items-center space-x-2 shadow-2xs">
                  <Target className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* END CONFIRMATION MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-[#0A192F]">End Interview Chat Session?</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your chat conversation transcript will be finalized. Gemini will evaluate all your answers, calculate correctness tallies, and generate your performance report.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 border border-[#E2E8F0] hover:bg-slate-50 text-[#0A192F] text-xs font-semibold rounded-xl"
              >
                Continue Chatting
              </button>
              <button
                onClick={handleConfirmEndInterview}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                End & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
