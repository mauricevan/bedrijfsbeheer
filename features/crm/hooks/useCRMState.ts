import { useState } from "react";
import type {
  Customer,
  Quote,
  Invoice,
  QuoteItem,
  QuoteLabor,
  InteractionType,
} from "../../../types";
import { ParsedEmail } from "../../../utils/emlParser";

/**
 * Type definition for CRM tab navigation
 */
export type TabType =
  | "dashboard"
  | "leads"
  | "customers"
  | "interactions"
  | "tasks"
  | "email";

/**
 * Customer form data interface
 */
export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  type: "business" | "private";
  address: string;
  source: string;
  company: string;
  notes: string;
}

/**
 * Lead form data interface
 */
export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  estimatedValue: number;
  notes: string;
}

/**
 * Interaction form data interface
 */
export interface InteractionFormData {
  type: InteractionType;
  subject: string;
  description: string;
  relatedTo: string;
  relatedType: "lead" | "customer";
  followUpRequired: boolean;
  followUpDate: string;
}

/**
 * Task form data interface
 */
export interface TaskFormData {
  title: string;
  description: string;
  customerId: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

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
 * Centralized state management hook for the CRM module
 * Manages all UI state, form states, and modal visibility
 */
export const useCRMState = () => {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Email preview states
  const [showQuotePreview, setShowQuotePreview] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<ParsedEmail | null>(null);
  const [pendingOrderData, setPendingOrderData] = useState<{
    emailFrom: string;
    emailSubject: string;
    emailBody: string;
  } | null>(null);

  // Search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  // Modal visibility states
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [showEditCustomerForm, setShowEditCustomerForm] = useState(false);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [showAddInteractionForm, setShowAddInteractionForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showFinancesModal, setShowFinancesModal] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  // Invoice modal states
  const [showCloneInvoiceModal, setShowCloneInvoiceModal] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);

  // Quote modal states
  const [showCloneQuoteModal, setShowCloneQuoteModal] = useState(false);
  const [showEditQuoteModal, setShowEditQuoteModal] = useState(false);

  // Detail modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailType, setDetailType] = useState<"quote" | "invoice" | null>(
    null
  );
  const [detailItem, setDetailItem] = useState<Quote | Invoice | null>(null);

  // Selected entity states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [selectedInvoiceForWorkOrder, setSelectedInvoiceForWorkOrder] =
    useState<string | null>(null);
  const [selectedQuoteForWorkOrder, setSelectedQuoteForWorkOrder] = useState<
    string | null
  >(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Form data states - Customer
  const [newCustomer, setNewCustomer] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    type: "business",
    address: "",
    source: "website",
    company: "",
    notes: "",
  });

  const [editCustomer, setEditCustomer] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    type: "business",
    address: "",
    source: "website",
    company: "",
    notes: "",
  });

  // Form data states - Lead
  const [newLead, setNewLead] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "website",
    estimatedValue: 0,
    notes: "",
  });

  // Form data states - Interaction
  const [newInteraction, setNewInteraction] = useState<InteractionFormData>({
    type: "call",
    subject: "",
    description: "",
    relatedTo: "",
    relatedType: "lead",
    followUpRequired: false,
    followUpDate: "",
  });

  // Form data states - Task
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: "",
    description: "",
    customerId: "",
    priority: "medium",
    dueDate: "",
  });

  // Form data states - Invoice
  const [newInvoice, setNewInvoice] = useState<InvoiceFormData>({
    customerId: "",
    items: [],
    labor: [],
    vatRate: 21,
    notes: "",
    paymentTerms: "14 dagen",
    issueDate: "",
    dueDate: "",
  });

  // Form data states - Quote
  const [newQuote, setNewQuote] = useState<QuoteFormData>({
    customerId: "",
    items: [],
    labor: [],
    vatRate: 21,
    notes: "",
    validUntil: "",
  });

  // Reset form functions
  const resetCustomerForm = () => {
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      type: "business",
      address: "",
      source: "website",
      company: "",
      notes: "",
    });
  };

  const resetEditCustomerForm = () => {
    setEditCustomer({
      name: "",
      email: "",
      phone: "",
      type: "business",
      address: "",
      source: "website",
      company: "",
      notes: "",
    });
  };

  const resetLeadForm = () => {
    setNewLead({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "website",
      estimatedValue: 0,
      notes: "",
    });
  };

  const resetInteractionForm = () => {
    setNewInteraction({
      type: "call",
      subject: "",
      description: "",
      relatedTo: "",
      relatedType: "lead",
      followUpRequired: false,
      followUpDate: "",
    });
  };

  const resetTaskForm = () => {
    setNewTask({
      title: "",
      description: "",
      customerId: "",
      priority: "medium",
      dueDate: "",
    });
  };

  const resetInvoiceForm = () => {
    setNewInvoice({
      customerId: "",
      items: [],
      labor: [],
      vatRate: 21,
      notes: "",
      paymentTerms: "14 dagen",
      issueDate: "",
      dueDate: "",
    });
  };

  const resetQuoteForm = () => {
    setNewQuote({
      customerId: "",
      items: [],
      labor: [],
      vatRate: 21,
      notes: "",
      validUntil: "",
    });
  };

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Email preview state
    showQuotePreview,
    setShowQuotePreview,
    showEmailPreview,
    setShowEmailPreview,
    pendingEmail,
    setPendingEmail,
    pendingOrderData,
    setPendingOrderData,

    // Search state
    customerSearchTerm,
    setCustomerSearchTerm,

    // Modal visibility state
    showAddCustomerForm,
    setShowAddCustomerForm,
    showEditCustomerForm,
    setShowEditCustomerForm,
    showAddLeadForm,
    setShowAddLeadForm,
    showAddInteractionForm,
    setShowAddInteractionForm,
    showAddTaskForm,
    setShowAddTaskForm,
    showFinancesModal,
    setShowFinancesModal,
    showJourneyModal,
    setShowJourneyModal,
    showCloneInvoiceModal,
    setShowCloneInvoiceModal,
    showEditInvoiceModal,
    setShowEditInvoiceModal,
    showUserSelectionModal,
    setShowUserSelectionModal,
    showCloneQuoteModal,
    setShowCloneQuoteModal,
    showEditQuoteModal,
    setShowEditQuoteModal,
    showDetailModal,
    setShowDetailModal,

    // Detail modal state
    detailType,
    setDetailType,
    detailItem,
    setDetailItem,

    // Selected entity state
    selectedCustomerId,
    setSelectedCustomerId,
    editingCustomer,
    setEditingCustomer,
    editingInvoiceId,
    setEditingInvoiceId,
    editingQuoteId,
    setEditingQuoteId,
    selectedInvoiceForWorkOrder,
    setSelectedInvoiceForWorkOrder,
    selectedQuoteForWorkOrder,
    setSelectedQuoteForWorkOrder,
    selectedUserId,
    setSelectedUserId,

    // Form data state
    newCustomer,
    setNewCustomer,
    editCustomer,
    setEditCustomer,
    newLead,
    setNewLead,
    newInteraction,
    setNewInteraction,
    newTask,
    setNewTask,
    newInvoice,
    setNewInvoice,
    newQuote,
    setNewQuote,

    // Reset functions
    resetCustomerForm,
    resetEditCustomerForm,
    resetLeadForm,
    resetInteractionForm,
    resetTaskForm,
    resetInvoiceForm,
    resetQuoteForm,
  };
};
