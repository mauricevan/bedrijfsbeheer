/**
 * Batch Operations Utility
 *
 * Lean Six Sigma Optimization: Process multiple items simultaneously
 * Expected Impact:
 * - Reduces processing time for bulk actions by 80%
 * - Eliminates repetitive manual actions
 * - Ensures consistency across batch updates
 *
 * Supported Operations:
 * - Bulk send quotes/invoices
 * - Bulk status updates
 * - Bulk assignment of work orders
 * - Bulk payment recording
 * - Bulk expiry management
 */

import type { Quote, Invoice, WorkOrder, Employee } from "../types";

export interface BatchResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
  updatedItems: string[]; // IDs of successfully updated items
}

export interface BatchOperation {
  operation: string;
  itemIds: string[];
  params: Record<string, any>;
}

// ==================== QUOTE BATCH OPERATIONS ====================

/**
 * Batch send quotes
 * Updates status to "sent" and sets sent timestamp
 */
export function batchSendQuotes(
  quotes: Quote[],
  quoteIds: string[],
  performedBy: string
): { updatedQuotes: Quote[]; result: BatchResult } {
  const result: BatchResult = {
    success: 0,
    failed: 0,
    errors: [],
    updatedItems: [],
  };

  const now = new Date().toISOString();

  const updatedQuotes = quotes.map((quote) => {
    if (!quoteIds.includes(quote.id)) {
      return quote;
    }

    // Validate quote can be sent
    if (quote.status !== "draft") {
      result.failed++;
      result.errors.push({
        id: quote.id,
        error: `Quote must be in draft status (current: ${quote.status})`,
      });
      return quote;
    }

    // Update quote
    result.success++;
    result.updatedItems.push(quote.id);

    return {
      ...quote,
      status: "sent" as const,
      timestamps: {
        ...quote.timestamps,
        sent: now,
      },
      history: [
        ...(quote.history || []),
        {
          timestamp: now,
          action: "sent" as const,
          performedBy,
          details: `Quote sent via batch operation`,
          fromStatus: quote.status,
          toStatus: "sent" as const,
        },
      ],
    };
  });

  return { updatedQuotes, result };
}

/**
 * Batch expire quotes
 */
export function batchExpireQuotes(
  quotes: Quote[],
  quoteIds: string[],
  performedBy: string
): { updatedQuotes: Quote[]; result: BatchResult } {
  const result: BatchResult = {
    success: 0,
    failed: 0,
    errors: [],
    updatedItems: [],
  };

  const now = new Date().toISOString();

  const updatedQuotes = quotes.map((quote) => {
    if (!quoteIds.includes(quote.id)) {
      return quote;
    }

    // Validate quote can be expired
    if (quote.status !== "sent") {
      result.failed++;
      result.errors.push({
        id: quote.id,
        error: `Only sent quotes can be expired (current: ${quote.status})`,
      });
      return quote;
    }

    result.success++;
    result.updatedItems.push(quote.id);

    return {
      ...quote,
      status: "expired" as const,
      timestamps: {
        ...quote.timestamps,
        expired: now,
      },
      history: [
        ...(quote.history || []),
        {
          timestamp: now,
          action: "expired" as const,
          performedBy,
          details: `Quote expired via batch operation`,
          fromStatus: quote.status,
          toStatus: "expired" as const,
        },
      ],
    };
  });

  return { updatedQuotes, result };
}

/**
 * Batch update quote validity period
 */
