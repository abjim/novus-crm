import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Hexagon, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResetSent(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 perspective-1000">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/30 mb-4">
            <Hexagon className="text-white fill-white/20" size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">NOVUS CRM</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Next Generation Lead Management</p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden relative min-h-[420px] transition-all duration-500">
          
          {/* View: Login */}
          <div 
            className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-500 ease-in-out transform ${view === 'login' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* View: Forgot Password */}
          <div 
            className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-500 ease-in-out transform ${view === 'forgot' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
          >
             {!resetSent ? (
              <>
                <button 
                  onClick={() => setView('login')}
                  className="absolute top-8 left-8 p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="mb-6 mt-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Enter your email to receive recovery instructions.</p>
                </div>

                <form onSubmit={handleForgot} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-medium rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                      <span>Send Recovery Link</span>
                    )}
                  </button>
                </form>
              </>
             ) : (
               <div className="text-center">
                 <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                    <CheckCircle2 size={32} />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Check your email</h2>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8">
                   We've sent a password recovery link to <br/>
                   <span className="font-medium text-slate-900 dark:text-white">{email}</span>
                 </p>
                 <button 
                    onClick={() => {
                      setView('login');
                      setResetSent(false);
                      setPassword('');
                    }}
                    className="text-brand-600 font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
                 >
                    <ArrowLeft size={16} />
                    Back to Sign In
                 </button>
               </div>
             )}
          </div>

        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} NOVUS CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;