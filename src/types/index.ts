export interface Holding {
  ticker: string;
  name: string;
  weight: number; // percentage (e.g. 7.5 for 7.5%)
}

export interface Fund {
  id: string;
  ticker: string;
  name: string;
  category: 'Broad Market Index' | 'Tech Growth' | 'Active Innovation' | 'Dividend Value' | 'Tokenized RWA' | 'Custom';
  expenseRatio: number; // decimal (e.g. 0.0003 for 0.03%, 0.0075 for 0.75%)
  strategy: 'Passive Index' | 'Active Management' | 'Algorithmic Smart Contract';
  settlementRail: 'Traditional T+1' | 'Atomic T+0';
  tradingHours: 'Market Hours (9:30am - 4:00pm EST)' | '24/7 Continuous';
  custodyModel: 'Centralized Custodian (DTC/NSCC)' | 'Qualified Smart Vault / PoR';
  protection: 'SIPC Insured (up to $500k)' | 'Cryptographic Proof-of-Reserves';
  topHoldings: Holding[];
  description: string;
  isCustom?: boolean;
}

export interface PortfolioAllocation {
  fundId: string;
  weight: number; // percentage (0 - 100)
}

export interface PortfolioPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  allocations: PortfolioAllocation[];
}

export interface YearlyDataPoint {
  year: number;
  grossValue: number;       // Portfolio value with 0% fee drag
  netValue: number;         // Realized value after expense ratio drag
  cumulativeFees: number;   // Gross - Net
  feeDragPercent: number;   // (cumulativeFees / grossValue) * 100
}

export interface OverlapMetric {
  ticker: string;
  name: string;
  combinedWeight: number;   // Effective percentage across portfolio
  presentInFunds: string[]; // Tickers of funds containing this holding
}

export interface PortfolioAuditSummary {
  weightedExpenseRatio: number; // decimal (e.g. 0.0038 for 0.38%)
  totalOverlapScore: number;    // percentage of overlapping concentration
  efficiencyGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  thirtyYearFeeLoss: number;
  thirtyYearNetValue: number;
  thirtyYearGrossValue: number;
  topOverlaps: OverlapMetric[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  timestamp: string;
  content: string;
  category?: 'audit' | 'fee_warning' | 'overlap' | 'tokenization' | 'general';
  suggestedPrompts?: string[];
  metricsSnapshot?: {
    feeLoss: number;
    overlapScore: number;
    grade: string;
    weightedFeePercent: number;
  };
}

export interface QuickPrompt {
  id: string;
  label: string;
  query: string;
  category: 'fee' | 'overlap' | 'token' | 'risk';
}

export type LifecycleStepIndex = 0 | 1 | 2 | 3;

export interface LifecycleStep {
  step: LifecycleStepIndex;
  title: string;
  subtitle: string;
  actor: 'Investor' | 'Compliance Oracle' | 'Smart Contract' | 'Custodian';
  status: 'pending' | 'in_progress' | 'completed';
  solidityCode: string;
  explanation: string;
  traditionalEquivalent: string;
}
