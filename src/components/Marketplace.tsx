import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, ChevronRight, ShoppingCart, Info, TrendingUp, Shield } from 'lucide-react';
import { FUNDED_ACCOUNTS } from '../constants';
import { MarketData, FundedAccount, PaymentSettings } from '../types';
import InvestmentFlow from './InvestmentFlow';

interface MarketplaceProps {
  onPurchase: (account: FundedAccount) => void;
  accounts: FundedAccount[];
  userBalance: number;
  marketData: MarketData[];
  paymentSettings: PaymentSettings;
}

export default function Marketplace({ onPurchase, accounts, userBalance, marketData, paymentSettings }: MarketplaceProps) {
  const [filterSize, setFilterSize] = React.useState<number | 'all'>('all');
  const [sortBy, setSortBy] = React.useState<'price-asc' | 'price-desc' | 'size-desc'>('size-desc');
  const [selectedAccountFlow, setSelectedAccountFlow] = React.useState<FundedAccount | null>(null);

  const filteredAccounts = React.useMemo(() => {
    let result = [...(accounts || [])];
    
    if (filterSize !== 'all') {
      result = result.filter(acc => acc.size >= filterSize);
    }

    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'size-desc') return b.size - a.size;
      return 0;
    });

    return result;
  }, [filterSize, sortBy]);

  return (
    <div className="space-y-12">
      <InvestmentFlow 
        isOpen={!!selectedAccountFlow}
        onClose={() => setSelectedAccountFlow(null)}
        onConfirm={() => {
          if (selectedAccountFlow) {
            onPurchase(selectedAccountFlow);
          }
        }}
        type="account"
        item={selectedAccountFlow}
        userBalance={userBalance}
        marketData={marketData}
        paymentSettings={paymentSettings}
      />

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Funded Accounts</h2>
          <p className="text-[#6B6B6B] text-lg">
            Purchase high-capital trading accounts. We provide the liquidity, you provide the skills. 
            Keep up to 90% of the profits you generate.
          </p>
        </div>
      </header>

      {/* Filters & Sorting */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest px-2">Filter Size</span>
          <select 
            value={filterSize} 
            onChange={(e) => setFilterSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-[#F5F5F4] border-none rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 ring-black transition-all"
          >
            <option value="all">All Sizes</option>
            <option value="25000">$25k+</option>
            <option value="50000">$50k+</option>
            <option value="100000">$100k+</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest px-2">Sort By</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#F5F5F4] border-none rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 ring-black transition-all"
          >
            <option value="size-desc">Largest Size</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        
        <div className="ml-auto text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">
          {filteredAccounts.length} Accounts Available
        </div>
      </div>

      {/* Grid Table Layout */}
      <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-xl shadow-black/[0.02]">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-6 bg-[#F5F5F4] border-b border-[#E5E5E5] hidden md:grid">
          <HeaderLabel label="Account Size" />
          <HeaderLabel label="Profit Target" />
          <HeaderLabel label="Max Drawdown" />
          <HeaderLabel label="Leverage" />
          <HeaderLabel label="Price" />
          <div />
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#E5E5E5]">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => (
              <AccountRow 
                key={account.id} 
                account={account} 
                onPurchase={(acc) => setSelectedAccountFlow(acc)} 
              />
            ))
          ) : (
            <div className="p-20 text-center text-[#6B6B6B]">
              No accounts match your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InfoCard 
          icon={Shield}
          title="Secure Liquidity"
          desc="Our accounts are backed by institutional liquidity providers to ensure smooth executions."
        />
        <InfoCard 
          icon={BarChart3}
          title="Advanced Dashboard"
          desc="Real-time tracking of your trading metrics, risk parameters, and profit share."
        />
        <InfoCard 
          icon={TrendingUp}
          title="Profit Share"
          desc="Scaling plan available. Increase your capital size by 25% every 4 months of consistency."
        />
      </div>
    </div>
  );
}

function AccountRow({ account, onPurchase }: { account: FundedAccount, onPurchase: (account: FundedAccount) => void, key?: React.Key }) {
  const isSold = account.isSold;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-6 gap-4 p-6 lg:p-8 items-center hover:bg-[#FBFBFA] transition-colors group relative ${isSold ? 'grayscale opacity-70' : ''}`}>
      {isSold && (
        <div className="absolute top-4 left-4 z-10">
           <span className="px-2 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-tighter rounded-sm rotate-[-5deg] shadow-lg">
             SOLD OUT
           </span>
        </div>
      )}

      {/* Mobile labels shown only on mobile */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-[#6B6B6B] font-bold md:hidden">Size</span>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isSold ? 'bg-zinc-400' : 'bg-black'} rounded-lg flex items-center justify-center transition-colors`}>
             <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-bold tracking-tight">${account.size.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-[#6B6B6B] font-bold md:hidden">Target</span>
        <p className="font-mono text-sm text-[#1A1A1A]">${account.target.toLocaleString()}</p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-[#6B6B6B] font-bold md:hidden">Drawdown</span>
        <p className="font-mono text-sm text-red-500">${account.drawdown.toLocaleString()}</p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-[#6B6B6B] font-bold md:hidden">Leverage</span>
        <span className="px-3 py-1 bg-[#F5F5F4] rounded-full text-[10px] font-bold uppercase w-fit">{account.leverage}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-[#6B6B6B] font-bold md:hidden">Price</span>
        <p className={`text-2xl font-bold ${isSold ? 'line-through text-zinc-400' : ''}`}>${account.price}</p>
      </div>

      <div className="flex justify-end pt-4 md:pt-0">
        <button 
          disabled={isSold}
          onClick={() => !isSold && onPurchase(account)}
          className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
            isSold 
            ? 'bg-zinc-100 text-zinc-400 shadow-none cursor-not-allowed' 
            : 'bg-black text-white hover:scale-105 active:scale-95 shadow-black/10'
          }`}
        >
          {isSold ? 'Claimed' : 'Purchase'}
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function HeaderLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest italic">{label}</p>
  );
}

function InfoCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 bg-[#F5F5F4] rounded-[32px] border border-[#E5E5E5]">
      <Icon className="w-8 h-8 mb-4" />
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <p className="text-[#6B6B6B] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
