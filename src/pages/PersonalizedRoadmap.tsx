import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Bookmark, Check, CheckCircle2, ChevronDown, ChevronRight,
  Circle, Clock3, ExternalLink, Flag, Lock, MessageCircle, Send, Sparkles,
  Target, X
} from 'lucide-react';
import { useUserStore } from '../hooks/useUserStore';
import { api } from '../services/api';
import { RoleRoadmap, RoadmapNode } from '../types';

interface PersonalizedRoadmapProps {
  onRunReassessment: () => void;
  onNavigateToAssessment?: (targetId?: string) => void;
}

const ROLES = ['Frontend','Backend','Full Stack','Android','DevOps','DevSecOps','Data Analyst','AI Engineer','AI and Data Scientist','Data Engineer','Machine Learning','PostgreSQL','iOS','Blockchain','QA','Software Architect','API Design','Cyber Security','UX Design','Technical Writer','Game Developer','Server Side Game Developer','MLOps','Product Manager','Engineering Manager','Developer Relations','BI Analyst','AI Red Teaming'];

const roleAliases: Record<string, string> = {
  'Frontend Developer': 'Frontend', 'Backend Developer': 'Backend', 'Full Stack Developer': 'Full Stack',
  'AI Engineer': 'AI Engineer', 'AI and Data Scientist': 'AI and Data Scientist', 'Machine Learning Engineer': 'Machine Learning',
  'Data Engineer': 'Data Engineer', 'DevOps Engineer': 'DevOps', 'Cyber Security Expert': 'Cyber Security',
  'UX Designer': 'UX Design', 'QA Engineer': 'QA', 'MLOps Engineer': 'MLOps'
};

const makeFallback = (role: string): RoleRoadmap => {
  const topicMap: Record<string, string[]> = {
    Frontend: ['HTML & Semantics','CSS & Responsive Design','JavaScript','Git & GitHub','TypeScript','React','APIs & Browser Networking','Accessibility','Testing','Web Performance','Portfolio Project','Frontend Interview Prep'],
    Backend: ['Programming Foundations','HTTP & REST','Git & GitHub','SQL & Data Modeling','Backend Framework','Authentication & Authorization','Caching & Redis','API Testing','Docker','Observability','Production API Project','Backend Interview Prep'],
    'Full Stack': ['HTML & CSS','JavaScript','Git & GitHub','TypeScript','React','HTTP & REST','Backend Framework','SQL & PostgreSQL','Authentication','Docker','Cloud Deployment','Full Stack Capstone'],
    'AI Engineer': ['Python','NumPy & Pandas','ML Fundamentals','Deep Learning','Transformers & LLMs','Embeddings','RAG','AI Agents & Tool Calling','Evaluation & Guardrails','Model Serving','AI Production Project','AI Engineer Interview Prep'],
    'Data Engineer': ['Python for Data','Advanced SQL','Data Modeling','ETL & ELT','Data Warehouses','Apache Spark','Kafka & Streaming','Airflow','Data Quality','Cloud Data Platforms','Data Engineering Project','Data Engineer Interview Prep'],
    'Machine Learning': ['Python & NumPy','Math for ML','Classical ML','Feature Engineering','Model Evaluation','Deep Learning','NLP & Transformers','ML Pipelines','Model Serving','Model Monitoring','ML Production Project','ML Interview Prep'],
    DevOps: ['Linux & Networking','Git & GitHub','Shell & Automation','Docker','CI/CD','Cloud Fundamentals','Infrastructure as Code','Kubernetes','Observability','Security','Production Deployment','DevOps Interview Prep'],
    'Cyber Security': ['Networking Fundamentals','Linux Security','Web Security','OWASP','Cryptography','Secure Coding','Cloud Security','SIEM & Detection','Incident Response','Security Testing','Security Assessment Project','Cyber Security Interview Prep'],
    QA: ['Testing Fundamentals','Test Case Design','API Testing','SQL for QA','UI Automation','Playwright / Selenium','Performance Testing','Security Testing','CI Testing','Test Reporting','QA Automation Project','QA Interview Prep'],
    Android: ['Kotlin','Android Fundamentals','Jetpack Compose','Architecture','Networking','Local Persistence','Testing','Performance','App Security','Play Store Release','Android Portfolio App','Android Interview Prep'],
    iOS: ['Swift','SwiftUI','iOS Architecture','Persistence','Networking','Concurrency','Testing','Performance','Security','App Store Delivery','iOS Portfolio App','iOS Interview Prep'],
  };
  const topics = topicMap[role] || [`${role} Fundamentals`, `${role} Core Concepts`, `${role} Tools`, `${role} Best Practices`, `${role} Advanced Topics`, `${role} Testing`, `${role} Automation`, `${role} Production Workflow`, `${role} Case Studies`, `${role} Portfolio Project`, `${role} Interview Prep`, `${role} Career Readiness`];
  const descriptions = [`Understand the foundations required for ${role}.`,`Build the core concepts used in real ${role} work.`,`Learn the most important tools and workflows for this role.`,`Apply industry best practices through guided exercises.`,`Move into advanced concepts and architecture decisions.`,`Learn how professionals test and validate their work.`,`Automate repetitive workflows and improve reliability.`,`Understand how the skill is used in production.`,`Study realistic cases and trade-offs.`,`Build a portfolio project that proves the skill.`,`Practice technical questions and explain your decisions.`,`Prepare your portfolio, projects and interview stories.`];
  const categories = ['Foundations','Foundations','Core','Core','Advanced','Advanced','Workflow','Production','Production','Projects','Career','Career'];
  const nodes: RoadmapNode[] = topics.map((title, i) => ({
    id: `${role.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${i+1}`,
    title, description: descriptions[i] || `Learn and practice ${title} for ${role}.`, category: categories[i] || 'Core', difficulty: i < 3 ? 'Beginner' : i < 9 ? 'Intermediate' : 'Advanced',
    estimated_hours: i < 3 ? 6 : i < 9 ? 8 : 10,
    prerequisites: i ? [`${role.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${i}`] : [],
    skills: [title], projects: i === 8 || i === 9 ? [`${title} hands-on project`] : [], resources: ['Official documentation','Hands-on exercises','Practice project']
  }));
  return { role, audience: `Learners preparing for ${role} roles`, estimated_months: 6, summary: `A role-specific learning path for ${role}, organized from foundations to production projects and interview readiness.`, tracks: [...new Set(nodes.map(n => n.category))], nodes };
};

