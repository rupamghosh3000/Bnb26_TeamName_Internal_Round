# StockPulse --- API Contract

Base URL:

``` text
/api
```

All protected endpoints require authentication.

## Auth

### POST /auth/register

Create user and paper account.

### POST /auth/login

Authenticate.

### POST /auth/logout

Invalidate session/token.

### GET /auth/me

Return current user.

------------------------------------------------------------------------

## Markets

### GET /markets/search?q=TCS

Search securities.

### GET /markets/:symbol/quote

Return normalized quote.

### GET /markets/:symbol/history?range=1M

Return OHLCV history.

### GET /markets/:symbol/news

Return recent financial news.

### GET /markets/:symbol/sentiment

Return sentiment score/distribution.

### GET /markets/status

Return market status.

------------------------------------------------------------------------

## Orders

### POST /orders

Request:

``` json
{
  "symbol": "TCS",
  "side": "BUY",
  "type": "MARKET",
  "quantity": 10
}
```

For limit:

``` json
{
  "symbol": "TCS",
  "side": "BUY",
  "type": "LIMIT",
  "quantity": 10,
  "limitPrice": 3200
}
```

Response should include: - order id - status - execution price if
filled - timestamp

### GET /orders

Paginated order history.

### POST /orders/:id/cancel

Cancel pending order.

------------------------------------------------------------------------

## Portfolio

### GET /portfolio

Return: - cash - invested value - total value - realized P&L -
unrealized P&L - daily change

### GET /portfolio/positions

Return current positions.

### GET /portfolio/performance

Return historical portfolio snapshots/equity curve.

### GET /portfolio/risk

Return: - volatility - drawdown - concentration - allocation - largest
position - cash exposure

### POST /portfolio/stress-test

Request:

``` json
{
  "shockType": "MARKET",
  "percentage": -10
}
```

------------------------------------------------------------------------

## Watchlists

### GET /watchlists

### POST /watchlists

### PATCH /watchlists/:id

### DELETE /watchlists/:id

### POST /watchlists/:id/symbols

### DELETE /watchlists/:id/symbols/:symbol

------------------------------------------------------------------------

## Alerts

### GET /alerts

### POST /alerts

``` json
{
  "symbol": "TCS",
  "type": "STOP_LOSS",
  "targetPrice": 3000
}
```

### POST /alerts/:id/cancel

------------------------------------------------------------------------

## Strategies

### GET /strategies

### POST /strategies

### GET /strategies/:id

### PATCH /strategies/:id

### DELETE /strategies/:id

### POST /strategies/:id/backtest

Request:

``` json
{
  "symbol": "TCS",
  "startDate": "2025-01-01",
  "endDate": "2026-01-01",
  "initialCapital": 100000
}
```

------------------------------------------------------------------------

## Backtests

### GET /backtests/:id

Return: - metrics - equity curve - trades - buy/sell markers

------------------------------------------------------------------------

## AI

### POST /ai/query

Request:

``` json
{
  "message": "Why did TCS move today?"
}
```

The backend determines intent and retrieves data before calling the LLM.

Response:

``` json
{
  "answer": "...",
  "observations": [],
  "sources": [],
  "generatedAt": "..."
}
```

### POST /ai/stock/:symbol/explain

### POST /ai/portfolio/analyze

### POST /ai/trade/:tradeId/review

### POST /ai/strategy/:backtestId/analyze

------------------------------------------------------------------------

## Journal

### GET /journal

### POST /journal

### PATCH /journal/:id

### DELETE /journal/:id

------------------------------------------------------------------------

## Error format

Use a consistent format:

``` json
{
  "error": {
    "code": "INSUFFICIENT_CASH",
    "message": "Not enough virtual cash to place this order.",
    "requestId": "..."
  }
}
```

Do not expose stack traces in production.

------------------------------------------------------------------------

## HTTP status guidance

-   200: successful read/update
-   201: created
-   400: validation error
-   401: unauthenticated
-   403: unauthorized
-   404: resource not found
-   409: state conflict
-   422: business-rule validation failure
-   429: rate limit
-   500: unexpected server error
-   503: provider/service unavailable
