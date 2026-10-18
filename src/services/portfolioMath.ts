import { Fund, PortfolioAllocation, YearlyDataPoint, OverlapMetric, PortfolioAuditSummary } from '../types';

/**
 * Calculates the year-by-year trajectory comparing gross compounding (0% fee)
 * against realized net compounding after accounting for the weighted annual expense ratio.
 */
export function calculateGrowthTrajectory(
  principal: number,
  annualReturn: number,      // e.g. 0.07 for 7%
  weightedExpenseRatio: number, // e.g. 0.0035 for 0.35%
  horizonYears: number
): YearlyDataPoint[] {
  const points: YearlyDataPoint[] = [];

  for (let year = 0; year <= horizonYears; year++) {
    // Gross wealth with zero fees: P * (1 + r)^t
    const grossValue = principal * Math.pow(1 + annualReturn, year);

    // Realized net wealth after expense ratio: P * (1 + r - fee)^t
    const effectiveReturn = Math.max(0, annualReturn - weightedExpenseRatio);
    const netValue = principal * Math.pow(1 + effectiveReturn, year);

    const cumulativeFees = Math.max(0, grossValue - netValue);
    const feeDragPercent = grossValue > 0 ? (cumulativeFees / grossValue) * 100 : 0;

    points.push({
      year,
      grossValue: Math.round(grossValue),
      netValue: Math.round(netValue),
      cumulativeFees: Math.round(cumulativeFees),
      feeDragPercent: Number(feeDragPercent.toFixed(1)),
    });
  }

  return points;
}

/**
 * Computes the effective holdings across all selected funds in the user's portfolio,
 * identifying overlapping tickers and computing the aggregate duplicate concentration.
 */
export function calculateOverlapMatrix(
  allocations: PortfolioAllocation[],
  funds: Fund[]
): { overlaps: OverlapMetric[]; totalOverlapScore: number } {
  const activeAllocations = allocations.filter((a) => a.weight > 0);
  const totalAllocatedWeight = activeAllocations.reduce((sum, a) => sum + a.weight, 0);

  if (totalAllocatedWeight === 0) {
    return { overlaps: [], totalOverlapScore: 0 };
  }

  // Map to hold aggregated holding weights and occurrences
  const holdingMap: Record<
    string,
    { name: string; combinedWeight: number; presentInFunds: string[] }
  > = {};

  activeAllocations.forEach((alloc) => {
    const fund = funds.find((f) => f.id === alloc.fundId);
    if (!fund) return;

    // Normalizing allocation weight to 100%
    const normalizedFundWeight = alloc.weight / totalAllocatedWeight;

    fund.topHoldings.forEach((holding) => {
      const effectiveHoldingWeight = normalizedFundWeight * holding.weight;

      if (!holdingMap[holding.ticker]) {
        holdingMap[holding.ticker] = {
          name: holding.name,
          combinedWeight: effectiveHoldingWeight,
          presentInFunds: [fund.ticker],
        };
      } else {
        holdingMap[holding.ticker].combinedWeight += effectiveHoldingWeight;
        if (!holdingMap[holding.ticker].presentInFunds.includes(fund.ticker)) {
          holdingMap[holding.ticker].presentInFunds.push(fund.ticker);
        }
      }
    });
  });

  // Overlap is defined as any holding present in 2 or more selected funds
  const overlapList: OverlapMetric[] = Object.entries(holdingMap)
    .filter(([_, data]) => data.presentInFunds.length >= 2)
    .map(([ticker, data]) => ({
      ticker,
      name: data.name,
      combinedWeight: Number(data.combinedWeight.toFixed(1)),
      presentInFunds: data.presentInFunds,
    }))
    .sort((a, b) => b.combinedWeight - a.combinedWeight);

  // Total overlap score is the sum of combined weights of overlapping stocks
  const totalOverlapScore = Number(
    overlapList.reduce((sum, item) => sum + item.combinedWeight, 0).toFixed(1)
  );

  return { overlaps: overlapList, totalOverlapScore };
}

/**
 * Determines an institutional efficiency grade based on fee level and concentration overlap.
 */
