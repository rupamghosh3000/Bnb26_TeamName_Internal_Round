import { Router } from 'express';
import { aiService } from '../services/aiService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

// Natural Language StockPulse Assistant
router.post('/query', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Message query is required.' });
    }
    const response = await aiService.handleNaturalQuery(req.user!.id, message);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: 'AI_QUERY_FAILED', message: err.message });
  }
});

// AI Market Brief
router.post('/market/brief', async (req: AuthenticatedRequest, res, next) => {
  try {
    const response = await aiService.getMarketBrief(req.user!.id);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// "Why did it move?"
router.post('/stock/:symbol/why-move', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { symbol } = req.params;
    const response = await aiService.explainMovement(req.user!.id, symbol);
    res.json(response);
  } catch (err: any) {
    res.status(404).json({ error: 'ANALYSIS_UNAVAILABLE', message: err.message });
  }
});

// AI Stock Explanation
router.post('/stock/:symbol/explain', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { symbol } = req.params;
    const response = await aiService.explainStock(req.user!.id, symbol);
    res.json(response);
  } catch (err: any) {
    res.status(404).json({ error: 'ANALYSIS_UNAVAILABLE', message: err.message });
  }
});

// AI Portfolio Analysis
router.post('/portfolio/analyze', async (req: AuthenticatedRequest, res, next) => {
  try {
    const response = await aiService.analyzePortfolio(req.user!.id);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// AI Trade Review
router.post('/trade/:tradeId/review', async (req: AuthenticatedRequest, res, next) => {
  try {
    const response = await aiService.reviewTrade(req.user!.id, req.params.tradeId);
    res.json(response);
  } catch (err: any) {
    res.status(404).json({ error: 'REVIEW_FAILED', message: err.message });
  }
});

// AI Strategy Analysis
router.post('/strategy/:backtestId/analyze', async (req: AuthenticatedRequest, res, next) => {
  try {
    const response = await aiService.analyzeStrategy(req.user!.id, req.params.backtestId);
    res.json(response);
  } catch (err: any) {
    res.status(404).json({ error: 'STRATEGY_ANALYSIS_FAILED', message: err.message });
  }
});

export default router;
