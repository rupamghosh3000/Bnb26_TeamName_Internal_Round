import { Router } from 'express';
import { alertService } from '../services/alertService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const alerts = await alertService.getUserAlerts(req.user!.id);
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { symbol, type, targetPrice, direction } = req.body;
    if (!symbol || !type || targetPrice == null) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Symbol, alert type (STOP_LOSS/TARGET/PRICE), and targetPrice are required.',
      });
    }

    const alert = await alertService.createAlert({
      userId: req.user!.id,
      symbol,
      type,
      targetPrice: Number(targetPrice),
      direction,
    });

    res.status(201).json(alert);
  } catch (err: any) {
    res.status(400).json({ error: 'ALERT_CREATION_FAILED', message: err.message });
  }
});

router.post('/:id/cancel', async (req: AuthenticatedRequest, res, next) => {
  try {
    const alert = await alertService.cancelAlert(req.user!.id, req.params.id);
    res.json({ message: 'Alert cancelled successfully.', alert });
  } catch (err: any) {
    res.status(400).json({ error: 'CANCELLATION_FAILED', message: err.message });
  }
});

export default router;
