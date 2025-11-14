import {
  createQuote,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
  cloneQuote,
  convertQuoteToInvoice,
  syncQuoteToWorkOrder,
} from '../quoteService';
import {
  mockUser,
  mockEmployee,
  mockCustomer,
  mockQuoteItem,
  mockQuoteLabor,
  mockQuote,
  mockInvoice,
  mockWorkOrder,
} from './testHelpers';
import type { Quote, Invoice } from '../../../../types';

// Mock dependencies
jest.mock('../utils/calculations', () => ({
  calculateQuoteTotals: jest.fn((items, labor, vatRate) => {
    const itemsSubtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    const laborSubtotal = labor.reduce((sum: number, labor: any) => sum + labor.total, 0);
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  }),
  generateInvoiceNumber: jest.fn((invoices: Invoice[]) => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .filter((inv) => inv.invoiceNumber.startsWith(`${year}-`))
      .map((inv) => parseInt(inv.invoiceNumber.split('-')[1]))
      .filter((num) => !isNaN(num));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${year}-${String(nextNumber).padStart(3, '0')}`;
  }),
}));

jest.mock('../utils/validators', () => ({
  validateQuoteForm: jest.fn((data) => {
    if (!data.customerId) {
      return { isValid: false, message: 'Klant is verplicht!' };
    }
    if (!data.items || data.items.length === 0) {
      return { isValid: false, message: 'Minimaal 1 item is verplicht!' };
    }
    if (!data.validUntil) {
      return { isValid: false, message: 'Geldig tot datum is verplicht!' };
    }
    return { isValid: true };
  }),
}));

jest.mock('../utils/helpers', () => ({
  createHistoryEntry: jest.fn((type, action, message, user, metadata) => ({
    type,
    action,
    message,
    user: user.id,
    timestamp: new Date().toISOString(),
    metadata,
  })),
  getEmployeeName: jest.fn((id, employees) => {
    const emp = employees.find((e: any) => e.id === id);
    return emp?.name || 'Onbekend';
  }),
  getCustomerName: jest.fn((id, customers) => {
    const cust = customers.find((c: any) => c.id === id);
    return cust?.name || 'Onbekend';
  }),
}));

jest.mock('../../../../utils/workflowValidation', () => ({
  validateQuoteToInvoice: jest.fn((quote) => ({
    canProceed: quote.status === 'approved',
    message: quote.status === 'approved' ? 'OK' : 'Quote not approved',
  })),
  validateQuoteToWorkOrder: jest.fn(() => ({
    canProceed: true,
    message: 'OK',
  })),
}));

describe('quoteService', () => {
  describe('createQuote', () => {
    it('should create a new quote with valid data', () => {
      const quoteData = {
        customerId: 'cust1',
        items: [mockQuoteItem],
        labor: [mockQuoteLabor],
        vatRate: 21,
        notes: 'Test notes',
        validUntil: '2024-02-01',
      };

      const quote = createQuote(
        quoteData,
        mockUser,
        [mockEmployee],
        [mockCustomer],
        []
      );

      expect(quote).toBeDefined();
      expect(quote.customerId).toBe('cust1');
      expect(quote.items).toEqual([mockQuoteItem]);
      expect(quote.labor).toEqual([mockQuoteLabor]);
      expect(quote.status).toBe('draft');
      expect(quote.history).toHaveLength(1);
      expect(quote.id).toMatch(/^Q\d+$/);
    });

    it('should throw error when customerId is missing', () => {
      const quoteData = {
        customerId: '',
        items: [mockQuoteItem],
        labor: [],
        vatRate: 21,
        notes: '',
        validUntil: '2024-02-01',
      };

      expect(() => {
        createQuote(quoteData, mockUser, [mockEmployee], [mockCustomer], []);
      }).toThrow('Klant is verplicht!');
    });

    it('should throw error when items array is empty', () => {
      const quoteData = {
        customerId: 'cust1',
        items: [],
        labor: [],
        vatRate: 21,
        notes: '',
        validUntil: '2024-02-01',
      };

      expect(() => {
        createQuote(quoteData, mockUser, [mockEmployee], [mockCustomer], []);
      }).toThrow('Minimaal 1 item is verplicht!');
    });
  });

  describe('updateQuote', () => {
    it('should update an existing quote', () => {
      const updatedData = {
        customerId: 'cust1',
        items: [{ ...mockQuoteItem, quantity: 3, total: 300 }],
        labor: [mockQuoteLabor],
        vatRate: 21,
        notes: 'Updated notes',
        validUntil: '2024-03-01',
      };

      const updatedQuote = updateQuote(
        'Q1',
        updatedData,
        mockQuote,
        mockUser,
        [mockEmployee]
      );

      expect(updatedQuote.items[0].quantity).toBe(3);
      expect(updatedQuote.notes).toBe('Updated notes');
      expect(updatedQuote.history.length).toBeGreaterThan(mockQuote.history.length);
    });

    it('should throw error when validation fails', () => {
      const invalidData = {
        customerId: '',
        items: [mockQuoteItem],
        labor: [],
        vatRate: 21,
        notes: '',
        validUntil: '2024-02-01',
      };

      expect(() => {
        updateQuote('Q1', invalidData, mockQuote, mockUser, [mockEmployee]);
      }).toThrow();
    });
  });

  describe('updateQuoteStatus', () => {
    it('should update quote status and add history entry', () => {
      const updatedQuote = updateQuoteStatus(
        mockQuote,
        'sent',
        mockUser,
        [mockEmployee]
      );

      expect(updatedQuote.status).toBe('sent');
      expect(updatedQuote.history.length).toBeGreaterThan(mockQuote.history.length);
      expect(updatedQuote.timestamps?.sent).toBeDefined();
    });

    it('should update timestamp when status changes to approved', () => {
      const updatedQuote = updateQuoteStatus(
        mockQuote,
        'approved',
        mockUser,
        [mockEmployee]
      );

      expect(updatedQuote.status).toBe('approved');
      expect(updatedQuote.timestamps?.approved).toBeDefined();
    });
  });

  describe('deleteQuote', () => {
    it('should remove quote from array', () => {
      const quotes: Quote[] = [mockQuote, { ...mockQuote, id: 'Q2' }];
      const result = deleteQuote('Q1', quotes);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('Q2');
    });

    it('should return empty array when deleting last quote', () => {
      const quotes: Quote[] = [mockQuote];
      const result = deleteQuote('Q1', quotes);

      expect(result).toHaveLength(0);
    });
  });

  describe('cloneQuote', () => {
    it('should create a new quote with same data but new ID', () => {
      const clonedQuote = cloneQuote(mockQuote, mockUser, [mockEmployee], [mockCustomer]);

      expect(clonedQuote.id).not.toBe(mockQuote.id);
      expect(clonedQuote.id).toMatch(/^Q\d+$/);
      expect(clonedQuote.customerId).toBe(mockQuote.customerId);
      expect(clonedQuote.items).toEqual(mockQuote.items);
      expect(clonedQuote.status).toBe('draft');
      expect(clonedQuote.history).toHaveLength(1);
    });

    it('should create new instances of items and labor', () => {
      const clonedQuote = cloneQuote(mockQuote, mockUser, [mockEmployee], [mockCustomer]);

      expect(clonedQuote.items).not.toBe(mockQuote.items);
      expect(clonedQuote.items[0]).not.toBe(mockQuote.items[0]);
      expect(clonedQuote.labor).not.toBe(mockQuote.labor);
    });
  });

  describe('convertQuoteToInvoice', () => {
    it('should convert approved quote to invoice', () => {
      const approvedQuote: Quote = { ...mockQuote, status: 'approved' };
      const { invoice, updatedQuote } = convertQuoteToInvoice(
        approvedQuote,
        mockUser,
        [mockEmployee],
        []
      );

      expect(invoice).toBeDefined();
      expect(invoice.customerId).toBe(approvedQuote.customerId);
      expect(invoice.items).toEqual(approvedQuote.items);
      expect(invoice.total).toBe(approvedQuote.total);
      expect(invoice.quoteId).toBe(approvedQuote.id);
      expect(updatedQuote.timestamps?.convertedToInvoice).toBeDefined();
    });

    it('should throw error when quote is not approved', () => {
      expect(() => {
        convertQuoteToInvoice(mockQuote, mockUser, [mockEmployee], []);
      }).toThrow();
    });
  });

  describe('syncQuoteToWorkOrder', () => {
    it('should sync quote data to work order', () => {
      const result = syncQuoteToWorkOrder(mockQuote, mockWorkOrder);

      expect(result).toBeDefined();
      expect(result?.requiredInventory).toBeDefined();
      expect(result?.estimatedHours).toBe(5);
      expect(result?.estimatedCost).toBe(544.5);
    });

    it('should return null when work order is completed', () => {
      const completedWorkOrder = { ...mockWorkOrder, status: 'Completed' as const };
      const result = syncQuoteToWorkOrder(mockQuote, completedWorkOrder);

      expect(result).toBeNull();
    });

    it('should calculate total hours from labor', () => {
      const quoteWithLabor: Quote = {
        ...mockQuote,
        labor: [
          { ...mockQuoteLabor, hours: 3 },
          { ...mockQuoteLabor, id: 'labor2', hours: 2 },
        ],
      };

      const result = syncQuoteToWorkOrder(quoteWithLabor, mockWorkOrder);

      expect(result?.estimatedHours).toBe(5);
    });
  });
});



