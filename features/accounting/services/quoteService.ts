import type {
  Quote,
  QuoteItem,
  QuoteLabor,
  QuoteHistoryEntry,
  Invoice,
  WorkOrder,
  User,
  Employee,
} from "../../../types";
import {
  calculateQuoteTotals,
  generateInvoiceNumber,
} from "../utils/calculations";
import {
  validateQuoteForm,
  type QuoteFormData,
} from "../utils/validators";
import {
  createHistoryEntry,
  getEmployeeName,
  getCustomerName,
} from "../utils/helpers";
import {
  validateQuoteToWorkOrder,
  validateQuoteToInvoice,
} from "../../../utils/workflowValidation";

/**
 * Quote form data interface
 */
export interface CreateQuoteData {
  customerId: string;
  items: QuoteItem[];
  labor: QuoteLabor[];
  vatRate: number;
  notes: string;
  validUntil: string;
}

/**
 * Create a new quote
 * @param data - Quote form data
 * @param currentUser - Current user
 * @param employees - Array of employees
 * @param customers - Array of customers
 * @param existingQuotes - Array of existing quotes (for ID generation)
 * @returns New quote object
 */
export const createQuote = (
  data: CreateQuoteData,
  currentUser: User,
  employees: Employee[],
  customers: any[],
  existingQuotes: Quote[] = []
): Quote => {
  // Validate form data
  const validation = validateQuoteForm({
    customerId: data.customerId,
    items: data.items,
    validUntil: data.validUntil,
    vatRate: data.vatRate,
    notes: data.notes,
  });

  if (!validation.isValid) {
    throw new Error(validation.message || "Invalid quote data");
  }

  // Calculate totals
  const { subtotal, vatAmount, total } = calculateQuoteTotals(
    data.items,
    data.labor,
    data.vatRate
  );

  const now = new Date().toISOString();
  const customerName = getCustomerName(data.customerId, customers);

  // Generate unique ID
  const id = `Q${Date.now()}`;

  const quote: Quote = {
    id,
    customerId: data.customerId,
    items: data.items,
    labor: data.labor.length > 0 ? data.labor : undefined,
    subtotal,
    vatRate: data.vatRate,
    vatAmount,
    total,
    status: "draft",
    createdDate: new Date().toISOString().split("T")[0],
    validUntil: data.validUntil,
    notes: data.notes,
    createdBy: currentUser.employeeId,
    timestamps: {
      created: now,
    },
    history: [
      createHistoryEntry(
        "quote",
        "created",
        `Offerte aangemaakt door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )} voor klant ${customerName}`,
        currentUser
      ) as QuoteHistoryEntry,
    ],
  };

  return quote;
};

/**
 * Update an existing quote
 * @param quoteId - Quote ID to update
 * @param data - Updated quote form data
 * @param existingQuote - Existing quote object
 * @param currentUser - Current user
 * @param employees - Array of employees
 * @returns Updated quote object
 */
export const updateQuote = (
  quoteId: string,
  data: CreateQuoteData,
  existingQuote: Quote,
  currentUser: User,
  employees: Employee[]
): Quote => {
  // Validate form data
  const validation = validateQuoteForm({
    customerId: data.customerId,
    items: data.items,
    validUntil: data.validUntil,
    vatRate: data.vatRate,
    notes: data.notes,
  });

  if (!validation.isValid) {
    throw new Error(validation.message || "Invalid quote data");
  }

  // Calculate totals
  const { subtotal, vatAmount, total } = calculateQuoteTotals(
    data.items,
    data.labor,
    data.vatRate
  );

  const updatedQuote: Quote = {
    ...existingQuote,
    customerId: data.customerId,
    items: data.items,
    labor: data.labor.length > 0 ? data.labor : undefined,
    subtotal,
    vatRate: data.vatRate,
    vatAmount,
    total,
    validUntil: data.validUntil,
    notes: data.notes,
    history: [
      ...(existingQuote.history || []),
      createHistoryEntry(
        "quote",
        "updated",
        `Offerte bijgewerkt door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )}`,
        currentUser
      ) as QuoteHistoryEntry,
    ],
  };

  return updatedQuote;
};

/**
 * Update quote status
 * @param quote - Quote to update
 * @param newStatus - New status
 * @param currentUser - Current user
 * @param employees - Array of employees
 * @returns Updated quote object
 */
export const updateQuoteStatus = (
  quote: Quote,
  newStatus: Quote["status"],
  currentUser: User,
  employees: Employee[]
): Quote => {
  const now = new Date().toISOString();
  const oldStatus = quote.status;

  const updates: Partial<Quote> = {
    status: newStatus,
    history: [
      ...(quote.history || []),
      createHistoryEntry(
        "quote",
        newStatus,
        `Status gewijzigd van "${oldStatus}" naar "${newStatus}" door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )}`,
        currentUser,
        { fromStatus: oldStatus, toStatus: newStatus }
      ) as QuoteHistoryEntry,
    ],
  };

  // Update timestamps
  if (!quote.timestamps) {
    updates.timestamps = { created: quote.createdDate };
  } else {
    updates.timestamps = { ...quote.timestamps };
  }

  if (newStatus === "sent" && !updates.timestamps!.sent) {
    updates.timestamps!.sent = now;
  } else if (newStatus === "approved" && !updates.timestamps!.approved) {
    updates.timestamps!.approved = now;
  }

  return { ...quote, ...updates };
};

