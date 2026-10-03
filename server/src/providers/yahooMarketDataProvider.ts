import {
  IMarketDataProvider,
  INewsProvider,
  Quote,
  HistoricalBar,
  MarketStatus,
  SymbolSearchResult,
  NewsItem,
  FreshnessType,
} from './interfaces.js';

export class YahooMarketDataProvider implements IMarketDataProvider, INewsProvider {
  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

  private cache = new Map<string, { data: any; expiry: number }>();

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any, ttlSeconds: number) {
    this.cache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
  }

  async getQuote(symbol: string): Promise<Quote> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const cacheKey = `quote_${cleanSymbol}`;
    const cached = this.getFromCache<Quote>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanSymbol)}?interval=1d&range=1d`;
      const res = await fetch(url, {
        headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Market provider returned HTTP ${res.status} for ${cleanSymbol}`);
      }

      const json: any = await res.json();
      const result = json.chart?.result?.[0];
      if (!result) {
        throw new Error(`No market data found for symbol "${cleanSymbol}"`);
      }

      const meta = result.meta;
      const currentPrice = meta.regularMarketPrice ?? meta.previousClose ?? 0;
      const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? currentPrice;
      const change = currentPrice - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

      // Determine freshness
      let freshness: FreshnessType = 'DELAYED';
      const nowSec = Math.floor(Date.now() / 1000);
      const marketTime = meta.regularMarketTime || nowSec;
      const isRecent = Math.abs(nowSec - marketTime) < 300; // within 5 mins

      const tradingPeriod = meta.currentTradingPeriod?.regular;
      if (tradingPeriod && nowSec >= tradingPeriod.start && nowSec <= tradingPeriod.end) {
        freshness = isRecent ? 'LIVE' : 'DELAYED';
      } else {
        freshness = 'MARKET_CLOSED';
      }

      const quote: Quote = {
        symbol: cleanSymbol,
        name: meta.longName || meta.shortName || cleanSymbol,
        price: Number(currentPrice.toFixed(2)),
        previousClose: Number(prevClose.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: meta.regularMarketVolume || 0,
        dayHigh: meta.regularMarketDayHigh ? Number(meta.regularMarketDayHigh.toFixed(2)) : undefined,
        dayLow: meta.regularMarketDayLow ? Number(meta.regularMarketDayLow.toFixed(2)) : undefined,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ? Number(meta.fiftyTwoWeekHigh.toFixed(2)) : undefined,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow ? Number(meta.fiftyTwoWeekLow.toFixed(2)) : undefined,
        currency: meta.currency || 'USD',
        exchange: meta.exchangeName || 'NASDAQ',
        timestamp: new Date((meta.regularMarketTime || nowSec) * 1000).toISOString(),
        source: 'Yahoo Finance (Direct Stream)',
        freshness,
      };

      this.setCache(cacheKey, quote, 10); // 10s TTL
      return quote;
    } catch (err: any) {
      // Check if stale cached quote exists
      const stale = this.cache.get(cacheKey)?.data as Quote;
      if (stale) {
        return {
          ...stale,
          freshness: 'UNAVAILABLE',
          source: `${stale.source} (Stale Cached)`,
        };
      }
      throw err;
    }
  }

  async getHistoricalData(
    symbol: string,
    range: string = '1mo',
    interval: string = '1d'
  ): Promise<HistoricalBar[]> {
    const cleanSymbol = symbol.trim().toUpperCase();
    const cacheKey = `hist_${cleanSymbol}_${range}_${interval}`;
    const cached = this.getFromCache<HistoricalBar[]>(cacheKey);
    if (cached) return cached;

    // Validate ranges
    const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max'];
    const selectedRange = validRanges.includes(range) ? range : '1mo';

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanSymbol)}?interval=${interval}&range=${selectedRange}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch history for ${cleanSymbol}: HTTP ${res.status}`);
    }

    const json: any = await res.json();
    const result = json.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      return [];
    }

    const timestamps: number[] = result.timestamp;
    const quotes = result.indicators.quote[0];
    const bars: HistoricalBar[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const open = quotes.open?.[i];
      const high = quotes.high?.[i];
      const low = quotes.low?.[i];
      const close = quotes.close?.[i];
      const volume = quotes.volume?.[i] || 0;

      // Skip null/undefined bars
      if (open != null && high != null && low != null && close != null) {
        bars.push({
          timestamp: timestamps[i] * 1000,
          date: new Date(timestamps[i] * 1000).toISOString(),
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Math.round(volume),
        });
      }
    }

    this.setCache(cacheKey, bars, 60); // 1 min TTL
    return bars;
  }

  async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
    if (!query || query.trim().length === 0) return [];
    const cleanQuery = query.trim();
    const cacheKey = `search_${cleanQuery.toLowerCase()}`;
    const cached = this.getFromCache<SymbolSearchResult[]>(cacheKey);
    if (cached) return cached;

    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanQuery)}&quotesCount=10&newsCount=0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
    });

    if (!res.ok) {
      return [];
    }

    const json: any = await res.json();
    const quotes = json.quotes || [];

    const results: SymbolSearchResult[] = quotes
      .filter((q: any) => q.symbol && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF'))
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange || 'US',
        type: q.typeDisp || q.quoteType || 'Equity',
        sector: q.sector,
        industry: q.industry,
      }));

    this.setCache(cacheKey, results, 300); // 5 min TTL
    return results;
  }

  async getMarketStatus(): Promise<MarketStatus> {
    const now = new Date();
    // Wall Street timezone
    const nyTimeString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const nyDate = new Date(nyTimeString);
    const day = nyDate.getDay(); // 0 is Sun, 6 is Sat
    const hour = nyDate.getHours();
    const minute = nyDate.getMinutes();
    const timeVal = hour * 60 + minute;

    const isWeekend = day === 0 || day === 6;
    let session: 'REGULAR' | 'PRE' | 'POST' | 'CLOSED' = 'CLOSED';
    let isOpen = false;

    if (!isWeekend) {
      if (timeVal >= 4 * 60 && timeVal < 9 * 60 + 30) {
        session = 'PRE';
      } else if (timeVal >= 9 * 60 + 30 && timeVal < 16 * 60) {
        session = 'REGULAR';
        isOpen = true;
      } else if (timeVal >= 16 * 60 && timeVal < 20 * 60) {
        session = 'POST';
      }
    }

    return {
      isOpen,
      session,
      exchange: 'US Markets (NYSE / NASDAQ)',
      timezone: 'America/New_York (EDT/EST)',
      localTime: nyTimeString,
      nextOpen: !isOpen ? '09:30 AM EDT' : undefined,
      nextClose: isOpen ? '04:00 PM EDT' : undefined,
    };
  }

  async getNews(symbol?: string, limit: number = 10): Promise<NewsItem[]> {
    const target = symbol ? symbol.trim().toUpperCase() : 'stock market';
    const cacheKey = `news_${target}_${limit}`;
    const cached = this.getFromCache<NewsItem[]>(cacheKey);
    if (cached) return cached;

    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(target)}&newsCount=${limit}&quotesCount=0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
    });

    if (!res.ok) {
      return [];
    }

    const json: any = await res.json();
    const newsArray = json.news || [];

    const items: NewsItem[] = newsArray.map((item: any) => {
      // Analyze headline sentiment based on financial keywords
      const title = item.title || '';
      const { sentiment, score } = analyzeTextSentiment(title);

      return {
        id: item.uuid || `${item.providerPublishTime}_${Math.random()}`,
        symbol: symbol ? symbol.toUpperCase() : item.relatedTickers?.[0],
        headline: title,
        source: item.publisher || 'Financial Wire',
        url: item.link || '',
        publishedAt: new Date((item.providerPublishTime || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
        sentiment,
        sentimentScore: score,
        relatedSymbols: item.relatedTickers || [],
      };
    });

    this.setCache(cacheKey, items, 120); // 2 min TTL
    return items;
  }
}

// Deterministic financial sentiment analysis based on established financial lexicons (Loughran-McDonald adaptation)
export function analyzeTextSentiment(text: string): { sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH'; score: number } {
  const lower = text.toLowerCase();

  const bullishWords = [
    'surge', 'surges', 'soar', 'soars', 'jump', 'jumps', 'gain', 'gains', 'rally', 'rallies',
    'outperform', 'beat', 'beats', 'record', 'high', 'profit', 'growth', 'bull', 'bullish',
    'upgrade', 'upgraded', 'boost', 'boosts', 'breakout', 'strong', 'positive', 'dividend',
    'expansion', 'revenue beat', 'acquisition', 'optimism', 'climbs'
  ];

  const bearishWords = [
    'drop', 'drops', 'fall', 'falls', 'plunge', 'plunges', 'slump', 'slumps', 'decline', 'declines',
    'miss', 'misses', 'loss', 'losses', 'bear', 'bearish', 'downgrade', 'downgraded', 'cut', 'cuts',
    'warn', 'warning', 'weak', 'weakness', 'negative', 'investigation', 'lawsuit', 'selloff',
    'inflation', 'recession', 'debt', 'deficit', 'antitrust', 'crash'
  ];

  let bullCount = 0;
  let bearCount = 0;

  for (const word of bullishWords) {
    if (lower.includes(word)) bullCount++;
  }
  for (const word of bearishWords) {
    if (lower.includes(word)) bearCount++;
  }

  const total = bullCount + bearCount;
  if (total === 0) {
    return { sentiment: 'NEUTRAL', score: 0 };
  }

  const score = Number(((bullCount - bearCount) / total).toFixed(2));
  if (score > 0.15) {
    return { sentiment: 'BULLISH', score };
  } else if (score < -0.15) {
    return { sentiment: 'BEARISH', score };
  } else {
    return { sentiment: 'NEUTRAL', score };
  }
}
