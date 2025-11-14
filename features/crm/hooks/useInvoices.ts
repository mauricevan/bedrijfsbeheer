import type {
  Invoice,
  Quote,
  QuoteItem,
  QuoteLabor,
  WorkOrder,
  User,
  Customer,
  Employee,
} from "../../../types";
import {
  generateInvoiceNumber as generateInvoiceNumberService,
  calculateInvoiceTotals as calculateInvoiceTotalsService,
  createHistoryEntry,
} from "../services/invoiceService";
import type { InvoiceFormData, QuoteFormData } from "./useCRMState";

/**
 * Props for useInvoices hook
 */
interface UseInvoicesProps {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  customers: Customer[];
  employees: Employee[];
  currentUser: User;
}

/**
 * Invoice and Quote management hook
 * Handles invoice/quote CRUD operations, conversions, and calculations
 */
export const useInvoices = ({
  invoices,
  setInvoices,
  quotes,
  setQuotes,
  workOrders,
  setWorkOrders,
  customers,
  employees,
  currentUser,
}: UseInvoicesProps) => {
  /**
   * Get customer name by ID
   */
  const getCustomerName = (customerId?: string): string => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Onbekend";
  };

  /**
   * Get employee name by ID
   */
  const getEmployeeName = (employeeId?: string): string => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Onbekend";
  };

  /**
   * Generate invoice number
   */
  const generateInvoiceNumber = (): string => {
    return generateInvoiceNumberService(invoices);
  };

  /**
   * Calculate invoice totals
   */
  const calculateInvoiceTotals = (
    items: QuoteItem[],
    labor: QuoteLabor[],
    vatRate: number
  ) => {
    return calculateInvoiceTotalsService(items, labor, vatRate);
  };

  /**
   * Clone an existing invoice
   */
  const handleCloneInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return null;

    const today = new Date().toISOString().split("T")[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    return {
      customerId: invoice.customerId,
      items: invoice.items,
      labor: invoice.labor || [],
      vatRate: invoice.vatRate,
      notes: invoice.notes || "",
      paymentTerms: invoice.paymentTerms,
      issueDate: today,
      dueDate: dueDate.toISOString().split("T")[0],
    };
  };

  /**
   * Edit an existing invoice
   */
  const handleEditInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return null;

    return {
      customerId: invoice.customerId,
      items: invoice.items,
      labor: invoice.labor || [],
      vatRate: invoice.vatRate,
      notes: invoice.notes || "",
      paymentTerms: invoice.paymentTerms,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
    };
  };

  /**
   * Save cloned invoice
   */
  const handleSaveClonedInvoice = (formData: InvoiceFormData) => {
    if (
      !formData.customerId ||
      formData.items.length === 0 ||
      !formData.issueDate ||
      !formData.dueDate
    ) {
      alert("Vul alle verplichte velden in!");
      return null;
    }

    const { subtotal, vatAmount, total } = calculateInvoiceTotals(
      formData.items,
      formData.labor,
      formData.vatRate
    );
    const now = new Date().toISOString();
    const customerName = getCustomerName(formData.customerId);

    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: formData.customerId,
      items: formData.items,
      labor: formData.labor.length > 0 ? formData.labor : undefined,
      subtotal: subtotal,
      vatRate: formData.vatRate,
      vatAmount: vatAmount,
      total: total,
      status: "draft",
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      notes: formData.notes,
      paymentTerms: formData.paymentTerms,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createHistoryEntry(
          "invoice",
          "created",
          `Factuur gecloneerd door ${getEmployeeName(
            currentUser.employeeId
          )} voor klant ${customerName}`,
          currentUser
        ),
      ],
    };

    setInvoices([...invoices, invoice]);
    return invoice;
  };

  /**
   * Save edited invoice
   */
  const handleSaveEditedInvoice = (
    invoiceId: string,
    formData: InvoiceFormData
  ) => {
    if (
      !formData.customerId ||
      formData.items.length === 0 ||
      !formData.issueDate ||
      !formData.dueDate
    ) {
      alert("Vul alle verplichte velden in!");
      return null;
    }

    const { subtotal, vatAmount, total } = calculateInvoiceTotals(
      formData.items,
      formData.labor,
      formData.vatRate
    );
    const existingInvoice = invoices.find((inv) => inv.id === invoiceId);
    if (!existingInvoice) return null;

    const updatedInvoice: Invoice = {
      ...existingInvoice,
      customerId: formData.customerId,
      items: formData.items,
      labor: formData.labor.length > 0 ? formData.labor : undefined,
      subtotal: subtotal,
      vatRate: formData.vatRate,
      vatAmount: vatAmount,
      total: total,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      notes: formData.notes,
      paymentTerms: formData.paymentTerms,
      history: [
        ...(existingInvoice.history || []),
        createHistoryEntry(
          "invoice",
          "updated",
          `Factuur bijgewerkt door ${getEmployeeName(currentUser.employeeId)}`,
          currentUser
        ),
      ],
    };

    setInvoices(
      invoices.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv))
    );
    return updatedInvoice;
  };

  /**
   * Convert invoice to work order
   */
  const convertInvoiceToWorkOrder = (
    invoiceId: string,
    selectedUserId: string
  ) => {
    if (!selectedUserId) {
      alert("Selecteer een medewerker!");
      return null;
    }

    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return null;

    if (invoice.status !== "sent" && invoice.status !== "draft") {
      alert(
        "Alleen verzonden of concept facturen kunnen worden omgezet naar werkorders!"
      );
      return null;
    }

    if (invoice.workOrderId) {
      alert("Deze factuur heeft al een gekoppelde werkorder!");
      return null;
    }

    const now = new Date().toISOString();
    const workOrderId = `wo${Date.now()}`;
    const customerName = getCustomerName(invoice.customerId);
    const totalHours =
      invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

    const workOrder: WorkOrder = {
      id: workOrderId,
      title: `${customerName} - Factuur ${invoice.invoiceNumber}`,
      description:
        invoice.notes ||
        `Werkorder aangemaakt vanuit factuur ${invoice.invoiceNumber}`,
      status: "To Do",
      assignedTo: selectedUserId,
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
      location: invoice.location,
      scheduledDate: invoice.scheduledDate,
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
            currentUser.employeeId
          )}`,
        },
        {
          timestamp: now,
          action: "converted",
          performedBy: currentUser.employeeId,
          details: `Geconverteerd van factuur ${
            invoice.invoiceNumber
          } door ${getEmployeeName(currentUser.employeeId)}`,
        },
        {
          timestamp: now,
          action: "assigned",
          performedBy: currentUser.employeeId,
          details: `Toegewezen aan ${getEmployeeName(
            selectedUserId
          )} door ${getEmployeeName(currentUser.employeeId)}`,
          toAssignee: selectedUserId,
        },
      ],
    };

    setWorkOrders([...workOrders, workOrder]);

    setInvoices(
      invoices.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              workOrderId: workOrder.id,
              timestamps: {
                ...inv.timestamps,
                convertedToWorkOrder: now,
              },
              history: [
                ...(inv.history || []),
                createHistoryEntry(
                  "invoice",
                  "converted_to_workorder",
                  `Geconverteerd naar werkorder ${
                    workOrder.id
                  } door ${getEmployeeName(currentUser.employeeId)}`,
                  currentUser
                ),
              ],
            }
          : inv
      )
    );

    return workOrder;
  };

  // ============ QUOTE OPERATIONS ============

  /**
   * Clone an existing quote
   */
  const handleCloneQuote = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    return {
      customerId: quote.customerId,
      items: quote.items,
      labor: quote.labor || [],
      vatRate: quote.vatRate,
      notes: quote.notes || "",
      validUntil: "", // User should set new date
    };
  };

  /**
   * Edit an existing quote
   */
  const handleEditQuote = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    return {
      customerId: quote.customerId,
      items: quote.items,
      labor: quote.labor || [],
      vatRate: quote.vatRate,
      notes: quote.notes || "",
      validUntil: quote.validUntil,
    };
  };

  /**
   * Convert quote to work order
   */
  const convertQuoteToWorkOrder = (quoteId: string, selectedUserId: string) => {
    if (!selectedUserId) {
      alert("Selecteer een medewerker!");
      return null;
    }

    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    const now = new Date().toISOString();
    const workOrderId = `wo${Date.now()}`;
    const customerName = getCustomerName(quote.customerId);
    const totalHours =
      quote.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

    const workOrder: WorkOrder = {
      id: workOrderId,
      title: `${customerName} - Offerte ${quote.quoteNumber}`,
      description:
        quote.notes ||
        `Werkorder aangemaakt vanuit offerte ${quote.quoteNumber}`,
      status: "To Do",
      assignedTo: selectedUserId,
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
            currentUser.employeeId
          )}`,
        },
        {
          timestamp: now,
          action: "converted",
          performedBy: currentUser.employeeId,
          details: `Geconverteerd van offerte ${
            quote.quoteNumber
          } door ${getEmployeeName(currentUser.employeeId)}`,
        },
        {
          timestamp: now,
          action: "assigned",
          performedBy: currentUser.employeeId,
          details: `Toegewezen aan ${getEmployeeName(
            selectedUserId
          )} door ${getEmployeeName(currentUser.employeeId)}`,
          toAssignee: selectedUserId,
        },
      ],
    };

    setWorkOrders([...workOrders, workOrder]);

    setQuotes(
      quotes.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              workOrderId: workOrder.id,
              timestamps: {
                ...q.timestamps,
                convertedToWorkOrder: now,
              },
              history: [
                ...(q.history || []),
                createHistoryEntry(
                  "quote",
                  "converted_to_workorder",
                  `Geconverteerd naar werkorder ${
                    workOrder.id
                  } door ${getEmployeeName(currentUser.employeeId)}`,
                  currentUser
                ),
              ],
            }
          : q
      )
    );

    return workOrder;
  };

  return {
    // Invoice operations
    handleCloneInvoice,
    handleEditInvoice,
    handleSaveClonedInvoice,
    handleSaveEditedInvoice,
    convertInvoiceToWorkOrder,

    // Quote operations
    handleCloneQuote,
    handleEditQuote,
    convertQuoteToWorkOrder,

    // Helper functions
    generateInvoiceNumber,
    calculateInvoiceTotals,
    getCustomerName,
    getEmployeeName,
  };
};
