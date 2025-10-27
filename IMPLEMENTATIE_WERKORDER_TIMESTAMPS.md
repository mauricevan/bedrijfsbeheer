# Implementatie Instructies: Werkorder Timestamps & User Toewijzing

## Overzicht
Deze implementatie voegt volledige timestamp tracking en user toewijzing toe aan het werkorder systeem.

## ✅ STAP 1: Types Uitgebreid (KLAAR)
De types.ts is al bijgewerkt met:
- `WorkOrderHistoryEntry` interface voor audit trail
- `timestamps` object in `WorkOrder` voor tracking
- `history` array voor audit trail
- `assignedBy` en `convertedBy` velden

## 🔧 STAP 2: Accounting.tsx Aanpassen

### A. Nieuwe State Toevoegen (bovenaan component)
```typescript
// NEW: User selection modal state
const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
const [conversionData, setConversionData] = useState<{
  type: 'quote' | 'invoice';
  sourceId: string;
  data: any;
} | null>(null);
const [selectedUserId, setSelectedUserId] = useState('');
```

### B. Helper Function Toevoegen
```typescript
// Helper function to create history entry
const createHistoryEntry = (
  action: WorkOrderHistoryEntry['action'],
  details: string,
  extra?: Partial<WorkOrderHistoryEntry>
): WorkOrderHistoryEntry => {
  return {
    timestamp: new Date().toISOString(),
    action,
    performedBy: currentUser.employeeId,
    details,
    ...extra
  };
};
```

### C. Update convertQuoteToWorkOrder Function
Vervang de bestaande functie met:

```typescript
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

  // Check materiaal voorraad (existing code stays)
  for (const item of quote.items) {
    if (item.inventoryItemId) {
      const inventoryItem = inventory.find(i => i.id === item.inventoryItemId);
      if (inventoryItem && inventoryItem.quantity < item.quantity) {
        const confirmCreate = confirm(`Waarschuwing: Niet genoeg voorraad van ${inventoryItem.name}...`);
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
```

### D. Voeg Nieuwe Functies Toe
```typescript
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

// Execute the actual conversion after user is selected
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
      createHistoryEntry('created', `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`),
      createHistoryEntry('converted', `Geconverteerd van offerte ${quote.id} door ${getEmployeeName(currentUser.employeeId)}`),
      createHistoryEntry('assigned', `Toegewezen aan ${getEmployeeName(userId)} door ${getEmployeeName(currentUser.employeeId)}`, {
        toAssignee: userId
      })
    ]
  };

  setWorkOrders([...workOrders, workOrder]);
  
  // Update quote met workOrderId
  setQuotes(quotes.map(q => 
    q.id === quoteId ? { ...q, workOrderId: workOrder.id } : q
  ));

  alert(`✅ Werkorder ${workOrder.id} succesvol aangemaakt en toegewezen aan ${getEmployeeName(userId)}!`);
};

// Same for Invoice - duplicate the pattern above
const executeInvoiceToWorkOrderConversion = (invoiceId: string, userId: string, data: any) => {
  // Similar implementation as above but for invoice
  // Replace quote references with invoice references
};
```

### E. Voeg User Selection Modal Toe (in JSX return, voor de Tabs)
```typescript
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
```

### F. Update convertInvoiceToWorkOrder (Similar Pattern)
Apply the same pattern as quotes but for invoices.

## 🔧 STAP 3: WorkOrders.tsx Aanpassen

### A. Update handleAddOrder Function
Voeg timestamps en history toe:

```typescript
const handleAddOrder = () => {
  if (!newOrder.title || !newOrder.assignedTo) {
    alert('Vul alle verplichte velden in!');
    return;
  }

  // Existing validation code...

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
  // Rest of existing code...
};
```

### B. Update updateStatus Function
Track statuswijzigingen:

```typescript
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
      
      // Clear pendingReason if moving away from Pending
      if (status !== 'Pending') {
        updates.pendingReason = undefined;
      }
      
      return { ...order, ...updates };
    }
    return order;
  }));

  // Rest of existing inventory deduction code...
};
```

### C. Update handleSaveEdit Function
Track toewijzing wijzigingen:

```typescript
const handleSaveEdit = () => {
  if (!editingOrder || !editingOrder.title || !editingOrder.assignedTo) {
    alert('Vul alle verplichte velden in!');
    return;
  }

  // Existing validation...

  const now = new Date().toISOString();
  const oldOrder = workOrders.find(wo => wo.id === editingOrder.id);
  
  let updatedOrder = { ...editingOrder };
  
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

  setWorkOrders(workOrders.map(order =>
    order.id === updatedOrder.id ? updatedOrder : order
  ));
  setEditingOrder(null);
};
```

