import { InvestmentPlan, FundedAccount } from './types';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'oil-growth',
    name: 'Crude Oil Growth',
    dailyRoi: 1.8,
    minInvestment: 100,
    durationDays: 30,
    linkedCommodity: 'OIL',
  },
  {
    id: 'gold-safe',
    name: 'Gold Conservative',
    dailyRoi: 1.2,
    minInvestment: 500,
    durationDays: 45,
    linkedCommodity: 'GOLD',
  },
  {
    id: 'silver-pro',
    name: 'Silver Strategic',
    dailyRoi: 2.5,
    minInvestment: 1000,
    durationDays: 60,
    linkedCommodity: 'SILVER',
  },
  {
    id: 'inflation-edge',
    name: 'Inflation Hedge',
    dailyRoi: 1.5,
    minInvestment: 250,
    durationDays: 30,
    linkedCommodity: 'NONE',
  },
];

export const FUNDED_ACCOUNTS: FundedAccount[] = [
  {
    id: 'fa-10k',
    size: 10000,
    price: 99,
    target: 1000,
    drawdown: 500,
    leverage: '1:100',
    platform: 'MetaTrader 5',
  },
  {
    id: 'fa-50k',
    size: 50000,
    price: 299,
    target: 5000,
    drawdown: 2500,
    leverage: '1:100',
    platform: 'MetaTrader 5',
  },
  {
    id: 'fa-100k',
    size: 100000,
    price: 499,
    target: 10000,
    drawdown: 5000,
    leverage: '1:100',
    platform: 'MetaTrader 5',
  },
];
