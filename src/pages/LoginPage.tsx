import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
  onNavigateToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: 'Alex Mercer',
      email: email || 'alex.mercer@demo.com'
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8 space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-8 h-8 rounded bg-[#0A192F] text-white flex items-center justify-center font-extrabold text-xs mx-auto mb-3">
            CF
          </div>
          <h2 className="text-xl font-extrabold text-[#0A192F]">SIGN IN</h2>
          <p className="text-xs text-[#64748B]">Continue your journey toward job readiness.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#0A192F] block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.mercer@demo.com"
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[#0A192F]">Password</label>
              <a href="#forgot" className="text-[11px] text-[#427AB5] hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0A192F]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-semibold text-xs rounded transition-colors flex items-center justify-center shadow-sm"
          >
            Sign in <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
          </button>
        </form>

        <div className="text-center text-xs text-[#64748B] pt-2">
          Don't have an account?{' '}
          <button
            onClick={onNavigateToSignup}
            className="text-[#427AB5] font-semibold hover:underline"
          >
            Create account
          </button>
        </div>

      </div>
    </div>
  );
};
