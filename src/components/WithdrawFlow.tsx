import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Landmark, Bitcoin, CheckCircle2, ArrowRight, ShieldCheck, DollarSign, Wallet, CreditCard } from 'lucide-react';
import { PaymentSettings, PaymentMethod } from '../types';

interface WithdrawFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (amount: number, details: string) => void;
  paymentSettings: PaymentSettings;
  userBalance: number;
}

type Step = 'amount' | 'method' | 'details' | 'success';

export default function WithdrawFlow({ isOpen, onClose, onComplete, paymentSettings, userBalance }: WithdrawFlowProps) {
  const [step, setStep] = React.useState<Step>('amount');
  const [amount, setAmount] = React.useState('100');
  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod | null>(null);
  const [accountType, setAccountType] = React.useState('');
  const [accountName, setAccountName] = React.useState('');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [error, setError] = React.useState('');

  const reset = () => {
    setStep('amount');
    setAmount('100');
    setSelectedMethod(null);
    setAccountType('');
    setAccountName('');
    setAccountNumber('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleNext = () => {
    if (step === 'amount') {
      const val = parseFloat(amount);
      if (isNaN(val) || val <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      if (val > userBalance) {
        setError('Insufficient balance');
        return;
      }
      setError('');
      setStep('method');
    }
    else if (step === 'method') {
      setStep('details');
    }
    else if (step === 'details') {
      if (!accountName.trim() || !accountNumber.trim()) {
        setError('Please fill in all required payout details');
        return;
      }

      const formattedDetails = selectedMethod?.type === 'bank' 
        ? `Account Name: ${accountName}\nAccount Number: ${accountNumber}\nType: ${accountType || 'N/A'}`
        : `Wallet Address: ${accountNumber}\nNetwork: ${accountType || 'N/A'}\nHolder: ${accountName}`;

      onComplete(parseFloat(amount), formattedDetails);
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
                    <div className="flex justify-between items-end mb-2">
                      <h3 className="text-3xl font-bold tracking-tight">Withdrawal</h3>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest">Available</p>
                        <p className="font-bold text-sm">${userBalance.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-[#6B6B6B]">Enter the amount you wish to withdraw.</p>
                  </header>
                  <div className="space-y-4">
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
                      <input 
                        type="number"
                        value={amount === 'NaN' ? '' : amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setError('');
                        }}
                        className="w-full bg-[#F5F5F4] border-none rounded-2xl py-6 pl-12 pr-6 text-3xl font-bold outline-none focus:ring-2 ring-black"
                      />
                    </div>
                    
                    {(paymentSettings.withdrawalTax ?? 0) > 0 && (
                      <div className="bg-zinc-50 p-5 rounded-[20px] border border-zinc-100 space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-[#6B6B6B] tracking-widest">
                          <span>Service Tax ({paymentSettings.withdrawalTax}%)</span>
                          <span>${((parseFloat(amount) || 0) * (paymentSettings.withdrawalTax || 0) / 100).toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-zinc-200" />
                        <div className="flex justify-between text-xs font-black">
                          <span>Total Deduction</span>
                          <span>${((parseFloat(amount) || 0) * (1 + (paymentSettings.withdrawalTax || 0) / 100)).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
                  </div>
                  <button 
                    onClick={handleNext}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Select Method
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 'method' && (
                <div className="space-y-8">
                  <header>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Payout Method</h3>
                    <p className="text-[#6B6B6B]">How would you like to receive your funds?</p>
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
                            {m.type === 'bank' ? <Landmark className="w-5 h-5" /> : <Bitcoin className="w-5 h-5" />}
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
                    Enter Details
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 'details' && selectedMethod && (
                <div className="space-y-8">
                  <header>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">Destination Details</h3>
                    <p className="text-[#6B6B6B]">Provide your {selectedMethod.type} details for the payout.</p>
                  </header>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-2 block tracking-widest">
                          {selectedMethod.type === 'bank' ? 'Account Name' : 'Recipient Name'}
                        </label>
                        <input 
                          type="text"
                          value={accountName}
                          onChange={(e) => {
                            setAccountName(e.target.value);
                            setError('');
                          }}
                          placeholder="e.g. John Doe"
                          className="w-full bg-[#F5F5F4] border-none rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 ring-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-2 block tracking-widest">
                          {selectedMethod.type === 'bank' ? 'Account Type' : 'Network Name'}
                        </label>
                        <input 
                          type="text"
                          value={accountType}
                          onChange={(e) => {
                            setAccountType(e.target.value);
                            setError('');
                          }}
                          placeholder={selectedMethod.type === 'bank' ? "Savings/Business" : "e.g. TRC20"}
                          className="w-full bg-[#F5F5F4] border-none rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 ring-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-2 block tracking-widest">
                        {selectedMethod.type === 'bank' ? 'Account Number / IBAN' : 'Full Wallet Address'}
                      </label>
                      <input 
                        type="text"
                        value={accountNumber}
                        onChange={(e) => {
                          setAccountNumber(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter credentials carefully"
                        className="w-full bg-[#F5F5F4] border-none rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 ring-black"
                      />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 text-xs font-medium">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-black" />
                    <p>Withdrawals are manually reviewed by admin. Processing normally takes 1-6 hours.</p>
                  </div>

                  <button 
                    onClick={handleNext}
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Submit Request
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto scale-110">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Request Submitted</h3>
                    <p className="text-[#6B6B6B]">Your withdrawal of <strong>${amount}</strong> is pending review. Funds have been locked from your balance.</p>
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
                    {['amount', 'method', 'details'].map((s, i) => (
                        <div 
                            key={s} 
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                (i <= ['amount', 'method', 'details'].indexOf(step)) ? 'bg-black' : 'bg-zinc-100'
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
