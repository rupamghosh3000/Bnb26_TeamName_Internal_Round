# StockPulse

StockPulse is a full-stack paper-trading and market-intelligence
platform built for PS-1: Paper Trading & Market Sentiment Analytics
Platform.

## Product

**Real Market Data + Paper Trading + AI Market Intelligence + Strategy
Lab + Risk Analytics**

StockPulse uses real market information and virtual money.

## Main modules

-   Dashboard
-   Markets
-   Watchlist
-   Paper Trading
-   Portfolio
-   Risk
-   Market Pulse
-   Strategy Lab
-   AI Analyst
-   Trade Journal
-   Alerts
-   Settings

## Documentation

-   `prd.md` --- product requirements
-   `CLAUDE.md` --- AI coding-agent rules
-   `architecture.md` --- system architecture
-   `techstack.md` --- technology choices
-   `data.md` --- database models
-   `api.md` --- API contract
-   `design.md` --- UI/UX system
-   `implementation_plan.md` --- implementation sequence
-   `.env.example` --- environment variables

## Core principle

Never fabricate market data.

If a provider is unavailable, show cached data with its timestamp when
valid, otherwise show an unavailable state.

## Local development

Prerequisites: - Node.js - MongoDB - Redis - configured market-data
provider - configured news/sentiment provider - configured AI provider

Install:

``` bash
npm install
```

Create environment file:

``` bash
cp .env.example .env
```

Start development services according to the package scripts.

## Production boundary

This application is a paper-trading educational platform.

It does not execute real-money trades and should not be represented as a
brokerage.
