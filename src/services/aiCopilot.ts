import { PortfolioAuditSummary, PortfolioAllocation, Fund, ChatMessage } from '../types';

/**
 * Generates an initial welcome message from the AI Copilot.
 * As requested in Stage 3: Clean greeting introducing itself with prompt chips,
 * and performing the deep audit when requested or when portfolio changes.
 */
export function getInitialGreetingMessage(): ChatMessage {
  return {
    id: 'msg-welcome-01',
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    category: 'general',
    content: `👋 **Welcome to Nexa AI Fiduciary Copilot.**\n\nI am your unbiased financial auditor. Unlike conventional AI tools that offer speculative stock predictions, I operate strictly on **mathematical portfolio deconstruction**, compound fee drag analysis, holding overlap detection, and dual-rail settlement comparison (T+1 vs. Tokenized T+0).\n\nClick any quick prompt below or ask me any question about the chart above!`,
    suggestedPrompts: [
      '💡 Audit My Current Portfolio',
      '🔍 Check Holding Overlaps',
      '⚡ Compare with Tokenized T+0 Rail',
      '🛡️ What are the SIPC vs Smart Contract risks?',
    ],
  };
}

/**
 * Generates a full fiduciary audit message evaluating the current portfolio.
 */
export function generateFiduciaryAuditMessage(
  summary: PortfolioAuditSummary,
  allocations: PortfolioAllocation[],
  funds: Fund[],
  principal: number,
  horizon: number
): ChatMessage {
  const activeAllocations = allocations.filter((a) => a.weight > 0);
  const fundTickers = activeAllocations
    .map((a) => {
      const f = funds.find((fund) => fund.id === a.fundId);
      return f ? `${f.ticker} (${a.weight}%)` : '';
    })
    .filter(Boolean)
    .join(', ');

  const feePct = (summary.weightedExpenseRatio * 100).toFixed(2);
  const feeLossFormatted = `$${summary.thirtyYearFeeLoss.toLocaleString()}`;
  const grossFormatted = `$${summary.thirtyYearGrossValue.toLocaleString()}`;
  const netFormatted = `$${summary.thirtyYearNetValue.toLocaleString()}`;

  let findings = '';

  // Finding 1: Fee Assessment
  if (summary.weightedExpenseRatio > 0.003) {
    findings += `1. **High Fee Drag Alert (${feePct}%/yr):** Over your ${horizon}-year horizon, fees and lost compounding forfeit **${feeLossFormatted}** (${((summary.thirtyYearFeeLoss / summary.thirtyYearGrossValue) * 100).toFixed(1)}% of your gross potential wealth of ${grossFormatted})!\n\n`;
  } else if (summary.weightedExpenseRatio > 0.001) {
    findings += `1. **Moderate Fee Drag (${feePct}%/yr):** Cumulative management fees consume **${feeLossFormatted}** over ${horizon} years. Shifting higher-cost components to passive low-cost core equivalents can recover significant capital.\n\n`;
  } else {
    findings += `1. **Exceptional Fee Efficiency (${feePct}%/yr):** Your weighted expense ratio is exceptionally low! Over ${horizon} years, you preserve ${(100 - (summary.thirtyYearFeeLoss / summary.thirtyYearGrossValue) * 100).toFixed(1)}% of your gross wealth (${netFormatted}).\n\n`;
  }

  // Finding 2: Overlap Assessment
  if (summary.totalOverlapScore > 35) {
    const overlapHoldings = summary.topOverlaps
      .map((o) => `• **${o.ticker}** (${o.name}): **${o.combinedWeight}%** across [${o.presentInFunds.join(', ')}]`)
      .join('\n');

    findings += `2. **Substantial Redundant Beta (${summary.totalOverlapScore}% Overlap):**\nYou hold multiple funds, but they duplicate identical mega-cap companies! You are essentially paying multiple expense ratios for the same underlying assets:\n${overlapHoldings}\n\n`;
  } else if (summary.totalOverlapScore > 10) {
    findings += `2. **Moderate Overlap (${summary.totalOverlapScore}%):** Some concentration in large-cap holdings, but acceptable sector diversification.\n\n`;
  } else {
    findings += `2. **Low Redundancy (${summary.totalOverlapScore}% Overlap):** Your assets exhibit strong independence with negligible duplicate single-stock risk.\n\n`;
  }

  // Finding 3: Rail & Tokenization Context
  const hasTokenized = activeAllocations.some((a) => {
    const f = funds.find((fund) => fund.id === a.fundId);
    return f && f.settlementRail === 'Atomic T+0';
  });

  if (hasTokenized) {
    findings += `3. **Dual-Rail Optimization Active:** You have allocated to tokenized RWA assets, enabling 24/7 liquidity and T+0 atomic settlement without clearing delays. Keep in mind that on-chain assets rely on smart contract audits rather than SIPC brokerage insurance.`;
  } else {
    findings += `3. **Traditional Settlement Constraint:** All selected funds settle on traditional DTCC rails (T+1 market business days). Rebalancing requires cash buffer latency during market closure (nights and weekends).`;
  }

  return {
    id: `audit-${Date.now()}`,
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    category: 'audit',
    content: `📊 **Fiduciary Audit: ${fundTickers}**\n\n**Efficiency Rating: Grade ${summary.efficiencyGrade}**\n\n${findings}`,
    suggestedPrompts: [
      '💡 How can I minimize this fee loss?',
      '🔍 Show me a lower-cost alternative swap',
      '⚡ How does Tokenized T+0 compare?',
      '🛡️ Explain SIPC vs Smart Contract risk',
    ],
    metricsSnapshot: {
      feeLoss: summary.thirtyYearFeeLoss,
      overlapScore: summary.totalOverlapScore,
      grade: summary.efficiencyGrade,
      weightedFeePercent: Number(feePct),
    },
  };
}

