import { Router } from 'express';
import { portfolioService } from '../services/portfolioService.js';
import { riskService } from '../services/riskService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

// Get portfolio summary (cash, positions, invested value, P&L, allocation)
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const summary = await portfolioService.getPortfolioSummary(req.user!.id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// Get active positions only
router.get('/positions', async (req: AuthenticatedRequest, res, next) => {
  try {
    const summary = await portfolioService.getPortfolioSummary(req.user!.id);
    res.json(summary.positions);
  } catch (err) {
    next(err);
  }
});

// Get historical performance snapshots (equity curve)
router.get('/performance', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await portfolioService.getPerformance(req.user!.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get portfolio risk analytics
router.get('/risk', async (req: AuthenticatedRequest, res, next) => {
  try {
    const risk = await riskService.calculatePortfolioRisk(req.user!.id);
    res.json(risk);
  } catch (err) {
    next(err);
  }
});

// Run custom stress test
router.post('/stress-test', async (req: AuthenticatedRequest, res, next) => {
  try {
    const shockPercentage = Number(req.body.percentage || -10);
    const result = await riskService.runCustomStressTest(req.user!.id, shockPercentage);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
