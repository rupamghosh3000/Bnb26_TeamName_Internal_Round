# StockPulse --- Technical Architecture

## 1. System Overview

``` text
                    ┌─────────────────────┐
                    │ External Market APIs│
                    │ News / Sentiment    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Provider Adapters   │
                    │ Normalization       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ StockPulse API      │
                    │ Node + Express      │
                    └──────┬─────┬────────┘
                           │     │
             ┌─────────────┘     └──────────────┐
             ▼                                  ▼
      ┌─────────────┐                    ┌─────────────┐
      │ MongoDB     │                    │ Redis       │
      │ source data │                    │ cache/events│
      └─────────────┘                    └──────┬──────┘
                                                │
                                      ┌─────────▼─────────┐
                                      │ Realtime Gateway  │
                                      │ WS / SSE          │
                                      └─────────┬─────────┘
                                                │
                                                ▼
                                      ┌───────────────────┐
                                      │ React Web App     │
                                      └───────────────────┘
```

------------------------------------------------------------------------

## 2. Application Layers

### Frontend

Responsible for: - presentation - interaction - local UI state - API
calls - realtime subscriptions - chart rendering

Not responsible for: - API secrets - authoritative portfolio
calculations - order validation - market data provider calls

### API

Responsible for: - authentication - authorization - validation -
orchestration - business logic - database operations - provider access

### Domain services

Core services: - AuthService - MarketService - TradingService -
PortfolioService - RiskService - NewsService - SentimentService -
AlertService - StrategyService - BacktestService - AIService

### Workers

-   market synchronization
-   news synchronization
-   sentiment synchronization
-   alert evaluation
-   portfolio snapshots
-   cleanup jobs

------------------------------------------------------------------------

## 3. Realtime Flow

``` text
Market provider
      ↓
Provider adapter
      ↓
Normalize quote
      ↓
Cache latest quote
      ↓
Trading/alert engine
      ↓
Portfolio recalculation
      ↓
Realtime event
      ↓
Web client
```

A realtime provider is preferred where available. If the selected
provider supplies delayed polling rather than a stream, the UI must
explicitly indicate delayed/polled data.

------------------------------------------------------------------------

## 4. AI Architecture

``` text
React
  ↓
POST /api/ai/query
  ↓
Intent Router
  ↓
Internal Data Tools
  ├── Market
  ├── News
  ├── Sentiment
  ├── Portfolio
  ├── Risk
  ├── Performance
  └── Trades
  ↓
Validated Context
  ↓
LLM Service
  ↓
Structured AI Response
```

AI responses should contain: - answer - supporting observations -
timestamps - source references where applicable - uncertainty

------------------------------------------------------------------------

## 5. Strategy Architecture

``` text
Strategy Builder
      ↓
Strategy JSON
      ↓
Validation
      ↓
Indicator Engine
      ↓
Backtest Engine
      ↓
Trade Simulator
      ↓
Performance Calculator
      ↓
Equity Curve + Metrics
      ↓
Strategy Analyst
```

The strategy engine must be deterministic for identical: - input data -
strategy - date range - initial capital - simulation settings

------------------------------------------------------------------------

## 6. Financial Data Integrity

### Source hierarchy

1.  Fresh provider response
2.  Valid cached provider response
3.  Unavailable

Never: `Provider unavailable → random/generated price`

### Price object

``` ts
type Quote = {
  symbol: string;
  price: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  timestamp: string;
  source: string;
  freshness: "LIVE" | "DELAYED" | "MARKET_CLOSED" | "UNAVAILABLE";
};
```

------------------------------------------------------------------------

## 7. Security Architecture

-   HTTPS in deployment
-   secrets in environment variables
-   hashed passwords
-   JWT or secure session strategy
-   HTTP-only cookies if using cookie sessions
-   CORS restricted to frontend origin
-   request validation
-   rate limiting
-   authorization middleware
-   sanitized user input
-   safe error messages

------------------------------------------------------------------------

## 8. Failure Handling

Provider failure: - record error - use valid cache when allowed - expose
freshness - do not fabricate values

Database failure: - return controlled error - do not partially execute a
trade

AI provider failure: - return a transparent unavailable message -
preserve underlying data access

Realtime disconnect: - reconnect with exponential backoff - show
connection state

------------------------------------------------------------------------

## 9. Deployment

Recommended deployment separation:

``` text
Frontend → static hosting/CDN
API      → Node service
Worker   → Node worker
MongoDB  → managed MongoDB
Redis    → managed Redis
```

The exact hosting provider can be selected later without changing
application architecture.
