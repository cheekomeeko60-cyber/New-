export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'purchase';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'rejected';
  fee?: number;
  verificationKey?: string;
  withdrawalDetails?: string;
  accountLogin?: string;
  accountPassword?: string;
  terminalLink?: string;
  userEmail?: string;
  userName?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface UserAccount {
  name: string;
  email: string;
  rank: string;
  joinedAt: string;
  isAdmin?: boolean;
  balance: number;
  dailyEarnings: number;
  totalInvested: number;
  investments: Investment[];
  transactions: Transaction[];
  goals: Goal[];
}

export interface Investment {
  id: string;
  planId: string;
  amount: number;
  startDate: string;
  status: 'active' | 'completed';
  entryPrice?: number;
  currentValue?: number;
  lastUpdate?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  dailyRoi: number; // base percentage
  minInvestment: number;
  durationDays: number;
  linkedCommodity?: 'GOLD' | 'SILVER' | 'OIL' | 'NONE';
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: string;
}

export interface FundedAccount {
  id: string;
  size: number; // e.g., 50000 for $50k
  price: number;
  target: number;
  drawdown: number;
  leverage: string;
  platform: string;
  isSold?: boolean;
  accountLogin?: string;
  accountPassword?: string;
  terminalLink?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'crypto';
  name: string; // e.g., "Standard Wire", "Crypto Wallet"
  accountName?: string;
  accountNumber?: string;
  network?: string;
  details?: string; // Additional details or combined address
  instructions?: string;
  verificationMethod?: string;
}

export interface PaymentSettings {
  methods: PaymentMethod[];
  depositTax?: number;
  withdrawalTax?: number;
  investmentTax?: number;
}
