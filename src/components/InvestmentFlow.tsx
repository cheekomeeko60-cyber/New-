import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Zap, ArrowRight, CheckCircle2, Loader2, DollarSign, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { InvestmentPlan, FundedAccount, MarketData, PaymentSettings } from '../types';
import TradingViewSymbolChart from './TradingViewSymbolChart';

interface InvestmentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'plan' | 'account';
  item: InvestmentPlan | FundedAccount | null;
  amount?: number;
  userBalance: number;
  marketData: MarketData[];
  paymentSettings: PaymentSettings;
}

type Step = 'review' | 'processing' | 'success';

export default function InvestmentFlow({ isOpen, onClose, onConfirm, type, item, amount, userBalance, marketData, paymentSettings }: InvestmentFlowProps) {
  const [step, setStep] = React.useState<Step>('review');
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setStep('review');
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    setStep('processing');
    
    // Simulate smart contract execution / processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    onConfirm();
    setStep('success');
    setIsProcessing(false);
  };

  if (!item) return null;

  const isPlan = type === 'plan';
  const plan = item as InvestmentPlan;
  const account = item as FundedAccount;

  const cost = isPlan ? (amount || 0) : account.price;
  const canAfford = userBalance >= cost;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden"
            style={{ perspective: '1000px' }}
          >
            {/* Header Gradient */}
            <div className={`h-2 w-full bg-gradient-to-r ${isPlan ? 'from-blue-500 to-purple-500' : 'from-emerald-500 to-teal-500'}`} />

            <div className="p-10">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 p-2 text-[#6B6B6B] hover:text-black transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10">
                {step === 'review' && (
                  <div className="space-y-8">
                    <header>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${isPlan ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {isPlan ? <Zap className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">Review Order</h3>
                      </div>
                      <p className="text-[#6B6B6B]">Please confirm your {isPlan ? 'investment' : 'account purchase'} details below.</p>
                    </header>

                    <div className="space-y-4">
                      {/* Summary Card */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="p-6 bg-[#F5F5F4] rounded-3xl border border-zinc-100 space-y-4"
                      >
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest mb-1">
                                {isPlan ? 'Selected Plan' : 'Account Size'}
                            </p>
                            <p className="text-xl font-bold">{isPlan ? plan.name : `$${account.size.toLocaleString()}`}</p>
                            {isPlan && plan.linkedCommodity && (
                               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Linked to {plan.linkedCommodity}</p>
                            )}
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest mb-1">Yield / Terms</p>
                             <p className="font-bold">{isPlan ? `${plan.dailyRoi}% Daily` : account.leverage}</p>
                          </div>
                        </div>

                        {isPlan && marketData.find(m => m.symbol === plan.linkedCommodity) && (
                           <div className="bg-white/60 p-4 rounded-2xl flex justify-between items-center text-xs">
                              <span className="text-[#6B6B6B] font-bold uppercase tracking-widest text-[9px]">Entry Index Price</span>
                              <span className="font-mono font-bold">${marketData.find(m => m.symbol === plan.linkedCommodity)?.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                           </div>
                        )}

                        <div className="h-px bg-zinc-200" />

                        {isPlan && plan.linkedCommodity && (
                          <div className="py-2">
                             <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest mb-3 text-center">Live Asset Performance</p>
                             <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100">
                               <TradingViewSymbolChart symbol={plan.linkedCommodity} />
                             </div>
                          </div>
                        )}

                        {isPlan && (paymentSettings?.investmentTax ?? 0) > 0 && (
                          <div className="flex justify-between items-center text-xs py-1">
                            <span className="text-[#6B6B6B] font-bold uppercase tracking-widest text-[9px]">Administrative Tax ({paymentSettings.investmentTax}%)</span>
                            <span className="font-bold text-red-500">+${((amount || 0) * (paymentSettings.investmentTax || 0) / 100).toLocaleString()}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-[#6B6B6B]">Total Deduction</span>
                          <span className="text-2xl">${(cost + (isPlan ? ((amount || 0) * (paymentSettings?.investmentTax || 0) / 100) : 0)).toLocaleString()}</span>
                        </div>
                      </motion.div>

                      {/* Balance Warning */}
                      {!canAfford && (
                         <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                           <div className="p-1 bg-red-100 rounded text-red-600 shrink-0">
                             <X className="w-4 h-4" />
                           </div>
                           <p className="text-xs text-red-800 font-medium leading-relaxed">
                             Inssuficient balance. You are short of ${(cost - userBalance).toLocaleString()} to complete this transaction.
                           </p>
                         </div>
                      )}

                      <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 text-xs font-medium">
                        <ShieldCheck className="w-5 h-5 shrink-0 text-black" />
                        <p>Funds will be locked for the duration of the {isPlan ? 'plan' : 'evaluation'}. Daily returns are credited automatically.</p>
                      </div>
                    </div>

                    <button 
                      disabled={!canAfford}
                      onClick={handleConfirm}
                      className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 group"
                    >
                      Process Transaction
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {step === 'processing' && (
                  <div className="py-20 text-center space-y-8">
                     <div className="relative w-24 h-24 mx-auto">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-black"
                        />
                        <div className="absolute inset-4 rounded-full bg-zinc-50 flex items-center justify-center">
                           <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
                        </div>
                        <motion.div 
                           initial={{ scale: 0.8, opacity: 0 }}
                           animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 0.2, 0] }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className="absolute -inset-4 bg-black rounded-full"
                        />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold mb-2">Executing Transaction</h3>
                        <p className="text-[#6B6B6B]">Deploying funds to the liquidity pool...</p>
                     </div>
                     <div className="max-w-[200px] mx-auto h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2.5, ease: 'easeInOut' }}
                          className="h-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                        />
                     </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="text-center py-10 space-y-8">
                    <div className="relative">
                       <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1.1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                        className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto relative z-10"
                       >
                          <CheckCircle2 className="w-12 h-12" />
                       </motion.div>
                       
                       {/* Creative staggered particles */}
                       {[...Array(12)].map((_, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                           animate={{ 
                             opacity: [0, 1, 0], 
                             scale: [0, 1, 0],
                             x: Math.cos(i * 30 * Math.PI / 180) * 80,
                             y: Math.sin(i * 30 * Math.PI / 180) * 80,
                           }}
                           transition={{ 
                             duration: 1.2, 
                             delay: 0.1, 
                             repeat: Infinity,
                             repeatDelay: 0.5
                           }}
                           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                         >
                            <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-emerald-400'}`} />
                         </motion.div>
                       ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-3xl font-bold mb-2">Order Confirmed</h3>
                      <p className="text-[#6B6B6B] px-6">
                        Successfully {isPlan ? 'invested in the' : 'purchased the'} <strong>{isPlan ? plan.name : `$${account.size.toLocaleString()}`}</strong> account.
                      </p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-[#F5F5F4] p-6 rounded-3xl flex justify-between items-center text-sm"
                    >
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest leading-none mb-1 text-left">Transaction ID</p>
                          <p className="font-mono text-xs">{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest leading-none mb-1 text-right">Status</p>
                          <p className="font-bold text-green-600">COMPLETED</p>
                       </div>
                    </motion.div>

                    <motion.button 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      onClick={onClose}
                      className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:scale-95 transition-transform"
                    >
                      Return to Dashboard
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
