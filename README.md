# StockPulse

**Real Market Data + Paper Trading + AI Market Intelligence + Strategy Lab + Risk Analytics**

StockPulse is a full-stack, institutional-grade educational paper-trading and financial intelligence platform built strictly adhering to the project specification documents (`prd.md`, `design.md`, `architecture.md`, `data.md`, and `api.md`).

---

## Key Features

1. **Real Market Data Architecture**
   - Direct integration with verified live market streams (Yahoo Finance live feed & Twelve Data adapters).
   - Zero fabricated market prices. Freshness badges: `LIVE`, `DELAYED`, `MARKET_CLOSED`, `UNAVAILABLE`.
   - Real-time quote search, intraday & historical OHLCV chart bars (1D, 5D, 1M, 6M, 1Y, 5Y).
   - Real financial news feed and sentiment heuristics (Bullish / Neutral / Bearish).

2. **Authoritative Paper Trading Engine**
   - $100,000 starting virtual capital for all registered accounts.
   - Market Buy, Market Sell, Limit Buy, and Limit Sell orders.
   - Server-side cash ledger validation and weighted average cost basis accounting.
   - Instant order execution, pending limit order matching, and trade cancellation.
   - Mark-to-market unrealized P&L and realized P&L attribution.

3. **Institutional-Grade Risk Analytics & Stress Testing**
   - Annualized portfolio volatility based on active position weights and historical returns standard deviation.
   - Maximum Drawdown gauge tracking peak-to-trough performance.
   - Herfindahl-Hirschman Index (HHI) concentration score and rating.
   - Hypothetical market stress testing (-15%, -10%, -5%, +5%, +10%) and interactive custom shock simulator.

4. **Deterministic Strategy Lab & Backtesting**
   - Visual rule-based strategy builder with templates:
     - Moving Average Crossover (Fast / Slow SMA)
     - RSI Mean Reversion (Overbought / Oversold thresholds)
     - Momentum Trend Follower
     - 20-Day Donchian Breakout
   - Historical backtesting over real market bars with equity curve comparison against a passive Buy & Hold benchmark.
   - Total Return %, Win Rate %, Max Drawdown %, and Profit Factor metrics.

5. **Grounded AI Market Intelligence Suite**
   - Reasons strictly from verified application state (quotes, positions, risk metrics, and news).
   - Features: AI Market Brief, "Why Did It Move?" analyzer, Stock Explanation, Portfolio Analyst, and Trade Review.
   - Internal data tools: `getPortfolio`, `getPosition`, `getQuote`, `getNews`, `getSentiment`, `getRisk`, `getTradeHistory`.
   - Explicitly displays Observed Facts, Contributing Factors, and Uncertainty statements.

6. **Editorial Trade Journal & Alerts**
   - Trade reflection notebook tracking trading thesis, strategy pattern, entry/exit criteria, and psychological mindset (`DISCIPLINED`, `CONFIDENT`, `NEUTRAL`, `ANXIOUS`, `FOMO`).
   - Server-evaluated price triggers and stop-loss notifications.

7. **Premium 3D Visual System**
   - Aesthetic soft lavender background atmosphere (`#F2EEFF`) with large rounded white surfaces (`#FFFFFF`).
   - Restrained purple brand language: Deep purple `#4B1FA8`, Primary purple `#6736C7`, Soft purple `#9A78E8`.
   - Interactive 3D visuals using Three.js and React Three Fiber: `MarketCore`, `SentimentOrb`, `PortfolioRing`, `StrategyCube`, `AIOrb`, and `ParticleField`.
   - 2D charts (Recharts) for precise financial data and 3D scenes for conceptual immersion.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Three.js, React Three Fiber, React Three Drei, Recharts, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, Mongoose, WebSocket (`ws`), JWT, Bcryptjs.
- **Database**: MongoDB (Local or Atlas).
- **Market Feeds**: Yahoo Finance API stream, Loughran-McDonald financial sentiment lexicon.

---

## Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Install Dependencies
```bash
# Server dependencies
npm --prefix server install

# Client dependencies
npm --prefix client install
```

### 2. Environment Configuration
Verify `.env` exists in the project root:
```env
PORT=5000
WEB_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/stockpulse
JWT_SECRET=stockpulse_super_secure_jwt_token_secret_key_2026_xyz
```

### 3. Build & Test
```bash
# Run unit tests
npm --prefix server run test

# Build server and client
npm --prefix server run build
npm --prefix client run build
```

### 4. Start Development Servers
```bash
# Terminal 1: Start backend
npm --prefix server run dev

# Terminal 2: Start frontend
npm --prefix client run dev
```

Visit **http://localhost:5173/** in your browser.

---

## Production & Regulatory Boundary

StockPulse is an educational paper-trading and market-intelligence platform. It uses real market information with virtual money. It does NOT execute real-money trades and should not be represented as a broker-dealer.
