import { Router } from 'express';
import { authService } from '../services/authService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters.' });
    }

    const result = await authService.register({ name, email, password });
    res.status(201).json(result);
  } catch (err: any) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Email and password are required.' });
    }

    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: 'AUTHENTICATION_FAILED', message: err.message });
  }
});

router.post('/logout', (req, res) => {
  // Stateless JWT logout
  res.json({ message: 'Successfully logged out.' });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await authService.getMe(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
