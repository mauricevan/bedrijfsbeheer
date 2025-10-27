# Complete Audit Trail Implementatie voor Offertes, Facturen & Werkorders

## 📋 Overzicht
Dit document beschrijft de volledige implementatie van een audit trail systeem dat datums, tijden en gebruikers bijhoudt voor alle transacties in offertes, facturen en werkorders.

## ✅ STAP 1: Types.ts - COMPLEET!

De volgende interfaces zijn al toegevoegd:
- `QuoteHistoryEntry` - Audit trail voor offertes
- `InvoiceHistoryEntry` - Audit trail voor facturen  
- `WorkOrderHistoryEntry` - Audit trail voor werkorders (was al aanwezig)

Alle interfaces hebben nu:
- `createdBy` - Wie heeft het aangemaakt
- `history` - Array van alle wijzigingen
- `timestamps` - Object met alle belangrijke datums/tijden

## 🔧 STAP 2: Accounting.tsx Updaten

### A. Props Interface Uitbreiden

Voeg `currentUser` en `employees` toe aan de props:

```typescript
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
  employees: Employee[];          // NIEUW
  currentUser: User;              // NIEUW
  isAdmin: boolean;
}
```

### B. Helper Functions Toevoegen

Voeg deze helper functions toe bovenaan de component (na state declarations):

```typescript
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
```

### C. Update handleCreateQuote Function

Vervang de huidige `handleCreateQuote` met deze versie die timestamps en history toevoegt:

```typescript
const handleCreateQuote = () => {
  if (!newQuote.customerId || newQuote.items.length === 0 || !newQuote.validUntil) {
    alert('Vul alle verplichte velden in (klant, minimaal 1 item, en geldig tot datum)!');
    return;
  }

  const { subtotal, vatAmount, total } = calculateQuoteTotals();
  const now = new Date().toISOString();

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
    
    // NIEUW: Audit trail
    createdBy: currentUser.employeeId,
    timestamps: {
      created: now
    },
    history: [
      createHistoryEntry(
        'quote',
        'created',
        `Offerte aangemaakt door ${getEmployeeName(currentUser.employeeId)} voor klant ${getCustomerName(newQuote.customerId)}`
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
```

### D. Update updateQuoteStatus Function

Vervang de huidige functie met:

```typescript
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
  
  // Rest van de bestaande code voor syncing naar werkorder...
  const quote = quotes.find(q => q.id === quoteId);
  if (quote?.workOrderId && newStatus === 'approved') {
    syncQuoteToWorkOrder(quoteId);
  }
};
```

### E. Update convertQuoteToInvoice Function

```typescript
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
    
    // NIEUW: Audit trail
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
```

