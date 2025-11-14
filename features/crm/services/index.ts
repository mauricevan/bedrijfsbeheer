/**
 * CRM Services - Barrel Export
 * Pure business logic functions for CRM operations
 */

// Calculations
export {
  calculateDashboardStats,
  getCustomerJourney,
  getCustomerFinances,
  calculateInvoiceTotals as calculateInvoiceTotalsFromService,
} from "./calculations";
export type {
  DashboardStats,
  CustomerJourney,
  CustomerFinances,
  InvoiceTotals,
} from "./calculations";

// Invoice Service
export {
  generateInvoiceNumber,
  calculateInvoiceTotals,
  createHistoryEntry,
} from "./invoiceService";

// Customer Service
export {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  transferLeadInteractionsToCustomer,
} from "./customerService";
export type { CustomerFormData } from "./customerService";

// Lead Service
export {
  createLead,
  convertLeadToCustomer,
  updateLeadStatus,
  deleteLead,
} from "./leadService";
export type { LeadFormData } from "./leadService";
