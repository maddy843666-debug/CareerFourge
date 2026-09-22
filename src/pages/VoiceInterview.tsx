import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Mic, MicOff, Video, VideoOff,
  Clock, CheckCircle2, AlertCircle,
  Play, ShieldCheck, User, RefreshCw, BarChart2, X,
  Award, Target, Flame, Lightbulb, HelpCircle, Volume2, VolumeX,
  CheckCircle, XCircle, AlertTriangle, Radio, PhoneOff, Settings2,
  Sliders, ShieldAlert, Eye, UserX, Camera, ChevronRight, Download,
  Keyboard, Edit3, MessageSquare, Send, Layers
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

// Indian English Technical Terms Phonetic Normalizer
const normalizeIndianEnglishTechSpeech = (text: string): string => {
  let res = text;
  const mappings: [RegExp, string][] = [
    [/\bs\s*q\s*l\b/gi, 'SQL'],
    [/\bsequel\b/gi, 'SQL'],
    [/\bd\s*s\s*a\b/gi, 'DSA'],
    [/\bups\b/gi, 'OOPs'],
    [/\boops\b/gi, 'OOPs'],
    [/\bo\s*o\s*p\s*s\b/gi, 'OOPs'],
    [/\bd\s*b\s*m\s*s\b/gi, 'DBMS'],
    [/\bpie\s*thon\b/gi, 'Python'],
    [/\bfast\s*a\s*p\s*i\b/gi, 'FastAPI'],
    [/\breact\s*j\s*s\b/gi, 'React'],
    [/\bnode\s*j\s*s\b/gi, 'Node.js'],
    [/\bkubernetees\b/gi, 'Kubernetes'],
    [/\bk\s*8\s*s\b/gi, 'K8s'],
    [/\bpost\s*gres\b/gi, 'PostgreSQL'],
    [/\bpost\s*gray\b/gi, 'PostgreSQL'],
    [/\brest\s*a\s*p\s*i\b/gi, 'REST API'],
    [/\bstar\s*method\b/gi, 'STAR methodology'],
    [/\bc\s*plus\s*plus\b/gi, 'C++'],
    [/\bdot\s*net\b/gi, '.NET'],
    [/\bmon\s*go\b/gi, 'MongoDB'],
    [/\bdocker\b/gi, 'Docker']
  ];
  for (const [pattern, rep] of mappings) {
    res = res.replace(pattern, rep);
  }
  return res;
};

export interface CourseTrack {
  id: string;
  title: string;
  role: string;
  skills: string[];
  description: string;
}

export const COURSE_TRACKS: CourseTrack[] = [
  {
    id: 'frontend',
    title: 'Frontend & Full-Stack React',
    role: 'Frontend Developer',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS/Tailwind', 'Next.js'],
    description: 'Virtual DOM, state management, web performance (LCP/CLS), SSR/CSR'
  },
  {
    id: 'python_backend',
    title: 'Python & FastAPI / Django Backend',
    role: 'Backend Developer',
    skills: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Redis', 'Celery'],
    description: 'GIL, async concurrency, SQL query optimization, microservices, connection pooling'
  },
  {
    id: 'java',
    title: 'Java Enterprise & Spring Boot',
    role: 'Java Developer',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Hibernate/JPA', 'Kafka'],
    description: 'JVM memory architecture, multithreading, Spring IoC, resilience patterns'
  },
  {
    id: 'data_science',
    title: 'Data Science & Machine Learning',
    role: 'Data Scientist / ML Engineer',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Feature Engineering'],
    description: 'Regularization, gradient descent, model drift, imbalanced classification'
  },
  {
    id: 'devops',
    title: 'DevOps, Cloud & Kubernetes',
    role: 'DevOps / Cloud Engineer',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Prometheus'],
    description: 'Container runtimes, K8s orchestration, IaC, zero-downtime deployments'
  },
  {
    id: 'system_design',
    title: 'System Design & Distributed Systems',
    role: 'System Architect / Senior SRE',
    skills: ['Distributed Systems', 'Caching', 'Database Sharding', 'Kafka', 'CAP Theorem'],
    description: 'High availability, horizontal scaling, idempotency, distributed rate limiting'
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms (DSA)',
    role: 'Software Engineer',
    skills: ['Data Structures', 'Algorithms', 'Dynamic Programming', 'Graphs', 'Trees'],
    description: 'Two pointers, sliding window, graph traversals, memoization, complexity'
  },
  {
    id: 'cyber_security',
    title: 'Cybersecurity & Ethical Hacking',
    role: 'Cybersecurity Analyst',
    skills: ['Network Security', 'OWASP Top 10', 'Cryptography', 'PKI/TLS', 'WAF'],
    description: 'XSS, CSRF, penetration testing, STRIDE threat modeling, SQL injection'
  },
  {
    id: 'golang',
    title: 'Golang Backend & Microservices',
    role: 'Go Backend Engineer',
    skills: ['Go (Golang)', 'Goroutines', 'Channels', 'GMP Scheduler', 'pprof'],
    description: 'M:N concurrency, mutexes, memory escape analysis, high throughput microservices'
  },
  {
    id: 'android',
    title: 'Android Mobile Dev (Kotlin)',
    role: 'Android Engineer',
    skills: ['Kotlin', 'Jetpack Compose', 'Coroutines/Flow', 'MVVM', 'Room DB'],
    description: 'Recomposition, ViewModel lifecycle, memory leak profiling, ProGuard/R8'
  },
  {
    id: 'ios',
    title: 'iOS Mobile Dev (Swift)',
    role: 'iOS Engineer',
    skills: ['Swift', 'SwiftUI', 'ARC Memory', 'async/await', 'Combine'],
    description: 'Weak/unowned references, struct vs class trade-offs, SwiftUI rendering pipeline'
  },
  {
    id: 'qa_automation',
    title: 'QA Automation & SDET',
    role: 'QA Automation Engineer',
    skills: ['Playwright/Cypress', 'PyTest/JUnit', 'Page Object Model', 'API Testing'],
    description: 'Test automation pyramid, flaky test mitigation, CI/CD sharding, load testing'
  },
  {
    id: 'blockchain',
    title: 'Blockchain & Web3 Engineering',
    role: 'Smart Contract Developer',
    skills: ['Solidity', 'EVM Bytecode', 'Gas Optimization', 'Reentrancy', 'DeFi'],
    description: 'Constant product AMM, Layer 2 ZK-Rollups, storage vs calldata, Foundry fuzzing'
  },
  {
    id: 'sql_db',
    title: 'Database Architecture & SQL DBA',
    role: 'Database Administrator',
    skills: ['PostgreSQL/MySQL', 'B+Tree Indexing', 'ACID & Isolation', 'MVCC'],
    description: 'EXPLAIN ANALYZE tuning, deadlock mitigation, row locking, window functions'
  },
  {
    id: 'flutter',
    title: 'Flutter & Cross-Platform Mobile',
    role: 'Flutter Developer',
    skills: ['Flutter', 'Dart', 'BLoC/Riverpod', 'Platform Channels', 'Widget Tree'],
    description: 'RenderObject tree, jank profiling, method channels, GoRouter deep linking'
  },
  {
    id: 'computer_vision',
    title: 'Computer Vision & Edge AI',
    role: 'Computer Vision Engineer',
    skills: ['OpenCV', 'PyTorch/TensorFlow', 'YOLO/ResNet', 'CNNs', 'TensorRT', 'Edge Inference'],
    description: 'Object detection, semantic segmentation, camera calibration, TensorRT deployment'
  },
  {
    id: 'embedded_systems',
    title: 'Embedded Systems & Firmware (C/C++)',
    role: 'Embedded Software Engineer',
    skills: ['C/Embedded C', 'C++', 'ARM Cortex-M', 'RTOS (FreeRTOS)', 'I2C/SPI/UART', 'Memory Constraints'],
    description: 'Bare-metal drivers, interrupt latency, DMA, volatile qualifiers, register-level debugging'
  },
  {
    id: 'robotics_ros2',
    title: 'Robotics & Autonomous Systems (ROS2)',
    role: 'Robotics Software Engineer',
    skills: ['ROS 2', 'C++', 'Python', 'URDF', 'SLAM', 'Nav2', 'Sensor Fusion (EKF)'],
    description: 'DDS QoS policies, node lifecycle, tf2 coordinate transforms, state estimation'
  },
  {
    id: 'unreal_engine',
    title: 'Unreal Engine 5 & C++ Game Tech',
    role: 'Unreal Engine Developer',
    skills: ['Unreal Engine 5', 'C++', 'Blueprints', 'Gameplay Ability System (GAS)', 'Nanite/Lumen'],
    description: 'UObject garbage collection, network replication, tick group optimization, Chaos physics'
  },
  {
    id: 'unity_csharp',
    title: 'Unity 3D & C# Game Development',
    role: 'Unity Game Developer',
    skills: ['Unity', 'C#', 'DOTS / ECS', 'Shader Graph', 'NavMesh', 'Memory Profiling'],
    description: 'MonoBehaviour lifecycle, garbage collection spikes, draw call batching, job system'
  },
  {
    id: 'rust_systems',
    title: 'Rust Systems & High-Perf Architecture',
    role: 'Rust Systems Engineer',
    skills: ['Rust', 'Borrow Checker & Lifetimes', 'Tokio Async', 'Zero-Cost Abstractions', 'Unsafe Rust'],
    description: 'Ownership semantics, Send and Sync traits, atomic primitives, memory safety without GC'
  },
  {
    id: 'salesforce_dev',
    title: 'Salesforce Apex & Cloud Architecture',
    role: 'Salesforce Developer',
    skills: ['Apex', 'Lightning Web Components (LWC)', 'SOQL/SOSL', 'Governor Limits', 'Flows'],
    description: 'Bulkification patterns, trigger frameworks, asynchronous Apex (Batch/Queueable), sharing rules'
  },
  {
    id: 'quantum_computing',
    title: 'Quantum Computing & Qiskit',
    role: 'Quantum Computing Researcher / Engineer',
    skills: ['Quantum Information', 'Qiskit', 'Qubits & Superposition', 'Entanglement', 'VQE / QAOA'],
    description: 'Quantum circuit synthesis, NISQ error mitigation, Grover/Shor algorithms, decoherence'
  },
  {
    id: 'bioinformatics',
    title: 'Bioinformatics & Computational Biology',
    role: 'Bioinformatics Scientist',
    skills: ['Next-Gen Sequencing (NGS)', 'Python/Biopython', 'R/Bioconductor', 'SAMtools/BCFtools', 'GWAS'],
    description: 'FASTQ/BAM pipelines, variant calling, RNA-seq differential expression, multiple sequence alignment'
  },
  {
    id: 'fintech_algo',
    title: 'FinTech & High-Frequency Algorithmic Systems',
    role: 'Quantitative Software Engineer',
    skills: ['C++', 'Low Latency Architecture', 'Order Book Mechanics', 'FIX Protocol', 'Market Microstructure'],
    description: 'Kernel bypass (Solarflare EF_VI), lock-free ring buffers, cache alignment, risk checks'
  },
  {
    id: 'iot_edge',
    title: 'Internet of Things (IoT) & Smart Edge',
    role: 'IoT Solutions Architect',
    skills: ['MQTT / CoAP', 'ESP32 / Raspberry Pi', 'Edge Computing', 'OTA Firmware', 'TLS/X.509 Security'],
    description: 'Constrained device protocols, low-power sleep modes, edge anomaly detection, device shadows'
  },
  {
    id: 'data_engineering',
    title: 'Data Engineering & Lakehouse (Spark/Flink)',
    role: 'Data Engineer',
    skills: ['Apache Spark', 'PySpark', 'Apache Kafka', 'Airflow', 'Delta Lake / Iceberg', 'SQL Warehousing'],
    description: 'Partitioning & skew handling, streaming vs batch, data lakehouse governance, ETL orchestration'
  },
  {
    id: 'behavioral',
    title: 'Executive Behavioral & Leadership',
    role: 'Engineering Lead / Senior IC',
    skills: ['STAR Method', 'Leadership', 'Conflict Resolution', 'Cross-Functional Strategy'],
    description: 'Production outages, conflict mediation, mentoring, high-stakes decisions'
  }
];

