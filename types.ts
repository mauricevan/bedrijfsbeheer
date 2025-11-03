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
  WEBSHOP = 'webshop',
  ADMIN_SETTINGS = 'admin_settings'
}

export interface Module {
  id: ModuleKey;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Data models for integrated modules

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  averageLeadTime?: number; // Gemiddelde levertijd in dagen
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  supplierId?: string; // Koppeling met Supplier
  supplier?: string; // Legacy support - wordt gemigreerd naar supplierId
  lastRestocked?: string;
  location?: string;
  
  // Prijsstructuur (NL-Compliant)
  purchasePrice?: number; // Aankoopprijs (excl. BTW)
  salePrice: number; // Verkoopprijs (excl. BTW)
  margin?: number; // Automatisch berekend: ((salePrice - purchasePrice) / purchasePrice) * 100
  
  // BTW-instellingen per item (NL-Compliant)
  vatRate: '21' | '9' | '0' | 'custom'; // Standaard 21%, Verlaagd 9%, Vrij 0%, Custom percentage
  customVatRate?: number; // Alleen gebruikt als vatRate === 'custom'
  
  // Webshop Synchronisatie
  syncEnabled: boolean; // Automatisch sync met webshop?
  webshopId?: string; // ID in webshop (als gekoppeld)
  webshopProductId?: string; // Koppeling met WebshopProduct
  
  unit?: string; // Eenheid: stuk, meter, kg, etc.
  price?: number; // Legacy - gebruik salePrice
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    inventoryItemId: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number; // Prijs excl. BTW
  quantity: number;
  vatRate: '21' | '9' | '0' | 'custom'; // BTW tarief
  customVatRate?: number; // Alleen bij custom
  discount?: number; // Korting percentage (0-100)
  inventoryItemId?: string; // Koppeling met inventory
  sku?: string; // SKU voor bon
  unit?: string; // Eenheid
  isManual?: boolean; // Handmatig toegevoegd item (niet in voorraad)
}

export interface PackingSlip {
  id: string;
  packingSlipNumber: string; // Automatisch: PKB-2025-001
  customerId: string;
  customerName: string;
  items: CartItem[];
  subtotalExclVat: number;
  totalVat: number;
  totalInclVat: number;
  dueDate: string; // ISO date string
  createdAt: string;
  status: 'pending' | 'sent' | 'paid';
  invoiceId?: string; // Koppeling met factuur (als aangemaakt)
  shippingAddress?: Address;
}

export type PaymentMethod = 'cash' | 'pin' | 'ideal' | 'bank_transfer' | 'credit';

// ==================== WEBSHOP TYPES ====================

export interface WebshopProduct {
  id: string;
  name: string;
  slug: string; // URL-vriendelijke naam (bijv. "staal-plaat-10mm")
  description: string;
  shortDescription?: string; // Korte beschrijving voor product cards
  sku: string; // Stock Keeping Unit
  price: number; // Verkoopprijs (inclusief BTW)
  compareAtPrice?: number; // Wasprijs (voor strikethrough)
  costPrice?: number; // Inkoopprijs (voor winstberekening)
  inventoryItemId?: string; // Koppeling met Inventory module
  stockQuantity: number; // Directe voorraad (kan gesynchroniseerd met inventoryItemId)
  lowStockThreshold?: number; // Waarschuwing bij deze hoeveelheid
  trackInventory: boolean; // Moet voorraad bijgehouden worden?
  
  // Product Categorieën
  categoryIds: string[]; // Kan in meerdere categorieën
  featuredCategoryId?: string; // Primaire categorie
  
  // Product Varianten (Kleuren, Maten, etc.)
  hasVariants: boolean;
  variants?: ProductVariant[];
  
  // Media (voorbereiding voor frontend)
  images: ProductImage[]; // Product afbeeldingen
  featuredImage?: string; // URL naar hoofdafbeelding
  
  // Product Status & Zichtbaarheid
  status: 'draft' | 'active' | 'archived'; // draft = niet zichtbaar, active = live, archived = verborgen
  visibility: 'public' | 'private' | 'hidden'; // public = voor iedereen, private = alleen ingelogde klanten, hidden = niet zichtbaar
  
  // SEO & Marketing (voorbereiding voor frontend)
  metaTitle?: string; // SEO title tag
  metaDescription?: string; // SEO meta description
  tags: string[]; // Zoekbare tags
  
  // Verkoop Instellingen
  weight?: number; // Gewicht in gram voor verzending
  dimensions?: { // Afmetingen voor verzending
    length?: number;
    width?: number;
    height?: number;
  };
  shippingRequired: boolean; // Moet dit verzonden worden?
  shippingClass?: string; // Verzendcategorie (bijv. "normaal", "express", "groot")
  
