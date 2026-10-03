import { Router } from 'express';
import { tradingService } from '../services/tradingService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

// Get immutable trade executions
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const skip = parseInt((req.query.skip as string) || '0', 10);
    const result = await tradingService.getTrades(req.user!.id, limit, skip);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
