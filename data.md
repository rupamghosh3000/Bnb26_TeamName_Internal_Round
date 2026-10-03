# StockPulse --- Data Model

## User

``` ts
{
  _id,
  name,
  email,
  passwordHash,
  role,
  preferences: {
    currency,
    timezone,
    theme
  },
  createdAt,
  updatedAt
}
```

## PaperAccount

``` ts
{
  _id,
  userId,
  startingCash,
  cashBalance,
  createdAt,
  updatedAt
}
```

## Position

``` ts
{
  _id,
  userId,
  symbol,
  quantity,
  averagePrice,
  currentPrice,
  updatedAt
}
```

## Order

``` ts
{
  _id,
  userId,
  symbol,
  side: "BUY" | "SELL",
  type: "MARKET" | "LIMIT",
  quantity,
  limitPrice?,
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED",
  executedPrice?,
  createdAt,
  executedAt?
}
```

## Trade

Immutable execution record.

``` ts
{
  _id,
  userId,
  orderId,
  symbol,
  side,
  quantity,
  price,
  value,
  executedAt
}
```

## Watchlist

``` ts
{
  _id,
  userId,
  name,
  symbols: string[],
  createdAt,
  updatedAt
}
```

## Alert

``` ts
{
  _id,
  userId,
  symbol,
  type: "STOP_LOSS" | "TARGET" | "PRICE",
  direction?: "ABOVE" | "BELOW",
  targetPrice,
  status: "ACTIVE" | "TRIGGERED" | "CANCELLED",
  triggeredAt?,
  createdAt
}
```

## News

``` ts
{
  _id,
  symbol?,
  headline,
  source,
  url,
  publishedAt,
  sentiment: "BULLISH" | "NEUTRAL" | "BEARISH",
  sentimentScore?,
  provider,
  fetchedAt
}
```

## PriceSnapshot

``` ts
{
  _id,
  symbol,
  timestamp,
  open,
  high,
  low,
  close,
  volume,
  provider
}
```

## PortfolioSnapshot

``` ts
{
  _id,
  userId,
  timestamp,
  cash,
  investedValue,
  totalValue,
  realizedPnL,
  unrealizedPnL
}
```

## Strategy

``` ts
{
  _id,
  userId,
  name,
  description,
  rules,
  assetUniverse,
  timeframe,
  createdAt,
  updatedAt
}
```

## Backtest

``` ts
{
  _id,
  userId,
  strategyId,
  symbol,
  timeframe,
  startDate,
  endDate,
  initialCapital,
  finalCapital,
  totalReturn,
  winRate,
  maxDrawdown,
  profitFactor,
  tradeCount,
  equityCurve,
  trades,
  createdAt
}
```

## JournalEntry

``` ts
{
  _id,
  userId,
  tradeId?,
  symbol,
  thesis,
  emotion?,
  notes,
  createdAt,
  updatedAt
}
```

## AIAnalysis

``` ts
{
  _id,
  userId,
  type,
  contextSnapshot,
  result,
  createdAt
}
```

------------------------------------------------------------------------

## Indexes

Recommended: - User.email unique - Position.userId + symbol unique -
Order.userId + createdAt - Order.status + symbol - Trade.userId +
executedAt - Watchlist.userId - Alert.status + symbol - News.symbol +
publishedAt - PriceSnapshot.symbol + timestamp -
PortfolioSnapshot.userId + timestamp - Strategy.userId + updatedAt

------------------------------------------------------------------------

## Data integrity

### Transactional operations

A filled trade may modify: - cash - position - order - trade

Use a transaction/atomic strategy so partial updates cannot leave an
inconsistent portfolio.

### Derived data

Do not treat client-provided: - portfolio value - P&L - allocation -
risk metrics

as authoritative.

Calculate them from trusted transaction/position/market data.
