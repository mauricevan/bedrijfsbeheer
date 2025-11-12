import type { Quote, QuoteItem, QuoteLabor, Invoice, Transaction } from "../../../types";

/**
 * Calculate totals for a quote based on items and labor
 * @param items - Array of quote items
 * @param labor - Array of quote labor entries
 * @param vatRate - VAT rate percentage (default: 21)
 * @returns Object with subtotal, vatAmount, and total
 */
export const calculateQuoteTotals = (
  items: QuoteItem[],
  labor: QuoteLabor[],
  vatRate: number = 21
): { subtotal: number; vatAmount: number; total: number } => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, labor) => sum + labor.total, 0);
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return { subtotal, vatAmount, total };
};

/**
 * Calculate totals for an invoice based on items and labor
 * @param items - Array of invoice items
 * @param labor - Array of invoice labor entries
 * @param vatRate - VAT rate percentage (default: 21)
 * @returns Object with subtotal, vatAmount, and total
 */
export const calculateInvoiceTotals = (
  items: QuoteItem[],
  labor: QuoteLabor[],
  vatRate: number = 21
): { subtotal: number; vatAmount: number; total: number } => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, labor) => sum + labor.total, 0);
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return { subtotal, vatAmount, total };
};

/**
 * Generate a unique invoice number based on year and existing invoices
 * @param invoices - Array of existing invoices
 * @returns Invoice number in format "YYYY-XXX"
 */
export const generateInvoiceNumber = (invoices: Invoice[]): string => {
  const year = new Date().getFullYear();
  const existingNumbers = invoices
    .filter((inv) => inv.invoiceNumber.startsWith(`${year}-`))
    .map((inv) => parseInt(inv.invoiceNumber.split("-")[1]))
    .filter((num) => !isNaN(num));

  const nextNumber =
    existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${year}-${String(nextNumber).padStart(3, "0")}`;
};

/**
 * Calculate transaction statistics
 * @param transactions - Array of transactions
 * @returns Object with totalIncome, totalExpense, and netProfit
 */
export const calculateTransactionStats = (
  transactions: Transaction[]
): { totalIncome: number; totalExpense: number; netProfit: number } => {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netProfit = totalIncome - totalExpense;

  return { totalIncome, totalExpense, netProfit };
};

/**
 * Calculate invoice statistics
 * @param invoices - Array of invoices
 * @returns Object with various invoice statistics
 */
export const calculateInvoiceStats = (invoices: Invoice[]): {
  totalInvoiced: number;
  totalPaid: number;
  totalOverdue: number;
  totalOutstanding: number;
  paidInvoices: Invoice[];
  overdueInvoices: Invoice[];
  outstandingInvoices: Invoice[];
} => {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingInvoices = invoices.filter((inv) =>
    ["sent", "overdue"].includes(inv.status)
  );
  const totalOutstanding = outstandingInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  return {
    totalInvoiced,
    totalPaid,
    totalOverdue,
    totalOutstanding,
    paidInvoices,
    overdueInvoices,
    outstandingInvoices,
  };
};

/**
 * Calculate quote statistics
 * @param quotes - Array of quotes
 * @returns Object with various quote statistics
 */
export const calculateQuoteStats = (quotes: Quote[]): {
  totalQuoted: number;
  totalApproved: number;
  totalSent: number;
  totalExpired: number;
  approvedQuotes: Quote[];
  sentQuotes: Quote[];
  expiredQuotes: Quote[];
} => {
  const totalQuoted = quotes.reduce((sum, q) => sum + q.total, 0);
  const approvedQuotes = quotes.filter((q) => q.status === "approved");
  const sentQuotes = quotes.filter((q) => q.status === "sent");
  const expiredQuotes = quotes.filter(
    (q) =>
      q.status === "expired" ||
      (q.validUntil && new Date(q.validUntil) < new Date())
  );
  const totalApproved = approvedQuotes.reduce((sum, q) => sum + q.total, 0);
  const totalSent = sentQuotes.reduce((sum, q) => sum + q.total, 0);
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
};

/**
 * Calculate average payment days for paid invoices
 * @param invoices - Array of invoices
 * @returns Average payment days (rounded)
 */
export const calculateAveragePaymentDays = (invoices: Invoice[]): number => {
  const paidInvoicesWithDates = invoices.filter(
    (inv) => inv.status === "paid" && inv.issueDate && inv.paidDate
  );

  if (paidInvoicesWithDates.length === 0) return 0;

  const totalDays = paidInvoicesWithDates.reduce((sum, inv) => {
    const issueDate = new Date(inv.issueDate);
    const paidDate = new Date(inv.paidDate!);
    const diffTime = Math.abs(paidDate.getTime() - issueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / paidInvoicesWithDates.length);
};