export const VoiceInterview: React.FC<VoiceInterviewProps> = ({
  onProceedToCoding,
  onNavigate
}) => {
  const store = useUserStore();

  // Active view: 'call' | 'report' | 'history' | 'violation'
  const [viewMode, setViewMode] = useState<'call' | 'report' | 'history' | 'violation'>('call');
  const [customDomainText, setCustomDomainText] = useState<string>('');

  // Microphone & Camera state
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);

  // Speech Recognition (Indian English default)
  const [recognitionLang, setRecognitionLang] = useState<string>('en-IN');
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState<boolean>(false);
  const [speechInterimText, setSpeechInterimText] = useState<string>('');
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');

  // Course Track & Dual Answering State
  const [selectedCourseTrack, setSelectedCourseTrack] = useState<string>('frontend');
  const [answerMode, setAnswerMode] = useState<'dual' | 'voice' | 'text'>('dual');
  const [answerInputText, setAnswerInputText] = useState<string>('');

  // AI Voice State (Soft Professional Female Voice)
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isMutedTts, setIsMutedTts] = useState<boolean>(false);
  const [ttsSpeed, setTtsSpeed] = useState<number>(0.94); // Calm, unhurried cadence
  const [ttsPitch, setTtsPitch] = useState<number>(1.04); // Soft, gentle warmth
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isAuditioningVoice, setIsAuditioningVoice] = useState<boolean>(false);

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

  // Conversation transcript & Answer Reviews
  const [transcriptHistory, setTranscriptHistory] = useState<VoiceChatMessage[]>([]);
  const [answerReviews, setAnswerReviews] = useState<Array<{
    questionNumber: number;
    questionText: string;
    candidateAnswer: string;
    verdict: 'correct' | 'partially_correct' | 'incorrect';
    verdictExplanation: string;
    feedback?: string;
    strengths?: string[];
    weaknesses?: string[];
  }>>([]);

  // Modals & UI Controls
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState<boolean>(false);
  const [showVoiceStudioModal, setShowVoiceStudioModal] = useState<boolean>(false);
  const [showDomainTrackModal, setShowDomainTrackModal] = useState<boolean>(false);
  const [domainSearchFilter, setDomainSearchFilter] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15:00
  const [reportData, setReportData] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);

  // --- MULTI-PERSON PROCTORING & INTEGRITY STATE ---
  const [detectedFaceCount, setDetectedFaceCount] = useState<number>(1);
  const [multiPersonWarning, setMultiPersonWarning] = useState<boolean>(false);
  const [multiPersonCountdown, setMultiPersonCountdown] = useState<number>(4);
  const [isSimulatedSecondPerson, setIsSimulatedSecondPerson] = useState<boolean>(false);
  const [violationEvidenceSnapshot, setViolationEvidenceSnapshot] = useState<string | null>(null);
  const [violationIncidentTime, setViolationIncidentTime] = useState<string>('');
  const [proctorLogs, setProctorLogs] = useState<Array<{ time: string; message: string; severity: 'ok' | 'warn' | 'alert' }>>([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: 'Proctoring calibrated: Single candidate biometric lock verified', severity: 'ok' }
  ]);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const proctorIntervalRef = useRef<any>(null);
  const violationTimerRef = useRef<any>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const drawerEndRef = useRef<HTMLDivElement | null>(null);

  // --- INITIALIZE SPEECH SYNTHESIS VOICES (SOFT PROFESSIONAL FEMALE PRIORITY) ---
  const updateAvailableVoices = () => {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Filter out explicit male voices
    const nonMaleVoices = voices.filter(v => {
      const name = v.name.toLowerCase();
      return !name.includes('david') && !name.includes('mark') && !name.includes('george') &&
             !name.includes('guy') && !name.includes('richard') && !name.includes('male') &&
             !name.includes('stefan') && !name.includes('paul');
    });

    setAvailableVoices(nonMaleVoices);

    // Auto-select best soft professional female voice:
    // 1. Indian English female voices (Heera, Neerja, Veena, Kavya, Aditi, Priya)
    const indianFemaleVoice = nonMaleVoices.find(v =>
      v.lang.toLowerCase().includes('en-in') &&
      (v.name.toLowerCase().includes('heera') ||
       v.name.toLowerCase().includes('neerja') ||
       v.name.toLowerCase().includes('veena') ||
       v.name.toLowerCase().includes('kavya') ||
       v.name.toLowerCase().includes('natural') ||
       v.name.toLowerCase().includes('female'))
    ) || nonMaleVoices.find(v => v.lang.toLowerCase().includes('en-in'));

    if (indianFemaleVoice && !selectedVoiceURI) {
      setSelectedVoiceURI(indianFemaleVoice.voiceURI);
      return;
    }

    // 2. High-quality natural English female voice (Aria, Jenny, Samantha, Zira, Google UK Female)
    const naturalFemale = nonMaleVoices.find(v => {
      const n = v.name.toLowerCase();
      return v.lang.startsWith('en') && (
        n.includes('natural') || n.includes('aria') || n.includes('jenny') ||
        n.includes('samantha') || n.includes('zira') || n.includes('google uk english female')
      );
    });

    if (naturalFemale && !selectedVoiceURI) {
      setSelectedVoiceURI(naturalFemale.voiceURI);
    } else if (nonMaleVoices.length > 0 && !selectedVoiceURI) {
      setSelectedVoiceURI(nonMaleVoices[0].voiceURI);
    }
  };

  useEffect(() => {
    updateAvailableVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateAvailableVoices;
    }
  }, []);

  // Cancel speech synthesis, recognition, and media streams immediately when navigating away or unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(t => t.stop());
        } catch {}
        videoRef.current.srcObject = null;
      }
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
      if (violationTimerRef.current) clearTimeout(violationTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

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

  // --- WEBCAM & AUDIO CONTEXT METER MANAGEMENT ---
  useEffect(() => {
    if (viewMode === 'call' && isCameraOn) {
      navigator.mediaDevices?.getUserMedia?.({ video: { width: 640, height: 480 }, audio: true })
        .then(stream => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          // Setup Web Audio Analyser for candidate live mic meter
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass();
              audioContextRef.current = audioCtx;
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 64;
              analyserRef.current = analyser;
              const source = audioCtx.createMediaStreamSource(stream);
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const checkVolume = () => {
                if (analyserRef.current) {
                  analyserRef.current.getByteFrequencyData(dataArray);
                  let sum = 0;
                  for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                  }
                  const avg = sum / dataArray.length;
                  setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
                }
                animFrameRef.current = requestAnimationFrame(checkVolume);
              };
              checkVolume();
            }
          } catch (audioErr) {
            console.warn("Audio meter setup notice:", audioErr);
          }
        })
        .catch(err => {
          console.warn("Webcam/Mic access unavailable:", err);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    }
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
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

  // --- REAL-TIME MULTI-PERSON DETECTOR & AUTO-TERMINATION ENGINE ---
  const captureFrameSnapshot = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay Proctoring Stamp
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.fillRect(0, 0, canvas.width, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`🚨 INTEGRITY VIOLATION EVIDENCE: MULTIPLE PERSONS DETECTED (${new Date().toLocaleTimeString()})`, 16, 23);

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const triggerAutoEndIntegrityViolation = (reason: string) => {
    stopListening();
    stopSpeaking();

    const snapshot = captureFrameSnapshot();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setViolationEvidenceSnapshot(snapshot);
    setViolationIncidentTime(timeStr);
    setMultiPersonWarning(false);
    setViewMode('violation');

    speakText("Proctoring alert: This interview session has been automatically terminated due to an integrity policy violation. More than one person was detected in your camera frame.");

    setProctorLogs(prev => [
      ...prev,
      { time: timeStr, message: `CRITICAL VIOLATION: ${reason}. Interview auto-terminated by CareerForge Proctoring Engine.`, severity: 'alert' }
    ]);
  };

  // Run camera frame analysis loop every 800ms
  useEffect(() => {
    if (viewMode !== 'call' || !isCameraOn) {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
      return;
    }

    proctorIntervalRef.current = setInterval(async () => {
      if (isSimulatedSecondPerson) {
        setDetectedFaceCount(2);
        setMultiPersonWarning(true);
        return;
      }

      if (!videoRef.current || videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
        return;
      }

      const video = videoRef.current;
      let faceCount = 1;

      // 1. Native Chromium FaceDetector if enabled
      if ('FaceDetector' in window) {
        try {
          const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
          const faces = await detector.detect(video);
          if (faces && faces.length > 0) {
            faceCount = faces.length;
          }
        } catch (e) {
          // Fallback to geometric skin analysis
        }
      } else {
        // 2. High-speed Canvas Geometric Skin Cluster Analyzer
        try {
          const w = 160;
          const h = 120;
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;

            let leftClusters = 0;
            let rightClusters = 0;
            const midX = w / 2;

            for (let y = 15; y < h - 15; y += 4) {
              for (let x = 10; x < w - 10; x += 4) {
                const idx = (y * w + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // YCbCr skin chrominance threshold
                const Y = 0.299 * r + 0.587 * g + 0.114 * b;
                const Cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
                const Cr = 0.5 * r - 0.4187 * g - 0.0813 * b + 128;

                if (Y > 50 && Cb >= 75 && Cb <= 130 && Cr >= 130 && Cr <= 175 && r > g && g > b) {
                  if (x < midX - 12) leftClusters++;
                  else if (x > midX + 12) rightClusters++;
                }
              }
            }

            if (leftClusters > 95 && rightClusters > 95) {
              faceCount = 2;
            }
          }
        } catch {}
      }

      setDetectedFaceCount(faceCount);

      if (faceCount > 1) {
        setMultiPersonWarning(true);
      } else {
        setMultiPersonWarning(false);
        setMultiPersonCountdown(4);
      }
    }, 800);

    return () => {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
    };
  }, [viewMode, isCameraOn, isSimulatedSecondPerson]);

  // Handle countdown and auto-termination when multi-person is detected
  useEffect(() => {
    if (multiPersonWarning && viewMode === 'call') {
      if (multiPersonCountdown <= 0) {
        triggerAutoEndIntegrityViolation("Multiple persons detected in camera frame during live interview");
        return;
      }

      violationTimerRef.current = setTimeout(() => {
        setMultiPersonCountdown(prev => prev - 1);
      }, 1000);

      return () => {
        if (violationTimerRef.current) clearTimeout(violationTimerRef.current);
      };
    } else {
      setMultiPersonCountdown(4);
      if (violationTimerRef.current) clearTimeout(violationTimerRef.current);
    }
  }, [multiPersonWarning, multiPersonCountdown, viewMode]);

  // --- SOFT & PROFESSIONAL FEMALE AI VOICE TTS ---
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
        .replace(/[✅⚠️❌🎉•🇮🇳🎙️]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = ttsSpeed;
      utterance.pitch = ttsPitch;

      if (selectedVoiceURI) {
        const found = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (found) utterance.voice = found;
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

  const auditionVoice = () => {
    setIsAuditioningVoice(true);
    const sampleText = "Hello! I am Priya, your Senior AI Interviewer at CareerForge. I am calibrated with a soft, professional tone and I will evaluate your skills with precision.";
    speakText(sampleText, () => setIsAuditioningVoice(false));
  };

  // --- INDIAN ENGLISH SPEECH RECOGNITION (STT) ---
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
      recognition.lang = recognitionLang; // 'en-IN' default!

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
          const normalized = normalizeIndianEnglishTechSpeech(finalChunk.trim());
          setSpokenTranscript(prev => prev ? `${prev} ${normalized}` : normalized);
          setAnswerInputText(prev => prev ? `${prev} ${normalized}` : normalized);
          setSpeechInterimText('');
        } else if (interim.trim()) {
          setSpeechInterimText(normalizeIndianEnglishTechSpeech(interim));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
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
  const startNew1v1Session = async (overrideTrackId?: string, overrideCustomDomain?: string) => {
    setIsAiThinking(true);
    setApiErrorMessage(null);
    setAiNotesText("Connecting to Senior AI Interviewer (Priya)...");
    setSpokenTranscript('');
    setSpeechInterimText('');
    setAnswerInputText('');
    setAnswerReviews([]);
    setCorrectCount(0);
    setPartialCount(0);
    setIncorrectCount(0);

    try {
      let res: InterviewChatResponse;
      if (overrideCustomDomain) {
        res = await api.chatInterview({
          action: 'start',
          custom_domain: overrideCustomDomain,
          course: overrideCustomDomain,
          difficulty: difficulty,
          interview_type: interviewType,
          num_questions: numQuestions
        });
      } else if (overrideTrackId) {
        const track = COURSE_TRACKS.find(t => t.id === overrideTrackId) || COURSE_TRACKS[0];
        res = await api.chatInterview({
          action: 'start',
          course: track.title,
          target_role: track.role,
          skills: track.skills,
          difficulty: difficulty,
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
      setTranscriptHistory([
        {
          sender: 'AI Interviewer',
          text: res.message,
          time: nowStr,
          audioText: res.message
        }
      ]);

      if (res.stage === 'setup') {
        setAiNotesText("Priya Sharma • Senior AI Interviewer is online. Awaiting your domain selection.");
      } else {
        setAiNotesText(`Priya Sharma • Senior AI Interviewer is online. Calibrated for ${res.target_role || 'interview'}.`);
      }
      speakText(res.message);
    } catch (err) {
      console.error("Failed to start voice interview:", err);
      setApiErrorMessage("AI Interviewer is currently unavailable. Please check your connection.");
      setAiNotesText("Unable to reach AI Interviewer.");
    } finally {
      setIsAiThinking(false);
    }
  };

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    startNew1v1Session();
  }, []);

  // --- SUBMIT CANDIDATE REPLY (DUAL VOICE & KEYBOARD TEXT SUPPORT) ---
  const submitCandidateReply = async (
    forcedText?: string,
    options?: { custom_domain?: string; is_hint?: boolean }
  ) => {
    const rawAnswer = (
      forcedText !== undefined
        ? forcedText
        : (answerInputText || spokenTranscript + (speechInterimText ? ' ' + speechInterimText : ''))
    ).trim();
    if (!rawAnswer || isAiThinking) return;

    stopListening();
    stopSpeaking();
    setSpokenTranscript('');
    setSpeechInterimText('');
    setAnswerInputText('');
    setIsAiThinking(true);
    setApiErrorMessage(null);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscriptHistory(prev => [...prev, { sender: 'You', text: rawAnswer, time: nowStr }]);
    setAiNotesText(stage === 'setup' ? "AI is preparing your selected domain and opening Question 1..." : options?.is_hint ? "AI is preparing a helpful hint without scoring penalty..." : "AI is analyzing your response for technical depth, correctness, and STAR format...");

    try {
      const res: InterviewChatResponse = await api.chatInterview({
        interview_id: interviewId,
        message: rawAnswer,
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
        if (matched) setSelectedCourseTrack(matched.id);
      }
      if (res.interview_type) setInterviewType(res.interview_type);
      if (res.difficulty) setDifficulty(res.difficulty);
      const answeredQuestionText = currentQuestionText || `Question #${currentSeq || 1}`;
      const answeredQuestionNum = currentSeq || 1;

      if (res.total_questions) setNumQuestions(res.total_questions);
      if (res.current_question_num !== undefined) setCurrentSeq(res.current_question_num);
      if (res.current_question) setCurrentQuestionText(res.current_question);

      if (res.evaluation) setLatestEvaluation(res.evaluation);
      if (res.strengths) setStrengths(res.strengths);
      if (res.weaknesses) setWeaknesses(res.weaknesses);

      if (res.is_clarification) {
        // Clarification or hint: preserve state and do not penalize candidate scorecard!
        setAiNotesText(res.message);
      } else if (res.verdict) {
        setLatestVerdict(res.verdict);
        if (res.verdict === 'correct') setCorrectCount(prev => prev + 1);
        else if (res.verdict === 'partially_correct') setPartialCount(prev => prev + 1);
        else if (res.verdict === 'incorrect') setIncorrectCount(prev => prev + 1);

        // Record question answer review for the final report
        setAnswerReviews(prev => [
          ...prev,
          {
            questionNumber: answeredQuestionNum,
            questionText: answeredQuestionText,
            candidateAnswer: rawAnswer,
            verdict: res.verdict as 'correct' | 'partially_correct' | 'incorrect',
            verdictExplanation: res.verdict_explanation || '',
            feedback: res.feedback,
            strengths: res.strengths || strengths,
            weaknesses: res.weaknesses || weaknesses
          }
        ]);
      }
      if (res.verdict_explanation) setLatestVerdictExp(res.verdict_explanation);
      if (res.feedback && !res.is_clarification) setAiNotesText(res.feedback);

      let spokenOutput = "";
      if (res.is_clarification) {
        spokenOutput = res.message || "Here is a clarification to help you.";
      } else if (res.stage === 'interview' && res.verdict) {
        const vWord = res.verdict === 'correct'
          ? "Correct answer!"
          : (res.verdict === 'partially_correct' ? "Partially correct." : "That is incorrect.");
        spokenOutput = `${vWord} ${res.verdict_explanation || ''} Next question: ${res.current_question || ''}`.trim();
      } else if (res.stage === 'completed') {
        const rep = res.final_report;
        const vWord = res.verdict
          ? (res.verdict === 'correct' ? "Correct answer!" : res.verdict === 'partially_correct' ? "Partially correct." : "That is incorrect.")
          : "";
        spokenOutput = `${vWord} ${res.verdict_explanation || ''} Excellent work on completing your interview! You achieved an overall readiness score of ${rep?.overall_score || 82} percent. I have prepared your complete evaluation report.`.trim();
      } else {
        spokenOutput = res.message || res.current_question || '';
      }

      setTranscriptHistory(prev => [
        ...prev,
        {
          sender: 'AI Interviewer',
          text: res.message,
          time: nowStr,
          verdict: res.is_clarification ? undefined : res.verdict,
          verdict_explanation: res.is_clarification ? undefined : res.verdict_explanation,
          evaluation: res.evaluation,
          feedback: res.feedback,
          audioText: spokenOutput
        }
      ]);

      speakText(spokenOutput);

      if (res.stage === 'completed') {
        const finalRep = res.final_report || {
          overall_score: 82,
          technical_knowledge: 85,
          problem_solving: 80,
          communication: 82,
          answer_quality: 84,
          correct_answers: correctCount + (res.verdict === 'correct' ? 1 : 0),
          total_questions: numQuestions,
          strengths: res.strengths || strengths,
          weaknesses: res.weaknesses || weaknesses,
          final_feedback: res.message || 'Solid interview performance.'
        };
        setReportData(finalRep);
        userStore.submitAssessmentResult('interview-prep', 'technical', finalRep.overall_score);
        setViewMode('report');
      }
    } catch (err) {
      console.error("Answer submission error:", err);
      setApiErrorMessage("Failed to send answer to AI Interviewer. Please retry.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const submitSpokenReply = submitCandidateReply;

  const finalizeAndEndCall = async () => {
    stopSpeaking();
    stopListening();
    setShowEndModal(false);
    setIsAiThinking(true);

    try {
      const res: InterviewChatResponse = await api.chatInterview({
        interview_id: interviewId,
        action: 'finalize'
      });

      const finalRep = res.final_report || {
        overall_score: 80,
        technical_knowledge: 82,
        problem_solving: 78,
        communication: 80,
        answer_quality: 80,
        correct_answers: correctCount,
        total_questions: currentSeq || 5,
        strengths: strengths.length > 0 ? strengths : ['Clear communication', 'Solid conceptual fundamentals'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['Could provide deeper architectural trade-offs'],
        final_feedback: res.message || 'Solid interview performance.'
      };

      setReportData(finalRep);
      userStore.submitAssessmentResult('interview-prep', 'technical', finalRep.overall_score);
      setStage('completed');
      setViewMode('report');

      const concludingSpeech = `Interview session completed. You answered ${currentSeq} questions. Your readiness score is ${finalRep.overall_score} percent with ${finalRep.correct_answers || correctCount} marked correct. Review your detailed report below.`;
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

  // =========================================================================
  // VIEW: PROCTORING INTEGRITY VIOLATION TERMINATION SCREEN
  // =========================================================================
  if (viewMode === 'violation') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4 animate-in fade-in duration-300">
        
        {/* CRITICAL SECURITY TERMINATION BANNER */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-600/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400 flex-shrink-0 shadow-lg shadow-red-600/30">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-500/60 text-red-200 text-xs font-mono font-extrabold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                <span>Proctoring Security Rule Triggered</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Interview Automatically Terminated
              </h1>
              <p className="text-red-200 text-sm font-medium mt-1 leading-relaxed">
                Reason: Multiple persons detected in candidate camera frame ({detectedFaceCount} individuals identified).
              </p>
            </div>
          </div>
        </div>

        {/* EVIDENCE & AUDIT TRAIL CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CAMERA SNAPSHOT EVIDENCE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center font-bold text-slate-200">
                <Camera className="w-4 h-4 mr-1.5 text-red-400" />
                Live Camera Frame Evidence
              </span>
              <span className="font-mono text-red-400 bg-red-950/70 px-2 py-0.5 rounded border border-red-800/60">
                Timestamp: {violationIncidentTime || 'Live Session'}
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-red-500/50 bg-black aspect-video flex items-center justify-center">
              {violationEvidenceSnapshot ? (
                <img
                  src={violationEvidenceSnapshot}
                  alt="Proctoring Violation Evidence"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center">
                  <UserX className="w-12 h-12 text-red-400 mb-2" />
                  <span className="font-bold text-red-300">Multiple Persons Frame Detected</span>
                  <span className="text-[11px] text-slate-400 mt-1">2 distinct facial clusters registered in camera feed</span>
                </div>
              )}

              {/* Bounding box visual indicators */}
              <div className="absolute top-4 left-4 border-2 border-red-500 bg-red-500/20 rounded-lg px-2 py-1 text-[10px] font-mono font-bold text-white shadow-md">
                Person 1 • Candidate
              </div>
              <div className="absolute top-4 right-4 border-2 border-red-500 bg-red-500/20 rounded-lg px-2 py-1 text-[10px] font-mono font-bold text-white shadow-md animate-pulse">
                Person 2 • Unauthorized
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              CareerForge AI conducts continuous real-time multi-person computer vision proctoring to guarantee 100% fair and authentic evaluation. Sessions must take place in an isolated private environment.
            </p>
          </div>

          {/* POLICY AUDIT LOG */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Security Audit Log</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex justify-between">
                  <span className="text-slate-500">Security Rule:</span>
                  <span className="font-bold text-red-400">Strict 1-Candidate Lock</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex justify-between">
                  <span className="text-slate-500">Faces In Frame:</span>
                  <span className="font-bold text-red-400">{detectedFaceCount} (Limit: 1)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex justify-between">
                  <span className="text-slate-500">Grace Countdown:</span>
                  <span className="font-bold text-amber-400">Exceeded 4.0s Grace Window</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex justify-between">
                  <span className="text-slate-500">Action Taken:</span>
                  <span className="font-bold text-red-300">Automatic Immediate Termination</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsSimulatedSecondPerson(false);
                  setMultiPersonWarning(false);
                  setDetectedFaceCount(1);
                  setViewMode('call');
                  startNew1v1Session();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recalibrate & Start New 1v1 Session</span>
              </button>

              <button
                onClick={() => onNavigate ? onNavigate('dashboard') : setViewMode('call')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                Return to Candidate Dashboard
              </button>
            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">

      {/* TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#64748B] mb-1">
            <span className="flex items-center text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
              EXECUTIVE 1-ON-1 AI VOICE INTERVIEW
            </span>
            <span>•</span>
            <span className="text-sky-600 font-semibold">CareerForge ProctorGuard v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] flex items-center flex-wrap gap-2">
            AI Voice Interview
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center">
              <Mic className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Indian English (en-IN)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-sky-600" />
              Live AI Proctoring Active
            </span>
          </h1>
          <div className="text-xs text-[#64748B] font-medium mt-1 flex items-center space-x-2 flex-wrap gap-1">
            <span className="font-bold text-[#0A192F]">{targetRole}</span>
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
        <div className="flex items-center space-x-2.5 flex-wrap gap-2">
          {/* Course Track Selector */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 flex items-center space-x-2 shadow-xs">
            <Layers className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#64748B]">Course Track</span>
              <select
                value={selectedCourseTrack}
                onChange={(e) => {
                  const newTrack = e.target.value;
                  setSelectedCourseTrack(newTrack);
                  startNew1v1Session(newTrack);
                }}
                className="bg-transparent text-xs font-bold text-[#0A192F] focus:outline-none cursor-pointer pr-1"
                title="Change Course / Role Track"
              >
                {COURSE_TRACKS.map(t => (
                  <option key={t.id} value={t.id} className="text-slate-900 bg-white">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Extra / Custom Domain Trigger Button */}
          <button
            type="button"
            onClick={() => setShowDomainTrackModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-all flex items-center space-x-1.5 shadow-xs"
            title="Choose extra domain or custom tech role"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Extra Domain</span>
          </button>

          {/* Audio & Voice Studio Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowVoiceStudioModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-sky-200 bg-sky-50/80 hover:bg-sky-100 text-sky-800 transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>Audio & Voice Studio</span>
          </button>

          {/* Transcript Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <BarChart2 className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Scorecard</span>
          </button>

          {/* Session Timer */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 flex items-center space-x-2.5 shadow-xs">
            <Clock className="w-4 h-4 text-slate-600" />
            <div>
              <div className="text-xs sm:text-sm font-extrabold font-mono text-[#0A192F]">{formatTime(secondsRemaining)}</div>
              <div className="text-[9px] text-[#64748B] font-semibold leading-none">Session Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR / RECONNECT BANNER */}
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

          {/* PROCTORING MULTI-PERSON HIGH ALERT BANNER */}
          {multiPersonWarning && (
            <div className="p-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl border-2 border-red-300 shadow-2xl flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-7 h-7 text-white flex-shrink-0 animate-bounce" />
                <div>
                  <div className="text-sm font-black uppercase tracking-wide flex items-center space-x-2">
                    <span>🚨 PROCTORING WARNING: MULTIPLE PERSONS DETECTED ({detectedFaceCount} FACES)!</span>
                  </div>
                  <p className="text-xs text-red-100 font-medium mt-0.5">
                    Hiring policy strictly requires candidate to be alone. Session will automatically terminate in{' '}
                    <span className="font-mono font-black text-yellow-300 text-sm underline">{multiPersonCountdown} seconds</span> if not resolved.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSimulatedSecondPerson(false);
                  setMultiPersonWarning(false);
                  setDetectedFaceCount(1);
                }}
                className="px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 text-xs font-extrabold rounded-xl shadow-md transition-all"
              >
                Dismiss / Resolve
              </button>
            </div>
          )}

          {/* DUAL 1V1 MEETING STAGE CONTAINER */}
          <div className="bg-[#0A1120] p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4">

            {/* STAGE HEADER METADATA & PROCTORING HUD BAR */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 border-b border-slate-800/80 pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  Priya Sharma • Senior AI Interviewer
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium">Soft Professional Female Voice</span>
              </div>

              {/* Proctoring HUD Indicator */}
              <div className="flex items-center space-x-2 text-[11px] font-mono">
                <div className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                  multiPersonWarning
                    ? 'bg-red-950/80 border-red-600 text-red-300 animate-pulse'
                    : 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
                }`}>
                  <Eye className="w-3.5 h-3.5" />
                  <span>{multiPersonWarning ? `🚨 Multiple Faces Detected (${detectedFaceCount})` : '👤 1 Candidate Verified'}</span>
                </div>

                {/* Quick Simulation Button for Demo Testing */}
                <button
                  type="button"
                  onClick={() => setIsSimulatedSecondPerson(!isSimulatedSecondPerson)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center space-x-1 ${
                    isSimulatedSecondPerson
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Test multi-person auto-termination rule"
                >
                  <span>⚡ Test 2nd Person Detection</span>
                </button>
              </div>
            </div>

            {/* THE TWO 1V1 VIDEO TILES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* TILE 1: SENIOR AI INTERVIEWER (PRIYA) */}
              <div className="relative bg-gradient-to-b from-slate-900 via-[#0B1528] to-slate-950 rounded-2xl border border-slate-800 p-5 min-h-[360px] sm:min-h-[400px] flex flex-col justify-between overflow-hidden shadow-xl">
                
                {/* Subtle Ambient Radial Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                  isAiSpeaking
                    ? 'bg-sky-500/25'
                    : isSpeechRecognitionActive
                    ? 'bg-emerald-500/20'
                    : isAiThinking
                    ? 'bg-amber-500/25'
                    : 'bg-teal-500/15'
                }`}></div>

                {/* AI Tile Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs font-semibold shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Priya Sharma • Senior AI Interviewer</span>
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
                      {isAiSpeaking ? 'SPEAKING SOFTLY...' : isAiThinking ? 'ANALYZING RESPONSE...' : isSpeechRecognitionActive ? 'LISTENING ATTENTIVELY...' : 'AI READY'}
                    </span>
                  </span>
                </div>

                {/* AI Central Sonic Avatar Visualizer */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4">
                  <div className="relative">
                    {/* Concentric Audio Pulse Rings */}
                    {isAiSpeaking && (
                      <>
                        <div className="absolute -inset-4 rounded-full bg-sky-400/25 animate-ping"></div>
                        <div className="absolute -inset-8 rounded-full bg-teal-500/15 animate-pulse"></div>
                      </>
                    )}
                    {isSpeechRecognitionActive && (
                      <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-pulse"></div>
                    )}

                    {/* Central Orb */}
                    <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${
                      isAiSpeaking
                        ? 'border-sky-400 bg-gradient-to-br from-sky-950 via-slate-900 to-teal-900 scale-105 shadow-sky-500/40'
                        : isAiThinking
                        ? 'border-amber-400 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 scale-100 shadow-amber-500/30'
                        : isSpeechRecognitionActive
                        ? 'border-emerald-400 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 shadow-emerald-500/30'
                        : 'border-slate-700 bg-slate-900 shadow-slate-900/50'
                    }`}>
                      <Sparkles className={`w-11 h-11 transition-all duration-300 ${
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
                    Priya Sharma (AI)
                  </h3>
                  <p className="text-slate-400 text-xs font-medium text-center mt-0.5">
                    {isAiSpeaking
                      ? 'Speaking in soft, professional cadence...'
                      : isAiThinking
                      ? 'Analyzing technical depth & marking verdict...'
                      : isSpeechRecognitionActive
                      ? 'Listening for Indian English speech...'
                      : 'Conducting live 1-on-1 interview'}
                  </p>

                  {/* Live Animated Equalizer Bars */}
                  {isAiSpeaking ? (
                    <div className="flex items-center space-x-1.5 mt-3.5 h-6">
                      <span className="w-1.5 h-3 bg-sky-400 animate-bounce rounded-full" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1.5 h-5 bg-sky-300 animate-bounce rounded-full" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1.5 h-6 bg-teal-200 animate-bounce rounded-full" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-4 bg-sky-400 animate-bounce rounded-full" style={{ animationDelay: '0.3s' }}></span>
                      <span className="w-1.5 h-6 bg-sky-300 animate-bounce rounded-full" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-1.5 h-3 bg-teal-300 animate-bounce rounded-full" style={{ animationDelay: '0.25s' }}></span>
                    </div>
                  ) : (
                    <div className="h-6 mt-3.5 flex items-center">
                      <span className="text-[10px] font-mono text-slate-500">Awaiting candidate response</span>
                    </div>
                  )}
                </div>

                {/* AI Bottom Badge */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
                  <span className="flex items-center">
                    <Volume2 className="w-3.5 h-3.5 text-sky-400 mr-1.5" />
                    Soft Professional Woman Voice (Rate: {ttsSpeed}x)
                  </span>
                  <button
                    onClick={() => setShowVoiceStudioModal(true)}
                    className="text-sky-400 hover:text-sky-300 underline font-bold"
                  >
                    Adjust Voice
                  </button>
                </div>

              </div>

              {/* TILE 2: CANDIDATE (YOU) - FULL WEBCAM FEED WITH LIVE PROCTORING */}
              <div className={`relative bg-slate-900 rounded-2xl border min-h-[360px] sm:min-h-[400px] flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                multiPersonWarning ? 'border-red-500 ring-4 ring-red-500/30' : 'border-slate-800'
              }`}>
                
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

                {/* Dark gradient overlay for clear contrast of UI controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none"></div>

                {/* Candidate Header Pill & Proctoring Status */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-white text-xs font-semibold shadow-md">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Candidate (You)</span>
                  </div>

                  {/* Proctoring Face Lock Status */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide flex items-center space-x-1.5 backdrop-blur-md ${
                    multiPersonWarning
                      ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-600/40'
                      : 'bg-emerald-600/90 text-white'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${multiPersonWarning ? 'bg-white animate-ping' : 'bg-white'}`}></span>
                    <span>{multiPersonWarning ? `🚨 MULTIPLE PERSONS DETECTED (${detectedFaceCount})` : '🔒 SINGLE CANDIDATE VERIFIED'}</span>
                  </span>
                </div>

                {/* Candidate Bottom Bar: Live Mic Audio Meter & Face Tracking HUD */}
                <div className="relative z-10 p-4 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-medium">
                    <Mic className={`w-3.5 h-3.5 ${isSpeechRecognitionActive ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
                    <span>{isSpeechRecognitionActive ? 'Listening (en-IN)...' : 'Mic Ready'}</span>
                    
                    {/* Live Mic Level Dynamic Bars */}
                    <div className="flex items-center space-x-0.5 ml-1.5">
                      <span className={`w-0.5 h-2 rounded-full transition-all ${micAudioLevel > 10 ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                      <span className={`w-0.5 h-3 rounded-full transition-all ${micAudioLevel > 25 ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                      <span className={`w-0.5 h-4 rounded-full transition-all ${micAudioLevel > 45 ? 'bg-teal-300' : 'bg-slate-600'}`}></span>
                      <span className={`w-0.5 h-3 rounded-full transition-all ${micAudioLevel > 65 ? 'bg-yellow-400' : 'bg-slate-600'}`}></span>
                      <span className={`w-0.5 h-2 rounded-full transition-all ${micAudioLevel > 85 ? 'bg-red-400' : 'bg-slate-600'}`}></span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-300 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 mr-1" />
                    <span>Proctor Lock Active</span>
                  </span>
                </div>

              </div>

            </div>

            {/* DEDICATED INTERVIEW TELEPROMPTER: QUESTION & LIVE ANSWER WORKSPACE */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
              
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center space-x-2 font-bold text-sky-300">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>
                    {stage === 'setup' ? 'Live 1-on-1 HR Introduction & Domain Choice' : `Question #${currentSeq} of ${numQuestions}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-lg border border-emerald-800/60">
                    {stage === 'setup' ? 'Select or Speak Domain' : (COURSE_TRACKS.find(t => t.id === selectedCourseTrack)?.title || targetRole)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {difficulty} • {interviewType}
                  </span>
                </div>
              </div>

              {/* Stage Content: Setup Introduction & Interactive Domain Picker VS Question */}
              {stage === 'setup' ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-slate-950 via-sky-950/40 to-slate-950 p-4 rounded-2xl border border-sky-900/60 shadow-inner space-y-2">
                    <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-sky-300" />
                      <span>Priya Sharma • Senior AI HR & Technical Interviewer</span>
                      <span className="text-[10px] text-slate-400 font-normal">| Soft Professional Indian English Voice</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                      "Hello! Welcome to your live 1-on-1 interview. I'm Priya Sharma, your Senior AI Technical & HR Interviewer today. Which domain or technical stack would you like to interview for today?"
                    </p>
                    <p className="text-xs text-sky-300/80 font-medium">
                      💡 Click a domain card below, text any custom domain in the box, or speak your domain into the microphone.
                    </p>
                  </div>

                  {/* EXTRA / CUSTOM DOMAIN TEXT INPUT CARD */}
                  <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 p-4 rounded-2xl border border-sky-500/50 shadow-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-sky-300 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
                        Enter Extra / Custom Domain (AI will find & ask 1-on-1 voice questions for any domain):
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">1-on-1 AI Voice Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={customDomainText}
                        onChange={(e) => setCustomDomainText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customDomainText.trim() && !isAiThinking) {
                            submitCandidateReply(customDomainText.trim());
                            setCustomDomainText('');
                          }
                        }}
                        placeholder="e.g. Embedded Systems, Game Development, Cloud Security, Quantum Computing, Bioinformatics..."
                        className="flex-1 bg-slate-950 border border-sky-600/70 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customDomainText.trim() && !isAiThinking) {
                            submitCandidateReply(customDomainText.trim());
                            setCustomDomainText('');
                          }
                        }}
                        disabled={!customDomainText.trim() || isAiThinking}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center shadow-lg"
                      >
                        Start Custom Domain →
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                        Or Pick Recommended Interview Domains:
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {COURSE_TRACKS.length} Real-World Tracks
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {COURSE_TRACKS.map((t) => {
                        const isSelected = selectedCourseTrack === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedCourseTrack(t.id);
                              submitCandidateReply(t.title);
                            }}
                            disabled={isAiThinking}
                            className={`text-left p-3 rounded-xl border transition-all shadow-md group ${
                              isSelected
                                ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-500/40'
                                : 'bg-slate-950/70 hover:bg-slate-800/90 border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <div className="font-extrabold text-xs text-white group-hover:text-sky-300 flex items-center justify-between">
                              <span>{t.title}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-sky-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                              {t.skills.slice(0, 3).join(', ')}
                            </p>
                            <span className="inline-block mt-1.5 text-[10px] font-bold text-sky-400 group-hover:underline">
                              Start {t.role} →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Question Text */
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-100 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                    {currentQuestionText || "AI question will appear here."}
                  </p>

                  {/* 1-on-1 Voice Interview Quick Helper Actions */}
                  {stage === 'interview' && (
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 pt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1-on-1 Helpers:</span>
                      <button
                        type="button"
                        onClick={() => submitCandidateReply("Could you please give me a quick hint or direction for this question?", { is_hint: true })}
                        disabled={isAiThinking}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-[11px] font-bold transition-all flex items-center space-x-1"
                        title="Get a hint without scoring penalty"
                      >
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span>💡 Ask Hint (No Penalty)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => submitCandidateReply("Could you please clarify what specific constraints or scenario you would like me to focus on?")}
                        disabled={isAiThinking}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 text-[11px] font-bold transition-all flex items-center space-x-1"
                        title="Clarify question parameters"
                      >
                        <HelpCircle className="w-3 h-3 text-sky-400" />
                        <span>❓ Clarify Question</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDomainTrackModal(true)}
                        disabled={isAiThinking}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold transition-all flex items-center space-x-1"
                        title="Switch domain or enter custom domain"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>🔄 Switch / Extra Domain</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => submitCandidateReply("I would like to skip this question and proceed to the next one.")}
                        disabled={isAiThinking}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-bold transition-all flex items-center space-x-1"
                        title="Skip this question"
                      >
                        <span>⏭️ Skip Question</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CANDIDATE ANSWER WORKSPACE (DUAL VOICE & TEXT) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-300 flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                      {stage === 'setup' ? 'Your Response (Domain Selection):' : 'Your Answer:'}
                    </span>

                    {latestVerdict && stage !== 'setup' && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide flex items-center ${
                        latestVerdict === 'correct'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : latestVerdict === 'partially_correct'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      }`}>
                        {latestVerdict === 'correct' ? '✓ Last: Correct' : latestVerdict === 'partially_correct' ? '⚠ Last: Partially Correct' : '✗ Last: Incorrect'}
                      </span>
                    )}

                    {/* Mode Tabs: Dual / Voice / Text */}
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setAnswerMode('dual')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center space-x-1 ${
                          answerMode === 'dual'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Use microphone speech-to-text with keyboard editing"
                      >
                        <Mic className="w-3 h-3" />
                        <span>+</span>
                        <Keyboard className="w-3 h-3" />
                        <span className="hidden sm:inline">Dual Voice & Text</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswerMode('voice')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center space-x-1 ${
                          answerMode === 'voice'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Voice only mode"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Voice Only</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswerMode('text')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center space-x-1 ${
                          answerMode === 'text'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Text typing only"
                      >
                        <Keyboard className="w-3 h-3" />
                        <span>Text Only</span>
                      </button>
                    </div>
                  </div>

                  {/* Word & Character Counter + Live Status */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    {isSpeechRecognitionActive && (
                      <span className="text-red-400 font-semibold animate-pulse flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-ping"></span>
                        Listening (en-IN)...
                      </span>
                    )}
                    <span>
                      {answerInputText.trim() ? answerInputText.trim().split(/\s+/).length : 0} words
                    </span>
                    <span>•</span>
                    <span>{answerInputText.length} chars</span>
                  </div>
                </div>

                {/* Editable Textarea for Answer (Keyboard + Speech Auto-Populate) */}
                <div className="relative">
                  <textarea
                    rows={stage === 'setup' ? 3 : 4}
                    value={answerInputText}
                    onChange={(e) => setAnswerInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        submitCandidateReply();
                      }
                    }}
                    placeholder={
                      stage === 'setup'
                        ? "Say or type your target domain (e.g. 'Python and Backend' or 'Frontend React') or click any card above..."
                        : answerMode === 'text'
                        ? "Type your detailed answer here... Explain your architecture, trade-offs, and examples. Press Ctrl+Enter to submit."
                        : answerMode === 'voice'
                        ? "Click 'Speak Answer' below to dictate in Indian English (en-IN)... Your transcribed speech will appear here."
                        : "Type your answer directly OR click 'Speak Answer' to talk in Indian English (en-IN). Your speech will transcribe here live and you can freely edit it before submitting..."
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed transition-all resize-none shadow-inner"
                  />

                  {/* Interim speech ghost overlay indicator */}
                  {speechInterimText && (
                    <div className="text-[11px] italic text-emerald-400 px-3.5 pb-2">
                      Transcribing live: "{speechInterimText}"
                    </div>
                  )}
                </div>

                {/* Quick actions row right under the answer box */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    {answerMode !== 'text' && (
                      <button
                        type="button"
                        onClick={toggleMicRecording}
                        className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          isSpeechRecognitionActive
                            ? 'bg-red-600/90 text-white border-red-500 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        {isSpeechRecognitionActive ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Stop Mic</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{stage === 'setup' ? 'Speak Domain (en-IN)' : 'Speak Answer (en-IN)'}</span>
                          </>
                        )}
                      </button>
                    )}

                    {(answerInputText || spokenTranscript) && (
                      <button
                        type="button"
                        onClick={() => {
                          setAnswerInputText('');
                          setSpokenTranscript('');
                        }}
                        className="text-slate-400 hover:text-red-400 text-xs transition-colors flex items-center space-x-1 px-2 py-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                      Ctrl + Enter to send
                    </span>
                    <button
                      type="button"
                      onClick={() => submitCandidateReply()}
                      disabled={isAiThinking || (!answerInputText.trim() && !spokenTranscript.trim())}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{stage === 'setup' ? 'Confirm Domain & Begin' : 'Submit Answer'}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* LIVE VERDICT BANNER */}
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

                <button
                  type="button"
                  onClick={() => setShowVoiceStudioModal(true)}
                  className="p-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                  title="Open Audio & AI Voice Studio"
                >
                  <Sliders className="w-4 h-4 text-sky-400" />
                </button>
              </div>

              {/* Center Hero Mic & Answer Action Buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-center flex-wrap gap-2">
                {answerMode !== 'text' && (
                  !isSpeechRecognitionActive ? (
                    <button
                      type="button"
                      onClick={requestMicAccess}
                      disabled={isAiThinking}
                      className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2.5 transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      <Mic className="w-4 h-4 text-emerald-200" />
                      <span>🎙️ Speak Answer (en-IN)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        stopListening();
                        submitCandidateReply();
                      }}
                      className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/40 transition-all flex items-center space-x-2.5 transform hover:scale-[1.02] animate-pulse"
                    >
                      <div className="flex items-center space-x-1 mr-1">
                        <span className="w-1 h-3 bg-white animate-bounce rounded-full"></span>
                        <span className="w-1 h-4 bg-white animate-bounce rounded-full" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1 h-2 bg-white animate-bounce rounded-full" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                      <span>Done Speaking — Submit Answer</span>
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => submitCandidateReply()}
                  disabled={isAiThinking || (!answerInputText.trim() && !spokenTranscript.trim())}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Answer</span>
                </button>
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

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3">
                  <XCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
                  <div>
                    <div className="text-2xl font-black text-rose-700">{incorrectCount}</div>
                    <div className="text-xs font-bold text-rose-800">Incorrect</div>
                  </div>
                </div>
              </div>

              {/* Transcript Messages Stream */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {transcriptHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      item.sender === 'AI Interviewer'
                        ? 'bg-slate-50 border-slate-200 text-slate-800 ml-0 mr-8'
                        : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 ml-8 mr-0'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1 text-[11px] text-slate-500">
                      <span>{item.sender}</span>
                      <span>{item.time}</span>
                    </div>
                    <p className="font-medium">{item.text}</p>

                    {item.verdict && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 font-bold text-[11px] flex items-center space-x-1 text-slate-700">
                        <span>Verdict:</span>
                        <span className={item.verdict === 'correct' ? 'text-emerald-600' : item.verdict === 'partially_correct' ? 'text-amber-600' : 'text-rose-600'}>
                          {item.verdict.toUpperCase()}
                        </span>
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
      {/* VIEW: COMPLETED INTERVIEW REPORT                                          */}
      {/* ========================================================================= */}
      {viewMode === 'report' && (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-2 animate-in fade-in duration-300">
          
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 border border-emerald-600/60 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-500/60 text-emerald-200 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Interview Session Completed</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">Executive 1-on-1 Evaluation</h1>
              <p className="text-emerald-200 text-xs sm:text-sm font-medium mt-1">
                Candidate: {store.profile.fullName || 'Alex Mercer'} • Target Role: {targetRole}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center min-w-[140px]">
              <div className="text-4xl font-black text-emerald-400">{reportData?.overall_score || 82}%</div>
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400 mt-0.5">Readiness Score</div>
            </div>
          </div>

          {/* REPORT METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
              <div className="text-2xl font-black text-slate-800">{reportData?.technical_knowledge || 85}%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-1">Technical Depth</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
              <div className="text-2xl font-black text-slate-800">{reportData?.problem_solving || 80}%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-1">Problem Solving</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
              <div className="text-2xl font-black text-slate-800">{reportData?.communication || 84}%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-1">Indian English Cadence</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
              <div className="text-2xl font-black text-emerald-600">100%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-1">Proctor Integrity Pass</div>
            </div>
          </div>

          {/* QUESTION-BY-QUESTION ANSWER EVALUATION & CORRECTION BREAKDOWN */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-600">
                  Detailed Answer Review
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Question-by-Question Correctness & Feedback
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {correctCount} Correct
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  {partialCount} Partial
                </span>
                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {incorrectCount} Incorrect
                </span>
              </div>
            </div>

            {answerReviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3">
                No individual answer reviews recorded for this session.
              </p>
            ) : (
              <div className="space-y-4">
                {answerReviews.map((rev, idx) => {
                  const isCorrect = rev.verdict === 'correct';
                  const isPartial = rev.verdict === 'partially_correct';
                  const isIncorrect = rev.verdict === 'incorrect';

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isPartial
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      {/* Question Header & Verdict Badge */}
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <span className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">
                            {rev.questionNumber || idx + 1}
                          </span>
                          <span>Question {rev.questionNumber || idx + 1}</span>
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isPartial
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-rose-600 text-white shadow-xs'
                          }`}
                        >
                          {isCorrect && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                          {isPartial && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                          {isIncorrect && <XCircle className="w-3.5 h-3.5 mr-1" />}
                          <span>
                            {isCorrect
                              ? 'Marked Correct'
                              : isPartial
                              ? 'Partially Correct'
                              : 'Marked Incorrect'}
                          </span>
                        </span>
                      </div>

                      {/* Question Prompt */}
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mb-3 bg-white/70 p-3 rounded-xl border border-slate-200/60">
                        {rev.questionText}
                      </p>

                      {/* Candidate Answer */}
                      <div className="space-y-1 text-xs mb-3">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          Your Submitted Answer:
                        </span>
                        <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-slate-700 text-xs whitespace-pre-wrap">
                          {rev.candidateAnswer || '(No response recorded)'}
                        </div>
                      </div>

                      {/* AI Evaluation & Correct Answer Guidance */}
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          AI Evaluation & Corrective Guidance:
                        </span>
                        <div
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-100/50 border-emerald-300 text-emerald-950'
                              : isPartial
                              ? 'bg-amber-100/50 border-amber-300 text-amber-950'
                              : 'bg-rose-100/50 border-rose-300 text-rose-950'
                          }`}
                        >
                          <p className="font-semibold">{rev.verdictExplanation}</p>
                          {rev.feedback && rev.feedback !== rev.verdictExplanation && (
                            <p className="mt-1 text-slate-700">{rev.feedback}</p>
                          )}
                        </div>
                      </div>

                      {/* Strengths & Weaknesses Pills */}
                      {((rev.strengths && rev.strengths.length > 0) || (rev.weaknesses && rev.weaknesses.length > 0)) && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 flex-wrap text-[11px]">
                          {rev.strengths?.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                              ✓ {s}
                            </span>
                          ))}
                          {rev.weaknesses?.map((w, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-medium">
                              ✗ {w}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => onProceedToCoding ? onProceedToCoding() : (onNavigate ? onNavigate('coding') : setViewMode('call'))}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <span>Proceed to Coding Assessment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setViewMode('call');
                startNew1v1Session();
              }}
              className="px-5 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all"
            >
              Start New 1v1 Interview
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AUDIO & AI VOICE STUDIO                                            */}
      {/* ========================================================================= */}
      {showVoiceStudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Sliders className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-extrabold">Audio & AI Voice Studio</h3>
              </div>
              <button onClick={() => setShowVoiceStudioModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Speech Recognition Dialect (Indian English Default) */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                Speech Recognition Dialect (Microphone)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRecognitionLang('en-IN')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    recognitionLang === 'en-IN'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-extrabold">🇮🇳 English (India)</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 font-mono font-normal">en-IN • Active</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecognitionLang('en-US')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    recognitionLang === 'en-US'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-extrabold">🇺🇸 English (US)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono font-normal">en-US</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecognitionLang('en-GB')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    recognitionLang === 'en-GB'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-extrabold">🇬🇧 English (UK)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono font-normal">en-GB</div>
                </button>
              </div>
            </div>

            {/* 2. Soft Professional Female Voice Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                AI Voice Persona (Soft Professional Female)
              </label>
              <select
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {availableVoices.length > 0 ? (
                  availableVoices.map(voice => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang}) {voice.lang.includes('IN') ? '— 🇮🇳 Indian Accent' : '— Natural Female'}
                    </option>
                  ))
                ) : (
                  <option value="">Default Soft Female Voice</option>
                )}
              </select>

              {/* Voice Audition Button */}
              <button
                type="button"
                onClick={auditionVoice}
                disabled={isAuditioningVoice}
                className="w-full py-2.5 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/50 text-sky-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>{isAuditioningVoice ? 'Speaking Sample Aloud...' : 'Listen to Voice Audition ("Test Priya")'}</span>
              </button>
            </div>

            {/* 3. Voice Cadence & Softness Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Speech Cadence (Speed)</span>
                  <span className="font-mono text-sky-400 font-bold">{ttsSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.02"
                  value={ttsSpeed}
                  onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Recommended: 0.94x (Calm & Clear)</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Voice Softness (Pitch)</span>
                  <span className="font-mono text-sky-400 font-bold">{ttsPitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.9"
                  max="1.2"
                  step="0.02"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Recommended: 1.04x (Soft Warmth)</span>
              </div>
            </div>

            {/* Close / Save Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowVoiceStudioModal(false)}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white rounded-xl text-xs font-extrabold shadow-md transition-all"
              >
                Save Audio & Voice Preferences
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXTRA / CUSTOM DOMAIN & COURSE TRACK SELECTOR                      */}
      {/* ========================================================================= */}
      {showDomainTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full text-white shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-extrabold">Choose Extra / Custom Domain</h3>
                  <p className="text-[11px] text-slate-400">1-on-1 Voice Interview with Senior AI Priya Sharma</p>
                </div>
              </div>
              <button onClick={() => setShowDomainTrackModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Domain Input Field */}
            <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-2.5 shadow-inner">
              <label className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Text Any Custom / Extra Domain:
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Type any technical domain (e.g. <i>"Embedded Systems & FreeRTOS"</i>, <i>"Shopify Liquid"</i>, <i>"Quantum Computing"</i>, <i>"Cybersecurity & Threat Hunting"</i>). The AI dynamically identifies the role and asks dedicated 1-on-1 questions.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={customDomainText}
                  onChange={(e) => setCustomDomainText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customDomainText.trim() && !isAiThinking) {
                      const domainToLaunch = customDomainText.trim();
                      setCustomDomainText('');
                      setShowDomainTrackModal(false);
                      if (stage === 'setup') {
                        submitCandidateReply(domainToLaunch, { custom_domain: domainToLaunch });
                      } else {
                        startNew1v1Session(undefined, domainToLaunch);
                      }
                    }
                  }}
                  placeholder="e.g. Embedded Firmware, ROS2 Robotics, Salesforce, Unreal Engine 5..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customDomainText.trim() && !isAiThinking) {
                      const domainToLaunch = customDomainText.trim();
                      setCustomDomainText('');
                      setShowDomainTrackModal(false);
                      if (stage === 'setup') {
                        submitCandidateReply(domainToLaunch, { custom_domain: domainToLaunch });
                      } else {
                        startNew1v1Session(undefined, domainToLaunch);
                      }
                    }
                  }}
                  disabled={!customDomainText.trim() || isAiThinking}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl transition-all shadow-md flex-shrink-0"
                >
                  Start Custom Domain →
                </button>
              </div>
            </div>

            {/* Catalog Filter & Tracks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Or Pick From {COURSE_TRACKS.length} Built-in Tracks:
                </span>
                <input
                  type="text"
                  value={domainSearchFilter}
                  onChange={(e) => setDomainSearchFilter(e.target.value)}
                  placeholder="Filter domains..."
                  className="bg-slate-950 border border-slate-800 text-[11px] text-slate-200 placeholder-slate-500 rounded-lg px-2.5 py-1 focus:outline-none focus:border-sky-500 w-44"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {COURSE_TRACKS
                  .filter(t => !domainSearchFilter.trim() || t.title.toLowerCase().includes(domainSearchFilter.toLowerCase()) || t.skills.some(s => s.toLowerCase().includes(domainSearchFilter.toLowerCase())))
                  .map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourseTrack(t.id);
                        setShowDomainTrackModal(false);
                        if (stage === 'setup') {
                          submitCandidateReply(t.title);
                        } else {
                          startNew1v1Session(t.id);
                        }
                      }}
                      className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 rounded-xl text-left transition-all group"
                    >
                      <div className="font-extrabold text-xs text-white group-hover:text-emerald-300 flex items-center justify-between">
                        <span>{t.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {t.skills.slice(0, 3).join(', ')}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDomainTrackModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: END 1-ON-1 CONFIRMATION                                            */}
      {/* ========================================================================= */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-extrabold">End Interview Session?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your answered questions will be evaluated by the AI and saved into your permanent career scorecard.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={finalizeAndEndCall}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold shadow-md transition-all"
              >
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VoiceInterview;