/**
 * Handles conversational queries with deterministic fiduciary responses,
 * strictly preventing stock tip hallucinations and ensuring financial accuracy.
 */
export function processUserQuery(
  query: string,
  summary: PortfolioAuditSummary,
  allocations: PortfolioAllocation[],
  funds: Fund[],
  principal: number,
  horizon: number
): ChatMessage {
  const q = query.toLowerCase();
  const feePct = (summary.weightedExpenseRatio * 100).toFixed(2);
  const feeLossFormatted = `$${summary.thirtyYearFeeLoss.toLocaleString()}`;

  // 1. Audit Request
  if (q.includes('audit') || q.includes('review') || q.includes('grade') || q.includes('analyze')) {
    return generateFiduciaryAuditMessage(summary, allocations, funds, principal, horizon);
  }

  // 2. Fee Drag Inquiry
  if (q.includes('fee') || q.includes('expense') || q.includes('cost') || q.includes('drag') || q.includes('loss')) {
    return {
      id: `fee-${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'fee_warning',
      content: `💡 **The Anatomy of Fee Drag:**\n\n- **Current Weighted Fee:** ${feePct}% per year.\n- **Projected Lifetime Erosion:** **${feeLossFormatted}** over ${horizon} years.\n\n**Why does a seemingly small fraction (like 0.38%) cost so much?**\nFees are subtracted from your asset base every single day. Because this money is removed from your account, it never gets the chance to compound. Over 30 years at 7% return:\n- An investor paying **0.03%** keeps **99.1%** of market gains.\n- An investor paying **0.75%** forfeits nearly **20%** of their total potential wealth directly to managers!\n\n*Actionable Tip:* Look for low-cost passive index equivalents with expense ratios under 0.10%.`,
      suggestedPrompts: [
        '🔍 Show me overlapping stocks',
        '⚡ How does Tokenized T+0 compare?',
        '🛡️ What are the SIPC vs Smart Contract risks?',
      ],
    };
  }

  // 3. Overlap / Concentration Inquiry
  if (q.includes('overlap') || q.includes('redundant') || q.includes('concentration') || q.includes('duplicate')) {
    const overlapList = summary.topOverlaps.length > 0
      ? summary.topOverlaps
          .map((o) => `• **${o.ticker} (${o.name})**: **${o.combinedWeight}%** of entire portfolio (held in: ${o.presentInFunds.join(', ')})`)
          .join('\n')
      : 'No significant duplicate holdings detected across your active funds!';

    return {
      id: `overlap-${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'overlap',
      content: `🔍 **Holding Overlap Analysis (Duplicate Exposure: ${summary.totalOverlapScore}%):**\n\nMany investors buy 2 or 3 different ETFs assuming they are diversified. However, broad market and growth funds are market-cap weighted, meaning both funds are overwhelmingly dominated by the exact same mega-cap tech giants:\n\n${overlapList}\n\n**The Takeaway:** You do not gain extra diversification by holding SPY + VOO + QQQ. You simply concentrate more risk in 5 companies and pay extra management fees.`,
      suggestedPrompts: [
        '💡 Audit My Current Portfolio',
        '⚡ Compare with Tokenized T+0 Rail',
        '🛡️ What are the SIPC vs Smart Contract risks?',
      ],
    };
  }

  // 4. Tokenization & T+0 Inquiry
  if (q.includes('token') || q.includes('t+0') || q.includes('rwa') || q.includes('settle') || q.includes('buidl') || q.includes('ondo')) {
    return {
      id: `token-${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'tokenization',
      content: `⚡ **Traditional ETFs vs. Tokenized Funds (RWAs):**\n\n| Dimension | Traditional ETF (e.g. VOO/SPY) | Tokenized Fund (e.g. BUIDL/USDY) |\n| :--- | :--- | :--- |\n| **Settlement** | **T+1** (24–48 hours via DTCC) | **T+0 Instant Atomic** (< 15 seconds) |\n| **Trading Hours** | 9:30 AM – 4:00 PM EST (Mon–Fri) | **24/7/365 Continuous** |\n| **Custody** | Centralized Broker / Depository | Qualified Smart Vault / On-Chain |\n| **Safety Net** | **SIPC Insured** (up to $500,000) | **Proof-of-Reserves Oracles** |\n| **Core Risk** | Hidden fee drag & market closure | Smart contract bugs & private key loss |\n\n**Institutional Impact:** Tokenized funds eliminate credit and counterparty clearing risks, allowing instant rebalancing into yield-bearing cash even on weekends.`,
      suggestedPrompts: [
        '🛡️ What are the SIPC vs Smart Contract risks?',
        '💡 How can I minimize fee loss?',
        '🔍 Check Holding Overlaps',
      ],
    };
  }

  // 5. SIPC vs Smart Contract Risk
  if (q.includes('sipc') || q.includes('smart contract') || q.includes('risk') || q.includes('insurance') || q.includes('hack')) {
    return {
      id: `risk-${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
      content: `🛡️ **Trust & Protection: SIPC vs. Smart Contract Guarantees**\n\n**Traditional Protection (SIPC):**\n- Covers up to **$500,000** (including $250k for cash) if your broker goes bankrupt.\n- Does *NOT* protect against market losses or bad investment choices.\n- Enforced through strict regulatory bodies (FINRA / SEC).\n\n**Tokenized Asset Protection (Smart Contracts & PoR):**\n- Tokenized securities do **NOT** have automatic SIPC protection if held in self-custody.\n- Trust is established through **Chainlink Proof-of-Reserves** or qualified institutional custodians (e.g., BNY Mellon backing BlackRock BUIDL).\n- **Failure Modes:** Smart contract exploits, oracle downtime, or jurisdictional freeze. Whitelisting (ERC-3643) allows token issuers to freeze or recover compromised addresses under legal court order.\n\n*Always balance technological speed with legal and custody guarantees.*`,
      suggestedPrompts: [
        '💡 Audit My Current Portfolio',
        '⚡ Compare with Tokenized T+0 Rail',
        '🔍 Check Holding Overlaps',
      ],
    };
  }

  // 6. Anti-Hallucination Guardrail (Stock Advice / Market Timing)
  if (q.includes('buy') || q.includes('sell') || q.includes('stock tip') || q.includes('price target') || q.includes('crypto moon') || q.includes('predict')) {
    return {
      id: `guardrail-${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
      content: `⚠️ **Fiduciary Guardrail Activated:**\n\nAs a responsible AI fiduciary copilot, I **do not provide speculative stock tips or short-term market timing predictions**. Financial markets are non-deterministic, and forecasting single stock price movements is statistically unreliable.\n\nInstead, I help you optimize what you *can* control:\n1. **Minimizing expense ratios and fee drag**\n2. **Eliminating redundant portfolio overlap**\n3. **Understanding structural settlement mechanics (T+1 vs T+0)**\n\nWould you like me to audit your current portfolio's structural efficiency?`,
      suggestedPrompts: [
        '💡 Audit My Current Portfolio',
        '🔍 Check Holding Overlaps',
        '⚡ Compare with Tokenized T+0 Rail',
      ],
    };
  }

  // General Fallback
  return {
    id: `general-${Date.now()}`,
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    category: 'general',
    content: `I received your question: *"${query}"*.\n\nYour portfolio is currently tracking **${feePct}% weighted expense ratio** with **${summary.totalOverlapScore}% duplicate concentration**. Over 30 years, fees will cost **${feeLossFormatted}**.\n\nYou can explore how adjusting the horizon or selecting tokenized RWA assets changes your overall capital efficiency above!`,
    suggestedPrompts: [
      '💡 Audit My Current Portfolio',
      '🔍 Check Holding Overlaps',
      '⚡ Compare with Tokenized T+0 Rail',
      '🛡️ What are the SIPC vs Smart Contract risks?',
    ],
  };
}
