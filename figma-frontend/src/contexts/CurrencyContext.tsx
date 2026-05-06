import React, { createContext, useContext, useState } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', exchangeRate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 0.00040 },
  { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.00037 },
  { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.00032 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', exchangeRate: 0.052 },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', exchangeRate: 1.49 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number) => string;
  convertPrice: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

  const convertPrice = (amount: number): number => {
    return amount * currency.exchangeRate;
  };

  const formatPrice = (amount: number): string => {
    const converted = convertPrice(amount);
    return `${currency.symbol} ${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatPrice,
      convertPrice,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
