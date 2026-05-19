/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Invest from './components/Invest';
import Marketplace from './components/Marketplace';
import AIAnalyst from './components/AIAnalyst';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Admin from './components/Admin';
import { UserAccount, InvestmentPlan, FundedAccount, Transaction, Goal, PaymentSettings, MarketData } from './types';
import { INVESTMENT_PLANS, FUNDED_ACCOUNTS } from './constants';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [user, setUser] = React.useState<UserAccount | null>(null);
  const [plans, setPlans] = React.useState<InvestmentPlan[]>([]);
  const [accounts, setAccounts] = React.useState<FundedAccount[]>([]);
  const [marketData, setMarketData] = React.useState<MarketData[]>([]);
  const [paymentSettings, setPaymentSettings] = React.useState<PaymentSettings>({
    methods: [
      { 
        id: '1', 
        type: 'bank', 
        name: 'Jazzcash', 
        accountName: 'Saif Ali',
        accountNumber: '03404470109',
        instructions: 'Please transfer to the Jazzcash account and upload receipt.',
        verificationMethod: 'Upload transfer receipt or enter Transaction ID.'
      },
      { 
        id: '2', 
        type: 'crypto', 
        name: 'Crypto', 
        accountName: 'USDT TRC20',
        accountNumber: 'TXW1cW5uKpZqV46u45rLQ72MFBGLrQpyqd',
        network: 'TRC20',
        instructions: 'Only send USDT via the TRON (TRC20) network to the address provided.',
        verificationMethod: 'Enter the Transaction Hash (TXID).'
      }
    ],
    depositTax: 0,
    withdrawalTax: 25,
    investmentTax: 15
  });

  // Initialize state
  React.useEffect(() => {
    // Current User
    const currentEmail = localStorage.getItem('elitefund_current_user');
    const allUsers = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
    
    // Auto-seed admin if missing
    if (!allUsers['viralmock9535@gmail.com']) {
      allUsers['viralmock9535@gmail.com'] = {
        name: 'Master Admin',
        email: 'viralmock9535@gmail.com',
        rank: 'System Administrator',
        joinedAt: new Date().toISOString(),
        isAdmin: true,
        balance: 1000000,
        dailyEarnings: 0,
        totalInvested: 0,
        investments: [],
        transactions: [],
        goals: []
      };
      localStorage.setItem('elitefund_users', JSON.stringify(allUsers));
    }

    if (currentEmail) {
      const users = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
      if (users[currentEmail]) {
        // Ensure viralmock gets admin privileges even if account was created before the logic change
        if (currentEmail.toLowerCase() === 'viralmock9535@gmail.com') {
           users[currentEmail].isAdmin = true;
           localStorage.setItem('elitefund_users', JSON.stringify(users));
        }
        setUser(users[currentEmail]);
        setIsAuthenticated(true);
      }
    }

    // Plans
    const savedPlans = localStorage.getItem('elitefund_plans');
    if (savedPlans) setPlans(JSON.parse(savedPlans));
    else {
      setPlans(INVESTMENT_PLANS);
      localStorage.setItem('elitefund_plans', JSON.stringify(INVESTMENT_PLANS));
    }

    // Accounts
    const savedAccounts = localStorage.getItem('elitefund_accounts');
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    else {
      setAccounts(FUNDED_ACCOUNTS);
      localStorage.setItem('elitefund_accounts', JSON.stringify(FUNDED_ACCOUNTS));
    }

    // Payment Settings
    const savedPayments = localStorage.getItem('elitefund_payments');
    if (savedPayments) {
      const parsed = JSON.parse(savedPayments);
      // Ensure Jazzcash and Crypto are set as requested
      const jazzcashIdx = parsed.methods.findIndex((m: any) => m.name === 'Jazzcash' || m.id === '1');
      if (jazzcashIdx !== -1) {
        parsed.methods[jazzcashIdx] = {
          ...parsed.methods[jazzcashIdx],
          name: 'Jazzcash',
          accountName: 'Saif Ali',
          accountNumber: '03404470109',
          type: 'bank',
          instructions: 'Please transfer to the Jazzcash account and upload receipt.',
          verificationMethod: 'Upload transfer receipt or enter Transaction ID.'
        };
      } else {
        parsed.methods.unshift({
          id: '1',
          type: 'bank',
          name: 'Jazzcash',
          accountName: 'Saif Ali',
          accountNumber: '03404470109',
          instructions: 'Please transfer to the Jazzcash account and upload receipt.',
          verificationMethod: 'Upload transfer receipt or enter Transaction ID.'
        });
      }

      const cryptoIdx = parsed.methods.findIndex((m: any) => m.name === 'Crypto' || m.id === '2');
      if (cryptoIdx !== -1) {
        parsed.methods[cryptoIdx] = {
          ...parsed.methods[cryptoIdx],
          id: '2',
          type: 'crypto',
          name: 'Crypto',
          accountName: 'USDT TRC20',
          accountNumber: 'TXW1cW5uKpZqV46u45rLQ72MFBGLrQpyqd',
          network: 'TRC20',
          instructions: 'Only send USDT via the TRON (TRC20) network to the address provided.',
          verificationMethod: 'Enter the Transaction Hash (TXID).'
        };
      } else {
        parsed.methods.push({
          id: '2',
          type: 'crypto',
          name: 'Crypto',
          accountName: 'USDT TRC20',
          accountNumber: 'TXW1cW5uKpZqV46u45rLQ72MFBGLrQpyqd',
          network: 'TRC20',
          instructions: 'Only send USDT via the TRON (TRC20) network to the address provided.',
          verificationMethod: 'Enter the Transaction Hash (TXID).'
        });
      }
      parsed.withdrawalTax = 25;
      parsed.investmentTax = 15;
      setPaymentSettings(parsed);
      localStorage.setItem('elitefund_payments', JSON.stringify(parsed));
    } else {
      // If no saved payments, set the default state which already has the new values
      const defaultPayments = {
        methods: [
          { 
            id: '1', 
            type: 'bank', 
            name: 'Jazzcash', 
            accountName: 'Saif Ali',
            accountNumber: '03404470109',
            instructions: 'Please transfer to the Jazzcash account and upload receipt.',
            verificationMethod: 'Upload transfer receipt or enter Transaction ID.'
          },
          { 
            id: '2', 
            type: 'crypto', 
            name: 'Crypto', 
            accountName: 'USDT TRC20',
            accountNumber: 'TXW1cW5uKpZqV46u45rLQ72MFBGLrQpyqd',
            network: 'TRC20',
            instructions: 'Only send USDT via the TRON (TRC20) network to the address provided.',
            verificationMethod: 'Enter the Transaction Hash (TXID).'
          }
        ],
        depositTax: 0,
        withdrawalTax: 25,
        investmentTax: 15
      };
      setPaymentSettings(defaultPayments);
      localStorage.setItem('elitefund_payments', JSON.stringify(defaultPayments));
    }
  }, []);

  // Poll Market Data
  React.useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch('/api/market/prices');
        if (!res.ok) {
           // If error, don't throw yet, just use old state or wait for next interval
           return;
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
           return;
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMarketData(data);
        }
      } catch (err) {
        // Silent fail for "Failed to fetch" to avoid console clutter in some browsers
        if (err instanceof Error && err.message === 'Failed to fetch') {
           return;
        }
        console.error('Market fetch error:', err);
      }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for cross-tab updates (simulating real-time)
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'elitefund_accounts') {
        const newData = JSON.parse(e.newValue || '[]');
        if (newData.length > 0) setAccounts(newData);
      }
      if (e.key === 'elitefund_plans') {
        const newData = JSON.parse(e.newValue || '[]');
        if (newData.length > 0) setPlans(newData);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persist shared data
  React.useEffect(() => {
    if (plans.length > 0) localStorage.setItem('elitefund_plans', JSON.stringify(plans));
  }, [plans]);

  React.useEffect(() => {
    if (accounts.length > 0) localStorage.setItem('elitefund_accounts', JSON.stringify(accounts));
  }, [accounts]);

  React.useEffect(() => {
    localStorage.setItem('elitefund_payments', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  // Save specific user data to the users collection
  React.useEffect(() => {
    if (user && user.email) {
      const users = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
      users[user.email] = user;
      localStorage.setItem('elitefund_users', JSON.stringify(users));
      localStorage.setItem('elitefund_current_user', user.email);
    }
  }, [user]);

  const handleLogin = (email: string, password?: string) => {
    const users = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
    
    // Admin specific check
    if (email.toLowerCase() === 'viralmock9535@gmail.com') {
      if (password !== '9535') return false;
    }

    if (users[email]) {
      setUser(users[email]);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleSignup = (name: string, email: string) => {
    const users = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
    if (users[email]) return false;

    const newUser: UserAccount = {
      name,
      email,
      rank: 'Bronze Starter',
      joinedAt: new Date().toISOString(),
      isAdmin: email.toLowerCase() === 'viralmock9535@gmail.com',
      balance: 0, 
      dailyEarnings: 0,
      totalInvested: 0,
      investments: [],
      transactions: [],
      goals: [],
    };

    users[email] = newUser;
    localStorage.setItem('elitefund_users', JSON.stringify(users));
    setUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('elitefund_current_user');
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const addTransaction = (
    type: Transaction['type'], 
    amount: number, 
    description: string, 
    status: Transaction['status'] = 'completed', 
    verificationKey?: string, 
    withdrawalDetails?: string,
    accountLogin?: string,
    accountPassword?: string,
    terminalLink?: string,
    fee?: number
  ) => {
    if (!user) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      description,
      date: new Date().toISOString(),
      status,
      fee,
      verificationKey,
      withdrawalDetails,
      accountLogin,
      accountPassword,
      terminalLink,
      userEmail: user.email,
      userName: user.name
    };
    setUser(prev => prev ? ({
      ...prev,
      transactions: [newTx, ...(prev.transactions || [])].slice(0, 100),
    }) : null);
  };

  const handleInvest = (plan: InvestmentPlan, amount: number) => {
    if (!user) return;
    
    if (amount < plan.minInvestment) {
      alert(`Minimum investment for this plan is $${plan.minInvestment}`);
      return;
    }

    const taxPrc = paymentSettings.investmentTax || 0;
    const taxAmount = (amount * taxPrc) / 100;
    const totalCost = amount + taxAmount;

    if (totalCost > user.balance) {
      alert(`Insufficient balance! Total required including ${taxPrc}% tax: $${totalCost.toLocaleString()}`);
      return;
    }

    const currentMarketPrice = marketData.find(m => m.symbol === plan.linkedCommodity)?.price;

    const newInvestment = {
      id: Math.random().toString(36).substr(2, 9),
      planId: plan.id,
      amount: amount,
      startDate: new Date().toISOString(),
      status: 'active' as const,
      entryPrice: currentMarketPrice || 0,
      currentValue: amount,
      lastUpdate: new Date().toISOString(),
    };

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance - totalCost,
      totalInvested: (prev.totalInvested || 0) + amount,
      investments: [...(prev.investments || []), newInvestment],
    }) : null);

    addTransaction('investment', amount, `Invested in ${plan.name} @ $${currentMarketPrice || 'Market'}`, 'completed', undefined, undefined, undefined, undefined, undefined, taxAmount);
  };

  const handlePurchase = (account: FundedAccount) => {
    if (!user || account.price > user.balance) {
      alert('Insufficient balance!');
      return;
    }

    if (account.isSold) {
      alert('This account has already been purchased by another user!');
      return;
    }

    // Mark account as sold in global state
    const updatedAccounts = accounts.map(a => a.id === account.id ? { ...a, isSold: true } : a);
    setAccounts(updatedAccounts);
    localStorage.setItem('elitefund_accounts', JSON.stringify(updatedAccounts));

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance - account.price,
    }) : null);
    
    addTransaction(
      'purchase', 
      account.price, 
      `Purchased $${account.size.toLocaleString()} Funded Account`,
      'completed',
      undefined,
      undefined,
      account.accountLogin || 'Assigning...',
      account.accountPassword || 'Assigning...',
      account.terminalLink || 'Generating...'
    );
  };

  const handleDeposit = (amount: number, verificationKey?: string) => {
    // Deposit starts as PENDING for admin approval
    const taxPrc = paymentSettings.depositTax || 0;
    const taxAmount = (amount * taxPrc) / 100;
    const description = taxPrc > 0 
      ? `Deposit request submitted (Subject to ${taxPrc}% tax)` 
      : 'Deposit request submitted';

    addTransaction('deposit', amount, description, 'pending', verificationKey, undefined, undefined, undefined, undefined, taxAmount);
    alert('Deposit request submitted! Admin will verify your payment shortly.');
  };

  const handleWithdraw = (amount: number, withdrawalDetails?: string) => {
    if (!user) return;
    
    const taxPrc = paymentSettings.withdrawalTax || 0;
    const taxAmount = (amount * taxPrc) / 100;
    const totalDeduction = amount + taxAmount;

    if (totalDeduction > user.balance) {
      alert(`Insufficient balance! Total required including ${taxPrc}% withdrawal tax: $${totalDeduction.toLocaleString()}`);
      return;
    }

    // Withdrawal also starts as PENDING and deducts balance upfront (locked)
    setUser(prev => prev ? ({ ...prev, balance: prev.balance - totalDeduction }) : null);
    
    addTransaction('withdrawal', amount, 'Withdrawal request submitted', 'pending', undefined, withdrawalDetails, undefined, undefined, undefined, taxAmount);
  };

  const handleAddGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      currentAmount: 0
    };
    setUser(prev => prev ? ({ ...prev, goals: [...(prev.goals || []), newGoal] }) : null);
  };

  const handleUpdateProfile = (updates: Partial<UserAccount>) => {
    setUser(prev => prev ? ({ ...prev, ...updates }) : null);
  };

  const handleClaim = (investmentId: string) => {
    if (!user) return;
    
    const investment = user.investments.find(inv => inv.id === investmentId);
    if (!investment || investment.status !== 'active') return;
    
    const plan = plans.find(p => p.id === investment.planId);
    if (!plan) return;

    const startDate = new Date(investment.startDate).getTime();
    const now = new Date().getTime();
    const diffDays = (now - startDate) / (1000 * 60 * 60 * 24);
    const elapsedDays = Math.max(0, Math.min(diffDays, plan.durationDays));
    
    if (elapsedDays < plan.durationDays) {
      alert("This investment has not matured yet and cannot be claimed.");
      return;
    }

    const baseProfit = investment.amount * (plan.dailyRoi / 100) * elapsedDays;
    let marketProfit = 0;
    if (plan.linkedCommodity && plan.linkedCommodity !== 'NONE' && investment.entryPrice) {
      const market = marketData.find(m => m.symbol === plan.linkedCommodity);
      if (market) {
        marketProfit = investment.amount * ((market.price - investment.entryPrice) / investment.entryPrice);
      }
    }

    const totalReturn = investment.amount + baseProfit + marketProfit;

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: prev.balance + totalReturn,
        totalInvested: Math.max(0, prev.totalInvested - investment.amount),
        investments: prev.investments.map(inv => 
          inv.id === investmentId ? { ...inv, status: 'completed' as const } : inv
        )
      };
    });

    addTransaction('deposit', totalReturn, `Redeemed ${plan.name} rewards (Principal + Performance)`);
  };

  const handleUpdateUserByAdmin = (email: string, updates: Partial<UserAccount>) => {
    const usersArr = JSON.parse(localStorage.getItem('elitefund_users') || '{}');
    if (usersArr[email]) {
      usersArr[email] = { ...usersArr[email], ...updates };
      localStorage.setItem('elitefund_users', JSON.stringify(usersArr));
      // If we are editing ourselves, sync state
      if (user?.email === email) {
        setUser(usersArr[email]);
      }
    }
  };

  // Computed live stats
  const userWithLiveStats = React.useMemo(() => {
    if (!user) return null;
    
    let totalMarketProfit = 0;
    let totalBaseProfit = 0;
    
    (user.investments || []).forEach(inv => {
      if (inv.status !== 'active') return;
      
      const plan = plans.find(p => p.id === inv.planId);
      if (!plan) return;
      
      // 1. Base ROI (simulated as time-based growth)
      const startDate = new Date(inv.startDate).getTime();
      const now = new Date().getTime();
      const diffDays = (now - startDate) / (1000 * 60 * 60 * 24);
      // Clip at duration
      const elapsedDays = Math.max(0, Math.min(diffDays, plan.durationDays));
      totalBaseProfit += inv.amount * (plan.dailyRoi / 100) * elapsedDays;
      
      // 2. Real-time Commodity Performance
      if (plan.linkedCommodity && plan.linkedCommodity !== 'NONE' && inv.entryPrice) {
        const market = marketData.find(m => m.symbol === plan.linkedCommodity);
        if (market) {
          const perf = (market.price - inv.entryPrice) / inv.entryPrice;
          totalMarketProfit += inv.amount * perf;
        }
      }
    });

    return {
      ...user,
      liveEarnings: totalBaseProfit + totalMarketProfit,
      totalPortfolioValue: user.balance + (user.totalInvested || 0) + totalBaseProfit + totalMarketProfit
    };
  }, [user, marketData, plans]);

  if (!isAuthenticated || !user) {
    return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout} 
      isAdmin={user.isAdmin}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          user={userWithLiveStats as any} 
          onDeposit={handleDeposit} 
          onWithdraw={handleWithdraw}
          paymentSettings={paymentSettings}
          marketData={marketData}
          plans={plans}
        />
      )}
      {activeTab === 'invest' && (
        <Invest 
          onInvest={handleInvest} 
          goals={user.goals} 
          onAddGoal={handleAddGoal}
          investments={user.investments}
          plans={plans}
          userBalance={user.balance}
          marketData={marketData}
          paymentSettings={paymentSettings}
        />
      )}
      {activeTab === 'marketplace' && (
        <Marketplace 
          onPurchase={handlePurchase} 
          accounts={accounts}
          userBalance={user.balance}
          marketData={marketData}
          paymentSettings={paymentSettings}
        />
      )}
      {activeTab === 'profile' && (
        <Profile 
          user={userWithLiveStats as any} 
          onUpdateProfile={handleUpdateProfile} 
          onLogout={handleLogout} 
          marketData={marketData} 
          plans={plans} 
          onClaim={handleClaim}
        />
      )}
      {activeTab === 'admin' && user.isAdmin && (
        <Admin 
          plans={plans}
          setPlans={setPlans}
          accounts={accounts}
          setAccounts={setAccounts}
          paymentSettings={paymentSettings}
          setPaymentSettings={setPaymentSettings}
          onUpdateUser={handleUpdateUserByAdmin}
          marketData={marketData}
        />
      )}
      {activeTab === 'analyst' && <AIAnalyst marketData={marketData} />}
    </Layout>
  );
}
