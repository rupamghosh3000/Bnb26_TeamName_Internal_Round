import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Navbar } from './components/common/Navbar';
import { QuickTradeModal } from './components/common/QuickTradeModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { CryptoPage } from './pages/CryptoPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { TradePage } from './pages/TradePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { RiskPage } from './pages/RiskPage';
import { MarketPulsePage } from './pages/MarketPulsePage';
import { StrategyLabPage } from './pages/StrategyLabPage';
import { AIAnalystPage } from './pages/AIAnalystPage';
import { JournalPage } from './pages/JournalPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }
  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  const [quickTradeOpen, setQuickTradeOpen] = useState(false);
  const [quickTradeSymbol, setQuickTradeSymbol] = useState('AAPL');
  const [quickTradeSide, setQuickTradeSide] = useState<'BUY' | 'SELL'>('BUY');

  const openQuickTrade = (symbol: string = 'AAPL', side: 'BUY' | 'SELL' = 'BUY') => {
    setQuickTradeSymbol(symbol);
    setQuickTradeSide(side);
    setQuickTradeOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenQuickTrade={() => openQuickTrade('AAPL', 'BUY')} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Core Authenticated Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage onOpenQuickTrade={openQuickTrade} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/markets"
            element={<MarketsPage onOpenQuickTrade={openQuickTrade} />}
          />
          <Route
            path="/crypto"
            element={<CryptoPage onOpenQuickTrade={openQuickTrade} />}
          />
          <Route
            path="/markets/:symbol"
            element={<StockDetailPage onOpenQuickTrade={openQuickTrade} />}
          />
          <Route
            path="/trade"
            element={
              <ProtectedRoute>
                <TradePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <PortfolioPage onOpenQuickTrade={openQuickTrade} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk"
            element={
              <ProtectedRoute>
                <RiskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pulse"
            element={<MarketPulsePage onOpenQuickTrade={openQuickTrade} />}
          />
          <Route
            path="/strategies"
            element={
              <ProtectedRoute>
                <StrategyLabPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIAnalystPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <JournalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Quick Trade Floating Modal */}
      <QuickTradeModal
        isOpen={quickTradeOpen}
        onClose={() => setQuickTradeOpen(false)}
        defaultSymbol={quickTradeSymbol}
        defaultSide={quickTradeSide}
      />

      {/* Global Grounded AI Assistant Drawer */}
      <AIAssistantDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <MainLayout />
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default App;
