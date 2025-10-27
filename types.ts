import type React from 'react';

export enum ModuleKey {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  POS = 'pos',
  WORK_ORDERS = 'work_orders',
  ACCOUNTING = 'accounting',
  CRM = 'crm',
  HRM = 'hrm',
  REPORTS = 'reports',
  PLANNING = 'planning',
  ADMIN_SETTINGS = 'admin_settings'
}

export interface Module {
  id: ModuleKey;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Data models for integrated modules

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  supplier: string;
  lastRestocked?: string;
  location?: string;
  price?: number; // Verkoopprijs per stuk
  unit?: string; // Eenheid: stuk, meter, kg, etc.
}

export interface Product {
    id: string;
    name: string;
    price: number;
    inventoryItemId: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Sale {
    id: string;
    items: CartItem[];
    total: number;
    customerId: string | null;
    date: string;
}

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    relatedTo?: string;
}

export type WorkOrderStatus = 'To Do' | 'Pending' | 'In Progress' | 'Completed';

// Audit trail entry voor werkorder wijzigingen
export interface WorkOrderHistoryEntry {
  timestamp: string; // ISO datetime string
  action: 'created' | 'converted' | 'assigned' | 'status_changed' | 'updated' | 'completed';
  performedBy: string; // Employee ID
  details: string; // Beschrijving van de wijziging
  fromStatus?: WorkOrderStatus; // Voor status changes
  toStatus?: WorkOrderStatus;
  fromAssignee?: string; // Voor reassignment
  toAssignee?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  assignedTo: string;
  requiredInventory: { itemId: string; quantity: number }[];
  createdDate: string;
  customerId?: string;
  location?: string;
  scheduledDate?: string;
  completedDate?: string;
  hoursSpent?: number;
  photos?: string[];
  signature?: string;
  notes?: string;
  pendingReason?: string; // Reden waarom werkorder in wacht staat
  quoteId?: string; // Link naar offerte indien aangemaakt vanuit offerte
  invoiceId?: string; // Link naar factuur indien aangemaakt vanuit factuur
  estimatedHours?: number; // Geschatte uren (vanuit offerte/factuur)
  estimatedCost?: number; // Geschatte kosten (vanuit offerte/factuur)
  sortIndex?: number; // Indexnummer voor sortering en prioritering (optioneel)
  
  // Timestamps voor tracking
  timestamps?: {
    created: string; // Wanneer werkorder is aangemaakt
    converted?: string; // Wanneer geconverteerd van offerte/factuur
    assigned?: string; // Wanneer toegewezen aan een medewerker
    started?: string; // Wanneer status naar 'In Progress' ging
    completed?: string; // Wanneer status naar 'Completed' ging
  };
  
  // Audit trail
  history?: WorkOrderHistoryEntry[];
  
