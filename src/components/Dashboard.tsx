import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Wallet, TrendingUp, History, Landmark, CreditCard, Droplets, Coins, Activity, Info, TrendingDown, ShieldCheck, HelpCircle } from 'lucide-react';
import { UserAccount, PaymentSettings, MarketData, Investment, InvestmentPlan } from '../types';
import { cn } from '../lib/utils';
import ConfirmationModal from './ConfirmationModal';
import DepositFlow from './DepositFlow';
import WithdrawFlow from './WithdrawFlow';
import { motion } from 'motion/react';
import TradingViewWidget from './TradingViewWidget';

const chartData = [
  { day: 'Mon', earnings: 45 },
  { day: 'Tue', earnings: 52 },
  { day: 'Wed', earnings: 48 },
  { day: 'Thu', earnings: 61 },
  { day: 'Fri', earnings: 55 },
  { day: 'Sat', earnings: 67 },
  { day: 'Sun', earnings: 70 },
];

interface DashboardProps {
  user: UserAccount;
  onDeposit: (amount: number, verificationKey?: string) => void;
  onWithdraw: (amount: number, details?: string) => void;
  paymentSettings: PaymentSettings;
  marketData: MarketData[];
  plans: InvestmentPlan[];
}

export default function Dashboard({ user, onDeposit, onWithdraw, paymentSettings, marketData, plans }: DashboardProps) {
  const [isDepositOpen, setIsDepositOpen] = React.useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [amount, setAmount] = React.useState('100');

  const inflation = marketData.find(m => m.symbol === 'INFLATION');

  const getInvestmentPerformance = (inv: Investment) => {
    const planDef = plans.find(p => p.id === inv.planId);
    if (!planDef) return 0;

    // 1. Base ROI (staggered release)
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

  const totalMarketProfit = user.investments.reduce((sum, inv) => {
    const totalReturn = (getInvestmentPerformance(inv) / 100) * inv.amount;
    return sum + totalReturn;
  }, 0);

  const handleWithdrawComplete = (withdrawAmount: number, payoutDetails: string) => {
    onWithdraw(withdrawAmount, payoutDetails);
    setIsWithdrawOpen(false);
  };

  const handleDepositComplete = (depositAmount: number, reference: string) => {
    onDeposit(depositAmount, reference);
    console.log(`Deposit submitted with ref: ${reference}`);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[#6B6B6B] font-medium uppercase tracking-widest text-xs mb-2">Portfolio Overview</p>
          <h2 className="text-4xl font-bold tracking-tight">Morning, Investor</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDepositOpen(true)}
            className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            <Landmark className="w-4 h-4" />
            Deposit
          </button>
          <button 
            onClick={() => { setIsWithdrawOpen(true); setAmount('100'); }}
            className="px-6 py-3 bg-white border border-[#E5E5E5] text-black rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Withdraw
          </button>
        </div>
      </header>

      {/* New Deposit Flow */}
      <DepositFlow 
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onComplete={handleDepositComplete}
        paymentSettings={paymentSettings}
      />

      {/* New Withdraw Flow */}
      <WithdrawFlow 
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onComplete={handleWithdrawComplete}
        paymentSettings={paymentSettings}
        userBalance={user.balance}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Available Balance" 
          value={`$${(user.balance || 0).toLocaleString()}`} 
          trend="Settled cash available"
          icon={Wallet}
        />
        <StatCard 
          label="Live Earnings (P/L)" 
          value={`${(user as any).liveEarnings >= 0 ? '+' : ''}$${((user as any).liveEarnings || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
          trend={`${(user.investments || []).length} active commodity contracts`}
          icon={TrendingUp}
          subValue={inflation ? `CPI: ${inflation.price}%` : undefined}
        />
        <StatCard 
          label="Total Portfolio Value" 
          value={`$${((user as any).totalPortfolioValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
          trend="Equity + Liquidity"
          icon={Activity}
          highlight
        />
      </div>

      {/* Active Commodity Portfolio */}
      {user.investments.length > 0 && (
        <section className="bg-white rounded-[40px] border border-[#E5E5E5] p-10 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold tracking-tight">Active Contracts</h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest px-3 py-1 bg-zinc-100 rounded-full">
               <Activity className="w-3 h-3 text-emerald-500" /> Live Market Feed
            </div>
          </div>
          
          <div className="space-y-4">
            {user.investments.map((inv) => {
              const perf = getInvestmentPerformance(inv);
              const planDef = plans.find(p => p.id === inv.planId);
              const symbol = planDef?.linkedCommodity || 'STABLE';
              const market = marketData.find(m => m.symbol === symbol);
              const currentValue = inv.amount * (1 + perf / 100);
              
              return (
                <motion.div 
                  layout
                  key={inv.id}
                  className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#F5F5F4] rounded-3xl border border-transparent hover:border-black transition-all gap-6"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${symbol === 'OIL' ? 'bg-zinc-800' : 'bg-white shadow-sm'}`}>
                       {symbol === 'OIL' && <Droplets className="w-6 h-6 text-white" />}
                       {symbol === 'GOLD' && <Coins className="w-6 h-6 text-yellow-500" />}
                       {symbol === 'SILVER' && <Activity className="w-6 h-6 text-zinc-400" />}
                       {symbol === 'NONE' || symbol === 'STABLE' && <ShieldCheck className="w-6 h-6 text-blue-500" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">{symbol === 'NONE' ? 'FIXED' : symbol} DERIVATIVE</p>
                      <p className="font-bold text-lg">${inv.amount.toLocaleString()} → <span className="text-emerald-600">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-12 items-center justify-between w-full md:w-auto md:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">Entry Price</p>
                      <p className="font-mono font-bold">${inv.entryPrice?.toLocaleString() || '--'}</p>
                    </div>
                    {market && (
                       <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">Market Price</p>
                        <p className="font-mono font-bold">${market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">Performance</p>
                      <div className={`flex items-center gap-1 font-bold ${perf >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                         {perf >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                         {Math.abs(perf).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Inflation Warning Overlay */}
          {inflation && inflation.price > 3 && (
            <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
               <Info className="w-5 h-5 text-orange-600" />
               <p className="text-xs text-orange-800 font-medium">
                 Global inflation is currently <strong>{inflation.price}%</strong>. Your real-time growth is effectively offsetting purchasing power erosion.
               </p>
            </div>
          )}
        </section>
      )}

      {/* Market analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm overflow-hidden h-[600px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Market Analysis</h3>
              <p className="text-[#6B6B6B] text-sm">Real-time TradingView data feed</p>
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live Feed
            </div>
          </div>
          <div className="h-[calc(100%-80px)] w-full">
            <TradingViewWidget />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-bold italic font-serif tracking-tight">Financial Health</h3>
            <p className="text-[#6B6B6B] text-sm">Portfolio growth index</p>
          </div>
          <div className="flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B6B6B', fontSize: 10 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #E5E5E5',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-4">
             <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Weekly Target</p>
                <p className="font-bold text-lg text-black">82.5%</p>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Growth KPI</p>
                <p className="font-bold text-lg text-black">+4.2%</p>
             </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h3 className="text-xl font-bold">Transaction History</h3>
          </div>
          <button className="text-sm font-bold text-[#6B6B6B] hover:text-black">View All</button>
        </div>
        <div className="space-y-1">
          {user.transactions?.length > 0 ? (
            user.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-4 border-b border-[#F5F5F4] last:border-0 hover:bg-zinc-50 px-4 -mx-4 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                    tx.type === 'withdrawal' ? 'bg-red-100 text-red-600' : 
                    tx.type === 'investment' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{tx.description}</p>
                    <p className="text-[#6B6B6B] text-xs">
                      {new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-zinc-900'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </p>
                    <p className={cn(
                      "text-[10px] uppercase font-black tracking-widest mt-1",
                      tx.status === 'pending' ? 'text-orange-500' : 
                      tx.status === 'rejected' ? 'text-red-500' : 'text-green-600'
                    )}>
                      {tx.status}
                    </p>
                  </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <History className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-[#6B6B6B]">No transactions found yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, highlight, subValue }: any) {
  return (
    <div className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:shadow-black/5 ${highlight ? 'bg-black text-white border-black' : 'bg-white text-[#1A1A1A] border-[#E5E5E5]'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${highlight ? 'bg-zinc-800' : 'bg-[#F5F5F4]'}`}>
          <Icon className={`w-6 h-6 ${highlight ? 'text-white' : 'text-black'}`} />
        </div>
        {subValue && (
           <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
             {subValue}
           </div>
        )}
      </div>
      <p className={`text-sm font-medium mb-1 ${highlight ? 'text-zinc-400' : 'text-[#6B6B6B]'}`}>{label}</p>
      <h4 className="text-3xl font-bold tracking-tight mb-2">{value}</h4>
      <p className={`text-xs ${highlight ? 'text-zinc-400' : 'text-[#6B6B6B]'}`}>{trend}</p>
    </div>
  );
}
