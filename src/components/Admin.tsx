import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Settings2, 
  Target, 
  Plus, 
  Trash2, 
  Save, 
  Edit3, 
  ArrowUpRight, 
  DollarSign, 
  Wallet, 
  ShieldCheck, 
  BarChart2, 
  Search,
  Check,
  X,
  BellRing,
  Clock,
  ArrowDownLeft,
  ArrowRight,
  Landmark
} from 'lucide-react';
import { InvestmentPlan, FundedAccount, PaymentSettings, UserAccount, Transaction, PaymentMethod } from '../types';

interface AdminProps {
  plans: InvestmentPlan[];
  setPlans: (plans: InvestmentPlan[]) => void;
  accounts: FundedAccount[];
  setAccounts: (accounts: FundedAccount[]) => void;
  paymentSettings: PaymentSettings;
  setPaymentSettings: (settings: PaymentSettings) => void;
  onUpdateUser: (email: string, updates: Partial<UserAccount>) => void;
  marketData: any[];
}

type AdminTab = 'users' | 'requests' | 'plans' | 'accounts' | 'payments';

export default function Admin({ 
  plans, 
  setPlans, 
  accounts, 
  setAccounts, 
  paymentSettings, 
  setPaymentSettings,
  onUpdateUser,
  marketData
}: AdminProps) {
  const [activeTab, setActiveTab] = React.useState<AdminTab>('users');
  const [accountsSubTab, setAccountsSubTab] = React.useState<'inventory' | 'purchases'>('inventory');
  const [users, setUsers] = React.useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Load all users from localStorage
  const refreshUsers = () => {
    const usersMap = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
    setUsers(Object.values(usersMap));
  };

  React.useEffect(() => {
    refreshUsers();
  }, []);

  const filteredUsers = React.useMemo(() => {
    return users.map(user => {
      let totalMarketProfit = 0;
      let totalBaseProfit = 0;
      
      (user.investments || []).forEach(inv => {
        if (inv.status !== 'active') return;
        const plan = plans.find(p => p.id === inv.planId);
        if (!plan) return;
        
        const startDate = new Date(inv.startDate).getTime();
        const now = new Date().getTime();
        const diffDays = (now - startDate) / (1000 * 60 * 60 * 24);
        const elapsedDays = Math.max(0, Math.min(diffDays, plan.durationDays));
        totalBaseProfit += inv.amount * (plan.dailyRoi / 100) * elapsedDays;
        
        if (plan.linkedCommodity && plan.linkedCommodity !== 'NONE' && inv.entryPrice) {
          const market = (marketData as any[]).find(m => m.symbol === plan.linkedCommodity);
          if (market) {
            totalMarketProfit += inv.amount * ((market.price - inv.entryPrice) / inv.entryPrice);
          }
        }
      });
      return {
        ...user,
        totalPortfolioValue: user.balance + user.totalInvested + totalBaseProfit + totalMarketProfit
      };
    }).filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, plans, marketData, searchTerm]);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Master Control</h2>
          <p className="text-[#6B6B6B] font-medium uppercase tracking-widest text-xs">Administrative Dashboard</p>
        </div>
        
        <div className="flex bg-white border border-[#E5E5E5] p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Users" />
          <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={BellRing} label="Requests" />
          <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={Target} label="Plans" />
          <TabButton active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={BarChart2} label="Accounts" />
          <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={Wallet} label="Methods" />
        </div>
      </header>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[600px]"
      >
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Search elite members by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F5F5F4] border-none rounded-2xl py-4 pl-12 pr-6 font-bold outline-none ring-black focus:ring-2 transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-sm overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E5E5] bg-zinc-50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Member</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Financials</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filteredUsers.map(user => (
                    <UserRow key={user.email} user={user} onUpdate={(updates) => {
                      onUpdateUser(user.email, updates);
                      refreshUsers();
                    }} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-sm overflow-x-auto no-scrollbar">
             <table className="w-full text-left min-w-[1000px]">
                <thead>
                 <tr className="border-b border-[#E5E5E5] bg-zinc-50">
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Type</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">User</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Amount</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Verification / Destination</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Time</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Decision</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#E5E5E5]">
                 {users.flatMap(u => (u.transactions || []).map(t => ({ ...t, userEmail: u.email, userName: u.name })))
                   .filter(t => t.status === 'pending')
                   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                   .map(tx => (
                     <tr key={tx.id} className="hover:bg-zinc-50 transition-colors">
                       <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                           {tx.type === 'deposit' ? (
                             <ArrowDownLeft className="w-4 h-4 text-green-600" />
                           ) : (
                             <ArrowUpRight className="w-4 h-4 text-orange-600" />
                           )}
                           <span className="text-sm font-bold capitalize">{tx.type}</span>
                         </div>
                       </td>
                       <td className="px-8 py-6">
                         <p className="font-bold text-sm tracking-tight">{tx.userName}</p>
                         <p className="text-xs text-[#6B6B6B]">{tx.userEmail}</p>
                       </td>
                       <td className="px-8 py-6">
                         <p className="font-black text-sm">${tx.amount.toLocaleString()}</p>
                       </td>
                       <td className="px-8 py-6">
                         <div className="max-w-[200px]">
                           <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                             {tx.type === 'deposit' ? 'Ref Key' : 'Payout Details'}
                           </p>
                           <p className="font-mono text-[10px] bg-zinc-100 p-2 rounded-lg text-zinc-600 break-all leading-tight">
                             {tx.type === 'deposit' ? (tx.verificationKey || '--') : (tx.withdrawalDetails || '--')}
                           </p>
                         </div>
                       </td>
                       <td className="px-8 py-6">
                         <p className="text-xs text-[#6B6B6B] flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {new Date(tx.date).toLocaleString()}
                         </p>
                       </td>
                       <td className="px-8 py-6">
                         <div className="flex gap-2">
                           <button 
                             onClick={() => {
                               const updates: Partial<UserAccount> = {};
                               const usersMap = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
                               const u = usersMap[tx.userEmail!];
                               if (u) {
                                 u.transactions = u.transactions.map((it: Transaction) => 
                                   it.id === tx.id ? { ...it, status: 'completed' } : it
                                 );
                                  if (tx.type === 'deposit') {
                                    const txFee = tx.fee || 0;
                                    const netAmount = tx.amount - txFee;
                                    u.balance += netAmount;

                                    if (txFee > 0) {
                                       u.transactions = [
                                         {
                                           id: Math.random().toString(36).substr(2, 9),
                                           type: 'deposit',
                                           amount: txFee,
                                           description: `Deposit tax deducted`,
                                           date: new Date().toISOString(),
                                           status: 'completed',
                                           userEmail: tx.userEmail,
                                           userName: tx.userName
                                         } as Transaction,
                                         ...u.transactions
                                       ];
                                    }
                                  }
                                 // Withdrawal balance was deducted during request to lock it
                                 onUpdateUser(tx.userEmail!, u);
                                 refreshUsers();
                               }
                             }}
                             className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-colors"
                           >
                             <Check className="w-4 h-4" /> Approve
                           </button>
                           <button 
                             onClick={() => {
                               const usersMap = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
                               const u = usersMap[tx.userEmail!];
                               if (u) {
                                  u.transactions = u.transactions.map((it: Transaction) => 
                                    it.id === tx.id ? { ...it, status: 'rejected' } : it
                                  );
                                  if (tx.type === 'withdrawal') {
                                    const txFee = tx.fee || 0;
                                    u.balance += (tx.amount + txFee); // Full refund including fee
                                  }
                                  onUpdateUser(tx.userEmail!, u);
                                  refreshUsers();
                               }
                             }}
                             className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-colors"
                           >
                             <X className="w-4 h-4" /> Reject
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 {users.flatMap(u => (u.transactions || [])).filter(t => t.status === 'pending').length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="max-w-xs mx-auto space-y-4">
                           <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                              <BellRing className="w-8 h-8 text-zinc-300" />
                           </div>
                           <div>
                              <p className="font-bold text-lg">Inbox Zero</p>
                              <p className="text-sm text-[#6B6B6B]">All deposit and withdrawal requests have been processed.</p>
                           </div>
                        </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {plans.map(plan => (
               <PlanEditor 
                  key={plan.id} 
                  plan={plan} 
                  onSave={(updated) => setPlans(plans.map(p => p.id === plan.id ? updated : p))}
                  onDelete={() => setPlans(plans.filter(p => p.id !== plan.id))}
               />
             ))}
             <button 
                onClick={() => setPlans([...plans, { id: Math.random().toString(36).substr(2,9), name: 'New Plan', dailyRoi: 1, minInvestment: 100, durationDays: 30 }])}
                className="bg-[#F5F5F4] border-2 border-dashed border-[#E5E5E5] rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 group hover:border-black transition-all"
             >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                   <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-[#6B6B6B] uppercase tracking-widest">Create Wealth Plan</span>
             </button>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-8">
            <div className="flex bg-zinc-100 p-1 rounded-2xl w-fit">
              <button 
                onClick={() => setAccountsSubTab('inventory')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  accountsSubTab === 'inventory' ? 'bg-white text-black shadow-sm' : 'text-[#6B6B6B]'
                }`}
              >
                Inventory
              </button>
              <button 
                onClick={() => setAccountsSubTab('purchases')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  accountsSubTab === 'purchases' ? 'bg-white text-black shadow-sm' : 'text-[#6B6B6B]'
                }`}
              >
                Sold / Active
              </button>
            </div>

            {accountsSubTab === 'inventory' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {accounts.map(acc => (
                   <AccountEditor 
                      key={acc.id} 
                      account={acc} 
                      onSave={(updated) => setAccounts(accounts.map(a => a.id === acc.id ? updated : a))}
                      onDelete={() => setAccounts(accounts.filter(a => a.id !== acc.id))}
                   />
                 ))}
                 <button 
                    onClick={() => setAccounts([...accounts, { id: Math.random().toString(36).substr(2,9), size: 10000, price: 99, target: 1000, drawdown: 500, leverage: '1:100', platform: 'MetaTrader 5' }])}
                    className="bg-[#F5F5F4] border-2 border-dashed border-[#E5E5E5] rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 group hover:border-black transition-all"
                 >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                       <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-[#6B6B6B] uppercase tracking-widest">New Funded Instance</span>
                 </button>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border border-[#E5E5E5] overflow-hidden shadow-sm overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] bg-zinc-50">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Member</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Product</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Credentials</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {users.flatMap(u => (u.transactions || []).filter(t => t.type === 'purchase').map(t => ({ ...t, userEmail: u.email, userName: u.name })))
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(p => (
                        <PurchasedAccountRow 
                          key={p.id} 
                          purchase={p} 
                          onUpdate={(updates) => {
                             const usersMap = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
                             const u = usersMap[p.userEmail!];
                             if (u) {
                                u.transactions = u.transactions.map((it: Transaction) => 
                                  it.id === p.id ? { ...it, ...updates } : it
                                );
                                onUpdateUser(p.userEmail!, u);
                                refreshUsers();
                             }
                          }}
                        />
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-8">
             {/* Tax System */}
             <div className="bg-white p-8 border border-[#E5E5E5] rounded-[32px] shadow-sm space-y-6">
                <div>
                   <h3 className="text-2xl font-black mb-1">Global Tax Configuration</h3>
                   <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">Real-time service charges</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100">
                      <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-2 block">Deposit Tax (%)</label>
                      <input 
                         type="number" 
                         value={paymentSettings.depositTax ?? 0} 
                         onChange={(e) => setPaymentSettings({...paymentSettings, depositTax: parseFloat(e.target.value) || 0})}
                         className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 font-black text-xl" 
                      />
                   </div>
                   <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100 opacity-80">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black uppercase text-[#6B6B6B] block">Withdrawal Tax (%)</label>
                        <span className="text-[9px] font-black text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded">Fixed</span>
                      </div>
                      <input 
                         type="number" 
                         readOnly
                         value={25} 
                         className="w-full bg-zinc-100 border border-zinc-200 rounded-xl py-3 px-4 font-black text-xl cursor-not-allowed" 
                      />
                   </div>
                   <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100 opacity-80">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black uppercase text-[#6B6B6B] block">Investment Tax (%)</label>
                        <span className="text-[9px] font-black text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded">Fixed</span>
                      </div>
                      <input 
                         type="number" 
                         readOnly
                         value={15} 
                         className="w-full bg-zinc-100 border border-zinc-200 rounded-xl py-3 px-4 font-black text-xl cursor-not-allowed" 
                      />
                   </div>
                </div>
             </div>

             <div className="flex justify-between items-center bg-white p-8 border border-[#E5E5E5] rounded-[32px] shadow-sm">
                <div>
                   <h3 className="text-2xl font-black mb-1">Deposit Gateways</h3>
                   <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">Active Payment Channels</p>
                </div>
                <button 
                  onClick={() => setPaymentSettings({ 
                    methods: [...paymentSettings.methods, { id: Math.random().toString(), type: 'bank', name: 'New Gateway', details: '...', instructions: '...' }]
                  })}
                  className="bg-black text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                >
                   <Plus className="w-4 h-4" /> Add Method
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentSettings.methods.map(method => (
                  <div key={method.id} className="bg-white rounded-[32px] border border-[#E5E5E5] p-10 space-y-6 shadow-sm">
                     <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl ${method.type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                           {method.type === 'bank' ? <Landmark className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <button 
                          onClick={() => setPaymentSettings({ methods: paymentSettings.methods.filter(m => m.id !== method.id) })}
                          className="p-2 text-[#6B6B6B] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>

                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Method Name</label>
                              <input 
                                type="text" 
                                value={method.name} 
                                onChange={e => setPaymentSettings({ methods: paymentSettings.methods.map(m => m.id === method.id ? { ...m, name: e.target.value } : m) })}
                                className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold text-sm" 
                              />
                           </div>
                           <div>
                              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Account Name</label>
                              <input 
                                type="text" 
                                placeholder="Beneficiary Name"
                                value={method.accountName || ''} 
                                onChange={e => setPaymentSettings({ methods: paymentSettings.methods.map(m => m.id === method.id ? { ...m, accountName: e.target.value } : m) })}
                                className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold text-sm" 
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">{method.type === 'bank' ? 'Account Number / IBAN' : 'Wallet Address'}</label>
                           <input 
                             type="text" 
                             value={method.accountNumber || method.details || ''} 
                             onChange={e => setPaymentSettings({ methods: paymentSettings.methods.map(m => m.id === method.id ? { ...m, accountNumber: e.target.value, details: e.target.value } : m) })}
                             className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold text-sm" 
                           />
                        </div>
                        {method.type === 'crypto' && (
                           <div>
                              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Network</label>
                              <input 
                                type="text" 
                                value={method.network || ''} 
                                onChange={e => setPaymentSettings({ methods: paymentSettings.methods.map(m => m.id === method.id ? { ...m, network: e.target.value } : m) })}
                                className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold" 
                              />
                           </div>
                        )}
                        <div>
                           <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Verification Required</label>
                           <input 
                             type="text" 
                             placeholder="e.g. Transaction ID, Receipt Upload"
                             value={method.verificationMethod || ''} 
                             onChange={e => setPaymentSettings({ methods: paymentSettings.methods.map(m => m.id === method.id ? { ...m, verificationMethod: e.target.value } : m) })}
                             className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold text-sm" 
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Public Instructions</label>
                           <textarea 
                             rows={2}
                             value={method.instructions || ''} 
                             onChange={e => setPaymentSettings({ methods: paymentSettings.methods.map(m => m.id === method.id ? { ...m, instructions: e.target.value } : m) })}
                             className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold text-xs text-[#6B6B6B]" 
                           />
                        </div>
                        <div className="flex gap-2 pt-2">
                           <button 
                             onClick={() => setPaymentSettings({ methods: paymentSettings.methods.map(m => m.id === method.id ? { ...m, type: m.type === 'bank' ? 'crypto' : 'bank' } : m) })}
                             className="flex-1 bg-zinc-100 text-[#6B6B6B] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200"
                           >
                             Switch to {method.type === 'bank' ? 'Crypto' : 'Bank'}
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface UserRowProps {
  user: UserAccount;
  onUpdate: (u: Partial<UserAccount>) => void;
  key?: React.Key;
}

function UserRow({ user, onUpdate }: UserRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [balance, setBalance] = React.useState(user.balance.toString());
  const [rank, setRank] = React.useState(user.rank);

  const handleSave = () => {
    const val = parseFloat(balance);
    onUpdate({ balance: isNaN(val) ? user.balance : val, rank });
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="px-8 py-6">
        <p className="font-bold text-sm tracking-tight">{user.name}</p>
        <p className="text-xs text-[#6B6B6B]">{user.email}</p>
      </td>
      <td className="px-8 py-6">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-zinc-400" />
            <input 
              type="number"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              className="w-24 bg-white border border-[#E5E5E5] rounded-lg px-2 py-1 text-sm font-bold"
            />
          </div>
        ) : (
          <div>
            <p className="font-bold text-sm text-green-600">${user.balance.toLocaleString()}</p>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Equity: ${(user as any).totalPortfolioValue?.toLocaleString() || '--'}</p>
          </div>
        )}
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">Principal: ${user.totalInvested.toLocaleString()}</p>
      </td>
      <td className="px-8 py-6">
        {isEditing ? (
          <input 
            type="text"
            value={rank}
            onChange={e => setRank(e.target.value)}
            className="w-32 bg-white border border-[#E5E5E5] rounded-lg px-2 py-1 text-sm font-bold"
          />
        ) : (
          <span className="px-3 py-1 bg-zinc-100 text-[#1A1A1A] rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-200">
            {user.rank}
          </span>
        )}
      </td>
      <td className="px-8 py-6">
        {isEditing ? (
          <div className="flex gap-2">
             <button onClick={handleSave} className="p-2 bg-black text-white rounded-lg hover:bg-zinc-800"><Check className="w-4 h-4" /></button>
             <button onClick={() => setIsEditing(false)} className="p-2 bg-zinc-200 text-black rounded-lg hover:bg-zinc-300"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-[#6B6B6B] hover:text-black flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> Adjust
          </button>
        )}
      </td>
    </tr>
  );
}

interface PlanEditorProps {
  plan: InvestmentPlan;
  onSave: (p: InvestmentPlan) => void;
  onDelete: () => void;
  key?: React.Key;
}

function PlanEditor({ plan, onSave, onDelete }: PlanEditorProps) {
   const [tempPlan, setTempPlan] = React.useState(plan);
   const [hasChanged, setHasChanged] = React.useState(false);

   const update = (updates: Partial<InvestmentPlan>) => {
      setTempPlan({...tempPlan, ...updates});
      setHasChanged(true);
   };

   return (
     <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 space-y-6 shadow-sm hover:shadow-md transition-all">
        <div>
           <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Plan Name</label>
           <input 
              type="text" 
              value={tempPlan.name} 
              onChange={e => update({name: e.target.value})}
              className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold text-lg" 
           />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">ROI (%)</label>
              <input 
                 type="number" 
                 value={isNaN(tempPlan.dailyRoi) ? '' : tempPlan.dailyRoi} 
                 onChange={e => update({dailyRoi: parseFloat(e.target.value)})}
                 className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold" 
              />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Duration (Days)</label>
              <input 
                 type="number" 
                 value={isNaN(tempPlan.durationDays) ? '' : tempPlan.durationDays} 
                 onChange={e => update({durationDays: parseInt(e.target.value)})}
                 className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold" 
              />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Asset Reference</label>
              <select 
                 value={tempPlan.linkedCommodity || 'NONE'} 
                 onChange={e => update({linkedCommodity: e.target.value as any})}
                 className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold text-xs"
              >
                 <option value="NONE">None (Fixed ROI)</option>
                 <option value="GOLD">Gold (XAU)</option>
                 <option value="SILVER">Silver (XAG)</option>
                 <option value="OIL">Crude Oil (WTI)</option>
              </select>
           </div>
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Minimum ($)</label>
              <input 
                 type="number" 
                 value={isNaN(tempPlan.minInvestment) ? '' : tempPlan.minInvestment} 
                 onChange={e => update({minInvestment: parseFloat(e.target.value)})}
                 className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 font-bold" 
              />
           </div>
        </div>
        <div className="flex gap-3 pt-4">
           <button 
              onClick={() => {onSave(tempPlan); setHasChanged(false);}}
              disabled={!hasChanged}
              className="flex-1 py-3 bg-black text-white rounded-xl text-xs font-bold disabled:opacity-30 transition-all flex items-center justify-center gap-2"
           >
              <Save className="w-3 h-3" /> Save Changes
           </button>
           <button onClick={onDelete} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
        </div>
     </div>
   );
}

interface AccountEditorProps {
  account: FundedAccount;
  onSave: (a: FundedAccount) => void;
  onDelete: () => void;
  key?: React.Key;
}

function AccountEditor({ account, onSave, onDelete }: AccountEditorProps) {
   const [tempAcc, setTempAcc] = React.useState(account);
   const [hasChanged, setHasChanged] = React.useState(false);

   const update = (updates: Partial<FundedAccount>) => {
      setTempAcc({...tempAcc, ...updates});
      setHasChanged(true);
   };

   return (
     <div className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 space-y-4 shadow-sm relative">
        {account.isSold && (
           <div className="absolute top-4 right-4 px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded uppercase tracking-widest border border-red-200">
             Sold Out
           </div>
        )}
        <h4 className="text-xl font-black mb-4">Account ID: {account.id}</h4>
        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Size ($)</label>
              <input type="number" value={isNaN(tempAcc.size) ? '' : tempAcc.size} onChange={e => update({size: parseInt(e.target.value)})} className="w-full bg-zinc-50 rounded-xl py-2 px-3 font-bold text-sm" />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Price ($)</label>
              <input type="number" value={isNaN(tempAcc.price) ? '' : tempAcc.price} onChange={e => update({price: parseFloat(e.target.value)})} className="w-full bg-zinc-50 rounded-xl py-2 px-3 font-bold text-sm" />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Target ($)</label>
              <input type="number" value={isNaN(tempAcc.target) ? '' : tempAcc.target} onChange={e => update({target: parseInt(e.target.value)})} className="w-full bg-zinc-50 rounded-xl py-2 px-3 font-bold text-sm" />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Drawdown ($)</label>
              <input type="number" value={isNaN(tempAcc.drawdown) ? '' : tempAcc.drawdown} onChange={e => update({drawdown: parseInt(e.target.value)})} className="w-full bg-zinc-50 rounded-xl py-2 px-3 font-bold text-sm" />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Platform</label>
              <input type="text" value={tempAcc.platform || ''} onChange={e => update({platform: e.target.value})} className="w-full bg-zinc-50 rounded-xl py-2 px-3 font-bold text-sm" />
           </div>
           <div className="col-span-2 h-px bg-zinc-100 my-2" />
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Account Login</label>
              <input type="text" value={tempAcc.accountLogin || ''} onChange={e => update({accountLogin: e.target.value})} className="w-full bg-zinc-50 rounded-xl py-2 px-3 font-bold text-sm" placeholder="ID (Hidden from users)" />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Account Password</label>
              <input type="text" value={tempAcc.accountPassword || ''} onChange={e => update({accountPassword: e.target.value})} className="w-full bg-zinc-50 rounded-xl py-2 px-3 font-bold text-sm" placeholder="Pass (Hidden from users)" />
           </div>
           <div className="col-span-2">
              <label className="text-[10px] font-black uppercase text-[#6B6B6B] mb-1 block">Terminal Link</label>
              <input type="text" value={tempAcc.terminalLink || ''} onChange={e => update({terminalLink: e.target.value})} className="w-full bg-zinc-50 rounded-xl py-2 px-3 font-bold text-sm" placeholder="Web Terminal URL (Hidden from users)" />
           </div>
           {tempAcc.isSold && (
              <div className="col-span-2">
                 <button 
                  onClick={() => update({ isSold: false })}
                  className="w-full py-2 bg-zinc-100 text-[#6B6B6B] rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                 >
                   Re-list in Marketplace
                 </button>
              </div>
           )}
        </div>
        <div className="flex gap-2 mt-6">
           <button 
              onClick={() => {onSave(tempAcc); setHasChanged(false);}}
              disabled={!hasChanged}
              className="flex-1 py-3 bg-black text-white rounded-xl text-xs font-bold disabled:opacity-30"
           >
              Save Account
           </button>
           <button onClick={onDelete} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
        </div>
     </div>
   );
}

function PurchasedAccountRow({ purchase, onUpdate }: any) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [login, setLogin] = React.useState(purchase.accountLogin || '');
  const [password, setPassword] = React.useState(purchase.accountPassword || '');
  const [link, setLink] = React.useState(purchase.terminalLink || '');

  const handleSave = () => {
    onUpdate({ accountLogin: login, accountPassword: password, terminalLink: link });
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="px-8 py-6">
        <p className="font-bold text-sm tracking-tight">{purchase.userName}</p>
        <p className="text-xs text-[#6B6B6B]">{purchase.userEmail}</p>
      </td>
      <td className="px-8 py-6">
        <p className="font-bold text-sm tracking-tight">{purchase.description}</p>
        <p className="text-[10px] font-bold text-zinc-400">Order ID: {purchase.id}</p>
      </td>
      <td className="px-8 py-6">
        {isEditing ? (
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Login ID"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold"
            />
            <input 
              type="text" 
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold"
            />
            <input 
              type="text" 
              placeholder="Terminal Link"
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold"
            />
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} className="flex-1 bg-black text-white py-1 rounded-md text-[10px] font-bold">Save</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-zinc-100 text-black py-1 rounded-md text-[10px] font-bold">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 w-8">Login:</span>
                <span className="text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded">{purchase.accountLogin || '--'}</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 w-8">Pass:</span>
                <span className="text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded">{purchase.accountPassword || '--'}</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 w-8">Link:</span>
                <span className="text-[10px] font-mono text-blue-600 truncate max-w-[100px]">{purchase.terminalLink || '--'}</span>
             </div>
             <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-blue-600 hover:underline pt-1">Edit Credentials</button>
          </div>
        )}
      </td>
      <td className="px-8 py-6">
        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
          Active
        </span>
      </td>
    </tr>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        active ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-[#6B6B6B] hover:bg-zinc-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
