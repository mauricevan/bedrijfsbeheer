import {
  groupTransactionsByMonth,
  groupTransactionsByType,
  sortTransactionsByDateDesc,
  sortTransactionsByDateAsc,
  sortTransactionsByAmountDesc,
  sortTransactionsByAmountAsc,
  getTransactionsByDateRange,
  getTransactionsByMonth,
  getTransactionsByYear,
} from '../transactionService';
import type { Transaction } from '../../../../types';

const mockTransactions: Transaction[] = [
  {
    id: 'trans1',
    date: '2024-01-15',
    type: 'income',
    amount: 1000,
    description: 'Income 1',
    category: 'sales',
  },
  {
    id: 'trans2',
    date: '2024-01-20',
    type: 'expense',
    amount: -500,
    description: 'Expense 1',
    category: 'supplies',
  },
  {
    id: 'trans3',
    date: '2024-02-10',
    type: 'income',
    amount: 2000,
    description: 'Income 2',
    category: 'sales',
  },
  {
    id: 'trans4',
    date: '2024-02-25',
    type: 'expense',
    amount: -300,
    description: 'Expense 2',
    category: 'utilities',
  },
  {
    id: 'trans5',
    date: '2024-03-05',
    type: 'income',
    amount: 1500,
    description: 'Income 3',
    category: 'services',
  },
];

describe('transactionService', () => {
  describe('groupTransactionsByMonth', () => {
    it('should group transactions by month', () => {
      const grouped = groupTransactionsByMonth(mockTransactions);

      expect(grouped['2024-01']).toHaveLength(2);
      expect(grouped['2024-02']).toHaveLength(2);
      expect(grouped['2024-03']).toHaveLength(1);
      expect(grouped['2024-01'][0].id).toBe('trans1');
      expect(grouped['2024-01'][1].id).toBe('trans2');
    });

    it('should return empty object for empty array', () => {
      const grouped = groupTransactionsByMonth([]);
      expect(Object.keys(grouped)).toHaveLength(0);
    });
  });

  describe('groupTransactionsByType', () => {
    it('should group transactions by type', () => {
      const grouped = groupTransactionsByType(mockTransactions);

      expect(grouped.income).toHaveLength(3);
      expect(grouped.expense).toHaveLength(2);
      expect(grouped.income.every((t) => t.type === 'income')).toBe(true);
      expect(grouped.expense.every((t) => t.type === 'expense')).toBe(true);
    });

    it('should return empty arrays for empty input', () => {
      const grouped = groupTransactionsByType([]);
      expect(grouped.income).toHaveLength(0);
      expect(grouped.expense).toHaveLength(0);
    });
  });

  describe('sortTransactionsByDateDesc', () => {
    it('should sort transactions by date descending (newest first)', () => {
      const sorted = sortTransactionsByDateDesc(mockTransactions);

      expect(sorted[0].date).toBe('2024-03-05');
      expect(sorted[1].date).toBe('2024-02-25');
      expect(sorted[2].date).toBe('2024-02-10');
      expect(sorted[3].date).toBe('2024-01-20');
      expect(sorted[4].date).toBe('2024-01-15');
    });

    it('should not mutate original array', () => {
      const original = [...mockTransactions];
      sortTransactionsByDateDesc(mockTransactions);
      expect(mockTransactions).toEqual(original);
    });
  });

  describe('sortTransactionsByDateAsc', () => {
    it('should sort transactions by date ascending (oldest first)', () => {
      const sorted = sortTransactionsByDateAsc(mockTransactions);

      expect(sorted[0].date).toBe('2024-01-15');
      expect(sorted[1].date).toBe('2024-01-20');
      expect(sorted[2].date).toBe('2024-02-10');
      expect(sorted[3].date).toBe('2024-02-25');
      expect(sorted[4].date).toBe('2024-03-05');
    });
  });

  describe('sortTransactionsByAmountDesc', () => {
    it('should sort transactions by amount descending (highest first)', () => {
      const sorted = sortTransactionsByAmountDesc(mockTransactions);

      expect(Math.abs(sorted[0].amount)).toBeGreaterThanOrEqual(Math.abs(sorted[1].amount));
      expect(Math.abs(sorted[1].amount)).toBeGreaterThanOrEqual(Math.abs(sorted[2].amount));
    });

    it('should handle negative amounts correctly', () => {
      const sorted = sortTransactionsByAmountDesc(mockTransactions);
      // Should sort by absolute value
      expect(Math.abs(sorted[0].amount)).toBe(2000);
    });
  });

  describe('sortTransactionsByAmountAsc', () => {
    it('should sort transactions by amount ascending (lowest first)', () => {
      const sorted = sortTransactionsByAmountAsc(mockTransactions);

      expect(Math.abs(sorted[0].amount)).toBeLessThanOrEqual(Math.abs(sorted[1].amount));
      expect(Math.abs(sorted[1].amount)).toBeLessThanOrEqual(Math.abs(sorted[2].amount));
    });
  });

  describe('getTransactionsByDateRange', () => {
    it('should filter transactions within date range', () => {
      const filtered = getTransactionsByDateRange(
        mockTransactions,
        '2024-01-01',
        '2024-01-31'
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.date >= '2024-01-01' && t.date <= '2024-01-31')).toBe(true);
    });

    it('should return empty array when no transactions in range', () => {
      const filtered = getTransactionsByDateRange(
        mockTransactions,
        '2024-12-01',
        '2024-12-31'
      );

      expect(filtered).toHaveLength(0);
    });

    it('should include transactions on boundary dates', () => {
      const filtered = getTransactionsByDateRange(
        mockTransactions,
        '2024-01-15',
        '2024-01-20'
      );

      expect(filtered).toHaveLength(2);
    });
  });

  describe('getTransactionsByMonth', () => {
    it('should filter transactions for specific month', () => {
      const filtered = getTransactionsByMonth(mockTransactions, 2024, 1);

      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.date.startsWith('2024-01'))).toBe(true);
    });

    it('should handle single digit months correctly', () => {
      const filtered = getTransactionsByMonth(mockTransactions, 2024, 2);

      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.date.startsWith('2024-02'))).toBe(true);
    });

    it('should return empty array for month with no transactions', () => {
      const filtered = getTransactionsByMonth(mockTransactions, 2024, 12);

      expect(filtered).toHaveLength(0);
    });
  });

  describe('getTransactionsByYear', () => {
    it('should filter transactions for specific year', () => {
      const filtered = getTransactionsByYear(mockTransactions, 2024);

      expect(filtered).toHaveLength(5);
      expect(filtered.every((t) => t.date.startsWith('2024'))).toBe(true);
    });

    it('should return empty array for year with no transactions', () => {
      const filtered = getTransactionsByYear(mockTransactions, 2023);

      expect(filtered).toHaveLength(0);
    });
  });
});



