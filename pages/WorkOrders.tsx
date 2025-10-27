import React, { useState, useMemo } from 'react';
import { WorkOrder, WorkOrderStatus, Employee, InventoryItem, Customer, User, Quote, Invoice } from '../types';

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
  invoices?: Invoice[];
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
  invoices = [],
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string>(currentUser.employeeId);
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

    // If completing, deduct inventory
    if (status === 'Completed') {
      const order = workOrders.find(o => o.id === id);
      if (order) {
        const updatedInventory = [...inventory];
        order.requiredInventory.forEach(req => {
          const item = updatedInventory.find(i => i.id === req.itemId);
          if (item) {
            item.quantity = Math.max(0, item.quantity - req.quantity);
          }
        });
        setInventory(updatedInventory);
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

  const viewingEmployee = employees.find(e => e.id === viewingUserId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral">
            {isAdmin && viewingUserId === 'all' ? 'Alle Werkorders' : `Workboard - ${viewingEmployee?.name || currentUser.name}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin && viewingUserId === 'all' 
              ? 'Volledig overzicht van alle werkorders' 
              : 'Jouw toegewezen taken en werkzaamheden'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            + Nieuwe Werkorder
          </button>
        )}
      </div>

      {/* User Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              {isAdmin ? 'Bekijk werkorders van:' : 'Bekijk ook:'}
            </label>
            <select
              value={viewingUserId}
              onChange={(e) => setViewingUserId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.todo}</p>
              <p className="text-xs text-gray-600">To Do</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-600">In Wacht</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-gray-600">Bezig</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-600">Afgerond</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.totalHours}u</p>
              <p className="text-xs text-gray-600">Totaal uren</p>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* To Do Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral flex items-center gap-2">
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
                  getEmployeeName={getEmployeeName}
                  getCustomerName={getCustomerName}
                />
              ))}
            {filteredWorkOrders.filter(wo => wo.status === 'To Do').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Geen taken om te starten</p>
            )}
          </div>
        </div>

        {/* Pending Column */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral flex items-center gap-2">
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
              <p className="text-sm text-gray-500 text-center py-8">Geen taken in wacht</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral flex items-center gap-2">
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
              <p className="text-sm text-gray-500 text-center py-8">Geen actieve taken</p>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral flex items-center gap-2">
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
                  getEmployeeName={getEmployeeName}
                  getCustomerName={getCustomerName}
                />
              ))}
            {filteredWorkOrders.filter(wo => wo.status === 'Completed').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Geen afgeronde taken</p>
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
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-300 hover:shadow-lg transition-shadow">
      {/* Index Badge */}
      {order.sortIndex !== undefined && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-primary rounded">
            #{order.sortIndex}
          </span>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-neutral flex-1">{order.title}</h4>
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
        <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-semibold text-purple-800">
              {order.quoteId ? `Gebaseerd op offerte ${order.quoteId}` : `Gebaseerd op factuur ${order.invoiceId}`}
            </span>
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
                className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                ▶ Start Werkorder
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'Pending')}
                className="w-full px-3 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
              >
                ⏸ In Wacht Zetten
              </button>
            </>
          )}
          {order.status === 'Pending' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'In Progress')}
              className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              ▶ Start Werkorder
            </button>
          )}
          {order.status === 'In Progress' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'Completed')}
              className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
            >
              ✓ Voltooi
            </button>
          )}
          {order.status === 'Completed' && (
            <span className="block text-center px-3 py-2 bg-green-100 text-green-800 text-sm rounded font-semibold">
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
