import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export type SupportedCurrency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  toggleCurrency: () => void;
  rate: number;
  rateChange: number;
  loadingRate: boolean;
  symbol: string;
  formatAmount: (amountInUSD: number | undefined | null, options?: { decimals?: number; compact?: boolean }) => string;
  convert: (amountInUSD: number) => number;
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
      // Fallback rate is kept
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

  const convert = (amountInUSD: number): number => {
    if (isNaN(amountInUSD)) return 0;
    return currency === 'INR' ? amountInUSD * rate : amountInUSD;
  };

  const formatAmount = (
    amountInUSD: number | undefined | null,
    options?: { decimals?: number; compact?: boolean }
  ): string => {
    if (amountInUSD == null || isNaN(amountInUSD)) {
      return currency === 'INR' ? '₹0.00' : '$0.00';
    }

    const decimals = options?.decimals ?? 2;
    const compact = options?.compact ?? false;

    if (currency === 'INR') {
      const inrVal = amountInUSD * rate;
      if (compact) {
        const absVal = Math.abs(inrVal);
        if (absVal >= 10000000) {
          // Crores (Cr)
          return `₹${(inrVal / 10000000).toFixed(decimals)} Cr`;
        } else if (absVal >= 100000) {
          // Lakhs (L)
          return `₹${(inrVal / 100000).toFixed(decimals)} L`;
        }
      }
      return `₹${inrVal.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    }

    // USD
    if (compact) {
      const absVal = Math.abs(amountInUSD);
      if (absVal >= 1000000000) {
        return `$${(amountInUSD / 1000000000).toFixed(decimals)}B`;
      } else if (absVal >= 1000000) {
        return `$${(amountInUSD / 1000000).toFixed(decimals)}M`;
      } else if (absVal >= 1000) {
        return `$${(amountInUSD / 1000).toFixed(decimals)}K`;
      }
    }

    return `$${amountInUSD.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
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
        formatAmount,
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
