import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Landmark, Bitcoin, CheckCircle2, Copy, ArrowRight, ShieldCheck, DollarSign, Wallet } from 'lucide-react';

import { PaymentSettings, PaymentMethod } from '../types';

interface DepositFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (amount: number, reference: string) => void;
  paymentSettings: PaymentSettings;
}

type Step = 'amount' | 'method' | 'details' | 'verification' | 'success';

export default function DepositFlow({ isOpen, onClose, onComplete, paymentSettings }: DepositFlowProps) {
  const [step, setStep] = React.useState<Step>('amount');
  const [amount, setAmount] = React.useState('100');
  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod | null>(null);
  const [refKey, setRefKey] = React.useState('');

  const reset = () => {
    setStep('amount');
    setAmount('100');
    setSelectedMethod(null);
    setRefKey('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleNext = () => {
    if (step === 'amount') setStep('method');
    else if (step === 'method') setStep('details');
    else if (step === 'details') setStep('verification');
    else if (step === 'verification') {
        onComplete(parseFloat(amount), refKey);
        setStep('success');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[40px] w-full max-w-lg p-6 md:p-10 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]"
          >
            <button
              onClick={handleClose}
              className="absolute top-8 right-8 p-2 text-[#6B6B6B] hover:text-black transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10">
              {step === 'amount' && (
                <div className="space-y-8">
                  <header>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Deposit Funds</h3>
                    <p className="text-[#6B6B6B]">How much would you like to add to your account?</p>
                  </header>
                  <div className="space-y-4">
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
                      <input 
                        type="number"
                        value={amount === 'NaN' ? '' : amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-[#F5F5F4] border-none rounded-2xl py-6 pl-12 pr-6 text-3xl font-bold outline-none focus:ring-2 ring-black"
                      />
                    </div>

                    {(paymentSettings.depositTax ?? 0) > 0 && (
                      <div className="bg-zinc-50 p-5 rounded-[20px] border border-zinc-100 space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest">
                          <span>Deposit Handling Fee ({paymentSettings.depositTax}%)</span>
                          <span>${((parseFloat(amount) || 0) * (paymentSettings.depositTax || 0) / 100).toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-zinc-200" />
                        <div className="flex justify-between text-xs font-black">
                          <span>Final Credit Estimation</span>
                          <span className="text-green-600">${((parseFloat(amount) || 0) * (1 - (paymentSettings.depositTax || 0) / 100)).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleNext}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Next Step
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 'method' && (
                <div className="space-y-8">
                  <header>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Select Method</h3>
                    <p className="text-[#6B6B6B]">Choose an administrator verified gateway.</p>
                  </header>
                  <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                    {paymentSettings.methods.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setSelectedMethod(m)}
                        className={`p-6 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                          selectedMethod?.id === m.id ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className={`p-3 rounded-xl ${m.type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {m.type === 'bank' ? <Landmark className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{m.name}</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{m.type}</p>
                          </div>
                        </div>
                        {selectedMethod?.id === m.id && <div className="w-2 h-2 bg-black rounded-full" />}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={!selectedMethod}
                    onClick={handleNext}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 'details' && selectedMethod && (
                <div className="space-y-8">
                  <header>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Payment Details</h3>
                    <p className="text-[#6B6B6B]">Transfer <strong>${amount}</strong> to the credentials below.</p>
                  </header>
                  
                  <div className="bg-[#F5F5F4] rounded-2xl p-6 space-y-4">
                    <DetailRow label={selectedMethod.type === 'bank' ? 'Bank Account / Details' : 'Wallet Address'} value={selectedMethod.accountNumber || selectedMethod.details || ''} />
                    {selectedMethod.accountName && <DetailRow label="Account Name" value={selectedMethod.accountName} />}
                    {selectedMethod.network && <DetailRow label="Network" value={selectedMethod.network} />}
                    {selectedMethod.instructions && (
                      <div className="pt-2 border-t border-zinc-200">
                        <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-1">Instructions</p>
                        <p className="text-xs font-medium leading-relaxed">{selectedMethod.instructions}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 text-xs font-medium">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-black" />
                    <div>
                      <p className="font-bold">Verification Process</p>
                      <p className="opacity-70">{selectedMethod.verificationMethod || "Admin verification within 1 hour."}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleNext}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    I Have Paid
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 'verification' && (
                <div className="space-y-8">
                  <header>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Verification</h3>
                    <p className="text-[#6B6B6B]">Enter your transaction hash or reference ID.</p>
                  </header>
                  <input 
                    type="text"
                    value={refKey}
                    onChange={(e) => setRefKey(e.target.value)}
                    placeholder="Enter Reference Number"
                    className="w-full bg-[#F5F5F4] border-none rounded-2xl py-6 px-6 text-xl font-bold outline-none focus:ring-2 ring-black uppercase"
                  />
                  <button 
                    disabled={!refKey}
                    onClick={handleNext}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    Verify Payment
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto scale-110">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Payment Submitted</h3>
                    <p className="text-[#6B6B6B]">Your deposit of <strong>${amount}</strong> is being verified. Funds will appear in your balance shortly.</p>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>

            {/* Steps indicator */}
            {step !== 'success' && (
                <div className="flex gap-2 mt-10">
                    {['amount', 'method', 'details', 'verification'].map((s, i) => (
                        <div 
                            key={s} 
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                (i <= ['amount', 'method', 'details', 'verification'].indexOf(step)) ? 'bg-black' : 'bg-zinc-100'
                            }`} 
                        />
                    ))}
                </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MethodCard({ icon: Icon, title, selected, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
        selected ? 'border-black bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200'
      }`}
    >
      <Icon className={`w-8 h-8 ${selected ? 'text-black' : 'text-zinc-400'}`} />
      <span className={`text-sm font-bold ${selected ? 'text-black' : 'text-zinc-500'}`}>{title}</span>
    </button>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-between items-center group gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest">{label}</p>
        <p className="font-bold text-sm tracking-tight break-all">{value}</p>
      </div>
      <button 
        onClick={handleCopy}
        className={`p-2 rounded-lg transition-all flex items-center justify-center min-w-[36px] ${
          copied ? 'bg-green-100' : 'hover:bg-zinc-200'
        }`}
      >
        {copied ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-zinc-400 group-hover:text-black" />
        )}
      </button>
    </div>
  );
}
