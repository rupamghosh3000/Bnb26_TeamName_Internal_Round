import { portfolioService } from './portfolioService.js';
import { marketProvider } from '../providers/index.js';

export interface StressTestScenario {
  name: string;
  shockPercentage: number;
  portfolioImpactValue: number;
  projectedPortfolioValue: number;
  projectedReturnPercent: number;
}

export interface RiskMetrics {
  annualizedVolatility: number;
  maxDrawdown: number;
  concentrationRatio: number; // HHI (0 to 10,000)
  concentrationRisk: 'LOW' | 'MODERATE' | 'HIGH';
  largestPositionPercent: number;
  largestPositionSymbol?: string;
  cashExposurePercent: number;
  equityExposurePercent: number;
  stressTests: StressTestScenario[];
  disclaimer: string;
}

export class RiskService {
  async calculatePortfolioRisk(userId: string): Promise<RiskMetrics> {
    const summary = await portfolioService.getPortfolioSummary(userId);
    const totalValue = summary.totalValue;
    const investedValue = summary.investedValue;

    // Calculate Concentration via HHI (Herfindahl-Hirschman Index)
    // HHI = sum of (weight_percent)^2. Max is 10,000 (single asset).
    let hhi = 0;
    if (summary.positions.length > 0 && investedValue > 0) {
      for (const p of summary.positions) {
        const weightInEquity = (p.currentValue / investedValue) * 100;
        hhi += Math.pow(weightInEquity, 2);
      }
    } else {
      hhi = 0;
    }

    let concentrationRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    if (hhi > 3500) {
      concentrationRisk = 'HIGH';
    } else if (hhi > 1800) {
      concentrationRisk = 'MODERATE';
    }

    // Calculate historical volatility from active positions' 1-month daily closes
    let weightedVolSum = 0;
    let totalInvestedWeight = 0;

    for (const p of summary.positions) {
      try {
        const bars = await marketProvider.getHistoricalData(p.symbol, '1mo', '1d');
        if (bars.length >= 5) {
          const dailyReturns: number[] = [];
          for (let i = 1; i < bars.length; i++) {
            const ret = (bars[i].close - bars[i - 1].close) / bars[i - 1].close;
            dailyReturns.push(ret);
          }
          const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
          const variance =
            dailyReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (dailyReturns.length - 1);
          const dailyStd = Math.sqrt(variance);
          const annualizedVol = dailyStd * Math.sqrt(252) * 100; // In %

          const weight = p.currentValue / (investedValue || 1);
          weightedVolSum += annualizedVol * weight;
          totalInvestedWeight += weight;
        }
      } catch (err) {
        // Fallback default benchmark vol if API unavailable
      }
    }

    // If no positions or insufficient bars, default to 0% (cash has 0 volatility)
    const annualizedVolatility =
      totalInvestedWeight > 0 && totalValue > 0
        ? Number(((weightedVolSum * investedValue) / totalValue).toFixed(2))
        : 0;

    // Estimate Max Drawdown
    // For virtual portfolio, calculate peak to trough
    const snapshots = await portfolioService.getPerformance(userId);
    let peak = -Infinity;
    let maxDrawdown = 0;

    for (const snap of snapshots) {
      if (snap.totalValue > peak) {
        peak = snap.totalValue;
      }
      const dd = peak > 0 ? ((peak - snap.totalValue) / peak) * 100 : 0;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
    }

    // Stress test scenarios
    const stressScenarios = [-15, -10, -5, 5, 10];
    const stressTests: StressTestScenario[] = stressScenarios.map((shock) => {
      const impactValue = Number((investedValue * (shock / 100)).toFixed(2));
      const projectedVal = Number((totalValue + impactValue).toFixed(2));
      const projReturnPct = summary.startingCash > 0
        ? Number((((projectedVal - summary.startingCash) / summary.startingCash) * 100).toFixed(2))
        : 0;

      return {
        name: `Broad Market ${shock > 0 ? '+' : ''}${shock}%`,
        shockPercentage: shock,
        portfolioImpactValue: impactValue,
        projectedPortfolioValue: projectedVal,
        projectedReturnPercent: projReturnPct,
      };
    });

    const equityExposurePercent = totalValue > 0 ? Number(((investedValue / totalValue) * 100).toFixed(2)) : 0;
    const cashExposurePercent = summary.cashExposurePercent;

    return {
      annualizedVolatility,
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      concentrationRatio: Math.round(hhi),
      concentrationRisk,
      largestPositionPercent: summary.largestPosition?.allocationPercent || 0,
      largestPositionSymbol: summary.largestPosition?.symbol,
      cashExposurePercent,
      equityExposurePercent,
      stressTests,
      disclaimer:
        'Hypothetical risk models and stress test projections are for educational analysis only. They do not constitute financial forecasts, guarantees, or investment advice.',
    };
  }

  async runCustomStressTest(userId: string, shockPercentage: number) {
    const summary = await portfolioService.getPortfolioSummary(userId);
    const impact = summary.investedValue * (shockPercentage / 100);
    const projectedValue = summary.totalValue + impact;
    return {
      shockPercentage,
      investedValue: summary.investedValue,
      cashBalance: summary.cashBalance,
      impactValue: Number(impact.toFixed(2)),
      projectedValue: Number(projectedValue.toFixed(2)),
      projectedReturnPercent: summary.startingCash > 0
        ? Number((((projectedValue - summary.startingCash) / summary.startingCash) * 100).toFixed(2))
        : 0,
    };
  }
}

export const riskService = new RiskService();
