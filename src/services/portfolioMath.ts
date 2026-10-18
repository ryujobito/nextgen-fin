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
