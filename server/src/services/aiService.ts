import { marketProvider, newsProvider } from '../providers/index.js';
import { portfolioService } from './portfolioService.js';
import { riskService } from './riskService.js';
import { Trade } from '../models/Trade.js';
import { AIAnalysis, IAIAnalysis, AIAnalysisType } from '../models/AIAnalysis.js';
import { Backtest } from '../models/Backtest.js';

export interface AIResponse {
  answer: string;
  observations: string[];
  sources?: string[];
  uncertainty: string;
  metrics?: Record<string, any>;
  generatedAt: string;
}

export class AIService {
  // 1. AI Market Brief
  async getMarketBrief(userId: string): Promise<AIResponse> {
    const marketStatus = await marketProvider.getMarketStatus();
    const topSymbols = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'TSLA'];

    const quotes = await Promise.all(
      topSymbols.map(async (s) => {
        try {
          return await marketProvider.getQuote(s);
        } catch {
          return null;
        }
      })
    );

    const validQuotes = quotes.filter((q): q is NonNullable<typeof q> => q !== null);
    const news = await newsProvider.getNews(undefined, 6);

    const positiveMovers = validQuotes.filter((q) => q.changePercent > 0);
    const negativeMovers = validQuotes.filter((q) => q.changePercent < 0);
    const avgChange = validQuotes.length > 0
      ? validQuotes.reduce((a, b) => a + b.changePercent, 0) / validQuotes.length
      : 0;

    const observations: string[] = [
      `Market Session: ${marketStatus.session} (${marketStatus.isOpen ? 'Open' : 'Closed'}). Current NYSE/NASDAQ time: ${marketStatus.localTime}.`,
      `Mega-cap Sentiment: ${positiveMovers.length} advancing, ${negativeMovers.length} declining among key benchmarks (Average change: ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%).`,
      ...news.slice(0, 3).map((n) => `[${n.source}] "${n.headline}" — Sentiment tagged as ${n.sentiment}.`),
    ];

    const answer = `Broad market condition reflects a ${
      avgChange > 0.5 ? 'constructive, bullish bias' : avgChange < -0.5 ? 'defensive, bearish tone' : 'consolidating, mixed tone'
    } across primary technology and benchmark equities. Market participants are monitoring earnings developments, Federal Reserve policy expectations, and macroeconomic releases while assessing capital allocation.`;

    const uncertainty =
      'Short-term price action remains subject to intraday liquidity shifts and unscheduled headline developments. Correlation does not imply direct causation.';

    const result: AIResponse = {
      answer,
      observations,
      sources: news.map((n) => `${n.source}: ${n.headline}`),
      uncertainty,
      metrics: {
        advancing: positiveMovers.length,
        declining: negativeMovers.length,
        averageBenchmarkChange: Number(avgChange.toFixed(2)),
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'MARKET_BRIEF', undefined, { quotes: validQuotes.map(q => q.symbol) }, result);
    return result;
  }

  // 2. "Why Did It Move?"
  async explainMovement(userId: string, symbol: string): Promise<AIResponse> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const quote = await marketProvider.getQuote(cleanSymbol);
    const news = await newsProvider.getNews(cleanSymbol, 5);

    const direction = quote.changePercent >= 0 ? 'gained' : 'declined';
    const absChange = Math.abs(quote.changePercent);

    const observations: string[] = [
      `Observed Price Movement: ${cleanSymbol} ${direction} ${absChange.toFixed(2)}% ($${quote.change > 0 ? '+' : ''}${quote.change.toFixed(2)}), closing at $${quote.price.toFixed(2)}.`,
      `Volume Activity: Recorded volume of ${quote.volume.toLocaleString()} shares. Day High: $${quote.dayHigh ?? quote.price}, Day Low: $${quote.dayLow ?? quote.price}.`,
      `Data Freshness: ${quote.freshness} as of ${quote.timestamp}.`,
    ];

    if (news.length > 0) {
      news.slice(0, 3).forEach((n) => {
        observations.push(
          `Headline Observation: "${n.headline}" reported by ${n.source} (${n.sentiment}).`
        );
      });
    } else {
      observations.push('No direct symbol-specific regulatory or earnings filings detected in the immediate window.');
    }

    let possibleFactors = '';
    if (news.length > 0 && Math.abs(news[0].sentimentScore) > 0.2) {
      possibleFactors = `Recent news coverage indicating ${news[0].sentiment.toLowerCase()} themes (e.g., "${news[0].headline}") coincided with shifting order flow.`;
    } else if (absChange > 2) {
      possibleFactors = `Pronounced institutional rebalancing or broader sector momentum appears to have driven elevated trading volumes relative to benchmark indices.`;
    } else {
      possibleFactors = `Normal market auction dynamics and standard liquidity matching within the prevailing trading range.`;
    }

