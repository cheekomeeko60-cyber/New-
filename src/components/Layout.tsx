import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, ShoppingCart, TrendingUp, Sparkles, LogOut, Menu, X, User, Settings2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import TradingViewTicker from './TradingViewTicker';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export default function Layout({ children, activeTab, setActiveTab, onLogout, isAdmin }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'invest', label: 'Invest', icon: TrendingUp },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'analyst', label: 'AI Analyst', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: User },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Settings2 }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E5E5E5] hidden lg:flex flex-col z-50">
        <div className="p-8 border-bottom border-[#E5E5E5]">
          <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            EliteFund
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === item.id
                  ? "bg-black text-white shadow-lg shadow-black/10"
                  : "text-[#6B6B6B] hover:bg-[#F5F5F4] hover:text-[#1A1A1A]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E5E5E5]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F5F4] hover:text-[#1A1A1A] transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="lg:hidden fixed top-0 w-full bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between z-50">
        <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          EliteFund
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 top-[73px] bg-white z-40 p-6 flex flex-col pt-12"
          >
            <div className="flex-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-lg font-semibold mb-2 transition-all",
                    activeTab === item.id ? "bg-black text-white" : "text-[#6B6B6B]"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={onLogout}
              className="mt-auto w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-lg font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100"
            >
              <LogOut className="w-6 h-6" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:pl-64 pt-20 lg:pt-0 min-h-screen">
        {/* Persistent Ticker Tape */}
        <div className="bg-white border-b border-[#E5E5E5] sticky top-[73px] lg:top-0 z-40">
           <TradingViewTicker />
        </div>
        
        <div className="max-w-6xl mx-auto p-6 lg:p-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