  // Extra Opties
  taxClass?: 'standard' | 'reduced' | 'zero' | 'exempt'; // BTW tarief
  requireShipping: boolean; // Verzending vereist?
  digitalProduct: boolean; // Digitaal product (download, geen verzending)
  
  // Reviews & Ratings (voorbereiding voor frontend)
  allowReviews: boolean; // Zijn reviews toegestaan?
  averageRating?: number; // Gemiddelde rating (0-5)
  reviewCount?: number; // Aantal reviews
  
  // Datums & Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt?: string; // Wanneer gepubliceerd
  
  // Statistieken (voorbereiding voor frontend)
  viewCount?: number; // Aantal keer bekeken
  purchaseCount?: number; // Aantal keer gekocht
  wishlistCount?: number; // Aantal keer op verlanglijst
  
  // Admin Notities
  adminNotes?: string; // Interne notities (niet zichtbaar voor klanten)
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // Bijv. "Rood - Groot"
  sku?: string; // Unieke SKU voor variant
  price?: number; // Variant specifieke prijs (overschrijft product prijs indien aanwezig)
  compareAtPrice?: number;
  stockQuantity: number;
  weight?: number;
  image?: string; // Variant specifieke afbeelding
  
  // Variant Opties (bijv. Kleur: Rood, Maat: L)
  options: Record<string, string>; // { "kleur": "rood", "maat": "large" }
  
  // Status
  active: boolean;
  trackInventory: boolean;
}

export interface ProductImage {
  id: string;
  url: string; // URL naar afbeelding
  alt?: string; // Alt text voor SEO en accessibility
  order: number; // Volgorde voor weergave
  isPrimary?: boolean; // Is dit de hoofdafbeelding?
  variantId?: string; // Optioneel: gekoppeld aan specifieke variant
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string; // URL-vriendelijke naam
  description?: string;
  parentId?: string; // Voor hiërarchische categorieën (subcategorieën)
  image?: string; // Categorie afbeelding
  order: number; // Sorteervolgorde
  active: boolean; // Is categorie actief?
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Statistieken
  productCount?: number; // Aantal producten in categorie
  
  // Datums
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface Order {
  id: string;
  orderNumber: string; // Uniek ordernummer (bijv. "ORD-2025-001")
  
  // Klant Informatie
  customerId?: string; // Koppeling met CRM Customer
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  
  // Verzendadres
  shippingAddress: Address;
  billingAddress: Address;
  
  // Bestelde Items
  items: OrderItem[];
  
  // Prijzen
  subtotal: number; // Subtotaal (excl. BTW)
  tax: number; // BTW bedrag
  shippingCost: number; // Verzendkosten
  discount: number; // Korting bedrag
  total: number; // Totaal (incl. alles)
  
  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  
  // Betaling
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'ideal' | 'paypal' | 'cash' | 'other';
  paymentReference?: string; // Transactie referentie
  paidAt?: string; // Wanneer betaald
  
  // Verzending
  trackingNumber?: string;
  carrier?: string; // Verzenddienst (PostNL, DHL, etc.)
  shippedAt?: string;
  deliveredAt?: string;
  
  // Notities
  customerNotes?: string; // Notities van klant
  adminNotes?: string; // Interne notities
  
  // Datums
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string; // Als product variant heeft
  productName: string; // Opgeslagen naam (voor historie)
  productSku: string;
  quantity: number;
  price: number; // Prijs per stuk (zoals op moment van bestellen)
  subtotal: number; // quantity * price
  tax: number; // BTW voor dit item
  total: number; // subtotal + tax
  
  // Product snapshot (voor historie als product wordt aangepast)
  productSnapshot?: {
    name: string;
    image?: string;
    variantName?: string;
  };
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  province?: string; // Provincie/Staat
  phone?: string;
}

// Shopping Cart (voorbereiding voor frontend)
export interface ShoppingCart {
  id: string; // Session ID of User ID
  items: WebshopCartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string;
  updatedAt: string;
}

export interface WebshopCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number; // Prijs op moment van toevoegen
}