export function calculateEfficiencyGrade(
  weightedExpenseRatio: number,
  overlapScore: number
): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  const feePct = weightedExpenseRatio * 100;

  if (feePct <= 0.05 && overlapScore <= 15) return 'A+';
  if (feePct <= 0.12 && overlapScore <= 25) return 'A';
  if (feePct <= 0.30 && overlapScore <= 40) return 'B';
  if (feePct <= 0.60 && overlapScore <= 55) return 'C';
  if (feePct > 0.60 || overlapScore > 55) return 'D';
  return 'F';
}

/**
 * Generates the full fiduciary audit summary for a given portfolio.
 */
export function calculateAuditSummary(
  allocations: PortfolioAllocation[],
  funds: Fund[],
  principal: number = 50000,
  annualReturn: number = 0.07,
  horizonYears: number = 30
): PortfolioAuditSummary {
  const activeAllocations = allocations.filter((a) => a.weight > 0);
  const totalWeight = activeAllocations.reduce((sum, a) => sum + a.weight, 0);

  let weightedExpenseRatio = 0;
  if (totalWeight > 0) {
    weightedExpenseRatio = activeAllocations.reduce((sum, alloc) => {
      const fund = funds.find((f) => f.id === alloc.fundId);
      const fundFee = fund ? fund.expenseRatio : 0;
      return sum + (alloc.weight / totalWeight) * fundFee;
    }, 0);
  }

  const { overlaps, totalOverlapScore } = calculateOverlapMatrix(allocations, funds);
  const efficiencyGrade = calculateEfficiencyGrade(weightedExpenseRatio, totalOverlapScore);

  const trajectory = calculateGrowthTrajectory(principal, annualReturn, weightedExpenseRatio, horizonYears);
  const finalPoint = trajectory[trajectory.length - 1] || {
    grossValue: 0,
    netValue: 0,
    cumulativeFees: 0,
  };

  return {
    weightedExpenseRatio: Number(weightedExpenseRatio.toFixed(6)),
    totalOverlapScore,
    efficiencyGrade,
    thirtyYearFeeLoss: finalPoint.cumulativeFees,
    thirtyYearNetValue: finalPoint.netValue,
    thirtyYearGrossValue: finalPoint.grossValue,
    topOverlaps: overlaps.slice(0, 5),
  };
}

/**
 * Dynamically rebalances portfolio allocations when one fund's slider changes,
 * ensuring the total allocation across all active funds always sums to exactly 100%.
 */
export function rebalanceAllocationsOnSliderChange(
  currentAllocations: PortfolioAllocation[],
  targetFundId: string,
  newTargetWeight: number
): PortfolioAllocation[] {
  // Clamp between 0 and 100
  const clampedTargetWeight = Math.max(0, Math.min(100, Math.round(newTargetWeight)));

  // Identify all other active funds (funds that currently have weight > 0 and are not the target)
  const otherActiveAllocations = currentAllocations.filter(
    (a) => a.fundId !== targetFundId && a.weight > 0
  );

  // If there are no other active funds, this target fund takes 100% (or 0 if user drags to 0)
  if (otherActiveAllocations.length === 0) {
    return currentAllocations.map((a) =>
      a.fundId === targetFundId ? { ...a, weight: clampedTargetWeight === 0 ? 0 : 100 } : a
    );
  }

  // The remaining budget that all other active funds must share
  const remainingBudget = 100 - clampedTargetWeight;

  // Sum of existing weights of the other active funds
  const currentOtherSum = otherActiveAllocations.reduce((sum, a) => sum + a.weight, 0);

  // Scale each other active fund proportionally
  let updated = currentAllocations.map((a) => {
    if (a.fundId === targetFundId) {
      return { ...a, weight: clampedTargetWeight };
    }
    if (a.weight <= 0) {
      return a; // Inactive funds stay 0
    }

    if (remainingBudget <= 0) {
      return { ...a, weight: 0 };
    }

    if (currentOtherSum > 0) {
      const proportionalWeight = Math.round((a.weight / currentOtherSum) * remainingBudget);
      return { ...a, weight: Math.max(0, proportionalWeight) };
    } else {
      const equalShare = Math.round(remainingBudget / otherActiveAllocations.length);
      return { ...a, weight: Math.max(0, equalShare) };
    }
  });

  // Ensure total sum is exactly 100 by adjusting for rounding discrepancies
  if (clampedTargetWeight < 100) {
    const currentTotal = updated.reduce((sum, a) => sum + a.weight, 0);
    const discrepancy = 100 - currentTotal;

    if (discrepancy !== 0) {
      // Find the other active fund with the largest weight and absorb the rounding discrepancy
      const largestOther = [...updated]
        .filter((a) => a.fundId !== targetFundId && a.weight > 0)
        .sort((a, b) => b.weight - a.weight)[0];

      if (largestOther) {
        updated = updated.map((a) =>
          a.fundId === largestOther.fundId
            ? { ...a, weight: Math.max(0, a.weight + discrepancy) }
            : a
        );
      }
    }
  }

  return updated;
}

