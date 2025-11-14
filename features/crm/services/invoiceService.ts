import type {
  Invoice,
  QuoteItem,
  QuoteLabor,
  InvoiceHistoryEntry,
  User,
} from "../../../types";

/**
 * Generate a unique invoice number for the current year
 * Format: YYYY-NNN (e.g., 2025-001)
 * @param existingInvoices - Array of existing invoices to check for duplicates
 * @returns Generated invoice number
 */
export const generateInvoiceNumber = (existingInvoices: Invoice[]): string => {
  const year = new Date().getFullYear();
  const existingNumbers = existingInvoices
    .filter((inv) => inv.invoiceNumber.startsWith(`${year}-`))
    .map((inv) => parseInt(inv.invoiceNumber.split("-")[1]))
    .filter((num) => !isNaN(num));

  const nextNumber =
    existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${year}-${String(nextNumber).padStart(3, "0")}`;
};

/**
 * Calculate invoice totals from items and labor
 * @param items - Array of quote items
 * @param labor - Array of labor items
 * @param vatRate - VAT rate percentage
 * @returns Calculated subtotal, VAT amount, and total
 */
export const calculateInvoiceTotals = (
  items: QuoteItem[],
  labor: QuoteLabor[],
  vatRate: number
): { subtotal: number; vatAmount: number; total: number } => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, labor) => sum + labor.total, 0);
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return { subtotal, vatAmount, total };
};

/**
 * Create a history entry for invoice tracking
 * @param type - Type of entity (quote or invoice)
 * @param action - Action performed
 * @param details - Description of the action
 * @param currentUser - Current user performing the action
 * @param extra - Additional data to include in history entry
 * @returns Invoice history entry object
 */
export const createHistoryEntry = (
  type: "quote" | "invoice",
  action: string,
  details: string,
  currentUser: User,
  extra?: Record<string, any>
): InvoiceHistoryEntry => {
  return {
    timestamp: new Date().toISOString(),
    action: action as any,
    performedBy: currentUser.employeeId,
    details,
    ...extra,
  };
};
