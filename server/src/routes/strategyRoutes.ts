import { Router } from 'express';
import { strategyService } from '../services/strategyService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

// Get user strategies
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const strategies = await strategyService.getUserStrategies(req.user!.id);
    res.json(strategies);
  } catch (err) {
    next(err);
  }
});

// Create custom strategy
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, rules, assetUniverse, timeframe } = req.body;
    if (!name || !rules) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Strategy name and rules are required.' });
    }

    const strategy = await strategyService.createStrategy({
      userId: req.user!.id,
      name,
      description,
      rules,
      assetUniverse,
      timeframe,
    });

    res.status(201).json(strategy);
  } catch (err) {
    next(err);
  }
});

// Run backtest directly with template or parameters
router.post('/backtest/run', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { symbol, strategyType, params, range, initialCapital } = req.body;
    if (!symbol || !strategyType) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Symbol and strategyType are required.' });
    }

    const backtest = await strategyService.executeBacktest({
      userId: req.user!.id,
      symbol,
      strategyType,
      params,
      range: range || '1y',
      initialCapital: initialCapital ? Number(initialCapital) : 100000,
    });

    res.status(201).json(backtest);
  } catch (err: any) {
    res.status(400).json({ error: 'BACKTEST_FAILED', message: err.message });
  }
});

// Run backtest on saved strategy
router.post('/:id/backtest', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { symbol, range, initialCapital } = req.body;
    const strategy = await strategyService.getStrategyById(req.params.id, req.user!.id);
    if (!strategy) {
      return res.status(404).json({ error: 'STRATEGY_NOT_FOUND', message: 'Strategy not found.' });
    }

    const backtest = await strategyService.executeBacktest({
      userId: req.user!.id,
      strategyId: strategy._id.toString(),
      symbol: symbol || strategy.assetUniverse[0] || 'AAPL',
      strategyType: (strategy.rules[0]?.type as any) || 'MA_CROSSOVER',
      params: strategy.rules[0]?.params || {},
      range: range || '1y',
      initialCapital: initialCapital ? Number(initialCapital) : 100000,
    });

    res.status(201).json(backtest);
  } catch (err: any) {
    res.status(400).json({ error: 'BACKTEST_FAILED', message: err.message });
  }
});

// Get user past backtests
router.get('/backtests', async (req: AuthenticatedRequest, res, next) => {
  try {
    const backtests = await strategyService.getUserBacktests(req.user!.id);
    res.json(backtests);
  } catch (err) {
    next(err);
  }
});

// Get backtest by ID
router.get('/backtests/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const backtest = await strategyService.getBacktestById(req.params.id, req.user!.id);
    if (!backtest) {
      return res.status(404).json({ error: 'BACKTEST_NOT_FOUND', message: 'Backtest not found.' });
    }
    res.json(backtest);
  } catch (err) {
    next(err);
  }
});

export default router;
