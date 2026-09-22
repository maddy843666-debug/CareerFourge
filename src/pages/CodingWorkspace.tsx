import React, { useState } from 'react';
import {
  Play, Send, RotateCcw, Clock, ArrowRight, CheckCircle2, AlertCircle,
  Code, FileText, Lightbulb, History, Copy, ChevronRight, Terminal, BookOpen
} from 'lucide-react';
import { CodingEvaluation } from '../types';
import { api } from '../services/api';
import { userStore } from '../services/userStore';

interface CodingWorkspaceProps {
  onProceedToSQL: () => void;
}

const PROBLEMS = [
  {
    id: 'rotated-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Algorithms & Binary Search',
    description: `Given a rotated sorted integer array \`nums\` and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`. You must write an algorithm with $O(\\log N)$ runtime complexity.`,
    examples: [
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 0',
        output: '4',
        explanation: '0 is located at index 4 in the rotated array.'
      },
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 3',
        output: '-1',
        explanation: '3 is not present in the array.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      'nums is guaranteed to be rotated at some pivot index.'
    ],
    starterCode: {
      python: `def search_rotated(nums: list[int], target: int) -> int:
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1`,
      javascript: `function searchRotated(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (nums[mid] === target) return mid;
        if (nums[low] <= nums[mid]) {
            if (nums[low] <= target && target < nums[mid]) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[high]) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }
    return -1;
}`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                else low = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                else high = mid - 1;
            }
        }
        return -1;
    }
}`
    }
  },
  {
    id: 'two-sum',
    title: 'Two Sum II - Input Array Is Sorted',
    difficulty: 'Easy',
    category: 'Two Pointers',
    description: `Given a 1-indexed array of integers \`numbers\` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific \`target\` number.`,
    examples: [
      {
        input: 'numbers = [2,7,11,15], target = 9',
        output: '[1,2]',
        explanation: 'The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2.'
      }
    ],
    constraints: [
      '2 <= numbers.length <= 3 * 10^4',
      '-1000 <= numbers[i] <= 1000'
    ],
    starterCode: {
      python: `def two_sum(numbers: list[int], target: int) -> list[int]:
    l, r = 0, len(numbers) - 1
    while l < r:
        curr = numbers[l] + numbers[r]
        if curr == target:
            return [l + 1, r + 1]
        elif curr < target:
            l += 1
        else:
            r -= 1
    return []`,
      javascript: `function twoSum(numbers, target) {
    let l = 0, r = numbers.length - 1;
    while (l < r) {
        let sum = numbers[l] + numbers[r];
        if (sum === target) return [l + 1, r + 1];
        if (sum < target) l++;
        else r--;
    }
    return [];
}`,
      java: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int l = 0, r = numbers.length - 1;
        while (l < r) {
            int sum = numbers[l] + numbers[r];
            if (sum == target) return new int[]{l + 1, r + 1};
            if (sum < target) l++; else r--;
        }
        return new int[]{};
    }
}`
    }
  }
];

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({ onProceedToSQL }) => {
  const [selectedProblemId, setSelectedProblemId] = useState('rotated-array');
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java'>('python');
  
  const currentProblem = PROBLEMS.find(p => p.id === selectedProblemId) || PROBLEMS[0];
  
  const [code, setCode] = useState(currentProblem.starterCode[language]);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'editorial' | 'submissions'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CodingEvaluation | null>(null);
  const [submissionsHistory, setSubmissionsHistory] = useState<Array<{ id: number; status: string; runtime: string; memory: string; time: string }>>([]);

  const handleLanguageChange = (newLang: 'python' | 'javascript' | 'java') => {
    setLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
  };

  const handleProblemChange = (probId: string) => {
    setSelectedProblemId(probId);
    const prob = PROBLEMS.find(p => p.id === probId) || PROBLEMS[0];
    setCode(prob.starterCode[language]);
    setResult(null);
  };

  const handleResetCode = () => {
    setCode(currentProblem.starterCode[language]);
    setResult(null);
  };

  const handleRunCode = async () => {
    setRunning(true);
    const res = await api.submitCode(code);
    setResult(res);
    setActiveConsoleTab('result');
    setRunning(false);

    // Record submission
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSubmissionsHistory(prev => [
      {
        id: Date.now(),
        status: res.passed_tests === res.total_tests ? 'Accepted' : 'Wrong Answer',
        runtime: '38 ms',
        memory: '16.2 MB',
        time: nowStr
      },
      ...prev
    ]);

    userStore.submitAssessmentResult('coding-assessment', 'technical', res.passed_tests === res.total_tests ? 95 : 65);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0A192F]">

      {/* TOP HEADER BAR */}
      <div className="px-6 py-3 bg-white border-b border-[#E2E8F0] flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-sky-600" />
            <span className="font-extrabold text-[#0A192F] text-sm">CareerForge IDE</span>
          </div>

          <span className="text-[#E2E8F0]">|</span>

          {/* PROBLEM SELECTOR DROPDOWN */}
          <select
            value={selectedProblemId}
            onChange={(e) => handleProblemChange(e.target.value)}
            className="px-3 py-1.5 border border-[#E2E8F0] rounded-xl bg-slate-50 text-xs font-bold text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
          >
            {PROBLEMS.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            currentProblem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
          }`}>
            {currentProblem.difficulty}
          </span>
        </div>

        {/* TOP RIGHT LANGUAGE SELECTOR & ACTIONS */}
        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="px-3 py-1.5 border border-[#E2E8F0] rounded-xl bg-slate-50 text-xs font-semibold text-[#0A192F] focus:outline-none"
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="java">Java 17</option>
          </select>

          <button
            onClick={handleResetCode}
            className="p-2 border border-[#E2E8F0] hover:bg-slate-100 rounded-xl text-[#64748B] transition-colors"
            title="Reset to Starter Code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onProceedToSQL}
            className="px-4 py-2 bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-bold rounded-xl transition-all flex items-center shadow-sm"
          >
            <span>Open SQL Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
          </button>
        </div>
      </div>

      {/* MAIN SPLIT-PANE WORKSPACE (2 COLUMNS) */}
      <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT PANE: TABBED PROBLEM DESCRIPTION & HINTS (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-[750px]">
          
          {/* TAB HEADER */}
          <div className="flex items-center border-b border-[#E2E8F0] bg-slate-50/50 px-4 text-xs font-semibold">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center space-x-1.5 ${
                activeLeftTab === 'description' ? 'border-[#0A192F] text-[#0A192F]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('editorial')}
              className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center space-x-1.5 ${
                activeLeftTab === 'editorial' ? 'border-[#0A192F] text-[#0A192F]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Editorial & Hints</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center space-x-1.5 ${
                activeLeftTab === 'submissions' ? 'border-[#0A192F] text-[#0A192F]' : 'border-transparent text-[#64748B] hover:text-[#0A192F]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions ({submissionsHistory.length})</span>
            </button>
          </div>

          {/* TAB 1: DESCRIPTION */}
          {activeLeftTab === 'description' && (
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#0A192F] font-sans flex-1">
              <div>
                <span className="text-[10px] font-mono text-sky-600 font-bold uppercase tracking-wider block mb-1">
                  {currentProblem.category}
                </span>
                <h2 className="text-xl font-extrabold text-[#0A192F]">{currentProblem.title}</h2>
              </div>

              <div className="space-y-3 leading-relaxed text-[#334155]">
                <p>{currentProblem.description}</p>
              </div>

              {/* EXAMPLES */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-[#0A192F] text-xs font-mono uppercase">Examples</h3>
                {currentProblem.examples.map((ex, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2 font-mono text-[11px]">
                    <div className="text-[#64748B]">
                      <strong className="text-[#0A192F]">Input:</strong> {ex.input}
                    </div>
                    <div className="text-[#64748B]">
                      <strong className="text-[#0A192F]">Output:</strong> {ex.output}
                    </div>
                    {ex.explanation && (
                      <div className="text-[#64748B] text-[10px] pt-1 border-t border-slate-200">
                        <strong className="text-[#0A192F]">Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CONSTRAINTS */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-[#0A192F] text-xs font-mono uppercase">Constraints</h3>
                <ul className="space-y-1.5 font-mono text-[11px] text-[#64748B]">
                  {currentProblem.constraints.map((c, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: EDITORIAL & HINTS */}
          {activeLeftTab === 'editorial' && (
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#0A192F] font-sans flex-1">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                <h4 className="font-bold text-xs flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1.5 text-amber-600" /> Key Insights & Approach
                </h4>
                <p className="text-[11px] leading-relaxed">
                  Notice that in a rotated sorted array, at least one half (left or right of mid) is guaranteed to be strictly sorted.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-[#0A192F]">Binary Search Algorithm Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-[#475569] leading-relaxed">
                  <li>Find the middle index <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">mid = (low + high) // 2</code>.</li>
                  <li>Check if <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">nums[mid] == target</code>. If true, return <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">mid</code>.</li>
                  <li>Determine whether the left half <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">nums[low] &lt;= nums[mid]</code> is sorted:</li>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-[11px]">
                    <li>If target lies within <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">[nums[low], nums[mid])</code>, search left half.</li>
                    <li>Otherwise, search right half.</li>
                  </ul>
                  <li>If right half is sorted, apply symmetric logic.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: SUBMISSIONS HISTORY */}
          {activeLeftTab === 'submissions' && (
            <div className="p-6 overflow-y-auto space-y-3 text-xs flex-1">
              {submissionsHistory.length === 0 ? (
                <div className="text-center py-12 text-[#64748B]">
                  No code submissions yet. Click "Run Code" or "Submit Solution".
                </div>
              ) : (
                submissionsHistory.map((sub) => (
                  <div key={sub.id} className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl flex justify-between items-center font-mono">
                    <div>
                      <span className={`font-bold text-xs block ${
                        sub.status === 'Accepted' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {sub.status}
                      </span>
                      <span className="text-[10px] text-[#64748B]">{sub.time}</span>
                    </div>
                    <div className="text-right text-[11px] text-[#0A192F]">
                      <div>Runtime: {sub.runtime}</div>
                      <div>Memory: {sub.memory}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* RIGHT PANE: IDE EDITOR & OUTPUT CONSOLE (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">

          {/* CODE EDITOR CONTAINER */}
          <div className="bg-[#0B0F17] rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col h-[460px]">
            {/* Editor Top Bar */}
            <div className="px-5 py-3 bg-[#111827] border-b border-slate-800 flex justify-between items-center text-xs font-mono">
              <div className="flex items-center space-x-2 text-slate-300 font-bold">
                <Code className="w-4 h-4 text-sky-400" />
                <span>solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'java'}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                UTF-8 • {language.toUpperCase()}
              </div>
            </div>

            {/* Editor Textarea with Line Numbers Gutter */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs text-slate-100">
              {/* Line Numbers Gutter */}
              <div className="w-12 bg-[#0F172A]/50 py-4 text-right pr-3 select-none text-slate-600 font-mono text-xs border-r border-slate-800/80 space-y-1">
                {Array.from({ length: Math.max(16, code.split('\n').length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 p-4 bg-transparent text-slate-100 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-sky-500/30"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-5 py-3 bg-[#111827] border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Auto-formatting enabled</span>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 text-sky-400 fill-current" />
                  <span>{running ? 'Executing...' : 'Run Code'}</span>
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center shadow-md shadow-sky-600/30"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM CONSOLE PANEL (TESTCASE & RESULTS) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
            
            {/* CONSOLE TAB HEADER */}
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 text-xs font-bold">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`pb-1 transition-all flex items-center space-x-1.5 ${
                    activeConsoleTab === 'testcase' ? 'text-[#0A192F] border-b-2 border-[#0A192F]' : 'text-[#64748B]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Testcases</span>
                </button>
                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`pb-1 transition-all flex items-center space-x-1.5 ${
                    activeConsoleTab === 'result' ? 'text-[#0A192F] border-b-2 border-[#0A192F]' : 'text-[#64748B]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Execution Result</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: TESTCASE */}
            {activeConsoleTab === 'testcase' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
                  <div className="text-[10px] text-[#64748B] uppercase font-bold">Case 1 Input:</div>
                  <div className="text-[#0A192F]">nums = [4, 5, 6, 7, 0, 1, 2]</div>
                  <div className="text-[#0A192F]">target = 0</div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESULT */}
            {activeConsoleTab === 'result' && (
              <div className="space-y-3 text-xs">
                {result ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-emerald-600 text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Accepted • {result.passed_tests}/{result.total_tests} Test Cases Passed</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-1">
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-bold">RUNTIME</span>
                        <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">38 ms</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Beats 94.2%</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-bold">TIME COMPLEXITY</span>
                        <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">{result.time_complexity}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Optimal Logarithmic</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#64748B] block font-bold">SPACE COMPLEXITY</span>
                        <span className="font-bold text-[#0A192F] text-sm mt-0.5 block">{result.space_complexity}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Constant Space</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-[#64748B]">
                    Run your code to execute testcases and inspect time/space complexity results.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
