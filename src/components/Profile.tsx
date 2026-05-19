import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  PieChart as PieIcon, 
  ChevronRight, 
  Hexagon,
  Star,
  Zap,
  Globe,
  Settings,
  Check,
  X,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  LogOut,
  Droplets,
  Coins,
  Activity,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis } from 'recharts';
import { UserAccount, MarketData, Investment, InvestmentPlan } from '../types';

interface ProfileProps {
  user: UserAccount;
  onUpdateProfile: (updates: Partial<UserAccount>) => void;
  onLogout: () => void;
  marketData: MarketData[];
  plans: InvestmentPlan[];
  onClaim: (id: string) => void;
}

const COLORS = ['#000000', '#2D2D2D', '#555555', '#888888', '#AAAAAA'];

const badges = [
  { id: 1, name: 'Early Adopter', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'Elite Investor', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 3, name: 'Risk Master', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 4, name: 'Daily Earner', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function Profile({ user, onUpdateProfile, onLogout, marketData, plans, onClaim }: ProfileProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(user.name);
  const [nowFetch, setNowFetch] = React.useState(new Date().getTime());

  // Update "now" every second for countdowns
  React.useEffect(() => {
    const timer = setInterval(() => setNowFetch(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getInvestmentPerformance = (inv: Investment) => {
    const planDef = plans.find(p => p.id === inv.planId);
    if (!planDef) return 0;

    // 1. Base ROI
    const startDate = new Date(inv.startDate).getTime();
    const now = new Date().getTime();
    const diffDays = (now - startDate) / (1000 * 60 * 60 * 24);
    const elapsedDays = Math.max(0, Math.min(diffDays, planDef.durationDays));
    const baseProfit = (planDef.dailyRoi / 100) * elapsedDays * inv.amount;

    // 2. Market Performance
    let marketProfit = 0;
    if (inv.entryPrice && inv.entryPrice > 0 && planDef.linkedCommodity && planDef.linkedCommodity !== 'NONE') {
      const market = marketData.find(m => m.symbol === planDef.linkedCommodity);
      if (market) {
        const perf = (market.price - inv.entryPrice) / inv.entryPrice;
        marketProfit = inv.amount * perf;
      }
    }
    
    return ((baseProfit + marketProfit) / inv.amount) * 100;
  };

  // Sync editedName if user object updates from elsewhere
  React.useEffect(() => {
    setEditedName(user.name);
  }, [user.name]);

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateProfile({ name: editedName.trim() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user.name);
    setIsEditing(false);
  };

  // Mock data for visualizations based on user state
  const allocationData = [
    { name: 'Investments', value: user.totalInvested || 0 },
    { name: 'Cash', value: user.balance || 0 },
  ];

  const barData = [
    { month: 'Jan', value: 1200 },
    { month: 'Feb', value: 1900 },
    { month: 'Mar', value: 2400 },
    { month: 'Apr', value: (user.dailyEarnings || 0) * 20 },
  ];

  const winRate = 78.4;
  const avgRoi = 2.4;

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Profile Section */}
      <header className="relative bg-black rounded-[40px] p-10 text-white overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-32 h-32 rounded-full bg-gradient-to-tr from-zinc-700 to-white flex items-center justify-center p-1"
            >
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            <div className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-xl shadow-xl">
               <Hexagon className="w-6 h-6 fill-black text-white" />
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              {isEditing ? (
                <div className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-2xl border border-zinc-700">
                  <input 
                    type="text" 
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-transparent border-none outline-none text-2xl font-bold px-2 py-1 w-48 md:w-64"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button onClick={handleSaveName} className="p-2 bg-green-500 rounded-lg hover:bg-green-400 transition-colors">
                       <Check className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={handleCancelEdit} className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors">
                       <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <h2 className="text-4xl font-bold tracking-tight">{user.name}</h2>
              )}
              <span className="px-4 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {user.rank}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-zinc-400 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {new Date(user.joinedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {!isEditing && (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>
                <button 
                  onClick={onLogout}
                  className="px-8 py-4 bg-zinc-800 text-white border border-zinc-700 rounded-2xl font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Decorative background lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="h-px bg-white w-full absolute top-1/4 animate-pulse" />
           <div className="h-px bg-white w-full absolute top-1/2 opacity-50" />
           <div className="h-px bg-white w-full absolute top-3/4 animate-pulse delay-75" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full opacity-5 scale-150" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metrics & Badges & Activity */}
        <div className="lg:col-span-4 space-y-8">
          {/* Key Metrics */}
          <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-black" /> Efficiency
            </h3>
            <div className="space-y-6">
              <MetricItem label="Trade Win Rate" value={`${winRate}%`} progress={winRate} />
              <MetricItem label="Avg Daily ROI" value={`${avgRoi}%`} progress={avgRoi * 20} />
              <MetricItem label="Risk Score" value="Low" progress={15} color="bg-green-500" />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-black" /> Activity
              </h3>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Real-time</span>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {user.transactions.length > 0 ? (
                user.transactions.map((tx, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={tx.id} 
                    className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all group"
                  >
                    <div className={`p-2 rounded-xl scale-90 group-hover:scale-100 transition-transform ${
                      tx.type === 'deposit' ? 'bg-green-100 text-green-600' :
                      tx.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                      tx.type === 'purchase' ? 'bg-blue-100 text-blue-600' :
                      'bg-zinc-100 text-black'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> :
                       tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> :
                       tx.type === 'purchase' ? <ShoppingBag className="w-4 h-4" /> :
                       <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight mb-1">{tx.description}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={tx.type === 'deposit' ? 'text-green-600' : tx.type === 'withdrawal' ? 'text-red-600' : 'text-black'}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 opacity-50">
                  <p className="text-sm italic">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visualizations & Portfolio */}
        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Asset Allocation */}
              <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-black">
                  <PieIcon className="w-5 h-5 text-zinc-400" /> Allocation
                </h3>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                         contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-4">
                  {allocationData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Performance */}
              <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm text-[#1A1A1A]">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-black">
                  <BarChart3 className="w-5 h-5 text-zinc-400" /> Performance
                </h3>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#A1A1AA', fontWeight: 'bold' }} 
                      />
                      <RechartsTooltip 
                        cursor={{ fill: '#F5F5F4' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#000" 
                        radius={[6, 6, 0, 0]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
           </div>

           {/* Portfolio Card Mosaic */}
           <div className="bg-white rounded-[40px] border border-[#E5E5E5] p-10 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight">Active Portfolio</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Growth Assets</p>
                </div>
                <button className="px-5 py-2 bg-zinc-50 border border-zinc-200 text-xs font-bold text-[#6B6B6B] hover:text-black hover:border-black rounded-full transition-all flex items-center gap-1 shadow-sm">
                   Export Ledger <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                 {(user.investments || []).length > 0 ? (
                   user.investments.map((inv, i) => {
                     const perf = getInvestmentPerformance(inv);
                     const planDef = plans.find(p => p.id === inv.planId);
                     const symbol = planDef?.linkedCommodity || 'STABLE';
                     const currentVal = inv.amount * (1 + perf / 100);
                     
                     return (
                      <motion.div 
                        key={inv.id}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-[#F5F5F4] p-8 rounded-[32px] border border-transparent hover:border-black transition-all cursor-pointer overflow-hidden relative"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${symbol === 'OIL' ? 'bg-zinc-800' : 'bg-white'}`}>
                             {symbol === 'OIL' && <Droplets className="w-6 h-6 text-white" />}
                             {symbol === 'GOLD' && <Coins className="w-6 h-6 text-yellow-500" />}
                             {symbol === 'SILVER' && <Activity className="w-6 h-6 text-zinc-400" />}
                             {symbol === 'NONE' || symbol === 'STABLE' && <TrendingUp className="w-6 h-6 text-black" />}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                              {inv.status}
                            </span>
                            {perf !== 0 && (
                               <span className={`text-[10px] font-black ${perf >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                 {perf >= 0 ? '+' : ''}{perf.toFixed(2)}% LIVE
                               </span>
                            )}
                          </div>
                        </div>
                         <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-1">Current Evaluation</p>
                         <h4 className="text-4xl font-black mb-4 tracking-tighter text-emerald-600">${currentVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
                         
                         <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest">
                               <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-zinc-400" /> Start: {new Date(inv.startDate).toLocaleDateString()}
                               </div>
                               {inv.entryPrice && (
                                  <div className="flex items-center gap-1">
                                     <ArrowDownLeft className="w-3 h-3 text-zinc-400" /> Entry: ${inv.entryPrice.toLocaleString()}
                                  </div>
                               )}
                            </div>

                            {inv.status === 'active' && planDef && (
                               <div className="pt-2">
                                  <InvestmentClaimStatus 
                                    startDate={inv.startDate} 
                                    durationDays={planDef.durationDays} 
                                    onClaim={() => onClaim(inv.id)}
                                    nowPulse={nowFetch}
                                  />
                               </div>
                            )}
                         </div>

                         {/* Decorative accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-xl" />
                      </motion.div>
                     );
                   })
                 ) : (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-[#E5E5E5] rounded-[40px] bg-zinc-50/50">
                       <PieIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                       <p className="text-black font-black uppercase tracking-tight text-xl">Empty Portfolio</p>
                       <p className="text-sm text-zinc-400 mt-2 font-medium">Deploy capital to elite plans to begin your journey.</p>
                       <button className="mt-8 px-8 py-3 bg-black text-white text-xs font-bold rounded-full uppercase tracking-widest hover:scale-105 transition-all">
                          Browse Plans
                       </button>
                    </div>
                 )}
              </div>
           </div>

           {/* Active Portfolio section end */}
           
           {/* Purchased Accounts Section */}
           <div className="bg-white rounded-[40px] border border-[#E5E5E5] p-10 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight">Funded Accounts</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Credentials</p>
                </div>
                <div className="px-5 py-2 bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700 rounded-full flex items-center gap-2">
                   <Shield className="w-3 h-3" /> Secure Access
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                 {user.transactions.filter(t => t.type === 'purchase').length > 0 ? (
                   user.transactions.filter(t => t.type === 'purchase').map((tx, i) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-[#F5F5F4] p-8 rounded-[32px] border border-transparent hover:border-black transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                           <BarChart3 className="w-6 h-6 text-black" />
                        </div>
                        <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-1">Account Product</p>
                      <h4 className="text-xl font-black mb-6 tracking-tight">{tx.description}</h4>
                      
                      <div className="space-y-3 bg-white/60 p-5 rounded-2xl border border-zinc-200/50">
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">MT5 Login</span>
                            <span className="font-mono font-bold text-black select-all bg-zinc-200/50 px-2 rounded">{tx.accountLogin || 'Generating...'}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Password</span>
                            <span className="font-mono font-bold text-black select-all bg-zinc-200/50 px-2 rounded">{tx.accountPassword || 'Generating...'}</span>
                         </div>
                         {tx.terminalLink && (
                           <a 
                            href={tx.terminalLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex justify-between items-center text-xs hover:bg-black/5 p-1 rounded-lg transition-colors group/link"
                           >
                              <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Terminal</span>
                              <span className="flex items-center gap-1 font-bold text-blue-600 underline text-[10px]">
                                Launch Web Terminal <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                              </span>
                           </a>
                         )}
                      </div>

                      <p className="mt-4 text-[9px] text-zinc-400 font-bold uppercase tracking-widest text-center">Do not share these credentials</p>
                    </motion.div>
                   ))
                 ) : (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-[#E5E5E5] rounded-[40px] bg-zinc-50/50">
                       <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
                       <p className="text-black font-black uppercase tracking-tight text-lg">No Active Accounts</p>
                       <p className="text-sm text-zinc-400 mt-1 font-medium px-10 leading-relaxed">Purchased funded accounts will appear here once the transaction is verified.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Achievements Row */}
           <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Master Badges
             </h3>
             <div className="flex flex-wrap gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className={`${badge.bg} px-6 py-4 rounded-2xl flex items-center gap-4 group transition-all hover:ring-2 ring-zinc-200 cursor-default`}>
                    <badge.icon className={`w-6 h-6 ${badge.color}`} />
                    <div className="text-left">
                       <p className={`text-[10px] font-black uppercase tracking-widest ${badge.color}`}>{badge.name}</p>
                       <p className="text-[10px] text-zinc-400 font-bold">UNLOCKED</p>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value, progress, color = "bg-black" }: { label: string, value: string, progress: number, color?: string }) {
  const safeProgress = isNaN(progress) ? 0 : progress;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black">{value}</span>
      </div>
      <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full shadow-sm ${color}`} 
        />
      </div>
    </div>
  );
}

function InvestmentClaimStatus({ startDate, durationDays, onClaim, nowPulse }: { startDate: string, durationDays: number, onClaim: () => void, nowPulse: number }) {
  const start = new Date(startDate).getTime();
  const end = start + (durationDays * 24 * 60 * 60 * 1000);
  const remaining = end - nowPulse;
  const isMatured = remaining <= 0;

  if (isMatured) {
    return (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClaim();
        }}
        className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group"
      >
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        Claim Rewards Window Open
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>
    );
  }

  // Format countdown
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((remaining / (1000 * 60)) % 60);
  const secs = Math.floor((remaining / 1000) % 60);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-2xl p-4 flex flex-col items-center gap-2">
       <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
          <History className="w-3 h-3" /> Claim Window Opens In
       </div>
       <div className="flex gap-3">
          <TimeBox value={days} label="D" />
          <TimeBox value={hours} label="H" />
          <TimeBox value={mins} label="M" />
          <TimeBox value={secs} label="S" />
       </div>
    </div>
  );
}

function TimeBox({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center">
       <span className="text-xl font-black tracking-tight text-black tabular-nums">
         {value.toString().padStart(2, '0')}
       </span>
       <span className="text-[8px] font-black text-zinc-400">{label}</span>
    </div>
  );
}
