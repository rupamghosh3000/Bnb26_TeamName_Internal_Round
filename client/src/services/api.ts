const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('stockpulse_token');
  }

  setToken(token: string) {
    localStorage.setItem('stockpulse_token', token);
  }

  clearToken() {
    localStorage.removeItem('stockpulse_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      this.clearToken();
      window.dispatchEvent(new Event('stockpulse_auth_expired'));
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  // Auth
  auth = {
    login: (credentials: any) => this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data: any) => this.request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => {
      this.clearToken();
      return Promise.resolve({ success: true });
    },
    me: () => this.request<any>('/auth/me'),
  };

  // Markets
  markets = {
    search: (query: string) => this.request<any[]>(`/markets/search?q=${encodeURIComponent(query)}`),
    getQuote: (symbol: string) => this.request<any>(`/markets/${encodeURIComponent(symbol)}/quote`),
    getHistory: (symbol: string, range: string = '1mo', interval: string = '1d') =>
      this.request<any[]>(`/markets/${encodeURIComponent(symbol)}/history?range=${range}&interval=${interval}`),
    getNews: (symbol?: string, limit: number = 10) =>
      this.request<any[]>(symbol ? `/markets/${encodeURIComponent(symbol)}/news?limit=${limit}` : `/markets/AAPL/news?limit=${limit}`),
    getSentiment: (symbol: string) => this.request<any>(`/markets/${encodeURIComponent(symbol)}/sentiment`),
    getStatus: () => this.request<any>('/markets/status'),
    getOverview: () => this.request<any>('/markets/overview'),
  };

  // Trading & Orders
  orders = {
    place: (order: { symbol: string; side: 'BUY' | 'SELL'; type: 'MARKET' | 'LIMIT'; quantity: number; limitPrice?: number }) =>
      this.request<any>('/orders', { method: 'POST', body: JSON.stringify(order) }),
    getAll: (limit: number = 50, skip: number = 0) => this.request<any>(`/orders?limit=${limit}&skip=${skip}`),
    cancel: (id: string) => this.request<any>(`/orders/${id}/cancel`, { method: 'POST' }),
  };

  // Trades
  trades = {
    getAll: (limit: number = 50, skip: number = 0) => this.request<any>(`/trades?limit=${limit}&skip=${skip}`),
  };

  // Portfolio
  portfolio = {
    getSummary: () => this.request<any>('/portfolio'),
    getPositions: () => this.request<any[]>('/portfolio/positions'),
    getPerformance: () => this.request<any[]>('/portfolio/performance'),
    getRisk: () => this.request<any>('/portfolio/risk'),
    stressTest: (percentage: number) => this.request<any>('/portfolio/stress-test', { method: 'POST', body: JSON.stringify({ percentage }) }),
  };

  // Watchlists
  watchlists = {
    get: () => this.request<any>('/watchlists'),
    create: (name: string) => this.request<any>('/watchlists', { method: 'POST', body: JSON.stringify({ name }) }),
    addSymbol: (watchlistId: string, symbol: string) =>
      this.request<any>(`/watchlists/${watchlistId}/symbols`, { method: 'POST', body: JSON.stringify({ symbol }) }),
    removeSymbol: (watchlistId: string, symbol: string) =>
      this.request<any>(`/watchlists/${watchlistId}/symbols/${encodeURIComponent(symbol)}`, { method: 'DELETE' }),
    delete: (watchlistId: string) => this.request<any>(`/watchlists/${watchlistId}`, { method: 'DELETE' }),
  };

  // Alerts
  alerts = {
    getAll: () => this.request<any[]>('/alerts'),
    create: (alert: { symbol: string; type: 'STOP_LOSS' | 'TARGET' | 'PRICE'; targetPrice: number; direction?: 'ABOVE' | 'BELOW' }) =>
      this.request<any>('/alerts', { method: 'POST', body: JSON.stringify(alert) }),
    cancel: (id: string) => this.request<any>(`/alerts/${id}/cancel`, { method: 'POST' }),
  };

  // Strategy Lab
  strategies = {
    getAll: () => this.request<any[]>('/strategies'),
    create: (strategy: any) => this.request<any>('/strategies', { method: 'POST', body: JSON.stringify(strategy) }),
    runBacktest: (data: { symbol: string; strategyType: string; params?: any; range?: string; initialCapital?: number }) =>
      this.request<any>('/strategies/backtest/run', { method: 'POST', body: JSON.stringify(data) }),
    getBacktest: (id: string) => this.request<any>(`/strategies/backtests/${id}`),
    getUserBacktests: () => this.request<any[]>('/strategies/backtests'),
  };

  // Trade Journal
  journal = {
    getAll: () => this.request<any[]>('/journal'),
    create: (entry: any) => this.request<any>('/journal', { method: 'POST', body: JSON.stringify(entry) }),
    delete: (id: string) => this.request<any>(`/journal/${id}`, { method: 'DELETE' }),
  };

  // AI Intelligence
  ai = {
    query: (message: string) => this.request<any>('/ai/query', { method: 'POST', body: JSON.stringify({ message }) }),
    getMarketBrief: () => this.request<any>('/ai/market/brief', { method: 'POST' }),
    whyMove: (symbol: string) => this.request<any>(`/ai/stock/${encodeURIComponent(symbol)}/why-move`, { method: 'POST' }),
    explainStock: (symbol: string) => this.request<any>(`/ai/stock/${encodeURIComponent(symbol)}/explain`, { method: 'POST' }),
    analyzePortfolio: () => this.request<any>('/ai/portfolio/analyze', { method: 'POST' }),
    reviewTrade: (tradeId: string) => this.request<any>(`/ai/trade/${tradeId}/review`, { method: 'POST' }),
    analyzeStrategy: (backtestId: string) => this.request<any>(`/ai/strategy/${backtestId}/analyze`, { method: 'POST' }),
  };
}

export const api = new ApiClient();
