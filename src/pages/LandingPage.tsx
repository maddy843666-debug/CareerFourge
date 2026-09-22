import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-64px)] font-sans text-[#0A192F] flex flex-col justify-between">
      
      {/* HERO SECTION */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <span className="text-xs font-mono font-bold tracking-widest text-[#427AB5] uppercase block mb-4">
          CareerForge AI
        </span>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0A192F] tracking-tight leading-tight max-w-3xl mx-auto">
          Know where you stand <span className="text-[#427AB5]">before you apply.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
          Analyze your resume, discover your skill gaps, and understand how ready you are for your target role.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs transition-colors flex items-center justify-center shadow-sm"
          >
            Get started <ArrowRight className="w-4 h-4 ml-2 text-[#FFDE59]" />
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-white text-[#0A192F] font-semibold text-xs border border-[#E2E8F0] hover:bg-slate-50 transition-colors flex items-center justify-center"
          >
            Sign in
          </button>
        </div>
      </section>

      {/* 3 VALUE POINTS SECTION */}
      <section className="py-16 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="space-y-2 p-6 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs font-mono font-bold text-[#427AB5]">01</span>
              <h3 className="text-base font-bold text-[#0A192F]">Analyze your resume</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Evaluate your resume claims against target job requirements and get an instant ATS compatibility score.
              </p>
            </div>

            <div className="space-y-2 p-6 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs font-mono font-bold text-[#427AB5]">02</span>
              <h3 className="text-base font-bold text-[#0A192F]">Discover your skill gaps</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Identify the exact technical and architectural areas limiting your readiness before interviews.
              </p>
            </div>

            <div className="space-y-2 p-6 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs font-mono font-bold text-[#427AB5]">03</span>
              <h3 className="text-base font-bold text-[#0A192F]">Measure your job readiness</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Validate what you can demonstrate through adaptive assessments and track score improvements.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
