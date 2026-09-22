import React, { useState } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles,
  ArrowRight, RefreshCw, BarChart2, Check, X, Info,
  Layers, Target, Award, ListChecks, FileCode
} from 'lucide-react';
import { api } from '../services/api';
import { ResumeAnalysisResponse } from '../types';
import { userStore } from '../services/userStore';

interface ResumeUploadProps {
  onProceed: () => void;
}

const SAMPLE_RESUME_TEXT = `Alex Mercer
alex.mercer@email.com | (555) 019-2831 | San Francisco, CA | github.com/alexmercer

SUMMARY
Driven Software Engineer with 3+ years of experience building scalable backend APIs, relational database models, and web applications using Python, SQL, and Java.

SKILLS
Programming: Python, SQL, Java, JavaScript, C++
Frameworks & Databases: FastAPI, Flask, MySQL, PostgreSQL, REST APIs
Tools & Platforms: Git, Linux, Postman, HTML/CSS

WORK EXPERIENCE
Junior Software Engineer | TechCorp Global | 2023 - Present
- Developed and maintained high-performance RESTful APIs in Python using FastAPI for microservices.
- Designed relational database schemas and optimized SQL queries in MySQL for user account management.
- Collaborated with cross-functional teams to debug server bottlenecks and improve software reliability.

Software Developer Intern | Innovate Labs | 2022 - 2023
- Implemented backend data validation pipelines in Python for web dashboard users.
- Created unit and integration test suites achieving 80%+ code coverage across API modules.

PROJECTS
Online Voting System (Java, MySQL)
- Built a secure digital voting web application incorporating double-vote prevention logic.
- Managed user authentication and SQL transactional safety under concurrent access.

Distributed Task Queue (Python, Redis)
- Developed an asynchronous background worker pool handling queued email and notification jobs.

EDUCATION
B.S. in Computer Science | University of California | 2019 - 2023`;

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onProceed }) => {
  const store = userStore.getSnapshot();
  const [inputMode, setInputMode] = useState<'upload' | 'text' | 'sample'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>(store.goal.targetRole || 'Software Engineer');
  const [jobDescription, setJobDescription] = useState<string>(store.goal.jobDescription || '');
  const [showJDEdit, setShowJDEdit] = useState<boolean>(false);

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'improvements' | 'keywords' | 'formatting' | 'projects'>('improvements');

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Read file content preview if plain text
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setResumeText(evt.target?.result as string || '');
        };
        reader.readAsText(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Run AI Resume Analysis
  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisProgress('Parsing document layout & section headers...');

    await new Promise((res) => setTimeout(res, 400));
    setAnalysisProgress('Extracting skill claims, technical stack & experience...');

    await new Promise((res) => setTimeout(res, 400));
    setAnalysisProgress(`Evaluating ATS compatibility out of 100 for "${targetRole}"...`);

    let textToAnalyze = resumeText;
    if (inputMode === 'sample' || !textToAnalyze.trim()) {
      textToAnalyze = SAMPLE_RESUME_TEXT;
    }

    try {
      const data = await api.uploadResume({
        file: selectedFile || undefined,
        rawText: textToAnalyze,
        targetRole,
        jobDescription
      });

      setAnalysisResult(data);

      // Sync with userStore
      userStore.saveOnboarding(
        store.profile,
        { ...store.goal, targetRole, jobDescription },
        data.matched_skills.map((s: string) => ({ skillName: s, claimedLevel: 'Advanced' as const })),
        selectedFile ? selectedFile.name : 'Parsed_Resume.pdf'
      );
      
      // Update ATS score in store
      if (data.overall_score || data.compatibility_score) {
        userStore.getSnapshot().atsResult.atsScore = Math.round(data.overall_score || data.compatibility_score);
        userStore.getSnapshot().atsResult.whatsWorking = data.whats_working || [];
        userStore.getSnapshot().atsResult.whatsMissing = data.whats_missing || [];
        userStore.recalculateAll();
      }
    } catch (err) {
      console.error('Resume Analysis Error:', err);
    } finally {
      setAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const score = Math.round(analysisResult?.overall_score || analysisResult?.compatibility_score || 78);

  const getScoreBadgeColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500 text-white';
    if (s >= 65) return 'bg-amber-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getScoreBorderColor = (s: number) => {
    if (s >= 80) return 'border-emerald-500 text-emerald-700 bg-emerald-50';
    if (s >= 65) return 'border-amber-500 text-amber-800 bg-amber-50';
    return 'border-red-500 text-red-700 bg-red-50';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-[#0A192F]">
      
      {/* PAGE HEADER */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0284C7] uppercase">
              CAREER & ATS TOOL
            </span>
            <span className="text-xs text-[#64748B] flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" /> AI Resume Analyzer
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] mt-1 tracking-tight">
            AI Resume Analyzer & ATS Checker
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Evaluate your resume out of 100, identify critical skill gaps, and get step-by-step actionable feedback to improve.
          </p>
        </div>

        {/* TARGET ROLE BADGE */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg text-xs space-y-1.5 w-full md:w-auto">
          <div className="flex items-center justify-between space-x-4">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase flex items-center">
              <Target className="w-3.5 h-3.5 mr-1 text-[#0284C7]" /> Target Role
            </span>
            <button 
              onClick={() => setShowJDEdit(!showJDEdit)}
              className="text-[11px] font-semibold text-[#0284C7] hover:underline"
            >
              {showJDEdit ? 'Close Edit' : 'Change Target Role'}
            </button>
          </div>
          <div className="font-bold text-[#0A192F] text-sm">
            {targetRole}
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE TARGET ROLE / JOB DESCRIPTION EDIT */}
      {showJDEdit && (
        <div className="bg-white rounded-xl border border-[#0284C7] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center">
            <Target className="w-4 h-4 text-[#0284C7] mr-1.5" /> Customize ATS Matching Criteria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#0A192F] block mb-1">Target Job Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer, Full Stack Developer, Data Scientist"
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#0A192F] block mb-1">Job Description (Optional)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={2}
                placeholder="Paste job description text to match custom keywords..."
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>
        </div>
      )}

      {/* RESUME INPUT & PARSING CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        
        {/* INPUT TABS */}
        <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold">
          <button
            onClick={() => setInputMode('upload')}
            className={`flex-1 py-3 px-4 text-center flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              inputMode === 'upload'
                ? 'border-[#0284C7] text-[#0284C7] bg-white font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume File</span>
          </button>

          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 py-3 px-4 text-center flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              inputMode === 'text'
                ? 'border-[#0284C7] text-[#0284C7] bg-white font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Resume Text</span>
          </button>

          <button
            onClick={() => {
              setInputMode('sample');
              setResumeText(SAMPLE_RESUME_TEXT);
            }}
            className={`flex-1 py-3 px-4 text-center flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              inputMode === 'sample'
                ? 'border-[#0284C7] text-[#0284C7] bg-white font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Load Sample Resume</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6 space-y-4">
          
          {inputMode === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0284C7] rounded-xl p-8 text-center bg-[#F8FAFC] transition-colors cursor-pointer space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A192F]">
                  {selectedFile ? selectedFile.name : 'Drag & drop your Resume PDF or DOCX here'}
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Supports PDF, DOCX, TXT formats up to 10MB
                </p>
              </div>
              <input
                type="file"
                id="resume-file-input"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="resume-file-input"
                className="inline-block px-4 py-2 bg-white border border-[#CBD5E1] hover:border-[#0284C7] text-[#0F172A] text-xs font-semibold rounded cursor-pointer transition-colors shadow-sm"
              >
                {selectedFile ? 'Change File' : 'Browse File from Computer'}
              </label>
            </div>
          )}

          {inputMode === 'text' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#0A192F]">Paste Raw Resume Content</span>
                <span className="text-[#64748B]">{resumeText.length} characters</span>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={8}
                placeholder="Paste your full resume text here (Summary, Work Experience, Skills, Projects, Education)..."
                className="w-full p-3 border border-[#CBD5E1] rounded-lg text-xs font-mono focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          )}

          {inputMode === 'sample' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs bg-[#FEF08A]/30 p-2.5 rounded border border-[#FEF08A] text-[#854D0E]">
                <span className="font-semibold flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" /> Loaded Demo Software Engineer Resume
                </span>
                <span>Ready for instant AI evaluation</span>
              </div>
              <pre className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] font-mono text-[#334155] max-h-48 overflow-y-auto whitespace-pre-wrap">
                {SAMPLE_RESUME_TEXT}
              </pre>
            </div>
          )}

          {/* ACTION TRIGGER BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              onClick={runAnalysis}
              disabled={analyzing || (inputMode === 'upload' && !selectedFile && !resumeText)}
              className={`px-6 py-3 rounded-lg text-xs font-bold text-white flex items-center space-x-2 shadow-sm transition-all ${
                analyzing || (inputMode === 'upload' && !selectedFile && !resumeText)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0A192F] hover:bg-[#112240] cursor-pointer'
              }`}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FFDE59]" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFDE59]" />
                  <span>Analyze Resume Out of 100</span>
                </>
              )}
            </button>
          </div>

          {/* ANALYZING PROGRESS BANNER */}
          {analyzing && (
            <div className="bg-[#E0F2FE] border border-[#38BDF8] p-4 rounded-lg text-xs text-[#0369A1] flex items-center space-x-3 animate-pulse">
              <RefreshCw className="w-5 h-5 animate-spin shrink-0 text-[#0284C7]" />
              <span className="font-semibold">{analysisProgress}</span>
            </div>
          )}

        </div>
      </div>

      {/* ANALYSIS RESULTS SECTION */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* MAIN SCORE CARD (OUT OF 100) */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#E2E8F0]">
              
              {/* SCORE DISPLAY */}
              <div className="flex items-center space-x-5">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-md shrink-0 ${getScoreBadgeColor(score)}`}>
                  <span className="text-3xl font-extrabold leading-none">{score}</span>
                  <span className="text-[10px] font-mono opacity-90 mt-0.5">/ 100</span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreBorderColor(score)}`}>
                      {analysisResult.match_grade || (score >= 80 ? 'Excellent Match' : 'Good Alignment')}
                    </span>
                    <span className="text-xs text-[#64748B] font-mono">
                      Target Role: <strong>{targetRole}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#0A192F] mt-1">
                    Overall ATS Resume Evaluation
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5 max-w-xl">
                    {analysisResult.experience_summary || 'Evaluated against core technical requirements, keywords, impact formatting, and ATS parser readability.'}
                  </p>
                </div>
              </div>

              {/* NEXT ACTION BUTTON */}
              <button
                onClick={onProceed}
                className="px-5 py-3 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-bold flex items-center space-x-2 shrink-0 transition-colors shadow-sm"
              >
                <span>Proceed to Skill Truth Profile</span>
                <ArrowRight className="w-4 h-4 text-[#FFDE59]" />
              </button>
            </div>

            {/* 4 CATEGORY BREAKDOWN CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#64748B] flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-[#0284C7]" /> Formatting & ATS
                  </span>
                  <span className="font-extrabold text-[#0A192F]">
                    {analysisResult.category_scores?.formatting_readability || 84}%
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0284C7] h-full transition-all duration-500" 
                    style={{ width: `${analysisResult.category_scores?.formatting_readability || 84}%` }} 
                  />
                </div>
                <p className="text-[10px] text-[#64748B]">Clean OCR structure & headers</p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#64748B] flex items-center">
                    <Target className="w-3.5 h-3.5 mr-1 text-[#0284C7]" /> Keywords Coverage
                  </span>
                  <span className="font-extrabold text-[#0A192F]">
                    {analysisResult.category_scores?.keyword_coverage || 76}%
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0284C7] h-full transition-all duration-500" 
                    style={{ width: `${analysisResult.category_scores?.keyword_coverage || 76}%` }} 
                  />
                </div>
                <p className="text-[10px] text-[#64748B]">Matched {analysisResult.matched_skills.length} target role skills</p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#64748B] flex items-center">
                    <BarChart2 className="w-3.5 h-3.5 mr-1 text-[#0284C7]" /> Experience Impact
                  </span>
                  <span className="font-extrabold text-[#0A192F]">
                    {analysisResult.category_scores?.experience_impact || 68}%
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    style={{ width: `${analysisResult.category_scores?.experience_impact || 68}%` }} 
                  />
                </div>
                <p className="text-[10px] text-[#64748B]">Quantified metrics & action verbs</p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#64748B] flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1 text-[#0284C7]" /> Project Relevance
                  </span>
                  <span className="font-extrabold text-[#0A192F]">
                    {analysisResult.category_scores?.project_relevance || 82}%
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0284C7] h-full transition-all duration-500" 
                    style={{ width: `${analysisResult.category_scores?.project_relevance || 82}%` }} 
                  />
                </div>
                <p className="text-[10px] text-[#64748B]">Practical technical evidence</p>
              </div>

            </div>

          </div>

          {/* REPORT DETAILS TABS */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden space-y-6 p-6">
            
            {/* SUB-TABS NAVIGATION */}
            <div className="flex border-b border-[#E2E8F0] text-xs font-semibold space-x-6">
              <button
                onClick={() => setActiveTab('improvements')}
                className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'improvements'
                    ? 'border-[#0284C7] text-[#0284C7] font-bold'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                <span>What to Improve (Action Plan)</span>
              </button>

              <button
                onClick={() => setActiveTab('keywords')}
                className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'keywords'
                    ? 'border-[#0284C7] text-[#0284C7] font-bold'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Keywords & Skill Match</span>
              </button>

              <button
                onClick={() => setActiveTab('formatting')}
                className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'formatting'
                    ? 'border-[#0284C7] text-[#0284C7] font-bold'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Formatting & Structure</span>
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'projects'
                    ? 'border-[#0284C7] text-[#0284C7] font-bold'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Parsed Projects</span>
              </button>
            </div>

            {/* TAB 1: WHAT TO IMPROVE & WHAT'S WORKING */}
            {activeTab === 'improvements' && (
              <div className="space-y-6">
                
                {/* 2-COLUMN GRID: STRENGTHS vs CRITICAL IMPROVEMENTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* WHAT'S WORKING */}
                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5 space-y-3">
                    <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider block flex items-center border-b border-[#BBF7D0] pb-2">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                      WHAT'S WORKING (STRENGTHS)
                    </span>
                    <ul className="space-y-2 text-xs text-[#0A192F]">
                      {(analysisResult.whats_working && analysisResult.whats_working.length > 0
                        ? analysisResult.whats_working
                        : [
                            "Strong core Python and SQL technical skills",
                            "Clear software project entries with tech stack tags",
                            "Standard section headers readable by ATS software"
                          ]
                      ).map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mr-2 mt-0.5" />
                          <span className="text-emerald-950 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* WHAT'S MISSING / NEEDS IMPROVEMENT */}
                  <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-5 space-y-3">
                    <span className="text-xs font-mono font-bold text-red-800 uppercase tracking-wider block flex items-center border-b border-[#FCA5A5] pb-2">
                      <AlertCircle className="w-4 h-4 mr-1.5 text-red-600" />
                      WHAT NEEDS IMPROVEMENT (GAPS)
                    </span>
                    <ul className="space-y-2 text-xs text-[#0A192F]">
                      {(analysisResult.whats_missing && analysisResult.whats_missing.length > 0
                        ? analysisResult.whats_missing
                        : [
                            "Lacks quantified achievement metrics (%, $, scale)",
                            "Missing System Design and Docker keywords",
                            "Bullet points use passive verbs instead of impact action verbs"
                          ]
                      ).map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <X className="w-4 h-4 text-red-600 shrink-0 mr-2 mt-0.5" />
                          <span className="text-red-950 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* STEP-BY-STEP ACTIONABLE IMPROVEMENT PLAN */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <div className="border-b border-[#E2E8F0] pb-3">
                    <h3 className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider flex items-center">
                      <Award className="w-4 h-4 mr-1.5 text-[#0284C7]" />
                      ACTIONABLE STEPS TO REACH 95+ ATS SCORE
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Follow these concrete steps to optimize your resume for recruiter ATS screeners.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(analysisResult.actionable_improvements && analysisResult.actionable_improvements.length > 0
                      ? analysisResult.actionable_improvements
                      : [
                          "Quantify Project Results: Add metrics to experience bullets (e.g., 'Reduced query latency by 35% through SQL index tuning').",
                          "Incorporate Missing ATS Keywords: Add 'System Design', 'Docker', 'Redis', and 'AWS' into your technical skills section.",
                          "Elevate Action Verbs: Begin bullet points with strong action verbs like 'Engineered', 'Architected', 'Optimized', and 'Streamlined'.",
                          "Add Live Demos & Code Links: Provide clickable URLs for your projects (GitHub, live web apps, or published papers).",
                          "Tailor Summary Statement: Craft a 2-sentence header summary aligned directly to target job requirements."
                        ]
                    ).map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-[#E2E8F0]">
                        <span className="w-6 h-6 rounded-full bg-[#0A192F] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-[#0A192F] font-medium pt-0.5 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: KEYWORDS & SKILL MATCH */}
            {activeTab === 'keywords' && (
              <div className="space-y-6">
                
                {/* MATCHED SKILLS */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                    MATCHED TECHNICAL SKILLS ({analysisResult.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.matched_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* MISSING SKILLS */}
                <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-wider block">
                    RECOMMENDED / MISSING ATS KEYWORDS FOR {targetRole.toUpperCase()} ({analysisResult.missing_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missing_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#64748B] pt-1">
                    Tip: Add these missing technical keywords to your skills section and project bullet points to pass automated ATS filters.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 3: FORMATTING & STRUCTURE */}
            {activeTab === 'formatting' && (
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#E2E8F0] pb-2">
                  ATS PARSER & FORMATTING FEEDBACK
                </span>
                <div className="space-y-3">
                  {(analysisResult.formatting_feedback && analysisResult.formatting_feedback.length > 0
                    ? analysisResult.formatting_feedback
                    : [
                        "Use the Google X-Y-Z bullet format: 'Accomplished X, measured by Y, by doing Z'.",
                        "Maintain standard 10pt-12pt font sizes to ensure high ATS OCR accuracy.",
                        "Include direct hyperlinks to your GitHub repositories and live project demos."
                      ]
                  ).map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex items-start space-x-3">
                      <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                      <span className="text-[#0A192F] font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PARSED PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider block border-b border-[#E2E8F0] pb-2">
                  PARSED PROJECTS & TECHNICAL CLAIMS ({analysisResult.extracted_projects?.length || 0})
                </span>
                <div className="space-y-3">
                  {(analysisResult.extracted_projects || []).map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#0A192F] text-sm">{proj.title}</span>
                        <div className="flex space-x-1.5">
                          {proj.tech.map((t, tidx) => (
                            <span key={tidx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-[#CBD5E1] text-[#334155]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[#64748B]">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* FOOTER ACTION BAR */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                setAnalysisResult(null);
                setSelectedFile(null);
                setResumeText('');
              }}
              className="px-4 py-2 rounded border border-[#CBD5E1] hover:bg-white text-xs font-semibold text-[#0A192F] transition-colors"
            >
              Analyze Another Resume
            </button>

            <button
              onClick={onProceed}
              className="px-6 py-3 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-colors"
            >
              <span>Open Skill Truth Profile</span>
              <ArrowRight className="w-4 h-4 text-[#FFDE59]" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