// Coupon/Discount (voorbereiding voor frontend)
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount'; // Percentage korting of vast bedrag
  value: number; // Kortingspercentage of bedrag
  minimumPurchase?: number; // Minimaal aankoopbedrag
  maximumDiscount?: number; // Maximaal kortingsbedrag
  usageLimit?: number; // Maximaal aantal keer te gebruiken
  usageCount: number; // Huidig gebruik
  validFrom: string;
  validUntil: string;
  active: boolean;
  applicableCategories?: string[]; // Alleen voor bepaalde categorieën
  applicableProducts?: string[]; // Alleen voor bepaalde producten
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
    type?: 'business' | 'private' | 'individual';
    address?: string;
    notes?: string;
    source?: string; // Herkomst: website, referral, advertisement, etc.
    company?: string; // Bedrijfsnaam (voor zakelijke klanten)
    creditLimit?: number; // Kredietlimiet voor B2B klanten
    paymentTerms?: number; // Betaaltermijn in dagen (default 14)
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

export type EmployeeNoteType = 'attendance' | 'milestone' | 'performance' | 'warning' | 'compliment' | 'general' | 'late' | 'absence';

export interface EmployeeNote {
    id: string;
    type: EmployeeNoteType;
    title: string;
    description: string;
    date: string;
    createdBy?: string; // Employee ID van degene die de note heeft aangemaakt
    createdAt: string;
}

// Permission types voor granulaire rechten
export type Permission =
  | 'full_admin'                    // Alle admin rechten
  | 'manage_modules'                // Modules in- en uitschakelen (Admin Instellingen)
  | 'manage_inventory'             // Voorraadbeheer CRUD
  | 'manage_crm'                    // CRM (klanten, leads, taken) CRUD
  | 'manage_accounting'             // Facturen en offertes beheren
  | 'manage_workorders'             // Werkorders beheren en toewijzen
  | 'manage_employees'              // Medewerkers beheren (HRM)
  | 'view_all_workorders'           // Alle werkorders zien (niet alleen eigen)
  | 'view_reports'                  // Volledige rapportages en analyses
  | 'manage_planning'               // Planning en agenda beheren
  | 'manage_pos';                   // Kassasysteem beheren

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
    isAdmin?: boolean; // Volledige admin rechten (legacy, wordt gebruikt als full_admin permission)
    permissions?: Permission[]; // Granulaire rechten
    notes?: EmployeeNote[]; // Persoonlijk dossier
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
    isAdmin: boolean; // Legacy: true als full_admin permission of isAdmin flag
    permissions?: Permission[]; // Granulaire rechten
}

// Analytics & Usage Tracking Types (Lean Six Sigma)
export interface AnalyticsEvent {
    id: string;
    timestamp: string;
    userId: string;
    userRole: string;
    module: ModuleKey;
    action: string;
    actionType: 'click' | 'navigate' | 'create' | 'update' | 'delete' | 'view' | 'error' | 'complete' | 'abandon';
    duration?: number; // Milliseconds
    metadata?: {
        [key: string]: any;
        feature?: string;
        clicks?: number;
        errors?: string[];
        outcome?: 'success' | 'failure' | 'partial';
    };
}

export interface ModuleUsageStats {
    module: ModuleKey;
    totalSessions: number;
    totalTime: number; // Minutes
    averageSessionDuration: number;
    uniqueUsers: number;
    actionsCount: number;
    errorCount: number;
    lastUsed: string;
    usageTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface UserActivityStats {
    userId: string;
    userName: string;
    role: string;
    totalSessions: number;
    totalTime: number;
    modulesUsed: ModuleKey[];
    mostUsedModule: ModuleKey;
    averageSessionDuration: number;
    lastActive: string;
    efficiencyScore: number; // 0-100
}

export interface ProcessMetrics {
    processName: string;
    averageCycleTime: number; // Minutes
    averageSteps: number;
    completionRate: number; // Percentage
    errorRate: number; // Percentage
    reworkRate: number; // Percentage
    bottleneckSteps: Array<{
        step: string;
        averageWaitTime: number;
        frequency: number;
    }>;
}

export interface OptimizationRecommendation {
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: 'process' | 'feature' | 'usability' | 'automation' | 'quality';
    title: string;
    description: string;
    impact: string; // Expected benefit
    effort: 'low' | 'medium' | 'high';
    roi: number; // Estimated ROI score (0-100)
    metrics: {
        current: number;
        target: number;
        unit: string;
    };
    actions: string[]; // Recommended actions
}

export interface AnalyticsDashboard {
    period: 'day' | 'week' | 'month' | 'quarter' | 'year';
    startDate: string;
    endDate: string;
    totalEvents: number;
    totalUsers: number;
    totalTime: number;
    moduleStats: ModuleUsageStats[];
    userStats: UserActivityStats[];
    processMetrics: ProcessMetrics[];
    recommendations: OptimizationRecommendation[];
    trends: {
        usageGrowth: number; // Percentage
        efficiencyChange: number; // Percentage
        errorRateChange: number; // Percentage
    };
}