export function batchExtendQuoteValidity(
  quotes: Quote[],
  quoteIds: string[],
  additionalDays: number,
  performedBy: string
): { updatedQuotes: Quote[]; result: BatchResult } {
  const result: BatchResult = {
    success: 0,
    failed: 0,
    errors: [],
    updatedItems: [],
  };

  const now = new Date().toISOString();

  const updatedQuotes = quotes.map((quote) => {
    if (!quoteIds.includes(quote.id)) {
      return quote;
    }

    // Only extend sent quotes
    if (quote.status !== "sent") {
      result.failed++;
      result.errors.push({
        id: quote.id,
        error: `Only sent quotes can be extended (current: ${quote.status})`,
      });
      return quote;
    }

    // Calculate new validity date
    const currentValidity = new Date(quote.validUntil);
    currentValidity.setDate(currentValidity.getDate() + additionalDays);
    const newValidUntil = currentValidity.toISOString().split("T")[0];

    result.success++;
    result.updatedItems.push(quote.id);

    return {
      ...quote,
      validUntil: newValidUntil,
      history: [
        ...(quote.history || []),
        {
          timestamp: now,
          action: "updated" as const,
          performedBy,
          details: `Validity extended by ${additionalDays} days to ${newValidUntil}`,
        },
      ],
    };
  });

  return { updatedQuotes, result };
}

// ==================== INVOICE BATCH OPERATIONS ====================

/**
 * Batch send invoices
 */
export function batchSendInvoices(
  invoices: Invoice[],
  invoiceIds: string[],
  performedBy: string
): { updatedInvoices: Invoice[]; result: BatchResult } {
  const result: BatchResult = {
    success: 0,
    failed: 0,
    errors: [],
    updatedItems: [],
  };

  const now = new Date().toISOString();

  const updatedInvoices = invoices.map((invoice) => {
    if (!invoiceIds.includes(invoice.id)) {
      return invoice;
    }

    if (invoice.status !== "draft") {
      result.failed++;
      result.errors.push({
        id: invoice.id,
        error: `Invoice must be in draft status (current: ${invoice.status})`,
      });
      return invoice;
    }

    result.success++;
    result.updatedItems.push(invoice.id);

    return {
      ...invoice,
      status: "sent" as const,
      timestamps: {
        ...invoice.timestamps,
        sent: now,
      },
      history: [
        ...(invoice.history || []),
        {
          timestamp: now,
          action: "sent" as const,
          performedBy,
          details: `Invoice sent via batch operation`,
          fromStatus: invoice.status,
          toStatus: "sent" as const,
        },
      ],
    };
  });

  return { updatedInvoices, result };
}

/**
 * Batch mark invoices as paid
 */
export function batchMarkInvoicesPaid(
  invoices: Invoice[],
  invoiceIds: string[],
  paidDate: string,
  performedBy: string
): { updatedInvoices: Invoice[]; result: BatchResult } {
  const result: BatchResult = {
    success: 0,
    failed: 0,
    errors: [],
    updatedItems: [],
  };

  const now = new Date().toISOString();

  const updatedInvoices = invoices.map((invoice) => {
    if (!invoiceIds.includes(invoice.id)) {
      return invoice;
    }

    if (invoice.status === "paid" || invoice.status === "cancelled") {
      result.failed++;
      result.errors.push({
        id: invoice.id,
        error: `Invoice already ${invoice.status}`,
      });
      return invoice;
    }

    result.success++;
    result.updatedItems.push(invoice.id);

    return {
      ...invoice,
      status: "paid" as const,
      paidDate,
      timestamps: {
        ...invoice.timestamps,
        paid: paidDate,
      },
      history: [
        ...(invoice.history || []),
        {
          timestamp: now,
          action: "paid" as const,
          performedBy,
          details: `Invoice marked as paid via batch operation (paid on ${paidDate})`,
          fromStatus: invoice.status,
          toStatus: "paid" as const,
        },
      ],
    };
  });

  return { updatedInvoices, result };
}

/**
 * Batch update invoice due dates
 */
