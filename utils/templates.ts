/**
 * Quote and Invoice Templates System
 *
 * Lean Six Sigma Optimization: Pre-configured templates reduce creation time
 * Expected Impact:
 * - Reduces quote/invoice creation time by 50%
 * - Ensures consistency across documents
 * - Reduces errors from manual entry
 *
 * Template Types:
 * - Standard Service Quote
 * - Material Supply Quote
 * - Recurring Service Invoice
 * - Custom templates (user-defined)
 */

import type { QuoteItem, QuoteLabor, Invoice, Quote } from "../types";

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: "service" | "material" | "mixed" | "custom";
  items: QuoteItem[];
  labor?: QuoteLabor[];
  vatRate: number;
  notes?: string;
  defaultValidityDays: number; // Days until quote expires
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: "service" | "product" | "recurring" | "custom";
  items: QuoteItem[];
  labor?: QuoteLabor[];
  vatRate: number;
  notes?: string;
  paymentTermsDays: number; // Days until payment due
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATES_STORAGE_KEY = "document_templates";

interface TemplatesStorage {
  quoteTemplates: QuoteTemplate[];
  invoiceTemplates: InvoiceTemplate[];
}

/**
 * Load all templates from localStorage
 */
function loadTemplatesStorage(): TemplatesStorage {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading templates:", error);
  }

  return {
    quoteTemplates: getDefaultQuoteTemplates(),
    invoiceTemplates: getDefaultInvoiceTemplates(),
  };
}

/**
 * Save templates to localStorage
 */
function saveTemplatesStorage(storage: TemplatesStorage): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error saving templates:", error);
  }
}

/**
 * Get default quote templates (initial setup)
 */
