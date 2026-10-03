import { IMarketDataProvider, INewsProvider } from './interfaces.js';
import { YahooMarketDataProvider } from './yahooMarketDataProvider.js';

class ProviderManager {
  private marketProvider: IMarketDataProvider;
  private newsProvider: INewsProvider;

  constructor() {
    const yahoo = new YahooMarketDataProvider();
    this.marketProvider = yahoo;
    this.newsProvider = yahoo;
  }

  getMarketProvider(): IMarketDataProvider {
    return this.marketProvider;
  }

  getNewsProvider(): INewsProvider {
    return this.newsProvider;
  }
}

export const providerManager = new ProviderManager();
export const marketProvider = providerManager.getMarketProvider();
export const newsProvider = providerManager.getNewsProvider();
export * from './interfaces.js';