/**
 * Toggles a fund ON or OFF and rebalances the active funds to sum to exactly 100%.
 */
export function toggleFundWithRebalance(
  currentAllocations: PortfolioAllocation[],
  targetFundId: string
): PortfolioAllocation[] {
  const existing = currentAllocations.find((a) => a.fundId === targetFundId);
  const isCurrentlyActive = existing && existing.weight > 0;

  if (isCurrentlyActive) {
    // Turning OFF: set target to 0, distribute its weight proportionally to remaining active funds
    const remainingActive = currentAllocations.filter(
      (a) => a.fundId !== targetFundId && a.weight > 0
    );

    if (remainingActive.length === 0) {
      return currentAllocations.map((a) =>
        a.fundId === targetFundId ? { ...a, weight: 0 } : a
      );
    }

    const remainingSum = remainingActive.reduce((sum, a) => sum + a.weight, 0);

    let updated = currentAllocations.map((a) => {
      if (a.fundId === targetFundId) return { ...a, weight: 0 };
      if (a.weight <= 0) return a;
      const rebalancedWeight = Math.round((a.weight / remainingSum) * 100);
      return { ...a, weight: rebalancedWeight };
    });

    // Fix rounding discrepancy
    const total = updated.reduce((sum, a) => sum + a.weight, 0);
    const diff = 100 - total;
    if (diff !== 0) {
      const first = updated.find((a) => a.fundId !== targetFundId && a.weight > 0);
      if (first) {
        updated = updated.map((a) =>
          a.fundId === first.fundId ? { ...a, weight: Math.max(0, a.weight + diff) } : a
        );
      }
    }
    return updated;
  } else {
    // Turning ON: add target fund with a fair share (e.g. 25% or 100 / (N+1)), and scale down existing active funds
    const activeAllocations = currentAllocations.filter((a) => a.weight > 0);

    if (activeAllocations.length === 0) {
      const exists = currentAllocations.some((a) => a.fundId === targetFundId);
      if (exists) {
        return currentAllocations.map((a) =>
          a.fundId === targetFundId ? { ...a, weight: 100 } : a
        );
      }
      return [...currentAllocations, { fundId: targetFundId, weight: 100 }];
    }

    const targetShare = Math.min(25, Math.round(100 / (activeAllocations.length + 1)));
    const scaleFactor = (100 - targetShare) / 100;

    let updated = currentAllocations.map((a) => {
      if (a.fundId === targetFundId) return { ...a, weight: targetShare };
      if (a.weight <= 0) return a;
      return { ...a, weight: Math.round(a.weight * scaleFactor) };
    });

    if (!updated.some((a) => a.fundId === targetFundId)) {
      updated.push({ fundId: targetFundId, weight: targetShare });
    }

    // Fix rounding discrepancy to guarantee exact 100%
    const total = updated.reduce((sum, a) => sum + a.weight, 0);
    const diff = 100 - total;
    if (diff !== 0) {
      const largest = [...updated]
        .filter((a) => a.fundId !== targetFundId && a.weight > 0)
        .sort((a, b) => b.weight - a.weight)[0];
      if (largest) {
        updated = updated.map((a) =>
          a.fundId === largest.fundId ? { ...a, weight: Math.max(0, a.weight + diff) } : a
        );
      }
    }
    return updated;
  }
}

/**
 * Rebalances all active funds evenly to sum to 100%.
 */
export function rebalanceEvenly(currentAllocations: PortfolioAllocation[]): PortfolioAllocation[] {
  const active = currentAllocations.filter((a) => a.weight > 0);
  if (active.length === 0) return currentAllocations;

  const equalWeight = Math.floor(100 / active.length);
  let remainder = 100 - equalWeight * active.length;

  return currentAllocations.map((a) => {
    if (a.weight <= 0) return a;
    const addOne = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder--;
    return { ...a, weight: equalWeight + addOne };
  });
}