### D. Add History Viewer Component (Optional maar aanbevolen)
Voeg dit toe als aparte component in WorkOrders.tsx:

```typescript
// NEW: History viewer component
interface HistoryViewerProps {
  history: WorkOrderHistoryEntry[];
  employees: Employee[];
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ history, employees }) => {
  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Onbekend';
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '🆕';
      case 'converted': return '🔄';
      case 'assigned': return '👤';
      case 'status_changed': return '📊';
      case 'completed': return '✅';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Geschiedenis
      </h4>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {history.map((entry, index) => (
          <div key={index} className="flex gap-3 text-xs border-l-2 border-blue-300 pl-3 py-1">
            <span className="text-lg">{getActionIcon(entry.action)}</span>
            <div className="flex-1">
              <p className="text-gray-700">{entry.details}</p>
              <p className="text-gray-500 text-xs mt-1">
                {formatTimestamp(entry.timestamp)} • {getEmployeeName(entry.performedBy)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### E. Use History Viewer in Edit Modal
In het edit modal, voeg toe na de notities sectie:

```typescript
{editingOrder.history && editingOrder.history.length > 0 && (
  <div className="border-t pt-4">
    <HistoryViewer history={editingOrder.history} employees={employees} />
  </div>
)}
```

## 🔧 STAP 4: Update Mock Data (mockData.ts)

Update bestaande werkorders om timestamps en history te hebben:

```typescript
export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1',
    title: 'Frame Assemblage',
    // ... existing fields ...
    timestamps: {
      created: '2024-09-28T09:00:00Z',
      assigned: '2024-09-28T09:05:00Z',
      started: '2024-09-29T08:00:00Z'
    },
    assignedBy: 'e4',
    history: [
      {
        timestamp: '2024-09-28T09:00:00Z',
        action: 'created',
        performedBy: 'e4',
        details: 'Werkorder aangemaakt door Sophie van Dam'
      },
      {
        timestamp: '2024-09-28T09:05:00Z',
        action: 'assigned',
        performedBy: 'e4',
        details: 'Toegewezen aan Jan de Vries door Sophie van Dam',
        toAssignee: 'e1'
      },
      {
        timestamp: '2024-09-29T08:00:00Z',
        action: 'status_changed',
        performedBy: 'e1',
        details: 'Status gewijzigd van "To Do" naar "In Progress" door Jan de Vries',
        fromStatus: 'To Do',
        toStatus: 'In Progress'
      }
    ]
  },
  // Update other work orders similarly...
];
```

## ✅ Testing Checklist

Na implementatie, test de volgende scenarios:

1. ✅ Maak nieuwe werkorder aan - check timestamps.created en timestamps.assigned
2. ✅ Converteer offerte naar werkorder - selecteer user, check timestamps.converted
3. ✅ Converteer factuur naar werkorder - selecteer user, check timestamps
4. ✅ Wijzig status naar "In Progress" - check timestamps.started
5. ✅ Wijzig status naar "Completed" - check timestamps.completed
6. ✅ Wijs werkorder opnieuw toe - check history entry
7. ✅ Bekijk geschiedenis in edit modal
8. ✅ Check of alle timestamps correct worden getoond

## 📋 Samenvatting van Wijzigingen

### Files Gewijzigd:
1. ✅ `types.ts` - WorkOrderHistoryEntry en timestamps toegevoegd
2. 🔧 `pages/Accounting.tsx` - User selection modal + timestamp tracking
3. 🔧 `pages/WorkOrders.tsx` - History tracking bij alle acties
4. 🔧 `data/mockData.ts` - Mock data updaten met timestamps

### Nieuwe Functionaliteit:
- ✅ User selectie bij conversie van offerte/factuur
- ✅ Volledige timestamp tracking voor alle events
- ✅ Audit trail met history entries
- ✅ Wie heeft toegewezen/geconverteerd tracking
- ✅ History viewer component

## 🎯 Resultaat
Na deze implementatie heb je:
- **Complete audit trail** van alle werkorder wijzigingen
- **User toewijzing** bij conversie met bevestigingsmodal
- **Timestamps** voor alle belangrijke events (aanmaak, conversie, toewijzing, start, voltooiing)
- **Transparantie** over wie wat wanneer heeft gedaan

Je kunt nu precies zien:
- Wanneer een werkorder is aangemaakt
- Door wie en wanneer geconverteerd van offerte/factuur
- Aan wie en wanneer toegewezen
- Wanneer gestart en voltooid
- Alle statuswijzigingen met tijdstip en uitvoerder
