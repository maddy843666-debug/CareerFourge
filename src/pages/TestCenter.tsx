import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Terminal, Cpu, Database, Server, Layout } from 'lucide-react';

export const TestCenter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'report' | 'issues' | 'mcp'>('summary');

  const fetchLatestResults = async () => {
    try {
      const res = await fetch('/api/v1/test/latest');
      if (res.ok) {
        const data = await res.json();
        if (data.status !== 'no_runs_yet') {
          setTestResults(data);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch latest test results:", e);
    }
  };

  useEffect(() => {
    fetchLatestResults();
  }, []);

  const runTestScope = async (scope: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/test/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResults(data);
      }
    } catch (e) {
      console.error("Test execution failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PASS') {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-extrabold font-mono flex items-center">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PASS
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-lg text-xs font-extrabold font-mono flex items-center">
        <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" /> FAIL
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] font-sans text-[#0A192F] p-6 lg:p-8 space-y-6">

      {/* HEADER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#0A192F] text-[#FFDE59] rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A192F] flex items-center">
                CareerForge AI Test Center
                <span className="ml-3 px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold font-mono uppercase border border-sky-200">
                  MCP Agent
                </span>
              </h1>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Autonomous MCP testing engine verifying frontend routes, FastAPI endpoints, ChromaDB RAG, and Groq LLM grounding.
              </p>
            </div>
          </div>
        </div>

        {/* TEST RUNNER ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => runTestScope('full')}
            disabled={loading}
            className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin text-[#FFDE59]" /> : <Play className="w-4 h-4 mr-2 text-[#FFDE59]" />}
            Run Full Test Suite
          </button>
        </div>
      </div>

      {/* QUICK SCOPE CONTROLS */}
      <div className="flex items-center space-x-2 bg-white border border-[#E2E8F0] p-2 rounded-2xl text-xs font-semibold shadow-sm overflow-x-auto">
        <span className="text-[10px] text-[#64748B] font-bold uppercase px-3 font-mono">Scopes:</span>
        <button
          onClick={() => runTestScope('frontend')}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A192F] font-bold transition-colors flex items-center"
        >
          <Layout className="w-3.5 h-3.5 mr-1.5 text-sky-600" /> Test Frontend
        </button>
        <button
          onClick={() => runTestScope('api')}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A192F] font-bold transition-colors flex items-center"
        >
          <Server className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Test APIs
        </button>
        <button
          onClick={() => runTestScope('rag')}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A192F] font-bold transition-colors flex items-center"
        >
          <Database className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Test RAG
        </button>
        <button
          onClick={() => runTestScope('llm')}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A192F] font-bold transition-colors flex items-center"
        >
          <Cpu className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Test LLM
        </button>
        <button
          onClick={() => runTestScope('interview')}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A192F] font-bold transition-colors flex items-center"
        >
          <Terminal className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Test Interview
        </button>
      </div>

      {/* SUMMARY STATUS GRID */}
      {testResults && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block font-mono">Overall Status</span>
            <div className="flex justify-center pt-1">{getStatusBadge(testResults.overall_status || 'UNKNOWN')}</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block font-mono">Frontend Pages</span>
            <div className="text-base font-extrabold text-[#0A192F]">
              {testResults.frontend?.passed ?? 0} / {(testResults.frontend?.passed ?? 0) + (testResults.frontend?.failed ?? 0)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">PASS</span>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block font-mono">Backend APIs</span>
            <div className="text-base font-extrabold text-[#0A192F]">
              {testResults.backend?.passed ?? 0} / {(testResults.backend?.passed ?? 0) + (testResults.backend?.failed ?? 0)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">PASS</span>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block font-mono">ChromaDB RAG</span>
            <div className="flex justify-center pt-1">{getStatusBadge(testResults.rag?.status || 'UNKNOWN')}</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block font-mono">Groq LLM Engine</span>
            <div className="flex justify-center pt-1">{getStatusBadge(testResults.llm?.status || 'UNKNOWN')}</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block font-mono">AI Interview</span>
            <div className="flex justify-center pt-1">{getStatusBadge(testResults.interview?.status || 'UNKNOWN')}</div>
          </div>
        </div>
      )}

      {/* DETAILS VIEW TABS */}
      {testResults && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex border-b border-[#E2E8F0] space-x-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('summary')}
              className={`pb-3 border-b-2 transition-colors ${activeTab === 'summary' ? 'border-[#0A192F] text-[#0A192F]' : 'border-transparent text-[#64748B]'}`}
            >
              Test Summary & Evidence
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`pb-3 border-b-2 transition-colors ${activeTab === 'report' ? 'border-[#0A192F] text-[#0A192F]' : 'border-transparent text-[#64748B]'}`}
            >
              AI Executive Report
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`pb-3 border-b-2 transition-colors flex items-center ${activeTab === 'issues' ? 'border-[#0A192F] text-[#0A192F]' : 'border-transparent text-[#64748B]'}`}
            >
              Detected Issues ({testResults.issues?.length || 0})
            </button>
          </div>

          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-[#0A192F] flex items-center">
                    <Database className="w-4 h-4 mr-2 text-amber-600" /> RAG Pipeline Details
                  </h4>
                  <pre className="text-[11px] font-mono bg-white p-3 border border-slate-200 rounded-lg overflow-x-auto">
                    {JSON.stringify(testResults.rag, null, 2)}
                  </pre>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-[#0A192F] flex items-center">
                    <Cpu className="w-4 h-4 mr-2 text-purple-600" /> Groq LLM & Question Grounding
                  </h4>
                  <pre className="text-[11px] font-mono bg-white p-3 border border-slate-200 rounded-lg overflow-x-auto">
                    {JSON.stringify(testResults.llm, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-[#0A192F] flex items-center">
                  <Terminal className="w-4 h-4 mr-2 text-indigo-600" /> Full Adaptive Interview Session Evidence
                </h4>
                <pre className="text-[11px] font-mono bg-white p-3 border border-slate-200 rounded-lg overflow-x-auto">
                  {JSON.stringify(testResults.interview, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: AI EXECUTIVE REPORT */}
          {activeTab === 'report' && (
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed space-y-3 shadow-inner overflow-x-auto">
              <div className="text-amber-400 font-bold border-b border-slate-700 pb-2">=== AI TEST REPORT SYNTHESIZED BY GROQ LLM ===</div>
              <pre className="whitespace-pre-wrap font-mono">
                {typeof testResults.ai_report === 'string'
                  ? testResults.ai_report
                  : JSON.stringify(testResults.ai_report, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 3: ISSUES */}
          {activeTab === 'issues' && (
            <div className="space-y-3 text-xs">
              {(!testResults.issues || testResults.issues.length === 0) ? (
                <div className="p-6 text-center text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl font-bold">
                  ✓ No critical issues detected! All tested routes, APIs, RAG, and LLM features operated cleanly.
                </div>
              ) : (
                testResults.issues.map((issue: any, idx: number) => (
                  <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-900">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-red-800 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1.5 text-red-600" /> {issue.feature}
                      </span>
                      <span className="px-2 py-0.5 bg-red-200 text-red-900 rounded font-mono font-bold text-[10px]">
                        {issue.severity}
                      </span>
                    </div>
                    <p className="font-medium text-xs">{issue.problem}</p>
                    <div className="text-[11px] font-mono bg-white p-2.5 border border-red-200 rounded text-slate-800">
                      <strong>Evidence:</strong> {issue.evidence}
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* INITIAL NO RUNS PLACEHOLDER */}
      {!testResults && !loading && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <ShieldCheck className="w-12 h-12 text-[#0A192F] mx-auto opacity-40" />
          <h3 className="text-lg font-bold text-[#0A192F]">No Test Executions Recorded Yet</h3>
          <p className="text-xs text-[#64748B]">
            Click <strong>Run Full Test Suite</strong> above to launch the MCP Test Agent to verify frontend routes, FastAPI endpoints, ChromaDB RAG, and Groq LLM grounding.
          </p>
        </div>
      )}

    </div>
  );
};

export default TestCenter;
