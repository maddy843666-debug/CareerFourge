import React from 'react';
import {
  LayoutGrid, Sliders, Code, Mic, Database, FileText, Target,
  TrendingUp, Map, User, Settings, ChevronDown, Sparkles, MessageSquare, ShieldCheck
} from 'lucide-react';
import { useUserStore } from '../hooks/useUserStore';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string, targetId?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const store = useUserStore();
  const userName = store.profile.fullName || 'Alex Mercer';
  const userInitials = userName.charAt(0).toUpperCase();

  const getNavClass = (tab: string) => {
    const isActive = currentTab === tab;
    return `w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-semibold transition-all ${
      isActive
        ? 'bg-[#E0F2FE] text-[#0284C7] font-bold shadow-sm'
        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
    }`;
  };

  return (
    <aside className="w-60 bg-white border-r border-[#E2E8F0] flex flex-col justify-between h-screen sticky top-0 shrink-0 text-xs font-sans select-none">
      
      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* LOGO */}
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center space-x-3 cursor-pointer group px-1 pt-1"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0A192F] text-white flex items-center justify-center font-extrabold text-xs tracking-wider shadow-sm group-hover:bg-[#0284C7] transition-colors">
            CF
          </div>
          <div>
            <span className="text-sm font-extrabold text-[#0F172A] tracking-tight block leading-none">
              CareerForge AI
            </span>
            <span className="text-[10px] text-[#64748B] font-medium leading-none block mt-1">
              Career readiness intelligence
            </span>
          </div>
        </div>

        {/* WORKSPACE SECTION */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block px-3 mb-1.5">
            WORKSPACE
          </span>
          <button
            onClick={() => onNavigate('dashboard')}
            className={getNavClass('dashboard')}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutGrid className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>Dashboard</span>
            </div>
          </button>
        </div>

        {/* PRACTICE SECTION */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block px-3 mb-1.5">
            PRACTICE
          </span>
          
          <button
            onClick={() => onNavigate('aptitude')}
            className={getNavClass('aptitude')}
          >
            <div className="flex items-center space-x-2.5">
              <Sliders className={`w-4 h-4 ${currentTab === 'aptitude' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>Aptitude</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('coding')}
            className={getNavClass('coding')}
          >
            <div className="flex items-center space-x-2.5">
              <Code className={`w-4 h-4 ${currentTab === 'coding' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>Coding</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('voice-interview')}
            className={getNavClass(currentTab === 'voice-interview' || currentTab === 'interview' ? currentTab : 'voice-interview')}
          >
            <div className="flex items-center space-x-2.5">
              <Mic className={`w-4 h-4 ${currentTab === 'voice-interview' || currentTab === 'interview' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>AI Voice Interview</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#DCFCE7] text-[#166534]">
              VOICE
            </span>
          </button>

          <button
            onClick={() => onNavigate('chat-interview')}
            className={getNavClass('chat-interview')}
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className={`w-4 h-4 ${currentTab === 'chat-interview' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>AI Chat Interview</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#FEF08A] text-[#854D0E]">
              CHAT
            </span>
          </button>

          <button
            onClick={() => onNavigate('sql')}
            className={getNavClass('sql')}
          >
            <div className="flex items-center space-x-2.5">
              <Database className={`w-4 h-4 ${currentTab === 'sql' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>SQL</span>
            </div>
          </button>
        </div>

        {/* CAREER SECTION */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block px-3 mb-1.5">
            CAREER
          </span>

          <button
            onClick={() => onNavigate('resume')}
            className={getNavClass('resume')}
          >
            <div className="flex items-center space-x-2.5">
              <FileText className={`w-4 h-4 ${currentTab === 'resume' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>ATS Checker</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('truth')}
            className={getNavClass('truth')}
          >
            <div className="flex items-center space-x-2.5">
              <Target className={`w-4 h-4 ${currentTab === 'truth' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>Skill Assessment</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('readiness')}
            className={getNavClass('readiness')}
          >
            <div className="flex items-center space-x-2.5">
              <TrendingUp className={`w-4 h-4 ${currentTab === 'readiness' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>Job Readiness</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('roadmap')}
            className={getNavClass('roadmap')}
          >
            <div className="flex items-center space-x-2.5">
              <Map className={`w-4 h-4 ${currentTab === 'roadmap' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>Roadmap</span>
            </div>
          </button>
        </div>

        {/* ACCOUNT SECTION */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block px-3 mb-1.5">
            ACCOUNT
          </span>

          <button
            onClick={() => onNavigate('dashboard')}
            className={getNavClass('profile')}
          >
            <div className="flex items-center space-x-2.5">
              <User className="w-4 h-4 text-[#64748B]" />
              <span>Profile</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('test-center')}
            className={getNavClass('test-center')}
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className={`w-4 h-4 ${currentTab === 'test-center' ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
              <span>Test Center</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#E0F2FE] text-[#0284C7]">
              MCP
            </span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={getNavClass('settings')}
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4 h-4 text-[#64748B]" />
              <span>Settings</span>
            </div>
          </button>
        </div>

      </div>

      {/* BOTTOM USER PROFILE CARD */}
      <div className="p-3 border-t border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {userInitials}
            </div>
            <div className="truncate">
              <span className="font-bold text-[#0F172A] text-xs block leading-tight truncate">
                {userName}
              </span>
              <span className="text-[10px] text-[#64748B] truncate block leading-tight">
                {store.goal.targetRole || 'Software Engineer'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
        </div>
      </div>

    </aside>
  );
};
