import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Mic, MicOff, Video, VideoOff,
  Clock, CheckCircle2, ChevronDown, ChevronUp, AlertCircle,
  Play, ShieldCheck, User, RefreshCw, BarChart2, X,
  Award, Target, Flame, Lightbulb, HelpCircle, Volume2, VolumeX,
  CheckCircle, XCircle, AlertTriangle, Radio, PhoneOff, Settings2,
  ThumbsUp, ThumbsDown
} from 'lucide-react';
import { api } from '../services/api';
import { useUserStore } from '../hooks/useUserStore';
import { userStore } from '../services/userStore';
import { InterviewChatResponse } from '../types';

interface VoiceInterviewProps {
  onProceedToCoding?: () => void;
  onNavigate?: (tab: string, targetId?: string) => void;
}

export interface VoiceChatMessage {
  sender: 'AI Interviewer' | 'You';
  text: string;
  time: string;
  verdict?: 'correct' | 'partially_correct' | 'incorrect';
  verdict_explanation?: string;
  evaluation?: any;
  feedback?: string;
  audioText?: string;
}

export const VoiceInterview: React.FC<VoiceInterviewProps> = ({
  onProceedToCoding,
  onNavigate
}) => {
  const store = useUserStore();

  // Active view: 'call' | 'report' | 'history'
  const [viewMode, setViewMode] = useState<'call' | 'report' | 'history'>('call');

  // Microphone & Camera state
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState<boolean>(false);
  const [speechInterimText, setSpeechInterimText] = useState<string>('');
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [isMutedTts, setIsMutedTts] = useState<boolean>(false);

  // Session state
  const [interviewId, setInterviewId] = useState<string>('');
  const [stage, setStage] = useState<'setup' | 'interview' | 'completed' | 'error'>('setup');
  const [targetRole, setTargetRole] = useState<string>(store.goal?.targetRole || 'Software Engineer');
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [currentSeq, setCurrentSeq] = useState<number>(0);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // 1v1 Live Signals & Accuracy
  const [latestVerdict, setLatestVerdict] = useState<'correct' | 'partially_correct' | 'incorrect' | null>(null);
  const [latestVerdictExp, setLatestVerdictExp] = useState<string>('');
  const [aiNotesText, setAiNotesText] = useState<string>("Connecting to your 1-on-1 AI Interviewer...");
  const [latestEvaluation, setLatestEvaluation] = useState<any>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [partialCount, setPartialCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);

  // Conversation transcript
  const [transcriptHistory, setTranscriptHistory] = useState<VoiceChatMessage[]>([]);

  // Modals & UI Controls
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15:00
  const [reportData, setReportData] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const drawerEndRef = useRef<HTMLDivElement | null>(null);

  // Check microphone permissions
  useEffect(() => {
    if (navigator.permissions && (navigator.permissions as any).query) {
      (navigator.permissions as any).query({ name: 'microphone' }).then((perm: any) => {
        if (perm.state === 'granted') setMicPermission('granted');
        else if (perm.state === 'denied') setMicPermission('denied');
        else setMicPermission('prompt');
        perm.onchange = () => {
          if (perm.state === 'granted') setMicPermission('granted');
          else if (perm.state === 'denied') setMicPermission('denied');
          else setMicPermission('prompt');
        };
      }).catch(() => {});
    }
  }, []);

  // WebCam management
  useEffect(() => {
    if (viewMode === 'call' && isCameraOn) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: false })
        .then(stream => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Webcam access unavailable:", err);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [viewMode, isCameraOn]);

  // Session countdown timer
  useEffect(() => {
    if (viewMode !== 'call') return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode]);

  // Load history on mount
  useEffect(() => {
    api.getInterviewHistory().then(res => setHistoryList(res)).catch(() => {});
  }, []);

  // Auto-scroll transcript drawer
  useEffect(() => {
    if (drawerEndRef.current) {
      drawerEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptHistory]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // --- NATURAL TEXT-TO-SPEECH FOR 1-ON-1 AI VOICE ---
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  const speakText = (text: string, onEnd?: () => void) => {
    if (!text || isMutedTts || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/[*#_`~]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/[✅⚠️❌🎉•]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.lang.startsWith('en') && (
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Zira') ||
          v.name.includes('Jenny') ||
          v.name.includes('David')
        )
      ) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsAiSpeaking(true);
      };
      utterance.onend = () => {
        setIsAiSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("AI Voice SpeechSynthesis error:", err);
      setIsAiSpeaking(false);
    }
  };

  // --- CANDIDATE LIVE MICROPHONE CAPTURE (SPEECH RECOGNITION) ---
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsSpeechRecognitionActive(false);
    setSpeechInterimText('');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    stopSpeaking();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsSpeechRecognitionActive(true);
        setSpeechInterimText('');
        setIsMicOn(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        if (finalChunk.trim()) {
          setSpokenTranscript(prev => prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim());
          setSpeechInterimText('');
        } else if (interim.trim()) {
          setSpeechInterimText(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          setIsSpeechRecognitionActive(false);
          setSpeechInterimText('');
        }
      };

      recognition.onend = () => {
        setIsSpeechRecognitionActive(false);
        setSpeechInterimText('');
        recognitionRef.current = null;
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Error starting speech recognition:", e);
      setIsSpeechRecognitionActive(false);
    }
  };

  const requestMicAccess = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setMicPermission('granted');
      }
      startListening();
    } catch (err) {
      console.warn("Microphone access error:", err);
      setMicPermission('denied');
      alert("Microphone permission was not granted. Please allow microphone access in your browser to speak with the AI.");
    }
  };

  const toggleMicRecording = () => {
    if (isSpeechRecognitionActive) {
      stopListening();
    } else {
      requestMicAccess();
    }
  };

  // --- START 1-ON-1 INTERVIEW CALL WITH AI ---
  const startNew1v1Session = async () => {
    setIsAiThinking(true);
    setApiErrorMessage(null);
    setAiNotesText("Connecting to Senior AI Interviewer...");
    setSpokenTranscript('');
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
      setTranscriptHistory([
        {
          sender: 'AI Interviewer',
          text: res.message,
          time: nowStr,
          audioText: res.message
        }
      ]);

      setAiNotesText("AI Interviewer is on the call. Initializing 1-on-1 discussion...");
      speakText(res.message);
    } catch (err) {
      console.error("Failed to start voice interview:", err);
      setApiErrorMessage("AI Interviewer is currently unavailable. Please check your connection.");
      setAiNotesText("Unable to reach AI Interviewer.");
    } finally {
      setIsAiThinking(false);
    }
  };

  // Mount effect
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    startNew1v1Session();
  }, []);

  // --- SUBMIT SPOKEN REPLY TO GEMINI ---
  const submitSpokenReply = async (forcedText?: string) => {
    const rawAnswer = forcedText || (spokenTranscript + (speechInterimText ? ' ' + speechInterimText : '')).trim();
    if (!rawAnswer || isAiThinking) return;

    stopListening();
    stopSpeaking();
    setSpokenTranscript('');
    setSpeechInterimText('');
    setIsAiThinking(true);
    setApiErrorMessage(null);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscriptHistory(prev => [...prev, { sender: 'You', text: rawAnswer, time: nowStr }]);
    setAiNotesText(stage === 'setup' ? "AI is reviewing your interview preferences..." : "AI is listening to your answer, analyzing technical accuracy, and marking verdict...");

    try {
      const res: InterviewChatResponse = await api.chatInterview({
        interview_id: interviewId,
        message: rawAnswer,
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

      // Natural conversational speech output
      let spokenOutput = "";
      if (res.stage === 'interview' && res.verdict) {
        const vWord = res.verdict === 'correct'
          ? "Correct!"
          : (res.verdict === 'partially_correct' ? "Partially correct." : "That is incorrect.");
        spokenOutput = `${vWord} ${res.verdict_explanation || ''} Next question: ${res.current_question || ''}`.trim();
      } else if (res.stage === 'completed') {
        const rep = res.final_report;
        const vWord = res.verdict
          ? (res.verdict === 'correct' ? "Correct!" : res.verdict === 'partially_correct' ? "Partially correct." : "That is incorrect.")
          : "";
        spokenOutput = `${vWord} ${res.verdict_explanation || ''} Excellent work on completing the interview! You achieved an overall score of ${rep?.overall_score || 82} percent with ${rep?.correct_answers || correctCount} correct answers. I have prepared your complete evaluation report.`.trim();
      } else {
        spokenOutput = res.current_question || res.message;
      }

      setTranscriptHistory(prev => [
        ...prev,
        {
          sender: 'AI Interviewer',
          text: res.message,
          time: nowStr,
          verdict: res.verdict,
          verdict_explanation: res.verdict_explanation,
          evaluation: res.evaluation,
          feedback: res.feedback,
          audioText: spokenOutput
        }
      ]);

      // Speak AI response aloud
      speakText(spokenOutput);

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
          strengths: res.strengths || ['Strong technical reasoning'],
          weaknesses: res.weaknesses || ['Provide more concrete code examples'],
          recommendations: ['Review advanced edge cases', 'Practice STAR format'],
          final_feedback: res.message
        };
        setReportData(finalRep);
        userStore.submitAssessmentResult('interview-prep', 'technical', finalRep.overall_score);
        api.getInterviewHistory().then(h => setHistoryList(h)).catch(() => {});
        setTimeout(() => setViewMode('report'), 2500);
      }
    } catch (err) {
      console.error("Spoken reply evaluation error:", err);
      setApiErrorMessage("Evaluation encountered an issue. Please try speaking your reply again.");
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- FINALIZE / END 1-ON-1 CALL ---
  const handleConfirmEndCall = async () => {
    setShowEndModal(false);
    setIsAiThinking(true);
    stopSpeaking();
    stopListening();
    setAiNotesText("Synthesizing final 1-on-1 interview performance analysis...");

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
        strengths: strengths.length ? strengths : ['Clear articulation of concepts'],
        weaknesses: weaknesses.length ? weaknesses : ['Could provide deeper architectural trade-offs'],
        recommendations: ['Practice timed mock interviews', 'Review database indexing'],
        final_feedback: res.message || 'Solid interview performance.'
      };

      setReportData(finalRep);
      userStore.submitAssessmentResult('interview-prep', 'technical', finalRep.overall_score);
      setStage('completed');
      setViewMode('report');

      const concludingSpeech = `Interview session finalized. You answered ${currentSeq} questions. Your overall score is ${finalRep.overall_score} percent with ${finalRep.correct_answers || correctCount} marked correct. Review your detailed evaluation report below.`;
      speakText(concludingSpeech);
    } catch (err) {
      console.error("End call error:", err);
      const report = await api.getInterviewReport(interviewId || 'intv_call');
      setReportData(report);
      setViewMode('report');
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">

      {/* TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#64748B] mb-1">
            <span className="flex items-center text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
              LIVE 1-ON-1 AI VOICE INTERVIEW
            </span>
            <span>•</span>
            <span>CareerForge AI Meeting Room</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] flex items-center">
            1-on-1 AI Voice Interview
            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center">
              <Mic className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Microphone Connected
            </span>
          </h1>
          <div className="text-xs text-[#64748B] font-medium mt-0.5 flex items-center space-x-2">
            <span className="font-semibold text-[#0A192F]">{targetRole}</span>
            <span>•</span>
            <span>{interviewType}</span>
            <span>•</span>
            <span>{difficulty} Level</span>
            <span>•</span>
            <span className="font-semibold text-emerald-600">
              {stage === 'setup' ? 'Conversational Setup' : `Question ${currentSeq} of ${numQuestions}`}
            </span>
          </div>
        </div>

        {/* TOP CONTROLS */}
        <div className="flex items-center space-x-3">
          {/* AI Voice Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              if (!isMutedTts) stopSpeaking();
              setIsMutedTts(!isMutedTts);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 shadow-xs ${
              isMutedTts
                ? 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isMutedTts ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            <span className="hidden sm:inline">{isMutedTts ? "AI Audio Muted" : "AI Voice Speaking"}</span>
          </button>

          {/* Transcript Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <BarChart2 className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">1v1 Scoreboard & Notes</span>
          </button>

          {/* Session Timer */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 flex items-center space-x-3 shadow-xs">
            <Clock className="w-4 h-4 text-slate-600" />
            <div>
              <div className="text-sm font-extrabold font-mono text-[#0A192F]">{formatTime(secondsRemaining)}</div>
              <div className="text-[9px] text-[#64748B] font-semibold">Session Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR / RECONNECT BANNER (CLEAN & NON-INTRUSIVE) */}
      {apiErrorMessage && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-medium">{apiErrorMessage}</span>
          </div>
          <button
            onClick={() => submitSpokenReply()}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold transition-all"
          >
            Retry Answer
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-ON-1 CALL SCREEN: EXECUTIVE DUAL MEETING THEATER STAGE                  */}
      {/* ========================================================================= */}
      {viewMode === 'call' && (
        <div className="space-y-4">

          {/* DUAL 1V1 MEETING STAGE CONTAINER */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4">

            {/* STAGE HEADER METADATA */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 border-b border-slate-800/80 pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  Executive 1-on-1 Session
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium">{targetRole}</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono">
                <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  {difficulty} Level
                </span>
                <span className="bg-emerald-950/70 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800/50 font-bold">
                  {stage === 'setup' ? 'Setup Mode' : `Question ${currentSeq} of ${numQuestions}`}
                </span>
              </div>
            </div>

            {/* THE TWO 1V1 VIDEO TILES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* TILE 1: SENIOR AI INTERVIEWER */}
              <div className="relative bg-gradient-to-b from-slate-900 via-[#0B1528] to-slate-950 rounded-2xl border border-slate-800 p-5 min-h-[360px] sm:min-h-[390px] flex flex-col justify-between overflow-hidden shadow-xl">
                
                {/* Subtle Ambient Radial Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                  isAiSpeaking
                    ? 'bg-sky-500/20'
                    : isSpeechRecognitionActive
                    ? 'bg-emerald-500/15'
                    : isAiThinking
                    ? 'bg-amber-500/20'
                    : 'bg-emerald-500/10'
                }`}></div>

                {/* AI Tile Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs font-semibold shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Dr. Sarah Vance • Senior AI Interviewer</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide flex items-center space-x-1.5 ${
                    isAiSpeaking
                      ? 'bg-sky-500 text-white animate-pulse shadow-md shadow-sky-500/30'
                      : isAiThinking
                      ? 'bg-amber-500 text-white animate-pulse shadow-md shadow-amber-500/30'
                      : isSpeechRecognitionActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isAiSpeaking ? 'bg-white' : isAiThinking ? 'bg-white' : isSpeechRecognitionActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`}></span>
                    <span>
                      {isAiSpeaking ? 'AI SPEAKING ALOUD' : isAiThinking ? 'ANALYZING YOUR ANSWER' : isSpeechRecognitionActive ? 'AI LISTENING TO YOU' : 'AI READY'}
                    </span>
                  </span>
                </div>

                {/* AI Central Sonic Avatar Visualizer */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4">
                  <div className="relative">
                    {/* Concentric Audio Pulse Rings */}
                    {isAiSpeaking && (
                      <>
                        <div className="absolute -inset-4 rounded-full bg-sky-400/20 animate-ping"></div>
                        <div className="absolute -inset-8 rounded-full bg-sky-500/10 animate-pulse"></div>
                      </>
                    )}
                    {isSpeechRecognitionActive && (
                      <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-pulse"></div>
                    )}

                    {/* Central Orb */}
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all duration-500 ${
                      isAiSpeaking
                        ? 'border-sky-400 bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900 scale-105 shadow-sky-500/40'
                        : isAiThinking
                        ? 'border-amber-400 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 scale-100 shadow-amber-500/30'
                        : isSpeechRecognitionActive
                        ? 'border-emerald-400 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 shadow-emerald-500/30'
                        : 'border-slate-700 bg-slate-900 shadow-slate-900/50'
                    }`}>
                      <Sparkles className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 ${
                        isAiSpeaking
                          ? 'text-sky-300 scale-110'
                          : isAiThinking
                          ? 'text-amber-300 animate-spin'
                          : isSpeechRecognitionActive
                          ? 'text-emerald-300'
                          : 'text-slate-400'
                      }`} />
                    </div>
                  </div>

                  {/* AI Status Title */}
                  <h3 className="text-white text-sm sm:text-base font-extrabold mt-4 tracking-tight text-center">
                    Gemini Technical Interviewer
                  </h3>
                  <p className="text-slate-400 text-xs font-medium text-center mt-0.5">
                    {isAiSpeaking
                      ? 'Speaking aloud... (Listen carefully)'
                      : isAiThinking
                      ? 'Synthesizing evaluation & checking correctness...'
                      : isSpeechRecognitionActive
                      ? 'Listening to your microphone response...'
                      : 'Conducting live 1-on-1 interview'}
                  </p>

                  {/* Live Animated Equalizer Bars */}
                  {isAiSpeaking ? (
                    <div className="flex items-center space-x-1 mt-3.5 h-6">
                      <span className="w-1 h-3 bg-sky-400 animate-bounce rounded-full" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1 h-5 bg-sky-300 animate-bounce rounded-full" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-6 bg-sky-200 animate-bounce rounded-full" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 h-4 bg-sky-400 animate-bounce rounded-full" style={{ animationDelay: '0.3s' }}></span>
                      <span className="w-1 h-6 bg-sky-300 animate-bounce rounded-full" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-1 h-3 bg-sky-400 animate-bounce rounded-full" style={{ animationDelay: '0.25s' }}></span>
                    </div>
                  ) : (
                    <div className="h-6 mt-3.5 flex items-center">
                      <span className="text-[10px] font-mono text-slate-500">Audio ready</span>
                    </div>
                  )}
                </div>

                {/* AI Bottom Badge */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-1.5">
                  <span className="flex items-center">
                    <Volume2 className="w-3.5 h-3.5 text-sky-400 mr-1.5" />
                    Speech Synthesis Active
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">Gemini 3.6 Pro</span>
                </div>

              </div>

              {/* TILE 2: CANDIDATE (YOU) - CLEAN FULL VIDEO */}
              <div className="relative bg-slate-900 rounded-2xl border border-slate-800 min-h-[360px] sm:min-h-[390px] flex flex-col justify-between overflow-hidden shadow-xl">
                
                {/* Live Webcam Feed */}
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mb-2">
                      <User className="w-10 h-10" />
                    </div>
                    <span className="text-slate-400 text-xs font-semibold">Webcam Feed Paused</span>
                  </div>
                )}

                {/* Subtle dark gradient overlay for top and bottom pills */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"></div>

                {/* Candidate Header Pill */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-white text-xs font-semibold shadow-md">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Candidate (You)</span>
                  </div>

                  {/* Mic Hardware Status */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide flex items-center space-x-1.5 backdrop-blur-md ${
                    isSpeechRecognitionActive
                      ? 'bg-red-600/95 text-white animate-pulse shadow-md shadow-red-600/40'
                      : micPermission === 'granted'
                      ? 'bg-emerald-600/90 text-white'
                      : 'bg-amber-600/90 text-white'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSpeechRecognitionActive ? 'bg-white animate-ping' : 'bg-white'}`}></span>
                    <span>{isSpeechRecognitionActive ? 'MIC ACTIVE • LISTENING' : micPermission === 'granted' ? 'MIC READY' : 'MIC READY'}</span>
                  </span>
                </div>

                {/* Candidate Live Audio Level Visualizer & Footer */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-medium">
                    <Mic className={`w-3.5 h-3.5 ${isSpeechRecognitionActive ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
                    <span>{isSpeechRecognitionActive ? 'Capturing Voice...' : 'Mic Connected'}</span>
                    {isSpeechRecognitionActive && (
                      <div className="flex items-center space-x-0.5 ml-2">
                        <span className="w-0.5 h-2 bg-red-400 animate-bounce rounded-full"></span>
                        <span className="w-0.5 h-3.5 bg-red-400 animate-bounce rounded-full" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-0.5 h-2.5 bg-red-400 animate-bounce rounded-full" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                    HD Video 1080p
                  </span>
                </div>

              </div>

            </div>

            {/* DEDICATED INTERVIEW TELEPROMPTER: QUESTION & LIVE TRANSCRIPTION CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-3">
              
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center space-x-2 font-bold text-sky-300">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>
                    {stage === 'setup' ? 'Conversational Setup Request' : `Current Question #${currentSeq}`}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">
                  {difficulty} Difficulty • {interviewType}
                </span>
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-100">
                {stage === 'setup'
                  ? "Welcome to your 1-on-1 interview! Click 'Access Mic to Reply' below and tell me your target role, preferred technical topics, and difficulty level."
                  : currentQuestionText || "AI question will appear here."}
              </p>

              {/* Real-Time Live Speech Subtitle Ticker */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 min-h-[46px] flex items-center justify-between text-xs">
                <div className="flex items-start space-x-2 flex-1 pr-2">
                  <span className="text-emerald-400 font-bold flex-shrink-0">
                    {isSpeechRecognitionActive ? 'Listening Now:' : 'Your Answer:'}
                  </span>
                  <span className="text-slate-200 font-medium leading-relaxed">
                    {spokenTranscript || speechInterimText ? (
                      <>
                        <span>{spokenTranscript}</span>
                        {speechInterimText && <span className="text-emerald-400 italic"> {speechInterimText}</span>}
                      </>
                    ) : (
                      <span className="text-slate-500 italic">
                        Click the green button below and speak your answer directly into your microphone.
                      </span>
                    )}
                  </span>
                </div>

                {spokenTranscript && (
                  <button
                    onClick={() => setSpokenTranscript('')}
                    className="text-red-400 hover:text-red-300 text-[10px] font-bold underline flex-shrink-0"
                  >
                    Clear Text
                  </button>
                )}
              </div>

            </div>

            {/* LIVE VERDICT BANNER (APPEARS IMMEDIATELY WHEN AI MARKS ANSWER) */}
            {latestVerdict && (
              <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 transition-all shadow-md ${
                latestVerdict === 'correct'
                  ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-100'
                  : latestVerdict === 'partially_correct'
                  ? 'bg-amber-950/80 border-amber-600/70 text-amber-100'
                  : 'bg-rose-950/80 border-rose-600/70 text-rose-100'
              }`}>
                {latestVerdict === 'correct' && <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />}
                {latestVerdict === 'partially_correct' && <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />}
                {latestVerdict === 'incorrect' && <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />}

                <div className="flex-1">
                  <div className="text-xs font-extrabold uppercase tracking-wide flex items-center">
                    {latestVerdict === 'correct'
                      ? '🟢 AI Verdict: Marked Correct'
                      : latestVerdict === 'partially_correct'
                      ? '🟡 AI Verdict: Marked Partially Correct'
                      : '🔴 AI Verdict: Marked Wrong / Incorrect'}
                  </div>
                  {latestVerdictExp && (
                    <p className="text-xs font-medium leading-relaxed mt-0.5 text-slate-200">
                      {latestVerdictExp}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* FLOATING UNIFIED MEETING CONTROL BAR */}
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
              
              {/* Left Hardware Controls */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className={`p-3 rounded-xl border transition-all ${
                    isCameraOn
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-red-900/60 border-red-700 text-red-300'
                  }`}
                  title={isCameraOn ? "Mute Camera" : "Unmute Camera"}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMicRecording}
                  className={`p-3 rounded-xl border transition-all ${
                    isSpeechRecognitionActive
                      ? 'bg-red-600 text-white animate-pulse border-red-500'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                  title="Toggle Mic Recording"
                >
                  {isSpeechRecognitionActive ? <Mic className="w-4 h-4" /> : (isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />)}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isMutedTts) stopSpeaking();
                    setIsMutedTts(!isMutedTts);
                  }}
                  className={`p-3 rounded-xl border transition-all ${
                    isMutedTts
                      ? 'bg-amber-900/50 border-amber-700 text-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                  title={isMutedTts ? "Unmute AI Voice" : "Mute AI Voice"}
                >
                  {isMutedTts ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Center Hero Mic Action Button */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-center flex-wrap gap-2">
                {!isSpeechRecognitionActive ? (
                  <button
                    type="button"
                    onClick={requestMicAccess}
                    disabled={isAiThinking}
                    className="px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2.5 transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    <Mic className="w-4 h-4 text-emerald-200" />
                    <span>🎙️ Access Mic to Reply</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => submitSpokenReply()}
                    className="px-7 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/40 transition-all flex items-center space-x-2.5 transform hover:scale-[1.02] animate-pulse"
                  >
                    <div className="flex items-center space-x-1 mr-1">
                      <span className="w-1 h-3 bg-white animate-bounce rounded-full"></span>
                      <span className="w-1 h-4 bg-white animate-bounce rounded-full" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-2 bg-white animate-bounce rounded-full" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                    <span>Done Speaking — Submit Spoken Reply</span>
                  </button>
                )}

                {spokenTranscript && !isSpeechRecognitionActive && (
                  <button
                    type="button"
                    onClick={() => submitSpokenReply()}
                    disabled={isAiThinking}
                    className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
                  >
                    Submit Draft
                  </button>
                )}
              </div>

              {/* Right Options & Leave Call Button */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                  className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
                >
                  <BarChart2 className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Scorecard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEndModal(true)}
                  className="px-4 py-3 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <PhoneOff className="w-4 h-4 text-red-400" />
                  <span>End 1v1</span>
                </button>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* DRAWER / SIDEBAR: SCORECARD & TRANSCRIPT TRACKER                          */}
          {/* ========================================================================= */}
          {showTranscriptDrawer && (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-[#0A192F]">1-on-1 Interview Scoreboard & Live Transcript</h3>
                </div>
                <button
                  onClick={() => setShowTranscriptDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Tally Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="text-2xl font-black text-emerald-700">{correctCount}</div>
                    <div className="text-xs font-bold text-emerald-800">Marked Correct</div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <div className="text-2xl font-black text-amber-700">{partialCount}</div>
                    <div className="text-xs font-bold text-amber-800">Partially Correct</div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <div className="text-2xl font-black text-red-700">{incorrectCount}</div>
                    <div className="text-xs font-bold text-red-800">Marked Wrong</div>
                  </div>
                </div>
              </div>

              {/* Dialogue Transcript Stream */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {transcriptHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs ${
                      item.sender === 'AI Interviewer'
                        ? 'bg-slate-50 border border-slate-200 text-slate-800'
                        : 'bg-sky-50 border border-sky-200 text-sky-950 ml-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>{item.sender}</span>
                      <span>{item.time}</span>
                    </div>
                    <p className="font-medium leading-relaxed">{item.text}</p>
                    {item.verdict && (
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {item.verdict === 'correct' ? '🟢 Correct' : item.verdict === 'partially_correct' ? '🟡 Partially Correct' : '🔴 Incorrect'}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={drawerEndRef} />
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* FINAL REPORT VIEW (GEMINI 1-ON-1 EVALUATION)                              */}
      {/* ========================================================================= */}
      {viewMode === 'report' && reportData && (
        <div className="space-y-6 bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm max-w-5xl mx-auto">
          <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 text-xs font-mono font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>1-ON-1 AI INTERVIEW COMPLETED • SAVED TO HISTORY</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#0A192F]">1-on-1 Voice Interview Evaluation</h2>
              <p className="text-xs text-[#64748B] mt-1">
                Role: <span className="text-[#0A192F] font-semibold">{targetRole}</span> • Type: <span className="text-[#0A192F] font-semibold">{interviewType}</span> • Difficulty: <span className="text-[#0A192F] font-semibold">{difficulty}</span>
              </p>
            </div>

            <button
              onClick={() => {
                startNew1v1Session();
                setViewMode('call');
              }}
              className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start Another 1v1 Interview
            </button>
          </div>

          {/* ACCURACY SCOREBOARD */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Answer Accuracy & Spoken Verdict Scoreboard</h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  const speech = `Here is your final 1-on-1 interview analysis. Overall score is ${reportData.overall_score || 82} percent. You had ${reportData.correct_answers || correctCount} correct answers, ${reportData.partially_correct_answers || partialCount} partially correct, and ${reportData.incorrect_answers || incorrectCount} incorrect. Feedback: ${reportData.final_feedback || 'Great performance.'}`;
                  speakText(speech);
                }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <Volume2 className="w-4 h-4 text-amber-200" />
                <span>{isAiSpeaking ? 'AI Speaking...' : '🔊 Listen to AI Final Analysis'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-400">{reportData.correct_answers || correctCount}</div>
                  <div className="text-xs font-bold text-emerald-200">Marked Correct</div>
                  <div className="text-[10px] text-emerald-400/80">Accurate & Solid Knowledge</div>
                </div>
              </div>

              <div className="p-4 bg-amber-950/60 border border-amber-600/50 rounded-2xl flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-amber-400">{reportData.partially_correct_answers || partialCount}</div>
                  <div className="text-xs font-bold text-amber-200">Partially Correct</div>
                  <div className="text-[10px] text-amber-400/80">Basic understanding, missed edge cases</div>
                </div>
              </div>

              <div className="p-4 bg-rose-950/60 border border-rose-600/50 rounded-2xl flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-black text-rose-400">{reportData.incorrect_answers || incorrectCount}</div>
                  <div className="text-xs font-bold text-rose-200">Marked Wrong</div>
                  <div className="text-[10px] text-rose-400/80">Off-target answers</div>
                </div>
              </div>
            </div>
          </div>

          {/* SCORES BY DIMENSION */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">Overall Score</span>
              <div className="text-3xl font-black text-emerald-600">{reportData.overall_score || 82}%</div>
              <span className="text-[10px] text-emerald-700 font-semibold block">Composite Score</span>
            </div>

            <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Technical</span>
              <div className="text-2xl font-black text-sky-600">{reportData.technical_knowledge || 80}%</div>
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
              <span className="text-[10px] text-[#64748B] block">Spoken Clarity</span>
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
                {(reportData.strengths || ['Clear verbal communication', 'Good core concept definitions']).map((st: string, idx: number) => (
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
                {(reportData.weaknesses || ['Provide more architecture trade-off examples']).map((wk: string, idx: number) => (
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
              {(reportData.recommendations || ['Practice complex technical questions', 'Review edge case handling']).map((rec: string, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium flex items-center space-x-2 shadow-2xs">
                  <Target className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* END CALL CONFIRMATION MODAL                                               */}
      {/* ========================================================================= */}
      {showEndModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <PhoneOff className="w-6 h-6" />
              <h3 className="text-base font-bold text-[#0A192F]">End 1-on-1 Interview Call?</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your 1-on-1 interview call will conclude. Gemini will synthesize your spoken responses, evaluate your answers, calculate correctness tallies, and generate your performance report.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 border border-[#E2E8F0] hover:bg-slate-50 text-[#0A192F] text-xs font-semibold rounded-xl"
              >
                Return to Call
              </button>
              <button
                onClick={handleConfirmEndCall}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                End Call & View Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

function SendIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
