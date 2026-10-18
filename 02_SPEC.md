# Stage 2: Specification — NexaFund Prototype

**Project:** NexaFund — Dual-Rail ETF & Tokenized Asset Simulator with Explainable AI  
**Event:** Technica Hackathon  
**Status:** Approved & Finalized  
**Phase:** 2 of 4 (Anthropic Planning Lifecycle: Intent → Spec → Plan → Build)  
**Preceding Artifact:** [01_INTENT.md](file:///Users/aiden.htoo/technica/mouse-trap/01_INTENT.md) (Approved)

---

## 1. System Architecture & Tech Stack

### 1.1 Technical Stack
- **Framework:** React 18+ with TypeScript (Strict mode enabled)
- **Bundler & Dev Server:** Vite (Near-instant HMR, optimized production build)
- **UI Component System:** **Material UI (MUI v5/v6)** using the default theme (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`)
- **Charting Engine:** **Recharts** (`ResponsiveContainer`, `ComposedChart`, `Area`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `CartesianGrid`)
- **Icons:** Material UI Icons (`@mui/icons-material`) + Lucide Icons (`lucide-react`)
- **State Management:** React Reactivity (`useState`, `useReducer`, `useMemo`, `useCallback`) with custom hooks

### 1.2 High-Level Component Hierarchy

```
App (MUI ThemeProvider with Default Theme, CssBaseline)
│
├── TopNavigation (MUI AppBar, Brand Logo, Tab Navigation, Reset State, Quick Docs)
│
├── MainContainer (MUI Container maxWidth="xl")
│   │
│   ├── HeaderBanner (Active Portfolio Summary, Global Parameters: Capital, Horizon, Return)
│   │
│   ├── TabPanel (Value: 0 = "Portfolio & AI Copilot", 1 = "Dual-Rail Settle Race", 2 = "Token Lifecycle")
│   │   │
│   │   ├── [TAB 0: Smart Portfolio Workspace (Stacked Layout)]
│   │   │   ├── TopSection: WealthChartContainer (Full-Width MUI Card)
│   │   │   │   ├── PortfolioSelector (Preset buttons + Fund chips + "Custom Fund" Dialog trigger)
│   │   │   │   ├── CustomFundDialog (MUI Dialog: Ticker, Name, Expense Ratio, Category, Holdings)
│   │   │   │   ├── RechartsComposedChart (Gross vs. Net Realized Area/Line, Fee Drag Fill)
│   │   │   │   ├── MetricStrip (Total Value, Gross Wealth, Total Fee Loss, Overlap %)
│   │   │   │   └── ParameterSliders (Horizon 1-40 yrs, Expected Return 3-12%, Fee Reduction)
│   │   │   │
│   │   │   └── BottomSection: AICopilotContainer (Full-Width MUI Card)
│   │   │       ├── CopilotHeader (Efficiency Grade Chip, Overlap Risk Chip, Total Loss Chip)
│   │   │       ├── ConversationStream (Scrollable chat history with AI & user bubbles)
│   │   │       ├── QuickPromptBar (Interactive suggestion chips for 1-click insights)
│   │   │       └── MessageInputField (MUI TextField with Send IconButton)
│   │   │
│   │   ├── [TAB 1: Dual-Rail Settle Race]
│   │   │   ├── TraditionalRailCard (T+1 clearing timeline, NSCC batch, market hours, SIPC)
│   │   │   ├── TokenizedRailCard (T+0 atomic DvP, 24/7/365, ERC-3643 whitelist, smart vault)
│   │   │   └── SettleRaceSimulator (Interactive trigger button: "Simulate Simultaneous Order")
│   │   │
│   │   └── [TAB 2: Tokenized Asset Lifecycle Sandbox]
│   │       ├── LifecycleStepper (MUI Stepper: 1. Whitelist -> 2. Mint -> 3. DvP -> 4. Redeem)
│   │       ├── StepDetailCard (Code snippet, simulated smart contract call, state visualizer)
│   │       └── StepActionControls (Next Step, Previous Step, Reset, Execute Action)
│   │
│   └── FooterDisclaimer (Fiduciary Disclosures, SIPC/Smart Contract Risk Warnings)
```

---

## 2. Data Models & TypeScript Interfaces

### 2.1 ETF & Fund Data Types
```typescript
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
  expenseRatio: number; // e.g., 0.0003 for 0.03%, 0.0075 for 0.75%
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
  weight: number; // percentage (sum across portfolio = 100)
}
```

### 2.2 Mathematical Calculation & Chart Models
```typescript
export interface YearlyDataPoint {
  year: number;
  age: number;
  grossValue: number;       // Portfolio value with 0% fee drag
  netValue: number;         // Actual realized value after expense ratio
  cumulativeFees: number;   // Gross - Net
  feeDragPercent: number;   // (cumulativeFees / grossValue) * 100
}

export interface OverlapMetric {
  ticker: string;
  name: string;
  combinedWeight: number;   // Effective percentage across user's portfolio
  presentInFunds: string[]; // List of fund tickers that hold this stock
}

export interface PortfolioAuditSummary {
  weightedExpenseRatio: number; // Sum of (weight * expenseRatio)
  totalOverlapScore: number;    // % of portfolio sharing duplicate top-10 holdings
  efficiencyGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  thirtyYearFeeLoss: number;
  thirtyYearNetValue: number;
  thirtyYearGrossValue: number;
  topOverlaps: OverlapMetric[];
}
```

### 2.3 AI Copilot & Chat Types
```typescript
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
  };
}