export function batchUpdateInvoiceDueDates(
  invoices: Invoice[],
  invoiceIds: string[],
  additionalDays: number,
  performedBy: string
): { updatedInvoices: Invoice[]; result: BatchResult } {
  const result: BatchResult = {
    success: 0,
    failed: 0,
    errors: [],
    updatedItems: [],
  };

  const now = new Date().toISOString();

  const updatedInvoices = invoices.map((invoice) => {
    if (!invoiceIds.includes(invoice.id)) {
      return invoice;
    }

    if (invoice.status === "paid" || invoice.status === "cancelled") {
      result.failed++;
      result.errors.push({
        id: invoice.id,
        error: `Cannot update due date for ${invoice.status} invoice`,
      });
      return invoice;
    }

    const currentDue = new Date(invoice.dueDate);
    currentDue.setDate(currentDue.getDate() + additionalDays);
    const newDueDate = currentDue.toISOString().split("T")[0];

    result.success++;
    result.updatedItems.push(invoice.id);

    return {
      ...invoice,
      dueDate: newDueDate,
      history: [
        ...(invoice.history || []),
        {
          timestamp: now,
          action: "updated" as const,
          performedBy,
          details: `Due date extended by ${additionalDays} days to ${newDueDate}`,
        },
      ],
    };
  });

  return { updatedInvoices, result };
}

// ==================== WORK ORDER BATCH OPERATIONS ====================

/**
 * Batch assign work orders to employees
 */
export function batchAssignWorkOrders(
  workOrders: WorkOrder[],
  workOrderIds: string[],
  employeeId: string,
  performedBy: string
): { updatedWorkOrders: WorkOrder[]; result: BatchResult } {
  const result: BatchResult = {
    success: 0,
    failed: 0,
    errors: [],
    updatedItems: [],
  };

  const now = new Date().toISOString();

  const updatedWorkOrders = workOrders.map((wo) => {
    if (!workOrderIds.includes(wo.id)) {
      return wo;
    }

    if (wo.status === "Completed" || wo.status === "Cancelled") {
      result.failed++;
      result.errors.push({
        id: wo.id,
        error: `Cannot reassign ${wo.status.toLowerCase()} work order`,
      });
      return wo;
    }

    result.success++;
    result.updatedItems.push(wo.id);

    return {
      ...wo,
      assignedTo: employeeId,
      assignedBy: performedBy,
      timestamps: {
        ...wo.timestamps,
        assigned: now,
      },
      history: [
        ...(wo.history || []),
        {
          timestamp: now,
          action: "assigned" as const,
          performedBy,
          details: `Work order reassigned to employee ${employeeId} via batch operation`,
          toAssignee: employeeId,
        },
      ],
    };
  });

  return { updatedWorkOrders, result };
}

/**
 * Batch update work order status
 */
export function batchUpdateWorkOrderStatus(
  workOrders: WorkOrder[],
  workOrderIds: string[],
  newStatus: WorkOrder["status"],
  performedBy: string
): { updatedWorkOrders: WorkOrder[]; result: BatchResult } {
  const result: BatchResult = {
    success: 0,
    failed: 0,
    errors: [],
    updatedItems: [],
  };

  const now = new Date().toISOString();

  const updatedWorkOrders = workOrders.map((wo) => {
    if (!workOrderIds.includes(wo.id)) {
      return wo;
    }

    if (wo.status === newStatus) {
      result.failed++;
      result.errors.push({
        id: wo.id,
        error: `Work order already has status: ${newStatus}`,
      });
      return wo;
    }

    result.success++;
    result.updatedItems.push(wo.id);

    const updatedTimestamps = { ...wo.timestamps };
    if (newStatus === "In Progress" && !updatedTimestamps.started) {
      updatedTimestamps.started = now;
    } else if (newStatus === "Completed" && !updatedTimestamps.completed) {
      updatedTimestamps.completed = now;
    }

    return {
      ...wo,
      status: newStatus,
      timestamps: updatedTimestamps,
      ...(newStatus === "Completed" && { completedDate: now.split("T")[0] }),
      history: [
        ...(wo.history || []),
        {
          timestamp: now,
          action: "status_changed" as const,
          performedBy,
          details: `Status changed from ${wo.status} to ${newStatus} via batch operation`,
          fromStatus: wo.status,
          toStatus: newStatus,
        },
      ],
    };
  });

  return { updatedWorkOrders, result };
}

