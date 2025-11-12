import type React from "react";
import {
  Transaction,
  Quote,
  Invoice,
  Customer,
  InventoryItem,
  InventoryCategory,
  WorkOrder,
  Employee,
  User,
  Notification,
} from "../../../types";

/**
 * Props for the main Accounting component
 */
export interface AccountingProps {
  transactions: Transaction[];
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  inventory: InventoryItem[];
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  employees: Employee[];
  currentUser: User;
  isAdmin: boolean;
  notifications?: Notification[];
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>;
  categories?: InventoryCategory[];
}

/**
 * Props for the AccountingDashboard component
 */
export interface AccountingDashboardProps {
  invoices: Invoice[];
  quotes: Quote[];
  transactions: Transaction[];
  customers: Customer[];
  onNavigate: (view: string, data?: any) => void;
}

/**
 * Form data structure for creating/editing quotes
 */
export interface QuoteFormData {
  customerId: string;
  items: Quote["items"];
  labor: Quote["labor"];
  notes?: string;
  validUntil?: string;
}

/**
 * Form data structure for creating/editing invoices
 */
export interface InvoiceFormData {
  customerId: string;
  items: Invoice["items"];
  labor: Invoice["labor"];
  notes?: string;
  dueDate?: string;
}

/**
 * Filters for quote list
 */
export interface QuoteFilters {
  status?: string;
  customerId?: string;
  searchTerm?: string;
}

/**
 * Filters for invoice list
 */
export interface InvoiceFilters {
  status?: string;
  customerId?: string;
  searchTerm?: string;
}

/**
 * Calculated totals for a quote
 */
export interface QuoteTotals {
  subtotal: number;
  laborTotal: number;
  total: number;
  tax?: number;
}

/**
 * Calculated totals for an invoice
 */
export interface InvoiceTotals {
  subtotal: number;
  laborTotal: number;
  total: number;
  tax?: number;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  openQuotesCount: number;
  avgPaymentDays: number;
}

/**
 * Chart data structure
 */
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

/**
 * Revenue data for calculations
 */
export interface RevenueData {
  month: string;
  revenue: number;
}

/**
 * Outstanding data by customer
 */
export interface OutstandingData {
  customerId: string;
  customerName: string;
  amount: number;
}

/**
 * Validation result for forms
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

