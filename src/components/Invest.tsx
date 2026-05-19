import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, Zap, Target, ShieldCheck, Plus, Flag, Calendar } from 'lucide-react';
import { INVESTMENT_PLANS } from '../constants';
import { InvestmentPlan, Goal, Investment, MarketData, PaymentSettings } from '../types';
import InvestmentFlow from './InvestmentFlow';
import { TrendingUp, TrendingDown, Activity, Fuel, Coins, Droplets, Info } from 'lucide-react';

interface InvestProps {
  onInvest: (plan: InvestmentPlan, amount: number) => void;
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  investments: Investment[];
  plans: InvestmentPlan[];
  userBalance: number;
  marketData: MarketData[];
  paymentSettings: PaymentSettings;
}

export default function Invest({ onInvest, goals, onAddGoal, investments, plans, userBalance, marketData, paymentSettings }: InvestProps) {
  const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState({ title: '', targetAmount: 1000, deadline: '' });
  const [selectedPlanFlow, setSelectedPlanFlow] = React.useState<{plan: InvestmentPlan, amount: number} | null>(null);

  const totalCurrentValue = (investments || []).reduce((sum, inv) => sum + inv.amount, 0);

  const getCommodityIcon = (symbol?: string) => {
    switch (symbol) {
      case 'OIL': return <Droplets className="w-5 h-5" />;
      case 'GOLD': return <Coins className="w-5 h-5 text-yellow-500" />;
      case 'SILVER': return <Activity className="w-5 h-5 text-zinc-400" />;
      default: return <Fuel className="w-5 h-5" />;
    }
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({ ...newGoal, targetAmount: Number(newGoal.targetAmount) });
    setIsGoalModalOpen(false);
    setNewGoal({ title: '', targetAmount: 1000, deadline: '' });
  };

  return (
    <div className="space-y-16">
      <InvestmentFlow 
        isOpen={!!selectedPlanFlow}
        onClose={() => setSelectedPlanFlow(null)}
        onConfirm={() => {
          if (selectedPlanFlow) {
            onInvest(selectedPlanFlow.plan, selectedPlanFlow.amount);
          }
        }}
        type="plan"
        item={selectedPlanFlow?.plan || null}
        amount={selectedPlanFlow?.amount}
        userBalance={userBalance}
        marketData={marketData}
        paymentSettings={paymentSettings}
      />

      <header className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tight mb-4">Grow Your Capital</h2>
        <p className="text-[#6B6B6B] text-lg">
          Choose a tailored investment plan that fits your financial goals. 
          Earn passive daily returns with professional risk management.
        </p>
      </header>

      {/* Goals Section */}
      <section className="bg-white rounded-[40px] border border-[#E5E5E5] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-zinc-100 rounded-lg">
                <Target className="w-6 h-6" />
             </div>
             <h3 className="text-2xl font-bold tracking-tight">Your Investment Goals</h3>
          </div>
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            Set New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(goals || []).length > 0 ? (
            goals.map((goal) => {
              const progress = Math.min((totalCurrentValue / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id} className="p-6 bg-[#F5F5F4] rounded-3xl border border-transparent hover:border-[#E5E5E5] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg mb-1">{goal.title}</h4>
                      <p className="text-xs text-[#6B6B6B] flex items-center gap-1 font-bold uppercase tracking-widest">
                        <Calendar className="w-3 h-3" /> Target: {goal.deadline || 'Long Term'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black">${goal.targetAmount.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest">Target Amount</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#6B6B6B]">
                      <span>Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-black"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <Flag className="w-12 h-12 text-zinc-300 mb-4" />
              <p className="text-[#6B6B6B] max-w-xs">Define your financial targets and we'll help you track your progress automatically.</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(plans || []).map((plan, index) => {
          const market = marketData.find(m => m.symbol === plan.linkedCommodity);
          return (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              index={index} 
              market={market}
              userBalance={userBalance}
              onInvest={(p, a) => setSelectedPlanFlow({ plan: p, amount: a })} 
            />
          );
        })}
      </div>

      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.form 
              onSubmit={handleSubmitGoal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[32px] w-full max-w-md p-10 shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-bold tracking-tight">Set Your Goal</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2 block">Goal Title</label>
                  <input 
                    required
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Retirement Fund, New Car" 
                    className="w-full bg-[#F5F5F4] border-none rounded-xl p-4 font-bold outline-none ring-black focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2 block">Target Amount ($)</label>
                  <input 
                    required
                    type="number"
                    value={isNaN(newGoal.targetAmount) ? '' : newGoal.targetAmount}
                    onChange={e => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                    className="w-full bg-[#F5F5F4] border-none rounded-xl p-4 font-bold outline-none ring-black focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2 block">Target Date (Optional)</label>
                  <input 
                    type="date"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="w-full bg-[#F5F5F4] border-none rounded-xl p-4 font-bold outline-none ring-black focus:ring-2"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                 <button 
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-4 bg-zinc-100 text-[#6B6B6B] rounded-xl font-bold hover:bg-zinc-200"
                 >
                  Back
                 </button>
                 <button 
                  type="submit"
                  className="flex-1 py-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800"
                 >
                  Save Goal
                 </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-black rounded-[40px] p-12 text-white overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6">Why invest with EliteFund?</h3>
            <div className="space-y-6">
              <Feature 
                icon={ShieldCheck} 
                title="Protected Capital" 
                desc="We use advanced hedging strategies to protect your initial investment." 
              />
              <Feature 
                icon={Zap} 
                title="Daily Liquidity" 
                desc="Withdraw your earnings every 24 hours directly to your wallet." 
              />
              <Feature 
                icon={Target} 
                title="AI Optimized" 
                desc="Our algorithms scan 24/7 for high-probability market opportunities." 
              />
            </div>
          </div>
          <div className="hidden md:block">
             <div className="aspect-square bg-zinc-800 rounded-3xl p-8 flex flex-col justify-between border border-zinc-700">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-zinc-700 rounded-full animate-pulse" />
                  <div className="h-4 w-1/2 bg-zinc-700 rounded-full animate-pulse" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800" />
                        <div className="space-y-1">
                          <div className="h-3 w-20 bg-zinc-800 rounded" />
                          <div className="h-2 w-12 bg-zinc-800 rounded" />
                        </div>
                      </div>
                      <div className="h-3 w-12 bg-green-500/20 rounded-full" />
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/50 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-800/30 rounded-full blur-[80px] -ml-32 -mb-32" />
      </div>
    </div>
  );
}

function PlanCard({ plan, index, onInvest, market, userBalance }: { plan: InvestmentPlan, index: number, onInvest: (plan: InvestmentPlan, amount: number) => void, market?: MarketData, userBalance: number, key?: React.Key }) {
  const [amount, setAmount] = React.useState(plan.minInvestment.toString());
  
  const numAmount = parseFloat(amount);
  const isBelowMin = numAmount < plan.minInvestment;
  const isAboveBalance = numAmount > userBalance;
  const hasError = isBelowMin || isAboveBalance || isNaN(numAmount);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[40px] border border-[#E5E5E5] p-8 flex flex-col hover:border-black transition-all group relative overflow-hidden"
    >
      {market && (
        <div className="absolute top-0 right-0 p-4">
           <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${market.change24h >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {market.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(market.change24h)}%
           </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 text-[#6B6B6B] mb-2">
           {plan.linkedCommodity === 'OIL' && <Droplets className="w-4 h-4" />}
           {plan.linkedCommodity === 'GOLD' && <Coins className="w-4 h-4 text-yellow-500" />}
           {plan.linkedCommodity === 'SILVER' && <Activity className="w-4 h-4 text-zinc-400" />}
           {plan.linkedCommodity === 'NONE' && <Info className="w-4 h-4" />}
           <span className="text-[10px] font-black uppercase tracking-widest">{plan.linkedCommodity || 'Fixed'} Derivative</span>
        </div>
        <h4 className="text-xl font-black tracking-tight mb-2 uppercase">{plan.name}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black">{plan.dailyRoi}%</span>
          <span className="text-[#6B6B6B] text-[10px] font-black uppercase tracking-widest">Base ROI</span>
        </div>
        {market && (
           <p className="text-[10px] font-bold text-zinc-400 mt-1">
             Live {plan.linkedCommodity} Price: <span className="text-black font-mono">${market.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
           </p>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
          <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest mb-2">Expected Yield Calculator</p>
          <div className="flex justify-between items-end">
             <div>
                <p className="text-lg font-black">${(parseFloat(amount) * (plan.dailyRoi / 100) * plan.durationDays || 0).toLocaleString()}</p>
                <p className="text-[9px] font-bold uppercase text-zinc-400">Net Profit</p>
             </div>
             <div className="text-right">
                <p className="text-lg font-black">${(parseFloat(amount) * (1 + (plan.dailyRoi / 100) * plan.durationDays) || 0).toLocaleString()}</p>
                <p className="text-[9px] font-bold uppercase text-zinc-400">Total Return</p>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <label className="text-xs font-bold text-[#6B6B6B] uppercase">Investment Amount</label>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Min: ${plan.minInvestment}</span>
        </div>
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">$</span>
          <input 
            type="number" 
            value={amount === 'NaN' ? '' : amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full bg-[#F5F5F4] border-none rounded-xl py-3 pl-8 pr-4 font-bold outline-none focus:ring-2 ${hasError ? 'ring-red-500 bg-red-50' : 'ring-black'}`} 
          />
          {isBelowMin && (
            <p className="absolute -bottom-5 left-0 text-[9px] font-bold text-red-500 uppercase tracking-widest">Amount must be at least ${plan.minInvestment}</p>
          )}
          {isAboveBalance && !isBelowMin && (
            <p className="absolute -bottom-5 left-0 text-[9px] font-bold text-red-500 uppercase tracking-widest">Exceeds available balance</p>
          )}
        </div>
        <button 
          disabled={hasError}
          onClick={() => onInvest(plan, parseFloat(amount))}
          className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:bg-zinc-300"
        >
          {isAboveBalance ? 'Insufficient Funds' : 'Invest Now'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function Feature({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h5 className="font-bold mb-1">{title}</h5>
        <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
