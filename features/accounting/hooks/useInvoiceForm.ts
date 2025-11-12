import { useState, useCallback } from "react";
import type { QuoteItem, QuoteLabor, InventoryItem } from "../../../types";
import { useForm } from "./useForm";
import { validateInvoiceForm } from "../utils/validators";
import { calculateInvoiceTotals } from "../utils/calculations";

/**
 * Invoice form data interface
 */
export interface InvoiceFormData {
  customerId: string;
  items: QuoteItem[];
  labor: QuoteLabor[];
  vatRate: number;
  notes: string;
  paymentTerms: string;
  issueDate: string;
  dueDate: string;
}

/**
 * Initial invoice form data
 */
const initialInvoiceFormData: InvoiceFormData = {
  customerId: "",
  items: [],
  labor: [],
  vatRate: 21,
  notes: "",
  paymentTerms: "14 dagen",
  issueDate: "",
  dueDate: "",
};

/**
 * Hook for managing invoice form state and handlers
 * @param inventory - Array of inventory items (for item selection)
 * @returns Invoice form state and handlers
 */
export const useInvoiceForm = (inventory: InventoryItem[] = []) => {
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  const form = useForm<InvoiceFormData>(
    initialInvoiceFormData,
    (data) => validateInvoiceForm(data)
  );

  /**
   * Calculate invoice totals
   */
  const totals = useCallback(() => {
    return calculateInvoiceTotals(
      form.formData.items,
      form.formData.labor,
      form.formData.vatRate
    );
  }, [form.formData.items, form.formData.labor, form.formData.vatRate]);

  /**
   * Add inventory item to invoice
   */
  const handleAddInventoryItem = useCallback(() => {
    const newItem: QuoteItem = {
      inventoryItemId: "",
      description: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    };
    form.handleNestedChange("items", (items) => [...items, newItem]);
  }, [form]);

  /**
   * Add custom item to invoice
   */
  const handleAddCustomItem = useCallback(() => {
    const newItem: QuoteItem = {
      description: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    };
    form.handleNestedChange("items", (items) => [...items, newItem]);
  }, [form]);

  /**
   * Add labor item to invoice
   */
  const handleAddLabor = useCallback(() => {
    const newLabor: QuoteLabor = {
      description: "",
      hours: 1,
      hourlyRate: 50,
      total: 50,
    };
    form.handleNestedChange("labor", (labor) => [...labor, newLabor]);
  }, [form]);

  /**
   * Remove item from invoice
   */
  const handleRemoveItem = useCallback(
    (index: number) => {
      form.handleNestedChange("items", (items) =>
        items.filter((_, i) => i !== index)
      );
    },
    [form]
  );

  /**
   * Remove labor item from invoice
   */
  const handleRemoveLabor = useCallback(
    (index: number) => {
      form.handleNestedChange("labor", (labor) =>
        labor.filter((_, i) => i !== index)
      );
    },
    [form]
  );

  /**
   * Handle inventory item selection change
   */
  const handleInventoryItemChange = useCallback(
    (index: number, inventoryItemId: string) => {
      const inventoryItem = inventory.find((i) => i.id === inventoryItemId);
      if (inventoryItem) {
        form.handleNestedChange("items", (items) => {
          const updatedItems = [...items];
          updatedItems[index] = {
            ...updatedItems[index],
            inventoryItemId: inventoryItemId,
            description: inventoryItem.name,
            pricePerUnit: inventoryItem.price || 0,
            total: updatedItems[index].quantity * (inventoryItem.price || 0),
          };
          return updatedItems;
        });
      }
    },
    [form, inventory]
  );

  /**
   * Handle item field change
   */
  const handleItemChange = useCallback(
    (index: number, field: keyof QuoteItem, value: any) => {
      form.handleNestedChange("items", (items) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Recalculate total if quantity or pricePerUnit changes
        if (field === "quantity" || field === "pricePerUnit") {
          updatedItems[index].total =
            updatedItems[index].quantity * updatedItems[index].pricePerUnit;
        }

        return updatedItems;
      });
    },
    [form]
  );

  /**
   * Handle labor field change
   */
  const handleLaborChange = useCallback(
    (index: number, field: keyof QuoteLabor, value: any) => {
      form.handleNestedChange("labor", (labor) => {
        const updatedLabor = [...labor];
        updatedLabor[index] = { ...updatedLabor[index], [field]: value };

        // Recalculate total if hours or hourlyRate changes
        if (field === "hours" || field === "hourlyRate") {
          updatedLabor[index].total =
            updatedLabor[index].hours * updatedLabor[index].hourlyRate;
        }

        return updatedLabor;
      });
    },
    [form]
  );

  /**
   * Load invoice data into form for editing
   */
  const loadInvoiceForEditing = useCallback(
    (invoice: {
      customerId: string;
      items: QuoteItem[];
      labor?: QuoteLabor[];
      vatRate: number;
      notes?: string;
      paymentTerms?: string;
      issueDate: string;
      dueDate: string;
    }) => {
      form.setFields({
        customerId: invoice.customerId,
        items: invoice.items,
        labor: invoice.labor || [],
        vatRate: invoice.vatRate,
        notes: invoice.notes || "",
        paymentTerms: invoice.paymentTerms || "14 dagen",
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
      });
    },
    [form]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    form.reset();
    setEditingInvoiceId(null);
  }, [form]);

  return {
    // Form state
    formData: form.formData,
    errors: form.errors,
    isSubmitting: form.isSubmitting,
    hasErrors: form.hasErrors,
    editingInvoiceId,
    setEditingInvoiceId,

    // Form handlers
    handleChange: form.handleChange,
    handleNestedChange: form.handleNestedChange,
    setFields: form.setFields,
    validate: form.validate,
    reset: resetForm,

    // Invoice-specific handlers
    handleAddInventoryItem,
    handleAddCustomItem,
    handleAddLabor,
    handleRemoveItem,
    handleRemoveLabor,
    handleInventoryItemChange,
    handleItemChange,
    handleLaborChange,
    loadInvoiceForEditing,

    // Calculations
    totals,
  };
};

