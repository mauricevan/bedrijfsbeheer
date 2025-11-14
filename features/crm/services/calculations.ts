import type {
  Lead,
  Customer,
  Interaction,
  Task,
  Quote,
  Invoice,
  WorkOrder,
  QuoteItem,
  QuoteLabor,
} from "../../../types";

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: string;
  totalCustomers: number;
  businessCustomers: number;
  privateCustomers: number;
  totalValue: number;
  wonValue: number;
  totalInteractions: number;
  thisMonthInteractions: number;
  pendingFollowUps: number;
  activeTasks: number;
  overdueTasks: number;
}

/**
 * Customer journey data interface
 */
export interface CustomerJourney {
  quotes: Quote[];
  invoices: Invoice[];
  workOrders: WorkOrder[];
  quotesByStatus: {
    draft: Quote[];
    sent: Quote[];
    approved: Quote[];
    rejected: Quote[];
    expired: Quote[];
  };
  invoicesByStatus: {
    draft: Invoice[];
    sent: Invoice[];
    paid: Invoice[];
    overdue: Invoice[];
  };
  workOrdersByStatus: {
    todo: WorkOrder[];
    inProgress: WorkOrder[];
    pending: WorkOrder[];
    completed: WorkOrder[];
  };
  progressPercentage: number;
  totalSteps: number;
  completedSteps: number;
}

/**
 * Customer finances data interface
 */
export interface CustomerFinances {
  invoices: Invoice[];
  quotes: Quote[];
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  totalQuotes: number;
  paidInvoices: Invoice[];
  outstandingInvoices: Invoice[];
  overdueInvoices: Invoice[];
}

/**
 * Invoice totals calculation result
 */
export interface InvoiceTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
}

/**
 * Calculate dashboard statistics for CRM module
 * @param leads - Array of all leads
 * @param customers - Array of all customers
 * @param interactions - Array of all interactions
 * @param tasks - Array of all tasks
 * @returns Dashboard statistics object
 */
export const calculateDashboardStats = (
  leads: Lead[],
  customers: Customer[],
  interactions: Interaction[],
  tasks: Task[]
): DashboardStats => {
  const totalLeads = leads.length;
  const activeLeads = leads.filter(
    (l) => !["won", "lost"].includes(l.status)
  ).length;
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const lostLeads = leads.filter((l) => l.status === "lost").length;
  const conversionRate =
    totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

  const totalCustomers = customers.length;
  const businessCustomers = customers.filter(
    (c) => c.type === "business"
  ).length;
  const privateCustomers = customers.filter(
    (c) => c.type === "private"
  ).length;

  const totalValue = leads.reduce(
    (sum, lead) => sum + (lead.estimatedValue || 0),
    0
  );
  const wonValue = leads
    .filter((l) => l.status === "won")
    .reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

  const totalInteractions = interactions.length;
  const thisMonthInteractions = interactions.filter((i) => {
    const interactionDate = new Date(i.date);
    const now = new Date();
    return (
      interactionDate.getMonth() === now.getMonth() &&
      interactionDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const pendingFollowUps = interactions.filter(
    (i) => i.followUpRequired && i.followUpDate
  ).length;

  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const overdueTasks = tasks.filter((t) => {
    if (t.status === "done") return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  return {
    totalLeads,
    activeLeads,
    wonLeads,
    lostLeads,
    conversionRate,
    totalCustomers,
    businessCustomers,
    privateCustomers,
    totalValue,
    wonValue,
    totalInteractions,
    thisMonthInteractions,
    pendingFollowUps,
    activeTasks,
    overdueTasks,
  };
};

/**
 * Get customer journey data - all quotes, invoices, and work orders for a customer
 * @param customerId - Customer ID
 * @param quotes - Array of all quotes
 * @param invoices - Array of all invoices
 * @param workOrders - Array of all work orders
 * @returns Customer journey data organized by status
 */
export const getCustomerJourney = (
  customerId: string,
  quotes: Quote[],
  invoices: Invoice[],
  workOrders: WorkOrder[]
): CustomerJourney => {
  const customerQuotes = quotes.filter((q) => q.customerId === customerId);
  const customerInvoices = invoices.filter(
    (inv) => inv.customerId === customerId
  );
  const customerWorkOrders = workOrders.filter(
    (wo) => wo.customerId === customerId
  );

  // Organize by status
  const quotesByStatus = {
    draft: customerQuotes.filter((q) => q.status === "draft"),
    sent: customerQuotes.filter((q) => q.status === "sent"),
    approved: customerQuotes.filter((q) => q.status === "approved"),
    rejected: customerQuotes.filter((q) => q.status === "rejected"),
    expired: customerQuotes.filter((q) => q.status === "expired"),
  };

  const invoicesByStatus = {
    draft: customerInvoices.filter((inv) => inv.status === "draft"),
    sent: customerInvoices.filter((inv) => inv.status === "sent"),
    paid: customerInvoices.filter((inv) => inv.status === "paid"),
    overdue: customerInvoices.filter((inv) => inv.status === "overdue"),
  };

  const workOrdersByStatus = {
    todo: customerWorkOrders.filter((wo) => wo.status === "To Do"),
    inProgress: customerWorkOrders.filter(
      (wo) => wo.status === "In Uitvoering"
    ),
    pending: customerWorkOrders.filter((wo) => wo.status === "Pending"),
    completed: customerWorkOrders.filter((wo) => wo.status === "Voltooid"),
  };

  // Calculate progress percentage
  const totalSteps =
    customerQuotes.length +
    customerWorkOrders.length +
    customerInvoices.length;
  const completedSteps = invoicesByStatus.paid.length;
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return {
    quotes: customerQuotes,
    invoices: customerInvoices,
    workOrders: customerWorkOrders,
    quotesByStatus,
    invoicesByStatus,
    workOrdersByStatus,
    progressPercentage,
    totalSteps,
    completedSteps,
  };
};

/**
 * Get customer financial overview - totals and breakdowns
 * @param customerId - Customer ID
 * @param invoices - Array of all invoices
 * @param quotes - Array of all quotes
 * @returns Customer financial data
 */
export const getCustomerFinances = (
  customerId: string,
  invoices: Invoice[],
  quotes: Quote[]
): CustomerFinances => {
  const customerInvoices = invoices.filter(
    (inv) => inv.customerId === customerId
  );
  const customerQuotes = quotes.filter((q) => q.customerId === customerId);

  // Filter: alleen betaalde en openstaande facturen
  const paidAndOutstandingInvoices = customerInvoices.filter(
    (inv) =>
      inv.status === "paid" ||
      ["sent", "draft", "overdue"].includes(inv.status)
  );

  const totalInvoiced = customerInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );
  const paidInvoices = customerInvoices.filter(
    (inv) => inv.status === "paid"
  );
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingInvoices = customerInvoices.filter((inv) =>
    ["sent", "draft"].includes(inv.status)
  );
  const totalOutstanding = outstandingInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );
  const overdueInvoices = customerInvoices.filter(
    (inv) => inv.status === "overdue"
  );
  const totalOverdue = overdueInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );
  const totalQuotes = customerQuotes.reduce((sum, q) => sum + q.total, 0);

  return {
    invoices: paidAndOutstandingInvoices, // Alleen betaalde en openstaande
    quotes: customerQuotes,
    totalInvoiced,
    totalPaid,
    totalOutstanding,
    totalOverdue,
    totalQuotes,
    paidInvoices,
    outstandingInvoices,
    overdueInvoices,
  };
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
): InvoiceTotals => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, labor) => sum + labor.total, 0);
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return { subtotal, vatAmount, total };
};
