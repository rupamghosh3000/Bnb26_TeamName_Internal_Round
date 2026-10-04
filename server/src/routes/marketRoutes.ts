import { Router } from 'express';
import { marketProvider, newsProvider } from '../providers/index.js';

const router = Router();

// Search symbols
router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.json([]);
    }
    const results = await marketProvider.searchSymbols(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Market status
router.get('/status', async (req, res, next) => {
  try {
    const status = await marketProvider.getMarketStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// Market Pulse Overview (Major universe stocks + market status)
router.get('/overview', async (req, res, next) => {
  try {
    const symbols = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META', 'SPY'];
    const quotes = await Promise.all(
      symbols.map(async (s) => {
        try {
          return await marketProvider.getQuote(s);
        } catch {
          return null;
        }
      })
    );
    const validQuotes = quotes.filter((q): q is NonNullable<typeof q> => q !== null);
    const status = await marketProvider.getMarketStatus();
    const news = await newsProvider.getNews(undefined, 8);

    // Calculate sentiment summary
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;
    news.forEach((n) => {
      if (n.sentiment === 'BULLISH') bullish++;
      else if (n.sentiment === 'BEARISH') bearish++;
      else neutral++;
    });

    res.json({
      status,
      quotes: validQuotes,
      news,
      sentimentDistribution: {
        bullish,
        bearish,
        neutral,
        total: news.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Top cryptocurrency universe definition with metadata
const CRYPTO_UNIVERSE = [
  { symbol: 'BTC-USD', name: 'Bitcoin', category: 'Layer 1', icon: '₿' },
  { symbol: 'ETH-USD', name: 'Ethereum', category: 'Layer 1', icon: 'Ξ' },
  { symbol: 'SOL-USD', name: 'Solana', category: 'Layer 1', icon: '◎' },
  { symbol: 'BNB-USD', name: 'BNB', category: 'Layer 1', icon: '🔶' },
  { symbol: 'XRP-USD', name: 'XRP', category: 'Payment', icon: '✕' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', category: 'Meme', icon: 'Ð' },
  { symbol: 'ADA-USD', name: 'Cardano', category: 'Layer 1', icon: '₳' },
  { symbol: 'AVAX-USD', name: 'Avalanche', category: 'Layer 1', icon: '🔺' },
  { symbol: 'LINK-USD', name: 'Chainlink', category: 'DeFi', icon: '⬡' },
  { symbol: 'POL-USD', name: 'Polygon', category: 'Layer 2', icon: '⬢' },
  { symbol: 'SHIB-USD', name: 'Shiba Inu', category: 'Meme', icon: '🐕' },
  { symbol: 'NEAR-USD', name: 'Near Protocol', category: 'Layer 1', icon: 'Ⓝ' },
  { symbol: 'SUI-USD', name: 'Sui', category: 'Layer 1', icon: '💧' },
  { symbol: 'APT-USD', name: 'Aptos', category: 'Layer 1', icon: '⚡' },
  { symbol: 'TON-USD', name: 'Toncoin', category: 'Layer 1', icon: '💎' },
  { symbol: 'TRX-USD', name: 'TRON', category: 'Layer 1', icon: '🔴' },
  { symbol: 'DOT-USD', name: 'Polkadot', category: 'Layer 1', icon: '●' },
  { symbol: 'UNI-USD', name: 'Uniswap', category: 'DeFi', icon: '🦄' },
  { symbol: 'AAVE-USD', name: 'Aave', category: 'DeFi', icon: '👻' },
  { symbol: 'PEPE-USD', name: 'Pepe', category: 'Meme', icon: '🐸' },
  { symbol: 'BONK-USD', name: 'Bonk', category: 'Meme', icon: '🦴' },
  { symbol: 'WIF-USD', name: 'dogwifhat', category: 'Meme', icon: '🧢' },
  { symbol: 'RENDER-USD', name: 'Render', category: 'AI & Data', icon: '🎨' },
  { symbol: 'FET-USD', name: 'Artificial Superintelligence', category: 'AI & Data', icon: '🤖' },
  { symbol: 'TAO-USD', name: 'Bittensor', category: 'AI & Data', icon: '🧠' },
  { symbol: 'INJ-USD', name: 'Injective', category: 'DeFi', icon: '💉' },
  { symbol: 'ARB-USD', name: 'Arbitrum', category: 'Layer 2', icon: '🔵' },
  { symbol: 'OP-USD', name: 'Optimism', category: 'Layer 2', icon: '🔴' },
  { symbol: 'TIA-USD', name: 'Celestia', category: 'Layer 1', icon: '🌌' },
  { symbol: 'SEI-USD', name: 'Sei', category: 'Layer 1', icon: '🌊' },
  { symbol: 'LTC-USD', name: 'Litecoin', category: 'Payment', icon: 'Ł' },
  { symbol: 'BCH-USD', name: 'Bitcoin Cash', category: 'Payment', icon: 'Ƀ' },
  { symbol: 'XLM-USD', name: 'Stellar', category: 'Payment', icon: '🚀' },
];

// Cryptocurrency Market Overview & Quotes
router.get('/crypto', async (req, res, next) => {
  try {
    const category = req.query.category as string;
    const targetUniverse = category && category !== 'All'
      ? CRYPTO_UNIVERSE.filter((c) => c.category.toLowerCase() === category.toLowerCase())
      : CRYPTO_UNIVERSE;

    const quotesWithMeta = await Promise.all(
      targetUniverse.map(async (coin) => {
        try {
          const q = await marketProvider.getQuote(coin.symbol);
          return {
            ...q,
            name: coin.name || q.name,
            category: coin.category,
            icon: coin.icon,
            baseTicker: coin.symbol.replace('-USD', ''),
          };
        } catch {
          return null;
        }
      })
    );

    const validQuotes = quotesWithMeta.filter((q): q is NonNullable<typeof q> => q !== null);
    res.json(validQuotes);
  } catch (err) {
    next(err);
  }
});

// Crypto Market Global Overview & Live Intel
router.get('/crypto/overview', async (req, res, next) => {
  try {
    const [quotes, news, forex] = await Promise.all([
      Promise.all(
        CRYPTO_UNIVERSE.map(async (coin) => {
          try {
            const q = await marketProvider.getQuote(coin.symbol);
            return {
              ...q,
              name: coin.name || q.name,
              category: coin.category,
              icon: coin.icon,
              baseTicker: coin.symbol.replace('-USD', ''),
            };
          } catch {
            return null;
          }
        })
      ),
      newsProvider.getNews('crypto', 8),
      marketProvider.getQuote('USDINR=X').catch(() => null),
    ]);

    const validQuotes = quotes.filter((q): q is NonNullable<typeof q> => q !== null);

    // Compute top gainers & losers
    const sorted = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent);
    const topGainers = sorted.slice(0, 4);
    const topLosers = [...sorted].reverse().slice(0, 4);

    // Compute aggregate 24h volume
    const totalVolumeUSD = validQuotes.reduce((acc, q) => acc + (q.volume || 0), 0);

    // Approximate BTC & ETH dominance from major universe market share
    const btcQuote = validQuotes.find((q) => q.symbol === 'BTC-USD');
    const ethQuote = validQuotes.find((q) => q.symbol === 'ETH-USD');
    const solQuote = validQuotes.find((q) => q.symbol === 'SOL-USD');

    // Calculate sentiment from news
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;
    news.forEach((n) => {
      if (n.sentiment === 'BULLISH') bullish++;
      else if (n.sentiment === 'BEARISH') bearish++;
      else neutral++;
    });

    const sentimentScore =
      news.length > 0
        ? Math.round(
            ((bullish * 100 + neutral * 50) / (news.length * 100)) * 100
          )
        : 65;

    let sentimentLabel = 'Neutral';
    if (sentimentScore >= 75) sentimentLabel = 'Extreme Greed';
    else if (sentimentScore >= 60) sentimentLabel = 'Greed';
    else if (sentimentScore <= 25) sentimentLabel = 'Extreme Fear';
    else if (sentimentScore <= 40) sentimentLabel = 'Fear';

    res.json({
      status: {
        isOpen: true,
        session: '24/7 LIVE',
        exchange: 'Global Decentralized Crypto Markets (24/7/365)',
        timezone: 'UTC',
      },
      globalMetrics: {
        sentimentScore,
        sentimentLabel,
        totalTracked: validQuotes.length,
        btcPrice: btcQuote?.price || 0,
        btcChange: btcQuote?.changePercent || 0,
        ethPrice: ethQuote?.price || 0,
        ethChange: ethQuote?.changePercent || 0,
        solPrice: solQuote?.price || 0,
        solChange: solQuote?.changePercent || 0,
        totalVolumeUSD,
        usdInrRate: forex?.price || 84.5,
      },
      topGainers,
      topLosers,
      quotes: validQuotes,
      news,
      sentimentDistribution: {
        bullish,
        bearish,
        neutral,
        total: news.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Forex USD to INR live rate
router.get('/forex/usd-inr', async (req, res) => {
  try {
    const quote = await marketProvider.getQuote('USDINR=X');
    res.json({
      base: 'USD',
      target: 'INR',
      rate: quote.price > 0 ? quote.price : 84.5,
      change: quote.change,
      changePercent: quote.changePercent,
      timestamp: quote.timestamp,
      freshness: quote.freshness,
    });
  } catch {
    res.json({
      base: 'USD',
      target: 'INR',
      rate: 84.5,
      change: 0,
      changePercent: 0,
      timestamp: new Date().toISOString(),
      freshness: 'DEFAULT',
    });
  }
});

// Symbol quote
router.get('/:symbol/quote', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const quote = await marketProvider.getQuote(symbol);
    res.json(quote);
  } catch (err: any) {
    res.status(404).json({ error: 'SYMBOL_NOT_FOUND', message: err.message });
  }
});

// Historical OHLCV
router.get('/:symbol/history', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const range = (req.query.range as string) || '1mo';
    const interval = (req.query.interval as string) || '1d';
    const history = await marketProvider.getHistoricalData(symbol, range, interval);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: 'DATA_UNAVAILABLE', message: err.message });
  }
});

// Symbol news
router.get('/:symbol/news', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const news = await newsProvider.getNews(symbol, limit);
    res.json(news);
  } catch (err) {
    next(err);
  }
});

// Symbol sentiment distribution
router.get('/:symbol/sentiment', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const news = await newsProvider.getNews(symbol, 10);

    let bullish = 0;
    let bearish = 0;
    let neutral = 0;
    let totalScore = 0;

    news.forEach((n) => {
      totalScore += n.sentimentScore;
      if (n.sentiment === 'BULLISH') bullish++;
      else if (n.sentiment === 'BEARISH') bearish++;
      else neutral++;
    });

    const avgScore = news.length > 0 ? Number((totalScore / news.length).toFixed(2)) : 0;
    const dominantSentiment = avgScore > 0.1 ? 'BULLISH' : avgScore < -0.1 ? 'BEARISH' : 'NEUTRAL';

    res.json({
      symbol: symbol.toUpperCase(),
      dominantSentiment,
      averageScore: avgScore,
      distribution: {
        bullish,
        bearish,
        neutral,
        total: news.length,
      },
      recentNews: news,
      disclaimer: 'Sentiment classification is extracted from public financial headlines and does not guarantee future price action.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
