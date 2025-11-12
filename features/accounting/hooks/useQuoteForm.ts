import { useState, useCallback } from "react";
import type { QuoteItem, QuoteLabor, InventoryItem } from "../../../types";
import { useForm } from "./useForm";
import { validateQuoteForm } from "../utils/validators";
import { calculateQuoteTotals } from "../utils/calculations";

/**
 * Quote form data interface
 */
export interface QuoteFormData {
  customerId: string;
  items: QuoteItem[];
  labor: QuoteLabor[];
  vatRate: number;
  notes: string;
  validUntil: string;
}

/**
 * Initial quote form data
 */
const initialQuoteFormData: QuoteFormData = {
  customerId: "",
  items: [],
  labor: [],
  vatRate: 21,
  notes: "",
  validUntil: "",
};

/**
 * Hook for managing quote form state and handlers
 * @param inventory - Array of inventory items (for item selection)
 * @returns Quote form state and handlers
 */
export const useQuoteForm = (inventory: InventoryItem[] = []) => {
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const form = useForm<QuoteFormData>(
    initialQuoteFormData,
    (data) => validateQuoteForm(data)
  );

  /**
   * Calculate quote totals
   */
  const totals = useCallback(() => {
    return calculateQuoteTotals(
      form.formData.items,
      form.formData.labor,
      form.formData.vatRate
    );
  }, [form.formData.items, form.formData.labor, form.formData.vatRate]);

  /**
   * Add inventory item to quote
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
   * Add custom item to quote
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
   * Add labor item to quote
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
   * Remove item from quote
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
   * Remove labor item from quote
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
   * Load quote data into form for editing
   */
  const loadQuoteForEditing = useCallback(
    (quote: {
      customerId: string;
      items: QuoteItem[];
      labor?: QuoteLabor[];
      vatRate: number;
      notes?: string;
      validUntil: string;
    }) => {
      form.setFields({
        customerId: quote.customerId,
        items: quote.items,
        labor: quote.labor || [],
        vatRate: quote.vatRate,
        notes: quote.notes || "",
        validUntil: quote.validUntil,
      });
    },
    [form]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    form.reset();
    setEditingQuoteId(null);
  }, [form]);

  return {
    // Form state
    formData: form.formData,
    errors: form.errors,
    isSubmitting: form.isSubmitting,
    hasErrors: form.hasErrors,
    editingQuoteId,
    setEditingQuoteId,

    // Form handlers
    handleChange: form.handleChange,
    handleNestedChange: form.handleNestedChange,
    setFields: form.setFields,
    validate: form.validate,
    reset: resetForm,

    // Quote-specific handlers
    handleAddInventoryItem,
    handleAddCustomItem,
    handleAddLabor,
    handleRemoveItem,
    handleRemoveLabor,
    handleInventoryItemChange,
    handleItemChange,
    handleLaborChange,
    loadQuoteForEditing,

    // Calculations
    totals,
  };
};

