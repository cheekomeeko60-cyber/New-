import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Mail, Lock, User, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, password?: string) => boolean;
  onSignup: (name: string, email: string) => boolean;
}

export default function Auth({ onLogin, onSignup }: AuthProps) {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState(''); // Not actually checking password in local-only demo for simplicity
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const success = onLogin(email, password);
      if (!success) {
        if (email.toLowerCase() === 'viralmock9535@gmail.com' && password !== '9535') {
          setError('Invalid administrator pin.');
        } else {
          setError('No account found with this email.');
        }
      }
    } else {
      if (!name) return setError('Please enter your name.');
      const success = onSignup(name, email);
      if (!success) setError('An account with this email already exists.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#E5E5E5]">
        
        {/* Visual Side */}
        <div className="hidden lg:flex bg-black p-16 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter text-white">EliteFund</h1>
            </div>
            
            <h2 className="text-5xl font-black text-white leading-tight mb-8 tracking-tighter">
              The Next Frontier <br/> of Personal Wealth.
            </h2>
            
            <div className="space-y-6">
               <Feature icon={ShieldCheck} text="Bank-grade local security" />
               <Feature icon={Zap} text="Instant daily distributions" />
               <Feature icon={TrendingUp} text="Proprietary market insights" />
            </div>
          </div>

          <div className="relative z-10">
             <p className="text-zinc-500 text-sm font-medium">Join 50k+ investors globally securing their daily income.</p>
          </div>

          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/30 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-800/20 rounded-full blur-[80px] -ml-32 -mb-32" />
        </div>

        {/* Form Side */}
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <h3 className="text-3xl font-black mb-2 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-[#6B6B6B] font-medium">
              {mode === 'login' 
                ? 'Sign in to access your investment portal.' 
                : 'Start your journey to daily passive income today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Investor Name"
                      className="w-full bg-[#F5F5F4] border-none rounded-2xl py-4 pl-12 pr-6 font-bold outline-none ring-black focus:ring-2 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F5F5F4] border-none rounded-2xl py-4 pl-12 pr-6 font-bold outline-none ring-black focus:ring-2 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2 block">Security Pin</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-[#F5F5F4] border-none rounded-2xl py-4 pl-12 pr-6 font-bold outline-none ring-black focus:ring-2 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {error}
              </p>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              {mode === 'login' ? 'Login Portal' : 'Ignite Success'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="mt-8 text-center text-[#6B6B6B] font-medium">
            {mode === 'login' ? "Don't have an account? " : "Already an elite member? "}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-black font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-4 text-white/80">
      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold tracking-tight">{text}</span>
    </div>
  );
}
