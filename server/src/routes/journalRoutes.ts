import { Router } from 'express';
import { journalService } from '../services/journalService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const entries = await journalService.getEntries(req.user!.id);
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { tradeId, symbol, thesis, strategyUsed, entryReason, exitReason, emotion, outcomeNotes } = req.body;
    if (!symbol || !thesis) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Symbol and thesis are required.' });
    }

    const entry = await journalService.createEntry({
      userId: req.user!.id,
      tradeId,
      symbol,
      thesis,
      strategyUsed,
      entryReason,
      exitReason,
      emotion,
      outcomeNotes,
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await journalService.deleteEntry(req.user!.id, req.params.id);
    res.json({ success });
  } catch (err) {
    next(err);
  }
});

export default router;
