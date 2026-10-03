import { Router } from 'express';
import { tradingService } from '../services/tradingService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

// Place an order (Market Buy, Market Sell, Limit Buy, Limit Sell)
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { symbol, side, type, quantity, limitPrice } = req.body;
    if (!symbol || !side || !type || !quantity) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Symbol, side (BUY/SELL), type (MARKET/LIMIT), and quantity are required.',
      });
    }

    const result = await tradingService.placeOrder({
      userId: req.user!.id,
      symbol,
      side,
      type,
      quantity: Number(quantity),
      limitPrice: limitPrice ? Number(limitPrice) : undefined,
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: 'ORDER_REJECTED', message: err.message });
  }
});

// Get order history
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const skip = parseInt((req.query.skip as string) || '0', 10);
    const result = await tradingService.getOrders(req.user!.id, limit, skip);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Cancel a pending order
router.post('/:id/cancel', async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await tradingService.cancelOrder(req.user!.id, req.params.id);
    res.json({ message: 'Order cancelled successfully.', order });
  } catch (err: any) {
    res.status(400).json({ error: 'CANCELLATION_FAILED', message: err.message });
  }
});

export default router;