### F. Update convertQuoteToWorkOrder Function  

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

  // Check materiaal voorraad (bestaande code blijft)
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
  const now = new Date().toISOString();

  // Vraag om medewerker toewijzing
  const assigneeId = prompt('Voer het medewerker ID in om de werkorder aan toe te wijzen:');
  if (!assigneeId) {
    alert('Werkorder aanmaken geannuleerd - geen medewerker opgegeven.');
    return;
  }

  const assignee = employees.find(e => e.id === assigneeId);
  if (!assignee) {
    alert('Ongeldige medewerker ID!');
    return;
  }

  const workOrder: WorkOrder = {
    id: `wo${Date.now()}`,
    title: `${customerName} - Offerte ${quote.id}`,
    description: quote.notes || `Werkorder aangemaakt vanuit offerte ${quote.id}`,
    status: 'To Do',
    assignedTo: assigneeId,
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
    estimatedHours: totalHours,
    estimatedCost: quote.total,
    notes: `Geschatte uren: ${totalHours}u\nGeschatte kosten: €${quote.total.toFixed(2)}`,
    
    // NIEUW: Timestamps en history
    timestamps: {
      created: now,
      converted: now,
      assigned: now
    },
    history: [
      {
        timestamp: now,
        action: 'created',
        performedBy: currentUser.employeeId,
        details: `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`
      },
      {
        timestamp: now,
        action: 'converted',
        performedBy: currentUser.employeeId,
        details: `Geconverteerd van offerte ${quote.id} door ${getEmployeeName(currentUser.employeeId)}`
      },
      {
        timestamp: now,
        action: 'assigned',
        performedBy: currentUser.employeeId,
        details: `Toegewezen aan ${getEmployeeName(assigneeId)} door ${getEmployeeName(currentUser.employeeId)}`,
        toAssignee: assigneeId
      }
    ]
  };

  setWorkOrders([...workOrders, workOrder]);
  
  // Update quote
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

  alert(`✅ Werkorder ${workOrder.id} succesvol aangemaakt en toegewezen aan ${assignee.name}!`);
};
```

### G. Update handleCreateInvoice Function

```typescript
const handleCreateInvoice = () => {
  if (!newInvoice.customerId || newInvoice.items.length === 0 || !newInvoice.issueDate || !newInvoice.dueDate) {
    alert('Vul alle verplichte velden in!');
    return;
  }

  const { subtotal, vatAmount, total } = calculateInvoiceTotals();
  const now = new Date().toISOString();

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
    
    // NIEUW: Audit trail
    createdBy: currentUser.employeeId,
    timestamps: {
      created: now
    },
    history: [
      createHistoryEntry(
        'invoice',
        'created',
        `Factuur aangemaakt door ${getEmployeeName(currentUser.employeeId)} voor klant ${getCustomerName(newInvoice.customerId)}`
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
```

### H. Update updateInvoiceStatus Function

```typescript
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
```

### I. Update convertInvoiceToWorkOrder Function

Gebruik dezelfde aanpak als `convertQuoteToWorkOrder` maar dan voor facturen.

### J. Voeg History Viewer Component Toe

Voeg deze component toe om historie te tonen:

```typescript
// History viewer component voor offertes en facturen
interface HistoryViewerProps {
  history: (QuoteHistoryEntry | InvoiceHistoryEntry)[];
  employees: Employee[];
  type: 'quote' | 'invoice';
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ history, employees, type }) => {
  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Onbekend';
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '🆕';
      case 'sent': return '📤';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'paid': return '💰';
      case 'converted_to_invoice': return '🧾';
      case 'converted_to_workorder': return '📋';
      case 'updated': return '✏️';
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

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Aangemaakt',
      sent: 'Verzonden',
      approved: 'Geaccepteerd',
      rejected: 'Afgewezen',
      expired: 'Verlopen',
      paid: 'Betaald',
      overdue: 'Verlopen',
      cancelled: 'Geannuleerd',
      converted_to_invoice: 'Geconverteerd naar factuur',
      converted_to_workorder: 'Geconverteerd naar werkorder',
      updated: 'Gewijzigd'
    };
    return labels[action] || action;
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Nog geen geschiedenis beschikbaar
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Geschiedenis ({history.length} {history.length === 1 ? 'actie' : 'acties'})
      </h4>
      
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {history.slice().reverse().map((entry, index) => (
          <div key={index} className="flex gap-3 text-xs border-l-2 border-blue-300 pl-3 py-2 bg-gray-50 rounded-r">
            <span className="text-lg flex-shrink-0">{getActionIcon(entry.action)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-blue-700">
                  {getActionLabel(entry.action)}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
              <p className="text-gray-700 break-words">{entry.details}</p>
              <p className="text-gray-500 mt-1">
                Door: {getEmployeeName(entry.performedBy)}
              </p>
              
              {/* Extra details voor status changes */}
              {entry.fromStatus && entry.toStatus && (
                <div className="mt-1 text-xs">
                  <span className="px-2 py-0.5 bg-gray-200 rounded text-gray-700">
                    {entry.fromStatus}
                  </span>
                  <span className="mx-1">→</span>
                  <span className="px-2 py-0.5 bg-blue-200 rounded text-blue-800">
                    {entry.toStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### K. Integreer History Viewer in UI

Voeg de history viewer toe aan de offerte en factuur cards. Bijvoorbeeld in de offerte card:

```typescript
{/* Voeg dit toe in de offerte card, voor de action buttons */}
{quote.history && quote.history.length > 0 && isAdmin && (
  <div className="border-t pt-4 mb-4">
    <HistoryViewer 
      history={quote.history} 
      employees={employees}
      type="quote"
    />
  </div>
)}
```

En hetzelfde voor facturen:

```typescript
{/* Voeg dit toe in de factuur card, voor de action buttons */}
{invoice.history && invoice.history.length > 0 && isAdmin && (
  <div className="border-t pt-4 mb-4">
    <HistoryViewer 
      history={invoice.history} 
      employees={employees}
      type="invoice"
    />
  </div>
)}
```

## 📊 STAP 3: Timestamps Weergeven in UI

Voeg timestamp informatie toe aan de cards waar relevant:

```typescript
{/* In offerte/factuur card, na de datum info */}
{quote.timestamps && (
  <div className="text-xs text-gray-500 mt-2 space-y-1">
    <div className="flex items-center gap-2">
      <span>🆕 Aangemaakt:</span>
      <span>{new Date(quote.timestamps.created).toLocaleString('nl-NL')}</span>
      {quote.createdBy && <span>door {getEmployeeName(quote.createdBy)}</span>}
    </div>
    {quote.timestamps.sent && (
      <div className="flex items-center gap-2">
        <span>📤 Verzonden:</span>
        <span>{new Date(quote.timestamps.sent).toLocaleString('nl-NL')}</span>
      </div>
    )}
    {quote.timestamps.approved && (
      <div className="flex items-center gap-2">
        <span>✅ Geaccepteerd:</span>
        <span>{new Date(quote.timestamps.approved).toLocaleString('nl-NL')}</span>
      </div>
    )}
  </div>
)}
```

## ✅ Testing Checklist

Na implementatie, test de volgende scenarios:

### Offertes:
1. ✅ Maak nieuwe offerte aan - check `createdBy`, `timestamps.created`, en history
2. ✅ Wijzig status naar "sent" - check `timestamps.sent` en nieuwe history entry
3. ✅ Wijzig status naar "approved" - check `timestamps.approved` en history
4. ✅ Converteer naar factuur - check `timestamps.convertedToInvoice` en history in beide documenten
5. ✅ Converteer naar werkorder - check `timestamps.convertedToWorkOrder` en volledige werkorder audit trail
6. ✅ Bekijk geschiedenis in offerte card

### Facturen:
1. ✅ Maak nieuwe factuur aan - check alle timestamps en history
2. ✅ Verzend factuur - check status change in history
3. ✅ Markeer als betaald - check `paidDate`, `timestamps.paid` en history
4. ✅ Converteer naar werkorder - check conversie timestamps en history
5. ✅ Bekijk geschiedenis in factuur card

### Werkorders:
1. ✅ Check dat werkorders aangemaakt vanuit offertes/facturen de juiste `convertedBy` en timestamps hebben
2. ✅ Controleer dat reassignment wordt gelogd in history
3. ✅ Controleer dat alle statuswijzigingen worden bijgehouden

## 🎯 Resultaat

Na deze implementatie heb je:

### ✨ Complete Transparantie
- **Wie** heeft elk document aangemaakt
- **Wanneer** (exacte datum en tijd) voor elke actie
- **Wat** er is gebeurd (volledige beschrijving)
- **Door wie** elke wijziging is uitgevoerd

### 📋 Volledig Traceerbaar Traject
Je kunt nu exact volgen:
1. Offerte aangemaakt door X op datum/tijd Y
2. Offerte verzonden door X op datum/tijd Y
3. Offerte geaccepteerd door X op datum/tijd Y
4. Geconverteerd naar werkorder door X op datum/tijd Y
5. Werkorder toegewezen aan Y door X op datum/tijd Z
6. Status gewijzigd door Y op datum/tijd Z
7. Werkorder voltooid door Y op datum/tijd Z
8. Eventueel: Factuur aangemaakt op basis van offerte/werkorder

### 🔍 Audit Trail Features
- **Chronologische volgorde** van alle events
- **User attribution** - wie heeft wat gedaan
- **Status transitions** - van/naar status tracking
- **Conversion tracking** - link tussen offertes, facturen en werkorders
- **Visuele timeline** met icons en kleuren

### 💼 Bedrijfsvoordelen
- **Accountability** - iedereen is verantwoordelijk voor hun acties
- **Compliance** - volledig audit trail voor boekhouding
- **Efficiency** - snel inzicht in waar documenten zijn in het proces
- **Quality Control** - identificeer bottlenecks en verbeterpunten
- **Customer Service** - beantwoord klant vragen met exacte informatie

## 📝 Opmerkingen

- De implementatie is **backward compatible** - bestaande documenten zonder history werken gewoon
- History entries worden **automatisch** aangemaakt bij elke relevante actie
- Timestamps gebruiken **ISO 8601 format** voor consistentie
- De UI toont geschiedenis alleen aan admins (configureerbaar)
- Alle wijzigingen zijn **non-destructive** - originele data blijft behouden

## 🚀 Volgende Stappen

Na deze implementatie kun je overwegen:
1. **Export functie** - export audit trail naar Excel/PDF
2. **Filtering** - filter geschiedenis op actie type of gebruiker
3. **Notifications** - email notificaties bij belangrijke events
4. **Dashboard widget** - toon recente activiteit op dashboard
5. **Advanced reporting** - rapporten per gebruiker, tijdsperiode, etc.

---

**Veel succes met de implementatie! Als je vragen hebt, raadpleeg dan deze documentatie of vraag om hulp.** 🎉
