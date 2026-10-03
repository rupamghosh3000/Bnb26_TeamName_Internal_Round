# StockPulse --- Product Requirements Document

## 1. Product Definition

**Product:** StockPulse\
**Problem Statement:** PS-1 --- Paper Trading & Market Sentiment
Analytics Platform\
**Product Type:** Full-stack web application\
**Primary goal:** Provide a realistic paper-trading environment using
real market information, while helping users understand price movement,
sentiment, portfolio risk, and historical strategy performance.

StockPulse uses **real market data** and **virtual money**. It must
never pretend that simulated trades are real trades.

### Product identity

> **Real Market Data + Paper Trading + AI Market Intelligence + Strategy
> Lab + Risk Analytics**

### Core learning loop

`REAL MARKET DATA → NEWS + SENTIMENT → AI MARKET INTELLIGENCE → STRATEGY LAB → PAPER TRADE → PORTFOLIO → RISK ANALYSIS → TRADE REVIEW → AI LEARNING INSIGHT`

------------------------------------------------------------------------

## 2. Source Requirements

The official problem statement requires: - simulated market and limit
buy/sell orders using virtual currency - order history and active
positions - real-time P&L tracking - portfolio value, asset allocation,
returns and performance trends - personalized watchlists - current
financial headlines and Bullish/Neutral/Bearish sentiment - sentiment
displayed alongside stock-price movements - portfolio risk/performance
analytics and interactive historical charts - configurable stop-loss and
target alerts - automated notifications for simulated triggers

These requirements are mandatory.

------------------------------------------------------------------------

## 3. Scope

### 3.1 Mandatory MVP

1.  Authentication
2.  User paper account
3.  Real market-data integration
4.  Stock search
5.  Quote page
6.  Historical price chart
7.  Market orders
8.  Limit orders
9.  Buy/sell simulation
10. Virtual cash balance
11. Order history
12. Active positions
13. Realized and unrealized P&L
14. Portfolio dashboard
15. Asset allocation
16. Performance history
17. Watchlists
18. Financial news
19. Bullish/Neutral/Bearish sentiment
20. Price-vs-sentiment visualization
21. Stop-loss alerts
22. Target alerts
23. Risk analytics
24. Market Pulse

### 3.2 Advanced AI

1.  AI Market Brief
2.  AI Stock Explanation
3.  AI "Why did it move?"
4.  AI Portfolio Analyst
5.  AI Risk Explanation
6.  AI Trade Review
7.  Natural-language StockPulse Analyst
8.  AI Strategy Analyst

### 3.3 Strategy Lab

1.  Visual Strategy Builder
2.  Strategy templates
3.  Historical backtesting
4.  Simulated entry/exit markers
5.  Return calculation
6.  Win rate
7.  Maximum drawdown
8.  Profit factor
9.  Trade count
10. Strategy comparison
11. Strategy vs Buy & Hold
12. Save/edit strategies
13. AI historical strategy analysis

### 3.4 Optional polish

-   leaderboards
-   achievements
-   strategy sharing
-   browser/email notifications
-   broader social sentiment
-   additional exchanges

Optional features must never delay mandatory functionality.

------------------------------------------------------------------------

## 4. User Roles

### User

A normal authenticated user can: - create/manage a paper portfolio -
view market data - search securities - place simulated trades - manage
watchlists - configure alerts - view portfolio/risk analytics - build
and backtest strategies - use AI analysis

### Admin

Admin is optional for the first release. If implemented, it must be a
protected internal role and must not be exposed as a public feature.

------------------------------------------------------------------------

## 5. Functional Requirements

### Authentication

-   register
-   login
-   logout
-   protected routes
-   secure password hashing
-   token/session handling
-   account preferences

### Paper Trading

-   configurable starting virtual cash
-   market buy
-   market sell
-   limit buy
-   limit sell
-   order validation
-   sufficient cash validation
-   sufficient holdings validation
-   order status
-   execution timestamp
-   execution price
-   order history

### Limit Order Engine

A limit order remains open until: - market price reaches the required
condition, or - user cancels it.

The matcher must react to market-price updates.

Buy limit: `currentPrice <= limitPrice`

Sell limit: `currentPrice >= limitPrice`

The engine must never execute a limit order using stale or fabricated
prices.

### Portfolio

For each position: - symbol - quantity - average entry price - current
price - market value - unrealized P&L - unrealized P&L % - portfolio
weight

Portfolio: - cash - invested value - total value - realized P&L -
unrealized P&L - total return - daily change - historical value

### Risk

Calculate: - volatility - maximum drawdown - concentration - largest
position - cash exposure - asset allocation - sector exposure when
provider data supports it

### Stress Testing

Support: - market -5% - market -10% - market +5% - sector shock when
sector metadata exists - custom percentage shock

Stress testing is hypothetical analysis, not a forecast.

### Watchlist

-   create watchlist
-   rename
-   add/remove symbols
-   current quote
-   daily change
-   sentiment
-   last updated

### News & Sentiment

-   fetch relevant financial news
-   normalize source/headline/time/symbol
-   classify Bullish, Neutral, or Bearish
-   store score and label
-   display alongside price data
-   show source and publication time
-   avoid claiming causation merely because sentiment and price move
    together

### Alerts

Supported alert types: - stop loss - target - price alert

