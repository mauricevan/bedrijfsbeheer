/**
 * WorkOrders Utility Functions - Formatters
 * Pure formatting functions for work orders
 */

import {
  WorkOrderStatus,
  Employee,
  Customer,
  WorkOrder,
  Quote,
  Invoice,
} from "../../../types";

/**
 * Get color classes for work order status
 */
export const getStatusColor = (status: WorkOrderStatus): string => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-500";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-500";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-500";
    case "To Do":
      return "bg-gray-100 text-gray-800 border-gray-500";
  }
};

/**
 * Get employee name by ID
 */
export const getEmployeeName = (
  employeeId: string,
  employees: Employee[]
): string => {
  return employees.find((e) => e.id === employeeId)?.name || "Onbekend";
};

/**
 * Get customer name by ID
 */
export const getCustomerName = (
  customerId: string | undefined,
  customers: Customer[]
): string | null => {
  if (!customerId) return null;
  return customers.find((c) => c.id === customerId)?.name || "Onbekend";
};

/**
 * Get source information (quote or invoice) for a work order
 */
export const getSourceInfo = (
  workOrder: WorkOrder,
  quotes: Quote[],
  invoices: Invoice[]
):
  | { type: "offerte"; id: string; status: string }
  | { type: "factuur"; id: string; status: string }
  | null => {
  if (workOrder.quoteId) {
    const quote = quotes.find((q) => q.id === workOrder.quoteId);
    return quote
      ? { type: "offerte" as const, id: quote.id, status: quote.status }
      : null;
  }
  if (workOrder.invoiceId) {
    const invoice = invoices.find((inv) => inv.id === workOrder.invoiceId);
    return invoice
      ? {
          type: "factuur" as const,
          id: invoice.invoiceNumber,
          status: invoice.status,
        }
      : null;
  }
  return null;
};

/**
 * Format timestamp to locale string
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format timestamp as relative time
 */
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Zojuist";
  if (diffMins < 60) return `${diffMins} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays === 1) return "Gisteren";
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  return formatTimestamp(timestamp);
};

/**
 * Get icon for action type
 */
export const getActionIcon = (action: string): string => {
  switch (action) {
    case "created":
      return "🆕";
    case "converted":
      return "🔄";
    case "assigned":
      return "👤";
    case "status_changed":
      return "📊";
    case "completed":
      return "✅";
    case "reordered":
      return "🔢";
    default:
      return "📝";
  }
};

/**
 * Get priority indicator based on sort index
 */
export const getIndexPriority = (index: number | undefined): string => {
  if (!index) return "Laag";
  if (index <= 3) return "Hoog";
  if (index <= 10) return "Gemiddeld";
  return "Laag";
};
