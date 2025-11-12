import type {
  Quote,
  Invoice,
  Transaction,
  User,
  Employee,
  Customer,
  QuoteItem,
  QuoteLabor,
  WorkOrder,
} from '../../../../types';

/**
 * Mock data helpers for testing
 */

export const mockUser: User = {
  id: 'user1',
  username: 'testuser',
  email: 'test@example.com',
  employeeId: 'emp1',
  role: 'admin',
  permissions: [],
};

export const mockEmployee: Employee = {
  id: 'emp1',
  name: 'Test Employee',
  email: 'employee@example.com',
  phone: '123456789',
  role: 'employee',
  department: 'Sales',
  hireDate: '2024-01-01',
};

export const mockCustomer: Customer = {
  id: 'cust1',
  name: 'Test Customer',
  email: 'customer@example.com',
  phone: '987654321',
  address: {
    street: 'Test Street',
    city: 'Test City',
    postalCode: '1234AB',
    country: 'NL',
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export const mockQuoteItem: QuoteItem = {
  id: 'item1',
  inventoryItemId: 'inv1',
  name: 'Test Item',
  quantity: 2,
  price: 100,
  total: 200,
};

export const mockQuoteLabor: QuoteLabor = {
  id: 'labor1',
  employeeId: 'emp1',
  hours: 5,
  rate: 50,
  total: 250,
};

export const mockQuote: Quote = {
  id: 'Q1',
  customerId: 'cust1',
  items: [mockQuoteItem],
  labor: [mockQuoteLabor],
  subtotal: 450,
  vatRate: 21,
  vatAmount: 94.5,
  total: 544.5,
  status: 'draft',
  createdDate: '2024-01-01',
  validUntil: '2024-02-01',
  notes: 'Test notes',
  createdBy: 'emp1',
  timestamps: {
    created: '2024-01-01T00:00:00.000Z',
  },
  history: [],
};

export const mockInvoice: Invoice = {
  id: 'inv1',
  invoiceNumber: '2024-001',
  customerId: 'cust1',
  items: [mockQuoteItem],
  labor: [mockQuoteLabor],
  subtotal: 450,
  vatRate: 21,
  vatAmount: 94.5,
  total: 544.5,
  status: 'draft',
  issueDate: '2024-01-01',
  dueDate: '2024-01-15',
  notes: 'Test notes',
  paymentTerms: '14 dagen',
  createdBy: 'emp1',
  timestamps: {
    created: '2024-01-01T00:00:00.000Z',
  },
  history: [],
};

export const mockTransaction: Transaction = {
  id: 'trans1',
  date: '2024-01-01',
  type: 'income',
  amount: 1000,
  description: 'Test transaction',
  category: 'sales',
};

export const mockWorkOrder: WorkOrder = {
  id: 'wo1',
  customerId: 'cust1',
  status: 'In Progress',
  priority: 'normal',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};


