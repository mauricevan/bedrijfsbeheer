import React, { useState } from 'react';
import { Transaction, Quote, QuoteItem, QuoteLabor, QuoteHistoryEntry, Invoice, InvoiceHistoryEntry, Customer, InventoryItem, WorkOrder, Employee, User } from '../types';

interface AccountingProps {
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
}

export const Accounting: React.FC<AccountingProps> = ({ 
  transactions, 
  quotes, 
  setQuotes,
  invoices,
  setInvoices,
  customers,
  inventory,
  workOrders,
  setWorkOrders,
  employees,
  currentUser,
  isAdmin 
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'quotes' | 'invoices'>('transactions');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  
  // 🆕 Clone states
  const [showCloneQuoteModal, setShowCloneQuoteModal] = useState(false);
  const [showCloneInvoiceModal, setShowCloneInvoiceModal] = useState(false);
  
  // 🆕 Overview Modal States
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [overviewType, setOverviewType] = useState<'all' | 'paid' | 'outstanding' | 'overdue'>('all');
  const [overviewFilter, setOverviewFilter] = useState({
    customerName: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });
  
  // NEW: User selection modal state
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [conversionData, setConversionData] = useState<{
    type: 'quote' | 'invoice';
    sourceId: string;
    data: any;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newQuote, setNewQuote] = useState({
    customerId: '',
    items: [] as QuoteItem[],
    labor: [] as QuoteLabor[],
    vatRate: 21,
    notes: '',
    validUntil: '',
  });
  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    items: [] as QuoteItem[],
    labor: [] as QuoteLabor[],
    vatRate: 21,
    notes: '',
    paymentTerms: '14 dagen',
    issueDate: '',
    dueDate: '',
  });

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netProfit = totalIncome - totalExpense;

  // Invoice statistics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingInvoices = invoices.filter(inv => ['sent', 'overdue'].includes(inv.status));
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Helper function om employee naam op te halen
  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || 'Onbekend';
  };

  // Helper function om history entry aan te maken
  const createHistoryEntry = (
    type: 'quote' | 'invoice',
    action: string,
    details: string,
    extra?: any
  ): QuoteHistoryEntry | InvoiceHistoryEntry => {
    return {
      timestamp: new Date().toISOString(),
      action: action as any,
      performedBy: currentUser.employeeId,
      details,
      ...extra
    };
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Onbekend';
  };

  const getInventoryItemName = (itemId: string) => {
    return inventory.find(i => i.id === itemId)?.name || 'Onbekend item';
  };

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateQuoteTotals = () => {
    const itemsSubtotal = newQuote.items.reduce((sum, item) => sum + item.total, 0);
    const laborSubtotal = newQuote.labor.reduce((sum, labor) => sum + labor.total, 0);
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (newQuote.vatRate / 100);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  const calculateInvoiceTotals = () => {
    const itemsSubtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const laborSubtotal = newInvoice.labor.reduce((sum, labor) => sum + labor.total, 0);
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (newInvoice.vatRate / 100);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .filter(inv => inv.invoiceNumber.startsWith(`${year}-`))
      .map(inv => parseInt(inv.invoiceNumber.split('-')[1]))
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  // Quote CRUD Operations
  const handleAddInventoryItem = () => {
    const newItem: QuoteItem = {
      inventoryItemId: '',
      description: '',
      quantity: 1,
      pricePerUnit: 0,
      total: 0
    };
    setNewQuote({
      ...newQuote,
      items: [...newQuote.items, newItem]
    });
  };

  const handleAddCustomItem = () => {
    const newItem: QuoteItem = {
      description: '',
      quantity: 1,
      pricePerUnit: 0,
      total: 0
    };
    setNewQuote({
      ...newQuote,
      items: [...newQuote.items, newItem]
    });
  };

  const handleAddLabor = () => {
    const newLabor: QuoteLabor = {
      description: '',
      hours: 1,
      hourlyRate: 50,
      total: 50
    };
    setNewQuote({
      ...newQuote,
      labor: [...newQuote.labor, newLabor]
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewQuote({
      ...newQuote,
      items: newQuote.items.filter((_, i) => i !== index)
    });
  };

  const handleRemoveLabor = (index: number) => {
    setNewQuote({
      ...newQuote,
      labor: newQuote.labor.filter((_, i) => i !== index)
    });
  };

  const handleInventoryItemChange = (index: number, inventoryItemId: string) => {
    const inventoryItem = inventory.find(i => i.id === inventoryItemId);
    if (inventoryItem) {
      const updatedItems = [...newQuote.items];
      updatedItems[index] = {
        ...updatedItems[index],
        inventoryItemId: inventoryItemId,
        description: inventoryItem.name,
        pricePerUnit: inventoryItem.price || 0,
        total: updatedItems[index].quantity * (inventoryItem.price || 0)
      };
      setNewQuote({ ...newQuote, items: updatedItems });
    }
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...newQuote.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'pricePerUnit') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].pricePerUnit;
    }
    
    setNewQuote({ ...newQuote, items: updatedItems });
  };

  const handleLaborChange = (index: number, field: keyof QuoteLabor, value: any) => {
    const updatedLabor = [...newQuote.labor];
    updatedLabor[index] = { ...updatedLabor[index], [field]: value };
    
    if (field === 'hours' || field === 'hourlyRate') {
      updatedLabor[index].total = updatedLabor[index].hours * updatedLabor[index].hourlyRate;
    }
    
    setNewQuote({ ...newQuote, labor: updatedLabor });
  };

  const handleCreateQuote = () => {
    if (!newQuote.customerId || newQuote.items.length === 0 || !newQuote.validUntil) {
      alert('Vul alle verplichte velden in (klant, minimaal 1 item, en geldig tot datum)!');
      return;
    }

    const { subtotal, vatAmount, total } = calculateQuoteTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(newQuote.customerId);

    const quote: Quote = {
      id: `Q${Date.now()}`,
      customerId: newQuote.customerId,
      items: newQuote.items,
      labor: newQuote.labor.length > 0 ? newQuote.labor : undefined,
      subtotal: subtotal,
      vatRate: newQuote.vatRate,
      vatAmount: vatAmount,
      total: total,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      validUntil: newQuote.validUntil,
      notes: newQuote.notes,
      
      // Audit trail
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now
      },
      history: [
        createHistoryEntry(
          'quote',
          'created',
          `Offerte aangemaakt door ${getEmployeeName(currentUser.employeeId)} voor klant ${customerName}`
        ) as QuoteHistoryEntry
      ]
    };

    setQuotes([...quotes, quote]);
    setNewQuote({
      customerId: '',
      items: [],
      labor: [],
      vatRate: 21,
      notes: '',
      validUntil: '',
    });
    setShowQuoteForm(false);
    alert(`✅ Offerte ${quote.id} succesvol aangemaakt!`);
  };

  const updateQuoteStatus = (quoteId: string, newStatus: Quote['status']) => {
    setQuotes(quotes.map(q => {
      if (q.id === quoteId) {
        const now = new Date().toISOString();
        const oldStatus = q.status;
        
        const updates: Partial<Quote> = {
          status: newStatus,
          history: [
            ...(q.history || []),
            createHistoryEntry(
              'quote',
              newStatus,
              `Status gewijzigd van "${oldStatus}" naar "${newStatus}" door ${getEmployeeName(currentUser.employeeId)}`,
              { fromStatus: oldStatus, toStatus: newStatus }
            ) as QuoteHistoryEntry
          ]
        };
        
        // Update timestamps
        if (!q.timestamps) {
          updates.timestamps = { created: q.createdDate };
        } else {
          updates.timestamps = { ...q.timestamps };
        }
        
        if (newStatus === 'sent' && !updates.timestamps.sent) {
          updates.timestamps.sent = now;
        } else if (newStatus === 'approved' && !updates.timestamps.approved) {
          updates.timestamps.approved = now;
        }
        
        return { ...q, ...updates };
      }
      return q;
    }));
    
    // Auto-sync to workorder if status changes
    const quote = quotes.find(q => q.id === quoteId);
    if (quote?.workOrderId && newStatus === 'approved') {
      syncQuoteToWorkOrder(quoteId);
    }
  };

  const handleQuoteUpdate = (quote: Quote) => {
    setQuotes(quotes.map(q => q.id === quote.id ? quote : q));
    
    // Sync to workorder if exists
    if (quote.workOrderId) {
      const synced = syncQuoteToWorkOrder(quote.id);
      if (synced) {
        alert('✅ Offerte en werkorder succesvol gesynchroniseerd!');
      }
    }
  };

  const deleteQuote = (quoteId: string) => {
    if (confirm('Weet je zeker dat je deze offerte wilt verwijderen?')) {
      setQuotes(quotes.filter(q => q.id !== quoteId));
    }
  };

  // Convert Quote to Invoice
  const convertQuoteToInvoice = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    if (quote.status !== 'approved') {
      alert('Alleen geaccepteerde offertes kunnen worden omgezet naar facturen!');
      return;
    }

    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const now = new Date().toISOString();

    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: quote.customerId,
      quoteId: quote.id,
      items: quote.items,
      labor: quote.labor,
      subtotal: quote.subtotal,
      vatRate: quote.vatRate,
      vatAmount: quote.vatAmount,
      total: quote.total,
      status: 'draft',
      issueDate: issueDate,
      dueDate: dueDate.toISOString().split('T')[0],
      notes: quote.notes,
      paymentTerms: '14 dagen',
      workOrderId: quote.workOrderId,
      
      // Audit trail
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now
      },
      history: [
        createHistoryEntry(
          'invoice',
          'created',
          `Factuur aangemaakt door ${getEmployeeName(currentUser.employeeId)} vanuit offerte ${quote.id}`
        ) as InvoiceHistoryEntry
      ]
    };

    setInvoices([...invoices, invoice]);
    
    // Update quote met conversie timestamp
    setQuotes(quotes.map(q => {
      if (q.id === quoteId) {
        return {
          ...q,
          timestamps: {
            ...q.timestamps,
            convertedToInvoice: now
          },
          history: [
            ...(q.history || []),
            createHistoryEntry(
              'quote',
              'converted_to_invoice',
              `Geconverteerd naar factuur ${invoice.invoiceNumber} door ${getEmployeeName(currentUser.employeeId)}`
            ) as QuoteHistoryEntry
          ]
        };
      }
      return q;
    }));
    
    alert(`✅ Factuur ${invoice.invoiceNumber} succesvol aangemaakt!`);
    setActiveTab('invoices');
  };

  // NEW: Convert Quote to Work Order
  const convertQuoteToWorkOrder = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    if (quote.status !== 'approved') {
      alert('Alleen geaccepteerde offertes kunnen worden omgezet naar werkorders!');
      return;
    }

    if (quote.workOrderId) {
      alert('Deze offerte heeft al een gekoppelde werkorder!');
      return;
    }

    // Check materiaal voorraad
    for (const item of quote.items) {
      if (item.inventoryItemId) {
        const inventoryItem = inventory.find(i => i.id === item.inventoryItemId);
        if (inventoryItem && inventoryItem.quantity < item.quantity) {
          const confirmCreate = confirm(`Waarschuwing: Niet genoeg voorraad van ${inventoryItem.name}. Beschikbaar: ${inventoryItem.quantity}, Nodig: ${item.quantity}. Toch werkorder aanmaken?`);
          if (!confirmCreate) return;
        }
      }
    }

    const customerName = customers.find(c => c.id === quote.customerId)?.name || 'Onbekend';
    const totalHours = quote.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

    // OPEN USER SELECTION MODAL
    setConversionData({
      type: 'quote',
      sourceId: quoteId,
      data: { customerName, totalHours, quote }
    });
    setSelectedUserId('');
    setShowUserSelectionModal(true);
  };

  // NEW: Convert Invoice to Work Order
  const convertInvoiceToWorkOrder = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    if (invoice.status !== 'sent' && invoice.status !== 'draft') {
      alert('Alleen verzonden of concept facturen kunnen worden omgezet naar werkorders!');
      return;
    }

    if (invoice.workOrderId) {
      alert('Deze factuur heeft al een gekoppelde werkorder!');
      return;
    }

    // Check materiaal voorraad
    for (const item of invoice.items) {
      if (item.inventoryItemId) {
        const inventoryItem = inventory.find(i => i.id === item.inventoryItemId);
        if (inventoryItem && inventoryItem.quantity < item.quantity) {
          const confirmCreate = confirm(`Waarschuwing: Niet genoeg voorraad van ${inventoryItem.name}. Beschikbaar: ${inventoryItem.quantity}, Nodig: ${item.quantity}. Toch werkorder aanmaken?`);
          if (!confirmCreate) return;
        }
      }
    }

    const customerName = customers.find(c => c.id === invoice.customerId)?.name || 'Onbekend';
    const totalHours = invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

    // OPEN USER SELECTION MODAL
    setConversionData({
      type: 'invoice',
      sourceId: invoiceId,
      data: { customerName, totalHours, invoice }
    });
    setSelectedUserId('');
    setShowUserSelectionModal(true);
  };

  // Get WorkOrder status for Quote/Invoice
  const getWorkOrderStatus = (workOrderId?: string) => {
    if (!workOrderId) return null;
    return workOrders.find(wo => wo.id === workOrderId);
  };

  // Get status badge color and text
  const getWorkOrderBadge = (workOrder?: WorkOrder) => {
    if (!workOrder) return null;
    
    switch (workOrder.status) {
      case 'To Do':
        return { color: 'bg-gray-100 text-gray-800 border-gray-500', icon: '🔵', text: 'Werkorder: To Do' };
      case 'Pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-500', icon: '🟡', text: 'Werkorder: In Wacht' };
      case 'In Progress':
        return { color: 'bg-blue-100 text-blue-800 border-blue-500', icon: '🟢', text: 'Werkorder: In Uitvoering' };
      case 'Completed':
        return { color: 'bg-green-100 text-green-800 border-green-500', icon: '✅', text: 'Werkorder: Voltooid' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '❓', text: 'Werkorder: Onbekend' };
    }
  };

  // 🆕 Overview Functions
  const openOverviewModal = (type: 'all' | 'paid' | 'outstanding' | 'overdue') => {
    setOverviewType(type);
    setShowOverviewModal(true);
  };

  const resetFilters = () => {
    setOverviewFilter({
      customerName: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;

    // Filter by type
    switch (overviewType) {
      case 'paid':
        filtered = filtered.filter(inv => inv.status === 'paid');
        break;
      case 'outstanding':
        filtered = filtered.filter(inv => ['sent', 'overdue'].includes(inv.status));
        break;
      case 'overdue':
        filtered = filtered.filter(inv => inv.status === 'overdue');
        break;
      // 'all' doesn't filter
    }

    // Filter by customer name
    if (overviewFilter.customerName) {
      filtered = filtered.filter(inv => {
        const customerName = getCustomerName(inv.customerId).toLowerCase();
        return customerName.includes(overviewFilter.customerName.toLowerCase());
      });
    }

    // Filter by date range
    if (overviewFilter.dateFrom) {
      filtered = filtered.filter(inv => inv.issueDate >= overviewFilter.dateFrom);
    }
    if (overviewFilter.dateTo) {
      filtered = filtered.filter(inv => inv.issueDate <= overviewFilter.dateTo);
    }

    // Filter by amount range
    if (overviewFilter.minAmount) {
      filtered = filtered.filter(inv => inv.total >= parseFloat(overviewFilter.minAmount));
    }
    if (overviewFilter.maxAmount) {
      filtered = filtered.filter(inv => inv.total <= parseFloat(overviewFilter.maxAmount));
    }

    return filtered;
  };

  const getFilteredTotal = () => {
    return getFilteredInvoices().reduce((sum, inv) => sum + inv.total, 0);
  };

  // Complete conversion with selected user
  const completeConversion = () => {
    if (!selectedUserId) {
      alert('Selecteer een medewerker!');
      return;
    }

    if (!conversionData) return;

    if (conversionData.type === 'quote') {
      executeQuoteToWorkOrderConversion(conversionData.sourceId, selectedUserId, conversionData.data);
    } else {
      executeInvoiceToWorkOrderConversion(conversionData.sourceId, selectedUserId, conversionData.data);
    }

    setShowUserSelectionModal(false);
    setConversionData(null);
    setSelectedUserId('');
  };

  // Execute the actual conversion after user is selected - FOR QUOTE
  const executeQuoteToWorkOrderConversion = (quoteId: string, userId: string, data: any) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const now = new Date().toISOString();
    const workOrderId = `wo${Date.now()}`;

    const workOrder: WorkOrder = {
      id: workOrderId,
      title: `${data.customerName} - Offerte ${quote.id}`,
      description: quote.notes || `Werkorder aangemaakt vanuit offerte ${quote.id}`,
      status: 'To Do',
      assignedTo: userId,
      assignedBy: currentUser.employeeId,
      convertedBy: currentUser.employeeId,
      requiredInventory: quote.items
        .filter(item => item.inventoryItemId)
        .map(item => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity
        })),
      createdDate: new Date().toISOString().split('T')[0],
      customerId: quote.customerId,
      location: quote.location,
      scheduledDate: quote.scheduledDate,
      quoteId: quote.id,
      estimatedHours: data.totalHours,
      estimatedCost: quote.total,
      notes: `Geschatte uren: ${data.totalHours}u\nGeschatte kosten: €${quote.total.toFixed(2)}`,
      // NEW TIMESTAMPS
      timestamps: {
        created: now,
        converted: now,
        assigned: now
      },
      // NEW HISTORY
      history: [
        createHistoryEntry('quote', 'created', `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`) as any,
        createHistoryEntry('quote', 'converted', `Geconverteerd van offerte ${quote.id} door ${getEmployeeName(currentUser.employeeId)}`) as any,
        {
          timestamp: now,
          action: 'assigned' as const,
          performedBy: currentUser.employeeId,
          details: `Toegewezen aan ${getEmployeeName(userId)} door ${getEmployeeName(currentUser.employeeId)}`,
          toAssignee: userId
        }
      ]
    };

    setWorkOrders([...workOrders, workOrder]);
    
    // Update quote met workOrderId
    setQuotes(quotes.map(q => {
      if (q.id === quoteId) {
        return {
          ...q,
          workOrderId: workOrder.id,
          timestamps: {
            ...q.timestamps,
            convertedToWorkOrder: now
          },
          history: [
            ...(q.history || []),
            createHistoryEntry(
              'quote',
              'converted_to_workorder',
              `Geconverteerd naar werkorder ${workOrder.id} door ${getEmployeeName(currentUser.employeeId)}`
            ) as QuoteHistoryEntry
          ]
        };
      }
      return q;
    }));

    alert(`✅ Werkorder ${workOrder.id} succesvol aangemaakt en toegewezen aan ${getEmployeeName(userId)}!`);
  };

  // Execute the actual conversion after user is selected - FOR INVOICE
  const executeInvoiceToWorkOrderConversion = (invoiceId: string, userId: string, data: any) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const now = new Date().toISOString();
    const workOrderId = `wo${Date.now()}`;

    const workOrder: WorkOrder = {
      id: workOrderId,
      title: `${data.customerName} - Factuur ${data.invoice.invoiceNumber}`,
      description: data.invoice.notes || `Werkorder aangemaakt vanuit factuur ${data.invoice.invoiceNumber}`,
      status: 'To Do',
      assignedTo: userId,
      assignedBy: currentUser.employeeId,
      convertedBy: currentUser.employeeId,
      requiredInventory: data.invoice.items
        .filter((item: any) => item.inventoryItemId)
        .map((item: any) => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity
        })),
      createdDate: new Date().toISOString().split('T')[0],
      customerId: data.invoice.customerId,
      location: data.invoice.location,
      scheduledDate: data.invoice.scheduledDate,
      invoiceId: invoice.id,
      estimatedHours: data.totalHours,
      estimatedCost: data.invoice.total,
      notes: `Geschatte uren: ${data.totalHours}u\nGeschatte kosten: €${data.invoice.total.toFixed(2)}`,
      // NEW TIMESTAMPS
      timestamps: {
        created: now,
        converted: now,
        assigned: now
      },
      // NEW HISTORY
      history: [
        createHistoryEntry('invoice', 'created', `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`) as any,
        createHistoryEntry('invoice', 'converted', `Geconverteerd van factuur ${data.invoice.invoiceNumber} door ${getEmployeeName(currentUser.employeeId)}`) as any,
        {
          timestamp: now,
          action: 'assigned' as const,
          performedBy: currentUser.employeeId,
          details: `Toegewezen aan ${getEmployeeName(userId)} door ${getEmployeeName(currentUser.employeeId)}`,
          toAssignee: userId
        }
      ]
    };

    setWorkOrders([...workOrders, workOrder]);
    
    // Update invoice met workOrderId
    setInvoices(invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          workOrderId: workOrder.id,
          timestamps: {
            ...inv.timestamps,
            convertedToWorkOrder: now
          },
          history: [
            ...(inv.history || []),
            createHistoryEntry(
              'invoice',
              'converted_to_workorder',
              `Geconverteerd naar werkorder ${workOrder.id} door ${getEmployeeName(currentUser.employeeId)}`
            ) as InvoiceHistoryEntry
          ]
        };
      }
      return inv;
    }));

    alert(`✅ Werkorder ${workOrder.id} succesvol aangemaakt en toegewezen aan ${getEmployeeName(userId)}!`);
  };

  // Sync Quote changes to WorkOrder
  const syncQuoteToWorkOrder = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote || !quote.workOrderId) return;

    const workOrder = workOrders.find(wo => wo.id === quote.workOrderId);
    if (!workOrder) return;

    // Check if workorder is completed
    if (workOrder.status === 'Completed') {
      alert('❌ Deze werkorder is al voltooid. Wijzigingen zijn niet meer mogelijk (behalve notities).');
      return false;
    }

    // Warning if in progress
    if (workOrder.status === 'In Progress') {
      const confirm = window.confirm('⚠️ Deze werkorder is momenteel actief. Weet je zeker dat je wijzigingen wilt doorvoeren? De toegewezen medewerker ontvangt een notificatie.');
      if (!confirm) return false;
    }

    // Update workorder with new data from quote
    const totalHours = quote.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      requiredInventory: quote.items
        .filter(item => item.inventoryItemId)
        .map(item => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity
        })),
      estimatedHours: totalHours,
      estimatedCost: quote.total,
      notes: `${workOrder.notes || ''}\n\n[Update: ${new Date().toLocaleDateString()}] Offerte aangepast - Geschatte uren: ${totalHours}u, Kosten: €${quote.total.toFixed(2)}`
    };

    setWorkOrders(workOrders.map(wo => 
      wo.id === workOrder.id ? updatedWorkOrder : wo
    ));

    return true;
  };

  // Sync Invoice changes to WorkOrder
  const syncInvoiceToWorkOrder = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice || !invoice.workOrderId) return;

    const workOrder = workOrders.find(wo => wo.id === invoice.workOrderId);
    if (!workOrder) return;

    // Check if workorder is completed
    if (workOrder.status === 'Completed') {
      alert('❌ Deze werkorder is al voltooid. Wijzigingen zijn niet meer mogelijk (behalve notities).');
      return false;
    }

    // Warning if in progress
    if (workOrder.status === 'In Progress') {
      const confirm = window.confirm('⚠️ Deze werkorder is momenteel actief. Weet je zeker dat je wijzigingen wilt doorvoeren? De toegewezen medewerker ontvangt een notificatie.');
      if (!confirm) return false;
    }

    // Update workorder with new data from invoice
    const totalHours = invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      requiredInventory: invoice.items
        .filter(item => item.inventoryItemId)
        .map(item => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity
        })),
      estimatedHours: totalHours,
      estimatedCost: invoice.total,
      notes: `${workOrder.notes || ''}\n\n[Update: ${new Date().toLocaleDateString()}] Factuur aangepast - Geschatte uren: ${totalHours}u, Kosten: €${invoice.total.toFixed(2)}`
    };

    setWorkOrders(workOrders.map(wo => 
      wo.id === workOrder.id ? updatedWorkOrder : wo
    ));

    return true;
  };

  // Invoice CRUD Operations
  const handleAddInvoiceInventoryItem = () => {
    const newItem: QuoteItem = {
      inventoryItemId: '',
      description: '',
      quantity: 1,
      pricePerUnit: 0,
      total: 0
    };
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, newItem]
    });
  };

  const handleAddInvoiceCustomItem = () => {
    const newItem: QuoteItem = {
      description: '',
      quantity: 1,
      pricePerUnit: 0,
      total: 0
    };
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, newItem]
    });
  };

  const handleAddInvoiceLabor = () => {
    const newLabor: QuoteLabor = {
      description: '',
      hours: 1,
      hourlyRate: 50,
      total: 50
    };
    setNewInvoice({
      ...newInvoice,
      labor: [...newInvoice.labor, newLabor]
    });
  };

  const handleRemoveInvoiceItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index)
    });
  };

  const handleRemoveInvoiceLabor = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      labor: newInvoice.labor.filter((_, i) => i !== index)
    });
  };

  const handleInvoiceInventoryItemChange = (index: number, inventoryItemId: string) => {
    const inventoryItem = inventory.find(i => i.id === inventoryItemId);
    if (inventoryItem) {
      const updatedItems = [...newInvoice.items];
      updatedItems[index] = {
        ...updatedItems[index],
        inventoryItemId: inventoryItemId,
        description: inventoryItem.name,
        pricePerUnit: inventoryItem.price || 0,
        total: updatedItems[index].quantity * (inventoryItem.price || 0)
      };
      setNewInvoice({ ...newInvoice, items: updatedItems });
    }
  };

  const handleInvoiceItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'pricePerUnit') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].pricePerUnit;
    }
    
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const handleInvoiceLaborChange = (index: number, field: keyof QuoteLabor, value: any) => {
    const updatedLabor = [...newInvoice.labor];
    updatedLabor[index] = { ...updatedLabor[index], [field]: value };
    
    if (field === 'hours' || field === 'hourlyRate') {
      updatedLabor[index].total = updatedLabor[index].hours * updatedLabor[index].hourlyRate;
    }
    
    setNewInvoice({ ...newInvoice, labor: updatedLabor });
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.customerId || newInvoice.items.length === 0 || !newInvoice.issueDate || !newInvoice.dueDate) {
      alert('Vul alle verplichte velden in!');
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
      status: 'draft',
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms,
      
      // Audit trail
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now
      },
      history: [
        createHistoryEntry(
          'invoice',
          'created',
          `Factuur aangemaakt door ${getEmployeeName(currentUser.employeeId)} voor klant ${customerName}`
        ) as InvoiceHistoryEntry
      ]
    };

    setInvoices([...invoices, invoice]);
    setNewInvoice({
      customerId: '',
      items: [],
      labor: [],
      vatRate: 21,
      notes: '',
      paymentTerms: '14 dagen',
      issueDate: '',
      dueDate: '',
    });
    setShowInvoiceForm(false);
    alert(`✅ Factuur ${invoice.invoiceNumber} succesvol aangemaakt!`);
  };

  const updateInvoiceStatus = (invoiceId: string, newStatus: Invoice['status']) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === invoiceId) {
        const now = new Date().toISOString();
        const oldStatus = inv.status;
        
        const updates: Partial<Invoice> = {
          status: newStatus,
          history: [
            ...(inv.history || []),
            createHistoryEntry(
              'invoice',
              newStatus,
              `Status gewijzigd van "${oldStatus}" naar "${newStatus}" door ${getEmployeeName(currentUser.employeeId)}`,
              { fromStatus: oldStatus, toStatus: newStatus }
            ) as InvoiceHistoryEntry
          ]
        };
        
        // Update timestamps
        if (!inv.timestamps) {
          updates.timestamps = { created: inv.issueDate };
        } else {
          updates.timestamps = { ...inv.timestamps };
        }
        
        if (newStatus === 'sent' && !updates.timestamps.sent) {
          updates.timestamps.sent = now;
        } else if (newStatus === 'paid') {
          updates.paidDate = new Date().toISOString().split('T')[0];
          updates.timestamps.paid = now;
        }
        
        return { ...inv, ...updates };
      }
      return inv;
    }));
  };

  const handleInvoiceUpdate = (invoice: Invoice) => {
    setInvoices(invoices.map(inv => inv.id === invoice.id ? invoice : inv));
    
    // Sync to workorder if exists
    if (invoice.workOrderId) {
      const synced = syncInvoiceToWorkOrder(invoice.id);
      if (synced) {
        alert('✅ Factuur en werkorder succesvol gesynchroniseerd!');
      }
    }
  };

  const deleteInvoice = (invoiceId: string) => {
    if (confirm('Weet je zeker dat je deze factuur wilt verwijderen?')) {
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
    }
  };

  // 🆕 CLONE QUOTE FUNCTION
  const handleCloneQuote = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    // Prepare clone data with new ID and reset fields
    setNewQuote({
      customerId: quote.customerId,
      items: quote.items,
      labor: quote.labor || [],
      vatRate: quote.vatRate,
      notes: quote.notes || '',
      validUntil: '', // User should set new date
    });
    setShowCloneQuoteModal(true);
  };

  const handleSaveClonedQuote = () => {
    if (!newQuote.customerId || newQuote.items.length === 0 || !newQuote.validUntil) {
      alert('Vul alle verplichte velden in (klant, minimaal 1 item, en geldig tot datum)!');
      return;
    }

    const { subtotal, vatAmount, total } = calculateQuoteTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(newQuote.customerId);

    const quote: Quote = {
      id: `Q${Date.now()}`,
      customerId: newQuote.customerId,
      items: newQuote.items,
      labor: newQuote.labor.length > 0 ? newQuote.labor : undefined,
      subtotal: subtotal,
      vatRate: newQuote.vatRate,
      vatAmount: vatAmount,
      total: total,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      validUntil: newQuote.validUntil,
      notes: newQuote.notes,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now
      },
      history: [
        createHistoryEntry(
          'quote',
          'created',
          `Offerte gecloneerd door ${getEmployeeName(currentUser.employeeId)} voor klant ${customerName}`
        ) as QuoteHistoryEntry
      ]
    };

    setQuotes([...quotes, quote]);
    setNewQuote({
      customerId: '',
      items: [],
      labor: [],
      vatRate: 21,
      notes: '',
      validUntil: '',
    });
    setShowCloneQuoteModal(false);
    alert(`✅ Offerte ${quote.id} succesvol gecloneerd!`);

    // Scroll to the new quote
    setTimeout(() => {
      const element = document.getElementById(quote.id);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // 🆕 CLONE INVOICE FUNCTION
  const handleCloneInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // +14 days

    // Prepare clone data with new invoice number and reset fields
    setNewInvoice({
      customerId: invoice.customerId,
      items: invoice.items,
      labor: invoice.labor || [],
      vatRate: invoice.vatRate,
      notes: invoice.notes || '',
      paymentTerms: invoice.paymentTerms,
      issueDate: today,
      dueDate: dueDate.toISOString().split('T')[0],
    });
    setShowCloneInvoiceModal(true);
  };

  const handleSaveClonedInvoice = () => {
    if (!newInvoice.customerId || newInvoice.items.length === 0 || !newInvoice.issueDate || !newInvoice.dueDate) {
      alert('Vul alle verplichte velden in!');
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
      status: 'draft',
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now
      },
      history: [
        createHistoryEntry(
          'invoice',
          'created',
          `Factuur gecloneerd door ${getEmployeeName(currentUser.employeeId)} voor klant ${customerName}`
        ) as InvoiceHistoryEntry
      ]
    };

    setInvoices([...invoices, invoice]);
    setNewInvoice({
      customerId: '',
      items: [],
      labor: [],
      vatRate: 21,
      notes: '',
      paymentTerms: '14 dagen',
      issueDate: '',
      dueDate: '',
    });
    setShowCloneInvoiceModal(false);
    alert(`✅ Factuur ${invoice.invoiceNumber} succesvol gecloneerd!`);

    // Scroll to the new invoice
    setTimeout(() => {
      const element = document.getElementById(invoice.id);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-neutral mb-2">Boekhouding, Offertes & Facturen</h1>
      <p className="text-gray-600 mb-8">Genereer offertes, facturen en beheer financiële gegevens</p>

      {/* 🆕 Overview Modal with Filters */}
      {showOverviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-neutral flex items-center gap-3">
                  {overviewType === 'all' && '📊 Totaal Gefactureerd'}
                  {overviewType === 'paid' && '✅ Betaalde Facturen'}
                  {overviewType === 'outstanding' && '⏳ Uitstaande Facturen'}
                  {overviewType === 'overdue' && '⚠️ Verlopen Facturen'}
                </h2>
                <button
                  onClick={() => {
                    setShowOverviewModal(false);
                    resetFilters();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  🔍 Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klantnaam
                    </label>
                    <input
                      type="text"
                      value={overviewFilter.customerName}
                      onChange={(e) => setOverviewFilter({ ...overviewFilter, customerName: e.target.value })}
                      placeholder="Zoek op klantnaam..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum vanaf
                    </label>
                    <input
                      type="date"
                      value={overviewFilter.dateFrom}
                      onChange={(e) => setOverviewFilter({ ...overviewFilter, dateFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum tot
                    </label>
                    <input
                      type="date"
                      value={overviewFilter.dateTo}
                      onChange={(e) => setOverviewFilter({ ...overviewFilter, dateTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min. Bedrag (€)
                    </label>
                    <input
                      type="number"
                      value={overviewFilter.minAmount}
                      onChange={(e) => setOverviewFilter({ ...overviewFilter, minAmount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max. Bedrag (€)
                    </label>
                    <input
                      type="number"
                      value={overviewFilter.maxAmount}
                      onChange={(e) => setOverviewFilter({ ...overviewFilter, maxAmount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    >
                      🔄 Reset Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Totaal */}
              <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Totaal Gefilterd:</span>
                  <span className="text-3xl font-bold text-blue-600">€{getFilteredTotal().toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getFilteredInvoices().length} facturen gevonden
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {getFilteredInvoices().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">🔍 Geen facturen gevonden met deze filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredInvoices().map(invoice => {
                    const workOrder = getWorkOrderStatus(invoice.workOrderId);
                    const badge = getWorkOrderBadge(workOrder);
                    
                    return (
                      <div
                        key={invoice.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🧾</span>
                            <div>
                              <p className="font-semibold text-lg text-gray-800">
                                {invoice.invoiceNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                {getCustomerName(invoice.customerId)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              €{invoice.total.toFixed(2)}
                            </p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getInvoiceStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mt-3">
                          <div>
                            <span className="font-semibold">Factuurdatum:</span>
                            <p>{invoice.issueDate}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Vervaldatum:</span>
                            <p>{invoice.dueDate}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Betalingstermijn:</span>
                            <p>{invoice.paymentTerms}</p>
                          </div>
                          {invoice.paidDate && (
                            <div>
                              <span className="font-semibold">Betaald op:</span>
                              <p>{invoice.paidDate}</p>
                            </div>
                          )}
                        </div>

                        {badge && (
                          <div className="mt-3">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border-2 ${badge.color}`}>
                              {badge.icon} {badge.text}
                            </span>
                          </div>
                        )}

                        {invoice.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            <strong>Notities:</strong> {invoice.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowOverviewModal(false);
                  resetFilters();
                }}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
              >
                ✓ Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Selection Modal */}
      {showUserSelectionModal && conversionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-semibold text-neutral mb-4">
              👤 Medewerker Toewijzen
            </h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Je gaat een werkorder aanmaken van deze {conversionData.type === 'quote' ? 'offerte' : 'factuur'}. 
                Aan welke medewerker wil je deze werkorder toewijzen?
              </p>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-blue-800">Werkorder Details</span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Klant:</strong> {conversionData.data.customerName}</p>
                  <p><strong>Geschatte uren:</strong> {conversionData.data.totalHours}u</p>
                  <p><strong>Waarde:</strong> €{conversionData.type === 'quote' ? conversionData.data.quote.total.toFixed(2) : conversionData.data.invoice.total.toFixed(2)}</p>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecteer Medewerker *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Kies een medewerker --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={completeConversion}
                disabled={!selectedUserId}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  selectedUserId
                    ? 'bg-primary text-white hover:bg-secondary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ✓ Werkorder Aanmaken
              </button>
              <button
                onClick={() => {
                  setShowUserSelectionModal(false);
                  setConversionData(null);
                  setSelectedUserId('');
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 CLONE QUOTE MODAL */}
      {showCloneQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral">
                📋 Offerte Clonen
              </h2>
              <button
                onClick={() => setShowCloneQuoteModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Alle velden zijn aanpasbaar. Het nieuwe offerte krijgt automatisch een uniek Q-nummer en de datum wordt op vandaag gezet.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klant *
                </label>
                <select
                  value={newQuote.customerId}
                  onChange={(e) => setNewQuote({ ...newQuote, customerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BTW Tarief (%)
                  </label>
                  <input
                    type="number"
                    value={newQuote.vatRate}
                    onChange={(e) => setNewQuote({ ...newQuote, vatRate: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Geldig Tot *
                  </label>
                  <input
                    type="date"
                    value={newQuote.validUntil}
                    onChange={(e) => setNewQuote({ ...newQuote, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notities
                </label>
                <textarea
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Extra opmerkingen..."
                />
              </div>

              {newQuote.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotaal:</span>
                    <span className="font-semibold">€{calculateQuoteTotals().subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BTW ({newQuote.vatRate}%):</span>
                    <span className="font-semibold">€{calculateQuoteTotals().vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Totaal:</span>
                    <span className="text-primary">€{calculateQuoteTotals().total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveClonedQuote}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                ✓ Gecloneerde Offerte Opslaan
              </button>
              <button
                onClick={() => setShowCloneQuoteModal(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 CLONE INVOICE MODAL */}
      {showCloneInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8">
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
                💡 <strong>Tip:</strong> De nieuwe factuur krijgt automatisch een nieuw factuurnummer en de datum wordt op vandaag gezet.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klant *
                </label>
                <select
                  value={newInvoice.customerId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, customerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
                    onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
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
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
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
                    onChange={(e) => setNewInvoice({ ...newInvoice, vatRate: Number(e.target.value) })}
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
                    onChange={(e) => setNewInvoice({ ...newInvoice, paymentTerms: e.target.value })}
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
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Extra opmerkingen..."
                />
              </div>

              {newInvoice.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotaal:</span>
                    <span className="font-semibold">€{calculateInvoiceTotals().subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BTW ({newInvoice.vatRate}%):</span>
                    <span className="font-semibold">€{calculateInvoiceTotals().vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Totaal:</span>
                    <span className="text-primary">€{calculateInvoiceTotals().total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveClonedInvoice}
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
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          💰 Transacties
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'quotes'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📋 Offertes
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'invoices'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🧾 Facturen
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totale Inkomsten</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">€{totalIncome.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totale Uitgaven</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">€{totalExpense.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Netto Winst</p>
                  <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{netProfit.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Inkomsten
            </button>
            <button
              onClick={() => setFilter('expense')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Uitgaven
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Beschrijving</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Bedrag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral">{transaction.description}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Inkomst' : 'Uitgave'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}€{Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Quotes Tab - Existing content continues here... */}
      {activeTab === 'quotes' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Totaal: {quotes.length} offertes
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowQuoteForm(!showQuoteForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Offerte
              </button>
            )}
          </div>

          {/* Add Quote Form - Existing form code here... */}
          {showQuoteForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">Nieuwe Offerte</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select
                  value={newQuote.customerId}
                  onChange={(e) => setNewQuote({ ...newQuote, customerId: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant *</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newQuote.validUntil}
                  onChange={(e) => setNewQuote({ ...newQuote, validUntil: e.target.value })}
                  placeholder="Geldig tot *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">BTW:</label>
                  <input
                    type="number"
                    value={newQuote.vatRate}
                    onChange={(e) => setNewQuote({ ...newQuote, vatRate: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    step="0.1"
                  />
                  <span className="text-gray-600">%</span>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">Items</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddInventoryItem}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      + Uit Voorraad
                    </button>
                    <button
                      onClick={handleAddCustomItem}
                      className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                    >
                      + Custom Item
                    </button>
                  </div>
                </div>
                
                {newQuote.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                    {item.inventoryItemId !== undefined ? (
                      <select
                        value={item.inventoryItemId}
                        onChange={(e) => handleInventoryItemChange(index, e.target.value)}
                        className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Selecteer voorraad item</option>
                        {inventory.filter(i => i.price && i.price > 0).map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.sku}) - €{i.price?.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Beschrijving"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="Aantal"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Prijs/stuk"
                      value={item.pricePerUnit}
                      onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                      disabled={!!item.inventoryItemId}
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{item.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Labor Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">Werkuren (optioneel)</h3>
                  <button
                    onClick={handleAddLabor}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    + Werkuren Toevoegen
                  </button>
                </div>
                
                {newQuote.labor.map((labor, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Beschrijving werkzaamheden"
                      value={labor.description}
                      onChange={(e) => handleLaborChange(index, 'description', e.target.value)}
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Uren"
                      value={labor.hours}
                      onChange={(e) => handleLaborChange(index, 'hours', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.5"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Uurtarief"
                      value={labor.hourlyRate}
                      onChange={(e) => handleLaborChange(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{labor.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveLabor(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <textarea
                placeholder="Notities (optioneel)"
                value={newQuote.notes}
                onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />

              {/* Totals Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotaal (excl. BTW):</span>
                  <span className="font-semibold">€{calculateQuoteTotals().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>BTW ({newQuote.vatRate}%):</span>
                  <span className="font-semibold">€{calculateQuoteTotals().vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary border-t pt-2">
                  <span>Totaal (incl. BTW):</span>
                  <span>€{calculateQuoteTotals().total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateQuote}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Offerte Aanmaken
                </button>
                <button
                  onClick={() => {
                    setShowQuoteForm(false);
                    setNewQuote({
                      customerId: '',
                      items: [],
                      labor: [],
                      vatRate: 21,
                      notes: '',
                      validUntil: '',
                    });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Quotes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quotes.map(quote => {
              const workOrder = getWorkOrderStatus(quote.workOrderId);
              const workOrderBadge = getWorkOrderBadge(workOrder);
              const isCompleted = workOrder?.status === 'Completed';
              
              return (
              <div key={quote.id} className={`bg-white rounded-lg shadow-md p-6 ${
                isCompleted ? 'border-l-4 border-green-500' : ''
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-neutral">{quote.id}</h3>
                    <p className="text-sm text-gray-600">{getCustomerName(quote.customerId)}</p>
                    {workOrderBadge && (
                      <button
                        onClick={() => {
                          // Navigate to work orders - we'll implement this via route
                          alert(`Werkorder ID: ${quote.workOrderId}`);
                        }}
                        className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                          workOrderBadge.color
                        } hover:opacity-80 transition-opacity cursor-pointer`}
                        title="Klik om naar werkorder te gaan"
                      >
                        {workOrderBadge.icon} {workOrderBadge.text}
                      </button>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getQuoteStatusColor(quote.status)}`}>
                    {quote.status === 'draft' && 'Concept'}
                    {quote.status === 'sent' && 'Verzonden'}
                    {quote.status === 'approved' && 'Geaccepteerd'}
                    {quote.status === 'rejected' && 'Afgewezen'}
                    {quote.status === 'expired' && 'Verlopen'}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Items:</h4>
                  {quote.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.inventoryItemId ? getInventoryItemName(item.inventoryItemId) : item.description} 
                        <span className="text-gray-500"> (×{item.quantity})</span>
                      </span>
                      <span className="font-medium">€{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Labor */}
                {quote.labor && quote.labor.length > 0 && (
                  <div className="space-y-2 mb-3 border-t pt-3">
                    <h4 className="text-sm font-semibold text-gray-700">Werkuren:</h4>
                    {quote.labor.map((labor, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {labor.description} 
                          <span className="text-gray-500"> ({labor.hours}u @ €{labor.hourlyRate}/u)</span>
                        </span>
                        <span className="font-medium">€{labor.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="border-t pt-3 mb-4 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotaal (excl. BTW):</span>
                    <span>€{quote.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>BTW ({quote.vatRate}%):</span>
                    <span>€{quote.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold text-neutral">Totaal (incl. BTW):</span>
                    <span className="text-xl font-bold text-primary">€{quote.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Aangemaakt: {quote.createdDate}</span>
                  <span>Geldig tot: {quote.validUntil}</span>
                </div>

                {quote.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="text-sm text-gray-700">{quote.notes}</p>
                  </div>
                )}

                {/* Work Order Status Info for Completed */}
                {isCompleted && workOrder && (
                  <div className="p-3 bg-green-50 rounded-lg mb-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-green-700">Werkorder Voltooid</span>
                    </div>
                    {workOrder.hoursSpent !== undefined && workOrder.estimatedHours && (
                      <p className="text-xs text-gray-700">
                        ⏱️ Gewerkt: {workOrder.hoursSpent}u (Geschat: {workOrder.estimatedHours}u)
                        {workOrder.hoursSpent !== workOrder.estimatedHours && (
                          <span className={`ml-2 font-semibold ${
                            workOrder.hoursSpent <= workOrder.estimatedHours * 1.1 ? 'text-green-600' :
                            workOrder.hoursSpent <= workOrder.estimatedHours * 1.25 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            ({Math.round((workOrder.hoursSpent / workOrder.estimatedHours) * 100)}%)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Editable notification for active workorders */}
                {quote.workOrderId && workOrder && workOrder.status !== 'Completed' && isAdmin && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-blue-800">
                          ✏️ Deze offerte is gekoppeld aan een actieve werkorder. Wijzigingen worden automatisch gesynchroniseerd.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-2 flex-wrap">
                    {quote.status === 'draft' && (
                      <button
                        onClick={() => updateQuoteStatus(quote.id, 'sent')}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Verzenden
                      </button>
                    )}
                    {quote.status === 'sent' && (
                      <>
                        <button
                          onClick={() => updateQuoteStatus(quote.id, 'approved')}
                          className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Accepteren
                        </button>
                        <button
                          onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                          className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Afwijzen
                        </button>
                      </>
                    )}
                    {quote.status === 'approved' && !quote.workOrderId && (
                      <button
                        onClick={() => convertQuoteToWorkOrder(quote.id)}
                        className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 font-semibold"
                      >
                        📋 Maak Werkorder
                      </button>
                    )}
                    {quote.status === 'approved' && (
                      <button
                        onClick={() => convertQuoteToInvoice(quote.id)}
                        className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 font-semibold"
                      >
                        🧾 Omzetten naar Factuur
                      </button>
                    )}
                    <button
                      onClick={() => handleCloneQuote(quote.id)}
                      className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 font-semibold"
                      title="Offerte clonen"
                    >
                      📋 Clonen
                    </button>
                    <button
                      onClick={() => deleteQuote(quote.id)}
                      className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Verwijder
                    </button>
                  </div>
                )}
              </div>
            );})}
          </div>

          {quotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen offertes gevonden</p>
            </div>
          )}
        </>
      )}

      {/* NEW: Invoices Tab */}
      {activeTab === 'invoices' && (
        <>
          {/* Invoice Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => openOverviewModal('all')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totaal Gefactureerd</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">€{totalInvoiced.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🧾</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => openOverviewModal('paid')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Betaald</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">€{totalPaid.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{paidInvoices.length} facturen</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => openOverviewModal('outstanding')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uitstaand</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">€{totalOutstanding.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{outstandingInvoices.length} facturen</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => openOverviewModal('overdue')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verlopen</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">€{totalOverdue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{overdueInvoices.length} facturen</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Totaal: {invoices.length} facturen
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Factuur
              </button>
            )}
          </div>

          {/* Add Invoice Form - Similar to Quote form */}
          {showInvoiceForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">Nieuwe Factuur</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <select
                  value={newInvoice.customerId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, customerId: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant *</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newInvoice.issueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                  placeholder="Factuurdatum *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  placeholder="Vervaldatum *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Betalingstermijn"
                  value={newInvoice.paymentTerms}
                  onChange={(e) => setNewInvoice({ ...newInvoice, paymentTerms: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Items Section - Same as Quote */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">Items</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddInvoiceInventoryItem}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      + Uit Voorraad
                    </button>
                    <button
                      onClick={handleAddInvoiceCustomItem}
                      className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                    >
                      + Custom Item
                    </button>
                  </div>
                </div>
                
                {newInvoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                    {item.inventoryItemId !== undefined ? (
                      <select
                        value={item.inventoryItemId}
                        onChange={(e) => handleInvoiceInventoryItemChange(index, e.target.value)}
                        className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Selecteer voorraad item</option>
                        {inventory.filter(i => i.price && i.price > 0).map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.sku}) - €{i.price?.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Beschrijving"
                        value={item.description}
                        onChange={(e) => handleInvoiceItemChange(index, 'description', e.target.value)}
                        className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="Aantal"
                      value={item.quantity}
                      onChange={(e) => handleInvoiceItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Prijs/stuk"
                      value={item.pricePerUnit}
                      onChange={(e) => handleInvoiceItemChange(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                      disabled={!!item.inventoryItemId}
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
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">Werkuren (optioneel)</h3>
                  <button
                    onClick={handleAddInvoiceLabor}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    + Werkuren Toevoegen
                  </button>
                </div>
                
                {newInvoice.labor.map((labor, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Beschrijving werkzaamheden"
                      value={labor.description}
                      onChange={(e) => handleInvoiceLaborChange(index, 'description', e.target.value)}
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Uren"
                      value={labor.hours}
                      onChange={(e) => handleInvoiceLaborChange(index, 'hours', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.5"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Uurtarief"
                      value={labor.hourlyRate}
                      onChange={(e) => handleInvoiceLaborChange(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
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

              <textarea
                placeholder="Notities (optioneel)"
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />

              {/* Totals Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotaal (excl. BTW):</span>
                  <span className="font-semibold">€{calculateInvoiceTotals().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>BTW ({newInvoice.vatRate}%):</span>
                  <span className="font-semibold">€{calculateInvoiceTotals().vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary border-t pt-2">
                  <span>Totaal (incl. BTW):</span>
                  <span>€{calculateInvoiceTotals().total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateInvoice}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  Factuur Aanmaken
                </button>
                <button
                  onClick={() => {
                    setShowInvoiceForm(false);
                    setNewInvoice({
                      customerId: '',
                      items: [],
                      labor: [],
                      vatRate: 21,
                      notes: '',
                      paymentTerms: '14 dagen',
                      issueDate: '',
                      dueDate: '',
                    });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Invoices Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {invoices.map(invoice => {
              const workOrder = getWorkOrderStatus(invoice.workOrderId);
              const workOrderBadge = getWorkOrderBadge(workOrder);
              const isCompleted = workOrder?.status === 'Completed';
              const hasOverdue = invoice.status === 'overdue';
              
              return (
              <div key={invoice.id} className={`bg-white rounded-lg shadow-md p-6 ${
                hasOverdue ? 'border-l-4 border-red-500' : isCompleted ? 'border-l-4 border-green-500' : ''
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-neutral">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600">{getCustomerName(invoice.customerId)}</p>
                    {invoice.quoteId && (
                      <p className="text-xs text-blue-600 mt-1">Van offerte: {invoice.quoteId}</p>
                    )}
                    {workOrderBadge && (
                      <button
                        onClick={() => {
                          alert(`Werkorder ID: ${invoice.workOrderId}`);
                        }}
                        className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                          workOrderBadge.color
                        } hover:opacity-80 transition-opacity cursor-pointer`}
                        title="Klik om naar werkorder te gaan"
                      >
                        {workOrderBadge.icon} {workOrderBadge.text}
                      </button>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getInvoiceStatusColor(invoice.status)}`}>
                    {invoice.status === 'draft' && 'Concept'}
                    {invoice.status === 'sent' && 'Verzonden'}
                    {invoice.status === 'paid' && 'Betaald'}
                    {invoice.status === 'overdue' && 'Verlopen'}
                    {invoice.status === 'cancelled' && 'Geannuleerd'}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Items:</h4>
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.inventoryItemId ? getInventoryItemName(item.inventoryItemId) : item.description} 
                        <span className="text-gray-500"> (×{item.quantity})</span>
                      </span>
                      <span className="font-medium">€{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Labor */}
                {invoice.labor && invoice.labor.length > 0 && (
                  <div className="space-y-2 mb-3 border-t pt-3">
                    <h4 className="text-sm font-semibold text-gray-700">Werkuren:</h4>
                    {invoice.labor.map((labor, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {labor.description} 
                          <span className="text-gray-500"> ({labor.hours}u @ €{labor.hourlyRate}/u)</span>
                        </span>
                        <span className="font-medium">€{labor.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="border-t pt-3 mb-4 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotaal (excl. BTW):</span>
                    <span>€{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>BTW ({invoice.vatRate}%):</span>
                    <span>€{invoice.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold text-neutral">Totaal (incl. BTW):</span>
                    <span className="text-xl font-bold text-primary">€{invoice.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Factuurdatum: {invoice.issueDate}</span>
                  <span>Vervaldatum: {invoice.dueDate}</span>
                </div>

                {invoice.paidDate && (
                  <div className="p-3 bg-green-50 rounded-lg mb-4">
                    <p className="text-sm text-green-700 font-medium">✓ Betaald op: {invoice.paidDate}</p>
                  </div>
                )}

                {invoice.paymentTerms && (
                  <div className="text-xs text-gray-500 mb-4">
                    Betalingstermijn: {invoice.paymentTerms}
                  </div>
                )}

                {invoice.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="text-sm text-gray-700">{invoice.notes}</p>
                  </div>
                )}

                {/* Work Order Status Info for Completed */}
                {isCompleted && workOrder && (
                  <div className="p-3 bg-green-50 rounded-lg mb-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-green-700">Werkorder Voltooid</span>
                    </div>
                    {workOrder.hoursSpent !== undefined && workOrder.estimatedHours && (
                      <p className="text-xs text-gray-700">
                        ⏱️ Gewerkt: {workOrder.hoursSpent}u (Geschat: {workOrder.estimatedHours}u)
                        {workOrder.hoursSpent !== workOrder.estimatedHours && (
                          <span className={`ml-2 font-semibold ${
                            workOrder.hoursSpent <= workOrder.estimatedHours * 1.1 ? 'text-green-600' :
                            workOrder.hoursSpent <= workOrder.estimatedHours * 1.25 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            ({Math.round((workOrder.hoursSpent / workOrder.estimatedHours) * 100)}%)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Editable notification for active workorders */}
                {invoice.workOrderId && workOrder && workOrder.status !== 'Completed' && isAdmin && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-blue-800">
                          ✏️ Deze factuur is gekoppeld aan een actieve werkorder. Wijzigingen worden automatisch gesynchroniseerd.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-2 flex-wrap">
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Verzenden
                      </button>
                    )}
                    {(invoice.status === 'sent' || invoice.status === 'draft') && !invoice.workOrderId && (
                      <button
                        onClick={() => convertInvoiceToWorkOrder(invoice.id)}
                        className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 font-semibold"
                      >
                        📋 Maak Werkorder
                      </button>
                    )}
                    {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                      <button
                        onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        ✓ Markeer als Betaald
                      </button>
                    )}
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                      <button
                        onClick={() => updateInvoiceStatus(invoice.id, 'cancelled')}
                        className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        Annuleren
                      </button>
                    )}
                    <button
                      onClick={() => handleCloneInvoice(invoice.id)}
                      className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 font-semibold"
                      title="Factuur clonen"
                    >
                      📋 Clonen
                    </button>
                    <button
                      onClick={() => deleteInvoice(invoice.id)}
                      className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Verwijder
                    </button>
                  </div>
                )}
              </div>
            );})}
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen facturen gevonden</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
