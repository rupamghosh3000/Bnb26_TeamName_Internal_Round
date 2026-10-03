import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  Wallet,
  Zap,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Flame,
  Shield,
  Layers,
  BookOpen,
  Bell,
  ArrowRight,
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
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Poll live market status
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

  // Close dropdown on route change
  useEffect(() => {
    setIsMoreOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for "More" dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Core navigation items kept permanently in the top bar
  const primaryNavLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Markets', path: '/markets' },
    { label: 'Trade', path: '/trade' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'AI Analyst', path: '/ai', isSpecial: true },
  ];

  // Secondary tools housed inside the "More Tools" dropdown
  const secondaryNavLinks = [
    {
      label: 'Market Pulse',
      path: '/pulse',
      description: 'Macro sentiment, live news & social chatter',
      icon: Flame,
      color: 'text-orange-500 bg-orange-50 border-orange-200/50',
    },
    {
      label: 'Risk Analytics',
      path: '/risk',
      description: 'VaR, beta, Sharpe ratio & stress testing',
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/50',
    },
    {
      label: 'Strategy Lab',
      path: '/strategies',
      description: 'Quantitative rules & algorithmic backtests',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/50',
    },
    {
      label: 'Trading Journal',
      path: '/journal',
      description: 'Trade logs, tags & emotional reflections',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200/50',
    },
    {
      label: 'Price Alerts',
      path: '/alerts',
      description: 'Threshold triggers & automated alerts',
      icon: Bell,
      color: 'text-amber-600 bg-amber-50 border-amber-200/50',
    },
  ];

  // Check if any secondary link is currently active
  const isMoreActive = secondaryNavLinks.some((link) => location.pathname.startsWith(link.path));
  const activeSecondaryItem = secondaryNavLinks.find((link) =>
    location.pathname.startsWith(link.path)
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
        <div className="max-w-7xl mx-auto glass-panel-elevated rounded-3xl px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-soft border border-white/60">
          {/* Brand Logo & Compact Status */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-brand-deep via-brand-primary to-brand-soft flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                  StockPulse
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-brand-soft mt-0.5">
                  Market Intel
                </span>
              </div>
            </Link>

            {/* Market Status Pill */}
            {marketStatus && (
              <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-[11px] font-semibold">
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

          {/* Center Navigation Links (visible on lg+ screens: 5 primary + 1 More dropdown) */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {primaryNavLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/30'
                        : 'text-slate-600 hover:text-brand-deep hover:bg-brand-glow/40'
                    }`}
                  >
                    {link.isSpecial && (
                      <Sparkles
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-white' : 'text-brand-primary animate-pulse'
                        }`}
                      />
                    )}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* "More Tools" Interactive Dropdown */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isMoreActive
                      ? 'bg-brand-deep text-white shadow-sm shadow-brand-deep/30'
                      : 'text-slate-600 hover:text-brand-deep hover:bg-brand-glow/40'
                  }`}
                  aria-expanded={isMoreOpen}
                >
                  <span>{activeSecondaryItem ? activeSecondaryItem.label : 'More'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isMoreOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Popover */}
                {isMoreOpen && (
                  <div className="absolute top-full left-0 mt-2.5 w-64 glass-panel-elevated rounded-2xl p-2 shadow-elevated border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100/60">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Advanced Analytics & Tools
                    </div>
                    <div className="py-1 space-y-0.5">
                      {secondaryNavLinks.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = location.pathname.startsWith(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMoreOpen(false)}
                            className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                              isCurrent
                                ? 'bg-brand-glow/60 text-brand-deep font-bold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg border shrink-0 ${item.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold flex items-center justify-between">
                                <span className={isCurrent ? 'text-brand-deep' : 'text-slate-900'}>
                                  {item.label}
                                </span>
                                {isCurrent && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Right Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
              title="Search stocks or tickers (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-brand-primary" />
              <span className="hidden xl:inline text-xs">Search...</span>
              <kbd className="hidden xl:inline-block text-[9px] font-mono px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-400">
                Ctrl+K
              </kbd>
            </button>

            {/* Currency Switcher Pill [ $ USD | ₹ INR ] */}
            <div
              className="flex items-center p-0.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-xs"
              title={`Live Forex Rate: 1 USD = ₹${rate.toFixed(2)} INR`}
            >
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                $ <span className="hidden sm:inline">USD</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-0.5 ${
                  currency === 'INR'
                    ? 'bg-gradient-to-r from-orange-500 to-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ₹ <span className="hidden sm:inline">INR</span>
              </button>
            </div>

            {user ? (
              <>
                {/* Virtual Cash Balance Pill (hidden on narrow screens to prevent crowding) */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-brand-glow/80 border border-brand-lavender/60">
                  <Wallet className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <div className="flex flex-col text-right leading-none">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Virtual Cash
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 font-mono mt-0.5">
                      {formatAmount(account ? account.cashBalance : 100000)}
                    </span>
                  </div>
                </div>

                {/* Quick Trade Button */}
                {onOpenQuickTrade && (
                  <button
                    onClick={onOpenQuickTrade}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
                    title="Open Quick Paper Trading Modal"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Trade</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Logout"
                  className="p-1.5 sm:p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth?mode=login"
                  className="px-3.5 py-1.5 text-xs font-bold text-brand-deep hover:bg-brand-glow/40 rounded-2xl transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold bg-brand-primary hover:bg-brand-deep text-white rounded-2xl shadow-md shadow-brand-primary/20 transition-all hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Start Trading</span>
                </Link>
              </div>
            )}

            {/* Mobile / Tablet Menu Hamburger Toggle */}
            {user && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Full Navigation Drawer */}
        {user && isMobileMenuOpen && (
          <div className="lg:hidden mt-2.5 max-w-7xl mx-auto glass-panel-elevated rounded-3xl p-4 shadow-elevated border border-slate-100 animate-in slide-in-from-top-3 duration-200 space-y-4">
            {/* User Cash Info Card on Mobile */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-glow/50 border border-brand-lavender/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Virtual Cash Balance
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">
                    {formatAmount(account ? account.cashBalance : 100000)}
                  </div>
                </div>
              </div>

              {onOpenQuickTrade && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenQuickTrade();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Trade</span>
                </button>
              )}
            </div>

            {/* Core Navigation Section */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Core Workspace
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {primaryNavLinks.map((link) => {
                  const isActive = location.pathname.startsWith(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'bg-white border border-slate-100 text-slate-700 hover:bg-brand-glow/40'
                      }`}
                    >
                      {link.isSpecial && <Sparkles className="w-3.5 h-3.5" />}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Advanced Tools Section */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Advanced Intelligence & Tools
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {secondaryNavLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-brand-primary text-white border-brand-primary font-bold'
                          : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : item.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
