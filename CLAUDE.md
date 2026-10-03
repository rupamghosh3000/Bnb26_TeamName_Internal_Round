# StockPulse --- AI Coding Agent Instructions

## Mission

Build StockPulse as a production-quality hackathon prototype that is
genuinely functional end-to-end.

Do not build a static mockup.

The application must use real market information through server-side
provider adapters and virtual money for trading.

------------------------------------------------------------------------

## Non-negotiable rules

1.  Never hardcode current market prices.
2.  Never expose API keys in frontend code.
3.  Never invent market data.
4.  Never silently replace unavailable market data with fake values.
5.  Every market-data component must show freshness/status.
6.  Paper trades use virtual money only.
7.  Never implement real-money brokerage execution.
8.  AI must consume validated backend data.
9.  Strategy backtests must use historical data, not random generated
    results.
10. Preserve the distinction between historical analysis and prediction.
11. Keep provider-specific code behind interfaces.
12. Validate all order inputs server-side.
13. Recalculate portfolio values server-side.
14. Never trust client-submitted portfolio balances/P&L.
15. Use UTC internally for timestamps and convert at the UI boundary.
16. Use database transactions/atomic updates where an order can modify
    multiple financial records.
17. Add loading, empty, error and unavailable states to every
    data-driven page.
18. Do not delete working functionality merely to simplify
    implementation.
19. Prefer simple maintainable code over unnecessary abstractions.
20. Do not add dependencies unless they solve a concrete requirement.

------------------------------------------------------------------------

## Required architecture

Frontend: - React - Vite - TypeScript - Tailwind CSS - charting library
appropriate for financial time series

Backend: - Node.js - Express - TypeScript

Data: - MongoDB - Redis where caching/event delivery is useful

Realtime: - WebSocket or SSE

Background work: - scheduled jobs/worker process for price/news
synchronization and alerts

------------------------------------------------------------------------

## Provider abstraction

Create interfaces before provider-specific implementations.

Example:

``` ts
interface MarketDataProvider {
  getQuote(symbol: string): Promise<Quote>;
  getHistoricalData(symbol: string, range: HistoryRange): Promise<PriceBar[]>;
  searchSymbols(query: string): Promise<SecuritySearchResult[]>;
  getMarketStatus(): Promise<MarketStatus>;
}

interface NewsProvider {
  getNews(params: NewsQuery): Promise<NewsItem[]>;
}

interface SentimentProvider {
  getSentiment(symbol: string): Promise<SentimentResult>;
}
```

The rest of the application must not depend directly on a provider SDK.

Implement: - primary provider adapter - fallback/mock adapter only for
automated tests

The mock adapter must never be used as a silent production fallback.

------------------------------------------------------------------------

## Trading engine rules

### Market buy

Validate: - symbol exists - quantity \> 0 - market data is valid - user
has sufficient cash

Then: - calculate execution value - update cash - update/create
position - create order/trade record - update realized/unrealized P&L
state - emit portfolio update

### Market sell

Validate: - symbol exists - quantity \> 0 - user owns enough quantity -
market data is valid

Then: - calculate execution value - update cash - reduce/delete
position - calculate realized P&L - create order/trade record

### Limit orders

Store pending order.

Evaluate on validated price events.

Buy executes when: `currentPrice <= limitPrice`

Sell executes when: `currentPrice >= limitPrice`

Use idempotency protection so the same order cannot execute twice.

------------------------------------------------------------------------

## Portfolio calculation

Do not persist derived values as the only source of truth.

At minimum, persist: - transactions/trades - cash ledger - positions

Derived: - market value - unrealized P&L - allocation - total portfolio
value

can be recalculated from trusted records and current validated prices.

------------------------------------------------------------------------

## AI architecture

AI should receive structured context from internal tools.

Example:

``` text
User question
   ↓
Intent router
   ↓
StockPulse tools
   ├── getQuote()
   ├── getNews()
   ├── getSentiment()
   ├── getPortfolio()
   ├── getRisk()
   ├── getPerformance()
   └── getTradeHistory()
   ↓
Validated context
   ↓
LLM
   ↓
Structured answer
```

The LLM must not be the source of market truth.

------------------------------------------------------------------------

## Strategy engine

Represent strategies as JSON rule trees.

Do not execute user-provided JavaScript.

Example:

``` json
{
  "entry": {
    "operator": "AND",
    "conditions": [
      {"indicator": "SMA", "period": 50, "comparison": "CROSS_ABOVE", "target": {"indicator": "SMA", "period": 200}},
      {"indicator": "RSI", "period": 14, "comparison": "LESS_THAN", "value": 70}
    ]
  }
}
```

Backtests must: - process historical bars chronologically - avoid
look-ahead bias - model cash and positions - record every simulated
trade - calculate equity curve - calculate drawdown from the equity
curve

------------------------------------------------------------------------

## Frontend standards

Every route needs: - loading state - empty state - error state -
responsive layout - accessible labels - keyboard navigation where
applicable

Never use: - fake charts - random prices - placeholder P&L presented as
real - "Lorem ipsum" - dead buttons - fake AI responses in production
paths

------------------------------------------------------------------------

## Suggested project structure

``` text
stockpulse/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── validation/
│   └── strategy-engine/
├── docs/
├── scripts/
├── .env.example
├── docker-compose.yml
└── README.md
```

------------------------------------------------------------------------

## Definition of done

A feature is not done because its UI exists.

A feature is done only when: - frontend exists - API exists - validation
exists - database behavior exists where required - error states exist -
tests cover core logic - real data path works - UI displays actual API
result - no fake production fallback exists
