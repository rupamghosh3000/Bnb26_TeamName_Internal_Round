import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { runBacktest, calculateSMA, calculateRSI } from '../services/backtestEngine.js';
import { analyzeTextSentiment } from '../providers/yahooMarketDataProvider.js';
import { HistoricalBar } from '../providers/interfaces.js';

test('1. Technical Indicators & Sentiment Analysis', async (t) => {
  await t.test('calculateSMA returns correct rolling average', () => {
    const data = [10, 20, 30, 40, 50];
    const sma3 = calculateSMA(data, 3);
    assert.equal(sma3[0], null);
    assert.equal(sma3[1], null);
    assert.equal(sma3[2], 20); // (10+20+30)/3
    assert.equal(sma3[3], 30); // (20+30+40)/3
    assert.equal(sma3[4], 40); // (30+40+50)/3
  });

  await t.test('calculateRSI returns values bounded between 0 and 100', () => {
    const prices = [100, 102, 104, 103, 105, 107, 110, 108, 107, 109, 112, 115, 114, 116, 118, 120];
    const rsi = calculateRSI(prices, 14);
    const lastRsi = rsi[rsi.length - 1];
    assert.ok(lastRsi !== null && lastRsi !== undefined);
    assert.ok(lastRsi !== null && lastRsi >= 0 && lastRsi <= 100);
  });

  await t.test('analyzeTextSentiment classifies financial headlines deterministically', () => {
    const bullish = analyzeTextSentiment('Apple surges after revenue beats forecasts and strong profit growth');
    assert.equal(bullish.sentiment, 'BULLISH');
    assert.ok(bullish.score > 0);

    const bearish = analyzeTextSentiment('Tesla stock drops as deliveries decline amid recession warnings');
    assert.equal(bearish.sentiment, 'BEARISH');
    assert.ok(bearish.score < 0);

    const neutral = analyzeTextSentiment('Federal Reserve scheduled to hold standard policy meeting on Tuesday');
    assert.equal(neutral.sentiment, 'NEUTRAL');
    assert.equal(neutral.score, 0);
  });
});

test('2. Deterministic Historical Backtesting Engine', async (t) => {
  await t.test('Simulates strategy execution and calculates equity curve', () => {
    // Generate 30 sample historical bars
    const sampleBars: HistoricalBar[] = [];
    let price = 100;
    const baseDate = new Date('2025-01-01');

    for (let i = 0; i < 35; i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      price += (i % 4 === 0 ? 3 : -1); // Upward trending with oscillation
      sampleBars.push({
        timestamp: d.getTime(),
        date: d.toISOString(),
        open: price - 0.5,
        high: price + 1,
        low: price - 1,
        close: price,
        volume: 1000000,
      });
    }

    const result = runBacktest({
      symbol: 'TEST_STOCK',
      strategyType: 'MA_CROSSOVER',
      params: { fastPeriod: 5, slowPeriod: 15 },
      initialCapital: 100000,
      bars: sampleBars,
    });

    assert.equal(result.symbol, 'TEST_STOCK');
    assert.equal(result.initialCapital, 100000);
    assert.ok(typeof result.finalCapital === 'number');
    assert.ok(typeof result.totalReturn === 'number');
    assert.ok(typeof result.benchmarkReturn === 'number');
    assert.ok(result.equityCurve.length === sampleBars.length);
    assert.ok(typeof result.maxDrawdown === 'number');
    assert.ok(result.maxDrawdown >= 0);
  });
});