const progressKey = (role: string) => `careerforge-roadmap-progress:${role}`;

export const PersonalizedRoadmapPage: React.FC<PersonalizedRoadmapProps> = ({ onRunReassessment, onNavigateToAssessment }) => {
  const store = useUserStore();
  const initialRole = roleAliases[store.goal.targetRole || ''] || store.goal.targetRole || 'Full Stack';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [roadmap, setRoadmap] = useState<RoleRoadmap>(() => makeFallback(initialRole));
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [activeTrack, setActiveTrack] = useState('All');
  const [tutorOpen, setTutorOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{from:'ai'|'user'; text:string}[]>([
    { from:'ai', text:'Ask me about any roadmap node, what to learn next, or how to close your biggest skill gap.' }
  ]);

  const skillList = useMemo(() => store.claimedSkills.map(s => s.skillName), [store.claimedSkills]);
  const gaps = useMemo(() => store.skillGaps.map(g => g.skill_name), [store.skillGaps]);

  useEffect(() => {
    try { setCompleted(JSON.parse(localStorage.getItem(progressKey(selectedRole)) || '[]')); } catch { setCompleted([]); }
  }, [selectedRole]);

  useEffect(() => {
    localStorage.setItem(progressKey(selectedRole), JSON.stringify(completed));
  }, [selectedRole, completed]);

  const generate = async (role = selectedRole) => {
    const normalized = roleAliases[role] || role;
    setSelectedRole(normalized);
    setActiveTrack('All');
    setSelectedNode(null);
    setLoading(true);
    try {
      const result = await api.generateRoleRoadmap({
        target_role: normalized, current_skills: skillList, skill_gaps: gaps,
        experience_level: store.goal.experienceLevel, target_company: store.goal.targetCompany,
        job_description: store.goal.jobDescription
      });
      const safe = result?.nodes?.length ? result : makeFallback(normalized);
      setRoadmap({ ...safe, role: normalized });
    } catch {
      setRoadmap(makeFallback(normalized));
    } finally { setLoading(false); }
  };

  useEffect(() => { generate(initialRole); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const tracks = ['All', ...roadmap.tracks];
  const visibleNodes = activeTrack === 'All' ? roadmap.nodes : roadmap.nodes.filter(n => n.category === activeTrack);
  const doneCount = completed.filter(id => roadmap.nodes.some(n => n.id === id)).length;
  const progress = roadmap.nodes.length ? Math.round((doneCount / roadmap.nodes.length) * 100) : 0;
  const nextNode = roadmap.nodes.find(n => !completed.includes(n.id));

  const isLocked = (node: RoadmapNode) => node.prerequisites.some(p => !completed.includes(p));
  const toggleComplete = (node: RoadmapNode) => {
    if (isLocked(node)) return;
    setCompleted(v => v.includes(node.id) ? v.filter(x => x !== node.id) : [...v, node.id]);
  };

  const askAgent = async () => {
    const text = question.trim(); if (!text) return;
    setQuestion(''); setMessages(v => [...v, { from:'user', text }]);
    try {
      const result = await api.askAITutor({ message:text, role:selectedRole, current_skills:skillList, skill_gaps:gaps, roadmap_context:roadmap.nodes.map(n=>n.title).join(' → ') });
      setMessages(v => [...v, { from:'ai', text:result.reply }]);
    } catch { setMessages(v => [...v, { from:'ai', text:'I could not reach the AI service. Check your backend GEMINI_API_KEY and restart FastAPI.' }]); }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-7 py-5">
        <header className="flex flex-col gap-4 mb-5">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-[.18em]"><Target className="w-4 h-4 text-blue-600"/> CareerForge learning path</div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-1">{roadmap.role} Roadmap</h1>
              <p className="text-sm text-slate-500 mt-2 max-w-3xl">{roadmap.summary}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onRunReassessment} className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:border-slate-300">Re-assessment</button>
              <button onClick={() => generate()} disabled={loading} className="px-4 py-2.5 rounded-lg bg-slate-950 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60"><Sparkles className="w-4 h-4 text-yellow-300"/>{loading ? 'Generating...' : 'Regenerate with AI'}</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-2">Role</div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin flex-1">
              {ROLES.map(role => <button key={role} onClick={() => generate(role)} className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold border transition ${selectedRole===role ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'}`}>{role}</button>)}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-5 items-start">
          <aside className="bg-white border border-slate-200 rounded-xl p-4 xl:sticky xl:top-5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Your progress</div>
            <div className="flex items-end justify-between mt-3"><span className="text-3xl font-extrabold">{progress}%</span><span className="text-xs text-slate-400 mb-1">{doneCount}/{roadmap.nodes.length} completed</span></div>
            <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all" style={{width:`${progress}%`}}/></div>
            <div className="mt-5 p-3 rounded-lg bg-blue-50 border border-blue-100"><div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Next up</div><div className="font-bold text-sm mt-1">{nextNode?.title || 'Roadmap complete 🎉'}</div>{nextNode && <div className="text-[11px] text-slate-500 mt-1">{nextNode.estimated_hours} hours · {nextNode.difficulty}</div>}</div>
            <div className="mt-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tracks</div>
            <div className="space-y-1">{tracks.map(track => <button key={track} onClick={()=>setActiveTrack(track)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${activeTrack===track?'bg-slate-950 text-white':'hover:bg-slate-50 text-slate-600'}`}><span>{track}</span><ChevronRight className="w-3.5 h-3.5"/></button>)}</div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed"><b className="text-slate-700">Tip:</b> Complete nodes in order. Locked nodes become available when prerequisites are completed.</div>
          </aside>

          <main className="min-w-0">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2"><Flag className="w-4 h-4 text-blue-600"/><span className="text-sm font-bold">{roadmap.role}</span></div>
              <span className="text-xs px-2.5 py-1.5 bg-slate-100 rounded-md font-semibold">~{roadmap.estimated_months} months</span>
              <span className="text-xs px-2.5 py-1.5 bg-slate-100 rounded-md font-semibold">{roadmap.nodes.length} learning nodes</span>
              <div className="ml-auto text-xs text-slate-400">Personalized using your skills + gaps</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#fbfcff] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-widest font-bold text-blue-600">Interactive roadmap</div><div className="text-sm font-bold mt-1">Follow the path from foundations → projects → interviews</div></div><div className="text-xs text-slate-400">{visibleNodes.length} shown</div></div>
              <div className="p-4 sm:p-7 lg:p-10 overflow-x-auto">
                <div className="min-w-[650px] max-w-[900px] mx-auto relative">
                  <div className="absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-px bg-slate-200"/>
                  <div className="space-y-4 relative">
                    {visibleNodes.map((node, index) => {
                      const done = completed.includes(node.id); const locked = isLocked(node);
                      const side = index % 2 === 0 ? 'left' : 'right';
                      return <React.Fragment key={node.id}>
                        <div className="relative grid grid-cols-[1fr_72px_1fr] items-center gap-2 min-h-[118px]">
                          <div className={side==='left' ? '' : 'invisible'}>
                            {side==='left' && <RoadmapCard node={node} done={done} locked={locked} bookmarked={bookmarks.includes(node.id)} onOpen={()=>setSelectedNode(node)} onToggle={()=>toggleComplete(node)} onBookmark={()=>setBookmarks(v=>v.includes(node.id)?v.filter(x=>x!==node.id):[...v,node.id])}/>} 
                          </div>
                          <div className="relative z-10 flex justify-center"><div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-sm ${done?'bg-emerald-500 border-emerald-100 text-white':locked?'bg-slate-100 border-white text-slate-400':'bg-blue-600 border-blue-100 text-white'}`}>{done?<Check className="w-5 h-5"/>:locked?<Lock className="w-4 h-4"/>:<span className="text-xs font-extrabold">{index+1}</span>}</div></div>
                          <div className={side==='right' ? '' : 'invisible'}>
                            {side==='right' && <RoadmapCard node={node} done={done} locked={locked} bookmarked={bookmarks.includes(node.id)} onOpen={()=>setSelectedNode(node)} onToggle={()=>toggleComplete(node)} onBookmark={()=>setBookmarks(v=>v.includes(node.id)?v.filter(x=>x!==node.id):[...v,node.id])}/>} 
                          </div>
                        </div>
                      </React.Fragment>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="xl:sticky xl:top-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <div className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Roadmap guide</div>
              <h3 className="font-bold mt-2">How to use this path</h3>
              <div className="space-y-3 mt-4 text-xs text-slate-600">
                <Guide icon={<Circle className="w-4 h-4 text-blue-600"/>} title="Open a node" text="See skills, projects, prerequisites and resources."/>
                <Guide icon={<Lock className="w-4 h-4 text-slate-400"/>} title="Follow prerequisites" text="Complete earlier nodes before moving into advanced topics."/>
                <Guide icon={<CheckCircle2 className="w-4 h-4 text-emerald-600"/>} title="Track progress" text="Your completed nodes are saved separately for each role."/>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-950 to-slate-800 text-white rounded-xl p-5 shadow-sm"><Sparkles className="w-5 h-5 text-yellow-300"/><div className="font-bold mt-3">Personalized for you</div><p className="text-xs text-slate-300 mt-2 leading-relaxed">CareerForge uses your claimed skills, skill gaps, experience and target job to generate the learning sequence.</p><button onClick={()=>setTutorOpen(true)} className="mt-4 w-full bg-white text-slate-950 rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4"/> Ask Career Agent</button></div>
            {onNavigateToAssessment && <button onClick={()=>onNavigateToAssessment('binary-search')} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">Start interview practice <ArrowRight className="w-4 h-4"/></button>}
          </aside>
        </div>
      </div>

      {selectedNode && <NodePanel node={selectedNode} done={completed.includes(selectedNode.id)} locked={isLocked(selectedNode)} onClose={()=>setSelectedNode(null)} onToggle={()=>toggleComplete(selectedNode)}/>} 

      <button onClick={()=>setTutorOpen(true)} className="fixed right-5 bottom-5 z-40 rounded-full bg-slate-950 text-white px-5 py-3 shadow-xl flex items-center gap-2 text-sm font-bold"><Sparkles className="w-4 h-4 text-yellow-300"/> AI Career Agent</button>
      {tutorOpen && <div className="fixed right-5 bottom-20 z-50 w-[min(390px,calc(100vw-2rem))] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"><div className="bg-slate-950 text-white p-4 flex items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-300"/> CareerForge AI Agent</div><div className="text-[11px] text-slate-400 mt-1">{selectedRole} roadmap</div></div><button onClick={()=>setTutorOpen(false)}><X className="w-4 h-4"/></button></div><div className="h-72 overflow-auto p-3 space-y-3 bg-slate-50">{messages.map((m,i)=><div key={i} className={`flex ${m.from==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.from==='user'?'bg-blue-600 text-white':'bg-white border border-slate-200 text-slate-700'}`}>{m.text}</div></div>)}</div><div className="p-3 border-t flex gap-2"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askAgent()} placeholder={`Ask about ${selectedRole}...`} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400"/><button onClick={askAgent} className="w-10 h-10 rounded-lg bg-slate-950 text-white flex items-center justify-center"><Send className="w-4 h-4"/></button></div></div>}
    </div>
  );
};

const Guide: React.FC<{icon: React.ReactNode; title:string; text:string}> = ({icon,title,text}) => <div className="flex gap-3"><div className="mt-0.5">{icon}</div><div><div className="font-bold text-slate-700">{title}</div><div className="mt-0.5">{text}</div></div></div>;

const RoadmapCard: React.FC<{node:RoadmapNode; done:boolean; locked:boolean; bookmarked:boolean; onOpen:()=>void; onToggle:()=>void; onBookmark:()=>void}> = ({node,done,locked,bookmarked,onOpen,onToggle,onBookmark}) => <div className={`group bg-white border rounded-xl p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${done?'border-emerald-200':locked?'border-slate-200 opacity-70':'border-slate-200 hover:border-blue-300'}`}><button onClick={onOpen} className="w-full text-left" disabled={locked}><div className="flex items-start justify-between gap-2"><div><div className="flex flex-wrap items-center gap-1.5"><span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-600">{node.category}</span><span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{node.difficulty}</span></div><div className="font-bold text-sm mt-1.5">{node.title}</div></div>{locked?<Lock className="w-4 h-4 text-slate-300"/>:done?<CheckCircle2 className="w-4 h-4 text-emerald-500"/>:<ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500"/>}</div><p className="text-[11px] text-slate-500 leading-relaxed mt-2 line-clamp-2">{node.description}</p><div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400"><Clock3 className="w-3 h-3"/>{node.estimated_hours}h</div></button><div className="flex gap-2 mt-3 pt-2 border-t border-slate-100"><button disabled={locked} onClick={onToggle} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold ${done?'bg-emerald-50 text-emerald-700':'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700'} disabled:cursor-not-allowed`}>{done?'Completed':'Mark complete'}</button><button onClick={onBookmark} className="px-2 rounded-md hover:bg-slate-50"><Bookmark className={`w-3.5 h-3.5 ${bookmarked?'fill-yellow-400 text-yellow-500':'text-slate-300'}`}/></button></div></div>;

const NodePanel: React.FC<{node:RoadmapNode; done:boolean; locked:boolean; onClose:()=>void; onToggle:()=>void}> = ({node,done,locked,onClose,onToggle}) => <div className="fixed inset-0 z-50"><div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]" onClick={onClose}/><aside className="absolute right-0 top-0 h-full w-[min(480px,94vw)] bg-white shadow-2xl overflow-auto"><div className="p-5 border-b border-slate-200 flex items-start justify-between"><div><div className="text-[10px] uppercase tracking-widest font-bold text-blue-600">{node.category}</div><h2 className="text-2xl font-extrabold mt-1">{node.title}</h2><div className="flex gap-2 mt-2"><span className="text-[10px] px-2 py-1 bg-slate-100 rounded font-semibold">{node.difficulty}</span><span className="text-[10px] px-2 py-1 bg-slate-100 rounded font-semibold">{node.estimated_hours} hours</span></div></div><button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5"/></button></div><div className="p-5 space-y-5"><p className="text-sm text-slate-600 leading-relaxed">{node.description}</p><PanelSection title="Key skills"><div className="flex flex-wrap gap-2">{node.skills.map(s=><span key={s} className="px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">{s}</span>)}</div></PanelSection><PanelSection title="Prerequisites">{node.prerequisites.length?<ul className="space-y-2 text-sm text-slate-600">{node.prerequisites.map(p=><li key={p} className="flex gap-2"><ChevronRight className="w-4 h-4 text-slate-400"/>{p}</li>)}</ul>:<div className="text-sm text-slate-500">No prerequisites — this is a starting point.</div>}</PanelSection><PanelSection title="Projects / practice">{node.projects.length?<div className="space-y-2">{node.projects.map(p=><div key={p} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold">{p}</div>)}</div>:<div className="text-sm text-slate-500">Use hands-on exercises and build a small feature after learning this node.</div>}</PanelSection><PanelSection title="Resources"><div className="space-y-2">{node.resources.map(r=><div key={r} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 text-sm"><span>{r}</span><ExternalLink className="w-4 h-4 text-slate-400"/></div>)}</div></PanelSection><button disabled={locked} onClick={onToggle} className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${done?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-slate-950 text-white'} disabled:opacity-50`}>{done?<><CheckCircle2 className="w-4 h-4"/> Completed</>:locked?<><Lock className="w-4 h-4"/> Complete prerequisites first</>:<><Check className="w-4 h-4"/> Mark as complete</>}</button></div></aside></div>;

const PanelSection: React.FC<{title:string; children:React.ReactNode}> = ({title,children}) => <section><div className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-2">{title}</div>{children}</section>;