    const answer = `Observed Movement: ${cleanSymbol} ${direction} ${absChange.toFixed(2)}% to trade at $${quote.price.toFixed(2)}. Possible Contributing Factors: ${possibleFactors}`;

    const uncertainty =
      'Price movements in public equities reflect complex aggregate order flow from thousands of market participants. News and sentiment are observed alongside price changes; historical correlation does not guarantee causal attribution.';

    const result: AIResponse = {
      answer,
      observations,
      sources: news.map((n) => `${n.source} (${n.publishedAt.split('T')[0]})`),
      uncertainty,
      metrics: {
        price: quote.price,
        changePercent: quote.changePercent,
        volume: quote.volume,
        newsCount: news.length,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'WHY_DID_IT_MOVE', cleanSymbol, { quote, newsCount: news.length }, result);
    return result;
  }

  // 3. AI Stock Explanation
  async explainStock(userId: string, symbol: string): Promise<AIResponse> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const quote = await marketProvider.getQuote(cleanSymbol);
    const news = await newsProvider.getNews(cleanSymbol, 4);

    const observations: string[] = [
      `Security: ${quote.name || cleanSymbol} (${cleanSymbol}) trading on ${quote.exchange}.`,
      `Current Valuation: $${quote.price.toFixed(2)} ${quote.currency} with 52-week range of $${quote.fiftyTwoWeekLow ?? 'N/A'} - $${quote.fiftyTwoWeekHigh ?? 'N/A'}.`,
      `Recent Performance: Daily change of ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%.`,
    ];

    const answer = `${quote.name || cleanSymbol} is an actively traded equity security listed on ${quote.exchange}. At current market levels ($${quote.price.toFixed(2)}), the asset is trading ${
      quote.fiftyTwoWeekHigh && quote.price >= quote.fiftyTwoWeekHigh * 0.95
        ? 'near its 52-week peak'
        : quote.fiftyTwoWeekLow && quote.price <= quote.fiftyTwoWeekLow * 1.1
        ? 'near its 52-week floor'
        : 'within its mid 52-week channel'
    }. Recent headlines reflect ${news.length > 0 ? news[0].sentiment : 'neutral'} overall sentiment.`;

    const uncertainty =
      'Equity valuation and technical levels are descriptive historical observations and should not be construed as investment recommendations.';

    const result: AIResponse = {
      answer,
      observations,
      sources: news.map((n) => n.source),
      uncertainty,
      metrics: {
        price: quote.price,
        dayRange: `${quote.dayLow ?? 'N/A'} - ${quote.dayHigh ?? 'N/A'}`,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'STOCK_EXPLANATION', cleanSymbol, { quote }, result);
    return result;
  }

