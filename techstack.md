# StockPulse --- Technology Stack

## Frontend

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   React Router
-   TanStack Query
-   Lightweight Charts or another financial time-series chart library
-   Recharts for dashboard analytics where appropriate
-   Zod for client-side schema validation where useful

## Backend

-   Node.js
-   Express
-   TypeScript
-   Zod
-   MongoDB driver or Mongoose
-   JWT/session authentication
-   WebSocket or Server-Sent Events

## Data

### Primary database

MongoDB

Use MongoDB for: - users - accounts - trades - orders - positions -
watchlists - alerts - news metadata - sentiment snapshots - strategies -
backtests - journal entries

### Cache/event layer

Redis

Use Redis for: - latest quotes - short-lived API cache - rate-limit
counters - realtime pub/sub - worker coordination where required

Do not make Redis the permanent source of financial transaction truth.

## Market Data

Implement a provider abstraction.

The exact provider is configuration-driven. Candidate providers can
include a market-data API with: - quote endpoint - historical OHLCV -
symbol search - market status - realtime/streaming support where
available

Do not couple the codebase to one vendor.

## News/Sentiment

Use a provider abstraction for: - financial news - ticker relevance -
sentiment

Normalize external results into StockPulse's internal schema.

## AI

Create an `LLMProvider` interface.

Required capabilities: - structured prompt/context - tool-based context
retrieval - JSON/structured output when possible - error handling -
model configuration via environment variables

Do not allow the model to be the source of live financial data.

## Jobs

Use a worker process with a scheduler for: - market synchronization -
news synchronization - sentiment updates - alert evaluation - portfolio
snapshots

## Testing

Unit: - Vitest/Jest

API: - Supertest or equivalent

E2E: - Playwright

Critical tests: - market buy - market sell - insufficient cash -
insufficient holdings - limit-order execution - duplicate execution
prevention - stop-loss trigger - target trigger - portfolio P&L -
drawdown - backtest calculations - AI tool context integrity

## Code quality

-   ESLint
-   Prettier
-   strict TypeScript
-   environment validation
-   conventional commit style if the team uses Git history standards