/**
 * Delete a quote (returns filtered array)
 * @param quoteId - Quote ID to delete
 * @param quotes - Array of quotes
 * @returns Filtered array without the deleted quote
 */
export const deleteQuote = (
  quoteId: string,
  quotes: Quote[]
): Quote[] => {
  return quotes.filter((q) => q.id !== quoteId);
};

/**
 * Clone a quote
 * @param quote - Quote to clone
 * @param currentUser - Current user
 * @param employees - Array of employees
 * @param customers - Array of customers
 * @returns Cloned quote object
 */
export const cloneQuote = (
  quote: Quote,
  currentUser: User,
  employees: Employee[],
  customers: any[]
): Quote => {
  const now = new Date().toISOString();
  const customerName = getCustomerName(quote.customerId, customers);

  const clonedQuote: Quote = {
    id: `Q${Date.now()}`,
    customerId: quote.customerId,
    items: quote.items.map((item) => ({ ...item })),
    labor: quote.labor ? quote.labor.map((l) => ({ ...l })) : undefined,
    subtotal: quote.subtotal,
    vatRate: quote.vatRate,
    vatAmount: quote.vatAmount,
    total: quote.total,
    status: "draft",
    createdDate: new Date().toISOString().split("T")[0],
    validUntil: quote.validUntil,
    notes: quote.notes || "",
    createdBy: currentUser.employeeId,
    timestamps: {
      created: now,
    },
    history: [
      createHistoryEntry(
        "quote",
        "created",
        `Offerte gecloneerd door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )} voor klant ${customerName}`,
        currentUser
      ) as QuoteHistoryEntry,
    ],
  };

  return clonedQuote;
};

/**
 * Convert quote to invoice
 * @param quote - Quote to convert
 * @param currentUser - Current user
 * @param employees - Array of employees
 * @param invoices - Array of existing invoices (for invoice number generation)
 * @returns New invoice object and updated quote object
 */
export const convertQuoteToInvoice = (
  quote: Quote,
  currentUser: User,
  employees: Employee[],
  invoices: Invoice[] = []
): { invoice: Invoice; updatedQuote: Quote } => {
  // Validate conversion
  const validation = validateQuoteToInvoice(quote, []);
  if (!validation.canProceed) {
    throw new Error(validation.message);
  }

  const issueDate = new Date().toISOString().split("T")[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const now = new Date().toISOString();

  const invoice: Invoice = {
    id: `inv${Date.now()}`,
    invoiceNumber: generateInvoiceNumber(invoices),
    customerId: quote.customerId,
    quoteId: quote.id,
    items: quote.items,
    labor: quote.labor,
    subtotal: quote.subtotal,
    vatRate: quote.vatRate,
    vatAmount: quote.vatAmount,
    total: quote.total,
    status: "draft",
    issueDate: issueDate,
    dueDate: dueDate.toISOString().split("T")[0],
    notes: quote.notes,
    paymentTerms: "14 dagen",
    workOrderId: quote.workOrderId,
    createdBy: currentUser.employeeId,
    timestamps: {
      created: now,
    },
    history: [
      createHistoryEntry(
        "invoice",
        "created",
        `Factuur aangemaakt door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )} vanuit offerte ${quote.id}`,
        currentUser
      ) as any,
    ],
  };

  // Update quote with conversion timestamp
  const updatedQuote: Quote = {
    ...quote,
    timestamps: {
      ...quote.timestamps,
      convertedToInvoice: now,
    },
    history: [
      ...(quote.history || []),
      createHistoryEntry(
        "quote",
        "converted_to_invoice",
        `Geconverteerd naar factuur ${invoice.invoiceNumber} door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )}`,
        currentUser
      ) as QuoteHistoryEntry,
    ],
  };

  return { invoice, updatedQuote };
};

/**
 * Sync quote data to work order
 * @param quote - Quote to sync
 * @param workOrder - Work order to update
 * @returns Updated work order object or null if sync not possible
 */
export const syncQuoteToWorkOrder = (
  quote: Quote,
  workOrder: WorkOrder
): WorkOrder | null => {
  // Check if workorder is completed
  if (workOrder.status === "Completed") {
    return null; // Cannot sync completed work orders
  }

  // Calculate total hours
  const totalHours =
    quote.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

  // Update workorder with new data from quote
  const updatedWorkOrder: WorkOrder = {
    ...workOrder,
    requiredInventory: quote.items
      .filter((item) => item.inventoryItemId)
      .map((item) => ({
        itemId: item.inventoryItemId!,
        quantity: item.quantity,
      })),
    estimatedHours: totalHours,
    estimatedCost: quote.total,
    notes: `${
      workOrder.notes || ""
    }\n\n[Update: ${new Date().toLocaleDateString()}] Offerte aangepast - Geschatte uren: ${totalHours}u, Kosten: €${quote.total.toFixed(2)}`,
  };

  return updatedWorkOrder;
};

