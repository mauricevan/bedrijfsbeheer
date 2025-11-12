import { renderHook, act } from '@testing-library/react';
import { useQuotes } from '../useQuotes';
import {
  mockUser,
  mockEmployee,
  mockCustomer,
  mockQuote,
  mockWorkOrder,
} from '../../services/__tests__/testHelpers';
import type { Quote, InventoryItem, WorkOrder } from '../../../../types';

// Mock dependencies
jest.mock('../../../utils/analytics', () => ({
  trackAction: jest.fn(),
}));

jest.mock('../useQuoteForm', () => ({
  useQuoteForm: jest.fn(() => ({
    formData: {
      customerId: 'cust1',
      items: [],
      labor: [],
      vatRate: 21,
      notes: '',
      validUntil: '2024-02-01',
    },
    errors: {},
    editingQuoteId: null,
    validate: jest.fn(() => true),
    reset: jest.fn(),
    setFields: jest.fn(),
    setEditingQuoteId: jest.fn(),
    loadQuoteForEditing: jest.fn(),
  })),
}));

jest.mock('../../services/quoteService', () => ({
  createQuote: jest.fn((data) => ({
    id: 'Q999',
    ...data,
    status: 'draft',
    createdDate: '2024-01-01',
    timestamps: { created: '2024-01-01T00:00:00.000Z' },
    history: [],
  })),
  updateQuote: jest.fn((id, data, existing) => ({
    ...existing,
    ...data,
  })),
  updateQuoteStatus: jest.fn((quote, status) => ({
    ...quote,
    status,
  })),
  deleteQuote: jest.fn((id, quotes) => quotes.filter((q: Quote) => q.id !== id)),
  cloneQuote: jest.fn((quote) => ({
    ...quote,
    id: 'Q999',
    status: 'draft',
  })),
  syncQuoteToWorkOrder: jest.fn((quote, workOrder) => ({
    ...workOrder,
    estimatedHours: 5,
  })),
}));

describe('useQuotes', () => {
  const mockInventory: InventoryItem[] = [];
  const mockQuotes: Quote[] = [mockQuote];
  const mockWorkOrders: WorkOrder[] = [mockWorkOrder];

  const mockSetQuotes = jest.fn();
  const mockSetWorkOrders = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window methods
    global.alert = jest.fn();
    global.confirm = jest.fn(() => true);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useQuotes(
        mockQuotes,
        mockSetQuotes,
        mockInventory,
        [mockCustomer],
        mockUser,
        mockWorkOrders,
        mockSetWorkOrders
      )
    );

    expect(result.current.showQuoteForm).toBe(false);
    expect(result.current.showCloneQuoteModal).toBe(false);
    expect(result.current.showAcceptQuoteModal).toBe(false);
    expect(result.current.quoteToAccept).toBe(null);
  });

  it('should open quote form', () => {
    const { result } = renderHook(() =>
      useQuotes(
        mockQuotes,
        mockSetQuotes,
        mockInventory,
        [mockCustomer],
        mockUser,
        mockWorkOrders,
        mockSetWorkOrders
      )
    );

    act(() => {
      result.current.setShowQuoteForm(true);
    });

    expect(result.current.showQuoteForm).toBe(true);
  });

  it('should edit a quote', () => {
    const { result } = renderHook(() =>
      useQuotes(
        mockQuotes,
        mockSetQuotes,
        mockInventory,
        [mockCustomer],
        mockUser,
        mockWorkOrders,
        mockSetWorkOrders
      )
    );

    act(() => {
      result.current.editQuote(mockQuote.id);
    });

    expect(result.current.showQuoteForm).toBe(true);
  });

  it('should update quote status', () => {
    const { result } = renderHook(() =>
      useQuotes(
        mockQuotes,
        mockSetQuotes,
        mockInventory,
        [mockCustomer],
        mockUser,
        mockWorkOrders,
        mockSetWorkOrders
      )
    );

    act(() => {
      result.current.updateQuoteStatus(mockQuote.id, 'sent');
    });

    expect(mockSetQuotes).toHaveBeenCalled();
  });

  it('should delete a quote', () => {
    const { result } = renderHook(() =>
      useQuotes(
        mockQuotes,
        mockSetQuotes,
        mockInventory,
        [mockCustomer],
        mockUser,
        mockWorkOrders,
        mockSetWorkOrders
      )
    );

    act(() => {
      result.current.deleteQuote(mockQuote.id);
    });

    expect(mockSetQuotes).toHaveBeenCalled();
  });

  it('should clone a quote', () => {
    const { result } = renderHook(() =>
      useQuotes(
        mockQuotes,
        mockSetQuotes,
        mockInventory,
        [mockCustomer],
        mockUser,
        mockWorkOrders,
        mockSetWorkOrders
      )
    );

    act(() => {
      result.current.cloneQuote(mockQuote.id);
    });

    expect(result.current.showCloneQuoteModal).toBe(true);
  });

  it('should set quote to accept', () => {
    const { result } = renderHook(() =>
      useQuotes(
        mockQuotes,
        mockSetQuotes,
        mockInventory,
        [mockCustomer],
        mockUser,
        mockWorkOrders,
        mockSetWorkOrders
      )
    );

    act(() => {
      result.current.setQuoteToAccept(mockQuote.id);
      result.current.setShowAcceptQuoteModal(true);
    });

    expect(result.current.quoteToAccept).toBe(mockQuote.id);
    expect(result.current.showAcceptQuoteModal).toBe(true);
  });

  it('should handle clone on accept', () => {
    const { result } = renderHook(() =>
      useQuotes(
        mockQuotes,
        mockSetQuotes,
        mockInventory,
        [mockCustomer],
        mockUser,
        mockWorkOrders,
        mockSetWorkOrders
      )
    );

    act(() => {
      result.current.setQuoteToAccept(mockQuote.id);
      result.current.setCloneOnAccept(true);
      result.current.setShowAcceptQuoteModal(true);
    });

    expect(result.current.cloneOnAccept).toBe(true);
  });
});


