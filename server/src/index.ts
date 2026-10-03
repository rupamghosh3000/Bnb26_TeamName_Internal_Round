import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from './config/environment.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import strategyRoutes from './routes/strategyRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Services for background tasks
import { tradingService } from './services/tradingService.js';
import { alertService } from './services/alertService.js';

const app = express();
const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to StockPulse Realtime Stream' }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

export function broadcastRealtime(event: string, data: any) {
  const payload = JSON.stringify({ type: event, data, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Global middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Request logger in dev
if (config.env === 'development') {
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'StockPulse',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use(errorHandler);

// Background Worker: Limit Order Matching & Alert Evaluation (every 30 seconds)
setInterval(async () => {
  try {
    await tradingService.checkPendingLimitOrders();
    const triggered = await alertService.evaluateAlerts();
    if (triggered.length > 0) {
      broadcastRealtime('ALERTS_TRIGGERED', triggered);
    }
  } catch (err) {
    // Non-blocking background worker
  }
}, 30000);

// Start server
async function start() {
  await connectDB();
  server.listen(config.port, () => {
    console.log(`[StockPulse Server] Running on http://localhost:${config.port}`);
    console.log(`[StockPulse Realtime] WebSocket active on ws://localhost:${config.port}/ws`);
  });
}

start().catch((err) => {
  console.error('[StockPulse Server] Fatal startup error:', err);
  process.exit(1);
});