  // Voor tracking van wie heeft toegewezen
  assignedBy?: string; // Employee ID van wie de werkorder heeft toegewezen
  convertedBy?: string; // Employee ID van wie de conversie heeft uitgevoerd
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    since: string;
    type?: 'business' | 'private';
    address?: string;
    notes?: string;
    source?: string; // Herkomst: website, referral, advertisement, etc.
    company?: string; // Bedrijfsnaam (voor zakelijke klanten)
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    status: LeadStatus;
    source: string; // website, referral, cold-call, advertisement, etc.
    estimatedValue?: number;
    notes?: string;
    createdDate: string;
    lastContactDate?: string;
    nextFollowUpDate?: string;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'sms';

export interface Interaction {
    id: string;
    customerId?: string; // Can be lead or customer
    leadId?: string;
    type: InteractionType;
    subject: string;
    description: string;
    date: string;
    employeeId?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    hireDate: string;
    vacationDays?: number;
    usedVacationDays?: number;
    availability?: 'available' | 'unavailable' | 'vacation';
    password?: string; // Simple password field
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface QuoteItem {
    inventoryItemId?: string; // Koppeling naar voorraad item
    description: string;
    quantity: number;
    pricePerUnit: number;
    total: number;
}

export interface QuoteLabor {
    description: string;
    hours: number;
    hourlyRate: number;
    total: number;
}

// Audit trail entry voor offerte wijzigingen
export interface QuoteHistoryEntry {
  timestamp: string; // ISO datetime string
  action: 'created' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted_to_invoice' | 'converted_to_workorder' | 'updated';
  performedBy: string; // Employee ID
  details: string; // Beschrijving van de wijziging
  fromStatus?: QuoteStatus;
  toStatus?: QuoteStatus;
}

export interface Quote {
    id: string;
    customerId: string;
    items: QuoteItem[];
    labor?: QuoteLabor[]; // Optionele werkuren
    subtotal: number; // Subtotaal excl. BTW
    vatRate: number; // BTW percentage (bijv. 21 voor 21%)
    vatAmount: number; // BTW bedrag
    total: number; // Totaal incl. BTW
    status: QuoteStatus;
    createdDate: string;
    validUntil: string;
    notes?: string;
    location?: string; // Locatie voor de werkzaamheden
    scheduledDate?: string; // Geplande uitvoerdatum
    workOrderId?: string; // Link naar werkorder indien omgezet
    
    // Audit trail
    createdBy?: string; // Employee ID van wie de offerte heeft aangemaakt
    history?: QuoteHistoryEntry[]; // Complete geschiedenis van wijzigingen
    
    // Timestamps voor tracking
    timestamps?: {
        created: string; // Wanneer offerte is aangemaakt
        sent?: string; // Wanneer offerte is verzonden
        approved?: string; // Wanneer offerte is geaccepteerd
        convertedToInvoice?: string; // Wanneer geconverteerd naar factuur
        convertedToWorkOrder?: string; // Wanneer geconverteerd naar werkorder
    };
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Audit trail entry voor factuur wijzigingen
export interface InvoiceHistoryEntry {
  timestamp: string; // ISO datetime string
  action: 'created' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'converted_to_workorder' | 'updated';
  performedBy: string; // Employee ID
  details: string; // Beschrijving van de wijziging
  fromStatus?: InvoiceStatus;
  toStatus?: InvoiceStatus;
}

export interface Invoice {
    id: string;
    invoiceNumber: string; // Factuurnummer (bijv. 2025-001)
    customerId: string;
    quoteId?: string; // Optionele link naar offerte
    items: QuoteItem[];
    labor?: QuoteLabor[];
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    status: InvoiceStatus;
    issueDate: string; // Factuurdatum
    dueDate: string; // Betaaldatum
    paidDate?: string; // Datum van betaling (indien betaald)
    notes?: string;
    paymentTerms?: string; // Betalingsvoorwaarden (bijv. "14 dagen")
    location?: string; // Locatie voor de werkzaamheden
    scheduledDate?: string; // Geplande uitvoerdatum
    workOrderId?: string; // Link naar werkorder indien omgezet
    
    // Audit trail
    createdBy?: string; // Employee ID van wie de factuur heeft aangemaakt
    history?: InvoiceHistoryEntry[]; // Complete geschiedenis van wijzigingen
    
    // Timestamps voor tracking
    timestamps?: {
        created: string; // Wanneer factuur is aangemaakt
        sent?: string; // Wanneer factuur is verzonden
        paid?: string; // Wanneer factuur is betaald
        convertedToWorkOrder?: string; // Wanneer geconverteerd naar werkorder
    };
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
    id: string;
    title: string;
    description: string;
    customerId?: string;
    employeeId?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    createdDate: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    type: 'workorder' | 'meeting' | 'vacation' | 'other';
    relatedId?: string;
    employeeId?: string;
    customerId?: string;
}

export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    date: string;
    read: boolean;
    relatedModule?: ModuleKey;
    relatedId?: string;
}

export interface User {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
    isAdmin: boolean;
}
