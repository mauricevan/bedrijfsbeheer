import React, { useState, useMemo, useEffect } from "react";
import {
  Customer,
  Sale,
  Task,
  Lead,
  Interaction,
  Employee,
  User,
  LeadStatus,
  InteractionType,
  Invoice,
  Quote,
  WorkOrder,
  QuoteItem,
  QuoteLabor,
  InvoiceHistoryEntry,
  Email,
  EmailTemplate,
  EmailStatus,
} from "../types";
import { LEAD_SOURCES, INTERACTION_TYPES } from "../data/mockData";
import { EmailDropZone } from "../components/EmailDropZone";
import { parseEmailForQuote } from "../utils/emailQuoteParser";
import { QuotePreviewModal } from "../components/QuotePreviewModal";
import { EmailPreviewModal } from "../components/EmailPreviewModal";
import {
  saveEmailMapping,
  findCustomerByEmail,
} from "../utils/emailCustomerMapping";
import { ParsedEmail } from "../utils/emlParser";

interface CRMProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  sales: Sale[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  interactions: Interaction[];
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
  employees: Employee[];
  currentUser: User;
  isAdmin: boolean;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  workOrders: any[];
  setWorkOrders: React.Dispatch<React.SetStateAction<any[]>>;
  inventory: any[];
  emails: Email[];
  setEmails: React.Dispatch<React.SetStateAction<Email[]>>;
  emailTemplates: EmailTemplate[];
  setEmailTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
}

type TabType =
  | "dashboard"
  | "leads"
  | "customers"
  | "interactions"
  | "tasks"
  | "email";

