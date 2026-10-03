import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  Wallet,
  Zap,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../services/api';
import { SearchModal } from './SearchModal';

export const Navbar: React.FC<{ onOpenQuickTrade?: () => void }> = ({ onOpenQuickTrade }) => {
  const { user, account, logout } = useAuth();
  const { currency, setCurrency, rate, formatAmount } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.markets.getStatus().then(setMarketStatus).catch(() => {});
    const interval = setInterval(() => {
      api.markets.getStatus().then(setMarketStatus).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Markets', path: '/markets' },
    { label: 'Trade', path: '/trade' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Risk', path: '/risk' },
    { label: 'Market Pulse', path: '/pulse' },
    { label: 'Strategy Lab', path: '/strategies' },
    { label: 'AI Analyst', path: '/ai' },
    { label: 'Journal', path: '/journal' },
    { label: 'Alerts', path: '/alerts' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto glass-panel-elevated rounded-3xl px-5 py-3 flex items-center justify-between shadow-soft">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-deep via-brand-primary to-brand-soft flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  StockPulse
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-soft">
                  Market Intelligence
                </span>
              </div>
            </Link>

            {/* Market Status Pill */}
            {marketStatus && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-xs font-semibold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    marketStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="text-slate-600">
                  {marketStatus.isOpen ? 'US Live' : 'Market Closed'}
                </span>
              </div>
            )}
          </div>

          {/* Center Navigation Links (when authenticated) */}
          {user && (
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/30'
                        : 'text-slate-600 hover:text-brand-deep hover:bg-brand-glow/40'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
            >
              <Search className="w-4 h-4 text-brand-primary" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-400">
                Ctrl+K
              </kbd>
            </button>

            {/* Currency Switcher Pill [ $ USD | ₹ INR ] */}
            <div
              className="flex items-center p-0.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-xs"
              title={`Live Forex Rate: 1 USD = ₹${rate.toFixed(2)} INR`}
            >
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                  currency === 'INR'
                    ? 'bg-gradient-to-r from-orange-500 to-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>₹ INR</span>
              </button>
            </div>

            {user ? (
              <>
                {/* Virtual Cash Balance Pill */}
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-brand-glow border border-brand-lavender/60">
                  <Wallet className="w-4 h-4 text-brand-primary" />
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Virtual Cash
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 font-mono">
                      {formatAmount(account ? account.cashBalance : 100000)}
                    </span>
                  </div>
                </div>

                {/* Quick Trade Button */}
                {onOpenQuickTrade && (
                  <button
                    onClick={onOpenQuickTrade}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Quick Trade</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Logout"
                  className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth?mode=login"
                  className="px-4 py-1.5 text-xs font-bold text-brand-deep hover:bg-brand-glow/40 rounded-2xl transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-brand-primary hover:bg-brand-deep text-white rounded-2xl shadow-md shadow-brand-primary/20 transition-all hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Paper Trading</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {user && isMobileMenuOpen && (
          <div className="xl:hidden mt-2 max-w-7xl mx-auto glass-panel-elevated rounded-3xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 shadow-elevated animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-center ${
                  location.pathname.startsWith(link.path)
                    ? 'bg-brand-primary text-white'
                    : 'text-slate-700 hover:bg-brand-glow/40'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
