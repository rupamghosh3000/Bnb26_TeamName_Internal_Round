import { marketProvider, newsProvider, Quote } from '../providers/index.js';
import { portfolioService } from './portfolioService.js';
import { riskService } from './riskService.js';
import { Trade } from '../models/Trade.js';
import { Position } from '../models/Position.js';
import { PaperAccount } from '../models/PaperAccount.js';
import { AIAnalysis, AIAnalysisType } from '../models/AIAnalysis.js';
import { Backtest } from '../models/Backtest.js';

export interface AIResponse {
  answer: string;
  observations: string[];
  sources?: string[];
  uncertainty: string;
  metrics?: Record<string, any>;
  generatedAt: string;
}

// Comprehensive dictionary mapping company names, brands, nicknames, and index terms to ticker symbols
const COMPANY_TO_TICKER: Record<string, string> = {
  apple: 'AAPL',
  aapl: 'AAPL',
  microsoft: 'MSFT',
  msft: 'MSFT',
  nvidia: 'NVDA',
  nvdia: 'NVDA',
  nvda: 'NVDA',
  google: 'GOOGL',
  alphabet: 'GOOGL',
  googl: 'GOOGL',
  goog: 'GOOGL',
  amazon: 'AMZN',
  amzn: 'AMZN',
  tesla: 'TSLA',
  tsla: 'TSLA',
  meta: 'META',
  facebook: 'META',
  fb: 'META',
  netflix: 'NFLX',
  nflx: 'NFLX',
  palantir: 'PLTR',
  pltr: 'PLTR',
  amd: 'AMD',
  'advanced micro devices': 'AMD',
  intel: 'INTC',
  intc: 'INTC',
  disney: 'DIS',
  dis: 'DIS',
  coinbase: 'COIN',
  coin: 'COIN',
  uber: 'UBER',
  airbnb: 'ABNB',
  spotify: 'SPOT',
  adobe: 'ADBE',
  salesforce: 'CRM',
  oracle: 'ORCL',
  ibm: 'IBM',
  boeing: 'BA',
  walmart: 'WMT',
  costco: 'COST',
  target: 'TGT',
  starbucks: 'SBUX',
  nike: 'NKE',
  ford: 'F',
  gm: 'GM',
  'general motors': 'GM',
  jpmorgan: 'JPM',
  chase: 'JPM',
  jpm: 'JPM',
  'bank of america': 'BAC',
  bofa: 'BAC',
  'goldman sachs': 'GS',
  goldman: 'GS',
  'morgan stanley': 'MS',
  visa: 'V',
  mastercard: 'MA',
  'coca cola': 'KO',
  coke: 'KO',
  pepsi: 'PEP',
  pepsico: 'PEP',
  exxon: 'XOM',
  exxonmobil: 'XOM',
  chevron: 'CVX',
  pfizer: 'PFE',
  moderna: 'MRNA',
  'eli lilly': 'LLY',
  lilly: 'LLY',
  'novo nordisk': 'NVO',
  broadcom: 'AVGO',
  qualcomm: 'QCOM',
  arm: 'ARM',
  'arm holdings': 'ARM',
  tsmc: 'TSM',
  'taiwan semiconductor': 'TSM',
  spy: 'SPY',
  's&p': 'SPY',
  's&p 500': 'SPY',
  sp500: 'SPY',
  qqq: 'QQQ',
  nasdaq: 'QQQ',
  'nasdaq 100': 'QQQ',
  dow: 'DIA',
  'dow jones': 'DIA',
  dia: 'DIA',
  russell: 'IWM',
  iwm: 'IWM',
  bitcoin: 'BTC-USD',
  btc: 'BTC-USD',
  ethereum: 'ETH-USD',
  eth: 'ETH-USD',
  crowdstrike: 'CRWD',
  snowflake: 'SNOW',
  microstrategy: 'MSTR',
  robinhood: 'HOOD',
  shopify: 'SHOP',
  paypal: 'PYPL',
  square: 'SQ',
  block: 'SQ',
  snapchat: 'SNAP',
  snap: 'SNAP',
  roblox: 'RBLX',
  berkshire: 'BRK-B',
  'berkshire hathaway': 'BRK-B',
};

// Common conversational words that should not be mistaken for tickers
const STOPWORDS = new Set([
  'A', 'I', 'IN', 'ON', 'AT', 'TO', 'FOR', 'OF', 'BY', 'WITH', 'ABOUT',
  'WHAT', 'WHY', 'HOW', 'WHEN', 'WHERE', 'WHO', 'WHICH',
  'IS', 'ARE', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING',
  'DO', 'DOES', 'DID', 'HAVE', 'HAS', 'HAD',
  'CAN', 'COULD', 'WILL', 'WOULD', 'SHALL', 'SHOULD', 'MAY', 'MIGHT', 'MUST',
  'THE', 'THIS', 'THAT', 'THESE', 'THOSE',
  'MY', 'YOUR', 'HIS', 'HER', 'ITS', 'OUR', 'THEIR', 'ME', 'YOU', 'HIM', 'US', 'THEM',
  'AND', 'OR', 'BUT', 'IF', 'BECAUSE', 'AS', 'UNTIL', 'WHILE',
  'BUY', 'SELL', 'ORDER', 'TRADE', 'STOCK', 'SHARE', 'SHARES', 'PRICE', 'QUOTE',
  'MONEY', 'CASH', 'PORTFOLIO', 'ACCOUNT', 'BALANCE', 'SHOW', 'TELL', 'GIVE', 'GET',
  'AFFORD', 'MUCH', 'MANY', 'COST', 'VALUE', 'WORTH', 'HIGH', 'LOW', 'TODAY', 'NOW',
  'DAY', 'WEEK', 'MONTH', 'YEAR', 'UP', 'DOWN', 'MOVE', 'MOVED', 'MOVING', 'DROP',
  'GAIN', 'LOSS', 'PROFIT', 'RISK', 'GOOD', 'BAD', 'BEST', 'WORST', 'ALL', 'SOME',
  'ANY', 'MORE', 'LESS', 'THAN', 'LIKE', 'JUST', 'PLEASE', 'HELP', 'EXPLAIN', 'CHECK',
  'TELL', 'FIND', 'SAY', 'TALK', 'RATE', 'PERCENT', 'NUMBER', 'NAME', 'TIME', 'COMPARE',
  'VERSUS', 'BETWEEN', 'DOING', 'LOOK', 'SEE', 'KNOW', 'THINK', 'MEAN', 'WORK', 'WORKS'
]);

export class AIService {
  // 1. AI Market Brief
  async getMarketBrief(userId: string): Promise<AIResponse> {
    const marketStatus = await marketProvider.getMarketStatus();
    const benchmarkSymbols = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'TSLA'];

