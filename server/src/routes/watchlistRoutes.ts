import { Router } from 'express';
import { watchlistService } from '../services/watchlistService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await watchlistService.getWatchlistWithQuotes(req.user!.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name } = req.body;
    const watchlist = await watchlistService.createWatchlist(req.user!.id, name);
    res.status(201).json(watchlist);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/symbols', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Symbol is required.' });
    }
    const watchlist = await watchlistService.addSymbol(req.user!.id, req.params.id, symbol);
    res.json(watchlist);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/symbols/:symbol', async (req: AuthenticatedRequest, res, next) => {
  try {
    const watchlist = await watchlistService.removeSymbol(req.user!.id, req.params.id, req.params.symbol);
    res.json(watchlist);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await watchlistService.deleteWatchlist(req.user!.id, req.params.id);
    res.json({ success });
  } catch (err) {
    next(err);
  }
});

export default router;
