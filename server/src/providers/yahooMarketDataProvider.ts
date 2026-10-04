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

  // Recognized top crypto tickers
  private cryptoMap: Record<string, string> = {
    BTC: 'BTC-USD',
    BITCOIN: 'BTC-USD',
    ETH: 'ETH-USD',
    ETHEREUM: 'ETH-USD',
    SOL: 'SOL-USD',
    SOLANA: 'SOL-USD',
    BNB: 'BNB-USD',
    XRP: 'XRP-USD',
    RIPPLE: 'XRP-USD',
    DOGE: 'DOGE-USD',
    DOGECOIN: 'DOGE-USD',
    ADA: 'ADA-USD',
    CARDANO: 'ADA-USD',
    AVAX: 'AVAX-USD',
    AVALANCHE: 'AVAX-USD',
    LINK: 'LINK-USD',
    CHAINLINK: 'LINK-USD',
    POL: 'POL-USD',
    MATIC: 'POL-USD',
    POLYGON: 'POL-USD',
    SHIB: 'SHIB-USD',
    NEAR: 'NEAR-USD',
    DOT: 'DOT-USD',
    POLKADOT: 'DOT-USD',
    LTC: 'LTC-USD',
    LITECOIN: 'LTC-USD',
    UNI: 'UNI-USD',
    UNISWAP: 'UNI-USD',
    BCH: 'BCH-USD',
    XLM: 'XLM-USD',
    SUI: 'SUI-USD',
    APT: 'APT-USD',
    PEPE: 'PEPE-USD',
    BONK: 'BONK-USD',
    WIF: 'WIF-USD',
    RENDER: 'RENDER-USD',
    RNDR: 'RENDER-USD',
    FET: 'FET-USD',
    TAO: 'TAO-USD',
    INJ: 'INJ-USD',
    KAS: 'KAS-USD',
    ARB: 'ARB-USD',
    OP: 'OP-USD',
    TIA: 'TIA-USD',
    SEI: 'SEI-USD',
    AAVE: 'AAVE-USD',
    MKR: 'MKR-USD',
    ATOM: 'ATOM-USD',
    FIL: 'FIL-USD',
    TON: 'TON-USD',
    TRX: 'TRX-USD',
    JUP: 'JUP-USD',
  };

  private normalizeSymbol(symbol: string): string {
    const raw = symbol.trim().toUpperCase();
    if (this.cryptoMap[raw]) {
      return this.cryptoMap[raw];
    }
    return raw;
  }

  private isCryptoSymbol(symbol: string): boolean {
    const s = symbol.toUpperCase();
    return s.endsWith('-USD') || s.endsWith('-USDT') || !!this.cryptoMap[s];
  }

  async getQuote(symbol: string): Promise<Quote> {
    let cleanSymbol = this.normalizeSymbol(symbol);
    const cacheKey = `quote_${cleanSymbol}`;
    const cached = this.getFromCache<Quote>(cacheKey);
    if (cached) return cached;

    try {
      return await this.fetchDirectQuote(cleanSymbol);
    } catch (primaryErr: any) {
      // If symbol does not have an exchange suffix or -USD, try appending -USD for crypto auto-discovery
      if (!cleanSymbol.includes('-') && !cleanSymbol.includes('.')) {
        try {
          const cryptoQuote = await this.fetchDirectQuote(`${cleanSymbol}-USD`);
          this.setCache(cacheKey, cryptoQuote, 10);
          return cryptoQuote;
        } catch {
          // Keep original error
        }
      }

      // Check if stale cached quote exists
      const stale = this.cache.get(cacheKey)?.data as Quote;
      if (stale) {
        return {
          ...stale,
          freshness: 'UNAVAILABLE',
          source: `${stale.source} (Stale Cached)`,
        };
      }
      throw primaryErr;
    }
  }

  private async fetchDirectQuote(cleanSymbol: string): Promise<Quote> {
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

    const isCrypto = meta.instrumentType === 'CRYPTOCURRENCY' || this.isCryptoSymbol(cleanSymbol);

    // Determine freshness
    let freshness: FreshnessType = 'DELAYED';
    const nowSec = Math.floor(Date.now() / 1000);
    const marketTime = meta.regularMarketTime || nowSec;
    const isRecent = Math.abs(nowSec - marketTime) < 300; // within 5 mins

    if (isCrypto) {
      // Crypto trades 24/7/365
      freshness = isRecent ? 'LIVE' : 'DELAYED';
    } else {
      const tradingPeriod = meta.currentTradingPeriod?.regular;
      if (tradingPeriod && nowSec >= tradingPeriod.start && nowSec <= tradingPeriod.end) {
        freshness = isRecent ? 'LIVE' : 'DELAYED';
      } else {
        freshness = 'MARKET_CLOSED';
      }
    }

    // Format decimals appropriately for micro-value crypto coins
    const decimals = currentPrice < 1 && currentPrice > 0 ? (currentPrice < 0.01 ? 6 : 4) : 2;

    const quote: Quote = {
      symbol: cleanSymbol,
      name: meta.longName || meta.shortName || (isCrypto ? cleanSymbol.replace('-USD', '') : cleanSymbol),
      price: Number(currentPrice.toFixed(decimals)),
      previousClose: Number(prevClose.toFixed(decimals)),
      change: Number(change.toFixed(decimals)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: meta.regularMarketVolume || 0,
      dayHigh: meta.regularMarketDayHigh ? Number(meta.regularMarketDayHigh.toFixed(decimals)) : undefined,
      dayLow: meta.regularMarketDayLow ? Number(meta.regularMarketDayLow.toFixed(decimals)) : undefined,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ? Number(meta.fiftyTwoWeekHigh.toFixed(decimals)) : undefined,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ? Number(meta.fiftyTwoWeekLow.toFixed(decimals)) : undefined,
      currency: meta.currency || (isCrypto ? 'USD' : 'USD'),
      exchange: isCrypto ? 'Crypto (24/7)' : (meta.exchangeName || 'NASDAQ'),
      timestamp: new Date((meta.regularMarketTime || nowSec) * 1000).toISOString(),
      source: isCrypto ? 'Yahoo Crypto Stream (24/7)' : 'Yahoo Finance (Direct Stream)',
      freshness,
    };

    this.setCache(`quote_${cleanSymbol}`, quote, 10); // 10s TTL
    return quote;
  }

  async getHistoricalData(
    symbol: string,
    range: string = '1mo',
    interval: string = '1d'
  ): Promise<HistoricalBar[]> {
    const cleanSymbol = this.normalizeSymbol(symbol);
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
        const decimals = close < 1 && close > 0 ? (close < 0.01 ? 6 : 4) : 2;
        bars.push({
          timestamp: timestamps[i] * 1000,
          date: new Date(timestamps[i] * 1000).toISOString(),
          open: Number(open.toFixed(decimals)),
          high: Number(high.toFixed(decimals)),
          low: Number(low.toFixed(decimals)),
          close: Number(close.toFixed(decimals)),
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

    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanQuery)}&quotesCount=15&newsCount=0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
    });

    if (!res.ok) {
      return [];
    }

    const json: any = await res.json();
    const quotes = json.quotes || [];

    const results: SymbolSearchResult[] = quotes
      .filter(
        (q: any) =>
          q.symbol &&
          (q.quoteType === 'EQUITY' ||
            q.quoteType === 'ETF' ||
            q.quoteType === 'CRYPTOCURRENCY' ||
            q.quoteType === 'CURRENCY')
      )
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.quoteType === 'CRYPTOCURRENCY' ? 'Crypto (24/7)' : (q.exchDisp || q.exchange || 'US'),
        type: q.quoteType === 'CRYPTOCURRENCY' ? 'Cryptocurrency' : (q.typeDisp || q.quoteType || 'Equity'),
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
      exchange: 'US Markets (NYSE / NASDAQ) & Crypto 24/7',
      timezone: 'America/New_York (EDT/EST)',
      localTime: nyTimeString,
      nextOpen: !isOpen ? '09:30 AM EDT' : undefined,
      nextClose: isOpen ? '04:00 PM EDT' : undefined,
    };
  }

  private async fetchYahooNewsRaw(query: string, limit: number, associatedSymbol?: string): Promise<NewsItem[]> {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=${limit}&quotesCount=0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
    });

    if (!res.ok) {
      return [];
    }

    const json: any = await res.json();
    const newsArray = json.news || [];

    return newsArray.map((item: any) => {
      const title = item.title || '';
      const { sentiment, score } = analyzeTextSentiment(title);

      return {
        id: item.uuid || `${item.providerPublishTime}_${Math.random()}`,
        symbol: associatedSymbol || item.relatedTickers?.[0] || 'GLOBAL',
        headline: title,
        source: item.publisher || 'Financial Wire',
        url: item.link || '',
        publishedAt: new Date((item.providerPublishTime || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
        sentiment,
        sentimentScore: score,
        relatedSymbols: item.relatedTickers || [],
      };
    });
  }

  async getNews(symbol?: string, limit: number = 10): Promise<NewsItem[]> {
    const rawSymbol = symbol ? symbol.trim().toUpperCase() : '';
    const cacheKey = `news_${rawSymbol || 'market'}_${limit}`;
    const cached = this.getFromCache<NewsItem[]>(cacheKey);
    if (cached) return cached;

    if (!rawSymbol) {
      const items = await this.fetchYahooNewsRaw('stock market finance', limit);
      this.setCache(cacheKey, items, 120);
      return items;
    }

    const isIndian = rawSymbol.endsWith('.NS') || rawSymbol.endsWith('.BO');
    const isCrypto = this.isCryptoSymbol(rawSymbol);

    let queryTarget = rawSymbol;
    if (isIndian) {
      queryTarget = rawSymbol.replace(/\.(NS|BO)$/i, '');
    } else if (isCrypto) {
      queryTarget = rawSymbol.replace('-USD', '') + ' crypto';
    }

    let items = await this.fetchYahooNewsRaw(queryTarget, limit, rawSymbol);

    // Fallback 1: If 0 items for Indian stock, try quote company name or Indian market wire
    if (items.length === 0 && isIndian) {
      try {
        const quote = await this.getQuote(rawSymbol);
        if (quote?.name && quote.name !== rawSymbol) {
          items = await this.fetchYahooNewsRaw(quote.name, limit, rawSymbol);
        }
      } catch {}

      if (items.length === 0) {
        items = await this.fetchYahooNewsRaw(`${queryTarget} India stock market`, limit, rawSymbol);
      }
    }

    // Fallback 2: If 0 items for crypto, try broader crypto search
    if (items.length === 0 && isCrypto) {
      items = await this.fetchYahooNewsRaw('cryptocurrency Bitcoin market', limit, rawSymbol);
    }

    // Fallback 3: General financial market news fallback
    if (items.length === 0) {
      items = await this.fetchYahooNewsRaw('stock market', limit, rawSymbol);
    }

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