export interface QuickPrompt {
  id: string;
  label: string;
  query: string;
  category: 'fee' | 'overlap' | 'token' | 'risk';
}
```

### 2.4 Token Lifecycle State Machine Types
```typescript
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
```

---

## 3. Financial & Mathematical Formulations

### 3.1 Compound Growth & Wealth Erosion
Given:
- $P$: Initial Investment Principal (\$)
- $r$: Annual Expected Nominal Return (e.g., $0.07$ for 7.0%)
- $c$: Weighted Annual Expense Ratio (e.g., $0.0044$ for 0.44%)
- $t$: Time horizon in years ($t \in [1, 40]$)

The mathematical progression for year $t$:
$$V_{\text{gross}}(t) = P \times (1 + r)^t$$
$$V_{\text{net}}(t) = P \times (1 + r - c)^t$$
$$\text{Cumulative Fee Drag}(t) = V_{\text{gross}}(t) - V_{\text{net}}(t)$$
$$\text{Percentage Wealth Drag}(t) = \frac{V_{\text{gross}}(t) - V_{\text{net}}(t)}{V_{\text{gross}}(t)} \times 100\%$$

### 3.2 Pairwise & Aggregate Holding Overlap
For each stock $k$ in the union of top holdings:
$$W_k = \sum_{i=1}^M \left( \text{portfolioWeight}_i \times \text{fundHoldingWeight}_{i,k} \right)$$
The aggregate overlap index is calculated as:
$$\text{Overlap Score} = \sum_{k} \left\{ W_k \mid k \text{ exists in } \ge 2 \text{ selected funds} \right\}$$

### 3.3 Efficiency Grading Scale
- **A+ (Optimal):** Weighted Expense Ratio $\le 0.05\%$, Overlap $\le 15\%$
- **A (High):** Weighted Expense Ratio $\le 0.12\%$, Overlap $\le 25\%$
- **B (Moderate):** Weighted Expense Ratio $\le 0.30\%$, Overlap $\le 40\%$
- **C (Suboptimal):** Weighted Expense Ratio $\le 0.60\%$, Overlap $\le 55\%$
- **D (Inefficient):** Weighted Expense Ratio $> 0.60\%$ or Overlap $> 55\%$

---

## 4. UI/UX Interaction Specifications

### 4.1 Tab 0: Stacked Smart Portfolio Workspace

#### Top Section: Full-Width Chart Card
1. **Interactive Controls & Presets:**
   - Preset 1: *"The Retail Tech Trap"* (VOO 35%, QQQ 45%, ARKK 20%) — Highlights 48% overlap & high active fee drag.
   - Preset 2: *"Low-Cost Core"* (VOO 70%, SCHD 30%) — Highlights 0.04% expense ratio efficiency.
   - Preset 3: *"RWA Dual-Rail Hybrid"* (VOO 50%, BUIDL/USDY 50%) — Demonstrates T+0 yield & 24/7 liquidity balance.
   - **Custom Fund Creator:** Clickable "+ Add Custom Fund" button opening a clean MUI Modal Dialog allowing the user to specify:
     - Ticker symbol & Fund name
     - Custom expense ratio (0.01% - 3.00%)
     - Strategy & Category
     - Top holdings & weights
2. **Recharts ComposedChart:**
   - Full-width responsive canvas.
   - Area fill for wealth forfeited to fees with linear gradient.
   - Lines for Gross Value and Realized Net Value.
   - Interactive Tooltip displaying exact numbers, dollar loss, and percentage drag for any hover point.

#### Bottom Section: Full-Width AI Fiduciary Copilot & Chat Card
1. **Status Chips:** Efficiency Grade, Overlap Warning, 30-Year Fee Loss.
2. **Contextual Conversation Stream:**
   - Real-time audit generation on allocation/slider updates.
   - Quick action prompt chips (`[💡 Why is fee drag so high?]`, `[🔍 Show overlapping stocks]`, `[⚡ Compare to Tokenized T+0 Rail]`, `[🛡️ SIPC vs Smart Contract risk]`).
   - Natural language input for user questions with grounded fiduciary answers.

---

### 4.2 Tab 1: Dual-Rail Settle Race (Traditional T+1 vs Tokenized T+0)
- Visual split-screen race triggered by "Simulate Simultaneous Order".
- Tracks progress across time (T+1 market day batches vs T+0 atomic block finality).
- Displays operational differences: trading hours, custody models, settlement failure/counterparty risk, and investor protection.

---

### 4.3 Tab 2: Tokenized Asset Lifecycle Sandbox (MUI Stepper)
- Step 1: KYC & Whitelist Validation.
- Step 2: Deposit & Token Minting (with simulated Proof-of-Reserves check).
- Step 3: Atomic DvP Secondary Transfer (zero counterparty risk).
- Step 4: Redemption for Underlying Collateral.

---

## 5. Seed Dataset: Real-World Fund Catalog

| ID | Ticker | Name | Expense Ratio | Category | Key Top Holdings |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `voo` | **VOO** | Vanguard S&P 500 ETF | 0.03% | Broad Market Index | MSFT (7.1%), AAPL (6.5%), NVDA (6.1%), AMZN (3.7%), META (2.4%) |
| `spy` | **SPY** | SPDR S&P 500 ETF Trust | 0.09% | Broad Market Index | MSFT (7.1%), AAPL (6.5%), NVDA (6.1%), AMZN (3.7%), META (2.4%) |
| `qqq` | **QQQ** | Invesco QQQ Trust (Nasdaq 100) | 0.20% | Tech Growth | MSFT (8.9%), AAPL (8.4%), NVDA (7.8%), AMZN (5.2%), AVGO (4.6%) |
| `arkk`| **ARKK**| ARK Innovation ETF | 0.75% | Active Innovation | TSLA (11.2%), ROKU (8.1%), COIN (7.4%), PATH (6.2%), SQ (5.9%) |
| `schd`| **SCHD**| Schwab U.S. Dividend Equity | 0.06% | Dividend Value | AVGO (4.4%), ABBV (4.2%), MRK (4.1%), HD (4.0%), AMGN (3.9%) |
| `buidl`| **BUIDL**| BlackRock USD Institutional Digital Liquidity | 0.20% | Tokenized RWA | U.S. Treasury Bills (100%), Overnight Repo, 24/7 T+0 Yield |
| `usdy`| **USDY** | Ondo U.S. Dollar Yield Token | 0.20% | Tokenized RWA | Short-Term U.S. Treasuries (100%), Bank Deposits |

*Plus dynamic custom funds added via the Custom Fund Creator dialog.*

---

## 6. Stage 2 Sign-Off & Verification

All specifications—including the 3-tab layout, stacked Chart/AI-Chat workspace, curated 7-fund dataset + Custom Fund Creator, and AI fiduciary guardrails—are finalized.

*Stage 2: Spec is ready for sign-off to proceed to **Stage 3: Plan** (`03_PLAN.md`).*