// ==================== BATCH OPERATION VALIDATOR ====================

/**
 * Validate batch operation before execution
 * Returns validation errors if any
 */
export function validateBatchOperation(
  operation: BatchOperation,
  dataLength: number
): string[] {
  const errors: string[] = [];

  if (!operation.itemIds || operation.itemIds.length === 0) {
    errors.push("No items selected for batch operation");
  }

  if (operation.itemIds.length > 100) {
    errors.push("Batch operations limited to 100 items at a time");
  }

  if (operation.itemIds.some((id) => !id || typeof id !== "string")) {
    errors.push("Invalid item IDs in batch selection");
  }

  // Operation-specific validation
  switch (operation.operation) {
    case "extendValidity":
    case "extendDueDate":
      if (!operation.params.days || operation.params.days < 1) {
        errors.push("Days must be a positive number");
      }
      break;

    case "assignWorkOrders":
      if (!operation.params.employeeId) {
        errors.push("Employee ID required for assignment");
      }
      break;

    case "markPaid":
      if (!operation.params.paidDate) {
        errors.push("Payment date required");
      }
      break;

    case "updateStatus":
      if (!operation.params.status) {
        errors.push("New status required");
      }
      break;
  }

  return errors;
}

/**
 * Execute batch operation with validation and logging
 */
export function executeBatchOperation(
  operation: BatchOperation,
  data: { quotes?: Quote[]; invoices?: Invoice[]; workOrders?: WorkOrder[] },
  performedBy: string
): {
  quotes?: Quote[];
  invoices?: Invoice[];
  workOrders?: WorkOrder[];
  result: BatchResult;
  errors: string[];
} {
  // Validate operation
  const dataLength =
    (data.quotes?.length || 0) +
    (data.invoices?.length || 0) +
    (data.workOrders?.length || 0);
  const validationErrors = validateBatchOperation(operation, dataLength);

  if (validationErrors.length > 0) {
    return {
      ...data,
      result: { success: 0, failed: operation.itemIds.length, errors: [], updatedItems: [] },
      errors: validationErrors,
    };
  }

  // Execute operation based on type
  try {
    switch (operation.operation) {
      case "sendQuotes":
        if (!data.quotes) throw new Error("Quotes data required");
        const sendQuotesResult = batchSendQuotes(
          data.quotes,
          operation.itemIds,
          performedBy
        );
        return {
          quotes: sendQuotesResult.updatedQuotes,
          result: sendQuotesResult.result,
          errors: [],
        };

      case "expireQuotes":
        if (!data.quotes) throw new Error("Quotes data required");
        const expireQuotesResult = batchExpireQuotes(
          data.quotes,
          operation.itemIds,
          performedBy
        );
        return {
          quotes: expireQuotesResult.updatedQuotes,
          result: expireQuotesResult.result,
          errors: [],
        };

      case "sendInvoices":
        if (!data.invoices) throw new Error("Invoices data required");
        const sendInvoicesResult = batchSendInvoices(
          data.invoices,
          operation.itemIds,
          performedBy
        );
        return {
          invoices: sendInvoicesResult.updatedInvoices,
          result: sendInvoicesResult.result,
          errors: [],
        };

      case "markInvoicesPaid":
        if (!data.invoices) throw new Error("Invoices data required");
        const markPaidResult = batchMarkInvoicesPaid(
          data.invoices,
          operation.itemIds,
          operation.params.paidDate,
          performedBy
        );
        return {
          invoices: markPaidResult.updatedInvoices,
          result: markPaidResult.result,
          errors: [],
        };

      default:
        return {
          ...data,
          result: {
            success: 0,
            failed: operation.itemIds.length,
            errors: [],
            updatedItems: [],
          },
          errors: [`Unknown operation: ${operation.operation}`],
        };
    }
  } catch (error) {
    return {
      ...data,
      result: {
        success: 0,
        failed: operation.itemIds.length,
        errors: [],
        updatedItems: [],
      },
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