  // 4. AI Portfolio Analyst
  async analyzePortfolio(userId: string): Promise<AIResponse> {
    const summary = await portfolioService.getPortfolioSummary(userId);
    const risk = await riskService.calculatePortfolioRisk(userId);

    const observations: string[] = [
      `Total Portfolio Valuation: $${summary.totalValue.toLocaleString()} (Starting Cash: $${summary.startingCash.toLocaleString()}).`,
      `Cash Exposure: $${summary.cashBalance.toLocaleString()} (${summary.cashExposurePercent.toFixed(1)}% of total portfolio).`,
      `Active Positions: ${summary.positionsCount} holdings with total invested capital of $${summary.investedValue.toLocaleString()}.`,
      `Unrealized P&L: $${summary.unrealizedPnL >= 0 ? '+' : ''}${summary.unrealizedPnL.toLocaleString()} (${summary.returnPercent.toFixed(2)}% net return).`,
      `Concentration Risk: Tagged as ${risk.concentrationRisk} (HHI: ${risk.concentrationRatio}). Largest position: ${summary.largestPosition?.symbol || 'None'} at ${summary.largestPosition?.allocationPercent || 0}% allocation.`,
    ];

    let tone = 'conservative with substantial liquidity';
    if (summary.cashExposurePercent < 20) {
      tone = 'aggressive with high equity market exposure';
    } else if (summary.cashExposurePercent < 60) {
      tone = 'balanced with moderate equity participation and a solid cash buffer';
    }

    const answer = `Your virtual portfolio is currently structured with a ${tone}. With ${summary.positionsCount} active holding(s), your largest commitment is in ${
      summary.largestPosition ? `${summary.largestPosition.symbol} (${summary.largestPosition.allocationPercent}%)` : 'cash'
    }. The portfolio shows an annualized estimated volatility of ${risk.annualizedVolatility}% and an overall net return of ${summary.returnPercent.toFixed(2)}%.`;

    const uncertainty =
      'This analysis evaluates the current allocation of your paper portfolio for educational awareness. It is not financial advice or a recommendation to buy or liquidate securities.';

    const result: AIResponse = {
      answer,
      observations,
      sources: ['Internal Ledger & Yahoo Finance Live Quotes'],
      uncertainty,
      metrics: {
        totalValue: summary.totalValue,
        returnPercent: summary.returnPercent,
        cashExposurePercent: summary.cashExposurePercent,
        positionsCount: summary.positionsCount,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'PORTFOLIO_ANALYST', undefined, { summary, risk }, result);
    return result;
  }

  // 5. AI Trade Review
  async reviewTrade(userId: string, tradeId: string): Promise<AIResponse> {
    const trade = await Trade.findOne({ _id: tradeId, userId });
    if (!trade) {
      throw new Error('Trade record not found for review.');
    }

    const observations: string[] = [
      `Execution: ${trade.side} ${trade.quantity} shares of ${trade.symbol} at $${trade.price.toFixed(2)} on ${trade.executedAt.toISOString().split('T')[0]}.`,
      `Total Value Exchanged: $${trade.value.toLocaleString()}.`,
    ];

    if (trade.side === 'SELL' && trade.realizedPnL != null) {
      observations.push(
        `Realized Outcome: Realized P&L of $${trade.realizedPnL >= 0 ? '+' : ''}${trade.realizedPnL.toFixed(2)}.`
      );
    }

    const answer = `Trade Review for ${trade.symbol} (${trade.side}): The order was executed at $${trade.price.toFixed(2)} for ${trade.quantity} units. ${
      trade.side === 'SELL'
        ? `This transaction closed or reduced your position with a realized outcome of $${trade.realizedPnL ?? 0}. Reviewing your initial thesis against actual exit conditions helps refine trade discipline.`
        : `This market entry established or increased your position in ${trade.symbol}. Monitoring price targets and stop-loss boundaries is recommended as market conditions evolve.`
    }`;

    const uncertainty =
      'Trade evaluations are reflective educational summaries intended to encourage systematic trade journaling and emotional detachment. Past trade outcomes do not indicate future trading results.';

    const result: AIResponse = {
      answer,
      observations,
      sources: ['StockPulse Trade Ledger'],
      uncertainty,
      metrics: {
        symbol: trade.symbol,
        side: trade.side,
        price: trade.price,
        quantity: trade.quantity,
        realizedPnL: trade.realizedPnL,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'TRADE_REVIEW', trade.symbol, { trade }, result);
    return result;
  }

  // 6. AI Strategy Analyst
  async analyzeStrategy(userId: string, backtestId: string): Promise<AIResponse> {
    const backtest = await Backtest.findOne({ _id: backtestId, userId });
    if (!backtest) {
      throw new Error('Backtest not found.');
    }

    const outperformance = backtest.totalReturn - backtest.benchmarkReturn;

    const observations: string[] = [
      `Strategy Tested: ${backtest.strategyName} over ${backtest.startDate} to ${backtest.endDate}.`,
      `Performance Metric: Strategy Total Return: ${backtest.totalReturn.toFixed(2)}% vs Buy & Hold Benchmark: ${backtest.benchmarkReturn.toFixed(2)}% (Differential: ${outperformance >= 0 ? '+' : ''}${outperformance.toFixed(2)}%).`,
      `Risk Profile: Maximum Drawdown of ${backtest.maxDrawdown.toFixed(2)}%.`,
      `Execution Statistics: Completed ${backtest.tradeCount} trade(s) with a Win Rate of ${backtest.winRate.toFixed(1)}% and a Profit Factor of ${backtest.profitFactor.toFixed(2)}.`,
    ];

    const answer = `Historical simulation of ${backtest.strategyName} indicates that over the tested period, the rule set generated a total return of ${backtest.totalReturn.toFixed(2)}%, compared with ${backtest.benchmarkReturn.toFixed(2)}% for a passive Buy & Hold stance. The strategy experienced a maximum equity drawdown of ${backtest.maxDrawdown.toFixed(2)}% across ${backtest.tradeCount} trade executions.`;

    const uncertainty =
      'Past backtest performance does not guarantee future results. Backtests assume frictionless fills and do not account for real-world slippage, regulatory halts, or structural market regime shifts.';

    const result: AIResponse = {
      answer,
      observations,
      sources: ['Historical OHLCV Market Data via Yahoo Finance'],
      uncertainty,
      metrics: {
        totalReturn: backtest.totalReturn,
        benchmarkReturn: backtest.benchmarkReturn,
        maxDrawdown: backtest.maxDrawdown,
        winRate: backtest.winRate,
        profitFactor: backtest.profitFactor,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'STRATEGY_ANALYST', backtest.symbol, { backtestId }, result);
    return result;
  }

  // 7. Natural Query Assistant (Intent Router + Tool Executor)
  async handleNaturalQuery(userId: string, message: string): Promise<AIResponse> {
    const text = message.trim().toLowerCase();

    // Tool routing based on user question intent
    // 1. Portfolio query
    if (text.includes('portfolio') || text.includes('balance') || text.includes('cash') || text.includes('net worth')) {
      return this.analyzePortfolio(userId);
    }

    // 2. Risk query
    if (text.includes('risk') || text.includes('volatility') || text.includes('drawdown') || text.includes('concentration')) {
      const risk = await riskService.calculatePortfolioRisk(userId);
      const summary = await portfolioService.getPortfolioSummary(userId);
      const observations = [
        `Annualized Volatility: ${risk.annualizedVolatility}%`,
        `Maximum Drawdown: ${risk.maxDrawdown}%`,
        `Concentration Risk: ${risk.concentrationRisk} (Top holding: ${risk.largestPositionPercent}% of portfolio)`,
        `Cash Cushion: ${risk.cashExposurePercent}% of total funds`,
      ];
      return {
        answer: `Your portfolio risk analysis indicates an annualized volatility of ${risk.annualizedVolatility}% and a concentration rating of ${risk.concentrationRisk}. In a hypothetical -10% market shock, your portfolio value would shift by $${(summary.investedValue * -0.1).toFixed(2)}.`,
        observations,
        sources: ['Internal Risk Analytics Engine'],
        uncertainty: 'Hypothetical risk models are mathematical estimates and not market predictions.',
        generatedAt: new Date().toISOString(),
      };
    }

    // 3. Trade history query
    if (text.includes('trade') || text.includes('order') || text.includes('bought') || text.includes('sold')) {
      const trades = await Trade.find({ userId }).sort({ executedAt: -1 }).limit(5);
      if (trades.length === 0) {
        return {
          answer: 'You have not executed any paper trades yet. You can place your first trade from the Trade page using virtual capital.',
          observations: ['No trade history found.'],
          uncertainty: 'Educational paper trading platform.',
          generatedAt: new Date().toISOString(),
        };
      }
      const observations = trades.map(
        (t) => `[${t.executedAt.toISOString().split('T')[0]}] ${t.side} ${t.quantity} ${t.symbol} @ $${t.price.toFixed(2)}`
      );
      return {
        answer: `You have executed ${trades.length} recent trade(s). Your last trade was ${trades[0].side} ${trades[0].quantity} shares of ${trades[0].symbol} at $${trades[0].price.toFixed(2)}.`,
        observations,
        sources: ['Trade Ledger'],
        uncertainty: 'Trade ledger reflects virtual paper trading executions.',
        generatedAt: new Date().toISOString(),
      };
    }

    // 4. Ticker-specific movement or quote query (e.g. "Why did AAPL move?" or "What is NVDA price?")
    const tickerMatch = text.match(/\b([a-zA-Z]{1,5})\b/g);
    // Find candidate ticker
    const candidates = tickerMatch?.filter(t => ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META', 'AMD', 'SPY', 'QQQ'].includes(t.toUpperCase())) || [];

    if (candidates.length > 0) {
      const symbol = candidates[0].toUpperCase();
      if (text.includes('why') || text.includes('move')) {
        return this.explainMovement(userId, symbol);
      } else {
        return this.explainStock(userId, symbol);
      }
    }

    // Default: AI Market Brief
    return this.getMarketBrief(userId);
  }

  private async recordAnalysis(
    userId: string,
    type: AIAnalysisType,
    symbol: string | undefined,
    contextSnapshot: Record<string, any>,
    result: AIResponse
  ) {
    try {
      const record = new AIAnalysis({
        userId,
        type,
        symbol,
        contextSnapshot,
        result: {
          answer: result.answer,
          observations: result.observations,
          sources: result.sources,
          uncertainty: result.uncertainty,
          metrics: result.metrics,
        },
      });
      await record.save();
    } catch (err) {
      console.error('[AI] Error recording analysis:', err);
    }
  }
}

export const aiService = new AIService();