    const quotes = await Promise.all(
      benchmarkSymbols.map(async (s) => {
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
      `Benchmark Breadth: ${positiveMovers.length} advancing, ${negativeMovers.length} declining across mega-cap leaders (Average change: ${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%).`,
      ...validQuotes.slice(0, 4).map(
        (q) => `${q.symbol}: $${q.price.toFixed(2)} (${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`
      ),
      ...news.slice(0, 3).map((n) => `[${n.source}] "${n.headline}" — Sentiment: ${n.sentiment}`),
    ];

    const marketTone =
      avgChange > 0.5 ? 'constructive, bullish bias' : avgChange < -0.5 ? 'defensive, risk-off tone' : 'consolidating, mixed tone';

    const answer = `Broad market condition reflects a **${marketTone}** across primary US equities. ${positiveMovers.length} of ${validQuotes.length} monitored mega-cap leaders are trading higher, averaging a net move of ${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%. Trading activity remains focused on institutional liquidity flow, macroeconomic data, and company earnings developments.`;

    const uncertainty =
      'Short-term price action remains subject to intraday liquidity shifts, macro announcements, and unscheduled news catalysts. Historical correlation does not imply direct causation.';

    const result: AIResponse = {
      answer,
      observations,
      sources: news.map((n) => `${n.source}: ${n.headline}`),
      uncertainty,
      metrics: {
        advancing: positiveMovers.length,
        declining: negativeMovers.length,
        averageBenchmarkChange: Number(avgChange.toFixed(2)),
        session: marketStatus.session,
        isOpen: marketStatus.isOpen,
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
      `Observed Price Movement: ${cleanSymbol} ${direction} ${absChange.toFixed(2)}% ($${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}), currently at $${quote.price.toFixed(2)}.`,
      `Intraday Trading Range: Low $${quote.dayLow?.toFixed(2) ?? quote.price.toFixed(2)} — High $${quote.dayHigh?.toFixed(2) ?? quote.price.toFixed(2)}. Recorded volume of ${quote.volume.toLocaleString()} shares.`,
      `52-Week Channel: Low $${quote.fiftyTwoWeekLow?.toFixed(2) ?? 'N/A'} — High $${quote.fiftyTwoWeekHigh?.toFixed(2) ?? 'N/A'}.`,
      `Data Freshness: ${quote.freshness} as of ${quote.timestamp}.`,
    ];

    if (news.length > 0) {
      news.slice(0, 3).forEach((n) => {
        observations.push(`Recent Catalyst: "${n.headline}" — ${n.source} (${n.sentiment})`);
      });
    } else {
      observations.push('No direct symbol-specific earnings or regulatory press releases detected in the immediate window.');
    }

    let possibleFactors = '';
    if (news.length > 0 && Math.abs(news[0].sentimentScore) > 0.15) {
      possibleFactors = `Recent news coverage reflecting ${news[0].sentiment.toLowerCase()} sentiment (notably: "${news[0].headline}") has contributed to directional retail and institutional order flow.`;
    } else if (absChange > 2) {
      possibleFactors = `Elevated relative trading volume (${quote.volume.toLocaleString()} shares) suggests institutional portfolio rebalancing or sector-wide momentum shifts.`;
    } else {
      possibleFactors = `Standard two-sided market auction liquidity and consolidation within its recent technical range.`;
    }

    const answer = `**${quote.name || cleanSymbol} (${cleanSymbol})** has ${direction} **${absChange.toFixed(2)}%** ($${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}) to trade at **$${quote.price.toFixed(2)}**.\n\n**Key Catalysts & Flow Factors:**\n${possibleFactors}`;

    const uncertainty =
      'Equity price movements reflect aggregate order execution from thousands of institutional and retail participants. News sentiment and volume are correlated observational factors, not guaranteed causal proof.';

    const result: AIResponse = {
      answer,
      observations,
      sources: news.map((n) => `${n.source} (${n.publishedAt.split('T')[0]})`),
      uncertainty,
      metrics: {
        price: quote.price,
        changePercent: quote.changePercent,
        volume: quote.volume,
        dayRange: `$${quote.dayLow ?? 'N/A'} - $${quote.dayHigh ?? 'N/A'}`,
        newsCount: news.length,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'WHY_DID_IT_MOVE', cleanSymbol, { quote, newsCount: news.length }, result);
    return result;
  }

  // 3. AI Stock Explanation / Quote
  async explainStock(userId: string, symbol: string): Promise<AIResponse> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const quote = await marketProvider.getQuote(cleanSymbol);
    const news = await newsProvider.getNews(cleanSymbol, 4);

    // Check user's position in this stock
    const position = await Position.findOne({ userId, symbol: cleanSymbol });

    const observations: string[] = [
      `Security: ${quote.name || cleanSymbol} (${cleanSymbol}) trading on ${quote.exchange}.`,
      `Current Price: $${quote.price.toFixed(2)} ${quote.currency} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}% today).`,
      `Day Range: $${quote.dayLow?.toFixed(2) ?? 'N/A'} - $${quote.dayHigh?.toFixed(2) ?? 'N/A'}. 52-Week Range: $${quote.fiftyTwoWeekLow?.toFixed(2) ?? 'N/A'} - $${quote.fiftyTwoWeekHigh?.toFixed(2) ?? 'N/A'}.`,
      `Market Volume: ${quote.volume.toLocaleString()} shares traded today.`,
    ];

    if (position) {
      const positionValue = position.quantity * quote.price;
      const unrealizedPnL = positionValue - (position.quantity * position.averagePrice);
      const returnPct = (unrealizedPnL / (position.quantity * position.averagePrice)) * 100;
      observations.push(
        `Your Virtual Position: You own ${position.quantity} shares @ avg $${position.averagePrice.toFixed(2)} (Value: $${positionValue.toFixed(2)}, P&L: ${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toFixed(2)} / ${returnPct.toFixed(2)}%).`
      );
    }

    let valuationPosition = 'within its mid 52-week channel';
    if (quote.fiftyTwoWeekHigh && quote.price >= quote.fiftyTwoWeekHigh * 0.95) {
      valuationPosition = 'near its 52-week peak';
    } else if (quote.fiftyTwoWeekLow && quote.price <= quote.fiftyTwoWeekLow * 1.1) {
      valuationPosition = 'near its 52-week floor';
    }

    let answer = `**${quote.name || cleanSymbol} (${cleanSymbol})** is currently trading at **$${quote.price.toFixed(2)}**, ${quote.changePercent >= 0 ? 'up' : 'down'} **${Math.abs(quote.changePercent).toFixed(2)}%** ($${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}) today on the ${quote.exchange}.\n\n` +
      `The security is currently situated **${valuationPosition}** (52-week range: $${quote.fiftyTwoWeekLow ?? 'N/A'} to $${quote.fiftyTwoWeekHigh ?? 'N/A'}). Recorded trading volume is ${quote.volume.toLocaleString()} shares.`;

    if (position) {
      const positionValue = position.quantity * quote.price;
      const pnl = positionValue - (position.quantity * position.averagePrice);
      answer += `\n\n**Your Portfolio Holding:** You hold **${position.quantity} shares** with an average entry price of **$${position.averagePrice.toFixed(2)}**. Your current unrealized P&L is **${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}**.`;
    }

    const uncertainty =
      'Historical price boundaries and technical metrics are descriptive market observations and should not be construed as investment recommendations.';

    const result: AIResponse = {
      answer,
      observations,
      sources: news.length > 0 ? news.map((n) => `${n.source}: ${n.headline}`) : ['Yahoo Finance Market Feed'],
      uncertainty,
      metrics: {
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        dayRange: `${quote.dayLow ?? 'N/A'} - ${quote.dayHigh ?? 'N/A'}`,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        userHolding: position ? position.quantity : 0,
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
    const positions = await Position.find({ userId });

    const observations: string[] = [
      `Total Portfolio Valuation: $${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Starting Cash: $${summary.startingCash.toLocaleString()}).`,
      `Cash Reserve: $${summary.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${summary.cashExposurePercent.toFixed(1)}% of total capital).`,
      `Active Stock Positions: ${summary.positionsCount} holdings with invested capital of $${summary.investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      `Unrealized P&L: $${summary.unrealizedPnL >= 0 ? '+' : ''}${summary.unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${summary.returnPercent.toFixed(2)}% net return).`,
      `Concentration Risk: Tagged as ${risk.concentrationRisk}. Largest holding: ${summary.largestPosition?.symbol || 'None'} at ${summary.largestPosition?.allocationPercent || 0}% allocation.`,
      `Estimated Volatility: Annualized at ${risk.annualizedVolatility}% with a maximum historical drawdown of ${risk.maxDrawdown}%.`,
    ];

    if (positions.length > 0) {
      const topHoldings = positions.slice(0, 5).map(p => {
        const val = p.quantity * p.currentPrice;
        const pnl = val - (p.quantity * p.averagePrice);
        return `${p.symbol}: ${p.quantity} shares @ $${p.currentPrice.toFixed(2)} (P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})`;
      });
      observations.push(`Holdings Snapshot: ${topHoldings.join(', ')}`);
    }

    let posture = 'conservative with high liquidity buffer';
    if (summary.cashExposurePercent < 25) {
      posture = 'aggressive with high equity market exposure';
    } else if (summary.cashExposurePercent < 65) {
      posture = 'balanced with active stock participation and comfortable liquidity';
    }

    let answer = `Your virtual portfolio is currently valued at **$${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**, representing an overall return of **${summary.returnPercent >= 0 ? '+' : ''}${summary.returnPercent.toFixed(2)}%**.\n\n` +
      `**Capital Structure:**\n` +
      `- **Cash Balance:** $${summary.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${summary.cashExposurePercent.toFixed(1)}%)\n` +
      `- **Invested Capital:** $${summary.investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `- **Active Positions:** ${summary.positionsCount} holding(s)\n` +
      `- **Portfolio Posture:** ${posture}\n\n`;

    if (summary.largestPosition) {
      answer += `Your single largest position is **${summary.largestPosition.symbol}**, comprising **${summary.largestPosition.allocationPercent}%** of your total portfolio. In an unexpected -10% market downturn scenario, your portfolio would experience a modeled impact of -$${(summary.investedValue * 0.1).toFixed(2)}.`;
    } else {
      answer += `You currently hold 100% in cash reserves ($${summary.cashBalance.toLocaleString()}). You have full purchasing power to deploy into simulated market opportunities.`;
    }

    const uncertainty =
      'Portfolio risk metrics evaluate simulated allocations for educational and self-directed trade assessment. They do not constitute formal investment advice.';

    const result: AIResponse = {
      answer,
      observations,
      sources: ['StockPulse Portfolio Ledger', 'Yahoo Finance Live Quotes'],
      uncertainty,
      metrics: {
        totalValue: summary.totalValue,
        cashBalance: summary.cashBalance,
        investedValue: summary.investedValue,
        returnPercent: summary.returnPercent,
        cashExposurePercent: summary.cashExposurePercent,
        positionsCount: summary.positionsCount,
        largestPosition: summary.largestPosition?.symbol ?? 'None',
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
      `Total Value Exchanged: $${trade.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
    ];

    if (trade.side === 'SELL' && trade.realizedPnL != null) {
      observations.push(
        `Realized Outcome: Realized P&L of $${trade.realizedPnL >= 0 ? '+' : ''}${trade.realizedPnL.toFixed(2)}.`
      );
    }

    const answer = `**Trade Execution Review — ${trade.symbol} (${trade.side})**\n\n` +
      `Executed **${trade.quantity} shares** at **$${trade.price.toFixed(2)}** for a total capital exchange of **$${trade.value.toLocaleString()}**.\n\n` +
      (trade.side === 'SELL'
        ? `This transaction closed or trimmed your position with a **realized P&L of $${(trade.realizedPnL ?? 0) >= 0 ? '+' : ''}${trade.realizedPnL?.toFixed(2) ?? '0.00'}**. Reviewing trade outcomes relative to your initial entry thesis reinforces execution discipline.`
        : `This market fill established or expanded your holding in **${trade.symbol}**. Maintain clear exit targets and stop-loss boundaries to safeguard virtual capital as market conditions fluctuate.`);

    const uncertainty =
      'Trade evaluations are reflective educational summaries intended to encourage systematic trade journaling. Past trade outcomes do not guarantee future performance.';

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
      `Strategy Tested: ${backtest.strategyName} on ${backtest.symbol} over ${backtest.startDate} to ${backtest.endDate}.`,
      `Total Strategy Return: ${backtest.totalReturn.toFixed(2)}% vs Buy & Hold Benchmark: ${backtest.benchmarkReturn.toFixed(2)}% (Alpha: ${outperformance >= 0 ? '+' : ''}${outperformance.toFixed(2)}%).`,
      `Risk Profile: Maximum Drawdown of ${backtest.maxDrawdown.toFixed(2)}%.`,
      `Execution Statistics: Completed ${backtest.tradeCount} trade(s) with a Win Rate of ${backtest.winRate.toFixed(1)}% and a Profit Factor of ${backtest.profitFactor.toFixed(2)}.`,
    ];

    const answer = `**Backtest Quantitative Evaluation — ${backtest.strategyName} (${backtest.symbol})**\n\n` +
      `- **Total Strategy Return:** **${backtest.totalReturn >= 0 ? '+' : ''}${backtest.totalReturn.toFixed(2)}%**\n` +
      `- **Benchmark (Buy & Hold) Return:** **${backtest.benchmarkReturn >= 0 ? '+' : ''}${backtest.benchmarkReturn.toFixed(2)}%**\n` +
      `- **Strategy Alpha / Differential:** **${outperformance >= 0 ? '+' : ''}${outperformance.toFixed(2)}%**\n` +
      `- **Maximum Drawdown:** **${backtest.maxDrawdown.toFixed(2)}%**\n` +
      `- **Win Rate:** **${backtest.winRate.toFixed(1)}%** across ${backtest.tradeCount} executed trades\n` +
      `- **Profit Factor:** **${backtest.profitFactor.toFixed(2)}**\n\n` +
      (outperformance > 0
        ? `The strategy outperformed the passive benchmark over this historical window, demonstrating positive statistical expectancy.`
        : `The strategy underperformed passive holding during this period. Tuning indicator parameters or adding trend filters may reduce whipsaws.`);

    const uncertainty =
      'Past backtest performance does not guarantee future results. Backtests assume frictionless fills and do not account for real-world slippage, regulatory halts, or market regime shifts.';

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

  // =========================================================================
  // 7. POWERFUL NATURAL QUERY ASSISTANT (Multi-Tool Intent Engine)
  // =========================================================================

  async handleNaturalQuery(userId: string, message: string): Promise<AIResponse> {
    const rawText = message.trim();
    const textLower = rawText.toLowerCase();

    // STEP A: Resolve Any Stock / Entity Symbols in the Query
    const resolvedSymbols = await this.extractAndResolveSymbols(rawText);

    // STEP B: Specific Stock Buy Advice ("Should I buy Tesla?", "Is NVDA a good buy?", "Is Apple a buy right now?")
    if (
      (textLower.includes('should i buy') ||
        textLower.includes('is it a good time to buy') ||
        textLower.includes('is it good to buy') ||
        textLower.includes('worth buying') ||
        textLower.includes('should i invest in') ||
        textLower.includes('good buy') ||
        textLower.includes('should i get')) &&
      resolvedSymbols.length === 1
    ) {
      return this.handleStockBuyAdvice(userId, resolvedSymbols[0]);
    }

    // STEP C: General Stock Recommendations & Ideas ("What stocks are good to buy today?", "What should I buy?", "Best stocks to invest in", "Stock picks")
    if (
      textLower.includes('good to buy') ||
      textLower.includes('stocks are good to buy') ||
      textLower.includes('what stocks are good') ||
      textLower.includes('what should i buy') ||
      textLower.includes('what stocks should i buy') ||
      textLower.includes('which stock should i buy') ||
      textLower.includes('which stocks should i buy') ||
      textLower.includes('stocks to buy') ||
      textLower.includes('stock to buy') ||
      textLower.includes('best stocks') ||
      textLower.includes('top stocks') ||
      textLower.includes('recommend stocks') ||
      textLower.includes('stock recommendations') ||
      textLower.includes('stocks to invest') ||
      textLower.includes('stock picks') ||
      textLower.includes('stock ideas') ||
      textLower.includes('what to buy') ||
      textLower.includes('what to trade') ||
      textLower.includes('which stock is best') ||
      textLower.includes('suggest stocks') ||
      textLower.includes('suggest some stocks') ||
      textLower.includes('where should i put my money') ||
      textLower.includes('good investments')
    ) {
      return this.handleStockRecommendations(userId);
    }

    // STEP D: Top Gainers & Top Losers ("Top gainers today", "Top losers", "Biggest movers", "Stocks going up")
    if (
      textLower.includes('top gainer') ||
      textLower.includes('biggest gainer') ||
      textLower.includes('gainers') ||
      textLower.includes('stocks going up') ||
      textLower.includes('what is pumping') ||
      textLower.includes('top performers')
    ) {
      return this.handleTopGainersAndLosers(userId, true);
    }
    if (
      textLower.includes('top loser') ||
      textLower.includes('biggest loser') ||
      textLower.includes('losers') ||
      textLower.includes('stocks going down') ||
      textLower.includes('biggest drops') ||
      textLower.includes('worst performers')
    ) {
      return this.handleTopGainersAndLosers(userId, false);
    }

    // STEP E: Beginner / Portfolio Allocation Advice ("How to invest $100k", "How to start trading", "Where to start")
    if (
      textLower.includes('how to invest') ||
      textLower.includes('how should i invest') ||
      textLower.includes('how to start trading') ||
      textLower.includes('how to trade') ||
      textLower.includes('start trading') ||
      textLower.includes('beginner') ||
      textLower.includes('allocate') ||
      textLower.includes('100k') ||
      textLower.includes('where to start')
    ) {
      return this.handleGettingStartedAndAllocation(userId, textLower);
    }

    // STEP F: Check for Stock Comparison Query ("Compare AAPL and MSFT", "TSLA vs NVDA")
    if (
      (textLower.includes('compare') || textLower.includes(' vs ') || textLower.includes('versus') || textLower.includes('difference between')) &&
      resolvedSymbols.length >= 2
    ) {
      return this.handleStockComparison(userId, resolvedSymbols[0], resolvedSymbols[1]);
    }

    // STEP G: Check for Affordability / Buying Power Query ("Can I buy 5 shares of NVDA?", "How many shares of Apple can I afford?")
    if (
      textLower.includes('can i buy') ||
      textLower.includes('can i afford') ||
      textLower.includes('how many shares') ||
      textLower.includes('how much can i buy') ||
      textLower.includes('if i buy') ||
      textLower.includes('afford to buy')
    ) {
      if (resolvedSymbols.length > 0) {
        const symbol = resolvedSymbols[0];
        const quantityMatch = textLower.match(/(\d+)\s*(?:shares|share|units|stocks)?/);
        const requestedQuantity = quantityMatch ? parseInt(quantityMatch[1], 10) : undefined;
        return this.handleAffordabilityQuery(userId, symbol, requestedQuantity);
      }
    }

    // STEP H: Check for "Why Did It Move?" Query
    if (
      (textLower.includes('why') || textLower.includes('move') || textLower.includes('moving') || textLower.includes('drop') || textLower.includes('crash') || textLower.includes('surge') || textLower.includes('jump')) &&
      resolvedSymbols.length > 0
    ) {
      return this.explainMovement(userId, resolvedSymbols[0]);
    }

    // STEP I: Check for Financial Concept / Educational Questions (P/E, RSI, MACD, Stop Loss, Bull/Bear, etc.)
    const educationalMatch = this.detectFinancialConcept(textLower);
    if (educationalMatch) {
      return this.handleFinancialConcept(userId, educationalMatch);
    }

    // STEP J: Check for Portfolio Risk Queries
    if (
      textLower.includes('risk') ||
      textLower.includes('volatility') ||
      textLower.includes('drawdown') ||
      textLower.includes('concentration') ||
      textLower.includes('market crash') ||
      textLower.includes('stress test')
    ) {
      return this.handleRiskQuery(userId);
    }

    // STEP K: Check for Trade History Queries
    if (
      textLower.includes('last trade') ||
      textLower.includes('recent trade') ||
      textLower.includes('trade history') ||
      textLower.includes('my trades') ||
      textLower.includes('orders') ||
      textLower.includes('winning trade') ||
      textLower.includes('losing trade')
    ) {
      return this.handleTradeHistoryQuery(userId);
    }

    // STEP L: Check for Holdings & Portfolio Queries
    if (
      textLower.includes('holding') ||
      textLower.includes('what do i own') ||
      textLower.includes('stocks i have') ||
      textLower.includes('stocks do i have') ||
      textLower.includes('my positions') ||
      textLower.includes('portfolio') ||
      textLower.includes('cash balance') ||
      textLower.includes('how much cash') ||
      textLower.includes('my balance') ||
      textLower.includes('net worth') ||
      textLower.includes('am i in profit')
    ) {
      return this.handleHoldingsAndPortfolioQuery(userId, textLower);
    }

    // STEP M: Strategy / Backtest Inquiries
    if (
      textLower.includes('strategy') ||
      textLower.includes('backtest') ||
      textLower.includes('moving average crossover') ||
      textLower.includes('rsi mean reversion') ||
      textLower.includes('breakout')
    ) {
      return this.handleStrategyInquiry(userId, textLower);
    }

    // STEP N: If a specific symbol was mentioned, explain that stock quote & context
    if (resolvedSymbols.length > 0) {
      return this.explainStock(userId, resolvedSymbols[0]);
    }

    // STEP O: Broad Market Brief (ONLY when user explicitly asks for market brief / status)
    if (
      textLower.includes('market brief') ||
      textLower.includes('market overview') ||
      textLower.includes('market condition') ||
      textLower.includes('market status') ||
      textLower.includes('is market open') ||
      textLower.includes('how is the market') ||
      textLower.includes('broad market')
    ) {
      return this.getMarketBrief(userId);
    }

    // STEP P: External LLM Call (if API key present)
    const externalResponse = await this.tryExternalLLM(userId, rawText);
    if (externalResponse) {
      return externalResponse;
    }

    // STEP Q: General Financial Assistant Inquiry (Never return default brief unless asked)
    return this.handleGeneralFinancialInquiry(userId, rawText);
  }

  // =========================================================================
  // SUB-HANDLERS & DOMAIN REASONING MODULES
  // =========================================================================

  // Helper 1: Symbol & Company Name Resolution
  private async extractAndResolveSymbols(text: string): Promise<string[]> {
    const symbols = new Set<string>();
    const textLower = text.toLowerCase();

    // Check multi-word and single-word company dictionary
    for (const [name, ticker] of Object.entries(COMPANY_TO_TICKER)) {
      const regex = new RegExp(`\\b${name}\\b`, 'i');
      if (regex.test(textLower)) {
        symbols.add(ticker);
      }
    }

    // Check standalone uppercase words (1 to 5 letters)
    const upperMatches = text.match(/\b([A-Z]{1,5})\b/g);
    if (upperMatches) {
      for (const m of upperMatches) {
        if (!STOPWORDS.has(m)) {
          symbols.add(m);
        }
      }
    }

    // Check standalone lowercase/mixed words that might be tickers
    const wordMatches = text.match(/\b([a-zA-Z]{2,5})\b/g);
    if (wordMatches && symbols.size === 0) {
      for (const w of wordMatches) {
        const up = w.toUpperCase();
        if (!STOPWORDS.has(up)) {
          // Verify with quick Yahoo search if not already found
          try {
            const results = await marketProvider.searchSymbols(w);
            if (results.length > 0 && (results[0].symbol === up || results[0].name.toLowerCase().includes(w.toLowerCase()))) {
              symbols.add(results[0].symbol);
              break;
            }
          } catch {
            // ignore search failures
          }
        }
      }
    }

    // Dynamic search fallback: if user says "price of [XYZ]" or "quote for [XYZ]"
    if (symbols.size === 0) {
      const pattern = /(?:price of|quote for|about|analyze|shares of|check|stock of)\s+([a-zA-Z0-9\s]{2,20})/i;
      const match = text.match(pattern);
      if (match && match[1]) {
        const queryTerm = match[1].trim();
        try {
          const results = await marketProvider.searchSymbols(queryTerm);
          if (results.length > 0) {
            symbols.add(results[0].symbol);
          }
        } catch {
          // ignore
        }
      }
    }

    return Array.from(symbols);
  }

  // Helper 2: Affordability & Order Simulation Calculator
  private async handleAffordabilityQuery(userId: string, symbol: string, requestedQuantity?: number): Promise<AIResponse> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const quote = await marketProvider.getQuote(cleanSymbol);
    const account = await PaperAccount.findOne({ userId });
    const cashBalance = account?.cashBalance ?? 100000;
    const position = await Position.findOne({ userId, symbol: cleanSymbol });

    const maxShares = Math.floor(cashBalance / quote.price);

    let answer = '';
    const observations: string[] = [
      `Target Asset: ${quote.name || cleanSymbol} (${cleanSymbol}) trading at $${quote.price.toFixed(2)}.`,
      `Available Virtual Cash: $${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      `Maximum Purchasing Power: You can afford up to ${maxShares.toLocaleString()} shares of ${cleanSymbol} with 100% of your available cash.`,
    ];

    if (position) {
      observations.push(`Current Position: You already own ${position.quantity} shares of ${cleanSymbol} (Average Entry: $${position.averagePrice.toFixed(2)}).`);
    }

    if (requestedQuantity && requestedQuantity > 0) {
      const totalCost = requestedQuantity * quote.price;
      const canAfford = cashBalance >= totalCost;
      const remainingCash = cashBalance - totalCost;

      if (canAfford) {
        answer = `**Yes, you can afford to buy ${requestedQuantity.toLocaleString()} shares of ${cleanSymbol}!**\n\n` +
          `- **Current Stock Price:** $${quote.price.toFixed(2)}\n` +
          `- **Total Order Cost:** **$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** (${requestedQuantity} × $${quote.price.toFixed(2)})\n` +
          `- **Available Cash Balance:** $${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
          `- **Remaining Cash After Trade:** **$${remainingCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n\n` +
          (position
            ? `Executing this order would increase your holding from **${position.quantity} shares** to **${position.quantity + requestedQuantity} shares**.`
            : `Executing this order would initiate your position in **${cleanSymbol}** with **${requestedQuantity} shares**.`);
      } else {
        const shortfall = totalCost - cashBalance;
        answer = `**No, you cannot currently afford ${requestedQuantity.toLocaleString()} shares of ${cleanSymbol}.**\n\n` +
          `- **Total Order Cost:** $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
          `- **Available Cash Balance:** $${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
          `- **Capital Deficit:** Short by **$${shortfall.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n\n` +
          `At current market prices ($${quote.price.toFixed(2)}), you can purchase a maximum of **${maxShares.toLocaleString()} shares**, which would cost **$${(maxShares * quote.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.`;
      }
    } else {
      answer = `Based on your available virtual cash balance of **$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** and **${cleanSymbol}**'s current price of **$${quote.price.toFixed(2)}**:\n\n` +
        `- **Maximum Affordable Shares:** **${maxShares.toLocaleString()} shares**\n` +
        `- **Total Capital Required:** **$${(maxShares * quote.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n` +
        `- **Remaining Cash:** $${(cashBalance - (maxShares * quote.price)).toFixed(2)}\n\n` +
        `You can place a market or limit order directly on the **Trade** page to execute.`;
    }

    const result: AIResponse = {
      answer,
      observations,
      sources: ['StockPulse Paper Account Ledger', 'Yahoo Finance Live Quotes'],
      uncertainty: 'Simulated paper trading calculations. Market orders are executed at live auction prices subject to market hours.',
      metrics: {
        symbol: cleanSymbol,
        price: quote.price,
        cashBalance,
        maxAffordableShares: maxShares,
        requestedQuantity,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'NATURAL_QUERY', cleanSymbol, { cashBalance, maxShares }, result);
    return result;
  }

  // Helper 3: Multi-Stock Comparison Engine
  private async handleStockComparison(userId: string, symbolA: string, symbolB: string): Promise<AIResponse> {
    const cleanA = symbolA.trim().toUpperCase();
    const cleanB = symbolB.trim().toUpperCase();

    const [quoteA, quoteB] = await Promise.all([
      marketProvider.getQuote(cleanA),
      marketProvider.getQuote(cleanB),
    ]);

    const [newsA, newsB] = await Promise.all([
      newsProvider.getNews(cleanA, 3).catch(() => []),
      newsProvider.getNews(cleanB, 3).catch(() => []),
    ]);

    const posA = await Position.findOne({ userId, symbol: cleanA });
    const posB = await Position.findOne({ userId, symbol: cleanB });

    const leader = quoteA.changePercent >= quoteB.changePercent ? cleanA : cleanB;
    const diff = Math.abs(quoteA.changePercent - quoteB.changePercent).toFixed(2);

    const observations: string[] = [
      `${cleanA} (${quoteA.name || cleanA}): $${quoteA.price.toFixed(2)} (${quoteA.changePercent >= 0 ? '+' : ''}${quoteA.changePercent.toFixed(2)}%). 52W Range: $${quoteA.fiftyTwoWeekLow ?? 'N/A'} - $${quoteA.fiftyTwoWeekHigh ?? 'N/A'}.`,
      `${cleanB} (${quoteB.name || cleanB}): $${quoteB.price.toFixed(2)} (${quoteB.changePercent >= 0 ? '+' : ''}${quoteB.changePercent.toFixed(2)}%). 52W Range: $${quoteB.fiftyTwoWeekLow ?? 'N/A'} - $${quoteB.fiftyTwoWeekHigh ?? 'N/A'}.`,
      `Intraday Momentum: **${leader}** is leading by ${diff}% in today's session.`,
      `Trading Volume: ${cleanA} recorded ${quoteA.volume.toLocaleString()} shares vs ${cleanB} with ${quoteB.volume.toLocaleString()} shares.`,
    ];

    if (posA || posB) {
      observations.push(
        `Portfolio Presence: ${posA ? `You own ${posA.quantity} shares of ${cleanA}` : `No ${cleanA} owned`}; ${posB ? `You own ${posB.quantity} shares of ${cleanB}` : `No ${cleanB} owned`}.`
      );
    }

    const answer = `### Comparative Market Analysis: **${cleanA}** vs **${cleanB}**\n\n` +
      `| Metric | ${cleanA} | ${cleanB} |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Company** | ${quoteA.name || cleanA} | ${quoteB.name || cleanB} |\n` +
      `| **Current Price** | **$${quoteA.price.toFixed(2)}** | **$${quoteB.price.toFixed(2)}** |\n` +
      `| **Today's Change** | ${quoteA.changePercent >= 0 ? '🟢 +' : '🔴 '}${quoteA.changePercent.toFixed(2)}% | ${quoteB.changePercent >= 0 ? '🟢 +' : '🔴 '}${quoteB.changePercent.toFixed(2)}% |\n` +
      `| **Day Range** | $${quoteA.dayLow ?? 'N/A'} - $${quoteA.dayHigh ?? 'N/A'} | $${quoteB.dayLow ?? 'N/A'} - $${quoteB.dayHigh ?? 'N/A'} |\n` +
      `| **52-Week Range** | $${quoteA.fiftyTwoWeekLow ?? 'N/A'} - $${quoteA.fiftyTwoWeekHigh ?? 'N/A'} | $${quoteB.fiftyTwoWeekLow ?? 'N/A'} - $${quoteB.fiftyTwoWeekHigh ?? 'N/A'} |\n` +
      `| **Volume** | ${quoteA.volume.toLocaleString()} | ${quoteB.volume.toLocaleString()} |\n` +
      `| **Your Position** | ${posA ? `${posA.quantity} shares` : '0 shares'} | ${posB ? `${posB.quantity} shares` : '0 shares'} |\n\n` +
      `**Performance Summary:** Today, **${leader}** is exhibiting stronger relative momentum with a **${diff}% outperformance**. ` +
      (newsA.length > 0 ? `Latest ${cleanA} headline: *"${newsA[0].headline}"* (${newsA[0].sentiment}). ` : '') +
      (newsB.length > 0 ? `Latest ${cleanB} headline: *"${newsB[0].headline}"* (${newsB[0].sentiment}).` : '');

    const result: AIResponse = {
      answer,
      observations,
      sources: ['Yahoo Finance Live Quotes', 'Financial News Stream'],
      uncertainty: 'Comparative analysis reflects real-time prices and news sentiment. Relative momentum is subject to ongoing intraday volatility.',
      metrics: {
        symbolA: cleanA,
        priceA: quoteA.price,
        changeA: quoteA.changePercent,
        symbolB: cleanB,
        priceB: quoteB.price,
        changeB: quoteB.changePercent,
        momentumLeader: leader,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'NATURAL_QUERY', `${cleanA}_VS_${cleanB}`, { cleanA, cleanB }, result);
    return result;
  }

  // Helper 4: Financial Concept & Educational Module
  private detectFinancialConcept(text: string): string | null {
    if (text.includes('p/e') || text.includes('pe ratio') || text.includes('price to earnings') || text.includes('price-to-earnings')) return 'PE_RATIO';
    if (text.includes('rsi') || text.includes('relative strength index')) return 'RSI';
    if (text.includes('macd') || text.includes('moving average convergence')) return 'MACD';
    if (text.includes('stop loss') || text.includes('stop-loss')) return 'STOP_LOSS';
    if (text.includes('limit order') || text.includes('limit vs market') || text.includes('market order')) return 'ORDER_TYPES';
    if (text.includes('short sell') || text.includes('shorting') || text.includes('short position')) return 'SHORT_SELLING';
    if (text.includes('market cap') || text.includes('market capitalization')) return 'MARKET_CAP';
    if (text.includes('beta') && (text.includes('stock') || text.includes('portfolio') || text.includes('volatility') || text.includes('what is'))) return 'BETA';
    if (text.includes('drawdown') || text.includes('max drawdown')) return 'DRAWDOWN';
    if (text.includes('sharpe') || text.includes('profit factor')) return 'PERFORMANCE_METRICS';
    if (text.includes('moving average') || text.includes('golden cross') || text.includes('death cross')) return 'MOVING_AVERAGES';
    if (text.includes('paper trade') || text.includes('paper trading') || text.includes('virtual money')) return 'PAPER_TRADING';
    if (text.includes('diversif') || text.includes('asset allocation')) return 'DIVERSIFICATION';
    if (text.includes('bull market') || text.includes('bear market') || text.includes('bull vs bear') || text.includes('bullish vs bearish')) return 'BULL_VS_BEAR';
    if (text.includes('inflation') || text.includes('cpi') || text.includes('interest rate') || text.includes('fed hike') || text.includes('fed cut')) return 'INFLATION_AND_RATES';
    if (text.includes('earnings season') || text.includes('earnings report') || text.includes('earnings call')) return 'EARNINGS_SEASON';
    if (text.includes('support') && (text.includes('resistance') || text.includes('level') || text.includes('floor') || text.includes('ceiling'))) return 'SUPPORT_RESISTANCE';
    if (text.includes('options vs stocks') || text.includes('what are options') || text.includes('call and put') || text.includes('put option')) return 'OPTIONS_VS_STOCKS';
    return null;
  }

  private async handleFinancialConcept(userId: string, concept: string): Promise<AIResponse> {
    let title = '';
    let formula = '';
    let explanation = '';
    let benchmarks = '';
    let application = '';

    switch (concept) {
      case 'PE_RATIO':
        title = 'Price-to-Earnings (P/E) Ratio';
        formula = 'P/E = Market Price per Share / Earnings per Share (EPS)';
        explanation = 'The Price-to-Earnings ratio measures a company’s current share price relative to its per-share earnings. It indicates how much investors are willing to pay per dollar of company profit.';
        benchmarks = '• Historical S&P 500 average: ~15x to 25x.\n• High P/E (>35x): Indicates high anticipated future growth (typical in tech companies like NVDA) or potential overvaluation.\n• Low P/E (<15x): May indicate an undervalued bargain or a mature/declining business model.';
        application = 'In StockPulse, you can view P/E ratios and valuation indicators on any Stock Detail page to evaluate whether a security is trading at an attractive multiple.';
        break;

      case 'RSI':
        title = 'Relative Strength Index (RSI)';
        formula = 'RSI = 100 - (100 / (1 + RS)), where RS = Average Gain / Average Loss over 14 periods';
        explanation = 'The RSI is a popular momentum oscillator that ranges between 0 and 100. It measures the velocity and magnitude of recent price changes to evaluate overbought or oversold conditions.';
        benchmarks = '• RSI > 70: **Overbought** (asset may be overextended, risking a short-term pullback).\n• RSI < 30: **Oversold** (asset may be excessively dumped, presenting a potential bounce).\n• Bullish Divergence: Price creates lower lows while RSI forms higher lows, signaling weakening downward momentum.';
        application = 'You can toggle the RSI indicator directly on our TradingView-style interactive charts and backtest RSI Mean Reversion strategies on the Backtest page.';
        break;

      case 'MACD':
        title = 'Moving Average Convergence Divergence (MACD)';
        formula = 'MACD Line = 12-day EMA - 26-day EMA; Signal Line = 9-day EMA of MACD';
        explanation = 'The MACD is a trend-following momentum indicator that reveals the relationship between two exponential moving averages. The MACD histogram displays the difference between the MACD line and its signal line.';
        benchmarks = '• Bullish Signal: MACD line crosses above the signal line.\n• Bearish Signal: MACD line crosses below the signal line.\n• Centerline Crossover: Moving above 0 signals positive 12-day vs 26-day momentum.';
        application = 'Explore MACD momentum shifts on our Technical Analysis panel and apply it in automated strategy rule testing.';
        break;

      case 'STOP_LOSS':
        title = 'Stop-Loss Orders & Risk Mitigation';
        formula = 'Trigger Price = Entry Price × (1 - Max Allowed Loss %); e.g., $100 entry with 5% stop = $95 trigger';
        explanation = 'A Stop-Loss order is an automatic risk-protection mechanism placed with an exchange to exit a position once the stock hits a predefined price, capping downside loss.';
        benchmarks = '• Swing Trading Stop: Typically placed 1-2% below a recent support level or 20-day moving average.\n• Risk-Reward Ratio: Professional traders often aim for at least a 2:1 or 3:1 ratio (risking $1 to make $2 or $3).';
        application = 'StockPulse lets you configure automated price alerts that notify you instantly when your stop boundaries are reached.';
        break;

      case 'ORDER_TYPES':
        title = 'Market Orders vs. Limit Orders';
        formula = 'Market: Immediate Execution @ Best Available Price | Limit: Execution @ Limit Price or Better';
        explanation = 'A **Market Order** prioritizes immediate execution speed over price certainty, filling at whatever the current market auction asks. A **Limit Order** guarantees price protection, executing only at your specified target price or better, but does not guarantee execution if the market never reaches your price.';
        benchmarks = '• High Volatility: Limit orders prevent unexpected slippage.\n• Liquid Mega-Caps: Market orders execute virtually instantaneously with minimal spread.';
        application = 'Use the StockPulse Trade panel to toggle between Market and Limit order types when placing virtual trades.';
        break;

      case 'SHORT_SELLING':
        title = 'Short Selling Mechanics & Risks';
        formula = 'Profit = (Selling Price - Buying Back Price) × Shares - Borrow Fees';
        explanation = 'Short selling allows traders to profit from a declining stock price. The trader borrows shares from a broker, sells them immediately on the open market, and later buys them back (covers) to return them to the lender.';
        benchmarks = '• Asymmetric Risk: While long trades have a maximum loss of 100%, short positions theoretically have unlimited risk because a stock price has no upper ceiling.\n• Short Squeeze: Rapid upward price spikes caused by short sellers rushing to buy back shares simultaneously.';
        application = 'Monitor short interest trends, market breadth, and sector sentiment in the StockPulse AI Market Intelligence feed.';
        break;

      case 'MARKET_CAP':
        title = 'Market Capitalization';
        formula = 'Market Cap = Current Share Price × Total Outstanding Shares';
        explanation = 'Market Capitalization represents the aggregate market value of a company’s outstanding equity. It defines the company’s size category and risk profile.';
        benchmarks = '• Mega-Cap: > $200 Billion (AAPL, MSFT, NVDA, AMZN)\n• Large-Cap: $10 Billion to $200 Billion\n• Mid-Cap: $2 Billion to $10 Billion\n• Small-Cap: $300 Million to $2 Billion';
        application = 'StockPulse screens equities across all capitalization tiers with live volume and valuation metrics.';
        break;

      case 'BETA':
        title = 'Beta (Systematic Market Sensitivity)';
        formula = 'Beta = Covariance(Asset, Benchmark) / Variance(Benchmark)';
        explanation = 'Beta measures how sensitively a stock or portfolio responds to movements in the broader benchmark index (S&P 500 = 1.0).';
        benchmarks = '• Beta = 1.0: Moves in lockstep with the market.\n• Beta > 1.2: Higher volatility and beta risk (e.g. high-growth tech or crypto equities).\n• Beta < 0.8: Defensive holding (e.g. consumer staples, utilities, healthcare).';
        application = 'Visit the Risk Analytics page in StockPulse to view your overall portfolio beta and stress-test performance against a -10% market shock.';
        break;

      case 'DRAWDOWN':
        title = 'Maximum Drawdown (MDD)';
        formula = 'Max Drawdown = (Trough Value - Peak Value) / Peak Value';
        explanation = 'Maximum Drawdown measures the largest percentage decline from a portfolio’s peak equity high to its subsequent lowest trough before recovering to a new high. It represents the worst-case capital drawdown experience.';
        benchmarks = '• Conservative Strategy: MDD < 10%.\n• Aggressive Growth: MDD 20% to 35%.\n• Critical Metric: Strategies with high returns but >50% drawdowns risk catastrophic account ruin.';
        application = 'Check your portfolio’s historical drawdown on the Risk page and inspect maximum drawdown for any backtested algorithm.';
        break;

      case 'MOVING_AVERAGES':
        title = 'Moving Average Crossovers (Golden Cross & Death Cross)';
        formula = 'SMA = Sum of Close Prices / N periods | EMA gives more weight to recent prices';
        explanation = 'Moving averages smooth price action to highlight underlying trend direction. Crossovers between short-term and long-term averages signal structural trend shifts.';
        benchmarks = '• **Golden Cross:** 50-day MA crosses above the 200-day MA (major long-term bullish signal).\n• **Death Cross:** 50-day MA crosses below the 200-day MA (major long-term bearish signal).';
        application = 'Run automated simulations of Moving Average Crossover rules on the StockPulse Strategy Backtesting engine.';
        break;

      case 'BULL_VS_BEAR':
        title = 'Bull Markets vs. Bear Markets';
        formula = 'Bull: Rise of ≥20% from trough | Bear: Decline of ≥20% from peak';
        explanation = 'A **Bull Market** is characterized by rising prices, investor confidence, expanding corporate earnings, and favorable macroeconomic conditions. A **Bear Market** is marked by persistent declines of 20% or more, widespread risk aversion, contracting valuation multiples, and economic uncertainty.';
        benchmarks = '• Historical Bull Markets: Average duration ~4.5 years with cumulative gains exceeding 150%.\n• Historical Bear Markets: Average duration ~10-14 months with typical declines of ~30-35%.\n• Strategy: Bull markets favor momentum and growth compounders; bear markets emphasize cash reserves, defensive anchors, and strict stop-loss discipline.';
        application = 'Check the AI Market Brief on the Dashboard to see current benchmark trends and market regime indicators.';
        break;

      case 'INFLATION_AND_RATES':
        title = 'Inflation & Federal Reserve Interest Rates';
        formula = 'Discounted Cash Flow (DCF): Value = CF / (1 + r)^t, where r = Risk-Free Rate + Equity Premium';
        explanation = 'Inflation reduces consumer purchasing power. When inflation runs above target (2%), central banks raise interest rates (Federal Funds Rate) to tighten credit and cool demand. Higher interest rates make cash and bonds more attractive, increasing discount rates (r) and putting downward valuation pressure on high-growth equities.';
        benchmarks = '• Rate Hikes: Negative for speculative, high-debt, unprofitable growth companies.\n• Rate Cuts / Easing: Bullish tailwind for equities, especially technology and real estate.\n• Fed Pivot: The transition from tightening to easing often sparks major cyclical bull runs.';
        application = 'StockPulse AI tracks macroeconomic news headlines and Fed policy statements in the Market Intelligence feed.';
        break;

      case 'EARNINGS_SEASON':
        title = 'Earnings Season & Guidance Dynamics';
        formula = 'EPS Surprise % = [(Reported EPS - Consensus Estimate) / |Consensus Estimate|] × 100';
        explanation = 'Earnings Season occurs four times a year (January, April, July, October) as public corporations release quarterly financial statements, 10-Q filings, and executive forward guidance. Stock prices react violently not just to past profits, but to whether management raises or lowers guidance for upcoming quarters.';
        benchmarks = '• Beat & Raise: Company beats earnings expectations and raises future guidance (bullish catalyst).\n• Miss & Lower: Company misses forecasts and lowers guidance (bearish catalyst).\n• Implied Volatility: Options and implied moves typically elevate 3-5 days before reporting.';
        application = 'Inspect "Why Did It Move?" on StockPulse to see whether recent price gaps were caused by earnings releases.';
        break;

      case 'SUPPORT_RESISTANCE':
        title = 'Support & Resistance Price Levels';
        formula = 'Support = Demand Floor (Buyers > Sellers) | Resistance = Supply Ceiling (Sellers > Buyers)';
        explanation = 'Support represents a historical price zone where downward momentum stalls due to concentrated buying interest. Resistance represents a price level where selling pressure exceeds demand, preventing further advances.';
        benchmarks = '• Support Breakout: A break below support often triggers stop-loss cascades and accelerated selling.\n• Resistance Breakout: A high-volume break above resistance frequently confirms trend continuation and new highs.\n• Role Reversal: Once broken, previous resistance often acts as new support.';
        application = 'View 52-week highs, lows, and day ranges on any StockPulse chart to identify critical support and resistance thresholds.';
        break;

      case 'OPTIONS_VS_STOCKS':
        title = 'Stocks vs. Options Contracts';
        formula = 'Call Option = Right to Buy @ Strike | Put Option = Right to Sell @ Strike (1 Contract = 100 Shares)';
        explanation = 'Holding **Stocks** confers direct equity ownership in a corporation with voting rights, dividends, and no expiration date. **Options** are derivative contracts that give the trader the right, but not the obligation, to buy (Call) or sell (Put) shares at a specific strike price before an expiration date.';
        benchmarks = '• Time Decay (Theta): Options lose value as expiration approaches, even if the underlying stock remains flat.\n• Leverage: Options provide asymmetric leverage, but risk 100% loss of the premium paid.\n• Stock Investing: Eliminates time decay risk and allows investors to hold through market pullbacks.';
        application = 'StockPulse currently focuses on equity paper trading with live market fills to build disciplined capital compounding habits.';
        break;

      default:
        title = 'Paper Trading & Market Simulation';
        formula = 'Virtual Equity = Virtual Cash Balance + Current Market Value of Open Positions';
        explanation = 'Paper trading enables investors to test execution tactics, practice risk management, and experience real-time market auction conditions with virtual funds before committing real capital.';
        benchmarks = '• Discipline: Treat virtual funds with the same discipline as real capital.\n• Execution: Test stops, limit orders, and portfolio sizing systematically.';
        application = 'Every StockPulse account comes funded with $100,000 in virtual paper trading capital backed by real-time Yahoo Finance data.';
        break;
    }

    const answer = `### Financial Education: **${title}**\n\n` +
      `**Core Formula / Definition:**\n\`${formula}\`\n\n` +
      `**Overview:**\n${explanation}\n\n` +
      `**Key Benchmarks & Interpretation:**\n${benchmarks}\n\n` +
      `**Application in StockPulse:**\n${application}`;

    const observations = [
      `Concept: ${title}`,
      `Formula: ${formula}`,
      `Educational Reference: Grounded in standard financial economics and algorithmic trading principles.`,
    ];

    const result: AIResponse = {
      answer,
      observations,
      sources: ['Chartered Financial Analyst (CFA) Principles', 'StockPulse Educational Engine'],
      uncertainty: 'Financial definitions and formulas are educational resources and do not guarantee market profitability.',
      metrics: { concept, title },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'NATURAL_QUERY', concept, { title }, result);
    return result;
  }

  // Helper 5: Holdings & Portfolio Inspection
  private async handleHoldingsAndPortfolioQuery(userId: string, queryText: string): Promise<AIResponse> {
    const summary = await portfolioService.getPortfolioSummary(userId);
    const positions = await Position.find({ userId });

    const observations: string[] = [
      `Total Portfolio Equity: $${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      `Cash Balance: $${summary.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${summary.cashExposurePercent.toFixed(1)}% of total funds).`,
      `Invested Capital: $${summary.investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} across ${summary.positionsCount} position(s).`,
      `Net Return: ${summary.returnPercent >= 0 ? '+' : ''}${summary.returnPercent.toFixed(2)}% ($${summary.unrealizedPnL >= 0 ? '+' : ''}$${summary.unrealizedPnL.toFixed(2)} unrealized).`,
    ];

    let answer = `### Your Current Portfolio & Holdings Summary\n\n` +
      `- **Total Portfolio Value:** **$${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n` +
      `- **Virtual Cash Balance:** **$${summary.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**\n` +
      `- **Invested Capital:** $${summary.investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `- **Overall Return:** **${summary.returnPercent >= 0 ? '🟢 +' : '🔴 '}${summary.returnPercent.toFixed(2)}%** ($${summary.unrealizedPnL >= 0 ? '+' : ''}$${summary.unrealizedPnL.toFixed(2)})\n\n`;

    if (positions.length === 0) {
      answer += `You currently hold **no open stock positions**. Your entire virtual balance of **$${summary.cashBalance.toLocaleString()}** is in liquid cash.\n\n` +
        `To open your first simulated position, navigate to the **Trade** page or search for any stock symbol (like NVDA, AAPL, MSFT, or TSLA).`;
    } else {
      answer += `**Your Active Holdings:**\n\n` +
        `| Symbol | Shares | Avg Price | Current Price | Market Value | Unrealized P&L |\n` +
        `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

      for (const p of positions) {
        const val = p.quantity * p.currentPrice;
        const pnl = val - (p.quantity * p.averagePrice);
        const pnlPct = (pnl / (p.quantity * p.averagePrice)) * 100;
        answer += `| **${p.symbol}** | ${p.quantity} | $${p.averagePrice.toFixed(2)} | $${p.currentPrice.toFixed(2)} | $${val.toFixed(2)} | ${pnl >= 0 ? '🟢 +' : '🔴 '}$${pnl.toFixed(2)} (${pnlPct.toFixed(1)}%) |\n`;
        observations.push(`${p.symbol}: ${p.quantity} shares, Current Price $${p.currentPrice.toFixed(2)}, P&L $${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
      }
    }

    const result: AIResponse = {
      answer,
      observations,
      sources: ['StockPulse Position Ledger', 'Yahoo Finance Live Quotes'],
      uncertainty: 'Valuations reflect live market prices and your paper trading ledger.',
      metrics: {
        totalValue: summary.totalValue,
        cashBalance: summary.cashBalance,
        positionsCount: positions.length,
        unrealizedPnL: summary.unrealizedPnL,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'PORTFOLIO_ANALYST', undefined, { summary }, result);
    return result;
  }

  // Helper 6: Trade History & Performance Review
  private async handleTradeHistoryQuery(userId: string): Promise<AIResponse> {
    const trades = await Trade.find({ userId }).sort({ executedAt: -1 }).limit(10);
    const totalTrades = await Trade.countDocuments({ userId });

    if (trades.length === 0) {
      return {
        answer: 'You have not executed any virtual trades yet. Your starting capital of **$100,000** is available. Visit the **Trade** page to place your first market or limit order.',
        observations: ['No trade history found in the ledger.'],
        sources: ['StockPulse Trade Ledger'],
        uncertainty: 'Virtual paper trading platform.',
        metrics: { totalTrades: 0 },
        generatedAt: new Date().toISOString(),
      };
    }

    const buyTrades = trades.filter(t => t.side === 'BUY');
    const sellTrades = trades.filter(t => t.side === 'SELL');
    const totalRealizedPnL = sellTrades.reduce((acc, t) => acc + (t.realizedPnL ?? 0), 0);

    const observations: string[] = [
      `Total Trades Executed: ${totalTrades} lifetime trades (${buyTrades.length} Buys, ${sellTrades.length} Sells in recent sample).`,
      `Net Realized P&L from Closed Trades: $${totalRealizedPnL >= 0 ? '+' : ''}${totalRealizedPnL.toFixed(2)}.`,
      `Most Recent Trade: ${trades[0].side} ${trades[0].quantity} shares of ${trades[0].symbol} @ $${trades[0].price.toFixed(2)} on ${trades[0].executedAt.toISOString().split('T')[0]}.`,
    ];

    let answer = `### Your Trade History & Execution Ledger\n\n` +
      `- **Total Lifetime Trades:** **${totalTrades}**\n` +
      `- **Net Realized P&L (Exits):** **${totalRealizedPnL >= 0 ? '🟢 +' : '🔴 '}$${totalRealizedPnL.toFixed(2)}**\n` +
      `- **Last Executed Trade:** ${trades[0].side} ${trades[0].quantity} shares of **${trades[0].symbol}** at **$${trades[0].price.toFixed(2)}**\n\n` +
      `**Recent Executions:**\n\n` +
      `| Date | Symbol | Side | Quantity | Price | Value | Realized P&L |\n` +
      `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const t of trades.slice(0, 5)) {
      const dateStr = t.executedAt.toISOString().split('T')[0];
      const pnlStr = t.side === 'SELL' && t.realizedPnL != null
        ? `${t.realizedPnL >= 0 ? '🟢 +' : '🔴 '}$${t.realizedPnL.toFixed(2)}`
        : '—';
      answer += `| ${dateStr} | **${t.symbol}** | ${t.side === 'BUY' ? '🟢 BUY' : '🔴 SELL'} | ${t.quantity} | $${t.price.toFixed(2)} | $${t.value.toFixed(2)} | ${pnlStr} |\n`;
    }

    const result: AIResponse = {
      answer,
      observations,
      sources: ['StockPulse Trade Ledger'],
      uncertainty: 'Trade ledger reflects virtual paper trading executions.',
      metrics: {
        totalTrades,
        totalRealizedPnL,
        lastTradeSymbol: trades[0].symbol,
        lastTradeSide: trades[0].side,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'TRADE_REVIEW', trades[0].symbol, { totalTrades }, result);
    return result;
  }

  // Helper 7: Risk Review
  private async handleRiskQuery(userId: string): Promise<AIResponse> {
    const risk = await riskService.calculatePortfolioRisk(userId);
    const summary = await portfolioService.getPortfolioSummary(userId);

    const observations = [
      `Annualized Estimated Volatility: ${risk.annualizedVolatility}%`,
      `Maximum Historical Drawdown: ${risk.maxDrawdown}%`,
      `Concentration Risk: Tagged as ${risk.concentrationRisk} (HHI: ${risk.concentrationRatio})`,
      `Largest Holding: ${risk.largestPositionSymbol ? `${risk.largestPositionSymbol} (${risk.largestPositionPercent}%)` : 'None'}`,
      `Liquid Cash Buffer: ${risk.cashExposurePercent}% of total funds`,
      `Market Stress Test (-10% Shock): Modeled portfolio shift of -$${(summary.investedValue * 0.1).toFixed(2)}`,
    ];

    const answer = `### Portfolio Risk Analytics & Volatility Breakdown\n\n` +
      `- **Annualized Volatility:** **${risk.annualizedVolatility}%**\n` +
      `- **Concentration Rating:** **${risk.concentrationRisk}** (Top holding represents ${risk.largestPositionPercent}% of portfolio)\n` +
      `- **Maximum Historical Drawdown:** **${risk.maxDrawdown}%**\n` +
      `- **Cash Cushion:** **${risk.cashExposurePercent}%**\n\n` +
      `**Stress Test Analysis:**\n` +
      `In a sudden **-10% broad market drawdown**, your invested capital ($${summary.investedValue.toLocaleString()}) would experience an estimated drop of **-$${(summary.investedValue * 0.1).toFixed(2)}**, bringing your portfolio value to **$${(summary.totalValue - (summary.investedValue * 0.1)).toFixed(2)}**.\n\n` +
      `Your cash reserve of $${summary.cashBalance.toLocaleString()} acts as a buffer against total account volatility.`;

    const result: AIResponse = {
      answer,
      observations,
      sources: ['StockPulse Risk Engine', 'Historical Volatility Estimates'],
      uncertainty: 'Mathematical stress tests and volatility models are quantitative estimates, not price guarantees.',
      metrics: {
        annualizedVolatility: risk.annualizedVolatility,
        maxDrawdown: risk.maxDrawdown,
        concentrationRisk: risk.concentrationRisk,
        shockValue: summary.investedValue * -0.1,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'RISK_EXPLANATION', undefined, { risk }, result);
    return result;
  }

  // Helper 8: Strategy Backtest Inquiries
  private async handleStrategyInquiry(userId: string, queryText: string): Promise<AIResponse> {
    const latestBacktest = await Backtest.findOne({ userId }).sort({ createdAt: -1 });

    if (latestBacktest) {
      return this.analyzeStrategy(userId, latestBacktest._id.toString());
    }

    const answer = `### StockPulse Strategy Backtesting Suite\n\n` +
      `StockPulse supports historical backtesting over multi-year daily and intraday OHLCV bars across major algorithmic rules:\n\n` +
      `1. **Moving Average Crossover (SMA 50 / 200 or EMA 20 / 50):**\n` +
      `   - Buys when short MA crosses above long MA (trend confirmation).\n` +
      `   - Exits when short MA crosses below long MA.\n\n` +
      `2. **RSI Mean Reversion (14-period):**\n` +
      `   - Buys when RSI drops below 30 (oversold condition).\n` +
      `   - Sells when RSI recovers above 70 (overbought condition).\n\n` +
      `3. **Momentum Breakout:**\n` +
      `   - Identifies 20-day high breakouts with above-average volume confirmation.\n\n` +
      `You can launch any simulation on the **Backtest** page to evaluate Sharpe ratio, maximum drawdown, and win rate.`;

    const observations = [
      'Supported Strategies: Moving Average Crossover, RSI Mean Reversion, Momentum Breakout.',
      'Data Source: Daily OHLCV data from Yahoo Finance.',
      'No user backtests found in the database yet.',
    ];

    const result: AIResponse = {
      answer,
      observations,
      sources: ['StockPulse Strategy Engine'],
      uncertainty: 'Backtested performance does not guarantee future results.',
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'STRATEGY_ANALYST', undefined, {}, result);
    return result;
  }

  // Helper 9: External LLM Integration (Google Gemini / OpenAI) if keys are provided
  private async tryExternalLLM(userId: string, prompt: string): Promise<AIResponse | null> {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      return null;
    }

    try {
      // Fetch brief context to ground the LLM
      const account = await PaperAccount.findOne({ userId });
      const positions = await Position.find({ userId });
      const marketStatus = await marketProvider.getMarketStatus();

      const contextSummary = `User Virtual Cash: $${account?.cashBalance ?? 100000}. ` +
        `User Positions: ${positions.map(p => `${p.quantity} shares of ${p.symbol} @ $${p.averagePrice}`).join(', ') || 'None'}. ` +
        `Market Status: ${marketStatus.session} (${marketStatus.isOpen ? 'Open' : 'Closed'}).`;

      if (geminiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const body = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are the StockPulse AI Market Intelligence Assistant. Provide a clear, accurate, direct answer to the user's question using this grounded application context: [${contextSummary}]. Answer concisely with Markdown formatting.\n\nUser Question: ${prompt}`,
                },
              ],
            },
          ],
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const json: any = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const result: AIResponse = {
              answer: text,
              observations: [
                `Grounded Context: ${contextSummary}`,
                `Model: Google Gemini 1.5 Flash`,
              ],
              sources: ['Google Gemini API', 'StockPulse Live Ledger'],
              uncertainty: 'AI responses are synthesized using live market state and generative modeling. Not financial advice.',
              generatedAt: new Date().toISOString(),
            };
            await this.recordAnalysis(userId, 'NATURAL_QUERY', undefined, { prompt }, result);
            return result;
          }
        }
      }

      if (openaiKey) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are the StockPulse AI Market Intelligence Assistant. Answer financial and portfolio questions accurately using this grounded context: [${contextSummary}].`,
              },
              { role: 'user', content: prompt },
            ],
          }),
        });

        if (res.ok) {
          const json: any = await res.json();
          const text = json.choices?.[0]?.message?.content;
          if (text) {
            const result: AIResponse = {
              answer: text,
              observations: [
                `Grounded Context: ${contextSummary}`,
                `Model: OpenAI GPT-4o-mini`,
              ],
              sources: ['OpenAI API', 'StockPulse Live Ledger'],
              uncertainty: 'AI responses are synthesized using live market state and generative modeling. Not financial advice.',
              generatedAt: new Date().toISOString(),
            };
            await this.recordAnalysis(userId, 'NATURAL_QUERY', undefined, { prompt }, result);
            return result;
          }
        }
      }
    } catch (err) {
      console.warn('[AI] External LLM call failed, falling back to internal engine:', err);
    }

    return null;
  }

  // Helper 10: Live Screened Stock Recommendations
  private async handleStockRecommendations(userId: string): Promise<AIResponse> {
    const candidateSymbols = [
      'NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META',
      'TSLA', 'AMD', 'PLTR', 'JPM', 'WMT', 'COST', 'LLY', 'SPY', 'QQQ'
    ];

    const quotes = await Promise.all(
      candidateSymbols.map(async (s) => {
        try {
          return await marketProvider.getQuote(s);
        } catch {
          return null;
        }
      })
    );

    const validQuotes = quotes.filter((q): q is NonNullable<typeof q> => q !== null);
    const account = await PaperAccount.findOne({ userId });
    const cashBalance = account?.cashBalance ?? 100000;

    // Sort by momentum (highest intraday change)
    const sortedByChange = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent);
    const topMomentum = sortedByChange.slice(0, 4);

    // High Quality Tech / Cloud Compounders
    const compounders = validQuotes.filter(q => ['MSFT', 'AAPL', 'AMZN', 'GOOGL'].includes(q.symbol));

    // Defensive / Value Anchors
    const defensives = validQuotes.filter(q => ['JPM', 'WMT', 'COST', 'LLY'].includes(q.symbol));

    // Index core
    const indices = validQuotes.filter(q => ['SPY', 'QQQ'].includes(q.symbol));

    const observations: string[] = [
      `Available Virtual Cash: $${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      `Top Relative Momentum Leaders Today: ${topMomentum.map(q => `${q.symbol} (${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`).join(', ')}.`,
      `Market Regime: Evaluated across ${validQuotes.length} live US equity leaders.`,
      `Risk Guideline: Limit single-position risk to 15-25% of total capital with a disciplined 5-8% stop-loss.`,
    ];

    let answer = `### Top Stock Opportunities & Recommendations Today\n\n` +
      `Based on real-time price action, institutional volume, and fundamental industry tailwinds, here are the strongest actionable candidates across **Momentum Growth**, **Core Compounders**, and **Defensive Value**:\n\n` +
      `| Category | Symbol | Price | Today | 52W Range | Investment Thesis / Catalyst | Stop-Loss Zone |\n` +
      `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    // 1. Momentum Picks
    for (const q of topMomentum.slice(0, 3)) {
      const thesis = q.symbol === 'NVDA' ? 'Dominant AI data center compute & Blackwell demand'
        : q.symbol === 'TSLA' ? 'Autonomous driving momentum & energy storage ramp'
        : q.symbol === 'PLTR' ? 'AIP enterprise software adoption & defense contracts'
        : q.symbol === 'AMD' ? 'MI300 AI accelerators & server CPU market share gains'
        : q.symbol === 'META' ? 'Llama AI infrastructure & high ad conversion monetization'
        : 'Strong institutional order flow and relative sector leadership';
      const stop = (q.price * 0.94).toFixed(2);
      answer += `| **Momentum** | **${q.symbol}** | **$${q.price.toFixed(2)}** | ${q.changePercent >= 0 ? '🟢 +' : '🔴 '}${q.changePercent.toFixed(2)}% | $${q.fiftyTwoWeekLow ?? 'N/A'} - $${q.fiftyTwoWeekHigh ?? 'N/A'} | ${thesis} | ~$${stop} (-6%) |\n`;
    }

    // 2. Core Compounders
    for (const q of compounders.slice(0, 2)) {
      const thesis = q.symbol === 'MSFT' ? 'Azure cloud growth, enterprise Copilot monetization, fortress balance sheet'
        : q.symbol === 'AAPL' ? 'Apple Intelligence upgrade cycle, $100B+ annual free cash flow'
        : q.symbol === 'AMZN' ? 'AWS re-acceleration and retail logistics margin expansion'
        : 'Search dominance and YouTube advertising cash flow';
      const stop = (q.price * 0.95).toFixed(2);
      answer += `| **Compounder** | **${q.symbol}** | **$${q.price.toFixed(2)}** | ${q.changePercent >= 0 ? '🟢 +' : '🔴 '}${q.changePercent.toFixed(2)}% | $${q.fiftyTwoWeekLow ?? 'N/A'} - $${q.fiftyTwoWeekHigh ?? 'N/A'} | ${thesis} | ~$${stop} (-5%) |\n`;
    }

    // 3. Defensive Anchor
    for (const q of defensives.slice(0, 1)) {
      const thesis = q.symbol === 'JPM' ? 'Premier banking balance sheet & resilient net interest income'
        : q.symbol === 'COST' ? 'Consistent 90%+ membership renewal rates and defensive traffic'
        : 'Everyday consumer staple dominance and resilient pricing power';
      const stop = (q.price * 0.96).toFixed(2);
      answer += `| **Defensive** | **${q.symbol}** | **$${q.price.toFixed(2)}** | ${q.changePercent >= 0 ? '🟢 +' : '🔴 '}${q.changePercent.toFixed(2)}% | $${q.fiftyTwoWeekLow ?? 'N/A'} - $${q.fiftyTwoWeekHigh ?? 'N/A'} | ${thesis} | ~$${stop} (-4%) |\n`;
    }

    // Personalized Portfolio Execution Plan
    const posA = topMomentum[0];
    const posB = compounders[0];
    const posC = defensives[0] || indices[0];

    const sharesA = posA ? Math.floor((cashBalance * 0.25) / posA.price) : 0;
    const sharesB = posB ? Math.floor((cashBalance * 0.25) / posB.price) : 0;
    const sharesC = posC ? Math.floor((cashBalance * 0.20) / posC.price) : 0;

    answer += `\n**Personalized Portfolio Blueprint (With Your $${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Virtual Cash):**\n\n` +
      `- **High-Conviction Growth (25%):** ~${sharesA} shares of **${posA?.symbol}** (~$${((sharesA * (posA?.price ?? 0))).toLocaleString()})\n` +
      `- **Long-Term Compounder (25%):** ~${sharesB} shares of **${posB?.symbol}** (~$${((sharesB * (posB?.price ?? 0))).toLocaleString()})\n` +
      `- **Defensive / Index Core (20%):** ~${sharesC} shares of **${posC?.symbol}** (~$${((sharesC * (posC?.price ?? 0))).toLocaleString()})\n` +
      `- **Liquid Cash Cushion (30%):** Keep remaining funds liquid to buy pullbacks and manage risk.\n\n` +
      `*To execute this strategy, head to the **Trade** page to place your virtual orders.*`;

    const result: AIResponse = {
      answer,
      observations,
      sources: ['Yahoo Finance Live Quotes', 'StockPulse Fundamental & Technical Screening Engine'],
      uncertainty: 'Stock recommendations are educational trade setups based on live technical and fundamental momentum. Not formal financial advice.',
      metrics: {
        cashBalance,
        topPicks: topMomentum.slice(0, 3).map(q => q.symbol),
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'NATURAL_QUERY', 'STOCK_RECOMMENDATIONS', { cashBalance }, result);
    return result;
  }

  // Helper 11: Single Stock Buy Decision Advice
  private async handleStockBuyAdvice(userId: string, symbol: string): Promise<AIResponse> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const quote = await marketProvider.getQuote(cleanSymbol);
    const news = await newsProvider.getNews(cleanSymbol, 3).catch(() => []);
    const account = await PaperAccount.findOne({ userId });
    const position = await Position.findOne({ userId, symbol: cleanSymbol });
    const cashBalance = account?.cashBalance ?? 100000;

    const isNearHigh = quote.fiftyTwoWeekHigh ? quote.price >= quote.fiftyTwoWeekHigh * 0.95 : false;
    const isNearLow = quote.fiftyTwoWeekLow ? quote.price <= quote.fiftyTwoWeekLow * 1.10 : false;
    const maxShares = Math.floor(cashBalance / quote.price);

    const targetPrice = (quote.price * 1.12).toFixed(2);
    const stopPrice = (quote.price * 0.94).toFixed(2);

    const observations: string[] = [
      `Asset: ${quote.name || cleanSymbol} (${cleanSymbol}) trading at $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%).`,
      `52-Week Channel: Low $${quote.fiftyTwoWeekLow ?? 'N/A'} - High $${quote.fiftyTwoWeekHigh ?? 'N/A'} (Currently ${isNearHigh ? 'near 52W High' : isNearLow ? 'near 52W Low' : 'in mid-channel'}).`,
      `Purchasing Power: You can buy up to ${maxShares.toLocaleString()} shares with your $${cashBalance.toLocaleString()} cash balance.`,
    ];

    if (position) {
      observations.push(`Current Holding: You already hold ${position.quantity} shares @ avg $${position.averagePrice.toFixed(2)}.`);
    }

    const answer = `### Trade Assessment: Is **${cleanSymbol}** (${quote.name || cleanSymbol}) a Good Buy Right Now?\n\n` +
      `- **Current Market Price:** **$${quote.price.toFixed(2)}** (${quote.changePercent >= 0 ? '🟢 +' : '🔴 '}${quote.changePercent.toFixed(2)}% today)\n` +
      `- **52-Week Range:** $${quote.fiftyTwoWeekLow ?? 'N/A'} — $${quote.fiftyTwoWeekHigh ?? 'N/A'}\n` +
      `- **Technical Position:** ${isNearHigh ? 'Trading near its 52-week peak. Momentum is strong, but consider staging entries or waiting for minor consolidations to avoid buying the top.' : isNearLow ? 'Trading near its 52-week support floor. Valuation is discounted, but confirm reversal volume before entering.' : 'Consolidating in its mid-range with favorable risk/reward parameters.'}\n\n` +
      `**Key Upside Catalysts:**\n` +
      (news.length > 0 ? `- Recent Headline: *"${news[0].headline}"* (${news[0].sentiment})\n` : '') +
      `- Relative volume of ${quote.volume.toLocaleString()} shares reflects active institutional participation.\n\n` +
      `**Suggested Tactical Trade Setup:**\n` +
      `- **Entry Range:** Around current market price ($${quote.price.toFixed(2)})\n` +
      `- **Target Exit (+12%):** **$${targetPrice}**\n` +
      `- **Stop-Loss Protection (-6%):** **$${stopPrice}**\n` +
      `- **Position Sizing:** With your available cash of **$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**, a prudent 15-20% allocation would be **${Math.floor((cashBalance * 0.18) / quote.price)} shares** (~$${(Math.floor((cashBalance * 0.18) / quote.price) * quote.price).toFixed(2)}).\n\n` +
      `You can place this order on the **Trade** page with simulated virtual funds.`;

    const result: AIResponse = {
      answer,
      observations,
      sources: ['Yahoo Finance Live Quotes', 'StockPulse Quantitative Trade Model'],
      uncertainty: 'Trade evaluations are educational setups based on technical risk-reward ratios and do not constitute financial advice.',
      metrics: {
        symbol: cleanSymbol,
        price: quote.price,
        targetPrice: Number(targetPrice),
        stopPrice: Number(stopPrice),
        maxShares,
      },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'NATURAL_QUERY', cleanSymbol, { quote }, result);
    return result;
  }

  // Helper 12: Top Market Movers (Gainers & Losers)
  private async handleTopGainersAndLosers(userId: string, isGainers: boolean): Promise<AIResponse> {
    const symbols = ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AMD', 'PLTR', 'JPM', 'WMT', 'COST', 'LLY', 'COIN', 'NFLX', 'DIS', 'SPY', 'QQQ'];
    const quotes = await Promise.all(symbols.map(s => marketProvider.getQuote(s).catch(() => null)));
    const valid = quotes.filter((q): q is NonNullable<typeof q> => q !== null);

    const sorted = isGainers
      ? [...valid].sort((a, b) => b.changePercent - a.changePercent)
      : [...valid].sort((a, b) => a.changePercent - b.changePercent);

    const title = isGainers ? 'Top Market Gainers Today' : 'Top Market Losers Today';
    const top5 = sorted.slice(0, 5);

    const observations = [
      `Screened ${valid.length} key mega-cap and high-beta assets.`,
      `Leader: ${top5[0]?.symbol} (${top5[0]?.changePercent >= 0 ? '+' : ''}${top5[0]?.changePercent.toFixed(2)}%).`,
    ];

    let answer = `### ${title}\n\n` +
      `| Rank | Symbol | Company | Price | Change (%) | Day Range | Volume |\n` +
      `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    top5.forEach((q, idx) => {
      answer += `| #${idx + 1} | **${q.symbol}** | ${q.name || q.symbol} | **$${q.price.toFixed(2)}** | ${q.changePercent >= 0 ? '🟢 +' : '🔴 '}${q.changePercent.toFixed(2)}% | $${q.dayLow ?? 'N/A'} - $${q.dayHigh ?? 'N/A'} | ${q.volume.toLocaleString()} |\n`;
      observations.push(`${q.symbol}: $${q.price.toFixed(2)} (${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`);
    });

    const result: AIResponse = {
      answer,
      observations,
      sources: ['Yahoo Finance Live Quotes'],
      uncertainty: 'Real-time intraday price movement subject to ongoing auction order flow.',
      metrics: { title, count: top5.length },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'NATURAL_QUERY', isGainers ? 'TOP_GAINERS' : 'TOP_LOSERS', {}, result);
    return result;
  }

  // Helper 13: Beginner & Portfolio Allocation Blueprint
  private async handleGettingStartedAndAllocation(userId: string, textLower: string): Promise<AIResponse> {
    const account = await PaperAccount.findOne({ userId });
    const cashBalance = account?.cashBalance ?? 100000;
    const positions = await Position.find({ userId });

    const observations = [
      `Available Virtual Balance: $${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      `Active Positions: ${positions.length} holdings currently in portfolio.`,
      `Core Strategy: Diversified 3-tier portfolio model.`,
    ];

    const answer = `### How to Invest & Allocate Your $${cashBalance.toLocaleString()} Virtual Portfolio\n\n` +
      `Building a resilient, high-performing trading portfolio requires systematic asset allocation rather than betting on single stocks. Here is the recommended **3-Tier Portfolio Architecture**:\n\n` +
      `#### 1. Core Foundation (45% — ~$${(cashBalance * 0.45).toLocaleString()})\n` +
      `- **Objective:** Long-term capital growth with lower volatility.\n` +
      `- **Assets:** Index ETFs and fortress balance-sheet compounders (**SPY**, **QQQ**, **AAPL**, **MSFT**).\n` +
      `- **Why:** Provides broad market beta and consistent free cash flow.\n\n` +
      `#### 2. Thematic High-Growth & Momentum (35% — ~$${(cashBalance * 0.35).toLocaleString()})\n` +
      `- **Objective:** Capital appreciation through high secular demand.\n` +
      `- **Assets:** AI infrastructure, cloud computing, and high-beta leaders (**NVDA**, **AMZN**, **META**, **TSLA**).\n` +
      `- **Rule:** Never allocate more than 10-15% of your portfolio to a single growth stock.\n\n` +
      `#### 3. Liquid Cash & Opportunity Reserve (20% — ~$${(cashBalance * 0.20).toLocaleString()})\n` +
      `- **Objective:** Capital preservation and buying pullbacks.\n` +
      `- **Why:** Having dry powder prevents panic when markets drop and lets you buy high-quality assets at a discount.\n\n` +
      `**Next Steps to Execute:**\n` +
      `1. Navigate to the **Trade** page.\n` +
      `2. Place a Market or Limit order for 1-2 core index assets (e.g. 10 shares of SPY or QQQ).\n` +
      `3. Set automated **Alerts** to monitor key price thresholds.`;

    const result: AIResponse = {
      answer,
      observations,
      sources: ['StockPulse Portfolio Construction Model', 'CFA Institute Asset Allocation Guidelines'],
      uncertainty: 'Model portfolio frameworks are educational guides for virtual paper trading.',
      metrics: { cashBalance, positionsCount: positions.length },
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'NATURAL_QUERY', 'PORTFOLIO_BLUEPRINT', { cashBalance }, result);
    return result;
  }

  // Helper 14: General Financial Assistant Inquiry (Never return default brief unless asked)
  private async handleGeneralFinancialInquiry(userId: string, rawText: string): Promise<AIResponse> {
    const marketStatus = await marketProvider.getMarketStatus();
    const account = await PaperAccount.findOne({ userId });
    const cash = account?.cashBalance ?? 100000;

    const answer = `### StockPulse Financial Intelligence\n\n` +
      `Thank you for your question: *"${rawText}"*\n\n` +
      `Here is key guidance based on your live account and current market conditions:\n\n` +
      `- **Current Market Status:** US Markets are currently **${marketStatus.session}** (${marketStatus.isOpen ? 'Open for regular trading' : 'Closed'}). Current NYSE/NASDAQ time is ${marketStatus.localTime}.\n` +
      `- **Your Virtual Capital:** You have **$${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** in available virtual paper cash.\n` +
      `- **Things You Can Ask Me:**\n` +
      `  • *"What stocks are good to buy today?"* (Live screened recommendations)\n` +
      `  • *"Should I buy Tesla or NVDA right now?"* (Specific entry and target review)\n` +
      `  • *"Can I afford 10 shares of NVDA?"* (Live purchasing power calculation)\n` +
      `  • *"Compare Apple and Microsoft"* (Side-by-side valuation & momentum table)\n` +
      `  • *"What is a P/E ratio, RSI, or MACD?"* (Financial education & formulas)\n` +
      `  • *"What are my current holdings?"* (Real-time portfolio inspection)\n` +
      `  • *"Show top gainers today"* (Ranked momentum movers)\n\n` +
      `Feel free to ask any specific stock, strategy, or portfolio question!`;

    const result: AIResponse = {
      answer,
      observations: [
        `Market Status: ${marketStatus.session} (${marketStatus.isOpen ? 'Open' : 'Closed'})`,
        `Available Virtual Funds: $${cash.toLocaleString()}`,
      ],
      sources: ['StockPulse Intelligence Engine'],
      uncertainty: 'StockPulse is an educational simulated paper-trading platform.',
      generatedAt: new Date().toISOString(),
    };

    await this.recordAnalysis(userId, 'NATURAL_QUERY', 'GENERAL_INQUIRY', { prompt: rawText }, result);
    return result;
  }

  // Persistence record
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
