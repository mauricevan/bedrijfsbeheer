import type { Quote, Invoice, Transaction } from "../../../types";
import { getCustomerName } from "./helpers";

/**
 * Filter options for invoices
 */
export interface InvoiceFilterOptions {
  type?: "all" | "paid" | "outstanding" | "overdue";
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
}

/**
 * Filter options for quotes
 */
export interface QuoteFilterOptions {
  type?: "all" | "approved" | "sent" | "expired";
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
}

/**
 * Filter invoices based on various criteria
 * @param invoices - Array of invoices to filter
 * @param customers - Array of customers (for name lookup)
 * @param options - Filter options
 * @returns Filtered array of invoices
 */
export const filterInvoices = (
  invoices: Invoice[],
  customers: any[],
  options: InvoiceFilterOptions
): Invoice[] => {
  let filtered = [...invoices];

  // Filter by type
  switch (options.type) {
    case "paid":
      filtered = filtered.filter((inv) => inv.status === "paid");
      break;
    case "outstanding":
      filtered = filtered.filter((inv) =>
        ["sent", "overdue"].includes(inv.status)
      );
      break;
    case "overdue":
      filtered = filtered.filter((inv) => inv.status === "overdue");
      break;
    case "all":
    default:
      // Hide paid invoices in "all" view (only visible in Accounting & Dossier)
      filtered = filtered.filter((inv) => inv.status !== "paid");
      break;
  }

  // Filter by customer name
  if (options.customerName) {
    filtered = filtered.filter((inv) => {
      const customerName = getCustomerName(
        inv.customerId,
        customers
      ).toLowerCase();
      return customerName.includes(options.customerName!.toLowerCase());
    });
  }

  // Filter by date range
  if (options.dateFrom) {
    filtered = filtered.filter(
      (inv) => inv.issueDate >= options.dateFrom!
    );
  }
  if (options.dateTo) {
    filtered = filtered.filter(
      (inv) => inv.issueDate <= options.dateTo!
    );
  }

  // Filter by amount range
  if (options.minAmount) {
    filtered = filtered.filter(
      (inv) => inv.total >= parseFloat(options.minAmount!)
    );
  }
  if (options.maxAmount) {
    filtered = filtered.filter(
      (inv) => inv.total <= parseFloat(options.maxAmount!)
    );
  }

  return filtered;
};

/**
 * Filter quotes based on various criteria
 * @param quotes - Array of quotes to filter
 * @param customers - Array of customers (for name lookup)
 * @param options - Filter options
 * @returns Filtered array of quotes
 */
export const filterQuotes = (
  quotes: Quote[],
  customers: any[],
  options: QuoteFilterOptions
): Quote[] => {
  let filtered = [...quotes];

  // Filter by type
  switch (options.type) {
    case "approved":
      filtered = filtered.filter((q) => q.status === "approved");
      break;
    case "sent":
      filtered = filtered.filter((q) => q.status === "sent");
      break;
    case "expired":
      filtered = filtered.filter(
        (q) =>
          q.status === "expired" ||
          (q.validUntil && new Date(q.validUntil) < new Date())
      );
      break;
    case "all":
    default:
      break;
  }

  // Apply text filters
  if (options.customerName) {
    filtered = filtered.filter((q) =>
      getCustomerName(q.customerId, customers)
        .toLowerCase()
        .includes(options.customerName!.toLowerCase())
    );
  }

  if (options.dateFrom) {
    filtered = filtered.filter(
      (q) => q.createdDate >= options.dateFrom!
    );
  }
  if (options.dateTo) {
    filtered = filtered.filter(
      (q) => q.createdDate <= options.dateTo!
    );
  }

  if (options.minAmount) {
    filtered = filtered.filter(
      (q) => q.total >= parseFloat(options.minAmount!)
    );
  }
  if (options.maxAmount) {
    filtered = filtered.filter(
      (q) => q.total <= parseFloat(options.maxAmount!)
    );
  }

  return filtered;
};

/**
 * Filter transactions by type
 * @param transactions - Array of transactions to filter
 * @param filter - Filter type ("all", "income", or "expense")
 * @returns Filtered array of transactions
 */
export const filterTransactions = (
  transactions: Transaction[],
  filter: "all" | "income" | "expense"
): Transaction[] => {
  if (filter === "all") {
    return transactions;
  }
  return transactions.filter((t) => t.type === filter);
};

/**
 * Calculate total amount from filtered invoices
 * @param invoices - Array of invoices
 * @returns Total amount
 */
export const calculateFilteredInvoiceTotal = (invoices: Invoice[]): number => {
  return invoices.reduce((sum, inv) => sum + inv.total, 0);
};

/**
 * Calculate total amount from filtered quotes
 * @param quotes - Array of quotes
 * @returns Total amount
 */
export const calculateFilteredQuoteTotal = (quotes: Quote[]): number => {
  return quotes.reduce((sum, q) => sum + q.total, 0);
};