const CRMComponent: React.FC<CRMProps> = ({
  customers,
  setCustomers,
  sales,
  tasks,
  setTasks,
  leads,
  setLeads,
  interactions,
  setInteractions,
  employees,
  currentUser,
  isAdmin,
  invoices,
  setInvoices,
  quotes,
  setQuotes,
  workOrders,
  setWorkOrders,
  inventory,
  emails,
  setEmails,
  emailTemplates,
  setEmailTemplates,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
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

  // Forms state
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [showEditCustomerForm, setShowEditCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [showAddInteractionForm, setShowAddInteractionForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showFinancesModal, setShowFinancesModal] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  // Invoice clone/edit states
  const [showCloneInvoiceModal, setShowCloneInvoiceModal] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceForWorkOrder, setSelectedInvoiceForWorkOrder] =
    useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newInvoice, setNewInvoice] = useState({
    customerId: "",
    items: [] as QuoteItem[],
    labor: [] as QuoteLabor[],
    vatRate: 21,
    notes: "",
    paymentTerms: "14 dagen",
    issueDate: "",
    dueDate: "",
  });

  // Detail modal states voor factuur/offerte
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailType, setDetailType] = useState<"quote" | "invoice" | null>(
    null
  );
  const [detailItem, setDetailItem] = useState<Quote | Invoice | null>(null);

  // Quote clone/edit states
  const [showCloneQuoteModal, setShowCloneQuoteModal] = useState(false);
  const [showEditQuoteModal, setShowEditQuoteModal] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [selectedQuoteForWorkOrder, setSelectedQuoteForWorkOrder] = useState<
    string | null
  >(null);
  const [newQuote, setNewQuote] = useState({
    customerId: "",
    items: [] as QuoteItem[],
    labor: [] as QuoteLabor[],
    vatRate: 21,
    notes: "",
    validUntil: "",
  });

  // New forms data
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    type: "business" as "business" | "private",
    address: "",
    source: "website",
    company: "",
    notes: "",
  });

  const [editCustomer, setEditCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    type: "business" as "business" | "private",
    address: "",
    source: "website",
    company: "",
    notes: "",
  });

  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "website",
    estimatedValue: 0,
    notes: "",
  });

  const [newInteraction, setNewInteraction] = useState({
    type: "call" as InteractionType,
    subject: "",
    description: "",
    relatedTo: "",
    relatedType: "lead" as "lead" | "customer",
    followUpRequired: false,
    followUpDate: "",
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    customerId: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(
      (l) => !["won", "lost"].includes(l.status)
    ).length;
    const wonLeads = leads.filter((l) => l.status === "won").length;
    const lostLeads = leads.filter((l) => l.status === "lost").length;
    const conversionRate =
      totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

    const totalCustomers = customers.length;
    const businessCustomers = customers.filter(
      (c) => c.type === "business"
    ).length;
    const privateCustomers = customers.filter(
      (c) => c.type === "private"
    ).length;

    const totalValue = leads.reduce(
      (sum, lead) => sum + (lead.estimatedValue || 0),
      0
    );
    const wonValue = leads
      .filter((l) => l.status === "won")
      .reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

    const totalInteractions = interactions.length;
    const thisMonthInteractions = interactions.filter((i) => {
      const interactionDate = new Date(i.date);
      const now = new Date();
      return (
        interactionDate.getMonth() === now.getMonth() &&
        interactionDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const pendingFollowUps = interactions.filter(
      (i) => i.followUpRequired && i.followUpDate
    ).length;

    const activeTasks = tasks.filter((t) => t.status !== "done").length;
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "done") return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return {
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      totalCustomers,
      businessCustomers,
      privateCustomers,
      totalValue,
      wonValue,
      totalInteractions,
      thisMonthInteractions,
      pendingFollowUps,
      activeTasks,
      overdueTasks,
    };
  }, [leads, customers, interactions, tasks]);

  // CRUD Operations
  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert("Vul naam en email in!");
      return;
    }

    const customer: Customer = {
      id: `c${Date.now()}`,
      ...newCustomer,
      since: new Date().toISOString().split("T")[0],
    };

    setCustomers([...customers, customer]);
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
    setShowAddCustomerForm(false);
  };

  const handleEditCustomer = () => {
    if (!editCustomer.name || !editCustomer.email || !editingCustomer) {
      alert("Vul naam en email in!");
      return;
    }

    setCustomers(
      customers.map((c) =>
        c.id === editingCustomer.id ? { ...c, ...editCustomer } : c
      )
    );
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
    setEditingCustomer(null);
    setShowEditCustomerForm(false);
  };

  const startEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      type: customer.type || "business",
      address: customer.address || "",
      source: customer.source || "website",
      company: customer.company || "",
      notes: customer.notes || "",
    });
    setShowEditCustomerForm(true);
  };

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) {
      alert("Vul naam en email in!");
      return;
    }

    const lead: Lead = {
      id: `l${Date.now()}`,
      ...newLead,
      status: "new",
      createdDate: new Date().toISOString().split("T")[0],
    };

    setLeads([...leads, lead]);
    setNewLead({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "website",
      estimatedValue: 0,
      notes: "",
    });
    setShowAddLeadForm(false);
  };

  const handleAddInteraction = () => {
    if (!newInteraction.subject || !newInteraction.relatedTo) {
      alert("Vul onderwerp en gekoppelde entiteit in!");
      return;
    }

    const interaction: Interaction = {
      id: `int${Date.now()}`,
      type: newInteraction.type,
      subject: newInteraction.subject,
      description: newInteraction.description,
      date: new Date().toISOString(),
      employeeId: currentUser.employeeId,
      followUpRequired: newInteraction.followUpRequired,
      followUpDate: newInteraction.followUpDate || undefined,
      [newInteraction.relatedType === "lead" ? "leadId" : "customerId"]:
        newInteraction.relatedTo,
    };

    setInteractions([...interactions, interaction]);
    setNewInteraction({
      type: "call",
      subject: "",
      description: "",
      relatedTo: "",
      relatedType: "lead",
      followUpRequired: false,
      followUpDate: "",
    });
    setShowAddInteractionForm(false);
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      alert("Vul titel en deadline in!");
      return;
    }

    const task: Task = {
      id: `task${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      customerId: newTask.customerId || undefined,
      priority: newTask.priority,
      status: "todo",
      dueDate: newTask.dueDate,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      customerId: "",
      priority: "medium",
      dueDate: "",
    });
    setShowAddTaskForm(false);
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads(
      leads.map((lead) => {
        if (lead.id === leadId) {
          const updates: Partial<Lead> = { status: newStatus };
          if (newStatus === "won" || newStatus === "lost") {
            updates.lastContactDate = new Date().toISOString().split("T")[0];
          }
          return { ...lead, ...updates };
        }
        return lead;
      })
    );
  };

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const convertLeadToCustomer = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const customer: Customer = {
      id: `c${Date.now()}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      type: lead.company ? "business" : "private",
      company: lead.company,
      address: "",
      source: lead.source,
      since: new Date().toISOString().split("T")[0],
      notes: lead.notes,
    };

    setCustomers([...customers, customer]);
    updateLeadStatus(leadId, "won");

    // Transfer lead interactions to customer
    setInteractions(
      interactions.map((int) => {
        if (int.leadId === leadId) {
          return { ...int, customerId: customer.id, leadId: undefined };
        }
        return int;
      })
    );

    alert(`Lead "${lead.name}" succesvol geconverteerd naar klant!`);
  };

  const deleteCustomer = (id: string) => {
    if (confirm("Weet je zeker dat je deze klant wilt verwijderen?")) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  const deleteLead = (id: string) => {
    if (confirm("Weet je zeker dat je deze lead wilt verwijderen?")) {
      setLeads(leads.filter((l) => l.id !== id));
    }
  };

  const deleteTask = (taskId: string) => {
    if (confirm("Weet je zeker dat je deze taak wilt verwijderen?")) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const getCustomerSales = (customerId: string) => {
    return sales.filter((s) => s.customerId === customerId);
  };

  const getCustomerTotal = (customerId: string) => {
    return getCustomerSales(customerId).reduce(
      (sum, sale) => sum + sale.total,
      0
    );
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return "Algemeen";
    return customers.find((c) => c.id === customerId)?.name || "Onbekend";
  };

  const getLeadName = (leadId?: string) => {
    if (!leadId) return "Onbekend";
    return leads.find((l) => l.id === leadId)?.name || "Onbekend";
  };

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return "Onbekend";
    return employees.find((e) => e.id === employeeId)?.name || "Onbekend";
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => lead.status === status);
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return "bg-gray-100 text-gray-800 border-gray-400";
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-400";
      case "qualified":
        return "bg-indigo-100 text-indigo-800 border-indigo-400";
      case "proposal":
        return "bg-purple-100 text-purple-800 border-purple-400";
      case "negotiation":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "won":
        return "bg-green-100 text-green-800 border-green-400";
      case "lost":
        return "bg-red-100 text-red-800 border-red-400";
    }
  };

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return "Nieuw";
      case "contacted":
        return "Contact gemaakt";
      case "qualified":
        return "Gekwalificeerd";
      case "proposal":
        return "Voorstel gedaan";
      case "negotiation":
        return "Onderhandeling";
      case "won":
        return "Gewonnen";
      case "lost":
        return "Verloren";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Financiële functies
  const openFinances = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowFinancesModal(true);
  };

  // Get Customer Journey Data - Helper function
  const getCustomerJourney = (customerId: string) => {
    const customerQuotes = quotes.filter((q) => q.customerId === customerId);
    const customerInvoices = invoices.filter(
      (inv) => inv.customerId === customerId
    );
    const customerWorkOrders = workOrders.filter(
      (wo) => wo.customerId === customerId
    );

    // Organize by status
    const quotesByStatus = {
      draft: customerQuotes.filter((q) => q.status === "draft"),
      sent: customerQuotes.filter((q) => q.status === "sent"),
      approved: customerQuotes.filter((q) => q.status === "approved"),
      rejected: customerQuotes.filter((q) => q.status === "rejected"),
      expired: customerQuotes.filter((q) => q.status === "expired"),
    };

    const invoicesByStatus = {
      draft: customerInvoices.filter((inv) => inv.status === "draft"),
      sent: customerInvoices.filter((inv) => inv.status === "sent"),
      paid: customerInvoices.filter((inv) => inv.status === "paid"),
      overdue: customerInvoices.filter((inv) => inv.status === "overdue"),
    };

    const workOrdersByStatus = {
      todo: customerWorkOrders.filter((wo) => wo.status === "To Do"),
      inProgress: customerWorkOrders.filter(
        (wo) => wo.status === "In Uitvoering"
      ),
      pending: customerWorkOrders.filter((wo) => wo.status === "Pending"),
      completed: customerWorkOrders.filter((wo) => wo.status === "Voltooid"),
    };

    // Calculate progress percentage
    const totalSteps =
      customerQuotes.length +
      customerWorkOrders.length +
      customerInvoices.length;
    const completedSteps = invoicesByStatus.paid.length;
    const progressPercentage =
      totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      quotes: customerQuotes,
      invoices: customerInvoices,
      workOrders: customerWorkOrders,
      quotesByStatus,
      invoicesByStatus,
      workOrdersByStatus,
      progressPercentage,
      totalSteps,
      completedSteps,
    };
  };

  const getCustomerFinances = (customerId: string) => {
    const customerInvoices = invoices.filter(
      (inv) => inv.customerId === customerId
    );
    const customerQuotes = quotes.filter((q) => q.customerId === customerId);

    // Filter: alleen betaalde en openstaande facturen
    const paidAndOutstandingInvoices = customerInvoices.filter(
      (inv) =>
        inv.status === "paid" ||
        ["sent", "draft", "overdue"].includes(inv.status)
    );

    const totalInvoiced = customerInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );
    const paidInvoices = customerInvoices.filter(
      (inv) => inv.status === "paid"
    );
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const outstandingInvoices = customerInvoices.filter((inv) =>
      ["sent", "draft"].includes(inv.status)
    );
    const totalOutstanding = outstandingInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );
    const overdueInvoices = customerInvoices.filter(
      (inv) => inv.status === "overdue"
    );
    const totalOverdue = overdueInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );
    const totalQuotes = customerQuotes.reduce((sum, q) => sum + q.total, 0);

    return {
      invoices: paidAndOutstandingInvoices, // Alleen betaalde en openstaande
      quotes: customerQuotes,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      totalOverdue,
      totalQuotes,
      paidInvoices,
      outstandingInvoices,
      overdueInvoices,
    };
  };

  // Helper functions voor facturen
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .filter((inv) => inv.invoiceNumber.startsWith(`${year}-`))
      .map((inv) => parseInt(inv.invoiceNumber.split("-")[1]))
      .filter((num) => !isNaN(num));

    const nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${year}-${String(nextNumber).padStart(3, "0")}`;
  };

  const calculateInvoiceTotals = () => {
    const itemsSubtotal = newInvoice.items.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const laborSubtotal = newInvoice.labor.reduce(
      (sum, labor) => sum + labor.total,
      0
    );
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (newInvoice.vatRate / 100);
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  };

  const createHistoryEntry = (
    type: "quote" | "invoice",
    action: string,
    details: string,
    extra?: any
  ): InvoiceHistoryEntry => {
    return {
      timestamp: new Date().toISOString(),
      action: action as any,
      performedBy: currentUser.employeeId,
      details,
      ...extra,
    };
  };

  // Invoice item/labor handlers
  const handleInvoiceItemChange = (
    index: number,
    field: keyof QuoteItem,
    value: any
  ) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === "quantity" || field === "pricePerUnit") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].pricePerUnit;
    }

    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const handleInvoiceLaborChange = (
    index: number,
    field: keyof QuoteLabor,
    value: any
  ) => {
    const updatedLabor = [...newInvoice.labor];
    updatedLabor[index] = { ...updatedLabor[index], [field]: value };

    if (field === "hours" || field === "hourlyRate") {
      updatedLabor[index].total =
        updatedLabor[index].hours * updatedLabor[index].hourlyRate;
    }

    setNewInvoice({ ...newInvoice, labor: updatedLabor });
  };

  const handleRemoveInvoiceItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index),
    });
  };

  const handleRemoveInvoiceLabor = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      labor: newInvoice.labor.filter((_, i) => i !== index),
    });
  };

  const handleAddInvoiceCustomItem = () => {
    const newItem: QuoteItem = {
      description: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    };
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, newItem],
    });
  };

  const handleAddInvoiceLabor = () => {
    const newLabor: QuoteLabor = {
      description: "",
      hours: 1,
      hourlyRate: 50,
      total: 50,
    };
    setNewInvoice({
      ...newInvoice,
      labor: [...newInvoice.labor, newLabor],
    });
  };

  const handleInvoiceInventoryItemChange = (
    index: number,
    inventoryItemId: string
  ) => {
    const inventoryItem = inventory.find((i) => i.id === inventoryItemId);
    if (inventoryItem) {
      const updatedItems = [...newInvoice.items];
      updatedItems[index] = {
        ...updatedItems[index],
        inventoryItemId: inventoryItemId,
        description: inventoryItem.name,
        pricePerUnit: inventoryItem.price || 0,
        total: updatedItems[index].quantity * (inventoryItem.price || 0),
      };
      setNewInvoice({ ...newInvoice, items: updatedItems });
    }
  };

  // Clone invoice function
  const handleCloneInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const today = new Date().toISOString().split("T")[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    setNewInvoice({
      customerId: invoice.customerId,
      items: invoice.items,
      labor: invoice.labor || [],
      vatRate: invoice.vatRate,
      notes: invoice.notes || "",
      paymentTerms: invoice.paymentTerms,
      issueDate: today,
      dueDate: dueDate.toISOString().split("T")[0],
    });
    setShowCloneInvoiceModal(true);
  };

  // Edit invoice function
  const handleEditInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    setNewInvoice({
      customerId: invoice.customerId,
      items: invoice.items,
      labor: invoice.labor || [],
      vatRate: invoice.vatRate,
      notes: invoice.notes || "",
      paymentTerms: invoice.paymentTerms,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
    });
    setEditingInvoiceId(invoiceId);
    setShowEditInvoiceModal(true);
  };

  // Save cloned invoice
  const handleSaveClonedInvoice = (sendToWorkOrder: boolean = false) => {
    if (
      !newInvoice.customerId ||
      newInvoice.items.length === 0 ||
      !newInvoice.issueDate ||
      !newInvoice.dueDate
    ) {
      alert("Vul alle verplichte velden in!");
      return;
    }

    const { subtotal, vatAmount, total } = calculateInvoiceTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(newInvoice.customerId);

    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: newInvoice.customerId,
      items: newInvoice.items,
      labor: newInvoice.labor.length > 0 ? newInvoice.labor : undefined,
      subtotal: subtotal,
      vatRate: newInvoice.vatRate,
      vatAmount: vatAmount,
      total: total,
      status: "draft",
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createHistoryEntry(
          "invoice",
          "created",
          `Factuur gecloneerd door ${getEmployeeName(
            currentUser.employeeId
          )} voor klant ${customerName}`
        ),
      ],
    };

    setInvoices([...invoices, invoice]);
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
    setShowCloneInvoiceModal(false);

    if (sendToWorkOrder) {
      const totalHours =
        invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

      setSelectedInvoiceForWorkOrder(invoice.id);
      setSelectedUserId("");
      setShowUserSelectionModal(true);
    } else {
      alert(`✅ Factuur ${invoice.invoiceNumber} succesvol gecloneerd!`);
    }
  };

  // Save edited invoice
  const handleSaveEditedInvoice = () => {
    if (!editingInvoiceId) return;
    if (
      !newInvoice.customerId ||
      newInvoice.items.length === 0 ||
      !newInvoice.issueDate ||
      !newInvoice.dueDate
    ) {
      alert("Vul alle verplichte velden in!");
      return;
    }

    const { subtotal, vatAmount, total } = calculateInvoiceTotals();
    const existingInvoice = invoices.find((inv) => inv.id === editingInvoiceId);
    if (!existingInvoice) return;

    const updatedInvoice: Invoice = {
      ...existingInvoice,
      customerId: newInvoice.customerId,
      items: newInvoice.items,
      labor: newInvoice.labor.length > 0 ? newInvoice.labor : undefined,
      subtotal: subtotal,
      vatRate: newInvoice.vatRate,
      vatAmount: vatAmount,
      total: total,
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms,
      history: [
        ...(existingInvoice.history || []),
        createHistoryEntry(
          "invoice",
          "updated",
          `Factuur bijgewerkt door ${getEmployeeName(currentUser.employeeId)}`
        ),
      ],
    };

    setInvoices(
      invoices.map((inv) =>
        inv.id === editingInvoiceId ? updatedInvoice : inv
      )
    );
    setEditingInvoiceId(null);
    setShowEditInvoiceModal(false);
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
    alert(`✅ Factuur ${updatedInvoice.invoiceNumber} succesvol bijgewerkt!`);
  };

  // Convert invoice to work order
  const convertInvoiceToWorkOrder = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    if (invoice.status !== "sent" && invoice.status !== "draft") {
      alert(
        "Alleen verzonden of concept facturen kunnen worden omgezet naar werkorders!"
      );
      return;
    }

    if (invoice.workOrderId) {
      alert("Deze factuur heeft al een gekoppelde werkorder!");
      return;
    }

    setSelectedInvoiceForWorkOrder(invoiceId);
    setSelectedUserId("");
    setShowUserSelectionModal(true);
  };

  // Complete work order conversion
  const completeWorkOrderConversion = () => {
    if (!selectedInvoiceForWorkOrder || !selectedUserId) {
      alert("Selecteer een medewerker!");
      return;
    }

    const invoice = invoices.find(
      (inv) => inv.id === selectedInvoiceForWorkOrder
    );
    if (!invoice) return;

    const now = new Date().toISOString();
    const workOrderId = `wo${Date.now()}`;
    const customerName = getCustomerName(invoice.customerId);
    const totalHours =
      invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

    const workOrder: WorkOrder = {
      id: workOrderId,
      title: `${customerName} - Factuur ${invoice.invoiceNumber}`,
      description:
        invoice.notes ||
        `Werkorder aangemaakt vanuit factuur ${invoice.invoiceNumber}`,
      status: "To Do",
      assignedTo: selectedUserId,
      assignedBy: currentUser.employeeId,
      convertedBy: currentUser.employeeId,
      requiredInventory: invoice.items
        .filter((item) => item.inventoryItemId)
        .map((item) => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity,
        })),
      createdDate: new Date().toISOString().split("T")[0],
      customerId: invoice.customerId,
      location: invoice.location,
      scheduledDate: invoice.scheduledDate,
      invoiceId: invoice.id,
      estimatedHours: totalHours,
      estimatedCost: invoice.total,
      notes: `Geschatte uren: ${totalHours}u\nGeschatte kosten: €${invoice.total.toFixed(
        2
      )}`,
      timestamps: {
        created: now,
        converted: now,
        assigned: now,
      },
      history: [
        {
          timestamp: now,
          action: "created",
          performedBy: currentUser.employeeId,
          details: `Werkorder aangemaakt door ${getEmployeeName(
            currentUser.employeeId
          )}`,
        },
        {
          timestamp: now,
          action: "converted",
          performedBy: currentUser.employeeId,
          details: `Geconverteerd van factuur ${
            invoice.invoiceNumber
          } door ${getEmployeeName(currentUser.employeeId)}`,
        },
        {
          timestamp: now,
          action: "assigned",
          performedBy: currentUser.employeeId,
          details: `Toegewezen aan ${getEmployeeName(
            selectedUserId
          )} door ${getEmployeeName(currentUser.employeeId)}`,
          toAssignee: selectedUserId,
        },
      ],
    };

    setWorkOrders([...workOrders, workOrder]);

    setInvoices(
      invoices.map((inv) =>
        inv.id === selectedInvoiceForWorkOrder
          ? {
              ...inv,
              workOrderId: workOrder.id,
              timestamps: {
                ...inv.timestamps,
                convertedToWorkOrder: now,
              },
              history: [
                ...(inv.history || []),
                createHistoryEntry(
                  "invoice",
                  "converted_to_workorder",
                  `Geconverteerd naar werkorder ${
                    workOrder.id
                  } door ${getEmployeeName(currentUser.employeeId)}`
                ),
              ],
            }
          : inv
      )
    );

    setShowUserSelectionModal(false);
    setSelectedInvoiceForWorkOrder(null);
    setSelectedUserId("");
    alert(
      `✅ Werkorder ${
        workOrder.id
      } succesvol aangemaakt en toegewezen aan ${getEmployeeName(
        selectedUserId
      )}!`
    );
  };

  // Open detail modal voor factuur/offerte
  const openDetailModal = (type: "invoice" | "quote", id: string) => {
    if (type === "invoice") {
      const invoice = invoices.find((inv) => inv.id === id);
      if (invoice) {
        setDetailType("invoice");
        setDetailItem(invoice);
        setShowDetailModal(true);
      }
    } else {
      const quote = quotes.find((q) => q.id === id);
      if (quote) {
        setDetailType("quote");
        setDetailItem(quote);
        setShowDetailModal(true);
      }
    }
  };

  // Quote handlers
  const handleEditQuote = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    setNewQuote({
      customerId: quote.customerId,
      items: quote.items,
      labor: quote.labor || [],
      vatRate: quote.vatRate,
      notes: quote.notes || "",
      validUntil: quote.validUntil,
    });
    setEditingQuoteId(quoteId);
    setShowEditQuoteModal(true);
  };

  const handleCloneQuote = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    setNewQuote({
      customerId: quote.customerId,
      items: quote.items,
      labor: quote.labor || [],
      vatRate: quote.vatRate,
      notes: quote.notes || "",
      validUntil: "", // User should set new date
    });
    setShowCloneQuoteModal(true);
  };

  const convertQuoteToWorkOrder = (quoteId: string) => {
    setSelectedQuoteForWorkOrder(quoteId);
    setShowUserSelectionModal(true);
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral">
            CRM - Klantrelatiebeheer
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Beheer leads, klanten, interacties en sales pipeline
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "dashboard"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "leads"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🎯 Leads & Pipeline
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "customers"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          👥 Klanten
        </button>
        <button
          onClick={() => setActiveTab("interactions")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "interactions"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          💬 Interacties
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "email"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📧 Email
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "tasks"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ✓ Taken
        </button>
      </div>

      {/* Dashboard Tab - Part 1 will continue... */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Leads Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral">Leads</h3>
                <span className="text-3xl">🎯</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Totaal:</span>
                  <span className="text-2xl font-bold text-neutral">
                    {dashboardStats.totalLeads}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Actief:</span>
                  <span className="font-semibold text-blue-600">
                    {dashboardStats.activeLeads}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Gewonnen:</span>
                  <span className="font-semibold text-green-600">
                    {dashboardStats.wonLeads}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Verloren:</span>
                  <span className="font-semibold text-red-600">
                    {dashboardStats.lostLeads}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral">
                  Conversie
                </h3>
                <span className="text-3xl">📈</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {dashboardStats.conversionRate}%
                </div>
                <p className="text-sm text-gray-600">Lead naar Klant</p>
                <div className="mt-4 text-xs text-gray-500">
                  €{dashboardStats.wonValue.toLocaleString()} gewonnen
                </div>
              </div>
            </div>

            {/* Customers Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral">Klanten</h3>
                <span className="text-3xl">👥</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Totaal:</span>
                  <span className="text-2xl font-bold text-neutral">
                    {dashboardStats.totalCustomers}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Zakelijk:</span>
                  <span className="font-semibold text-purple-600">
                    {dashboardStats.businessCustomers}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Particulier:</span>
                  <span className="font-semibold text-purple-600">
                    {dashboardStats.privateCustomers}
                  </span>
                </div>
              </div>
            </div>

            {/* Activities Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral">
                  Activiteiten
                </h3>
                <span className="text-3xl">💬</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Interacties (maand):</span>
                  <span className="font-semibold text-orange-600">
                    {dashboardStats.thisMonthInteractions}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Follow-ups:</span>
                  <span className="font-semibold text-yellow-600">
                    {dashboardStats.pendingFollowUps}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Actieve taken:</span>
                  <span className="font-semibold text-blue-600">
                    {dashboardStats.activeTasks}
                  </span>
                </div>
                {dashboardStats.overdueTasks > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Verlopen:</span>
                    <span className="font-semibold text-red-600">
                      {dashboardStats.overdueTasks}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pipeline Value */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral mb-4 flex items-center gap-2">
              <span>💰</span>
              Pipeline Waarde
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  Totale Pipeline Waarde
                </div>
                <div className="text-3xl font-bold text-primary">
                  €{dashboardStats.totalValue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  Gewonnen Waarde
                </div>
                <div className="text-3xl font-bold text-green-600">
                  €{dashboardStats.wonValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral mb-4">
              Recente Activiteiten
            </h3>
            <div className="space-y-3">
              {interactions
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 5)
                .map((interaction) => {
                  const relatedName = interaction.leadId
                    ? getLeadName(interaction.leadId)
                    : getCustomerName(interaction.customerId);
                  const interactionType = INTERACTION_TYPES.find(
                    (t) => t.value === interaction.type
                  );

                  return (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl">{interactionType?.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-neutral">
                            {interaction.subject}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(interaction.date).toLocaleDateString(
                              "nl-NL"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {interaction.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Met: {relatedName}</span>
                          <span>
                            Door: {getEmployeeName(interaction.employeeId)}
                          </span>
                          {interaction.followUpRequired && (
                            <span className="text-yellow-600 font-medium">
                              ⏰ Follow-up: {interaction.followUpDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Leads Tab - Will continue in next part... */}
      {activeTab === "leads" && (
        <div className="space-y-6">
          {/* Add Lead Button */}
          <div className="flex justify-end">
            {isAdmin && (
              <button
                onClick={() => setShowAddLeadForm(!showAddLeadForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Lead
              </button>
            )}
          </div>

          {/* Add Lead Form */}
          {showAddLeadForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">
                Nieuwe Lead Toevoegen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Naam *"
                  value={newLead.name}
                  onChange={(e) =>
                    setNewLead({ ...newLead, name: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={newLead.email}
                  onChange={(e) =>
                    setNewLead({ ...newLead, email: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  placeholder="Telefoon"
                  value={newLead.phone}
                  onChange={(e) =>
                    setNewLead({ ...newLead, phone: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Bedrijf"
                  value={newLead.company}
                  onChange={(e) =>
                    setNewLead({ ...newLead, company: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newLead.source}
                  onChange={(e) =>
                    setNewLead({ ...newLead, source: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LEAD_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Geschatte waarde (€)"
                  value={newLead.estimatedValue || ""}
                  onChange={(e) =>
                    setNewLead({
                      ...newLead,
                      estimatedValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Notities"
                  value={newLead.notes}
                  onChange={(e) =>
                    setNewLead({ ...newLead, notes: e.target.value })
                  }
                  rows={3}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddLead}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowAddLeadForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Pipeline - Kanban Style */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {(
              [
                "new",
                "contacted",
                "qualified",
                "proposal",
                "negotiation",
                "won",
                "lost",
              ] as LeadStatus[]
            ).map((status) => {
              const leadsInStatus = getLeadsByStatus(status);
              const totalValue = leadsInStatus.reduce(
                (sum, lead) => sum + (lead.estimatedValue || 0),
                0
              );

              return (
                <div
                  key={status}
                  className={`rounded-lg p-4 min-h-[400px] ${getStatusColor(
                    status
                  )}`}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">
                        {getStatusLabel(status)}
                      </h3>
                      <span className="px-2 py-1 bg-white bg-opacity-70 rounded-full text-xs font-bold">
                        {leadsInStatus.length}
                      </span>
                    </div>
                    {totalValue > 0 && (
                      <div className="text-xs font-medium opacity-80">
                        €{totalValue.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {leadsInStatus.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-neutral text-sm">
                            {lead.name}
                          </h4>
                          {isAdmin && status !== "won" && status !== "lost" && (
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                              title="Verwijderen"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        {lead.company && (
                          <p className="text-xs text-gray-600 mb-2">
                            {lead.company}
                          </p>
                        )}

                        {lead.estimatedValue && (
                          <p className="text-sm font-bold text-primary mb-2">
                            €{lead.estimatedValue.toLocaleString()}
                          </p>
                        )}

                        <div className="space-y-1 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <span>📧</span>
                            <span className="truncate">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <span>📞</span>
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{lead.source}</span>
                          </div>
                        </div>

                        {lead.notes && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {lead.notes}
                          </p>
                        )}

                        {lead.nextFollowUpDate && (
                          <div className="mb-3 text-xs">
                            <span className="text-yellow-600">
                              ⏰ Follow-up: {lead.nextFollowUpDate}
                            </span>
                          </div>
                        )}

                        {/* Status Actions */}
                        {isAdmin && (
                          <div className="flex flex-col gap-2">
                            {status === "new" && (
                              <button
                                onClick={() =>
                                  updateLeadStatus(lead.id, "contacted")
                                }
                                className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                              >
                                → Gecontacteerd
                              </button>
                            )}
                            {status === "contacted" && (
                              <button
                                onClick={() =>
                                  updateLeadStatus(lead.id, "qualified")
                                }
                                className="w-full px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600"
                              >
                                → Gekwalificeerd
                              </button>
                            )}
                            {status === "qualified" && (
                              <button
                                onClick={() =>
                                  updateLeadStatus(lead.id, "proposal")
                                }
                                className="w-full px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                              >
                                → Voorstel
                              </button>
                            )}
                            {status === "proposal" && (
                              <button
                                onClick={() =>
                                  updateLeadStatus(lead.id, "negotiation")
                                }
                                className="w-full px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                              >
                                → Onderhandeling
                              </button>
                            )}
                            {["negotiation", "proposal", "qualified"].includes(
                              status
                            ) && (
                              <>
                                <button
                                  onClick={() => convertLeadToCustomer(lead.id)}
                                  className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                >
                                  ✓ Gewonnen
                                </button>
                                <button
                                  onClick={() =>
                                    updateLeadStatus(lead.id, "lost")
                                  }
                                  className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  × Verloren
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Zoek op klantnaam of bedrijfsnaam..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {customerSearchTerm && (
                    <button
                      onClick={() => setCustomerSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Wis zoekterm"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowAddCustomerForm(!showAddCustomerForm)}
                  className="px-4 sm:px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors whitespace-nowrap"
                >
                  + Nieuwe Klant
                </button>
              )}
            </div>
            {customerSearchTerm && (
              <p className="mt-2 text-sm text-gray-600">
                {(() => {
                  const filtered = customers.filter((customer) => {
                    const searchLower = customerSearchTerm.toLowerCase();
                    return (
                      customer.name.toLowerCase().includes(searchLower) ||
                      (customer.company &&
                        customer.company.toLowerCase().includes(searchLower)) ||
                      (customer.email &&
                        customer.email.toLowerCase().includes(searchLower))
                    );
                  });
                  return `${filtered.length} klant${
                    filtered.length !== 1 ? "en" : ""
                  } gevonden`;
                })()}
              </p>
            )}
          </div>

          {/* Add Customer Form */}
          {showAddCustomerForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">
                Nieuwe Klant Toevoegen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Naam *"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  placeholder="Telefoon"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newCustomer.type}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      type: e.target.value as any,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="business">Zakelijk</option>
                  <option value="private">Particulier</option>
                </select>
                <input
                  type="text"
                  placeholder="Bedrijf"
                  value={newCustomer.company}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, company: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newCustomer.source}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, source: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LEAD_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Adres"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
                <textarea
                  placeholder="Notities (intern)"
                  value={newCustomer.notes}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, notes: e.target.value })
                  }
                  rows={3}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddCustomer}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowAddCustomerForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Edit Customer Form */}
          {showEditCustomerForm && editingCustomer && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">
                Klant Bewerken
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Naam *"
                  value={editCustomer.name}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, name: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={editCustomer.email}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, email: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  placeholder="Telefoon"
                  value={editCustomer.phone}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, phone: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={editCustomer.type}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      type: e.target.value as any,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="business">Zakelijk</option>
                  <option value="private">Particulier</option>
                </select>
                <input
                  type="text"
                  placeholder="Bedrijf"
                  value={editCustomer.company}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      company: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={editCustomer.source}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, source: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LEAD_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Adres"
                  value={editCustomer.address}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      address: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
                <textarea
                  placeholder="Notities (intern)"
                  value={editCustomer.notes}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, notes: e.target.value })
                  }
                  rows={3}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleEditCustomer}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Opslaan
                </button>
                <button
                  onClick={() => {
                    setShowEditCustomerForm(false);
                    setEditingCustomer(null);
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
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Customers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers
              .filter((customer) => {
                if (!customerSearchTerm) return true;
                const searchLower = customerSearchTerm.toLowerCase();
                return (
                  customer.name.toLowerCase().includes(searchLower) ||
                  (customer.company &&
                    customer.company.toLowerCase().includes(searchLower)) ||
                  (customer.email &&
                    customer.email.toLowerCase().includes(searchLower))
                );
              })
              .map((customer) => {
                const customerSales = getCustomerSales(customer.id);
                const totalSpent = getCustomerTotal(customer.id);
                const customerInteractions = interactions.filter(
                  (i) => i.customerId === customer.id
                );

                return (
                  <div
                    key={customer.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral text-lg">
                            {customer.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {customer.type === "business"
                              ? "🏢 Zakelijk"
                              : "👤 Particulier"}{" "}
                            • Sinds {customer.since}
                          </p>
                        </div>
                      </div>
                    </div>

                    {customer.company && (
                      <div className="mb-3 text-sm font-medium text-gray-700">
                        {customer.company}
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 text-gray-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-700 truncate">
                          {customer.email}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 text-gray-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-gray-700">{customer.phone}</span>
                      </div>
                      {customer.address && (
                        <div className="flex items-center text-sm">
                          <svg
                            className="w-4 h-4 text-gray-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-gray-700 text-xs truncate">
                            {customer.address}
                          </span>
                        </div>
                      )}
                      {customer.source && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 mr-2">📍</span>
                          <span className="text-gray-600 text-xs">
                            Bron: {customer.source}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-xs text-gray-600">Omzet</div>
                          <div className="text-lg font-bold text-primary">
                            €{totalSpent.toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Orders</div>
                          <div className="text-lg font-bold text-neutral">
                            {customerSales.length}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Contact</div>
                          <div className="text-lg font-bold text-blue-600">
                            {customerInteractions.length}
                          </div>
                        </div>
                      </div>
                    </div>

                    {customer.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-xs font-semibold text-yellow-800 mb-1 flex items-center gap-1">
                          <span>📝</span>
                          <span>Notities:</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {customer.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openFinances(customer.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                        >
                          💰 Financiën
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomerId(customer.id);
                            setShowJourneyModal(true);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                        >
                          🗺️ Journey
                        </button>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditCustomer(customer)}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            ✏️ Bewerken
                          </button>
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            🗑️ Verwijderen
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {customers.filter((customer) => {
            if (!customerSearchTerm) return true;
            const searchLower = customerSearchTerm.toLowerCase();
            return (
              customer.name.toLowerCase().includes(searchLower) ||
              (customer.company &&
                customer.company.toLowerCase().includes(searchLower)) ||
              (customer.email &&
                customer.email.toLowerCase().includes(searchLower))
            );
          }).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {customerSearchTerm
                  ? `Geen klanten gevonden voor "${customerSearchTerm}"`
                  : "Geen klanten gevonden"}
              </p>
              {customerSearchTerm && (
                <button
                  onClick={() => setCustomerSearchTerm("")}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Wis zoekfilter
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Interactions Tab */}
      {activeTab === "interactions" && (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddInteractionForm(!showAddInteractionForm)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              + Nieuwe Interactie
            </button>
          </div>

          {/* Add Interaction Form */}
          {showAddInteractionForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">
                Nieuwe Interactie Registreren
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newInteraction.type}
                  onChange={(e) =>
                    setNewInteraction({
                      ...newInteraction,
                      type: e.target.value as InteractionType,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {INTERACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Onderwerp *"
                  value={newInteraction.subject}
                  onChange={(e) =>
                    setNewInteraction({
                      ...newInteraction,
                      subject: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newInteraction.relatedType}
                  onChange={(e) =>
                    setNewInteraction({
                      ...newInteraction,
                      relatedType: e.target.value as any,
                      relatedTo: "",
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="lead">Lead</option>
                  <option value="customer">Klant</option>
                </select>
                <select
                  value={newInteraction.relatedTo}
                  onChange={(e) =>
                    setNewInteraction({
                      ...newInteraction,
                      relatedTo: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    Selecteer{" "}
                    {newInteraction.relatedType === "lead" ? "lead" : "klant"} *
                  </option>
                  {newInteraction.relatedType === "lead"
                    ? leads
                        .filter((l) => !["won", "lost"].includes(l.status))
                        .map((lead) => (
                          <option key={lead.id} value={lead.id}>
                            {lead.name}
                          </option>
                        ))
                    : customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                </select>
                <textarea
                  placeholder="Beschrijving"
                  value={newInteraction.description}
                  onChange={(e) =>
                    setNewInteraction({
                      ...newInteraction,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newInteraction.followUpRequired}
                      onChange={(e) =>
                        setNewInteraction({
                          ...newInteraction,
                          followUpRequired: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      Follow-up vereist
                    </span>
                  </label>
                  {newInteraction.followUpRequired && (
                    <input
                      type="date"
                      value={newInteraction.followUpDate}
                      onChange={(e) =>
                        setNewInteraction({
                          ...newInteraction,
                          followUpDate: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddInteraction}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowAddInteractionForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Interactions Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral mb-6">
              Interactie Geschiedenis
            </h3>
            <div className="space-y-4">
              {interactions
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((interaction) => {
                  const relatedName = interaction.leadId
                    ? getLeadName(interaction.leadId)
                    : getCustomerName(interaction.customerId);
                  const interactionType = INTERACTION_TYPES.find(
                    (t) => t.value === interaction.type
                  );

                  return (
                    <div
                      key={interaction.id}
                      className="flex gap-4 border-l-4 border-blue-400 pl-4 py-2"
                    >
                      <div className="flex-shrink-0">
                        <span className="text-3xl">
                          {interactionType?.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-neutral">
                              {interaction.subject}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {interactionType?.label}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(interaction.date).toLocaleString(
                              "nl-NL",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          {interaction.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <span>👤</span>
                            {relatedName}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>💼</span>
                            {getEmployeeName(interaction.employeeId)}
                          </span>
                          {interaction.followUpRequired && (
                            <span className="flex items-center gap-1 text-yellow-600 font-medium">
                              <span>⏰</span>
                              Follow-up: {interaction.followUpDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            {interactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Geen interacties gevonden</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Finances Modal */}
      {showFinancesModal &&
        selectedCustomerId &&
        (() => {
          const customer = customers.find((c) => c.id === selectedCustomerId);
          const finances = getCustomerFinances(selectedCustomerId);

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-5xl sm:w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 sm:p-6 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral">
                        💰 Financiën - {customer?.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Overzicht van alle facturen en offertes
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowFinancesModal(false);
                        setSelectedCustomerId(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Totals */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-blue-700 font-medium mb-1">
                        💵 Gefactureerd
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        €{finances.totalInvoiced.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-green-700 font-medium mb-1">
                        ✓ Betaald
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        €{finances.totalPaid.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-yellow-700 font-medium mb-1">
                        ⏳ Openstaand
                      </div>
                      <div className="text-2xl font-bold text-yellow-900">
                        €{finances.totalOutstanding.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-red-700 font-medium mb-1">
                        ⚠️ Verlopen
                      </div>
                      <div className="text-2xl font-bold text-red-900">
                        €{finances.totalOverdue.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-purple-700 font-medium mb-1">
                        📋 Offertes
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        €{finances.totalQuotes.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Invoices Table */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-neutral mb-4 flex items-center gap-2">
                      <span>🪧</span>
                      Facturen ({finances.invoices.length})
                    </h3>
                    {finances.invoices.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Factuurnr
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Datum
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Status
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                Bedrag
                              </th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                Acties
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {finances.invoices.map((invoice) => (
                              <tr
                                key={invoice.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onDoubleClick={() =>
                                  openDetailModal("invoice", invoice.id)
                                }
                                title="Dubbelklik om details te zien"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {invoice.invoiceNumber}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {invoice.issueDate}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getInvoiceStatusColor(
                                      invoice.status
                                    )}`}
                                  >
                                    {invoice.status === "paid" && "Betaald"}
                                    {invoice.status === "sent" && "Verzonden"}
                                    {invoice.status === "overdue" && "Verlopen"}
                                    {invoice.status === "draft" && "Concept"}
                                    {invoice.status === "cancelled" &&
                                      "Geannuleerd"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                                  €{invoice.total.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() =>
                                        handleEditInvoice(invoice.id)
                                      }
                                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                                      title="Bewerken"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleCloneInvoice(invoice.id)
                                      }
                                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                                      title="Clonen"
                                    >
                                      📋
                                    </button>
                                    {(invoice.status === "sent" ||
                                      invoice.status === "draft") &&
                                      !invoice.workOrderId && (
                                        <button
                                          onClick={() =>
                                            convertInvoiceToWorkOrder(
                                              invoice.id
                                            )
                                          }
                                          className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                                          title="Naar Werkorder"
                                        >
                                          📤
                                        </button>
                                      )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Geen facturen gevonden
                      </p>
                    )}
                  </div>

                  {/* Quotes Table */}
                  <div>
                    <h3 className="text-xl font-semibold text-neutral mb-4 flex items-center gap-2">
                      <span>📋</span>
                      Offertes ({finances.quotes.length})
                    </h3>
                    {finances.quotes.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Offerte ID
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Aangemaakt
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Status
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                Bedrag
                              </th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                Acties
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {finances.quotes.map((quote) => (
                              <tr
                                key={quote.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onDoubleClick={() =>
                                  openDetailModal("quote", quote.id)
                                }
                                title="Dubbelklik om details te zien"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {quote.id}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {quote.createdDate}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getQuoteStatusColor(
                                      quote.status
                                    )}`}
                                  >
                                    {quote.status === "approved" &&
                                      "Geaccepteerd"}
                                    {quote.status === "sent" && "Verzonden"}
                                    {quote.status === "rejected" && "Afgewezen"}
                                    {quote.status === "draft" && "Concept"}
                                    {quote.status === "expired" && "Verlopen"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                                  €{quote.total.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditQuote(quote.id);
                                      }}
                                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                                      title="Bewerken"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloneQuote(quote.id);
                                      }}
                                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                                      title="Clonen"
                                    >
                                      📋
                                    </button>
                                    {(quote.status === "approved" ||
                                      quote.status === "sent") &&
                                      !quote.workOrderId && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            convertQuoteToWorkOrder(quote.id);
                                          }}
                                          className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                                          title="Naar Werkorder"
                                        >
                                          📤
                                        </button>
                                      )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Geen offertes gevonden
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Customer Journey Modal */}
      {showJourneyModal &&
        selectedCustomerId &&
        (() => {
          const customer = customers.find((c) => c.id === selectedCustomerId);
          const journey = getCustomerJourney(selectedCustomerId);

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-6xl sm:w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 sm:p-6 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral">
                        🗺️ Customer Journey - {customer?.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Volledig overzicht van offerte → werkorder → factuur →
                        betaald
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowJourneyModal(false);
                        setSelectedCustomerId(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Visual Pipeline */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-neutral mb-4">
                      Pipeline Status
                    </h3>
                    <div className="flex items-center justify-between relative">
                      {/* Progress Bar */}
                      <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 rounded-full -translate-y-1/2 z-0">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${journey.progressPercentage}%` }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="relative z-10 flex items-center justify-between w-full">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                              journey.quotes.length > 0
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          >
                            {journey.quotes.length > 0 ? "✓" : "1"}
                          </div>
                          <span className="text-xs font-medium mt-2 text-center">
                            Offerte
                          </span>
                          <span className="text-xs text-gray-500">
                            {journey.quotes.length}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                              journey.workOrders.length > 0
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          >
                            {journey.workOrders.length > 0 ? "✓" : "2"}
                          </div>
                          <span className="text-xs font-medium mt-2 text-center">
                            Werkorder
                          </span>
                          <span className="text-xs text-gray-500">
                            {journey.workOrders.length}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                              journey.invoices.length > 0
                                ? "bg-purple-500"
                                : "bg-gray-300"
                            }`}
                          >
                            {journey.invoices.length > 0 ? "✓" : "3"}
                          </div>
                          <span className="text-xs font-medium mt-2 text-center">
                            Factuur
                          </span>
                          <span className="text-xs text-gray-500">
                            {journey.invoices.length}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                              journey.invoicesByStatus.paid.length > 0
                                ? "bg-green-600"
                                : "bg-gray-300"
                            }`}
                          >
                            {journey.invoicesByStatus.paid.length > 0
                              ? "✓"
                              : "4"}
                          </div>
                          <span className="text-xs font-medium mt-2 text-center">
                            Betaald
                          </span>
                          <span className="text-xs text-gray-500">
                            {journey.invoicesByStatus.paid.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-blue-700 font-medium mb-1">
                        📋 Offertes
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {journey.quotes.length}
                      </div>
                      {journey.quotesByStatus.approved.length > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          {journey.quotesByStatus.approved.length} geaccepteerd
                        </div>
                      )}
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-green-700 font-medium mb-1">
                        📦 Werkorders
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {journey.workOrders.length}
                      </div>
                      {journey.workOrdersByStatus.inProgress.length > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          {journey.workOrdersByStatus.inProgress.length} in
                          uitvoering
                        </div>
                      )}
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-purple-700 font-medium mb-1">
                        🧾 Facturen
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {journey.invoices.length}
                      </div>
                      {journey.invoicesByStatus.sent.length > 0 && (
                        <div className="text-xs text-purple-600 mt-1">
                          {journey.invoicesByStatus.sent.length} verzonden
                        </div>
                      )}
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <div className="text-sm text-yellow-700 font-medium mb-1">
                        💰 Betaald
                      </div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {journey.invoicesByStatus.paid.length}
                      </div>
                      {journey.invoicesByStatus.overdue.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {journey.invoicesByStatus.overdue.length} verlopen
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline View */}
                  <div className="space-y-6">
                    {/* Quotes Section */}
                    {journey.quotes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-neutral mb-4 flex items-center gap-2">
                          <span className="text-blue-500">📋</span>
                          Offertes ({journey.quotes.length})
                        </h3>
                        <div className="space-y-3">
                          {journey.quotes.map((quote) => {
                            const relatedWorkOrder = quote.workOrderId
                              ? journey.workOrders.find(
                                  (wo) => wo.id === quote.workOrderId
                                )
                              : null;
                            const relatedInvoice = quote.invoiceId
                              ? journey.invoices.find(
                                  (inv) => inv.id === quote.invoiceId
                                )
                              : null;

                            return (
                              <div
                                key={quote.id}
                                className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-semibold text-neutral">
                                        {quote.id}
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${getQuoteStatusColor(
                                          quote.status
                                        )}`}
                                      >
                                        {quote.status === "approved" &&
                                          "Geaccepteerd"}
                                        {quote.status === "sent" && "Verzonden"}
                                        {quote.status === "rejected" &&
                                          "Afgewezen"}
                                        {quote.status === "draft" && "Concept"}
                                        {quote.status === "expired" &&
                                          "Verlopen"}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      Aangemaakt: {quote.createdDate} • €
                                      {quote.total.toFixed(2)}
                                    </p>
                                    {relatedWorkOrder && (
                                      <div className="flex items-center gap-2 text-sm text-green-700">
                                        <span>→</span>
                                        <span>
                                          Werkorder: {relatedWorkOrder.id}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded text-xs ${
                                            relatedWorkOrder.status ===
                                            "Voltooid"
                                              ? "bg-green-200"
                                              : "bg-yellow-200"
                                          }`}
                                        >
                                          {relatedWorkOrder.status}
                                        </span>
                                      </div>
                                    )}
                                    {relatedInvoice && (
                                      <div className="flex items-center gap-2 text-sm text-purple-700 mt-1">
                                        <span>→</span>
                                        <span>
                                          Factuur:{" "}
                                          {relatedInvoice.invoiceNumber}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded text-xs ${
                                            relatedInvoice.status === "paid"
                                              ? "bg-green-200"
                                              : "bg-yellow-200"
                                          }`}
                                        >
                                          {relatedInvoice.status === "paid"
                                            ? "Betaald"
                                            : relatedInvoice.status}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    {quote.status === "approved" &&
                                      !quote.workOrderId && (
                                        <button
                                          onClick={() => {
                                            setShowJourneyModal(false);
                                            convertQuoteToWorkOrder(quote.id);
                                          }}
                                          className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                                          title="Maak Werkorder"
                                        >
                                          📋 Werkorder
                                        </button>
                                      )}
                                    <button
                                      onClick={() => {
                                        setShowJourneyModal(false);
                                        openDetailModal("quote", quote.id);
                                      }}
                                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                                      title="Details"
                                    >
                                      👁️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Work Orders Section */}
                    {journey.workOrders.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-neutral mb-4 flex items-center gap-2">
                          <span className="text-green-500">📦</span>
                          Werkorders ({journey.workOrders.length})
                        </h3>
                        <div className="space-y-3">
                          {journey.workOrders.map((workOrder) => {
                            const relatedQuote = workOrder.quoteId
                              ? journey.quotes.find(
                                  (q) => q.id === workOrder.quoteId
                                )
                              : null;
                            const relatedInvoice = workOrder.invoiceId
                              ? journey.invoices.find(
                                  (inv) => inv.id === workOrder.invoiceId
                                )
                              : null;

                            return (
                              <div
                                key={workOrder.id}
                                className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-semibold text-neutral">
                                        {workOrder.id}
                                      </span>
                                      <span className="text-xs text-gray-600">
                                        • {workOrder.title}
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                          workOrder.status === "Voltooid"
                                            ? "bg-green-200 text-green-800"
                                            : workOrder.status ===
                                              "In Uitvoering"
                                            ? "bg-blue-200 text-blue-800"
                                            : "bg-gray-200 text-gray-800"
                                        }`}
                                      >
                                        {workOrder.status}
                                      </span>
                                    </div>
                                    {relatedQuote && (
                                      <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                                        <span>←</span>
                                        <span>Offerte: {relatedQuote.id}</span>
                                      </div>
                                    )}
                                    {relatedInvoice && (
                                      <div className="flex items-center gap-2 text-sm text-purple-700">
                                        <span>→</span>
                                        <span>
                                          Factuur:{" "}
                                          {relatedInvoice.invoiceNumber}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded text-xs ${
                                            relatedInvoice.status === "paid"
                                              ? "bg-green-200"
                                              : "bg-yellow-200"
                                          }`}
                                        >
                                          {relatedInvoice.status === "paid"
                                            ? "Betaald"
                                            : relatedInvoice.status}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {workOrder.status === "Voltooid" &&
                                    !relatedInvoice && (
                                      <button
                                        onClick={() => {
                                          setShowJourneyModal(false);
                                          // Navigate to work orders to create invoice
                                          alert(
                                            "Ga naar Werkorders om factuur aan te maken"
                                          );
                                        }}
                                        className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                                        title="Maak Factuur"
                                      >
                                        🧾 Factuur
                                      </button>
                                    )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Invoices Section */}
                    {journey.invoices.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-neutral mb-4 flex items-center gap-2">
                          <span className="text-purple-500">🧾</span>
                          Facturen ({journey.invoices.length})
                        </h3>
                        <div className="space-y-3">
                          {journey.invoices.map((invoice) => {
                            const relatedQuote = invoice.quoteId
                              ? journey.quotes.find(
                                  (q) => q.id === invoice.quoteId
                                )
                              : null;
                            const relatedWorkOrder = invoice.workOrderId
                              ? journey.workOrders.find(
                                  (wo) => wo.id === invoice.workOrderId
                                )
                              : null;

                            return (
                              <div
                                key={invoice.id}
                                className={`border-l-4 rounded-lg p-4 ${
                                  invoice.status === "paid"
                                    ? "bg-green-50 border-green-500"
                                    : invoice.status === "overdue"
                                    ? "bg-red-50 border-red-500"
                                    : "bg-purple-50 border-purple-500"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-semibold text-neutral">
                                        {invoice.invoiceNumber}
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${getInvoiceStatusColor(
                                          invoice.status
                                        )}`}
                                      >
                                        {invoice.status === "paid" && "Betaald"}
                                        {invoice.status === "sent" &&
                                          "Verzonden"}
                                        {invoice.status === "overdue" &&
                                          "Verlopen"}
                                        {invoice.status === "draft" &&
                                          "Concept"}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {invoice.issueDate} • €
                                      {invoice.total.toFixed(2)}
                                      {invoice.dueDate &&
                                        ` • Vervaldatum: ${invoice.dueDate}`}
                                    </p>
                                    {relatedQuote && (
                                      <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                                        <span>←</span>
                                        <span>Offerte: {relatedQuote.id}</span>
                                      </div>
                                    )}
                                    {relatedWorkOrder && (
                                      <div className="flex items-center gap-2 text-sm text-green-700">
                                        <span>←</span>
                                        <span>
                                          Werkorder: {relatedWorkOrder.id}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setShowJourneyModal(false);
                                      openDetailModal("invoice", invoice.id);
                                    }}
                                    className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                                    title="Details"
                                  >
                                    👁️
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {journey.quotes.length === 0 &&
                      journey.workOrders.length === 0 &&
                      journey.invoices.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <p className="text-gray-500 mb-4">
                            Geen activiteit gevonden voor deze klant
                          </p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                setShowJourneyModal(false);
                                // Navigate to create quote
                                alert(
                                  "Maak een offerte aan in het Accounting module"
                                );
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              📋 Maak Offerte
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Detail Modal voor Factuur/Offerte */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-neutral">
                {detailType === "quote"
                  ? "📋 Offerte Details"
                  : "🧾 Factuur Details"}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {detailType === "quote" ? (
                <>
                  {(() => {
                    const quote = detailItem as Quote;
                    const customerName =
                      getCustomerName(quote.customerId) || "Onbekend";
                    const itemsSubtotal = quote.items.reduce(
                      (sum, item) => sum + item.total,
                      0
                    );
                    const laborSubtotal =
                      quote.labor?.reduce((sum, l) => sum + l.total, 0) || 0;
                    const subtotal = itemsSubtotal + laborSubtotal;
                    const vatAmount = subtotal * (quote.vatRate / 100);
                    const total = subtotal + vatAmount;

                    return (
                      <>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Offerte ID:
                            </label>
                            <p className="text-neutral font-bold">{quote.id}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Klant:
                            </label>
                            <p className="text-neutral">{customerName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Status:
                            </label>
                            <p className="text-neutral">
                              <span
                                className={`px-2 py-1 rounded text-sm font-semibold ${getQuoteStatusColor(
                                  quote.status
                                )}`}
                              >
                                {quote.status === "approved" && "Geaccepteerd"}
                                {quote.status === "sent" && "Verzonden"}
                                {quote.status === "rejected" && "Afgewezen"}
                                {quote.status === "draft" && "Concept"}
                                {quote.status === "expired" && "Verlopen"}
                              </span>
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Geldig tot:
                            </label>
                            <p className="text-neutral">{quote.validUntil}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="font-semibold text-neutral mb-2">
                            Items:
                          </h3>
                          <div className="space-y-2">
                            {quote.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between p-2 bg-gray-50 rounded"
                              >
                                <span>
                                  {item.description} × {item.quantity}
                                </span>
                                <span className="font-semibold">
                                  €{item.total.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {quote.labor && quote.labor.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-semibold text-neutral mb-2">
                              Werkuren:
                            </h3>
                            <div className="space-y-2">
                              {quote.labor.map((labor, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between p-2 bg-green-50 rounded"
                                >
                                  <span>
                                    {labor.description} ({labor.hours}u × €
                                    {labor.hourlyRate}/u)
                                  </span>
                                  <span className="font-semibold">
                                    €{labor.total.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex justify-between mb-1">
                            <span>Subtotaal:</span>
                            <span>€{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>BTW ({quote.vatRate}%):</span>
                            <span>€{vatAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Totaal:</span>
                            <span>€{total.toFixed(2)}</span>
                          </div>
                        </div>

                        {quote.notes && (
                          <div className="mb-4">
                            <label className="text-sm font-semibold text-gray-600">
                              Notities:
                            </label>
                            <p className="text-neutral mt-1">{quote.notes}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
                  {(() => {
                    const invoice = detailItem as Invoice;
                    const customerName =
                      getCustomerName(invoice.customerId) || "Onbekend";
                    const itemsSubtotal = invoice.items.reduce(
                      (sum, item) => sum + item.total,
                      0
                    );
                    const laborSubtotal =
                      invoice.labor?.reduce((sum, l) => sum + l.total, 0) || 0;
                    const subtotal = itemsSubtotal + laborSubtotal;
                    const vatAmount = subtotal * (invoice.vatRate / 100);
                    const total = subtotal + vatAmount;

                    return (
                      <>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Factuurnummer:
                            </label>
                            <p className="text-neutral font-bold">
                              {invoice.invoiceNumber}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Klant:
                            </label>
                            <p className="text-neutral">{customerName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Status:
                            </label>
                            <p className="text-neutral">
                              <span
                                className={`px-2 py-1 rounded text-sm font-semibold ${getInvoiceStatusColor(
                                  invoice.status
                                )}`}
                              >
                                {invoice.status === "paid" && "Betaald"}
                                {invoice.status === "sent" && "Verzonden"}
                                {invoice.status === "overdue" && "Verlopen"}
                                {invoice.status === "draft" && "Concept"}
                                {invoice.status === "cancelled" &&
                                  "Geannuleerd"}
                              </span>
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Factuurdatum:
                            </label>
                            <p className="text-neutral">{invoice.issueDate}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Vervaldatum:
                            </label>
                            <p className="text-neutral">{invoice.dueDate}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">
                              Betalingsvoorwaarden:
                            </label>
                            <p className="text-neutral">
                              {invoice.paymentTerms || "14 dagen"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="font-semibold text-neutral mb-2">
                            Items:
                          </h3>
                          <div className="space-y-2">
                            {invoice.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between p-2 bg-gray-50 rounded"
                              >
                                <span>
                                  {item.description} × {item.quantity}
                                </span>
                                <span className="font-semibold">
                                  €{item.total.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {invoice.labor && invoice.labor.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-semibold text-neutral mb-2">
                              Werkuren:
                            </h3>
                            <div className="space-y-2">
                              {invoice.labor.map((labor, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between p-2 bg-green-50 rounded"
                                >
                                  <span>
                                    {labor.description} ({labor.hours}u × €
                                    {labor.hourlyRate}/u)
                                  </span>
                                  <span className="font-semibold">
                                    €{labor.total.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex justify-between mb-1">
                            <span>Subtotaal:</span>
                            <span>€{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>BTW ({invoice.vatRate}%):</span>
                            <span>€{vatAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Totaal:</span>
                            <span>€{total.toFixed(2)}</span>
                          </div>
                        </div>

                        {invoice.notes && (
                          <div className="mb-4">
                            <label className="text-sm font-semibold text-gray-600">
                              Notities:
                            </label>
                            <p className="text-neutral mt-1">{invoice.notes}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (detailType === "invoice") {
                      handleEditInvoice((detailItem as Invoice).id);
                      setShowDetailModal(false);
                    } else {
                      handleEditQuote((detailItem as Quote).id);
                      setShowDetailModal(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  ✏️ Bewerken
                </button>
                <button
                  onClick={() => {
                    if (detailType === "invoice") {
                      handleCloneInvoice((detailItem as Invoice).id);
                      setShowDetailModal(false);
                    } else {
                      handleCloneQuote((detailItem as Quote).id);
                      setShowDetailModal(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  📋 Clonen
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clone Invoice Modal */}
      {showCloneInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto p-4 sm:p-6 sm:my-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral">
                📋 Factuur Clonen
              </h2>
              <button
                onClick={() => setShowCloneInvoiceModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> De nieuwe factuur krijgt automatisch
                een nieuw factuurnummer en de datum wordt op vandaag gezet.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klant *
                </label>
                <select
                  value={newInvoice.customerId}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, customerId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Factuurdatum *
                  </label>
                  <input
                    type="date"
                    value={newInvoice.issueDate}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        issueDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vervaldatum *
                  </label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BTW Tarief (%)
                  </label>
                  <input
                    type="number"
                    value={newInvoice.vatRate}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        vatRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Betalingstermijn
                  </label>
                  <input
                    type="text"
                    value={newInvoice.paymentTerms}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="14 dagen"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notities
                </label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Extra opmerkingen..."
                />
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">Items</h3>
                  <button
                    onClick={handleAddInvoiceCustomItem}
                    className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                  >
                    + Item Toevoegen
                  </button>
                </div>

                {newInvoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Beschrijving"
                      value={item.description}
                      onChange={(e) =>
                        handleInvoiceItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Aantal"
                      value={item.quantity}
                      onChange={(e) =>
                        handleInvoiceItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Prijs/stuk"
                      value={item.pricePerUnit}
                      onChange={(e) =>
                        handleInvoiceItemChange(
                          index,
                          "pricePerUnit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{item.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveInvoiceItem(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Labor Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">
                    Werkuren (optioneel)
                  </h3>
                  <button
                    onClick={handleAddInvoiceLabor}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    + Werkuren Toevoegen
                  </button>
                </div>

                {newInvoice.labor.map((labor, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Beschrijving werkzaamheden"
                      value={labor.description}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Uren"
                      value={labor.hours}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "hours",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.5"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Uurtarief"
                      value={labor.hourlyRate}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "hourlyRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{labor.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveInvoiceLabor(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {newInvoice.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotaal:</span>
                    <span className="font-semibold">
                      €{calculateInvoiceTotals().subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      BTW ({newInvoice.vatRate}%):
                    </span>
                    <span className="font-semibold">
                      €{calculateInvoiceTotals().vatAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Totaal:</span>
                    <span className="text-primary">
                      €{calculateInvoiceTotals().total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <div className="flex gap-3">
                <button
                  onClick={() => handleSaveClonedInvoice(false)}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  ✓ Gecloneerde Factuur Opslaan
                </button>
                <button
                  onClick={() => setShowCloneInvoiceModal(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
              <button
                onClick={() => handleSaveClonedInvoice(true)}
                className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                📤 Opslaan en naar Werkorder Sturen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto p-4 sm:p-6 sm:my-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral">
                ✏️ Factuur Bewerken
              </h2>
              <button
                onClick={() => {
                  setShowEditInvoiceModal(false);
                  setEditingInvoiceId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klant *
                </label>
                <select
                  value={newInvoice.customerId}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, customerId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Factuurdatum *
                  </label>
                  <input
                    type="date"
                    value={newInvoice.issueDate}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        issueDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vervaldatum *
                  </label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BTW Tarief (%)
                  </label>
                  <input
                    type="number"
                    value={newInvoice.vatRate}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        vatRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Betalingstermijn
                  </label>
                  <input
                    type="text"
                    value={newInvoice.paymentTerms}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="14 dagen"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notities
                </label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Extra opmerkingen..."
                />
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">Items</h3>
                  <button
                    onClick={handleAddInvoiceCustomItem}
                    className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                  >
                    + Item Toevoegen
                  </button>
                </div>

                {newInvoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Beschrijving"
                      value={item.description}
                      onChange={(e) =>
                        handleInvoiceItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Aantal"
                      value={item.quantity}
                      onChange={(e) =>
                        handleInvoiceItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Prijs/stuk"
                      value={item.pricePerUnit}
                      onChange={(e) =>
                        handleInvoiceItemChange(
                          index,
                          "pricePerUnit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{item.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveInvoiceItem(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Labor Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">
                    Werkuren (optioneel)
                  </h3>
                  <button
                    onClick={handleAddInvoiceLabor}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    + Werkuren Toevoegen
                  </button>
                </div>

                {newInvoice.labor.map((labor, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Beschrijving werkzaamheden"
                      value={labor.description}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Uren"
                      value={labor.hours}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "hours",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.5"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Uurtarief"
                      value={labor.hourlyRate}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "hourlyRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{labor.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveInvoiceLabor(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {newInvoice.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotaal:</span>
                    <span className="font-semibold">
                      €{calculateInvoiceTotals().subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      BTW ({newInvoice.vatRate}%):
                    </span>
                    <span className="font-semibold">
                      €{calculateInvoiceTotals().vatAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Totaal:</span>
                    <span className="text-primary">
                      €{calculateInvoiceTotals().total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEditedInvoice}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
              >
                ✓ Factuur Bijwerken
              </button>
              <button
                onClick={() => {
                  setShowEditInvoiceModal(false);
                  setEditingInvoiceId(null);
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Selection Modal */}
      {showUserSelectionModal && selectedInvoiceForWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-semibold text-neutral mb-4">
              👤 Medewerker Toewijzen
            </h2>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Je gaat een werkorder aanmaken van deze factuur. Aan welke
                medewerker wil je deze werkorder toewijzen?
              </p>

              {(() => {
                const invoice = invoices.find(
                  (inv) => inv.id === selectedInvoiceForWorkOrder
                );
                if (!invoice) return null;
                const customerName = getCustomerName(invoice.customerId);
                const totalHours =
                  invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) ||
                  0;

                return (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-blue-800">
                        Werkorder Details
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <strong>Klant:</strong> {customerName}
                      </p>
                      <p>
                        <strong>Factuur:</strong> {invoice.invoiceNumber}
                      </p>
                      <p>
                        <strong>Geschatte uren:</strong> {totalHours}u
                      </p>
                      <p>
                        <strong>Waarde:</strong> €{invoice.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecteer Medewerker *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Kies een medewerker --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={completeWorkOrderConversion}
                disabled={!selectedUserId}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  selectedUserId
                    ? "bg-primary text-white hover:bg-secondary"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                ✓ Werkorder Aanmaken
              </button>
              <button
                onClick={() => {
                  setShowUserSelectionModal(false);
                  setSelectedInvoiceForWorkOrder(null);
                  setSelectedUserId("");
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <>
          <div className="flex justify-end mb-6">
            {isAdmin && (
              <button
                onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Taak
              </button>
            )}
          </div>

          {/* Add Task Form */}
          {showAddTaskForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">
                Nieuwe Taak
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Titel *"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newTask.customerId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, customerId: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Geen klant</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value as any })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Laag</option>
                  <option value="medium">Gemiddeld</option>
                  <option value="high">Hoog</option>
                </select>
                <textarea
                  placeholder="Beschrijving"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={3}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddTask}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowAddTaskForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              const isOverdue =
                task.status !== "done" && new Date(task.dueDate) < new Date();

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-lg shadow-md p-6 ${
                    isOverdue ? "border-l-4 border-red-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-neutral text-lg">
                      {task.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority === "high" && "Hoog"}
                      {task.priority === "medium" && "Gemiddeld"}
                      {task.priority === "low" && "Laag"}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {task.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Klant:</span>
                      <span className="font-medium text-neutral">
                        {getCustomerName(task.customerId)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Deadline:</span>
                      <span
                        className={`font-medium ${
                          isOverdue ? "text-red-600" : "text-neutral"
                        }`}
                      >
                        {task.dueDate}
                        {isOverdue && " ⚠️"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getTaskStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status === "todo" && "Te doen"}
                        {task.status === "in_progress" && "Bezig"}
                        {task.status === "done" && "Klaar"}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      {task.status === "todo" && (
                        <button
                          onClick={() =>
                            updateTaskStatus(task.id, "in_progress")
                          }
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Start
                        </button>
                      )}
                      {task.status === "in_progress" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "done")}
                          className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Voltooi
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Verwijder
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen taken gevonden</p>
            </div>
          )}
        </>
      )}

      {/* Email Tab */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral mb-2">
              Email Workflow
            </h2>
            <p className="text-sm text-gray-600">
              Sleep .eml bestanden hierheen om automatisch orders, taken of
              notificaties aan te maken.
            </p>
          </div>

          <EmailDropZone
            onShowEmailPreview={(email) => {
              // Toon universele preview modal voor alle emails
              setPendingEmail(email);
              setShowEmailPreview(true);
            }}
            onCreateTask={(taskData) => {
              const newTask: Task = {
                id: `task_${Date.now()}`,
                title: taskData.title || "Nieuwe taak",
                description: taskData.description || "",
                priority: taskData.priority || "medium",
                status: taskData.status || "todo",
                dueDate:
                  taskData.dueDate || new Date().toISOString().split("T")[0],
                createdDate: new Date().toISOString().split("T")[0],
                customerId: taskData.customerId,
              };
              setTasks([...tasks, newTask]);
              return Promise.resolve(newTask.id);
            }}
            onCreateOrder={async (orderData) => {
              // Deze wordt nu niet meer gebruikt omdat we onShowEmailPreview gebruiken
              return Promise.resolve(undefined);
            }}
            onCreateNotification={(notificationData) => {
              // Deze wordt nu niet meer gebruikt omdat we onShowEmailPreview gebruiken
              return Promise.resolve(`notif_${Date.now()}`);
            }}
            onCreateInteraction={(interactionData) => {
              const interaction: Interaction = {
                id: `int_${Date.now()}`,
                type: interactionData.type || "email",
                subject: interactionData.subject || "",
                description: interactionData.description || "",
                date: interactionData.date || new Date().toISOString(),
                employeeId:
                  interactionData.employeeId || currentUser.employeeId,
                customerId: interactionData.customerId,
                leadId: interactionData.leadId,
              };
              setInteractions([...interactions, interaction]);
              return Promise.resolve(interaction.id);
            }}
            existingTasks={tasks}
            existingQuotes={quotes}
            existingInvoices={invoices}
            existingCustomers={customers}
            existingLeads={leads}
            currentUserId={currentUser.employeeId}
          />
        </div>
      )}

      {/* Universal Email Preview Modal */}
      {showEmailPreview && pendingEmail && (
        <EmailPreviewModal
          isOpen={showEmailPreview}
          onClose={() => {
            setShowEmailPreview(false);
            setPendingEmail(null);
          }}
          email={pendingEmail}
          customers={customers}
          onCreateCustomer={async (email, name) => {
            const newCustomer: Customer = {
              id: `c${Date.now()}`,
              name,
              email,
              phone: "",
              since: new Date().toISOString().split("T")[0],
              source: "email",
            };
            setCustomers([...customers, newCustomer]);
            // Sla mapping op
            saveEmailMapping(email, newCustomer.id);
            return Promise.resolve(newCustomer.id);
          }}
          currentUserId={currentUser.employeeId}
          onConfirmAsOrder={async (quote, customerId) => {
            // Sla email-customer mapping op
            saveEmailMapping(pendingEmail.from, customerId);

            // Update customer met extra email adres indien nodig
            const customer = customers.find((c) => c.id === customerId);
            if (
              customer &&
              customer.email.toLowerCase() !== pendingEmail.from.toLowerCase()
            ) {
              const updatedCustomer: Customer = {
                ...customer,
                emailAddresses: [
                  ...(customer.emailAddresses || []),
                  pendingEmail.from,
                ],
              };
              setCustomers(
                customers.map((c) =>
                  c.id === customerId ? updatedCustomer : c
                )
              );
            }

            // Voeg offerte toe
            setQuotes([...quotes, quote]);
            setShowEmailPreview(false);
            setPendingEmail(null);
          }}
          onConfirmAsTask={(taskData) => {
            const newTask: Task = {
              id: `task_${Date.now()}`,
              title: taskData.title,
              description: taskData.description,
              priority: "medium",
              status: "todo",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              createdDate: new Date().toISOString().split("T")[0],
              customerId: taskData.customerId,
            };
            setTasks([...tasks, newTask]);

            // Sla email-customer mapping op indien klant geselecteerd
            if (taskData.customerId) {
              saveEmailMapping(pendingEmail.from, taskData.customerId);
            }

            setShowEmailPreview(false);
            setPendingEmail(null);
          }}
          onConfirmAsNotification={(notificationData) => {
            // TODO: Implement notification system
            alert(`🔔 Notificatie: ${notificationData.message}`);
            setShowEmailPreview(false);
            setPendingEmail(null);
          }}
          onCreateInteraction={(interactionData) => {
            const interaction: Interaction = {
              id: `int_${Date.now()}`,
              type: (interactionData.type || "email") as InteractionType,
              subject: interactionData.subject || "",
              description: interactionData.description || "",
              date: new Date().toISOString(),
              employeeId: currentUser.employeeId,
              customerId: interactionData.customerId,
            };
            setInteractions([...interactions, interaction]);
          }}
        />
      )}
    </div>
  );
};

export const CRM = React.memo(CRMComponent);

// Old EmailTab code removed - Now using EmailDropZone component
