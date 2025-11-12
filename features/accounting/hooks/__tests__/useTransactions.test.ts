import { renderHook, act } from '@testing-library/react';
import { useTransactions } from '../useTransactions';
import { mockTransaction } from '../../services/__tests__/testHelpers';
import type { Transaction } from '../../../../types';

describe('useTransactions', () => {
  const mockTransactions: Transaction[] = [
    { ...mockTransaction, id: 'trans1', type: 'income', amount: 1000 },
    { ...mockTransaction, id: 'trans2', type: 'expense', amount: -500 },
    { ...mockTransaction, id: 'trans3', type: 'income', amount: 2000 },
  ];

  it('should initialize with all transactions', () => {
    const { result } = renderHook(() => useTransactions(mockTransactions));

    expect(result.current.filter).toBe('all');
    expect(result.current.filteredTransactions).toHaveLength(3);
    expect(result.current.transactions).toEqual(mockTransactions);
  });

  it('should filter to income only', () => {
    const { result } = renderHook(() => useTransactions(mockTransactions));

    act(() => {
      result.current.setFilter('income');
    });

    expect(result.current.filter).toBe('income');
    expect(result.current.filteredTransactions).toHaveLength(2);
    expect(result.current.filteredTransactions.every((t) => t.type === 'income')).toBe(true);
  });

  it('should filter to expense only', () => {
    const { result } = renderHook(() => useTransactions(mockTransactions));

    act(() => {
      result.current.setFilter('expense');
    });

    expect(result.current.filter).toBe('expense');
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions.every((t) => t.type === 'expense')).toBe(true);
  });

  it('should return to all transactions', () => {
    const { result } = renderHook(() => useTransactions(mockTransactions));

    act(() => {
      result.current.setFilter('income');
    });

    expect(result.current.filteredTransactions).toHaveLength(2);

    act(() => {
      result.current.setFilter('all');
    });

    expect(result.current.filter).toBe('all');
    expect(result.current.filteredTransactions).toHaveLength(3);
  });

  it('should handle empty transactions array', () => {
    const { result } = renderHook(() => useTransactions([]));

    expect(result.current.filteredTransactions).toHaveLength(0);
    expect(result.current.transactions).toHaveLength(0);
  });

  it('should update filtered transactions when transactions change', () => {
    const { result, rerender } = renderHook(
      ({ transactions }) => useTransactions(transactions),
      {
        initialProps: { transactions: mockTransactions },
      }
    );

    expect(result.current.filteredTransactions).toHaveLength(3);

    const newTransactions = [...mockTransactions, { ...mockTransaction, id: 'trans4', type: 'income', amount: 1500 }];

    rerender({ transactions: newTransactions });

    expect(result.current.filteredTransactions).toHaveLength(4);
  });
});


