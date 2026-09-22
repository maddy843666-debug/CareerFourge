import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Sparkles, Send, Clock, CheckCircle2,
  ChevronDown, ChevronUp, AlertCircle, ShieldCheck, User,
  RefreshCw, BarChart2, X, Award, Target, Lightbulb,
  Volume2, VolumeX, CheckCircle, XCircle, AlertTriangle,
  Paperclip, ArrowRight, Layers, FileText, Check, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useUserStore } from '../hooks/useUserStore';
import { userStore } from '../services/userStore';
import { InterviewChatResponse } from '../types';
import { COURSE_TRACKS, CourseTrack } from './VoiceInterview';

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

export interface ChatAnswerReview {
  question_num: number;
  question: string;
  answer: string;
  verdict: 'correct' | 'partially_correct' | 'incorrect';
  verdict_explanation: string;
  feedback: string;
  strengths?: string[];
  weaknesses?: string[];
}

export const ChatInterview: React.FC<ChatInterviewProps> = ({
  onProceedToCoding,
  onNavigate
}) => {
  const store = useUserStore();

  // Active view: 'chat' | 'report' | 'history'
  const [viewMode, setViewMode] = useState<'chat' | 'report' | 'history'>('chat');

  // Course Track state
  const [selectedTrack, setSelectedTrack] = useState<CourseTrack>(COURSE_TRACKS[1]); // Default Python Backend
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);

  // Session state
  const [interviewId, setInterviewId] = useState<string>('');
  const [stage, setStage] = useState<'setup' | 'interview' | 'completed' | 'error'>('setup');
  const [targetRole, setTargetRole] = useState<string>(selectedTrack.role);
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [currentSeq, setCurrentSeq] = useState<number>(0);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Chat message stream
  const [chatHistory, setChatHistory] = useState<TextChatMessage[]>([
    {
      sender: 'AI HR Interviewer',
      text: "Hello and welcome! I'm Priya Sharma, your Senior AI Technical & HR Interviewer today. It's a pleasure to connect with you for this 1-on-1 interview session!\n\nWe can interview in any domain or technology you'd like. You can:\n• **Pick one of our recommended tracks** below, OR\n• **Text me any extra or custom domain** (e.g. *Embedded Systems*, *Rust*, *Computer Vision*, *Robotics*, *Cybersecurity*, *Game Development*, *Salesforce*, etc.), and I will find it and ask tailored 1-on-1 questions for you.\n\nWhich domain or tech stack would you like to interview for today?",
      time: 'Just now'
    }
  ]);

  // Detailed Answer Review records for the final report
  const [answerReviews, setAnswerReviews] = useState<ChatAnswerReview[]>([]);

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

  // Custom Extra Domain input state
  const [customDomainText, setCustomDomainText] = useState<string>('');
  const [customDomainModalInput, setCustomDomainModalInput] = useState<string>('');
  const [trackSearchFilter, setTrackSearchFilter] = useState<string>('');

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

  // --- START CHAT SESSION ---
  const startNewSession = async (customTrack?: CourseTrack, customDifficulty?: string, customDomainOverride?: string) => {
    const track = customTrack || selectedTrack;
    const diff = customDifficulty || difficulty;

    setIsAiThinking(true);
    setApiErrorMessage(null);
    setAiNotesText("Connecting to Senior AI Technical Interviewer (Priya Sharma)...");
    setUserAnswer('');
    setCorrectCount(0);
    setPartialCount(0);
    setIncorrectCount(0);
    setAnswerReviews([]);

    try {
      let res: InterviewChatResponse;
      if (customDomainOverride) {
        res = await api.chatInterview({
          action: 'start',
          custom_domain: customDomainOverride,
          course: customDomainOverride,
          difficulty: diff,
          interview_type: interviewType,
          num_questions: numQuestions
        });
      } else if (customTrack) {
        res = await api.chatInterview({
          action: 'start',
          course: track.title,
          target_role: track.role,
          skills: track.skills,
          difficulty: diff,
          interview_type: interviewType,
          num_questions: numQuestions
        });
      } else {
        res = await api.chatInterview({
          action: 'start',
          mode: 'conversational'
        });
      }

      setInterviewId(res.interview_id);
      setStage(res.stage);
      setNumQuestions(res.total_questions || numQuestions);
      setCurrentSeq(res.current_question_num || (res.stage === 'setup' ? 0 : 1));
      if (res.target_role) setTargetRole(res.target_role);
      if (res.current_question) setCurrentQuestionText(res.current_question);

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory([
        {
          sender: 'AI HR Interviewer',
          text: res.message,
          time: nowStr
        }
      ]);

      if (res.stage === 'setup') {
        setAiNotesText("Priya Sharma • Senior AI Interviewer is online. Awaiting your domain selection.");
      } else {
        setAiNotesText(`Priya Sharma ready for ${res.target_role || track.title} (${diff} level). Ready for Question 1.`);
      }
    } catch (err) {
      console.warn("Failed to start chat interview via API, using Priya Sharma local setup:", err);
      const fallbackId = `intv_${Date.now()}`;
      setInterviewId(fallbackId);
      setStage('setup');
      setCurrentSeq(0);
      setAiNotesText("Priya Sharma • Senior AI Interviewer is online. Awaiting your domain selection.");
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
  const handleSendAnswer = async (
    overrideText?: string,
    options?: { custom_domain?: string; is_hint?: boolean }
  ) => {
    const textToSend = (overrideText || userAnswer).trim();
    if (!textToSend || isAiThinking) return;

    const questionBeingAnswered = currentQuestionText;
    const seqBeingAnswered = currentSeq;

    setUserAnswer('');
    setIsAiThinking(true);
    setApiErrorMessage(null);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: 'You', text: textToSend, time: nowStr }]);
    setAiNotesText(stage === 'setup' ? "Priya is setting up your interview domain and opening Question 1..." : options?.is_hint ? "Priya is formulating a helpful hint without penalizing your score..." : "Priya is analyzing your answer, checking technical correctness, and scoring...");

    try {
      const res: InterviewChatResponse = await api.chatInterview({
        interview_id: interviewId,
        message: textToSend,
        action: 'chat',
        custom_domain: options?.custom_domain,
        is_hint: options?.is_hint
      });

      setStage(res.stage);
      if (res.target_role) {
        const newRole = res.target_role;
        setTargetRole(newRole);
        const matched = COURSE_TRACKS.find(t =>
          newRole.toLowerCase().includes(t.role.toLowerCase()) ||
          t.title.toLowerCase().includes(newRole.toLowerCase())
        );
        if (matched) setSelectedTrack(matched);
      }
      if (res.interview_type) setInterviewType(res.interview_type);
      if (res.difficulty) setDifficulty(res.difficulty);
      if (res.total_questions) setNumQuestions(res.total_questions);
      if (res.current_question_num !== undefined) setCurrentSeq(res.current_question_num);
      if (res.current_question) setCurrentQuestionText(res.current_question);

      if (res.evaluation) setLatestEvaluation(res.evaluation);
      if (res.strengths) setStrengths(res.strengths);
      if (res.weaknesses) setWeaknesses(res.weaknesses);

      if (res.is_clarification) {
        // Hint or clarification: Priya guides candidate without marking incorrect!
        setAiNotesText(res.message);
      } else if (res.verdict) {
        setLatestVerdict(res.verdict);
        if (res.verdict === 'correct') setCorrectCount(prev => prev + 1);
        else if (res.verdict === 'partially_correct') setPartialCount(prev => prev + 1);
        else if (res.verdict === 'incorrect') setIncorrectCount(prev => prev + 1);

        // Record detailed Q&A breakdown for the final report
        setAnswerReviews(prev => [
          ...prev,
          {
            question_num: seqBeingAnswered || prev.length + 1,
            question: questionBeingAnswered || `Question ${seqBeingAnswered}`,
            answer: textToSend,
            verdict: res.verdict!,
            verdict_explanation: res.verdict_explanation || '',
            feedback: res.feedback || '',
            strengths: res.strengths || [],
            weaknesses: res.weaknesses || []
          }
        ]);
      }
      if (res.verdict_explanation) setLatestVerdictExp(res.verdict_explanation);
      if (res.feedback && !res.is_clarification) setAiNotesText(res.feedback);

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'AI HR Interviewer',
          text: res.message,
          time: nowStr,
          verdict: res.is_clarification ? undefined : res.verdict,
          verdict_explanation: res.is_clarification ? undefined : res.verdict_explanation,
          evaluation: res.evaluation,
          feedback: res.feedback
        }
      ]);

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
      console.warn("Gemini interview chat error, providing conversational response:", err);
      const fallbackMsg = "Thank you for explaining your approach. In a high-throughput production environment, how do you handle state synchronization and prevent data race conditions in this architecture?";
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'AI HR Interviewer',
          text: fallbackMsg,
          time: nowStr,
        }
      ]);
      setAiNotesText("Priya Sharma • Senior AI Interviewer is reviewing your explanation.");
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

  // Switch Track Handler
  const handleSelectTrack = (track: CourseTrack) => {
    setSelectedTrack(track);
    setTargetRole(track.role);
    setShowTrackModal(false);
    if (stage === 'setup') {
      handleSendAnswer(track.title, { custom_domain: track.title });
    } else {
      startNewSession(track);
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
            <span className="flex items-center text-emerald-600 font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              1-ON-1 INTERACTIVE INTERVIEW
            </span>
            <span>•</span>
            <span className="text-slate-800 font-bold">Priya Sharma, Senior AI Interviewer</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] flex items-center">
            AI Chat Interview
            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-sky-600" />
              1-on-1 Priya Sharma
            </span>
          </h1>
          <div className="text-xs text-[#64748B] font-medium mt-1 flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-bold text-[#0A192F] bg-slate-100 px-2 py-0.5 rounded-md">
              {selectedTrack.title}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700">{targetRole}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">{difficulty} Level</span>
            <span>•</span>
            <span className="font-semibold text-sky-600">
              {stage === 'setup' ? 'Conversational Setup' : `Question ${currentSeq} of ${numQuestions}`}
            </span>
          </div>
        </div>

        {/* TOP RIGHT CONTROLS */}
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowTrackModal(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 transition-all flex items-center shadow-xs"
            title="Choose extra domain or custom tech role"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Extra / Custom Domain
          </button>

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

      {/* TRACK SELECTOR CHIPS CAROUSEL */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-sm flex items-center space-x-2 overflow-x-auto scrollbar-thin">
        <span className="text-xs font-bold text-[#64748B] flex items-center flex-shrink-0 mr-1">
          <Layers className="w-3.5 h-3.5 mr-1 text-sky-600" /> Course Tracks:
        </span>
        {COURSE_TRACKS.map(tr => {
          const isSelected = tr.id === selectedTrack.id;
          return (
            <button
              key={tr.id}
              onClick={() => handleSelectTrack(tr)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-[#0A192F] text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{tr.title}</span>
              {isSelected && <Check className="w-3 h-3 text-amber-300" />}
            </button>
          );
        })}
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

                      {/* Prominent Verdict Badge inside AI Chat Bubble */}
                      {item.verdict && (
                        <div className={`mt-3 p-3.5 rounded-2xl border flex items-start space-x-3 shadow-2xs ${
                          item.verdict === 'correct'
                            ? 'bg-emerald-100/90 border-emerald-300 text-emerald-950'
                            : item.verdict === 'partially_correct'
                            ? 'bg-amber-100/90 border-amber-300 text-amber-950'
                            : 'bg-rose-100/90 border-rose-300 text-rose-950'
                        }`}>
                          {item.verdict === 'correct' && <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />}
                          {item.verdict === 'partially_correct' && <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />}
                          {item.verdict === 'incorrect' && <XCircle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />}

                          <div className="space-y-0.5">
                            <span className="font-black text-xs uppercase tracking-wide block">
                              {item.verdict === 'correct' ? '🟢 Marked Correct' : item.verdict === 'partially_correct' ? '🟡 Marked Partially Correct' : '🔴 Marked Wrong / Incomplete'}
                            </span>
                            {item.verdict_explanation && (
                              <span className="text-[11px] font-semibold leading-relaxed block text-slate-800">
                                {item.verdict_explanation}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Domain Selector Quick Buttons when in Setup Stage */}
                {stage === 'setup' && (
                  <div className="p-4 bg-gradient-to-r from-sky-50 via-indigo-50/70 to-slate-50 border border-sky-200/90 rounded-2xl space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sky-950 text-xs font-extrabold">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        <span>Select or Text your interview domain to begin:</span>
                      </div>
                      <span className="text-[10px] text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">1-on-1 AI Chat</span>
                    </div>

                    {/* Custom Extra Domain Input Box */}
                    <div className="p-3 bg-white border border-sky-300 rounded-xl space-y-2 shadow-2xs">
                      <label className="text-[11px] font-extrabold text-slate-800 block">
                        ✨ Text your Custom / Extra Domain (AI will find & ask 1-on-1 questions for any domain):
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={customDomainText}
                          onChange={(e) => setCustomDomainText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customDomainText.trim() && !isAiThinking) {
                              const dom = customDomainText.trim();
                              handleSendAnswer(dom, { custom_domain: dom });
                              setCustomDomainText('');
                            }
                          }}
                          placeholder="e.g. Embedded Systems, Game Development, Cloud Security, Quantum Computing, Bioinformatics..."
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customDomainText.trim() && !isAiThinking) {
                              const dom = customDomainText.trim();
                              handleSendAnswer(dom, { custom_domain: dom });
                              setCustomDomainText('');
                            }
                          }}
                          disabled={!customDomainText.trim() || isAiThinking}
                          className="px-3.5 py-1.5 bg-[#0A192F] hover:bg-sky-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                        >
                          Start Custom Domain →
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-extrabold text-slate-700 block mb-1.5">
                        Or Pick Recommended Domain Tracks:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {COURSE_TRACKS.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedTrack(t);
                              handleSendAnswer(t.title, { custom_domain: t.title });
                            }}
                            disabled={isAiThinking}
                            className="text-left p-2.5 rounded-xl border border-sky-200 bg-white hover:bg-sky-100/70 hover:border-sky-400 transition-all shadow-2xs group"
                          >
                            <div className="font-extrabold text-xs text-slate-900 group-hover:text-sky-900 flex items-center justify-between">
                              <span>{t.title}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-sky-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{t.skills.slice(0, 3).join(', ')}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Thinking Spinner */}
                {isAiThinking && (
                  <div className="flex items-center space-x-2 p-3 bg-sky-50 border border-sky-100 rounded-2xl text-xs text-sky-700 w-fit animate-pulse">
                    <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
                    <span className="font-bold">AI Interviewer is preparing response...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* TEXT COMPOSE BOX */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
              {/* 1-on-1 Quick Action Helpers */}
              {stage === 'interview' && (
                <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 pb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1-on-1 Helpers:</span>
                  <button
                    type="button"
                    onClick={() => handleSendAnswer("Could you please give me a quick hint or direction for this question?", { is_hint: true })}
                    disabled={isAiThinking}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold transition-all flex items-center space-x-1 shadow-2xs"
                    title="Ask Priya for a hint without scoring penalty"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-600" />
                    <span>💡 Ask Hint (No Penalty)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendAnswer("Could you please clarify what specific constraints, edge cases, or trade-offs you'd like me to focus on?")}
                    disabled={isAiThinking}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 text-[11px] font-bold transition-all flex items-center space-x-1 shadow-2xs"
                    title="Ask Priya to clarify the question"
                  >
                    <HelpCircle className="w-3 h-3 text-sky-600" />
                    <span>❓ Clarify Question</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrackModal(true)}
                    disabled={isAiThinking}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-900 text-[11px] font-bold transition-all flex items-center space-x-1 shadow-2xs"
                    title="Switch track or enter custom extra domain"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>🔄 Switch / Extra Domain</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendAnswer("I'd like to skip this question and move on to the next one.")}
                    disabled={isAiThinking}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-bold transition-all flex items-center space-x-1 shadow-2xs"
                    title="Skip to next question"
                  >
                    <span>⏭️ Skip Question</span>
                  </button>
                </div>
              )}

              <textarea
                rows={3}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendAnswer())}
                disabled={isAiThinking}
                placeholder={
                  stage === 'setup'
                    ? "Type which domain or role you want to interview for (or click any card above)..."
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
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{stage === 'setup' ? 'Confirm Domain' : 'Submit Answer'}</span>
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
                <span>Interview Progress</span>
                <span className="text-[#64748B] font-mono">
                  {stage === 'setup' ? 'Domain Setup' : `${currentSeq} of ${numQuestions}`}
                </span>
              </div>

              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: stage === 'setup' ? '10%' : `${(currentSeq / numQuestions) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E2E8F0] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] font-semibold block">Track</span>
                  <span className="font-bold text-[#0A192F] text-[11px] block truncate">{stage === 'setup' ? 'Selecting...' : selectedTrack.title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-semibold block">Role</span>
                  <span className="font-bold text-[#0A192F] text-[11px] block truncate">{stage === 'setup' ? '1-on-1 HR' : targetRole}</span>
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
                  {stage === 'setup' ? 'Interview Domain Selection' : `Current Question #${currentSeq}`}
                </span>
                {isCurrentQuestionOpen ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
              </div>

              {isCurrentQuestionOpen && (
                <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl text-xs text-[#0A192F] font-medium leading-relaxed">
                  {stage === 'setup'
                    ? "Welcome to your live 1-on-1 interview with Priya Sharma! Select your desired domain from the chat options or type it below to begin."
                    : (currentQuestionText || "Question generated dynamically by AI Interviewer.")}
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
      {/* FINAL REPORT VIEW (GEMINI EVALUATION & QUESTION-BY-QUESTION BREAKDOWN)   */}
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
                Course: <span className="text-[#0A192F] font-semibold">{selectedTrack.title}</span> • Role: <span className="text-[#0A192F] font-semibold">{targetRole}</span> • Difficulty: <span className="text-[#0A192F] font-semibold">{difficulty}</span>
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

          {/* QUESTION-BY-QUESTION DETAILED REVIEW BREAKDOWN */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <FileText className="w-5 h-5 text-sky-600" />
              <h3 className="text-base font-bold text-[#0A192F]">
                Question-by-Question Detailed Review & Evaluation
              </h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Review your recorded answers alongside AI correctness verdicts, grading rationales, and key concepts to improve.
            </p>

            {answerReviews.length > 0 ? (
              <div className="space-y-4">
                {answerReviews.map((rev, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs font-mono font-bold text-sky-700">
                        QUESTION {rev.question_num} of {numQuestions}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center ${
                        rev.verdict === 'correct'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : rev.verdict === 'partially_correct'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {rev.verdict === 'correct' && <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />}
                        {rev.verdict === 'partially_correct' && <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />}
                        {rev.verdict === 'incorrect' && <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />}
                        {rev.verdict === 'correct' ? 'Correct' : rev.verdict === 'partially_correct' ? 'Partially Correct' : 'Wrong / Incomplete'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[#0A192F] leading-snug">
                      {rev.question}
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold block">
                        Your Answer:
                      </span>
                      <p className="text-slate-800 italic leading-relaxed whitespace-pre-line">
                        "{rev.answer}"
                      </p>
                    </div>

                    {rev.verdict_explanation && (
                      <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        rev.verdict === 'correct'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : rev.verdict === 'partially_correct'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}>
                        <div className="font-bold flex items-center space-x-1 mb-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Verdict Rationale:</span>
                        </div>
                        <p className="font-medium">{rev.verdict_explanation}</p>
                      </div>
                    )}

                    {rev.feedback && (
                      <div className="text-xs text-[#64748B] bg-sky-50/40 p-3 rounded-xl border border-sky-100 leading-relaxed font-medium">
                        <strong className="text-sky-900 block mb-0.5">Corrective Advice & Next Steps:</strong>
                        {rev.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                Detailed question breakdown will be compiled here once interview questions are completed.
              </div>
            )}
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

      {/* TRACK SWITCH MODAL */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-[#0A192F]">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="text-base font-bold">Select Course Track or Extra Domain</h3>
                  <p className="text-[11px] text-slate-500">1-on-1 Chat Interview with Senior AI Priya Sharma</p>
                </div>
              </div>
              <button
                onClick={() => setShowTrackModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom / Extra Domain Input Card */}
            <div className="p-4 bg-gradient-to-r from-sky-50 via-indigo-50/60 to-white border border-sky-200 rounded-2xl space-y-2 shadow-2xs">
              <label className="text-xs font-black text-sky-950 uppercase tracking-wide flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                ✨ Text Any Custom / Extra Domain:
              </label>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Type any engineering domain (e.g. <i>"Embedded Firmware & FreeRTOS"</i>, <i>"Shopify Liquid"</i>, <i>"Quantum Computing"</i>, <i>"Cybersecurity Threat Hunting"</i>). The AI dynamically identifies the role and asks dedicated 1-on-1 questions.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={customDomainModalInput}
                  onChange={(e) => setCustomDomainModalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customDomainModalInput.trim() && !isAiThinking) {
                      const domain = customDomainModalInput.trim();
                      setCustomDomainModalInput('');
                      setShowTrackModal(false);
                      if (stage === 'setup') {
                        handleSendAnswer(domain, { custom_domain: domain });
                      } else {
                        startNewSession(undefined, undefined, domain);
                      }
                    }
                  }}
                  placeholder="e.g. Embedded Systems, ROS2 Robotics, Salesforce, Unreal Engine 5..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customDomainModalInput.trim() && !isAiThinking) {
                      const domain = customDomainModalInput.trim();
                      setCustomDomainModalInput('');
                      setShowTrackModal(false);
                      if (stage === 'setup') {
                        handleSendAnswer(domain, { custom_domain: domain });
                      } else {
                        startNewSession(undefined, undefined, domain);
                      }
                    }
                  }}
                  disabled={!customDomainModalInput.trim() || isAiThinking}
                  className="px-4 py-2 bg-[#0A192F] hover:bg-sky-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex-shrink-0"
                >
                  Start Custom Domain →
                </button>
              </div>
            </div>

            {/* Catalog Filter & Tracks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Or Pick From {COURSE_TRACKS.length} Built-in Tracks:
                </span>
                <input
                  type="text"
                  value={trackSearchFilter}
                  onChange={(e) => setTrackSearchFilter(e.target.value)}
                  placeholder="Filter tracks..."
                  className="bg-slate-50 border border-slate-200 text-[11px] text-slate-800 placeholder-slate-400 rounded-lg px-2.5 py-1 focus:outline-none focus:border-sky-500 w-44"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {COURSE_TRACKS
                  .filter(tr => !trackSearchFilter.trim() || tr.title.toLowerCase().includes(trackSearchFilter.toLowerCase()) || tr.skills.some(s => s.toLowerCase().includes(trackSearchFilter.toLowerCase())))
                  .map(tr => (
                    <div
                      key={tr.id}
                      onClick={() => handleSelectTrack(tr)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        selectedTrack.id === tr.id
                          ? 'bg-sky-50/90 border-sky-400 shadow-2xs'
                          : 'hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#0A192F]">{tr.title}</span>
                        {selectedTrack.id === tr.id && (
                          <Check className="w-4 h-4 text-sky-600" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {tr.skills.join(', ')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowTrackModal(false)}
                className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
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
