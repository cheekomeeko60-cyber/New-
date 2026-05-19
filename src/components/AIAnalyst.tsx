import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  LineChart, 
  MessageSquare, 
  Send, 
  Loader2,
  Wallet,
  TrendingUp,
  Target,
  Bot,
  Layers,
  Activity
} from 'lucide-react';

import { MarketData, UserAccount, InvestmentPlan } from '../types';

interface AIAnalystProps {
  marketData: MarketData[];
  user: UserAccount & { liveEarnings?: number; totalPortfolioValue?: number };
  plans: InvestmentPlan[];
}

export default function AIAnalyst({ marketData, user, plans }: AIAnalystProps) {
  const [prompt, setPrompt] = React.useState('');
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Platform wide admin context (computed in real-time)
  const systemMetrics = React.useMemo(() => {
    if (!user.isAdmin) return null;
    const usersMap = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
    const allUsers = Object.values(usersMap) as any[];
    const totalDeposits = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    const pendingRequests = allUsers.reduce((sum, u) => 
      sum + (u.transactions || []).filter((t: any) => t.status === 'pending').length, 0
    );
    const activeInvestCount = allUsers.reduce((sum, u) => 
      sum + (u.investments || []).filter((i: any) => i.status === 'active').length, 0
    );
    return {
      totalUsers: allUsers.length,
      totalDeposits,
      pendingRequests,
      activeInvestCount
    };
  }, [user]);

  const handleAnalyze = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || prompt;
    if (!promptToUse.trim()) return;
    
    setIsLoading(true);
    setAnalysis(null);
    if (!overridePrompt) {
      setPrompt(promptToUse);
    }
    
    const marketContext = marketData.map(m => `${m.symbol}: $${m.price} (${m.change24h}%)`).join(', ');
    
    // Build actual user portfolio context
    const holdingsContext = (user.investments || [])
      .map(inv => {
        const plan = plans.find(p => p.id === inv.planId);
        return `- Plan: ${plan?.name || 'Unknown'}, Amount: $${inv.amount}, Status: ${inv.status}, Linked: ${plan?.linkedCommodity || 'None'}`;
      })
      .join('\n');

    const goalsContext = (user.goals || [])
      .map(g => `- Goal: ${g.title}, Target: $${g.targetAmount}, Current: $${g.currentAmount}, Deadline: ${g.deadline}`)
      .join('\n');

    const txContext = (user.transactions || []).slice(0, 5)
      .map(t => `- [${t.date.split('T')[0]}] ${t.type.toUpperCase()}: $${t.amount} (${t.status})`)
      .join('\n');

    // System context if user is admin
    let adminContext = '';
    if (user.isAdmin && systemMetrics) {
      adminContext = `System Admin Metadata Report:
Total Registered Members: ${systemMetrics.totalUsers}
Total Locked Deposits/Balance: $${systemMetrics.totalDeposits.toLocaleString()}
Pending Support & Financial queue actions: ${systemMetrics.pendingRequests}
Active Wealth investments: ${systemMetrics.activeInvestCount}`;
    }

    const compiledPrompt = `You are EliteFund Neural AI, the premium sovereign investment analyst.
Live Market Context: ${marketContext}

Client Profile metadata:
- Name: ${user.name}
- Email: ${user.email}
- Rank: ${user.rank}
- Available Cash Balance: $${user.balance.toLocaleString()}
- Active Invested Funds: $${user.totalInvested?.toLocaleString() || 0}
- Current Computed Unrealized ROI: $${user.liveEarnings?.toLocaleString() || 0}
- Total Portfolio Value: $${user.totalPortfolioValue?.toLocaleString() || 0}

Wealth Holdings:
${holdingsContext || 'No active holdings'}

Active Goals:
${goalsContext || 'No active goals'}

Recent Payout & Cashflow History:
${txContext || 'No transaction history'}

${adminContext}

User query: "${promptToUse}"

As their high-society financial intelligence advisor, evaluate these factors with mathematical precision. Project future cashflows, point out structural risk (or commodity volatility like Gold/Silver/Oil), or supply administrative stats recommendations. Keep output elegant, scannable, data-rich and formatted in beautiful spaced Markdown. Highlight actionable insights.`;

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: compiledPrompt }),
      });
      const data = await response.json();
      setAnalysis(data.text);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setAnalysis('Failed to connect to the AI brain. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Growth Strategy',
      badge: 'Portfolio ROI',
      desc: 'Formulate an optimal plan subscription to maximize ROI for my balance.',
      prompt: 'Suggest which plan fits my balance best and calculate custom projected 1-month ROI and risk profile.'
    },
    {
      title: 'Commodity Risk Audit',
      badge: 'Market Risk',
      desc: 'Standard review of active investments against Live Gold or Oil rates.',
      prompt: 'Review my active commodity plan entries against current market prices and point out any potential performance warnings.'
    },
    {
      title: 'Milestone Navigator',
      badge: 'Goal Tracking',
      desc: 'Structure a custom timeline toward achieving my active investment goals.',
      prompt: 'Based on my active goals and existing funds, help me structure a financial path and timeline consisting of sequential investment subscriptions.'
    },
    ...(user.isAdmin ? [
      {
        title: 'Platform Analytics',
        badge: 'Admin Control',
        desc: 'Review vault balances, user registration, and cashflow reports.',
        prompt: 'Prepare a high-level operational report summarizing the platform total deposits, registration growth, and pending requests with action recommendations.'
      }
    ] : [])
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-black rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-black tracking-tight" id="vanguard-neural-title">Vanguard Neural AI</h2>
          </div>
          <p className="text-[#6B6B6B] font-medium uppercase tracking-widest text-xs">Real-Time Cognitive Investment Support</p>
        </div>
      </header>

      {/* Real-time sync dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="ai-dashboard-grid">
        {/* User Balance Status */}
        <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm flex flex-col justify-between" id="ai-card-balance">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-zinc-50 rounded-2xl text-black">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-black uppercase rounded-full">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              Live Context
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest mb-1">Available Capital</p>
            <h3 className="text-3xl font-black tracking-tight mb-2">${user.balance.toLocaleString()}</h3>
            <p className="text-xs text-[#6B6B6B] font-bold">Total Portfolio: <span className="text-black">${user.totalPortfolioValue?.toLocaleString() || '0'}</span></p>
          </div>
        </div>

        {/* User Holdings Statistics */}
        <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm flex flex-col justify-between" id="ai-card-holdings">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-zinc-50 rounded-2xl text-black">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {user.rank}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest mb-1">Active Investments</p>
            <h3 className="text-3xl font-black tracking-tight mb-2">{(user.investments || []).filter(i => i.status === 'active').length} Plans</h3>
            <p className="text-xs text-[#6B6B6B] font-bold">Pending Goals: <span className="text-black">{(user.goals || []).length} Saved</span></p>
          </div>
        </div>

        {/* Live System stats if Admin, otherwise live Market prices */}
        {user.isAdmin && systemMetrics ? (
          <div className="bg-black text-white rounded-[32px] p-8 shadow-xl flex flex-col justify-between" id="ai-card-system">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-800 rounded-2xl text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-yellow-400 text-black text-[9px] font-black uppercase rounded-full">
                Sovereign Owner
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Platform Reserve</p>
              <h3 className="text-3xl font-black tracking-tight mb-2">${systemMetrics.totalDeposits.toLocaleString()}</h3>
              <p className="text-xs text-zinc-400 font-bold">Registered Members: <span className="text-white font-black">{systemMetrics.totalUsers}</span></p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm flex flex-col justify-between" id="ai-card-market">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-50 rounded-2xl text-black">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Commodities
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {marketData.slice(0, 3).map(m => (
                <div key={m.symbol} className="bg-[#F5F5F4] p-2 rounded-xl">
                  <p className="font-mono text-[9px] font-black text-[#6B6B6B]">{m.symbol}</p>
                  <p className="text-xs font-black">${m.price.toLocaleString()}</p>
                  <p className={`text-[8px] font-bold ${m.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.change24h >= 0 ? '+' : ''}{m.change24h}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="ai-workspace-layout">
        {/* Terminal/Input Column */}
        <div className="lg:col-span-4 space-y-6" id="ai-actions-column">
          <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-6 shadow-sm">
             <h4 className="text-sm font-black uppercase tracking-wider text-black mb-4">Recommended Actions</h4>
             <div className="space-y-3">
               {quickActions.map((act, idx) => (
                 <button 
                   key={idx}
                   id={`ai-action-btn-${idx}`}
                   onClick={() => handleAnalyze(act.prompt)}
                   disabled={isLoading}
                   className="w-full text-left bg-[#F5F5F4] hover:bg-[#E5E5E5] p-4 rounded-2xl border border-transparent hover:border-zinc-300 transition-all flex flex-col gap-1.5 group disabled:opacity-50"
                 >
                   <div className="flex justify-between items-center w-full">
                     <span className="text-xs font-black text-black group-hover:underline">{act.title}</span>
                     <span className="text-[8px] font-black uppercase tracking-wider bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded-md">{act.badge}</span>
                   </div>
                   <p className="text-[10px] font-bold text-[#6B6B6B] leading-snug">{act.desc}</p>
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Cognitive Workspace Side */}
        <div className="lg:col-span-8 space-y-6" id="ai-cognitive-workspace">
          <div className="bg-[#151619] rounded-[32px] p-8 border border-[#2D2E32] shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-[#2D2E32] pb-6">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-zinc-500" />
                <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Cognitive_Terminal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <span className="text-[9px] font-black font-mono text-green-500 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="space-y-4">
               <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Vanguard Neural AI about subscription yields, goal timelines, or system reserve projections..."
                className="w-full bg-transparent border-none text-white font-mono text-md resize-none outline-none min-h-[140px] placeholder:text-zinc-600 leading-relaxed"
                id="ai-terminal-textarea"
               />
               
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-[#2D2E32]">
                  <div className="flex flex-wrap gap-4 text-zinc-500 text-[9px] font-mono uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1"><Cpu className="w-3" /> Core: Gemini 3.5</span>
                    <span className="flex items-center gap-1"><Bot className="w-3" /> System Integration: Active</span>
                  </div>
                  <button 
                    onClick={() => handleAnalyze()}
                    disabled={isLoading || !prompt.trim()}
                    id="ai-ignite-btn"
                    className="w-full sm:w-auto bg-white text-black px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-xl shadow-white/5"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Ignite Neural Intelligence
                  </button>
               </div>
            </div>
          </div>

          {/* AI Result Area */}
          <AnimatePresence mode="wait">
            {(isLoading || analysis) && (
              <motion.div 
                key="analysis-output"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                id="ai-result-view"
              >
                <div className="bg-white rounded-[32px] p-8 md:p-10 border border-[#E5E5E5] min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                  {!analysis && isLoading && (
                    <div className="flex flex-col items-center gap-6 text-center" id="ai-loading-vector">
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-zinc-100 rounded-full" />
                        <div className="w-24 h-24 border-4 border-t-black rounded-full animate-spin absolute inset-0" />
                        <Sparkles className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">Quantifying Financial Data Vector...</h4>
                        <p className="text-[#6B6B6B] text-sm font-medium">Synchronizing live market commodities and asset histories.</p>
                      </div>
                    </div>
                  )}
                  
                  {analysis && (
                    <div className="w-full" id="ai-analysis-output-box">
                      <div className="flex items-center justify-between mb-8 border-b border-[#E5E5E5] pb-4">
                         <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                            <MessageSquare className="w-3 h-3" /> Intelligence Synthesis
                         </div>
                         <button 
                           onClick={() => setAnalysis(null)} 
                           className="text-[10px] font-black uppercase tracking-widest text-[#6B6B6B] hover:text-black hover:underline"
                         >
                           Clear Result
                         </button>
                      </div>
                      <div className="prose prose-zinc max-w-none text-[#1A1A1A] text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {analysis}
                      </div>
                    </div>
                  )}

                  {/* Decorative modern elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5F4] rounded-full -mr-16 -mt-16 -z-10" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F5F5F4] rounded-full -ml-16 -mb-16 -z-10" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
