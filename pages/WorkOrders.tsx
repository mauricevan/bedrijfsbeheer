import React, { useState, useMemo } from 'react';
import { WorkOrder, WorkOrderStatus, Employee, InventoryItem, Customer, User, Quote, Invoice, QuoteItem, QuoteLabor, InvoiceHistoryEntry } from '../types';

interface WorkOrdersProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  employees: Employee[];
  customers: Customer[];
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  currentUser: User;
  isAdmin: boolean;
  quotes?: Quote[];
  setQuotes?: React.Dispatch<React.SetStateAction<Quote[]>>;
  invoices?: Invoice[];
  setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

export const WorkOrders: React.FC<WorkOrdersProps> = ({
  workOrders,
  setWorkOrders,
  employees,
  customers,
  inventory,
  setInventory,
  currentUser,
  isAdmin,
  quotes = [],
  setQuotes,
  invoices = [],
  setInvoices,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string>(currentUser.employeeId);
  
  // Detail modal states voor factuur/offerte
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailType, setDetailType] = useState<'quote' | 'invoice' | null>(null);
  const [detailItem, setDetailItem] = useState<Quote | Invoice | null>(null);
  const [showWorkOrderDetailModal, setShowWorkOrderDetailModal] = useState(false);
  const [selectedWorkOrderForDetail, setSelectedWorkOrderForDetail] = useState<WorkOrder | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [selectedUserIdForWorkOrder, setSelectedUserIdForWorkOrder] = useState('');
  const [clonedItemForWorkOrder, setClonedItemForWorkOrder] = useState<Quote | Invoice | null>(null);
  
  // Edit/Clone form states
  const [editFormData, setEditFormData] = useState<{
    customerId: string;
    items: QuoteItem[];
    labor: QuoteLabor[];
    vatRate: number;
    notes: string;
    validUntil?: string;
    paymentTerms?: string;
    issueDate?: string;
    dueDate?: string;
  } | null>(null);
  const [newOrder, setNewOrder] = useState({
    title: '',
    description: '',
    assignedTo: currentUser.employeeId,
    customerId: '',
    location: '',
    scheduledDate: '',
    pendingReason: '',
    sortIndex: undefined as number | undefined,
  });

  // Material selection state
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedMaterialQty, setSelectedMaterialQty] = useState(1);
  const [requiredMaterials, setRequiredMaterials] = useState<{ itemId: string; quantity: number }[]>([]);

  // Show pending reason section
  const [showPendingReason, setShowPendingReason] = useState(false);

  // Edit material selection state
  const [editSelectedMaterialId, setEditSelectedMaterialId] = useState('');
  const [editSelectedMaterialQty, setEditSelectedMaterialQty] = useState(1);

  // Get next available sort index
  const getNextSortIndex = () => {
    if (workOrders.length === 0) return 1;
    const maxIndex = Math.max(...workOrders.map(wo => wo.sortIndex || 0));
    return maxIndex + 1;
  };

  // Filter workorders based on viewing user (or all if admin views all)
  const filteredWorkOrders = useMemo(() => {
    let filtered;
    if (isAdmin && viewingUserId === 'all') {
      filtered = workOrders;
    } else {
      filtered = workOrders.filter(order => order.assignedTo === viewingUserId);
    }
    // Sort by sortIndex (lowest first), fallback to creation date
    return filtered.sort((a, b) => {
      const indexA = a.sortIndex ?? 999999;
      const indexB = b.sortIndex ?? 999999;
      if (indexA !== indexB) {
        return indexA - indexB;
      }
      // If same index, sort by creation date
      return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    });
  }, [workOrders, viewingUserId, isAdmin]);

  // Group workorders by employee when viewing all
  const groupedWorkOrders = useMemo(() => {
    if (!isAdmin || viewingUserId !== 'all') {
      return null;
    }

    // Group by employee
    const grouped: { [employeeId: string]: WorkOrder[] } = {};
    
    workOrders.forEach(order => {
      if (!grouped[order.assignedTo]) {
        grouped[order.assignedTo] = [];
      }
      grouped[order.assignedTo].push(order);
    });

    // Sort workorders within each employee group by sortIndex
    Object.keys(grouped).forEach(employeeId => {
      grouped[employeeId].sort((a, b) => {
        const indexA = a.sortIndex ?? 999999;
        const indexB = b.sortIndex ?? 999999;
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      });
    });

    return grouped;
  }, [workOrders, viewingUserId, isAdmin]);

  // Get stats for the current view
  const stats = useMemo(() => {
    const todo = filteredWorkOrders.filter(wo => wo.status === 'To Do').length;
    const pending = filteredWorkOrders.filter(wo => wo.status === 'Pending').length;
    const inProgress = filteredWorkOrders.filter(wo => wo.status === 'In Progress').length;
    const completed = filteredWorkOrders.filter(wo => wo.status === 'Completed').length;
    const totalHours = filteredWorkOrders.reduce((sum, wo) => sum + (wo.hoursSpent || 0), 0);
    
    return { todo, pending, inProgress, completed, totalHours };
  }, [filteredWorkOrders]);

  const handleAddOrder = () => {
    if (!newOrder.title || !newOrder.assignedTo) {
      alert('Vul alle verplichte velden in!');
      return;
    }

    // Check if materials are available
    for (const material of requiredMaterials) {
      const item = inventory.find(i => i.id === material.itemId);
      if (item && item.quantity < material.quantity) {
        alert(`Niet genoeg voorraad van ${item.name}. Beschikbaar: ${item.quantity}, Nodig: ${material.quantity}`);
        return;
      }
    }

    const now = new Date().toISOString();

    const order: WorkOrder = {
      id: `wo${Date.now()}`,
      title: newOrder.title,
      description: newOrder.description,
      status: showPendingReason ? 'Pending' : 'To Do',
      assignedTo: newOrder.assignedTo,
      assignedBy: currentUser.employeeId, // NEW
      requiredInventory: requiredMaterials,
      createdDate: new Date().toISOString().split('T')[0],
      customerId: newOrder.customerId || undefined,
      location: newOrder.location || undefined,
      scheduledDate: newOrder.scheduledDate || undefined,
      pendingReason: showPendingReason ? newOrder.pendingReason || undefined : undefined,
      sortIndex: newOrder.sortIndex !== undefined && newOrder.sortIndex > 0 ? newOrder.sortIndex : getNextSortIndex(),
      // NEW TIMESTAMPS
      timestamps: {
        created: now,
        assigned: now
      },
      // NEW HISTORY
      history: [
        {
          timestamp: now,
          action: 'created',
          performedBy: currentUser.employeeId,
          details: `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`
        },
        {
          timestamp: now,
          action: 'assigned',
          performedBy: currentUser.employeeId,
          details: `Toegewezen aan ${getEmployeeName(newOrder.assignedTo)} door ${getEmployeeName(currentUser.employeeId)}`,
          toAssignee: newOrder.assignedTo
        }
      ]
    };

    setWorkOrders([...workOrders, order]);
    setNewOrder({ 
      title: '', 
      description: '', 
      assignedTo: currentUser.employeeId,
      customerId: '',
      location: '',
      scheduledDate: '',
      pendingReason: '',
      sortIndex: undefined,
    });
    setRequiredMaterials([]);
    setShowPendingReason(false);
    setShowAddForm(false);
  };

  const addMaterialToOrder = () => {
    if (!selectedMaterialId || selectedMaterialQty <= 0) {
      alert('Selecteer een materiaal en voer een geldig aantal in!');
      return;
    }

    const item = inventory.find(i => i.id === selectedMaterialId);
    if (!item) return;

    if (item.quantity < selectedMaterialQty) {
      alert(`Niet genoeg voorraad. Beschikbaar: ${item.quantity}`);
      return;
    }

    // Check if material already added
    const existingIndex = requiredMaterials.findIndex(m => m.itemId === selectedMaterialId);
    if (existingIndex >= 0) {
      const updated = [...requiredMaterials];
      updated[existingIndex].quantity += selectedMaterialQty;
      setRequiredMaterials(updated);
    } else {
      setRequiredMaterials([...requiredMaterials, { itemId: selectedMaterialId, quantity: selectedMaterialQty }]);
    }

    setSelectedMaterialId('');
    setSelectedMaterialQty(1);
  };

  const removeMaterialFromOrder = (itemId: string) => {
    setRequiredMaterials(requiredMaterials.filter(m => m.itemId !== itemId));
  };

  const addMaterialToEditOrder = () => {
    if (!editingOrder || !editSelectedMaterialId || editSelectedMaterialQty <= 0) {
      alert('Selecteer een materiaal en voer een geldig aantal in!');
      return;
    }

    const item = inventory.find(i => i.id === editSelectedMaterialId);
    if (!item) return;

    if (item.quantity < editSelectedMaterialQty) {
      alert(`Niet genoeg voorraad. Beschikbaar: ${item.quantity}`);
      return;
    }

    const existingIndex = editingOrder.requiredInventory.findIndex(m => m.itemId === editSelectedMaterialId);
    if (existingIndex >= 0) {
      const updated = [...editingOrder.requiredInventory];
      updated[existingIndex].quantity += editSelectedMaterialQty;
      setEditingOrder({ ...editingOrder, requiredInventory: updated });
    } else {
      setEditingOrder({
        ...editingOrder,
        requiredInventory: [...editingOrder.requiredInventory, { itemId: editSelectedMaterialId, quantity: editSelectedMaterialQty }]
      });
    }

    setEditSelectedMaterialId('');
    setEditSelectedMaterialQty(1);
  };

  const removeMaterialFromEditOrder = (itemId: string) => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      requiredInventory: editingOrder.requiredInventory.filter(m => m.itemId !== itemId)
    });
  };

  const handleEditOrder = (order: WorkOrder) => {
    setEditingOrder(order);
    setEditSelectedMaterialId('');
    setEditSelectedMaterialQty(1);
  };

  const handleSaveEdit = () => {
    if (!editingOrder || !editingOrder.title || !editingOrder.assignedTo) {
      alert('Vul alle verplichte velden in!');
      return;
    }

    // Check if materials are available
    for (const material of editingOrder.requiredInventory) {
      const item = inventory.find(i => i.id === material.itemId);
      if (item && item.quantity < material.quantity) {
        alert(`Niet genoeg voorraad van ${item.name}. Beschikbaar: ${item.quantity}, Nodig: ${material.quantity}`);
        return;
      }
    }

    const now = new Date().toISOString();
    const oldOrder = workOrders.find(wo => wo.id === editingOrder.id);
    
    let updatedOrder = { ...editingOrder };
    let workOrdersToUpdate = [...workOrders];
    
    // Check if sortIndex changed and handle swap/reorder
    if (oldOrder && oldOrder.sortIndex !== editingOrder.sortIndex && editingOrder.sortIndex !== undefined) {
      const newIndex = editingOrder.sortIndex;
      
      // Find if there's a conflict with another work order of the same employee
      const conflictingOrder = workOrders.find(wo => 
        wo.id !== editingOrder.id && 
        wo.assignedTo === editingOrder.assignedTo && 
        wo.sortIndex === newIndex
      );
      
      if (conflictingOrder) {
        // Find the next available index for the conflicting order
        const employeeOrders = workOrders.filter(wo => 
          wo.assignedTo === editingOrder.assignedTo && 
          wo.id !== editingOrder.id
        );
        const usedIndices = employeeOrders.map(wo => wo.sortIndex || 0);
        const maxIndex = Math.max(...usedIndices, 0);
        const nextAvailableIndex = maxIndex + 1;
        
        // Update the conflicting order
        workOrdersToUpdate = workOrdersToUpdate.map(wo => {
          if (wo.id === conflictingOrder.id) {
            return {
              ...wo,
              sortIndex: nextAvailableIndex,
              history: [
                ...(wo.history || []),
                {
                  timestamp: now,
                  action: 'reordered',
                  performedBy: currentUser.employeeId,
                  details: `Indexnummer automatisch aangepast van #${conflictingOrder.sortIndex} naar #${nextAvailableIndex} (conflictresolutie door ${getEmployeeName(currentUser.employeeId)})`,
                }
              ]
            };
          }
          return wo;
        });
        
        // Add history entry to the edited order about the swap
        updatedOrder.history = [
          ...(updatedOrder.history || []),
          {
            timestamp: now,
            action: 'reordered',
            performedBy: currentUser.employeeId,
            details: `Indexnummer gewijzigd van #${oldOrder.sortIndex} naar #${newIndex} door ${getEmployeeName(currentUser.employeeId)} (werkorder #${conflictingOrder.sortIndex} opgeschoven naar #${nextAvailableIndex})`,
          }
        ];
      } else {
        // No conflict, just add a simple reorder entry
        updatedOrder.history = [
          ...(updatedOrder.history || []),
          {
            timestamp: now,
            action: 'reordered',
            performedBy: currentUser.employeeId,
            details: `Indexnummer gewijzigd van #${oldOrder.sortIndex || 'auto'} naar #${newIndex} door ${getEmployeeName(currentUser.employeeId)}`,
          }
        ];
      }
    }
    
    // Check if assignee changed
    if (oldOrder && oldOrder.assignedTo !== editingOrder.assignedTo) {
      updatedOrder.history = [
        ...(updatedOrder.history || []),
        {
          timestamp: now,
          action: 'assigned',
          performedBy: currentUser.employeeId,
          details: `Opnieuw toegewezen van ${getEmployeeName(oldOrder.assignedTo)} naar ${getEmployeeName(editingOrder.assignedTo)} door ${getEmployeeName(currentUser.employeeId)}`,
          fromAssignee: oldOrder.assignedTo,
          toAssignee: editingOrder.assignedTo
        }
      ];
      
      // Update assigned timestamp
      if (!updatedOrder.timestamps) {
        updatedOrder.timestamps = { created: updatedOrder.createdDate };
      } else {
        updatedOrder.timestamps = { ...updatedOrder.timestamps };
      }
      updatedOrder.timestamps.assigned = now;
    }

    // Clear pendingReason if status is not Pending
    updatedOrder.pendingReason = updatedOrder.status === 'Pending' ? updatedOrder.pendingReason : undefined;

    // Apply all updates
    setWorkOrders(workOrdersToUpdate.map(order =>
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    setEditingOrder(null);
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditSelectedMaterialId('');
    setEditSelectedMaterialQty(1);
  };

  const updateStatus = (id: string, status: WorkOrderStatus) => {
    setWorkOrders(workOrders.map(order => {
      if (order.id === id) {
        const now = new Date().toISOString();
        const oldStatus = order.status;
        
        const updates: Partial<WorkOrder> = { 
          status,
          history: [
            ...(order.history || []),
            {
              timestamp: now,
              action: 'status_changed',
              performedBy: currentUser.employeeId,
              details: `Status gewijzigd van "${oldStatus}" naar "${status}" door ${getEmployeeName(currentUser.employeeId)}`,
              fromStatus: oldStatus,
              toStatus: status
            }
          ]
        };
        
        // Update timestamps
        if (!order.timestamps) {
          updates.timestamps = { created: order.createdDate };
        } else {
          updates.timestamps = { ...order.timestamps };
        }
        
        if (status === 'In Progress' && !updates.timestamps.started) {
          updates.timestamps.started = now;
        }
        
        if (status === 'Completed') {
          updates.completedDate = new Date().toISOString().split('T')[0];
          updates.timestamps.completed = now;
        }
        
        // Clear pendingReason if moving away from Pending status
        if (status !== 'Pending') {
          updates.pendingReason = undefined;
        }
        
        return { ...order, ...updates };
      }
      return order;
    }));

    // If completing, deduct inventory and create invoice
    if (status === 'Completed') {
      const order = workOrders.find(o => o.id === id);
      if (order) {
        // Deduct inventory
        const updatedInventory = [...inventory];
        order.requiredInventory.forEach(req => {
          const item = updatedInventory.find(i => i.id === req.itemId);
          if (item) {
            item.quantity = Math.max(0, item.quantity - req.quantity);
          }
        });
        setInventory(updatedInventory);

        // Automatically create invoice from completed work order
        convertCompletedWorkOrderToInvoice(order);
      }
    }
  };

  const updateHours = (id: string, hours: number) => {
    setWorkOrders(workOrders.map(order =>
      order.id === id ? { ...order, hoursSpent: hours } : order
    ));
  };

  const deleteOrder = (id: string) => {
    if (confirm('Weet je zeker dat je deze werkorder wilt verwijderen?')) {
      setWorkOrders(workOrders.filter(order => order.id !== id));
    }
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-500';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'To Do': return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || 'Onbekend';
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return null;
    return customers.find(c => c.id === customerId)?.name || 'Onbekend';
  };

  // Helper functions voor factuur generatie
  const generateInvoiceNumber = () => {
    if (!invoices || invoices.length === 0) {
      const year = new Date().getFullYear();
      return `${year}-001`;
    }
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .filter((inv) => inv.invoiceNumber.startsWith(`${year}-`))
      .map((inv) => parseInt(inv.invoiceNumber.split("-")[1]))
      .filter((num) => !isNaN(num));

    const nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${year}-${String(nextNumber).padStart(3, "0")}`;
  };

  const createInvoiceHistoryEntry = (
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

  // Convert work order to invoice when completed
  const convertCompletedWorkOrderToInvoice = (workOrder: WorkOrder) => {
    // Check if invoice already exists
    if (workOrder.invoiceId) {
      const existingInvoice = invoices?.find(inv => inv.id === workOrder.invoiceId);
      if (existingInvoice) {
        // Update existing invoice with actual hours spent
        if (setInvoices && workOrder.hoursSpent) {
          const updatedLabor: QuoteLabor[] = existingInvoice.labor ? 
            existingInvoice.labor.map(labor => ({
              ...labor,
              hours: workOrder.hoursSpent || labor.hours,
              total: (workOrder.hoursSpent || labor.hours) * labor.hourlyRate,
            })) : [];

          const itemsSubtotal = existingInvoice.items.reduce((sum, item) => sum + item.total, 0);
          const laborSubtotal = updatedLabor.reduce((sum, labor) => sum + labor.total, 0);
          const subtotal = itemsSubtotal + laborSubtotal;
          const vatAmount = subtotal * (existingInvoice.vatRate / 100);
          const total = subtotal + vatAmount;

          const updatedInvoice: Invoice = {
            ...existingInvoice,
            labor: updatedLabor.length > 0 ? updatedLabor : undefined,
            subtotal,
            vatAmount,
            total,
            history: [
              ...(existingInvoice.history || []),
              createInvoiceHistoryEntry(
                "updated",
                `Factuur bijgewerkt met werkelijke gewerkte uren (${workOrder.hoursSpent}u) na voltooiing werkorder ${workOrder.id}`
              ),
            ],
          };

          setInvoices(invoices.map(inv => inv.id === existingInvoice.id ? updatedInvoice : inv));
        }
        return;
      }
    }

    // Check if quote exists and has invoice
    if (workOrder.quoteId) {
      const quote = quotes.find(q => q.id === workOrder.quoteId);
      if (quote) {
        // If quote has invoice, update that one
        const existingInvoice = invoices?.find(inv => inv.quoteId === quote.id);
        if (existingInvoice && setInvoices) {
          // Update with actual hours
          if (workOrder.hoursSpent && existingInvoice.labor) {
            const updatedLabor: QuoteLabor[] = existingInvoice.labor.map(labor => ({
              ...labor,
              hours: workOrder.hoursSpent || labor.hours,
              total: (workOrder.hoursSpent || labor.hours) * labor.hourlyRate,
            }));

            const itemsSubtotal = existingInvoice.items.reduce((sum, item) => sum + item.total, 0);
            const laborSubtotal = updatedLabor.reduce((sum, labor) => sum + labor.total, 0);
            const subtotal = itemsSubtotal + laborSubtotal;
            const vatAmount = subtotal * (existingInvoice.vatRate / 100);
            const total = subtotal + vatAmount;

            const updatedInvoice: Invoice = {
              ...existingInvoice,
              labor: updatedLabor,
              subtotal,
              vatAmount,
              total,
              workOrderId: workOrder.id,
              history: [
                ...(existingInvoice.history || []),
                createInvoiceHistoryEntry(
                  "updated",
                  `Factuur bijgewerkt met werkelijke gewerkte uren (${workOrder.hoursSpent}u) na voltooiing werkorder ${workOrder.id}`
                ),
              ],
            };

            setInvoices(invoices.map(inv => inv.id === existingInvoice.id ? updatedInvoice : inv));
            
            // Update workorder with invoice link
            setWorkOrders(workOrders.map(wo => 
              wo.id === workOrder.id ? { ...wo, invoiceId: existingInvoice.id } : wo
            ));
            
            return;
          }
        }
      }
    }

    // Create new invoice from work order
    if (!setInvoices || !workOrder.customerId) {
      console.log("Kan geen factuur aanmaken: setInvoices of customerId ontbreekt");
      return;
    }

    // Check if we can get items from quote if exists
    let invoiceItems: QuoteItem[] = [];
    let invoiceLabor: QuoteLabor[] = [];
    let vatRate = 21;

    if (workOrder.quoteId) {
      const quote = quotes.find(q => q.id === workOrder.quoteId);
      if (quote) {
        // Use quote items and labor as base
        invoiceItems = [...quote.items];
        invoiceLabor = quote.labor ? [...quote.labor] : [];
        vatRate = quote.vatRate;

        // Update labor with actual hours spent if available
        if (workOrder.hoursSpent && invoiceLabor.length > 0) {
          invoiceLabor = invoiceLabor.map(labor => ({
            ...labor,
            hours: workOrder.hoursSpent || labor.hours,
            total: (workOrder.hoursSpent || labor.hours) * labor.hourlyRate,
          }));
        }
      }
    }

    // If no quote or quote has no items, use workorder data
    if (invoiceItems.length === 0) {
      // Convert requiredInventory to QuoteItems
      invoiceItems = workOrder.requiredInventory.map(req => {
        const invItem = inventory.find(i => i.id === req.itemId);
        return {
          inventoryItemId: req.itemId,
          description: invItem?.name || 'Onbekend item',
          quantity: req.quantity,
          pricePerUnit: invItem?.price || 0,
          total: (invItem?.price || 0) * req.quantity,
        };
      });

      // If still no items, create a default item
      if (invoiceItems.length === 0) {
        invoiceItems = [{
          description: `Werkzaamheden - ${workOrder.title}`,
          quantity: 1,
          pricePerUnit: workOrder.estimatedCost || 0,
          total: workOrder.estimatedCost || 0,
        }];
      }
    }

    // If no labor from quote and hours spent, create labor entry
    if (invoiceLabor.length === 0 && workOrder.hoursSpent && workOrder.hoursSpent > 0) {
      invoiceLabor = [{
        description: `Werkzaamheden - ${workOrder.title}`,
        hours: workOrder.hoursSpent,
        hourlyRate: 65, // Default uurtarief, kan later worden aangepast
        total: workOrder.hoursSpent * 65,
      }];
    }

    // Calculate totals
    const itemsSubtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const laborSubtotal = invoiceLabor.reduce((sum, labor) => sum + labor.total, 0);
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    // Create invoice dates
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const now = new Date().toISOString();
    const customerName = getCustomerName(workOrder.customerId) || 'Onbekende klant';

    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: workOrder.customerId,
      workOrderId: workOrder.id,
      quoteId: workOrder.quoteId,
      items: invoiceItems,
      labor: invoiceLabor.length > 0 ? invoiceLabor : undefined,
      subtotal,
      vatRate,
      vatAmount,
      total,
      status: 'draft',
      issueDate: today,
      dueDate: dueDateStr,
      paymentTerms: '14 dagen',
      notes: `Factuur aangemaakt automatisch na voltooiing werkorder ${workOrder.id}\n${workOrder.notes || ''}`,
      location: workOrder.location,
      scheduledDate: workOrder.scheduledDate,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createInvoiceHistoryEntry(
          "created",
          `Factuur automatisch aangemaakt na voltooiing werkorder ${workOrder.id} door ${getEmployeeName(currentUser.employeeId)}`
        ),
      ],
    };

    setInvoices([...invoices, invoice]);
    
    // Update workorder with invoice link
    setWorkOrders(workOrders.map(wo => 
      wo.id === workOrder.id ? { ...wo, invoiceId: invoice.id } : wo
    ));

    alert(`✅ Factuur ${invoice.invoiceNumber} automatisch aangemaakt voor voltooide werkorder ${workOrder.id}!\n\nBekijk de factuur in de Boekhouding module.`);
  };

  // Get source document info (quote or invoice)
  const getSourceInfo = (workOrder: WorkOrder) => {
    if (workOrder.quoteId) {
      const quote = quotes.find(q => q.id === workOrder.quoteId);
      return quote ? { type: 'offerte' as const, id: quote.id, status: quote.status } : null;
    }
    if (workOrder.invoiceId) {
      const invoice = invoices.find(inv => inv.id === workOrder.invoiceId);
      return invoice ? { type: 'factuur' as const, id: invoice.invoiceNumber, status: invoice.status } : null;
    }
    return null;
  };

  // Open detail modal - probeer eerst factuur/offerte, anders werkorder details
  const openDetailModal = (workOrder: WorkOrder) => {
    // Als er een factuur of offerte is, toon die
    if (workOrder.quoteId) {
      const quote = quotes.find(q => q.id === workOrder.quoteId);
      if (quote) {
        setDetailType('quote');
        setDetailItem(quote);
        setShowDetailModal(true);
        return;
      }
    }
    if (workOrder.invoiceId) {
      const invoice = invoices.find(inv => inv.id === workOrder.invoiceId);
      if (invoice) {
        setDetailType('invoice');
        setDetailItem(invoice);
        setShowDetailModal(true);
        return;
      }
    }
    
    // Geen factuur/offerte, toon werkorder details
    setSelectedWorkOrderForDetail(workOrder);
    setShowWorkOrderDetailModal(true);
  };

  // Start bewerken
  const handleStartEdit = () => {
    if (!detailItem) return;
    
    if (detailType === 'quote') {
      const quote = detailItem as Quote;
      setEditFormData({
        customerId: quote.customerId,
        items: quote.items,
        labor: quote.labor || [],
        vatRate: quote.vatRate,
        notes: quote.notes || '',
        validUntil: quote.validUntil,
      });
    } else {
      const invoice = detailItem as Invoice;
      setEditFormData({
        customerId: invoice.customerId,
        items: invoice.items,
        labor: invoice.labor || [],
        vatRate: invoice.vatRate,
        notes: invoice.notes || '',
        paymentTerms: invoice.paymentTerms,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
      });
    }
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  // Start clonen
  const handleStartClone = () => {
    if (!detailItem) return;
    
    if (detailType === 'quote') {
      const quote = detailItem as Quote;
      setEditFormData({
        customerId: quote.customerId,
        items: quote.items.map(item => ({ ...item })),
        labor: quote.labor ? quote.labor.map(l => ({ ...l })) : [],
        vatRate: quote.vatRate,
        notes: quote.notes || '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 dagen
      });
    } else {
      const invoice = detailItem as Invoice;
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      setEditFormData({
        customerId: invoice.customerId,
        items: invoice.items.map(item => ({ ...item })),
        labor: invoice.labor ? invoice.labor.map(l => ({ ...l })) : [],
        vatRate: invoice.vatRate,
        notes: invoice.notes || '',
        paymentTerms: invoice.paymentTerms,
        issueDate: today,
        dueDate: dueDate.toISOString().split('T')[0],
      });
    }
    setShowDetailModal(false);
    setShowCloneModal(true);
  };

  // Helper functions voor form beheer
  const calculateTotals = () => {
    if (!editFormData) return { subtotal: 0, vatAmount: 0, total: 0 };
    
    const itemsSubtotal = editFormData.items.reduce((sum, item) => sum + item.total, 0);
    const laborSubtotal = editFormData.labor.reduce((sum, labor) => sum + labor.total, 0);
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (editFormData.vatRate / 100);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    if (!editFormData) return;
    
    const updatedItems = [...editFormData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'pricePerUnit') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].pricePerUnit;
    }
    
    setEditFormData({ ...editFormData, items: updatedItems });
  };

  const handleLaborChange = (index: number, field: keyof QuoteLabor, value: any) => {
    if (!editFormData) return;
    
    const updatedLabor = [...editFormData.labor];
    updatedLabor[index] = { ...updatedLabor[index], [field]: value };
    
    if (field === 'hours' || field === 'hourlyRate') {
      updatedLabor[index].total = updatedLabor[index].hours * updatedLabor[index].hourlyRate;
    }
    
    setEditFormData({ ...editFormData, labor: updatedLabor });
  };

  const handleAddItem = () => {
    if (!editFormData) return;
    
    const newItem: QuoteItem = {
      description: '',
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    };
    setEditFormData({ ...editFormData, items: [...editFormData.items, newItem] });
  };

  const handleAddLabor = () => {
    if (!editFormData) return;
    
    const newLabor: QuoteLabor = {
      description: '',
      hours: 1,
      hourlyRate: 65,
      total: 65,
    };
    setEditFormData({ ...editFormData, labor: [...editFormData.labor, newLabor] });
  };

  const handleRemoveItem = (index: number) => {
    if (!editFormData) return;
    
    setEditFormData({
      ...editFormData,
      items: editFormData.items.filter((_, i) => i !== index),
    });
  };

  const handleRemoveLabor = (index: number) => {
    if (!editFormData) return;
    
    setEditFormData({
      ...editFormData,
      labor: editFormData.labor.filter((_, i) => i !== index),
    });
  };

  const handleAddInventoryItem = (index: number, inventoryItemId: string) => {
    if (!editFormData) return;
    
    const invItem = inventory.find(i => i.id === inventoryItemId);
    if (invItem) {
      const updatedItems = [...editFormData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        inventoryItemId: inventoryItemId,
        description: invItem.name,
        pricePerUnit: invItem.price || 0,
        total: updatedItems[index].quantity * (invItem.price || 0),
      };
      setEditFormData({ ...editFormData, items: updatedItems });
    }
  };

  // Generate quote number
  const generateQuoteNumber = () => {
    if (!quotes || quotes.length === 0) return 'Q001';
    const existingNumbers = quotes
      .map(q => parseInt(q.id.replace('Q', '')))
      .filter(num => !isNaN(num));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `Q${String(nextNumber).padStart(3, '0')}`;
  };

  // Save edited quote
  const handleSaveEditedQuote = () => {
    if (!editFormData || !detailItem || detailType !== 'quote' || !setQuotes) return;
    
    const { subtotal, vatAmount, total } = calculateTotals();
    const quote = detailItem as Quote;
    
    const updatedQuote: Quote = {
      ...quote,
      customerId: editFormData.customerId,
      items: editFormData.items,
      labor: editFormData.labor.length > 0 ? editFormData.labor : undefined,
      subtotal,
      vatRate: editFormData.vatRate,
      vatAmount,
      total,
      notes: editFormData.notes,
      validUntil: editFormData.validUntil || quote.validUntil,
      history: [
        ...(quote.history || []),
        {
          timestamp: new Date().toISOString(),
          action: 'updated',
          performedBy: currentUser.employeeId,
          details: `Offerte bijgewerkt door ${getEmployeeName(currentUser.employeeId)}`,
        },
      ],
    };
    
    setQuotes(quotes.map(q => q.id === quote.id ? updatedQuote : q));
    setShowEditModal(false);
    setEditFormData(null);
    setShowDetailModal(false);
    setDetailItem(null);
    alert(`✅ Offerte ${quote.id} succesvol bijgewerkt!`);
  };

  // Save edited invoice
  const handleSaveEditedInvoice = () => {
    if (!editFormData || !detailItem || detailType !== 'invoice' || !setInvoices) return;
    
    const { subtotal, vatAmount, total } = calculateTotals();
    const invoice = detailItem as Invoice;
    
    const updatedInvoice: Invoice = {
      ...invoice,
      customerId: editFormData.customerId,
      items: editFormData.items,
      labor: editFormData.labor.length > 0 ? editFormData.labor : undefined,
      subtotal,
      vatRate: editFormData.vatRate,
      vatAmount,
      total,
      notes: editFormData.notes,
      paymentTerms: editFormData.paymentTerms,
      issueDate: editFormData.issueDate || invoice.issueDate,
      dueDate: editFormData.dueDate || invoice.dueDate,
      history: [
        ...(invoice.history || []),
        createInvoiceHistoryEntry(
          'updated',
          `Factuur bijgewerkt door ${getEmployeeName(currentUser.employeeId)}`
        ),
      ],
    };
    
    setInvoices(invoices.map(inv => inv.id === invoice.id ? updatedInvoice : inv));
    setShowEditModal(false);
    setEditFormData(null);
    setShowDetailModal(false);
    setDetailItem(null);
    alert(`✅ Factuur ${invoice.invoiceNumber} succesvol bijgewerkt!`);
  };

  // Save cloned quote
  const handleSaveClonedQuote = (sendToWorkOrder: boolean = false) => {
    if (!editFormData || detailType !== 'quote' || !setQuotes) return;
    
    if (!editFormData.customerId || editFormData.items.length === 0 || !editFormData.validUntil) {
      alert('Vul alle verplichte velden in!');
      return;
    }
    
    const { subtotal, vatAmount, total } = calculateTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(editFormData.customerId) || 'Onbekend';
    const newQuoteId = generateQuoteNumber();
    
    const newQuote: Quote = {
      id: newQuoteId,
      customerId: editFormData.customerId,
      items: editFormData.items,
      labor: editFormData.labor.length > 0 ? editFormData.labor : undefined,
      subtotal,
      vatRate: editFormData.vatRate,
      vatAmount,
      total,
      status: 'draft',
      validUntil: editFormData.validUntil,
      notes: editFormData.notes,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        {
          timestamp: now,
          action: 'created',
          performedBy: currentUser.employeeId,
          details: `Offerte gecloneerd door ${getEmployeeName(currentUser.employeeId)} voor klant ${customerName}`,
        },
      ],
    };
    
    setQuotes([...quotes, newQuote]);
    setShowCloneModal(false);
    setEditFormData(null);
    
    if (sendToWorkOrder) {
      setClonedItemForWorkOrder(newQuote);
      setShowUserSelectionModal(true);
    } else {
      alert(`✅ Offerte ${newQuoteId} succesvol gecloneerd!`);
    }
  };

  // Save cloned invoice
  const handleSaveClonedInvoice = (sendToWorkOrder: boolean = false) => {
    if (!editFormData || detailType !== 'invoice' || !setInvoices) return;
    
    if (!editFormData.customerId || editFormData.items.length === 0 || !editFormData.issueDate || !editFormData.dueDate) {
      alert('Vul alle verplichte velden in!');
      return;
    }
    
    const { subtotal, vatAmount, total } = calculateTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(editFormData.customerId) || 'Onbekend';
    const newInvoiceNumber = generateInvoiceNumber();
    
    const newInvoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      customerId: editFormData.customerId,
      items: editFormData.items,
      labor: editFormData.labor.length > 0 ? editFormData.labor : undefined,
      subtotal,
      vatRate: editFormData.vatRate,
      vatAmount,
      total,
      status: 'draft',
      issueDate: editFormData.issueDate,
      dueDate: editFormData.dueDate,
      paymentTerms: editFormData.paymentTerms || '14 dagen',
      notes: editFormData.notes,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createInvoiceHistoryEntry(
          'created',
          `Factuur gecloneerd door ${getEmployeeName(currentUser.employeeId)} voor klant ${customerName}`
        ),
      ],
    };
    
    setInvoices([...invoices, newInvoice]);
    setShowCloneModal(false);
    setEditFormData(null);
    
    if (sendToWorkOrder) {
      setClonedItemForWorkOrder(newInvoice);
      setShowUserSelectionModal(true);
    } else {
      alert(`✅ Factuur ${newInvoiceNumber} succesvol gecloneerd!`);
    }
  };

  // Complete work order conversion from cloned item
  const completeWorkOrderConversionFromClone = () => {
    if (!selectedUserIdForWorkOrder || !clonedItemForWorkOrder) {
      alert('Selecteer een medewerker!');
      return;
    }
    
    const now = new Date().toISOString();
    const workOrderId = `wo${Date.now()}`;
    
    if (clonedItemForWorkOrder.id.startsWith('Q')) {
      // Quote to work order
      const quote = clonedItemForWorkOrder as Quote;
      const customerName = getCustomerName(quote.customerId) || 'Onbekend';
      const totalHours = quote.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;
      
      const workOrder: WorkOrder = {
        id: workOrderId,
        title: `${customerName} - Offerte ${quote.id}`,
        description: quote.notes || `Werkorder aangemaakt vanuit offerte ${quote.id}`,
        status: 'To Do',
        assignedTo: selectedUserIdForWorkOrder,
        assignedBy: currentUser.employeeId,
        convertedBy: currentUser.employeeId,
        requiredInventory: quote.items
          .filter(item => item.inventoryItemId)
          .map(item => ({
            itemId: item.inventoryItemId!,
            quantity: item.quantity,
          })),
        createdDate: new Date().toISOString().split('T')[0],
        customerId: quote.customerId,
        quoteId: quote.id,
        estimatedHours: totalHours,
        estimatedCost: quote.total,
        notes: `Geschatte uren: ${totalHours}u\nGeschatte kosten: €${quote.total.toFixed(2)}`,
        timestamps: {
          created: now,
          converted: now,
          assigned: now,
        },
        history: [
          {
            timestamp: now,
            action: 'created',
            performedBy: currentUser.employeeId,
            details: `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`,
          },
          {
            timestamp: now,
            action: 'converted',
            performedBy: currentUser.employeeId,
            details: `Geconverteerd van geclonede offerte ${quote.id} door ${getEmployeeName(currentUser.employeeId)}`,
          },
          {
            timestamp: now,
            action: 'assigned',
            performedBy: currentUser.employeeId,
            details: `Toegewezen aan ${getEmployeeName(selectedUserIdForWorkOrder)} door ${getEmployeeName(currentUser.employeeId)}`,
          },
        ],
      };
      
      setWorkOrders([...workOrders, workOrder]);
      setShowUserSelectionModal(false);
      setSelectedUserIdForWorkOrder('');
      setClonedItemForWorkOrder(null);
      alert(`✅ Werkorder ${workOrderId} succesvol aangemaakt en toegewezen aan ${getEmployeeName(selectedUserIdForWorkOrder)}!`);
    } else {
      // Invoice to work order
      const invoice = clonedItemForWorkOrder as Invoice;
      const customerName = getCustomerName(invoice.customerId) || 'Onbekend';
      const totalHours = invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;
      
      const workOrder: WorkOrder = {
        id: workOrderId,
        title: `${customerName} - Factuur ${invoice.invoiceNumber}`,
        description: invoice.notes || `Werkorder aangemaakt vanuit factuur ${invoice.invoiceNumber}`,
        status: 'To Do',
        assignedTo: selectedUserIdForWorkOrder,
        assignedBy: currentUser.employeeId,
        convertedBy: currentUser.employeeId,
        requiredInventory: invoice.items
          .filter(item => item.inventoryItemId)
          .map(item => ({
            itemId: item.inventoryItemId!,
            quantity: item.quantity,
          })),
        createdDate: new Date().toISOString().split('T')[0],
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        estimatedHours: totalHours,
        estimatedCost: invoice.total,
        notes: `Geschatte uren: ${totalHours}u\nGeschatte kosten: €${invoice.total.toFixed(2)}`,
        timestamps: {
          created: now,
          converted: now,
          assigned: now,
        },
        history: [
          {
            timestamp: now,
            action: 'created',
            performedBy: currentUser.employeeId,
            details: `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`,
          },
          {
            timestamp: now,
            action: 'converted',
            performedBy: currentUser.employeeId,
            details: `Geconverteerd van geclonede factuur ${invoice.invoiceNumber} door ${getEmployeeName(currentUser.employeeId)}`,
          },
          {
            timestamp: now,
            action: 'assigned',
            performedBy: currentUser.employeeId,
            details: `Toegewezen aan ${getEmployeeName(selectedUserIdForWorkOrder)} door ${getEmployeeName(currentUser.employeeId)}`,
          },
        ],
      };
      
      setWorkOrders([...workOrders, workOrder]);
      setShowUserSelectionModal(false);
      setSelectedUserIdForWorkOrder('');
      setClonedItemForWorkOrder(null);
      alert(`✅ Werkorder ${workOrderId} succesvol aangemaakt en toegewezen aan ${getEmployeeName(selectedUserIdForWorkOrder)}!`);
    }
  };

  const viewingEmployee = employees.find(e => e.id === viewingUserId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral truncate">
            {isAdmin && viewingUserId === 'all' ? 'Alle Werkorders' : `Workboard - ${viewingEmployee?.name || currentUser.name}`}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {isAdmin && viewingUserId === 'all' 
              ? 'Volledig overzicht van alle werkorders' 
              : 'Jouw toegewezen taken en werkzaamheden'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto px-6 py-2 sm:py-2.5 bg-primary text-white text-sm sm:text-base rounded-lg hover:bg-secondary transition-colors whitespace-nowrap flex-shrink-0"
          >
            + Nieuwe Werkorder
          </button>
        )}
      </div>

      {/* User Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        {/* Dropdown Section - Full width on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {isAdmin ? 'Bekijk werkorders van:' : 'Bekijk ook:'}
            </label>
            <select
              value={viewingUserId}
              onChange={(e) => setViewingUserId(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
            >
              <option value={currentUser.employeeId}>Mijn werkorders</option>
              {isAdmin && <option value="all">Alle medewerkers</option>}
              {employees
                .filter(emp => emp.id !== currentUser.employeeId)
                .map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))
              }
            </select>
          </div>
          
          {/* Quick Stats - Hide on small mobile, grid on tablet+ */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-gray-600">{stats.todo}</p>
              <p className="text-xs text-gray-600">To Do</p>
            </div>
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-600">In Wacht</p>
            </div>
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-gray-600">Bezig</p>
            </div>
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-600">Afgerond</p>
            </div>
            <div className="text-center">
              <p className="text-xl lg:text-2xl font-bold text-primary">{stats.totalHours}u</p>
              <p className="text-xs text-gray-600">Totaal uren</p>
            </div>
          </div>
        </div>

        {/* Mobile Stats - Show only on small screens */}
        <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-gray-600">{stats.todo}</p>
            <p className="text-xs text-gray-600">To Do</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-600">Wacht</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-600">Bezig</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-600">Klaar</p>
          </div>
          <div className="bg-primary bg-opacity-10 rounded-lg p-3 text-center col-span-2">
            <p className="text-lg font-bold text-primary">{stats.totalHours}u</p>
            <p className="text-xs text-gray-600">Totaal uren</p>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral mb-4">Nieuwe Werkorder</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titel *"
              value={newOrder.title}
              onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={newOrder.assignedTo}
              onChange={(e) => setNewOrder({ ...newOrder, assignedTo: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecteer medewerker *</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.role}
                </option>
              ))}
            </select>
            <select
              value={newOrder.customerId}
              onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Klant (optioneel)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Locatie"
              value={newOrder.location}
              onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="date"
              placeholder="Geplande datum"
              value={newOrder.scheduledDate}
              onChange={(e) => setNewOrder({ ...newOrder, scheduledDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Indexnummer (optioneel)"
              value={newOrder.sortIndex !== undefined ? newOrder.sortIndex : ''}
              onChange={(e) => setNewOrder({ ...newOrder, sortIndex: e.target.value ? parseInt(e.target.value) : undefined })}
              min="1"
              max="999"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              title="Laat leeg voor automatisch volgnummer. Lagere nummers verschijnen bovenaan."
            />
            <textarea
              placeholder="Beschrijving"
              value={newOrder.description}
              onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
              rows={2}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
            />
          </div>
          
          {/* Pending Reason - Optional with Checkbox */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="addPendingReason"
                checked={showPendingReason}
                onChange={(e) => {
                  setShowPendingReason(e.target.checked);
                  if (!e.target.checked) {
                    setNewOrder({ ...newOrder, pendingReason: '' });
                  }
                }}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <label htmlFor="addPendingReason" className="text-sm font-medium text-gray-700 cursor-pointer">
                Werkorder in wacht zetten (optioneel)
              </label>
            </div>

            {showPendingReason && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <label className="text-sm font-medium text-gray-700">
                    Reden voor wachtstatus
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="bijv: Wacht op materiaal, wacht op klant bevestiging..."
                  value={newOrder.pendingReason}
                  onChange={(e) => setNewOrder({ ...newOrder, pendingReason: e.target.value })}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Geef aan waarom deze werkorder in wacht staat.
                </p>
              </div>
            )}
          </div>

          {/* Materials Section */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <label className="text-sm font-medium text-gray-700">
                Benodigde Materialen (optioneel)
              </label>
            </div>
            
            {/* Add material form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Selecteer materiaal</option>
                {inventory.filter(item => item.quantity > 0).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Voorraad: {item.quantity})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={selectedMaterialQty}
                onChange={(e) => setSelectedMaterialQty(parseInt(e.target.value) || 1)}
                className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Aantal"
              />
              <button
                type="button"
                onClick={addMaterialToOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                + Materiaal Toevoegen
              </button>
            </div>

            {/* Materials list */}
            {requiredMaterials.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Toegevoegde materialen:</p>
                {requiredMaterials.map(material => {
                  const item = inventory.find(i => i.id === material.itemId);
                  return (
                    <div key={material.itemId} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{item?.name}</span>
                        <span className="text-xs text-gray-600 ml-2">× {material.quantity}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterialFromOrder(material.itemId)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Verwijderen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Geen materialen toegevoegd</p>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddOrder}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              Toevoegen
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingOrder && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-neutral">Werkorder Bewerken</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={editingOrder.title}
                      onChange={(e) => setEditingOrder({ ...editingOrder, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Toegewezen aan *
                    </label>
                    <select
                      value={editingOrder.assignedTo}
                      onChange={(e) => setEditingOrder({ ...editingOrder, assignedTo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editingOrder.status}
                      onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as WorkOrderStatus })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="To Do">To Do</option>
                      <option value="Pending">In Wacht</option>
                      <option value="In Progress">In Uitvoering</option>
                      <option value="Completed">Afgerond</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klant
                    </label>
                    <select
                      value={editingOrder.customerId || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customerId: e.target.value || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Geen klant</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Locatie
                    </label>
                    <input
                      type="text"
                      value={editingOrder.location || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, location: e.target.value || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Geplande datum
                    </label>
                    <input
                      type="date"
                      value={editingOrder.scheduledDate || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, scheduledDate: e.target.value || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gewerkte uren
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editingOrder.hoursSpent || 0}
                      onChange={(e) => setEditingOrder({ ...editingOrder, hoursSpent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aanmaak datum
                    </label>
                    <input
                      type="text"
                      value={editingOrder.createdDate}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indexnummer (optioneel)
                    </label>
                    <input
                      type="number"
                      value={editingOrder.sortIndex !== undefined ? editingOrder.sortIndex : ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, sortIndex: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Auto"
                      min="1"
                      max="999"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      title="Laat leeg voor automatisch volgnummer. Lagere nummers verschijnen bovenaan."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lagere nummers verschijnen bovenaan. Laat leeg voor automatisch volgnummer.
                    </p>
                  </div>
                </div>

                {/* Pending Reason - Only show if status is Pending */}
                {editingOrder.status === 'Pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reden waarom in wacht
                    </label>
                    <input
                      type="text"
                      value={editingOrder.pendingReason || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, pendingReason: e.target.value })}
                      placeholder="Bijv: Wacht op materialen, wacht op klant bevestiging..."
                      className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Deze reden is zichtbaar voor alle medewerkers
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    value={editingOrder.description}
                    onChange={(e) => setEditingOrder({ ...editingOrder, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Materials Section */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <label className="text-sm font-medium text-gray-700">
                      Benodigde Materialen
                    </label>
                  </div>

                  {/* Add material form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <select
                      value={editSelectedMaterialId}
                      onChange={(e) => setEditSelectedMaterialId(e.target.value)}
                      className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Selecteer materiaal</option>
                      {inventory.filter(item => item.quantity > 0).map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} (Voorraad: {item.quantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={editSelectedMaterialQty}
                      onChange={(e) => setEditSelectedMaterialQty(parseInt(e.target.value) || 1)}
                      className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Aantal"
                    />
                    <button
                      type="button"
                      onClick={addMaterialToEditOrder}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      + Toevoegen
                    </button>
                  </div>

                  {/* Materials list */}
                  {editingOrder.requiredInventory.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700 mb-2">Toegevoegde materialen:</p>
                      {editingOrder.requiredInventory.map(material => {
                        const item = inventory.find(i => i.id === material.itemId);
                        return (
                          <div key={material.itemId} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                            <div className="flex-1">
                              <span className="text-sm font-medium">{item?.name}</span>
                              <span className="text-xs text-gray-600 ml-2">× {material.quantity}</span>
                              <span className="text-xs text-gray-500 ml-2">(Voorraad: {item?.quantity})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMaterialFromEditOrder(material.itemId)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Verwijderen"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Geen materialen toegevoegd</p>
                  )}
                </div>

                {editingOrder.notes !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notities
                    </label>
                    <textarea
                      value={editingOrder.notes || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              {/* History Section in Edit Modal */}
              {(editingOrder.timestamps || (editingOrder.history && editingOrder.history.length > 0)) && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-neutral mb-3">Werkorder Geschiedenis</h3>
                  <HistoryViewer
                    history={editingOrder.history || []}
                    timestamps={editingOrder.timestamps}
                    getEmployeeName={getEmployeeName}
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  Opslaan
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workboard - Kanban Style */}
      {groupedWorkOrders ? (
        // Grouped view by employee (when "Alle medewerkers" is selected)
        <div className="space-y-8">
          {employees.map(employee => {
            const employeeOrders = groupedWorkOrders[employee.id] || [];
            const empStats = {
              todo: employeeOrders.filter(wo => wo.status === 'To Do').length,
              pending: employeeOrders.filter(wo => wo.status === 'Pending').length,
              inProgress: employeeOrders.filter(wo => wo.status === 'In Progress').length,
              completed: employeeOrders.filter(wo => wo.status === 'Completed').length,
              totalHours: employeeOrders.reduce((sum, wo) => sum + (wo.hoursSpent || 0), 0),
            };

            return (
              <div key={employee.id} className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-primary">
                {/* Employee Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center px-3 py-2 bg-gray-100 rounded-lg">
                      <p className="text-lg font-bold text-gray-700">{empStats.todo}</p>
                      <p className="text-xs text-gray-600">To Do</p>
                    </div>
                    <div className="text-center px-3 py-2 bg-yellow-100 rounded-lg">
                      <p className="text-lg font-bold text-yellow-700">{empStats.pending}</p>
                      <p className="text-xs text-gray-600">In Wacht</p>
                    </div>
                    <div className="text-center px-3 py-2 bg-blue-100 rounded-lg">
                      <p className="text-lg font-bold text-blue-700">{empStats.inProgress}</p>
                      <p className="text-xs text-gray-600">Bezig</p>
                    </div>
                    <div className="text-center px-3 py-2 bg-green-100 rounded-lg">
                      <p className="text-lg font-bold text-green-700">{empStats.completed}</p>
                      <p className="text-xs text-gray-600">Afgerond</p>
                    </div>
                    <div className="text-center px-3 py-2 bg-primary bg-opacity-10 rounded-lg">
                      <p className="text-lg font-bold text-primary">{empStats.totalHours}u</p>
                      <p className="text-xs text-gray-600">Uren</p>
                    </div>
                  </div>
                </div>

                {/* Employee Kanban Board */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* To Do Column */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-neutral flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                        To Do
                      </h4>
                      <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-bold rounded-full">
                        {empStats.todo}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {employeeOrders
                        .filter(wo => wo.status === 'To Do')
                        .map(order => (
                          <WorkOrderCard
                            key={order.id}
                            order={order}
                            employees={employees}
                            customers={customers}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            inventory={inventory}
                            onUpdateStatus={updateStatus}
                            onUpdateHours={updateHours}
                            onDelete={deleteOrder}
                            onEdit={handleEditOrder}
                            onOpenDetail={openDetailModal}
                            getEmployeeName={getEmployeeName}
                            getCustomerName={getCustomerName}
                          />
                        ))}
                      {empStats.todo === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">Geen taken</p>
                      )}
                    </div>
                  </div>

                  {/* Pending Column */}
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-neutral flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        In Wacht
                      </h4>
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">
                        {empStats.pending}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {employeeOrders
                        .filter(wo => wo.status === 'Pending')
                        .map(order => (
                          <WorkOrderCard
                            key={order.id}
                            order={order}
                            employees={employees}
                            customers={customers}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            inventory={inventory}
                            onUpdateStatus={updateStatus}
                            onUpdateHours={updateHours}
                            onDelete={deleteOrder}
                            onEdit={handleEditOrder}
                            onOpenDetail={openDetailModal}
                            getEmployeeName={getEmployeeName}
                            getCustomerName={getCustomerName}
                          />
                        ))}
                      {empStats.pending === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">Geen taken</p>
                      )}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-neutral flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        In Uitvoering
                      </h4>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">
                        {empStats.inProgress}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {employeeOrders
                        .filter(wo => wo.status === 'In Progress')
                        .map(order => (
                          <WorkOrderCard
                            key={order.id}
                            order={order}
                            employees={employees}
                            customers={customers}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            inventory={inventory}
                            onUpdateStatus={updateStatus}
                            onUpdateHours={updateHours}
                            onDelete={deleteOrder}
                            onEdit={handleEditOrder}
                            onOpenDetail={openDetailModal}
                            getEmployeeName={getEmployeeName}
                            getCustomerName={getCustomerName}
                          />
                        ))}
                      {empStats.inProgress === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">Geen taken</p>
                      )}
                    </div>
                  </div>

                  {/* Completed Column */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-neutral flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Afgerond
                      </h4>
                      <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">
                        {empStats.completed}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {employeeOrders
                        .filter(wo => wo.status === 'Completed')
                        .map(order => (
                          <WorkOrderCard
                            key={order.id}
                            order={order}
                            employees={employees}
                            customers={customers}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            inventory={inventory}
                            onUpdateStatus={updateStatus}
                            onUpdateHours={updateHours}
                            onDelete={deleteOrder}
                            onEdit={handleEditOrder}
                            onOpenDetail={openDetailModal}
                            getEmployeeName={getEmployeeName}
                            getCustomerName={getCustomerName}
                          />
                        ))}
                      {empStats.completed === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">Geen taken</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Normal single-user view
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* To Do Column */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-neutral flex items-center gap-2 text-sm sm:text-base">
              <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
              To Do
            </h3>
            <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-bold rounded-full">
              {filteredWorkOrders.filter(wo => wo.status === 'To Do').length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredWorkOrders
              .filter(wo => wo.status === 'To Do')
              .map(order => (
                <WorkOrderCard
                  key={order.id}
                  order={order}
                  employees={employees}
                  customers={customers}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  inventory={inventory}
                  onUpdateStatus={updateStatus}
                  onUpdateHours={updateHours}
                  onDelete={deleteOrder}
                  onEdit={handleEditOrder}
                  onOpenDetail={openDetailModal}
                  getEmployeeName={getEmployeeName}
                  getCustomerName={getCustomerName}
                />
              ))}
            {filteredWorkOrders.filter(wo => wo.status === 'To Do').length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-6 sm:py-8">Geen taken om te starten</p>
            )}
          </div>
        </div>

        {/* Pending Column */}
        <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-neutral flex items-center gap-2 text-sm sm:text-base">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              In Wacht
            </h3>
            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">
              {filteredWorkOrders.filter(wo => wo.status === 'Pending').length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredWorkOrders
              .filter(wo => wo.status === 'Pending')
              .map(order => (
                <WorkOrderCard
                  key={order.id}
                  order={order}
                  employees={employees}
                  customers={customers}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  inventory={inventory}
                  onUpdateStatus={updateStatus}
                  onUpdateHours={updateHours}
                  onDelete={deleteOrder}
                  onEdit={handleEditOrder}
                  getEmployeeName={getEmployeeName}
                  getCustomerName={getCustomerName}
                />
              ))}
            {filteredWorkOrders.filter(wo => wo.status === 'Pending').length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-6 sm:py-8">Geen taken in wacht</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-neutral flex items-center gap-2 text-sm sm:text-base">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              In Uitvoering
            </h3>
            <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">
              {filteredWorkOrders.filter(wo => wo.status === 'In Progress').length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredWorkOrders
              .filter(wo => wo.status === 'In Progress')
              .map(order => (
                <WorkOrderCard
                  key={order.id}
                  order={order}
                  employees={employees}
                  customers={customers}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  inventory={inventory}
                  onUpdateStatus={updateStatus}
                  onUpdateHours={updateHours}
                  onDelete={deleteOrder}
                  onEdit={handleEditOrder}
                  getEmployeeName={getEmployeeName}
                  getCustomerName={getCustomerName}
                />
              ))}
            {filteredWorkOrders.filter(wo => wo.status === 'In Progress').length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-6 sm:py-8">Geen actieve taken</p>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-semibold text-neutral flex items-center gap-2 text-sm sm:text-base">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Afgerond
            </h3>
            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">
              {filteredWorkOrders.filter(wo => wo.status === 'Completed').length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredWorkOrders
              .filter(wo => wo.status === 'Completed')
              .map(order => (
                <WorkOrderCard
                  key={order.id}
                  order={order}
                  employees={employees}
                  customers={customers}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  inventory={inventory}
                  onUpdateStatus={updateStatus}
                  onUpdateHours={updateHours}
                  onDelete={deleteOrder}
                  onEdit={handleEditOrder}
                  onOpenDetail={openDetailModal}
                  getEmployeeName={getEmployeeName}
                  getCustomerName={getCustomerName}
                />
              ))}
            {filteredWorkOrders.filter(wo => wo.status === 'Completed').length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-6 sm:py-8">Geen afgeronde taken</p>
            )}
          </div>
        </div>
        </div>
      )}

      {filteredWorkOrders.length === 0 && !groupedWorkOrders && (
        <div className="text-center py-12">
          <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">Geen werkorders gevonden</p>
        </div>
      )}

      {/* Detail Modal voor Factuur/Offerte */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-neutral">
                {detailType === 'quote' ? '📋 Offerte Details' : '🧾 Factuur Details'}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {detailType === 'quote' ? (
                <>
                  {(() => {
                    const quote = detailItem as Quote;
                    const customerName = getCustomerName(quote.customerId) || 'Onbekend';
                    const itemsSubtotal = quote.items.reduce((sum, item) => sum + item.total, 0);
                    const laborSubtotal = quote.labor?.reduce((sum, l) => sum + l.total, 0) || 0;
                    const subtotal = itemsSubtotal + laborSubtotal;
                    const vatAmount = subtotal * (quote.vatRate / 100);
                    const total = subtotal + vatAmount;

                    return (
                      <>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Offerte ID:</label>
                            <p className="text-neutral font-bold">{quote.id}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Klant:</label>
                            <p className="text-neutral">{customerName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Status:</label>
                            <p className="text-neutral">{quote.status}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Geldig tot:</label>
                            <p className="text-neutral">{quote.validUntil}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="font-semibold text-neutral mb-2">Items:</h3>
                          <div className="space-y-2">
                            {quote.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                                <span>{item.description} × {item.quantity}</span>
                                <span className="font-semibold">€{item.total.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {quote.labor && quote.labor.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-semibold text-neutral mb-2">Werkuren:</h3>
                            <div className="space-y-2">
                              {quote.labor.map((labor, idx) => (
                                <div key={idx} className="flex justify-between p-2 bg-green-50 rounded">
                                  <span>{labor.description} ({labor.hours}u × €{labor.hourlyRate}/u)</span>
                                  <span className="font-semibold">€{labor.total.toFixed(2)}</span>
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
                            <label className="text-sm font-semibold text-gray-600">Notities:</label>
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
                    const customerName = getCustomerName(invoice.customerId) || 'Onbekend';
                    const itemsSubtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
                    const laborSubtotal = invoice.labor?.reduce((sum, l) => sum + l.total, 0) || 0;
                    const subtotal = itemsSubtotal + laborSubtotal;
                    const vatAmount = subtotal * (invoice.vatRate / 100);
                    const total = subtotal + vatAmount;

                    return (
                      <>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Factuurnummer:</label>
                            <p className="text-neutral font-bold">{invoice.invoiceNumber}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Klant:</label>
                            <p className="text-neutral">{customerName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Status:</label>
                            <p className="text-neutral">{invoice.status}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Factuurdatum:</label>
                            <p className="text-neutral">{invoice.issueDate}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Vervaldatum:</label>
                            <p className="text-neutral">{invoice.dueDate}</p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-600">Betalingsvoorwaarden:</label>
                            <p className="text-neutral">{invoice.paymentTerms || '14 dagen'}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="font-semibold text-neutral mb-2">Items:</h3>
                          <div className="space-y-2">
                            {invoice.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                                <span>{item.description} × {item.quantity}</span>
                                <span className="font-semibold">€{item.total.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {invoice.labor && invoice.labor.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-semibold text-neutral mb-2">Werkuren:</h3>
                            <div className="space-y-2">
                              {invoice.labor.map((labor, idx) => (
                                <div key={idx} className="flex justify-between p-2 bg-green-50 rounded">
                                  <span>{labor.description} ({labor.hours}u × €{labor.hourlyRate}/u)</span>
                                  <span className="font-semibold">€{labor.total.toFixed(2)}</span>
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
                            <label className="text-sm font-semibold text-gray-600">Notities:</label>
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
                  onClick={handleStartEdit}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  ✏️ Bewerken
                </button>
                <button
                  onClick={handleStartClone}
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

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-5xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-neutral">
                {detailType === 'quote' ? '✏️ Offerte Bewerken' : '✏️ Factuur Bewerken'}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditFormData(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Klant */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Klant *</label>
                <select
                  value={editFormData.customerId}
                  onChange={(e) => setEditFormData({ ...editFormData, customerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>

              {/* BTW */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">BTW Percentage (%)</label>
                <input
                  type="number"
                  value={editFormData.vatRate}
                  onChange={(e) => setEditFormData({ ...editFormData, vatRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              {/* Items Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral text-lg">Items</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddItem}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      + Custom Item
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {editFormData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                      <select
                        value={item.inventoryItemId || ''}
                        onChange={(e) => handleAddInventoryItem(index, e.target.value)}
                        className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Uit voorraad selecteren</option>
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} - €{inv.price?.toFixed(2) || '0.00'}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Beschrijving"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Aantal"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                      <input
                        type="number"
                        placeholder="Prijs per stuk"
                        value={item.pricePerUnit}
                        onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                      <div className="col-span-1 text-sm font-semibold text-right">
                        €{item.total.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labor Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral text-lg">Werkuren (optioneel)</h3>
                  <button
                    onClick={handleAddLabor}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    + Werkuren Toevoegen
                  </button>
                </div>
                <div className="space-y-3">
                  {editFormData.labor.map((labor, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="Beschrijving"
                        value={labor.description}
                        onChange={(e) => handleLaborChange(index, 'description', e.target.value)}
                        className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Uren"
                        value={labor.hours}
                        onChange={(e) => handleLaborChange(index, 'hours', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.5"
                      />
                      <input
                        type="number"
                        placeholder="Uurtarief"
                        value={labor.hourlyRate}
                        onChange={(e) => handleLaborChange(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                      <div className="col-span-2 text-sm font-semibold text-right">
                        €{labor.total.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveLabor(index)}
                        className="col-span-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Verwijderen
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Datum velden */}
              {detailType === 'quote' ? (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Geldig tot *</label>
                  <input
                    type="date"
                    value={editFormData.validUntil || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Factuurdatum *</label>
                    <input
                      type="date"
                      value={editFormData.issueDate || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, issueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vervaldatum *</label>
                    <input
                      type="date"
                      value={editFormData.dueDate || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {detailType === 'invoice' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Betalingsvoorwaarden</label>
                  <input
                    type="text"
                    value={editFormData.paymentTerms || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentTerms: e.target.value })}
                    placeholder="bijv. 14 dagen"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Notities */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notities</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optionele notities..."
                />
              </div>

              {/* Totalen */}
              {(() => {
                const { subtotal, vatAmount, total } = calculateTotals();
                return (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">Subtotaal:</span>
                      <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">BTW ({editFormData.vatRate}%):</span>
                      <span className="font-semibold">€{vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-blue-200">
                      <span className="font-bold text-lg">Totaal:</span>
                      <span className="font-bold text-lg">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Actie knoppen */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (detailType === 'quote') {
                      handleSaveEditedQuote();
                    } else {
                      handleSaveEditedInvoice();
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  💾 Opslaan
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditFormData(null);
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {showCloneModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-5xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-neutral">
                {detailType === 'quote' ? '📋 Offerte Clonen' : '📋 Factuur Clonen'}
              </h2>
              <button
                onClick={() => {
                  setShowCloneModal(false);
                  setEditFormData(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Klant */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Klant *</label>
                <select
                  value={editFormData.customerId}
                  onChange={(e) => setEditFormData({ ...editFormData, customerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>

              {/* BTW */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">BTW Percentage (%)</label>
                <input
                  type="number"
                  value={editFormData.vatRate}
                  onChange={(e) => setEditFormData({ ...editFormData, vatRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              {/* Items Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral text-lg">Items</h3>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                  >
                    + Custom Item
                  </button>
                </div>
                <div className="space-y-3">
                  {editFormData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                      <select
                        value={item.inventoryItemId || ''}
                        onChange={(e) => handleAddInventoryItem(index, e.target.value)}
                        className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Uit voorraad selecteren</option>
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} - €{inv.price?.toFixed(2) || '0.00'}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Beschrijving"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Aantal"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                      <input
                        type="number"
                        placeholder="Prijs per stuk"
                        value={item.pricePerUnit}
                        onChange={(e) => handleItemChange(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                      <div className="col-span-1 text-sm font-semibold text-right">
                        €{item.total.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labor Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral text-lg">Werkuren (optioneel)</h3>
                  <button
                    onClick={handleAddLabor}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    + Werkuren Toevoegen
                  </button>
                </div>
                <div className="space-y-3">
                  {editFormData.labor.map((labor, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="Beschrijving"
                        value={labor.description}
                        onChange={(e) => handleLaborChange(index, 'description', e.target.value)}
                        className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Uren"
                        value={labor.hours}
                        onChange={(e) => handleLaborChange(index, 'hours', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.5"
                      />
                      <input
                        type="number"
                        placeholder="Uurtarief"
                        value={labor.hourlyRate}
                        onChange={(e) => handleLaborChange(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                      <div className="col-span-2 text-sm font-semibold text-right">
                        €{labor.total.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveLabor(index)}
                        className="col-span-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        Verwijderen
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Datum velden */}
              {detailType === 'quote' ? (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Geldig tot *</label>
                  <input
                    type="date"
                    value={editFormData.validUntil || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Factuurdatum *</label>
                    <input
                      type="date"
                      value={editFormData.issueDate || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, issueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vervaldatum *</label>
                    <input
                      type="date"
                      value={editFormData.dueDate || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {detailType === 'invoice' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Betalingsvoorwaarden</label>
                  <input
                    type="text"
                    value={editFormData.paymentTerms || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentTerms: e.target.value })}
                    placeholder="bijv. 14 dagen"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Notities */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notities</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optionele notities..."
                />
              </div>

              {/* Totalen */}
              {(() => {
                const { subtotal, vatAmount, total } = calculateTotals();
                return (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">Subtotaal:</span>
                      <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">BTW ({editFormData.vatRate}%):</span>
                      <span className="font-semibold">€{vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-blue-200">
                      <span className="font-bold text-lg">Totaal:</span>
                      <span className="font-bold text-lg">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Actie knoppen */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (detailType === 'quote') {
                      handleSaveClonedQuote(false);
                    } else {
                      handleSaveClonedInvoice(false);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  📋 Clonen
                </button>
                <button
                  onClick={() => {
                    if (detailType === 'quote') {
                      handleSaveClonedQuote(true);
                    } else {
                      handleSaveClonedInvoice(true);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  📤 Clonen & Naar Werkorder
                </button>
                <button
                  onClick={() => {
                    setShowCloneModal(false);
                    setEditFormData(null);
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WorkOrder Detail Modal (wanneer geen factuur/offerte) */}
      {showWorkOrderDetailModal && selectedWorkOrderForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-neutral">
                📋 Werkorder Details
              </h2>
              <button
                onClick={() => {
                  setShowWorkOrderDetailModal(false);
                  setSelectedWorkOrderForDetail(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Werkorder ID:</label>
                  <p className="text-neutral font-bold">{selectedWorkOrderForDetail.id}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status:</label>
                  <p className="text-neutral">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(selectedWorkOrderForDetail.status)}`}>
                      {selectedWorkOrderForDetail.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Titel:</label>
                  <p className="text-neutral font-bold">{selectedWorkOrderForDetail.title}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Toegewezen aan:</label>
                  <p className="text-neutral">{getEmployeeName(selectedWorkOrderForDetail.assignedTo)}</p>
                </div>
                {selectedWorkOrderForDetail.customerId && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Klant:</label>
                    <p className="text-neutral">{getCustomerName(selectedWorkOrderForDetail.customerId) || 'Onbekend'}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Aanmaakdatum:</label>
                  <p className="text-neutral">{selectedWorkOrderForDetail.createdDate}</p>
                </div>
                {selectedWorkOrderForDetail.location && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Locatie:</label>
                    <p className="text-neutral">{selectedWorkOrderForDetail.location}</p>
                  </div>
                )}
                {selectedWorkOrderForDetail.scheduledDate && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Geplande datum:</label>
                    <p className="text-neutral">{selectedWorkOrderForDetail.scheduledDate}</p>
                  </div>
                )}
                {selectedWorkOrderForDetail.estimatedHours && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Geschatte uren:</label>
                    <p className="text-neutral">{selectedWorkOrderForDetail.estimatedHours}u</p>
                  </div>
                )}
                {selectedWorkOrderForDetail.hoursSpent && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Gewerkte uren:</label>
                    <p className="text-neutral">{selectedWorkOrderForDetail.hoursSpent}u</p>
                  </div>
                )}
                {selectedWorkOrderForDetail.estimatedCost && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Geschatte kosten:</label>
                    <p className="text-neutral">€{selectedWorkOrderForDetail.estimatedCost.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {selectedWorkOrderForDetail.description && (
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Beschrijving:</label>
                  <p className="text-neutral bg-gray-50 p-3 rounded-lg">{selectedWorkOrderForDetail.description}</p>
                </div>
              )}

              {selectedWorkOrderForDetail.pendingReason && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="text-sm font-semibold text-yellow-800 mb-2 block">Reden voor wachtstatus:</label>
                  <p className="text-yellow-700">{selectedWorkOrderForDetail.pendingReason}</p>
                </div>
              )}

              {selectedWorkOrderForDetail.requiredInventory && selectedWorkOrderForDetail.requiredInventory.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-neutral mb-2">Benodigde Materialen:</h3>
                  <div className="space-y-2">
                    {selectedWorkOrderForDetail.requiredInventory.map((material, idx) => {
                      const item = inventory.find(i => i.id === material.itemId);
                      return (
                        <div key={idx} className="flex justify-between p-2 bg-blue-50 rounded">
                          <span>{item?.name || 'Onbekend item'} × {material.quantity}</span>
                          {item?.unit && <span className="text-gray-600">({item.unit})</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedWorkOrderForDetail.notes && (
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Notities:</label>
                  <p className="text-neutral bg-gray-50 p-3 rounded-lg whitespace-pre-line">{selectedWorkOrderForDetail.notes}</p>
                </div>
              )}

              {selectedWorkOrderForDetail.timestamps && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-neutral mb-3">Tijdlijn:</h3>
                  <div className="space-y-2 text-sm">
                    {selectedWorkOrderForDetail.timestamps.created && (
                      <div>
                        <span className="font-semibold">Aangemaakt:</span>{' '}
                        {new Date(selectedWorkOrderForDetail.timestamps.created).toLocaleString('nl-NL')}
                      </div>
                    )}
                    {selectedWorkOrderForDetail.timestamps.assigned && (
                      <div>
                        <span className="font-semibold">Toegewezen:</span>{' '}
                        {new Date(selectedWorkOrderForDetail.timestamps.assigned).toLocaleString('nl-NL')}
                      </div>
                    )}
                    {selectedWorkOrderForDetail.timestamps.started && (
                      <div>
                        <span className="font-semibold">Gestart:</span>{' '}
                        {new Date(selectedWorkOrderForDetail.timestamps.started).toLocaleString('nl-NL')}
                      </div>
                    )}
                    {selectedWorkOrderForDetail.timestamps.completed && (
                      <div>
                        <span className="font-semibold">Voltooid:</span>{' '}
                        {new Date(selectedWorkOrderForDetail.timestamps.completed).toLocaleString('nl-NL')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Link naar factuur/offerte als beschikbaar */}
              {(selectedWorkOrderForDetail.quoteId || selectedWorkOrderForDetail.invoiceId) && (
                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Gekoppeld document:</h3>
                  {selectedWorkOrderForDetail.quoteId && (
                    <p className="text-purple-700">
                      📋 Offerte: {selectedWorkOrderForDetail.quoteId}
                      <button
                        onClick={() => {
                          const quote = quotes.find(q => q.id === selectedWorkOrderForDetail.quoteId);
                          if (quote) {
                            setShowWorkOrderDetailModal(false);
                            setDetailType('quote');
                            setDetailItem(quote);
                            setShowDetailModal(true);
                          }
                        }}
                        className="ml-2 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                      >
                        Bekijk Offerte
                      </button>
                    </p>
                  )}
                  {selectedWorkOrderForDetail.invoiceId && (
                    <p className="text-purple-700">
                      🧾 Factuur: {invoices.find(inv => inv.id === selectedWorkOrderForDetail.invoiceId)?.invoiceNumber || selectedWorkOrderForDetail.invoiceId}
                      <button
                        onClick={() => {
                          const invoice = invoices.find(inv => inv.id === selectedWorkOrderForDetail.invoiceId);
                          if (invoice) {
                            setShowWorkOrderDetailModal(false);
                            setDetailType('invoice');
                            setDetailItem(invoice);
                            setShowDetailModal(true);
                          }
                        }}
                        className="ml-2 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                      >
                        Bekijk Factuur
                      </button>
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowWorkOrderDetailModal(false);
                      handleEditOrder(selectedWorkOrderForDetail);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    ✏️ Bewerken
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowWorkOrderDetailModal(false);
                    setSelectedWorkOrderForDetail(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Selection Modal voor Werkorder */}
      {showUserSelectionModal && clonedItemForWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-neutral mb-4">
              Selecteer Medewerker voor Werkorder
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medewerker *
              </label>
              <select
                value={selectedUserIdForWorkOrder}
                onChange={(e) => setSelectedUserIdForWorkOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecteer medewerker</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={completeWorkOrderConversionFromClone}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                disabled={!selectedUserIdForWorkOrder}
              >
                ✅ Werkorder Aanmaken
              </button>
              <button
                onClick={() => {
                  setShowUserSelectionModal(false);
                  setSelectedUserIdForWorkOrder('');
                  setClonedItemForWorkOrder(null);
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// History Viewer Component
interface HistoryViewerProps {
  history: Array<{
    timestamp: string;
    action: string;
    performedBy: string;
    details: string;
    fromStatus?: string;
    toStatus?: string;
    fromAssignee?: string;
    toAssignee?: string;
  }>;
  timestamps?: {
    created: string;
    converted?: string;
    assigned: string;
    started?: string;
    completed?: string;
  };
  getEmployeeName: (id: string) => string;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ history, timestamps, getEmployeeName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '🆕';
      case 'converted': return '🔄';
      case 'assigned': return '👤';
      case 'status_changed': return '📊';
      case 'completed': return '✅';
      case 'reordered': return '🔢'; // 🔢 numbers icon for index changes
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Zojuist';
    if (diffMins < 60) return `${diffMins} min geleden`;
    if (diffHours < 24) return `${diffHours} uur geleden`;
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    return formatTimestamp(timestamp);
  };

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      {/* Timestamp Summary */}
      {timestamps && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {timestamps.created && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">🆕 Aangemaakt:</span>
                <span className="text-gray-700 font-medium" title={formatTimestamp(timestamps.created)}>
                  {formatRelativeTime(timestamps.created)}
                </span>
              </div>
            )}
            {timestamps.converted && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">🔄 Geconverteerd:</span>
                <span className="text-gray-700 font-medium" title={formatTimestamp(timestamps.converted)}>
                  {formatRelativeTime(timestamps.converted)}
                </span>
              </div>
            )}
            {timestamps.assigned && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">👤 Toegewezen:</span>
                <span className="text-gray-700 font-medium" title={formatTimestamp(timestamps.assigned)}>
                  {formatRelativeTime(timestamps.assigned)}
                </span>
              </div>
            )}
            {timestamps.started && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">▶️ Gestart:</span>
                <span className="text-gray-700 font-medium" title={formatTimestamp(timestamps.started)}>
                  {formatRelativeTime(timestamps.started)}
                </span>
              </div>
            )}
            {timestamps.completed && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">✅ Voltooid:</span>
                <span className="text-gray-700 font-medium" title={formatTimestamp(timestamps.completed)}>
                  {formatRelativeTime(timestamps.completed)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Toggle */}
      {history && history.length > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium text-gray-700"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Volledige Geschiedenis ({history.length})</span>
            </div>
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded History */}
          {isExpanded && (
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {history.map((entry, index) => (
                <div key={index} className="flex gap-2 text-xs border-l-2 border-blue-300 pl-3 py-2 bg-blue-50 rounded-r">
                  <span className="text-base">{getActionIcon(entry.action)}</span>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-snug">{entry.details}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// WorkOrder Card Component
interface WorkOrderCardProps {
  order: WorkOrder;
  employees: Employee[];
  customers: Customer[];
  currentUser: User;
  isAdmin: boolean;
  inventory: InventoryItem[];
  onUpdateStatus: (id: string, status: WorkOrderStatus) => void;
  onUpdateHours: (id: string, hours: number) => void;
  onDelete: (id: string) => void;
  onEdit: (order: WorkOrder) => void;
  onOpenDetail?: (order: WorkOrder) => void;
  getEmployeeName: (id: string) => string;
  getCustomerName: (id?: string) => string | null;
}

const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  order,
  currentUser,
  isAdmin,
  inventory,
  onUpdateStatus,
  onUpdateHours,
  onDelete,
  onEdit,
  onOpenDetail,
  getEmployeeName,
  getCustomerName,
}) => {
  const [editingHours, setEditingHours] = useState(false);
  const [hours, setHours] = useState(order.hoursSpent || 0);
  const [editingPendingReason, setEditingPendingReason] = useState(false);
  const [pendingReason, setPendingReason] = useState(order.pendingReason || '');

  const isAssignedToCurrentUser = order.assignedTo === currentUser.employeeId;
  const canEdit = isAdmin || isAssignedToCurrentUser;

  const handleSaveHours = () => {
    onUpdateHours(order.id, hours);
    setEditingHours(false);
  };

  const handleSavePendingReason = () => {
    // Update the work order with the new pending reason
    onEdit({ ...order, pendingReason: pendingReason.trim() || undefined });
    setEditingPendingReason(false);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 border-gray-300 hover:shadow-lg transition-shadow cursor-pointer"
      onDoubleClick={() => onOpenDetail && onOpenDetail(order)}
      title="Dubbelklik om factuur/offerte details te zien"
    >
      {/* Index Badge */}
      {order.sortIndex !== undefined && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-primary rounded">
            #{order.sortIndex}
          </span>
        </div>
      )}
      <div className="flex items-start justify-between mb-3 gap-2">
        <h4 className="font-semibold text-neutral flex-1 text-sm sm:text-base break-words">{order.title}</h4>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <button
              onClick={() => onEdit(order)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Bewerken"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => onDelete(order.id)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              title="Verwijderen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Pending Reason Section */}
      {order.status === 'Pending' && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          {editingPendingReason && canEdit ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-semibold text-yellow-800">Reden voor wachtstatus:</span>
              </div>
              <textarea
                value={pendingReason}
                onChange={(e) => setPendingReason(e.target.value)}
                placeholder="bijv: Wacht op materiaal, wacht op klant bevestiging..."
                rows={2}
                className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSavePendingReason}
                  className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                >
                  Opslaan
                </button>
                <button
                  onClick={() => {
                    setPendingReason(order.pendingReason || '');
                    setEditingPendingReason(false);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">In wacht:</p>
                    {order.pendingReason ? (
                      <p className="text-xs text-yellow-700">{order.pendingReason}</p>
                    ) : (
                      <p className="text-xs text-yellow-600 italic">Geen reden opgegeven</p>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setEditingPendingReason(true)}
                    className="text-xs text-yellow-700 hover:text-yellow-900 hover:underline whitespace-nowrap"
                    title="Reden bewerken"
                  >
                    {order.pendingReason ? 'Bewerk' : '+ Reden toevoegen'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Geschatte informatie van offerte/factuur */}
      {(order.quoteId || order.invoiceId) && (
        <div 
          className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
          onDoubleClick={() => onOpenDetail && onOpenDetail(order)}
          title="Dubbelklik om details te zien"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-semibold text-purple-800">
              {order.quoteId ? `Gebaseerd op offerte ${order.quoteId}` : `Gebaseerd op factuur ${order.invoiceId}`}
            </span>
            <span className="text-xs text-purple-600 ml-auto">🔍 Dubbelklik</span>
          </div>
          {order.estimatedHours && (
            <div className="text-xs text-purple-700 mb-1">
              Geschatte uren: <span className="font-semibold">{order.estimatedHours}u</span>
              {order.hoursSpent !== undefined && order.hoursSpent > 0 && (
                <span className={order.hoursSpent > order.estimatedHours ? 'text-red-600 ml-2' : 'text-green-600 ml-2'}>
                  (Daadwerkelijk: {order.hoursSpent}u {order.hoursSpent > order.estimatedHours ? '⚠️' : '✓'})
                </span>
              )}
            </div>
          )}
          {order.estimatedCost && (
            <div className="text-xs text-purple-700">
              Geschatte waarde: <span className="font-semibold">€{order.estimatedCost.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-3">{order.description}</p>

      {/* Materials Section */}
      {order.requiredInventory && order.requiredInventory.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs font-semibold text-blue-800">Benodigde materialen:</span>
          </div>
          <div className="space-y-1">
            {order.requiredInventory.map(material => {
              const item = inventory.find(i => i.id === material.itemId);
              if (!item) return null;
              const hasEnough = item.quantity >= material.quantity;
              return (
                <div key={material.itemId} className="flex items-center justify-between text-xs">
                  <span className={hasEnough ? 'text-gray-700' : 'text-red-600 font-semibold'}>
                    {item.name}
                  </span>
                  <span className={hasEnough ? 'text-gray-600' : 'text-red-600 font-semibold'}>
                    {material.quantity} {hasEnough ? '' : `(Voorraad: ${item.quantity})`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2 mb-3 text-xs">
        {isAdmin && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-gray-700">{getEmployeeName(order.assignedTo)}</span>
          </div>
        )}
        
        {order.customerId && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-gray-700">{getCustomerName(order.customerId)}</span>
          </div>
        )}
        
        {order.location && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700">{order.location}</span>
          </div>
        )}
        
        {order.scheduledDate && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700">{order.scheduledDate}</span>
          </div>
        )}
      </div>

      {/* Hours */}
      <div className="mb-3 p-2 bg-gray-50 rounded">
        {editingHours && canEdit ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              step="0.5"
              min="0"
            />
            <button
              onClick={handleSaveHours}
              className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-secondary"
            >
              ✓
            </button>
            <button
              onClick={() => setEditingHours(false)}
              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Uren besteed:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{order.hoursSpent || 0}u</span>
              {canEdit && order.status !== 'Completed' && (
                <button
                  onClick={() => setEditingHours(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Bewerk
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="space-y-2">
          {order.status === 'To Do' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'In Progress')}
                className="w-full px-3 py-2.5 bg-blue-500 text-white text-sm sm:text-base rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium"
              >
                ▶ Start Werkorder
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'Pending')}
                className="w-full px-3 py-2.5 bg-yellow-500 text-white text-sm sm:text-base rounded-lg hover:bg-yellow-600 active:bg-yellow-700 transition-colors font-medium"
              >
                ⏸ In Wacht Zetten
              </button>
            </>
          )}
          {order.status === 'Pending' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'In Progress')}
              className="w-full px-3 py-2.5 bg-blue-500 text-white text-sm sm:text-base rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium"
            >
              ▶ Start Werkorder
            </button>
          )}
          {order.status === 'In Progress' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'Completed')}
              className="w-full px-3 py-2.5 bg-green-500 text-white text-sm sm:text-base rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors font-medium"
            >
              ✓ Voltooi
            </button>
          )}
          {order.status === 'Completed' && (
            <span className="block text-center px-3 py-2.5 bg-green-100 text-green-800 text-sm sm:text-base rounded-lg font-semibold">
              ✓ Afgerond
            </span>
          )}
        </div>
      )}

      {/* History Viewer - Show timestamps and history */}
      {(order.timestamps || (order.history && order.history.length > 0)) && (
        <HistoryViewer
          history={order.history || []}
          timestamps={order.timestamps}
          getEmployeeName={getEmployeeName}
        />
      )}
    </div>
  );
};