Alert lifecycle: `ACTIVE → TRIGGERED` or `ACTIVE → CANCELLED`

Alerts must be evaluated against validated market prices.

------------------------------------------------------------------------

## 6. Market Pulse

Market Pulse combines: - price movement - news volume - sentiment
distribution - sentiment score - unusual volume when available - recent
market movement

### Sentiment divergence

Show cases such as: - price rising + sentiment weakening - price
falling + sentiment improving

The UI must call this a divergence/correlation signal, not a guaranteed
prediction.

------------------------------------------------------------------------

## 7. AI Requirements

### AI data rule

**AI must never invent market data.**

The only safe flow is:

`External Data → Backend → Validated Structured Context → AI → Explanation`

The model must not be allowed to fetch arbitrary market values from
memory and present them as current.

### AI Market Brief

Input: - current market data - recent news - sentiment - selected market
universe

Output: - concise market summary - major observed sentiment changes -
notable price movements - relevant watchlist items - evidence references

### AI Stock Explanation

Input: - current quote - historical movement - volume - news -
sentiment - sector information - user's position when relevant

Output: - observed facts - possible contributing factors - uncertainty -
source timestamps

### AI "Why did it move?"

The answer must use wording such as: - "Observed:" - "Possible
contributing factors:" - "Evidence:" - "Uncertainty:"

It must not claim that a news item definitively caused a price move
unless the data actually establishes that relationship.

### AI Portfolio Analyst

Analyze: - allocation - concentration - returns - volatility -
drawdown - largest contributors/detractors

### AI Trade Review

After a simulated trade: - summarize entry - summarize exit - show P&L -
compare trade outcome with market movement - identify observed
strengths/weaknesses - suggest learning questions, not financial
instructions

### Natural-language Analyst

Supported intents: - portfolio summary - position lookup - quote
lookup - news lookup - sentiment lookup - risk lookup - performance
comparison - trade history explanation

The assistant should use tools/services rather than hallucinating
values.

### Financial-safety boundary

StockPulse is an educational paper-trading product. AI outputs must
not: - execute real trades - connect to real-money brokerage execution -
promise returns - present forecasts as facts - give personalized
financial instructions - fabricate market data

------------------------------------------------------------------------

## 8. Strategy Lab

### Strategy Builder

Rules are structured objects, not arbitrary executable code.

Supported initial indicators: - SMA - EMA - RSI - price - percentage
change - volume

Supported operators: - greater than - less than - crosses above -
crosses below - equals

Logical operators: - AND - OR

### Strategy templates

1.  Moving Average Crossover
2.  RSI
3.  Momentum
4.  Breakout

### Backtest

Input: - symbol/universe - timeframe - start date - end date - initial
capital - strategy rules

Output: - initial capital - final capital - total return - trade count -
winning trades - losing trades - win rate - max drawdown - profit
factor - equity curve - trade list - buy/sell markers

### Strategy comparison

Display metrics side-by-side.

Do not label a strategy "best". Let users interpret the historical
metrics.

### Buy & Hold

Calculate: - strategy return - buy-and-hold return - difference -
drawdown comparison

This is historical comparison, not future prediction.

------------------------------------------------------------------------

## 9. Non-Functional Requirements

### Reliability

-   provider failures must be handled
-   cached data may be shown with freshness information
-   never silently substitute fake market values

### Security

-   API keys only on backend
-   passwords hashed
-   input validation
-   rate limiting
-   secure headers
-   authorization checks
-   no sensitive data in client logs

### Performance

-   market data should be cached
-   charts should load progressively
-   API responses should be paginated
-   news should not block the main quote page

### Observability

Log: - provider failures - order creation/execution - alert triggers -
backtest failures - AI tool errors

Never log passwords or secrets.

------------------------------------------------------------------------

## 10. Data Freshness

Every market-data UI must expose: - data status: Live / Delayed / Market
Closed / Unavailable - last updated timestamp - provider timestamp when
available

If a provider is unavailable: 1. use the latest valid cached value if
permitted 2. clearly show when it was updated 3. otherwise show
unavailable 4. never generate a fake value

------------------------------------------------------------------------

## 11. Out of Scope

-   real-money trading
-   broker order execution
-   deposits/withdrawals
-   financial advisory service
-   institutional trading terminal
-   guaranteed prediction
-   fake "live" prices
-   uncontrolled AI-generated market claims

------------------------------------------------------------------------

## 12. Acceptance Criteria

The product is considered end-to-end when a new user can:

1.  Register/login.
2.  Receive a virtual cash balance.
3.  Search a real security.
4.  View current/most recent validated market data.
5.  View historical prices.
6.  Buy using a market order.
7.  Sell using a market order.
8.  Create a limit order.
9.  See the order reflected in order history.
10. See an active position.
11. See P&L update when price changes.
12. Add a security to a watchlist.
13. Read current financial news.
14. See Bullish/Neutral/Bearish sentiment.
15. Compare sentiment with price movement.
16. Create a stop-loss/target alert.
17. See the alert trigger from a validated price update.
18. View portfolio risk metrics.
19. Run a historical strategy backtest.
20. Review backtest metrics and chart.
21. Ask the AI Analyst a portfolio/market question and receive an answer
    grounded in retrieved StockPulse data.
