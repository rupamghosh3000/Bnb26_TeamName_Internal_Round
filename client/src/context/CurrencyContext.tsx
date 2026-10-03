import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export type SupportedCurrency = 'USD' | 'INR';

export interface CurrencyFormatOptions {
  decimals?: number;
  compact?: boolean;
  fromCurrency?: 'USD' | 'INR';
  symbol?: string;
}

export function isIndianAsset(symbol?: string, currency?: string): boolean {
  if (currency === 'INR') return true;
  if (!symbol) return false;
  const s = symbol.trim().toUpperCase();
  return (
    s.endsWith('.NS') ||
    s.endsWith('.BO') ||
    s.startsWith('^NSE') ||
    s.startsWith('^BSE') ||
    s.includes('NIFTY') ||
    s.includes('SENSEX') ||
    s === 'INR'
  );
}

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  toggleCurrency: () => void;
  rate: number;
  rateChange: number;
  loadingRate: boolean;
  symbol: string;
  isIndianAsset: (symbol?: string, currency?: string) => boolean;
  formatAmount: (amountInUSD: number | undefined | null, options?: CurrencyFormatOptions) => string;
  formatStockPrice: (price: number | undefined | null, symbol?: string, assetCurrency?: string, options?: CurrencyFormatOptions) => string;
  convertStockPrice: (price: number, symbol?: string, assetCurrency?: string) => number;
  convert: (amount: number, fromCurrency?: 'USD' | 'INR') => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    const saved = localStorage.getItem('stockpulse_currency');
    return saved === 'INR' ? 'INR' : 'USD';
  });

  const [rate, setRate] = useState<number>(84.5);
  const [rateChange, setRateChange] = useState<number>(0);
  const [loadingRate, setLoadingRate] = useState<boolean>(true);

  const fetchRate = useCallback(async () => {
    try {
      const data = await api.markets.getForexRate();
      if (data && data.rate > 0) {
        setRate(data.rate);
        setRateChange(data.changePercent || 0);
      }
    } catch {
      // Keep fallback
    } finally {
      setLoadingRate(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 120000); // refresh every 2 mins
    return () => clearInterval(interval);
  }, [fetchRate]);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem('stockpulse_currency', c);
  };

  const toggleCurrency = () => {
    const next = currency === 'USD' ? 'INR' : 'USD';
    setCurrency(next);
  };

  const convert = (amount: number, fromCurrency: 'USD' | 'INR' = 'USD'): number => {
    if (isNaN(amount)) return 0;
    if (fromCurrency === 'USD') {
      return currency === 'INR' ? amount * rate : amount;
    } else {
      // fromCurrency === 'INR'
      return currency === 'USD' ? (rate > 0 ? amount / rate : amount) : amount;
    }
  };

  const convertStockPrice = (price: number, stockSymbol?: string, assetCurrency?: string): number => {
    if (isNaN(price)) return 0;
    const isIndian = isIndianAsset(stockSymbol, assetCurrency);
    if (isIndian) {
      // Raw price is in INR
      return currency === 'USD' ? (rate > 0 ? price / rate : price) : price;
    } else {
      // Raw price is in USD
      return currency === 'INR' ? price * rate : price;
    }
  };

  const formatNumber = (
    num: number,
    targetCurrency: SupportedCurrency,
    decimals: number = 2,
    compact: boolean = false
  ): string => {
    const isNegative = num < 0;
    const absVal = Math.abs(num);

    if (targetCurrency === 'INR') {
      if (compact) {
        if (absVal >= 10000000) {
          return `${isNegative ? '-' : ''}₹${(absVal / 10000000).toFixed(decimals)} Cr`;
        } else if (absVal >= 100000) {
          return `${isNegative ? '-' : ''}₹${(absVal / 100000).toFixed(decimals)} L`;
        } else if (absVal >= 1000) {
          return `${isNegative ? '-' : ''}₹${(absVal / 1000).toFixed(decimals)}K`;
        }
      }
      return `${isNegative ? '-' : ''}₹${absVal.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    }

    // USD
    if (compact) {
      if (absVal >= 1000000000) {
        return `${isNegative ? '-' : ''}$${(absVal / 1000000000).toFixed(decimals)}B`;
      } else if (absVal >= 1000000) {
        return `${isNegative ? '-' : ''}$${(absVal / 1000000).toFixed(decimals)}M`;
      } else if (absVal >= 1000) {
        return `${isNegative ? '-' : ''}$${(absVal / 1000).toFixed(decimals)}K`;
      }
    }
    return `${isNegative ? '-' : ''}$${absVal.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const formatStockPrice = (
    price: number | undefined | null,
    stockSymbol?: string,
    assetCurrency?: string,
    options?: CurrencyFormatOptions
  ): string => {
    if (price == null || isNaN(price)) {
      return currency === 'INR' ? '₹0.00' : '$0.00';
    }

    const decimals = options?.decimals ?? 2;
    const compact = options?.compact ?? false;
    const converted = convertStockPrice(price, stockSymbol, assetCurrency);
    return formatNumber(converted, currency, decimals, compact);
  };

  const formatAmount = (
    amount: number | undefined | null,
    options?: CurrencyFormatOptions
  ): string => {
    if (amount == null || isNaN(amount)) {
      return currency === 'INR' ? '₹0.00' : '$0.00';
    }

    const decimals = options?.decimals ?? 2;
    const compact = options?.compact ?? false;

    // Check if options explicitly passed symbol or fromCurrency
    if (options?.symbol || options?.fromCurrency) {
      const isIndian = options.fromCurrency === 'INR' || isIndianAsset(options.symbol);
      const converted = isIndian
        ? (currency === 'USD' ? (rate > 0 ? amount / rate : amount) : amount)
        : (currency === 'INR' ? amount * rate : amount);
      return formatNumber(converted, currency, decimals, compact);
    }

    // Default: Input amount is in USD base (e.g. portfolio equity, cash balance, P&L)
    const converted = currency === 'INR' ? amount * rate : amount;
    return formatNumber(converted, currency, decimals, compact);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        rate,
        rateChange,
        loadingRate,
        symbol: currency === 'INR' ? '₹' : '$',
        isIndianAsset,
        formatAmount,
        formatStockPrice,
        convertStockPrice,
        convert,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
