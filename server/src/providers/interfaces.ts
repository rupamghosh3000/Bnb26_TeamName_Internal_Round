export type FreshnessType = 'LIVE' | 'DELAYED' | 'MARKET_CLOSED' | 'UNAVAILABLE';

export interface Quote {
  symbol: string;
  name?: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  currency: string;
  exchange: string;
  timestamp: string;
  source: string;
  freshness: FreshnessType;
}

export interface HistoricalBar {
  timestamp: number; // Unix epoch ms
  date: string; // ISO date string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketStatus {
  isOpen: boolean;
  session: 'REGULAR' | 'PRE' | 'POST' | 'CLOSED';
  exchange: string;
  timezone: string;
  localTime: string;
  nextOpen?: string;
  nextClose?: string;
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  sector?: string;
  industry?: string;
}

export interface NewsItem {
  id: string;
  symbol?: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  sentimentScore: number; // -1 to 1
  relatedSymbols?: string[];
}

export interface IMarketDataProvider {
  getQuote(symbol: string): Promise<Quote>;
  getHistoricalData(symbol: string, range?: string, interval?: string): Promise<HistoricalBar[]>;
  searchSymbols(query: string): Promise<SymbolSearchResult[]>;
  getMarketStatus(): Promise<MarketStatus>;
}

export interface INewsProvider {
  getNews(symbol?: string, limit?: number): Promise<NewsItem[]>;
}
