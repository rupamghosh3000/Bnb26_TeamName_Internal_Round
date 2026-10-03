import { Watchlist, IWatchlist } from '../models/Watchlist.js';
import { marketProvider, newsProvider } from '../providers/index.js';

export class WatchlistService {
  async getWatchlists(userId: string): Promise<IWatchlist[]> {
    let watchlists = await Watchlist.find({ userId });
    if (watchlists.length === 0) {
      const defaultWatchlist = new Watchlist({
        userId,
        name: 'Primary Watchlist',
        symbols: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'],
      });
      await defaultWatchlist.save();
      watchlists = [defaultWatchlist];
    }
    return watchlists;
  }

  async getWatchlistWithQuotes(userId: string, watchlistId?: string) {
    let watchlist: IWatchlist | null;
    if (watchlistId) {
      watchlist = await Watchlist.findOne({ _id: watchlistId, userId });
    } else {
      watchlist = await Watchlist.findOne({ userId });
    }

    if (!watchlist) {
      const all = await this.getWatchlists(userId);
      watchlist = all[0];
    }

    // Fetch live quotes for watchlist symbols
    const items = await Promise.all(
      watchlist.symbols.map(async (symbol) => {
        try {
          const quote = await marketProvider.getQuote(symbol);
          return {
            symbol: quote.symbol,
            name: quote.name,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            dayHigh: quote.dayHigh,
            dayLow: quote.dayLow,
            exchange: quote.exchange,
            freshness: quote.freshness,
            timestamp: quote.timestamp,
          };
        } catch {
          return {
            symbol,
            name: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
            freshness: 'UNAVAILABLE' as const,
            timestamp: new Date().toISOString(),
          };
        }
      })
    );

    return {
      watchlist,
      items,
    };
  }

  async addSymbol(userId: string, watchlistId: string, symbol: string): Promise<IWatchlist> {
    const clean = symbol.trim().toUpperCase();
    const watchlist = await Watchlist.findOne({ _id: watchlistId, userId });
    if (!watchlist) {
      throw new Error('Watchlist not found.');
    }

    if (!watchlist.symbols.includes(clean)) {
      watchlist.symbols.push(clean);
      await watchlist.save();
    }
    return watchlist;
  }

  async removeSymbol(userId: string, watchlistId: string, symbol: string): Promise<IWatchlist> {
    const clean = symbol.trim().toUpperCase();
    const watchlist = await Watchlist.findOne({ _id: watchlistId, userId });
    if (!watchlist) {
      throw new Error('Watchlist not found.');
    }

    watchlist.symbols = watchlist.symbols.filter((s) => s !== clean);
    await watchlist.save();
    return watchlist;
  }

  async createWatchlist(userId: string, name: string): Promise<IWatchlist> {
    const watchlist = new Watchlist({
      userId,
      name: name || 'New Watchlist',
      symbols: [],
    });
    await watchlist.save();
    return watchlist;
  }

  async deleteWatchlist(userId: string, watchlistId: string): Promise<boolean> {
    const res = await Watchlist.deleteOne({ _id: watchlistId, userId });
    return res.deletedCount > 0;
  }
}

export const watchlistService = new WatchlistService();
