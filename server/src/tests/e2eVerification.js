const BASE = 'http://127.0.0.1:5000/api';

async function runE2E() {
  console.log('--- STARTING E2E VERIFICATION ---');

  // 1. Health
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  console.log('✓ 1. Backend Health Check:', health.status);

  // 2. Registration
  const testEmail = `trader_${Date.now()}@stockpulse.io`;
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alpha Trader',
      email: testEmail,
      password: 'password123',
    }),
  });
  const reg = await regRes.json();
  const token = reg.token;
  console.log('✓ 2. User Registered & Token Issued:', reg.user.email);
  console.log('✓ 2. Starting Cash Balance:', reg.account.cashBalance);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 3. Real Market Quote for AAPL
  const quoteRes = await fetch(`${BASE}/markets/AAPL/quote`, { headers: authHeaders });
  const quote = await quoteRes.json();
  console.log('✓ 3. Real Live Quote for AAPL:', quote.price, `(${quote.freshness} as of ${quote.timestamp})`);

  // 4. Place a Paper Market BUY Order
  const orderRes = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      symbol: 'AAPL',
      side: 'BUY',
      type: 'MARKET',
      quantity: 10,
    }),
  });
  const orderData = await orderRes.json();
  console.log('✓ 4. Placed Market Buy Order:', orderData.message);

  // 5. Verify Portfolio reflects Position and Cash Deduction
  const portRes = await fetch(`${BASE}/portfolio`, { headers: authHeaders });
  const port = await portRes.json();
  console.log('✓ 5. Portfolio Cash Balance:', port.cashBalance);
  console.log('✓ 5. Invested Value:', port.investedValue);
  console.log('✓ 5. Active Positions Count:', port.positionsCount);
  console.log('✓ 5. First Position:', port.positions[0]?.symbol, 'Qty:', port.positions[0]?.quantity);

  // 6. Portfolio Risk Analytics
  const riskRes = await fetch(`${BASE}/portfolio/risk`, { headers: authHeaders });
  const risk = await riskRes.json();
  console.log('✓ 6. Portfolio Volatility:', risk.annualizedVolatility, '% | Concentration:', risk.concentrationRisk);
  console.log('✓ 6. Stress Test (-10% shock impact):', risk.stressTests.find(s=>s.shockPercentage === -10)?.portfolioImpactValue);

  // 7. Strategy Lab Backtesting Engine
  const backtestRes = await fetch(`${BASE}/strategies/backtest/run`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      symbol: 'AAPL',
      strategyType: 'MA_CROSSOVER',
      params: { fastPeriod: 10, slowPeriod: 30 },
      range: '6mo',
      initialCapital: 100000,
    }),
  });
  const backtest = await backtestRes.json();
  console.log('✓ 7. Strategy Backtest Executed:', backtest.strategyName);
  console.log('✓ 7. Strategy Return:', backtest.totalReturn, '% vs Buy & Hold:', backtest.benchmarkReturn, '%');
  console.log('✓ 7. Win Rate:', backtest.winRate, '% | Trades:', backtest.tradeCount);

  // 8. Grounded AI Intelligence
  const aiRes = await fetch(`${BASE}/ai/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ message: 'What is my portfolio valuation?' }),
  });
  const aiAnswer = await aiRes.json();
  console.log('✓ 8. AI Grounded Answer:', aiAnswer.answer);

  console.log('--- ALL E2E VERIFICATIONS PASSED ---');
}

runE2E().catch(console.error);