function getDefaultQuoteTemplates(): QuoteTemplate[] {
  return [
    {
      id: "tpl_quote_basic_service",
      name: "Basis Serviceofferte",
      description: "Standaard offerte voor service werkzaamheden",
      category: "service",
      items: [],
      labor: [
        {
          description: "Serviceuren",
          hours: 2,
          hourlyRate: 75,
          total: 150,
        },
      ],
      vatRate: 21,
      notes: "Prijzen zijn exclusief BTW en inclusief reiskosten binnen 25km.",
      defaultValidityDays: 30,
      paymentTerms: "Betaling binnen 14 dagen na factuurdatum",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tpl_quote_material_supply",
      name: "Materiaal Levering",
      description: "Offerte voor materialen en producten",
      category: "material",
      items: [
        {
          description: "Materiaal",
          quantity: 1,
          pricePerUnit: 100,
          total: 100,
        },
      ],
      labor: [],
      vatRate: 21,
      notes: "Levertijd: 5-7 werkdagen\nPrijzen zijn exclusief BTW.",
      defaultValidityDays: 14,
      paymentTerms: "Betaling vooraf of bij levering",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tpl_quote_mixed",
      name: "Serviceproject (Gemengd)",
      description: "Offerte met zowel materialen als arbeid",
      category: "mixed",
      items: [
        {
          description: "Materialen",
          quantity: 1,
          pricePerUnit: 500,
          total: 500,
        },
      ],
      labor: [
        {
          description: "Installatiewerk",
          hours: 8,
          hourlyRate: 75,
          total: 600,
        },
      ],
      vatRate: 21,
      notes:
        "Totaalprijs voor installatie inclusief materialen.\nPrijzen zijn exclusief BTW.",
      defaultValidityDays: 30,
      paymentTerms: "50% vooruitbetaling, restant na oplevering",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Get default invoice templates
 */
function getDefaultInvoiceTemplates(): InvoiceTemplate[] {
  return [
    {
      id: "tpl_invoice_service",
      name: "Service Factuur",
      description: "Standaard factuur voor uitgevoerde werkzaamheden",
      category: "service",
      items: [],
      labor: [
        {
          description: "Uitgevoerde werkzaamheden",
          hours: 4,
          hourlyRate: 75,
          total: 300,
        },
      ],
      vatRate: 21,
      notes: "Met dank voor uw opdracht.",
      paymentTermsDays: 14,
      paymentTerms: "Betaling binnen 14 dagen",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tpl_invoice_recurring_monthly",
      name: "Terugkerende Maandelijkse Factuur",
      description: "Voor maandelijkse abonnementen of diensten",
      category: "recurring",
      items: [
        {
          description: "Maandelijkse service",
          quantity: 1,
          pricePerUnit: 250,
          total: 250,
        },
      ],
      labor: [],
      vatRate: 21,
      notes: "Automatisch verlengd. Opzeggen kan tot 1 maand voor einddatum.",
      paymentTermsDays: 14,
      paymentTerms: "Betaling via automatische incasso",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tpl_invoice_product_sale",
      name: "Product Verkoop",
      description: "Factuur voor verkochte producten",
      category: "product",
      items: [
        {
          description: "Product",
          quantity: 1,
          pricePerUnit: 100,
          total: 100,
        },
      ],
      labor: [],
      vatRate: 21,
      notes: "Garantie: 2 jaar vanaf factuurdatum.",
      paymentTermsDays: 7,
      paymentTerms: "Betaling binnen 7 dagen",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// ==================== QUOTE TEMPLATES ====================

/**
 * Get all quote templates
 */
export function getQuoteTemplates(): QuoteTemplate[] {
  const storage = loadTemplatesStorage();
  return storage.quoteTemplates;
}

/**
 * Get quote template by ID
 */
export function getQuoteTemplate(templateId: string): QuoteTemplate | null {
  const templates = getQuoteTemplates();
  return templates.find((t) => t.id === templateId) || null;
}

/**
 * Save quote template
 */
export function saveQuoteTemplate(template: QuoteTemplate): void {
  const storage = loadTemplatesStorage();

  // Check if template exists (update) or is new (add)
  const existingIndex = storage.quoteTemplates.findIndex(
    (t) => t.id === template.id
  );

  if (existingIndex >= 0) {
    storage.quoteTemplates[existingIndex] = {
      ...template,
      updatedAt: new Date().toISOString(),
    };
  } else {
    storage.quoteTemplates.push({
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveTemplatesStorage(storage);
}

/**
 * Delete quote template
 */
export function deleteQuoteTemplate(templateId: string): void {
  const storage = loadTemplatesStorage();
  storage.quoteTemplates = storage.quoteTemplates.filter(
    (t) => t.id !== templateId
  );
  saveTemplatesStorage(storage);
}

/**
 * Create quote from template
 */
export function createQuoteFromTemplate(
  templateId: string,
  customerId: string,
  overrides?: Partial<Quote>
): Partial<Quote> {
  const template = getQuoteTemplate(templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  // Calculate valid until date
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + template.defaultValidityDays);

  // Calculate totals
  const itemsSubtotal = template.items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal =
    template.labor?.reduce((sum, labor) => sum + labor.total, 0) || 0;
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = (subtotal * template.vatRate) / 100;
  const total = subtotal + vatAmount;

  return {
    customerId,
    items: [...template.items],
    labor: template.labor ? [...template.labor] : [],
    subtotal,
    vatRate: template.vatRate,
    vatAmount,
    total,
    status: "draft",
    createdDate: new Date().toISOString().split("T")[0],
    validUntil: validUntil.toISOString().split("T")[0],
    notes: template.notes || "",
    ...overrides,
  };
}

// ==================== INVOICE TEMPLATES ====================

/**
 * Get all invoice templates
 */
export function getInvoiceTemplates(): InvoiceTemplate[] {
  const storage = loadTemplatesStorage();
  return storage.invoiceTemplates;
}

/**
 * Get invoice template by ID
 */
export function getInvoiceTemplate(templateId: string): InvoiceTemplate | null {
  const templates = getInvoiceTemplates();
  return templates.find((t) => t.id === templateId) || null;
}

/**
 * Save invoice template
 */
export function saveInvoiceTemplate(template: InvoiceTemplate): void {
  const storage = loadTemplatesStorage();

  const existingIndex = storage.invoiceTemplates.findIndex(
    (t) => t.id === template.id
  );

  if (existingIndex >= 0) {
    storage.invoiceTemplates[existingIndex] = {
      ...template,
      updatedAt: new Date().toISOString(),
    };
  } else {
    storage.invoiceTemplates.push({
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveTemplatesStorage(storage);
}

/**
 * Delete invoice template
 */
export function deleteInvoiceTemplate(templateId: string): void {
  const storage = loadTemplatesStorage();
  storage.invoiceTemplates = storage.invoiceTemplates.filter(
    (t) => t.id !== templateId
  );
  saveTemplatesStorage(storage);
}

/**
 * Create invoice from template
 */
export function createInvoiceFromTemplate(
  templateId: string,
  customerId: string,
  invoiceNumber: string,
  overrides?: Partial<Invoice>
): Partial<Invoice> {
  const template = getInvoiceTemplate(templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  // Calculate due date
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + template.paymentTermsDays);

  // Calculate totals
  const itemsSubtotal = template.items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal =
    template.labor?.reduce((sum, labor) => sum + labor.total, 0) || 0;
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = (subtotal * template.vatRate) / 100;
  const total = subtotal + vatAmount;

  return {
    invoiceNumber,
    customerId,
    items: [...template.items],
    labor: template.labor ? [...template.labor] : [],
    subtotal,
    vatRate: template.vatRate,
    vatAmount,
    total,
    status: "draft",
    issueDate: issueDate.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    paymentTerms: template.paymentTerms,
    notes: template.notes || "",
    ...overrides,
  };
}

/**
 * Convert quote to invoice template
 * Useful for recurring business
 */
export function convertQuoteToTemplate(
  quote: Quote,
  templateName: string,
  templateDescription: string
): QuoteTemplate {
  return {
    id: `tpl_quote_custom_${Date.now()}`,
    name: templateName,
    description: templateDescription,
    category: "custom",
    items: [...quote.items],
    labor: quote.labor ? [...quote.labor] : [],
    vatRate: quote.vatRate,
    notes: quote.notes,
    defaultValidityDays: 30,
    paymentTerms: "Betaling binnen 14 dagen na factuurdatum",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reset templates to defaults (for troubleshooting)
 */
export function resetToDefaultTemplates(): void {
  const storage: TemplatesStorage = {
    quoteTemplates: getDefaultQuoteTemplates(),
    invoiceTemplates: getDefaultInvoiceTemplates(),
  };
  saveTemplatesStorage(storage);
}
