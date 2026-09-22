import React, { useState } from 'react';
import { Bell, ChevronDown, LogOut } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isAuthenticated: boolean;
  userName?: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  isAuthenticated,
  userName = 'Alex Mercer',
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40 h-16 flex items-center shrink-0">
      <div className="w-full px-6 flex items-center justify-between">
        
        {/* LEFT LOGO (IF NOT AUTHENTICATED OR SMALL SCREENS) */}
        {!isAuthenticated ? (
          <div 
            onClick={() => onNavigate('landing')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0A192F] text-white flex items-center justify-center font-extrabold text-xs tracking-wider shadow-sm">
              CF
            </div>
            <div>
              <span className="text-base font-extrabold text-[#0F172A] tracking-tight block leading-none">
                CareerForge AI
              </span>
              <span className="text-[10px] text-[#64748B] font-medium leading-none block mt-1">
                Career readiness intelligence
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {/* Blank spacer or breadcrumb if needed */}
          </div>
        )}

        {/* RIGHT TOP HEADER ACTIONS (NOTIFICATION BELL + USER AVATAR) */}
        <div className="flex items-center space-x-5 ml-auto">
          {isAuthenticated ? (
            <>
              {/* Notification Bell with red dot */}
              <button className="relative text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-[#F8FAFC] transition-colors">
                <Bell className="w-5 h-5 text-[#64748B]" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] border border-white"></span>
              </button>

              {/* User Avatar & Name Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 text-xs font-semibold text-[#0F172A] py-1 px-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {userName ? userName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="font-bold text-[#0F172A] hidden sm:inline">{userName || 'Alex Mercer'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <span className="font-bold text-[#0F172A] block">{userName}</span>
                      <span className="text-[10px] text-[#64748B]">Software Engineer Target</span>
                    </div>
                    <button
                      onClick={() => { setUserDropdownOpen(false); onNavigate('dashboard'); }}
                      className="w-full text-left px-4 py-2 text-[#0F172A] hover:bg-[#F8FAFC] font-medium"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setUserDropdownOpen(false); onNavigate('resume'); }}
                      className="w-full text-left px-4 py-2 text-[#0F172A] hover:bg-[#F8FAFC] font-medium"
                    >
                      Resume & ATS
                    </button>
                    <div className="border-t border-[#E2E8F0] my-1"></div>
                    <button
                      onClick={() => { setUserDropdownOpen(false); onLogout(); }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium flex items-center"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <button
                onClick={() => onNavigate('login')}
                className="text-[#0F172A] hover:text-[#0284C7] px-3 py-1.5"
              >
                Sign in
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 rounded-lg bg-[#0A192F] hover:bg-[#1E293B] text-white transition-colors shadow-sm"
              >
                Get started
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

