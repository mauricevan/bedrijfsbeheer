import { renderHook } from '@testing-library/react';
import { useAccountingDashboard } from '../useAccountingDashboard';
import {
  mockQuote,
  mockInvoice,
  mockTransaction,
  mockCustomer,
} from '../../services/__tests__/testHelpers';
import type { Quote, Invoice, Transaction, Customer } from '../../../../types';

// Mock calculations
jest.mock('../../utils/calculations', () => ({
  calculateTransactionStats: jest.fn((transactions: Transaction[]) => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
    };
  }),
  calculateInvoiceStats: jest.fn((invoices: Invoice[]) => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const outstandingInvoices = invoices.filter(
      (inv) => inv.status === 'sent' || inv.status === 'draft'
    );
    const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);
    return {
      totalInvoiced,
      totalPaid,
      totalOverdue,
      totalOutstanding,
      paidInvoices,
      overdueInvoices,
      outstandingInvoices,
    };
  }),
  calculateQuoteStats: jest.fn((quotes: Quote[]) => {
    const totalQuoted = quotes.reduce((sum, q) => sum + q.total, 0);
    const approvedQuotes = quotes.filter((q) => q.status === 'approved');
    const totalApproved = approvedQuotes.reduce((sum, q) => sum + q.total, 0);
    const sentQuotes = quotes.filter((q) => q.status === 'sent');
    const totalSent = sentQuotes.reduce((sum, q) => sum + q.total, 0);
    const expiredQuotes = quotes.filter((q) => q.status === 'expired');
    const totalExpired = expiredQuotes.reduce((sum, q) => sum + q.total, 0);
    return {
      totalQuoted,
      totalApproved,
      totalSent,
      totalExpired,
      approvedQuotes,
      sentQuotes,
      expiredQuotes,
    };
  }),
  calculateAveragePaymentDays: jest.fn(() => 14),
}));

describe('useAccountingDashboard', () => {
  const mockInvoices: Invoice[] = [
    { ...mockInvoice, id: 'inv1', status: 'paid', total: 1000 },
    { ...mockInvoice, id: 'inv2', status: 'sent', total: 500 },
    { ...mockInvoice, id: 'inv3', status: 'overdue', total: 300 },
  ];

  const mockQuotes: Quote[] = [
    { ...mockQuote, id: 'Q1', status: 'approved', total: 2000 },
    { ...mockQuote, id: 'Q2', status: 'sent', total: 1500 },
    { ...mockQuote, id: 'Q3', status: 'expired', total: 800 },
  ];

  const mockTransactions: Transaction[] = [
    { ...mockTransaction, id: 'trans1', type: 'income', amount: 1000 },
    { ...mockTransaction, id: 'trans2', type: 'expense', amount: -500 },
  ];

  const mockCustomers: Customer[] = [mockCustomer];

  it('should calculate transaction statistics', () => {
    const { result } = renderHook(() =>
      useAccountingDashboard(mockInvoices, mockQuotes, mockTransactions, mockCustomers)
    );

    expect(result.current.transactionStats).toBeDefined();
    expect(result.current.transactionStats.totalIncome).toBe(1000);
    expect(result.current.transactionStats.totalExpense).toBe(500);
    expect(result.current.transactionStats.netProfit).toBe(500);
  });

  it('should calculate invoice statistics', () => {
    const { result } = renderHook(() =>
      useAccountingDashboard(mockInvoices, mockQuotes, mockTransactions, mockCustomers)
    );

    expect(result.current.invoiceStats).toBeDefined();
    expect(result.current.invoiceStats.totalInvoiced).toBe(1800);
    expect(result.current.invoiceStats.totalPaid).toBe(1000);
    expect(result.current.invoiceStats.totalOverdue).toBe(300);
    expect(result.current.invoiceStats.totalOutstanding).toBe(500);
  });

  it('should calculate quote statistics', () => {
    const { result } = renderHook(() =>
      useAccountingDashboard(mockInvoices, mockQuotes, mockTransactions, mockCustomers)
    );

    expect(result.current.quoteStats).toBeDefined();
    expect(result.current.quoteStats.totalQuoted).toBe(4300);
    expect(result.current.quoteStats.totalApproved).toBe(2000);
    expect(result.current.quoteStats.totalSent).toBe(1500);
    expect(result.current.quoteStats.totalExpired).toBe(800);
  });

  it('should handle empty arrays', () => {
    const { result } = renderHook(() =>
      useAccountingDashboard([], [], [], [])
    );

    expect(result.current.transactionStats.totalIncome).toBe(0);
    expect(result.current.transactionStats.totalExpense).toBe(0);
    expect(result.current.invoiceStats.totalInvoiced).toBe(0);
    expect(result.current.quoteStats.totalQuoted).toBe(0);
  });

  it('should recalculate when data changes', () => {
    const { result, rerender } = renderHook(
      ({ invoices, quotes, transactions, customers }) =>
        useAccountingDashboard(invoices, quotes, transactions, customers),
      {
        initialProps: {
          invoices: mockInvoices,
          quotes: mockQuotes,
          transactions: mockTransactions,
          customers: mockCustomers,
        },
      }
    );

    const initialTotal = result.current.invoiceStats.totalInvoiced;

    const newInvoices = [
      ...mockInvoices,
      { ...mockInvoice, id: 'inv4', status: 'draft', total: 200 },
    ];

    rerender({
      invoices: newInvoices,
      quotes: mockQuotes,
      transactions: mockTransactions,
      customers: mockCustomers,
    });

    expect(result.current.invoiceStats.totalInvoiced).toBe(initialTotal + 200);
  });
});



