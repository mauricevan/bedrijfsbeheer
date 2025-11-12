import React, { useState } from 'react';
import { InventoryItem, Sale, WorkOrder, WorkOrderStatus, Notification, Customer, Employee, Quote } from '../types';
import { EmailDropZone } from '../components/EmailDropZone';
import { ParsedEmail } from '../utils/emlParser';
import { 
  getCustomerByEmail, 
  saveEmailCustomerMapping, 
  updateEmailCustomerMapping 
} from '../utils/emailCustomerMapping';
import { WorkOrderAssignmentModal, WorkOrderAssignmentData } from '../components/common/modals';
import EmailWorkOrderEditModal, { EmailWorkOrderData } from '../components/common/modals/EmailWorkOrderEditModal';

interface DashboardProps {
  inventory: InventoryItem[];
  sales: Sale[];
  workOrders: WorkOrder[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  customers: Customer[];
  onNavigateToAccounting?: () => void;
  // FASE 2B: Dashboard Workflow Props
  employees: Employee[];
  onWorkOrderCreated: (workOrder: WorkOrder) => void;
  onQuoteCreated: (quote: Quote) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  inventory, 
  sales, 
  workOrders,
  notifications,
  setNotifications,
  customers,
  onNavigateToAccounting,
  // FASE 2B: Dashboard Workflow Props
  employees,
  onWorkOrderCreated,
  onQuoteCreated
}) => {
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<ParsedEmail | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [autoMatchedCustomer, setAutoMatchedCustomer] = useState<Customer | null>(null);
  const [rememberMapping, setRememberMapping] = useState(false);
  
  // FASE 2B: Dashboard Workflow State
  const [showWorkflowOptions, setShowWorkflowOptions] = useState(false);
  const [showWOAssignmentModal, setShowWOAssignmentModal] = useState(false);
  const [showEmailEditModal, setShowEmailEditModal] = useState(false);
  const [pendingQuoteData, setPendingQuoteData] = useState<any>(null);
  const [createWorkOrderWithQuote, setCreateWorkOrderWithQuote] = useState(false);
  const [editedWorkOrderData, setEditedWorkOrderData] = useState<EmailWorkOrderData | null>(null);
  
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const pendingOrders = workOrders.filter(wo => wo.status === 'Pending').length;
  const inProgressOrders = workOrders.filter(wo => wo.status === 'In Progress').length;

  const unreadNotifications = notifications.filter(n => !n.read);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleShowEmailPreview = (email: ParsedEmail) => {
    console.log('[Dashboard] handleShowEmailPreview called with:', email);
    
    // Extract sender email
    const senderEmail = email.from?.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)?.[1] || email.from;
    
    // Try to get customer from persistent mapping
    const mappedCustomerId = senderEmail ? getCustomerByEmail(senderEmail) : null;
    let matchedCustomer: Customer | null = null;
    let isAutoMatched = false;

    if (mappedCustomerId) {
      // Found in persistent mapping
      matchedCustomer = customers.find((c) => c.id === mappedCustomerId) || null;
      isAutoMatched = true;
      console.log('[Dashboard] Auto-matched customer:', matchedCustomer);
    } else {
      // Fallback: try to match based on email
      matchedCustomer = customers.find(
        (c) =>
          c.email?.toLowerCase() === email.from?.toLowerCase() ||
          c.email?.toLowerCase() === email.to?.[0]?.toLowerCase()
      ) || null;
      console.log('[Dashboard] Fallback matched customer:', matchedCustomer);
    }

    setPreviewEmail(email);
    setSelectedCustomerId(matchedCustomer?.id || '');
    setAutoMatchedCustomer(isAutoMatched ? matchedCustomer : null);
    setShowEmailPreview(true);
    console.log('[Dashboard] Preview modal should open');
  };
  
  const handleClosePreview = () => {
    setShowEmailPreview(false);
    setPreviewEmail(null);
    setSelectedCustomerId('');
    setAutoMatchedCustomer(null);
    setRememberMapping(false);
    // FASE 2B: Reset workflow state
    setShowWorkflowOptions(false);
    setShowWOAssignmentModal(false);
    setShowEmailEditModal(false);
    setPendingQuoteData(null);
    setCreateWorkOrderWithQuote(false);
    setEditedWorkOrderData(null);
  };
  
  const handleWorkOrderAssigned = (assignmentData: WorkOrderAssignmentData) => {
    if (!pendingQuoteData) return;
    
    const now = new Date().toISOString();
    const customer = customers.find(c => c.id === pendingQuoteData.customerId);
    const assignee = employees.find(e => e.id === assignmentData.assigneeId);
    
    if (!customer || !assignee) {
      // Create error notification
      setNotifications(prev => [{
        id: `error_${Date.now()}`,
        type: 'error',
        message: '❌ Fout: Klant of medewerker niet gevonden bij werkorder toewijzing',
        date: new Date().toISOString(),
        read: false
      }, ...prev]);
      return;
    }
    
    // ✅ Gebruik editedWorkOrderData als deze bestaat
    const workOrderData = editedWorkOrderData || {
      title: `${customer.name} - Email: ${pendingQuoteData.email.subject || 'Geen onderwerp'}`,
      description: pendingQuoteData.email.body || '',
      location: assignmentData.location,
      scheduledDate: assignmentData.scheduledDate,
      estimatedHours: 0,
      estimatedCost: 0,
      priority: 'normal' as const,
      status: 'To Do' as WorkOrderStatus,
      requiredInventory: [],
      notes: ''
    };
    
    // 1. Create Quote (simplified for now - geen parsed items)
    const quote: Quote = {
      id: `Q${Date.now()}`,
      customerId: pendingQuoteData.customerId,
      items: [], // TODO: Parse items from email
      subtotal: workOrderData.estimatedCost || 0,
      vatRate: 21,
      vatAmount: (workOrderData.estimatedCost || 0) * 0.21,
      total: (workOrderData.estimatedCost || 0) * 1.21,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      validUntil: '',
      notes: `Aangemaakt vanuit email: ${pendingQuoteData.email.subject || ''}

Van: ${pendingQuoteData.email.from || 'Onbekend'}
Datum: ${pendingQuoteData.email.date || new Date().toISOString()}

Originele inhoud:
${pendingQuoteData.email.body?.substring(0, 500) || ''}`,
      createdBy: 'system',
      location: workOrderData.location || assignmentData.location,
      scheduledDate: workOrderData.scheduledDate || assignmentData.scheduledDate,
      timestamps: {
        created: now,
      },
      history: [
        {
          timestamp: now,
          action: 'created',
          performedBy: 'system',
          details: `Offerte automatisch aangemaakt vanuit email parsing met werkorder`,
        },
      ],
    };
    
    // 2. Create WorkOrder
    const workOrder: WorkOrder = {
      id: `wo${Date.now()}`,
      title: workOrderData.title,
      description: workOrderData.description,
      status: workOrderData.status,
      assignedTo: assignmentData.assigneeId,
      assignedBy: 'system',
      requiredInventory: workOrderData.requiredInventory || [],
      createdDate: new Date().toISOString().split('T')[0],
      customerId: pendingQuoteData.customerId,
      location: workOrderData.location || assignmentData.location,
      scheduledDate: workOrderData.scheduledDate || assignmentData.scheduledDate,
      quoteId: quote.id,
      estimatedHours: workOrderData.estimatedHours || 0,
      estimatedCost: workOrderData.estimatedCost || 0,
      notes: [workOrderData.notes, assignmentData.notes, `Aangemaakt via email van: ${pendingQuoteData.email.from}`, `Email onderwerp: ${pendingQuoteData.email.subject}`, `Email datum: ${pendingQuoteData.email.date}`].filter(Boolean).join('\n\n'),
      timestamps: {
        created: now,
        assigned: now,
        converted: now,
      },
      history: [
        {
          timestamp: now,
          action: 'created',
          performedBy: 'system',
          details: `Werkorder aangemaakt vanuit email parsing`,
        },
        {
          timestamp: now,
          action: 'assigned',
          performedBy: 'system',
          details: `Toegewezen aan ${assignee.name}`,
          toAssignee: assignmentData.assigneeId,
        },
      ],
    };
    
    // 3. Link Quote <-> WorkOrder
    quote.workOrderId = workOrder.id;
    
    // 4. Callbacks to update state in parent
    onQuoteCreated(quote);
    onWorkOrderCreated(workOrder);
    
    // 5. Success feedback via notification
    setNotifications(prev => [{
      id: `success_${Date.now()}`,
      type: 'success',
      message: `✓ Offerte ${quote.id} en werkorder aangemaakt! Toegewezen aan ${assignee.name}`,
      date: new Date().toISOString(),
      read: false
    }, ...prev]);
    
    // 6. Close modals and reset
    setShowWOAssignmentModal(false);
    setEditedWorkOrderData(null);
    handleClosePreview();
  };
  
  const handleEmailWorkOrderEdited = (editedData: EmailWorkOrderData) => {
    setEditedWorkOrderData(editedData);
    setShowEmailEditModal(false);
    setShowWOAssignmentModal(true);
  };
  
  const handleEmailEditModalClose = () => {
    setShowEmailEditModal(false);
    setEditedWorkOrderData(null);
    setShowEmailPreview(true);
  };
  
  const handleConfirmEmail = () => {
    if (!selectedCustomerId || !previewEmail) return;
    
    const senderEmail = previewEmail.from?.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)?.[1] || previewEmail.from;
    
    // Save or update email mapping if checkbox is checked
    if (rememberMapping && senderEmail) {
      const isOverride = autoMatchedCustomer && autoMatchedCustomer.id !== selectedCustomerId;
      
      if (isOverride) {
        updateEmailCustomerMapping(senderEmail, selectedCustomerId, 'system');
        const newCustomerName = customers.find(c => c.id === selectedCustomerId)?.name;
        setNotifications(prev => [{
          id: `mapping_${Date.now()}`,
          type: 'success',
          message: `✓ Email koppeling gewijzigd van "${autoMatchedCustomer.name}" naar "${newCustomerName}"`,
          date: new Date().toISOString(),
          read: false
        }, ...prev]);
      } else if (!autoMatchedCustomer) {
        saveEmailCustomerMapping(senderEmail, selectedCustomerId, 'system');
        const customerName = customers.find(c => c.id === selectedCustomerId)?.name;
        setNotifications(prev => [{
          id: `mapping_${Date.now()}`,
          type: 'success',
          message: `✓ Email ${senderEmail} gekoppeld aan "${customerName}"`,
          date: new Date().toISOString(),
          read: false
        }, ...prev]);
      }
    }
    
    // Check if user wants to create workorder with quote
    if (createWorkOrderWithQuote) {
      // Store email data for workorder creation
      const customer = customers.find(c => c.id === selectedCustomerId);
      setPendingQuoteData({
        email: previewEmail,
        customerId: selectedCustomerId,
        customerName: customer?.name || 'Onbekende klant',
        senderEmail,
      });
      
      // ✨ NIEUW: Open edit modal EERST
      setShowEmailPreview(false);
      setShowEmailEditModal(true);
    } else {
      // Original flow: just alert (placeholder)
      alert('Email naar offerte conversie is nog niet volledig geïmplementeerd. Navigeer naar Factureren & Offerte om offerte aan te maken.');
      
      // Optioneel: navigeer naar Accounting pagina
      if (onNavigateToAccounting) {
        onNavigateToAccounting();
      }
      
      handleClosePreview();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral mb-2">Dashboard</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6">Overzicht van uw bedrijfsactiviteiten</p>

      {/* Email Drop Zone - NIEUWE SECTIE */}
      <div className="mb-8">
        <EmailDropZone onShowEmailPreview={handleShowEmailPreview} existingCustomers={customers} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totale Verkopen</p>
              <p className="text-2xl font-bold text-neutral mt-1">€{totalSales.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lage Voorraad</p>
              <p className="text-2xl font-bold text-neutral mt-1">{lowStockItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orders In Uitvoering</p>
              <p className="text-2xl font-bold text-neutral mt-1">{inProgressOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orders In Wacht</p>
              <p className="text-2xl font-bold text-neutral mt-1">{pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {unreadNotifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral">Meldingen</h2>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
              {unreadNotifications.length} nieuw
            </span>
          </div>
          <div className="space-y-3">
            {unreadNotifications.slice(0, 5).map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border-l-4 ${
                  notif.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                  notif.type === 'error' ? 'bg-red-50 border-red-500' :
                  notif.type === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notif.type)}
                    <div>
                      <p className="text-sm font-medium text-neutral">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.date).toLocaleString('nl-NL')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-neutral mb-4">Lage Voorraad Waarschuwingen</h2>
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-gray-500 text-sm">Alle voorraad niveaus zijn voldoende.</p>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral">{item.name}</p>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600">{item.quantity} stuks</p>
                    <p className="text-xs text-gray-500">Min: {item.reorderLevel}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-neutral mb-4">Recente Werkorders</h2>
          <div className="space-y-3">
            {workOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-neutral">{order.title}</p>
                  <p className="text-sm text-gray-600">{order.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Email Preview Modal */}
      {showEmailPreview && previewEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-neutral flex items-center gap-2">
                <span>📧</span>
                <span>Email Preview</span>
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Email Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Email Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Van:</span>
                    <p className="text-gray-800">{previewEmail.from || 'Onbekend'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Onderwerp:</span>
                    <p className="text-gray-800">{previewEmail.subject || 'Geen onderwerp'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Datum:</span>
                    <p className="text-gray-800">
                      {previewEmail.date
                        ? new Date(previewEmail.date).toLocaleString('nl-NL')
                        : 'Onbekend'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Selection */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecteer Klant *
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Kies een klant --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.email ? `(${customer.email})` : ''}
                      </option>
                    ))}
                  </select>
                  
                  {/* Auto-match indicator */}
                  {autoMatchedCustomer && (
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="text-green-600 font-semibold">✓ Automatisch herkend</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">Email was eerder gekoppeld aan deze klant</span>
                    </div>
                  )}
                  
                  {/* New email indicator */}
                  {!autoMatchedCustomer && (
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <span>🆕</span>
                      <span>Nieuwe email - selecteer handmatig een klant</span>
                    </p>
                  )}
                  
                  {/* Override warning */}
                  {autoMatchedCustomer && selectedCustomerId && autoMatchedCustomer.id !== selectedCustomerId && (
                    <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600">⚠️</span>
                        <div className="text-sm">
                          <p className="font-semibold text-orange-800">Je wijzigt de koppeling</p>
                          <p className="text-orange-700">
                            Van: <span className="font-medium">{autoMatchedCustomer.name}</span> → {' '}
                            <span className="font-medium">{customers.find(c => c.id === selectedCustomerId)?.name}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Remember mapping checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMapping || (!!autoMatchedCustomer && !!selectedCustomerId && autoMatchedCustomer.id !== selectedCustomerId)}
                    onChange={(e) => setRememberMapping(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">
                    ☐ Onthoud deze koppeling voor toekomstige emails
                    {autoMatchedCustomer && selectedCustomerId && autoMatchedCustomer.id !== selectedCustomerId && (
                      <span className="text-orange-600 font-medium ml-1">(auto-checked bij wijziging)</span>
                    )}
                  </span>
                </label>
              </div>

              {/* STAP 2B.2: Workflow Toggle */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={createWorkOrderWithQuote}
                    onChange={(e) => setCreateWorkOrderWithQuote(e.target.checked)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                      ☐ Maak direct offerte + werkorder aan
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Creëer automatisch een werkorder gekoppeld aan de offerte
                    </p>
                  </div>
                </label>
                
                {/* Visual feedback when toggle is ON */}
                {createWorkOrderWithQuote && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 animate-fade-in">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 text-lg">🔧</span>
                      <div>
                        <p className="text-sm font-semibold text-purple-800">
                          Werkorder Workflow Actief
                        </p>
                        <p className="text-xs text-purple-700">
                          Na bevestiging wordt je gevraagd om een medewerker toe te wijzen voor de werkorder.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Body Preview */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Email Inhoud
                </h3>
                <div className="bg-white rounded p-3 text-sm text-gray-700 max-h-60 overflow-y-auto">
                  {previewEmail.body || 'Geen inhoud'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleConfirmEmail}
                  disabled={!selectedCustomerId}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedCustomerId
                      ? createWorkOrderWithQuote
                        ? 'bg-purple-600 text-white hover:bg-purple-700 border-2 border-purple-400'
                        : 'bg-primary text-white hover:bg-secondary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {createWorkOrderWithQuote ? '✓ Maak Offerte & Werkorder →' : '✓ Bevestigen'}
                </button>
                <button
                  onClick={handleClosePreview}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ✨ NIEUW: Email/WorkOrder Edit Modal */}
      {showEmailEditModal && pendingQuoteData && previewEmail && (
        <EmailWorkOrderEditModal
          isOpen={showEmailEditModal}
          onClose={handleEmailEditModalClose}
          onSave={handleEmailWorkOrderEdited}
          emailInfo={{
            from: previewEmail.from || 'Onbekend',
            to: previewEmail.to?.[0] || 'Niet beschikbaar',
            subject: previewEmail.subject || 'Geen onderwerp',
            date: previewEmail.date || new Date().toISOString(),
            body: previewEmail.body || ''
          }}
          customerName={pendingQuoteData.customerName}
          availableInventory={inventory}
        />
      )}
      
      {/* WorkOrder Assignment Modal */}
      {showWOAssignmentModal && pendingQuoteData && (
        <WorkOrderAssignmentModal
          isOpen={showWOAssignmentModal}
          onClose={() => {
            setShowWOAssignmentModal(false);
            // Optioneel: terug naar email preview
            setShowEmailPreview(true);
          }}
          onAssign={handleWorkOrderAssigned}
          employees={employees}
          prefillData={{
            customerName: pendingQuoteData.customerName,
            estimatedHours: editedWorkOrderData?.estimatedHours,
            estimatedCost: editedWorkOrderData?.estimatedCost,
          }}
        />
      )}
    </div>
  );
};