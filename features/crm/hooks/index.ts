/**
 * CRM Hooks Barrel Export
 * Centralized export file for all CRM-related custom hooks
 */

export { useCRMState } from "./useCRMState";
export type {
  TabType,
  CustomerFormData,
  LeadFormData,
  InteractionFormData,
  TaskFormData,
  InvoiceFormData,
  QuoteFormData,
} from "./useCRMState";

export { useCustomers } from "./useCustomers";
export { useLeads } from "./useLeads";
export { useInvoices } from "./useInvoices";
export { useTasks } from "./useTasks";
export { useInteractions } from "./useInteractions";
export { useDashboard } from "./useDashboard";
