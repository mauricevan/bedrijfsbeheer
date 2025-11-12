import type { QuoteItem, QuoteLabor } from "../../../types";

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Quote form data interface for validation
 */
export interface QuoteFormData {
  customerId: string;
  items: QuoteItem[];
  validUntil: string;
  vatRate?: number;
  notes?: string;
}

/**
 * Invoice form data interface for validation
 */
export interface InvoiceFormData {
  customerId: string;
  items: QuoteItem[];
  issueDate: string;
  dueDate: string;
  vatRate?: number;
  notes?: string;
  paymentTerms?: string;
}

/**
 * Validate quote form data
 * @param formData - Quote form data
 * @returns Validation result
 */
export const validateQuoteForm = (formData: QuoteFormData): ValidationResult => {
  if (!formData.customerId) {
    return {
      isValid: false,
      message: "Klant is verplicht!",
    };
  }

  if (!formData.items || formData.items.length === 0) {
    return {
      isValid: false,
      message: "Minimaal 1 item is verplicht!",
    };
  }

  if (!formData.validUntil) {
    return {
      isValid: false,
      message: "Geldig tot datum is verplicht!",
    };
  }

  // Validate date format (basic check)
  if (formData.validUntil && isNaN(Date.parse(formData.validUntil))) {
    return {
      isValid: false,
      message: "Ongeldige datum formaat!",
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate invoice form data
 * @param formData - Invoice form data
 * @returns Validation result
 */
export const validateInvoiceForm = (formData: InvoiceFormData): ValidationResult => {
  if (!formData.customerId) {
    return {
      isValid: false,
      message: "Klant is verplicht!",
    };
  }

  if (!formData.items || formData.items.length === 0) {
    return {
      isValid: false,
      message: "Minimaal 1 item is verplicht!",
    };
  }

  if (!formData.issueDate) {
    return {
      isValid: false,
      message: "Factuurdatum is verplicht!",
    };
  }

  if (!formData.dueDate) {
    return {
      isValid: false,
      message: "Vervaldatum is verplicht!",
    };
  }

  // Validate date formats
  if (formData.issueDate && isNaN(Date.parse(formData.issueDate))) {
    return {
      isValid: false,
      message: "Ongeldig factuurdatum formaat!",
    };
  }

  if (formData.dueDate && isNaN(Date.parse(formData.dueDate))) {
    return {
      isValid: false,
      message: "Ongeldig vervaldatum formaat!",
    };
  }

  // Validate that due date is after issue date
  if (formData.issueDate && formData.dueDate) {
    const issueDate = new Date(formData.issueDate);
    const dueDate = new Date(formData.dueDate);
    if (dueDate < issueDate) {
      return {
        isValid: false,
        message: "Vervaldatum moet na factuurdatum zijn!",
      };
    }
  }

  return {
    isValid: true,
  };
};

/**
 * Validate quote items
 * @param items - Array of quote items
 * @returns Validation result
 */
export const validateQuoteItems = (items: QuoteItem[]): ValidationResult => {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      message: "Minimaal 1 item is verplicht!",
    };
  }

  // Check if all items have required fields
  for (const item of items) {
    if (!item.description && !item.inventoryItemId) {
      return {
        isValid: false,
        message: "Elk item moet een beschrijving of inventaris item hebben!",
      };
    }

    if (!item.quantity || item.quantity <= 0) {
      return {
        isValid: false,
        message: "Elk item moet een hoeveelheid groter dan 0 hebben!",
      };
    }

    if (!item.price || item.price < 0) {
      return {
        isValid: false,
        message: "Elk item moet een prijs hebben!",
      };
    }
  }

  return {
    isValid: true,
  };
};

/**
 * Validate invoice items
 * @param items - Array of invoice items
 * @returns Validation result
 */
export const validateInvoiceItems = (items: QuoteItem[]): ValidationResult => {
  return validateQuoteItems(items); // Same validation logic
};

/**
 * Validate VAT rate
 * @param vatRate - VAT rate percentage
 * @returns Validation result
 */
export const validateVatRate = (vatRate: number): ValidationResult => {
  if (vatRate < 0 || vatRate > 100) {
    return {
      isValid: false,
      message: "BTW percentage moet tussen 0 en 100 zijn!",
    };
  }

  return {
    isValid: true,
  };
};

