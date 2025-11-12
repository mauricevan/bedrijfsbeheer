import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Quote, Invoice } from '../types';
import { MOCK_QUOTES, MOCK_INVOICES } from '../data/mockData';

interface QuoteContextType {
  quotes: Quote[];
  invoices: Invoice[];
  setQuotes: (quotes: Quote[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  const addQuote = useCallback((quote: Quote) => {
    setQuotes(prev => [...prev, quote]);
  }, []);

  const updateQuote = useCallback((id: string, updates: Partial<Quote>) => {
    setQuotes(prev => prev.map(quote =>
      quote.id === id ? { ...quote, ...updates } : quote
    ));
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setQuotes(prev => prev.filter(quote => quote.id !== id));
  }, []);

  const addInvoice = useCallback((invoice: Invoice) => {
    setInvoices(prev => [...prev, invoice]);
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(invoice =>
      invoice.id === id ? { ...invoice, ...updates } : invoice
    ));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  }, []);

  const value = {
    quotes,
    invoices,
    setQuotes,
    setInvoices,
    addQuote,
    updateQuote,
    deleteQuote,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  };

  return (
    <QuoteContext.Provider value={value}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote must be used within QuoteProvider');
  }
  return context;
};
