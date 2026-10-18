# Stage 3: Implementation Plan — NexaFund Prototype

**Project:** NexaFund — Dual-Rail ETF & Tokenized Asset Simulator with Explainable AI  
**Event:** Technica Hackathon  
**Status:** Approved & Finalized  
**Phase:** 3 of 4 (Anthropic Planning Lifecycle: Intent → Spec → Plan → Build)  
**Preceding Artifacts:**  
- [01_INTENT.md](file:///Users/aiden.htoo/technica/mouse-trap/01_INTENT.md) (Approved)  
- [02_SPEC.md](file:///Users/aiden.htoo/technica/mouse-trap/02_SPEC.md) (Approved)  

---

## 1. Plan Overview & Execution Strategy

Following user grilling feedback, our implementation strategy is strictly prioritized:
1. **Iterative Build & Verification Pacing:** Build and verify **Tab 0 (Stacked Chart on Top + AI Chat on Bottom)** end-to-end first. Once verified, build **Tab 1 (Dual-Rail Settle Race)** and **Tab 2 (Token Lifecycle Sandbox)**.
2. **Immediate Demo Impact:** Pre-load with **"The Retail Tech Trap"** preset active (VOO 35%, QQQ 45%, ARKK 20%, $50,000 principal, 30-year horizon). Judges immediately see the dramatic $149k fee drag and 48.2% overlap.
3. **Clean AI Greeting:** AI Copilot starts with an elegant welcome message introducing its role, providing immediate 1-click action chips (`[💡 Audit Current Portfolio]`, `[🔍 Check Holding Overlaps]`, `[⚡ Compare with Tokenized RWA]`), and running audits when triggered or upon parameter adjustments.

---

## 2. Phased Work Breakdown Structure (WBS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REFINED ITERATIVE EXECUTION TIMELINE                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────┐
│ Phase 1: Foundation     │ │ Phase 2: Core Engines   │ │ Phase 3: Tab 0 Build│
│ • Vite + React + TS     │ │ • Seed Fund Dataset     │ │ • Top Section:      │
│ • Material UI + Icons   │ │ • Quantitative Math     │ │   Recharts Chart    │
│ • Recharts + Emotion    │ │ • AI Fiduciary Copilot  │ │ • Bottom Section:   │
│ • Global MUI Theming    │ │ • Default Presets       │ │   AI Copilot Chat   │
└────────────┬────────────┘ └────────────┬────────────┘ │ • Custom Fund Dialog │
             │                           │              └──────────┬───────────┘
             └───────────────────────────┼─────────────────────────┘
                                         ▼
                            ┌─────────────────────────┐
                            │ Phase 4: Tab 0 Verify   │
                            │ • Test Chart & AI Sync  │
                            │ • Custom Fund Creation  │
                            └────────────┬────────────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │ Phase 5: Tabs 1 & 2     │
                            │ • Tab 1: Settle Race    │
                            │ • Tab 2: Token Stepper  │
                            └────────────┬────────────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │ Phase 6: Final Polish   │
                            │ • Top Nav & Footer      │
                            │ • Build Audit & Demo Run│
                            └─────────────────────────┘
```

---

### Detailed Phase Breakdown

#### Phase 1: Environment & Project Scaffolding
- Initialize Vite React + TypeScript in workspace `/Users/aiden.htoo/technica/mouse-trap`.
- Install dependencies:
  - `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
  - `recharts`
  - `lucide-react`
- Set up Material UI Default Theme with clean layout structure.

#### Phase 2: Domain Types & Computational Services
- `src/types/index.ts`: Strict TypeScript definitions for funds, holdings, chart metrics, chat messages, and token lifecycle states.
- `src/data/seedFunds.ts`: Pre-load VOO, SPY, QQQ, ARKK, SCHD, BUIDL, USDY, and the 3 instant presets.
- `src/services/portfolioMath.ts`: Deterministic calculation of compound gross value, net realized value after expense ratio, pairwise overlap matrix, and A+ to F efficiency grading.
- `src/services/aiCopilot.ts`: Conversational and diagnostic engine supporting prompt chips, natural language questions, fee audit summaries, and strict educational guardrails.

#### Phase 3: Priority Target — Tab 0 (Smart Portfolio Workspace)
- `src/components/portfolio/WealthChartContainer.tsx` (Top Full-Width Card):
  - Active Preset Selector & Fund Allocation Chips.
  - "+ Add Custom Fund" trigger button.
  - Interactive Sliders: Horizon (1–40 yrs), Return (3–12%), Capital ($5k–$500k).
  - Full-width Recharts `ComposedChart` with shaded area for wealth lost to fees, gross line, and net line.
  - Real-time Overlap & Factor Concentration summary bar.
- `src/components/portfolio/CustomFundDialog.tsx`:
  - MUI Modal Dialog allowing judges to add custom funds with ticker, expense ratio, category, and top holdings.
- `src/components/portfolio/AICopilotContainer.tsx` (Bottom Full-Width Card):
  - Clean greeting message introducing Nexa Copilot.
  - Live metric chips: Efficiency Grade, Overlap Risk, 30-Year Fee Drag.
  - Interactive Quick Prompt Chips (`[💡 Audit Current Portfolio]`, `[🔍 Check Holding Overlaps]`, `[⚡ Compare with Tokenized RWA]`).
  - Scrollable chat message stream and user text input field.

#### Phase 4: Tab 0 Verification & State Synchronization Check
- Validate that slider adjustments or preset clicks immediately update the chart curves, metric chips, and AI audit context.
- Verify custom fund creation updates the active portfolio dynamically.

#### Phase 5: Tab 1 & Tab 2 Build
- **Tab 1: `DualRailSettleRace.tsx`**
  - Interactive split-screen race (Traditional T+1 NSCC clearing vs Tokenized T+0 atomic DvP).
  - "Simulate Simultaneous Order" trigger with animated timeline progress.
  - Institutional comparison matrix (Trading hours, clearing, custody, SIPC vs PoR).
- **Tab 2: `TokenLifecycleSandbox.tsx`**
  - 4-step interactive MUI Stepper (`KYC Whitelist` → `Deposit/Mint` → `Atomic DvP Transfer` → `Redeem`).
  - Solidity code snippet display, state inspector, and traditional finance contrast.

#### Phase 6: Top Navigation, Polish & Build Audit
- Global `TopNavigation.tsx` with logo, tab switcher, reset button, and quick docs modal.
- `FooterDisclaimer.tsx` with fiduciary and risk disclosures.
- Run `npm run build` to verify 0 errors, clean bundle, and zero-latency performance.

---

## 3. Stage 3 Sign-Off & Verification

All strategic decisions—including prioritization of Tab 0 first, "The Retail Tech Trap" initial state, and clean greeting AI Copilot behavior—are incorporated.

*Stage 3: Plan is ready for sign-off to proceed to **Stage 4: Build**!*
