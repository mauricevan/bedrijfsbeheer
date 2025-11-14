/**
 * WorkOrders Services - Conversion Operations
 * Business logic for converting between work orders, quotes, and invoices
 */

import {
  WorkOrder,
  Quote,
  Invoice,
  QuoteItem,
  QuoteLabor,
  InventoryItem,
  User,
  Employee,
  InvoiceHistoryEntry,
} from "../../../types";
import { getEmployeeName, getCustomerName } from "../utils/formatters";

export interface ConvertToInvoiceParams {
  workOrder: WorkOrder;
  quotes: Quote[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  currentUser: User;
  employees: Employee[];
  customers: any[];
}

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (invoices: Invoice[]): string => {
  if (!invoices || invoices.length === 0) {
    const year = new Date().getFullYear();
    return `${year}-001`;
  }
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
 * Create invoice history entry
 */
export const createInvoiceHistoryEntry = (
  action: string,
  details: string,
  currentUser: User,
  extra?: any
): InvoiceHistoryEntry => {
  return {
    timestamp: new Date().toISOString(),
    action: action as any,
    performedBy: currentUser.employeeId,
    details,
    ...extra,
  };
};

/**
 * Convert completed work order to invoice
 */
export const convertWorkOrderToInvoice = (
  params: ConvertToInvoiceParams
): { invoice: Invoice; updatedWorkOrder: WorkOrder } | null => {
  const {
    workOrder,
    quotes,
    invoices,
    inventory,
    currentUser,
    employees,
    customers,
  } = params;

  // Check if invoice already exists
  if (workOrder.invoiceId) {
    const existingInvoice = invoices.find(
      (inv) => inv.id === workOrder.invoiceId
    );
    if (existingInvoice && workOrder.hoursSpent) {
      // Update existing invoice with actual hours spent
      return updateExistingInvoiceWithHours(
        existingInvoice,
        workOrder,
        currentUser
      );
    }
    return null;
  }

  // Check if quote exists and has invoice
  if (workOrder.quoteId) {
    const quote = quotes.find((q) => q.id === workOrder.quoteId);
    if (quote) {
      const existingInvoice = invoices.find(
        (inv) => inv.quoteId === quote.id
      );
      if (existingInvoice && workOrder.hoursSpent && existingInvoice.labor) {
        return updateExistingInvoiceWithHours(
          existingInvoice,
          workOrder,
          currentUser
        );
      }
    }
  }

  // Create new invoice
  if (!workOrder.customerId) {
    console.log("Kan geen factuur aanmaken: customerId ontbreekt");
    return null;
  }

  // Get items and labor from quote if exists
  let invoiceItems: QuoteItem[] = [];
  let invoiceLabor: QuoteLabor[] = [];
  let vatRate = 21;

  if (workOrder.quoteId) {
    const quote = quotes.find((q) => q.id === workOrder.quoteId);
    if (quote) {
      invoiceItems = [...quote.items];
      invoiceLabor = quote.labor ? [...quote.labor] : [];
      vatRate = quote.vatRate;

      // Update labor with actual hours spent
      if (workOrder.hoursSpent && invoiceLabor.length > 0) {
        invoiceLabor = invoiceLabor.map((labor) => ({
          ...labor,
          hours: workOrder.hoursSpent || labor.hours,
          total: (workOrder.hoursSpent || labor.hours) * labor.hourlyRate,
        }));
      }
    }
  }

  // If no items from quote, use work order data
  if (invoiceItems.length === 0) {
    invoiceItems = workOrder.requiredInventory.map((req) => {
      const invItem = inventory.find((i) => i.id === req.itemId);
      return {
        inventoryItemId: req.itemId,
        description: invItem?.name || "Onbekend item",
        quantity: req.quantity,
        pricePerUnit: invItem?.price || 0,
        total: (invItem?.price || 0) * req.quantity,
      };
    });

    // If still no items, create default item
    if (invoiceItems.length === 0) {
      invoiceItems = [
        {
          description: `Werkzaamheden - ${workOrder.title}`,
          quantity: 1,
          pricePerUnit: workOrder.estimatedCost || 0,
          total: workOrder.estimatedCost || 0,
        },
      ];
    }
  }

  // If no labor from quote and hours spent, create labor entry
  if (
    invoiceLabor.length === 0 &&
    workOrder.hoursSpent &&
    workOrder.hoursSpent > 0
  ) {
    invoiceLabor = [
      {
        description: `Werkzaamheden - ${workOrder.title}`,
        hours: workOrder.hoursSpent,
        hourlyRate: 65,
        total: workOrder.hoursSpent * 65,
      },
    ];
  }

  // Calculate totals
  const itemsSubtotal = invoiceItems.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const laborSubtotal = invoiceLabor.reduce(
    (sum, labor) => sum + labor.total,
    0
  );
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  // Create invoice dates
  const today = new Date().toISOString().split("T")[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateStr = dueDate.toISOString().split("T")[0];

  const now = new Date().toISOString();
  const customerName =
    getCustomerName(workOrder.customerId, customers) || "Onbekende klant";

  const invoice: Invoice = {
    id: `inv${Date.now()}`,
    invoiceNumber: generateInvoiceNumber(invoices),
    customerId: workOrder.customerId,
    workOrderId: workOrder.id,
    quoteId: workOrder.quoteId,
    items: invoiceItems,
    labor: invoiceLabor.length > 0 ? invoiceLabor : undefined,
    subtotal,
    vatRate,
    vatAmount,
    total,
    status: "draft",
    issueDate: today,
    dueDate: dueDateStr,
    paymentTerms: "14 dagen",
    notes: `Factuur aangemaakt automatisch na voltooiing werkorder ${
      workOrder.id
    }\n${workOrder.notes || ""}`,
    location: workOrder.location,
    scheduledDate: workOrder.scheduledDate,
    createdBy: currentUser.employeeId,
    timestamps: {
      created: now,
    },
    history: [
      createInvoiceHistoryEntry(
        "created",
        `Factuur automatisch aangemaakt na voltooiing werkorder ${
          workOrder.id
        } door ${getEmployeeName(currentUser.employeeId, employees)}`,
        currentUser
      ),
    ],
  };

  const updatedWorkOrder = {
    ...workOrder,
    invoiceId: invoice.id,
  };

  return { invoice, updatedWorkOrder };
};

/**
 * Update existing invoice with actual hours from work order
 */
const updateExistingInvoiceWithHours = (
  existingInvoice: Invoice,
  workOrder: WorkOrder,
  currentUser: User
): { invoice: Invoice; updatedWorkOrder: WorkOrder } | null => {
  if (!workOrder.hoursSpent) return null;

  const updatedLabor: QuoteLabor[] = existingInvoice.labor
    ? existingInvoice.labor.map((labor) => ({
        ...labor,
        hours: workOrder.hoursSpent || labor.hours,
        total: (workOrder.hoursSpent || labor.hours) * labor.hourlyRate,
      }))
    : [];

  const itemsSubtotal = existingInvoice.items.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const laborSubtotal = updatedLabor.reduce(
    (sum, labor) => sum + labor.total,
    0
  );
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (existingInvoice.vatRate / 100);
  const total = subtotal + vatAmount;

  const updatedInvoice: Invoice = {
    ...existingInvoice,
    labor: updatedLabor.length > 0 ? updatedLabor : undefined,
    subtotal,
    vatAmount,
    total,
    history: [
      ...(existingInvoice.history || []),
      createInvoiceHistoryEntry(
        "updated",
        `Factuur bijgewerkt met werkelijke gewerkte uren (${workOrder.hoursSpent}u) na voltooiing werkorder ${workOrder.id}`,
        currentUser
      ),
    ],
  };

  return { invoice: updatedInvoice, updatedWorkOrder: workOrder };
};

/**
 * Convert quote to work order
 */
export const convertQuoteToWorkOrder = (
  quote: Quote,
  assignedTo: string,
  currentUser: User,
  employees: Employee[],
  customers: any[]
): WorkOrder => {
  const now = new Date().toISOString();
  const workOrderId = `wo${Date.now()}`;
  const customerName = getCustomerName(quote.customerId, customers) || "Onbekend";
  const totalHours =
    quote.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

  const workOrder: WorkOrder = {
    id: workOrderId,
    title: `${customerName} - Offerte ${quote.id}`,
    description:
      quote.notes || `Werkorder aangemaakt vanuit offerte ${quote.id}`,
    status: "To Do",
    assignedTo,
    assignedBy: currentUser.employeeId,
    convertedBy: currentUser.employeeId,
    requiredInventory: quote.items
      .filter((item) => item.inventoryItemId)
      .map((item) => ({
        itemId: item.inventoryItemId!,
        quantity: item.quantity,
      })),
    createdDate: new Date().toISOString().split("T")[0],
    customerId: quote.customerId,
    quoteId: quote.id,
    estimatedHours: totalHours,
    estimatedCost: quote.total,
    notes: `Geschatte uren: ${totalHours}u\nGeschatte kosten: €${quote.total.toFixed(
      2
    )}`,
    timestamps: {
      created: now,
      converted: now,
      assigned: now,
    },
    history: [
      {
        timestamp: now,
        action: "created",
        performedBy: currentUser.employeeId,
        details: `Werkorder aangemaakt door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )}`,
      },
      {
        timestamp: now,
        action: "converted",
        performedBy: currentUser.employeeId,
        details: `Geconverteerd van geclonede offerte ${
          quote.id
        } door ${getEmployeeName(currentUser.employeeId, employees)}`,
      },
      {
        timestamp: now,
        action: "assigned",
        performedBy: currentUser.employeeId,
        details: `Toegewezen aan ${getEmployeeName(
          assignedTo,
          employees
        )} door ${getEmployeeName(currentUser.employeeId, employees)}`,
      },
    ],
  };

  return workOrder;
};

/**
 * Convert invoice to work order
 */
export const convertInvoiceToWorkOrder = (
  invoice: Invoice,
  assignedTo: string,
  currentUser: User,
  employees: Employee[],
  customers: any[]
): WorkOrder => {
  const now = new Date().toISOString();
  const workOrderId = `wo${Date.now()}`;
  const customerName = getCustomerName(invoice.customerId, customers) || "Onbekend";
  const totalHours =
    invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

  const workOrder: WorkOrder = {
    id: workOrderId,
    title: `${customerName} - Factuur ${invoice.invoiceNumber}`,
    description:
      invoice.notes ||
      `Werkorder aangemaakt vanuit factuur ${invoice.invoiceNumber}`,
    status: "To Do",
    assignedTo,
    assignedBy: currentUser.employeeId,
    convertedBy: currentUser.employeeId,
    requiredInventory: invoice.items
      .filter((item) => item.inventoryItemId)
      .map((item) => ({
        itemId: item.inventoryItemId!,
        quantity: item.quantity,
      })),
    createdDate: new Date().toISOString().split("T")[0],
    customerId: invoice.customerId,
    invoiceId: invoice.id,
    estimatedHours: totalHours,
    estimatedCost: invoice.total,
    notes: `Geschatte uren: ${totalHours}u\nGeschatte kosten: €${invoice.total.toFixed(
      2
    )}`,
    timestamps: {
      created: now,
      converted: now,
      assigned: now,
    },
    history: [
      {
        timestamp: now,
        action: "created",
        performedBy: currentUser.employeeId,
        details: `Werkorder aangemaakt door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )}`,
      },
      {
        timestamp: now,
        action: "converted",
        performedBy: currentUser.employeeId,
        details: `Geconverteerd van geclonede factuur ${
          invoice.invoiceNumber
        } door ${getEmployeeName(currentUser.employeeId, employees)}`,
      },
      {
        timestamp: now,
        action: "assigned",
        performedBy: currentUser.employeeId,
        details: `Toegewezen aan ${getEmployeeName(
          assignedTo,
          employees
        )} door ${getEmployeeName(currentUser.employeeId, employees)}`,
      },
    ],
  };

  return workOrder;
};
