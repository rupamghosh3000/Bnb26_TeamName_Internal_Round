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
