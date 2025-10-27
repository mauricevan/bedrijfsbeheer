# IMPLEMENTATIE VOLTOOID - README

## ✅ Stap 1: Types bijgewerkt
De volgende velden zijn toegevoegd aan de types:

### Quote interface:
- location?: string
- scheduledDate?: string
- workOrderId?: string

### Invoice interface:
- location?: string
- scheduledDate?: string
- workOrderId?: string

### WorkOrder interface:
- quoteId?: string
- invoiceId?: string
- estimatedHours?: number
- estimatedCost?: number

## ✅ Stap 2: App.tsx aangepast
De Accounting component krijgt nu de benodigde props:
- workOrders
- setWorkOrders
- employees

## 🔧 Stap 3: ACCOUNTING.TSX MOET NOG WORDEN AANGEPAST

Vanwege de bestandsgrootte moet je handmatig de volgende wijzigingen maken in **Accounting.tsx**:

### A. Props Interface Uitbreiden (regel ~8)

Voeg toe aan `interface AccountingProps`:
```typescript
workOrders: WorkOrder[];
setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
employees: Employee[];
```

En aan de destructuring in de component (regel ~16):
```typescript
export const Accounting: React.FC<AccountingProps> = ({ 
  transactions, 
  quotes, 
  setQuotes,
  invoices,
  setInvoices,
  customers,
  inventory,
  workOrders,      // TOEVOEGEN
  setWorkOrders,   // TOEVOEGEN
  employees,       // TOEVOEGEN
  isAdmin 
}) => {
```

### B. Imports Toevoegen (bovenaan)

Voeg toe aan de import:
```typescript
import { Transaction, Quote, QuoteItem, QuoteLabor, Invoice, Customer, InventoryItem, WorkOrder, Employee } from '../types';
```

### C. State voor locatie/scheduledDate toevoegen (regel ~20-30)

Wijzig newQuote state:
```typescript
const [newQuote, setNewQuote] = useState({
  customerId: '',
  items: [] as QuoteItem[],
  labor: [] as QuoteLabor[],
  vatRate: 21,
  notes: '',
  validUntil: '',
  location: '',        // TOEVOEGEN
  scheduledDate: '',   // TOEVOEGEN
});
```

Wijzig newInvoice state:
```typescript
const [newInvoice, setNewInvoice] = useState({
  customerId: '',
  items: [] as QuoteItem[],
  labor: [] as QuoteLabor[],
  vatRate: 21,
  notes: '',
  paymentTerms: '14 dagen',
  issueDate: '',
  dueDate: '',
  location: '',        // TOEVOEGEN
  scheduledDate: '',   // TOEVOEGEN
});
```

### D. Employee Selector Modal State (na bestaande states)

```typescript
const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
const [selectedDocForWO, setSelectedDocForWO] = useState<{ type: 'quote' | 'invoice', id: string } | null>(null);
```

### E. Nieuwe Functies Toevoegen (voor de return statement)

```typescript
// NIEUWE FUNCTIE: Convert Quote to WorkOrder
const convertQuoteToWorkOrder = (quoteId: string, assignedTo: string) => {
  const quote = quotes.find(q => q.id === quoteId);
  if (!quote) return;

  if (quote.status !== 'approved') {
    alert('Alleen geaccepteerde offertes kunnen worden omgezet naar werkorders!');
    return;
  }

  const estimatedHours = quote.labor?.reduce((sum, l) => sum + l.hours, 0) || 0;
  const requiredInventory: { itemId: string; quantity: number }[] = [];
  
  quote.items.forEach(item => {
    if (item.inventoryItemId) {
      requiredInventory.push({
        itemId: item.inventoryItemId,
        quantity: item.quantity
      });
    }
  });

  const customerName = getCustomerName(quote.customerId);
  const itemsList = quote.items.map(i => `- ${i.description} (${i.quantity}x)`).join('\n');
  const laborList = quote.labor ? `\n\nWerkzaamheden:\n${quote.labor.map(l => `- ${l.description} (${l.hours}u)`).join('\n')}` : '';

  const workOrder: WorkOrder = {
    id: `wo${Date.now()}`,
    title: `Werkorder voor ${customerName} (Offerte ${quote.id})`,
    description: `Werkzaamheden op basis van offerte ${quote.id}\n\nItems:\n${itemsList}${laborList}`,
    status: 'To Do',
    assignedTo: assignedTo,
    requiredInventory: requiredInventory,
    createdDate: new Date().toISOString().split('T')[0],
    customerId: quote.customerId,
    location: quote.location,
    scheduledDate: quote.scheduledDate,
    notes: quote.notes,
    quoteId: quote.id,
    estimatedHours: estimatedHours,
    estimatedCost: quote.total,
  };

  setWorkOrders([...workOrders, workOrder]);
  
  // Update quote met workOrderId
  setQuotes(quotes.map(q => 
    q.id === quoteId ? { ...q, workOrderId: workOrder.id } : q
  ));

  alert(`✅ Werkorder ${workOrder.id} succesvol aangemaakt!\n\nToegew ijzen aan: ${employees.find(e => e.id === assignedTo)?.name}`);
};

// NIEUWE FUNCTIE: Convert Invoice to WorkOrder
const convertInvoiceToWorkOrder = (invoiceId: string, assignedTo: string) => {
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  if (!['sent', 'paid'].includes(invoice.status)) {
    alert('Alleen verzonden of betaalde facturen kunnen worden omgezet naar werkorders!');
    return;
  }

  const estimatedHours = invoice.labor?.reduce((sum, l) => sum + l.hours, 0) || 0;
  const requiredInventory: { itemId: string; quantity: number }[] = [];
  
  invoice.items.forEach(item => {
    if (item.inventoryItemId) {
      requiredInventory.push({
        itemId: item.inventoryItemId,
        quantity: item.quantity
      });
    }
  });

  const customerName = getCustomerName(invoice.customerId);
  const itemsList = invoice.items.map(i => `- ${i.description} (${i.quantity}x)`).join('\n');
  const laborList = invoice.labor ? `\n\nWerkzaamheden:\n${invoice.labor.map(l => `- ${l.description} (${l.hours}u)`).join('\n')}` : '';

  const workOrder: WorkOrder = {
    id: `wo${Date.now()}`,
    title: `Werkorder voor ${customerName} (Factuur ${invoice.invoiceNumber})`,
    description: `Werkzaamheden op basis van factuur ${invoice.invoiceNumber}\n\nItems:\n${itemsList}${laborList}`,
    status: 'To Do',
    assignedTo: assignedTo,
    requiredInventory: requiredInventory,
    createdDate: new Date().toISOString().split('T')[0],
    customerId: invoice.customerId,
    location: invoice.location,
    scheduledDate: invoice.scheduledDate,
    notes: invoice.notes,
    invoiceId: invoice.id,
    estimatedHours: estimatedHours,
    estimatedCost: invoice.total,
  };

  setWorkOrders([...workOrders, workOrder]);
  
  // Update invoice met workOrderId
  setInvoices(invoices.map(inv => 
    inv.id === invoiceId ? { ...inv, workOrderId: workOrder.id } : inv
  ));

  alert(`✅ Werkorder ${workOrder.id} succesvol aangemaakt!\n\nToegewezen aan: ${employees.find(e => e.id === assignedTo)?.name}`);
};

// Handler voor employee selectie
const handleEmployeeSelected = (employeeId: string) => {
  if (!selectedDocForWO || !employeeId) return;

  if (selectedDocForWO.type === 'quote') {
    convertQuoteToWorkOrder(selectedDocForWO.id, employeeId);
  } else {
    convertInvoiceToWorkOrder(selectedDocForWO.id, employeeId);
  }

  setShowEmployeeSelector(false);
  setSelectedDocForWO(null);
};

// Handler om employee selector te openen
const openEmployeeSelectorForQuote = (quoteId: string) => {
  setSelectedDocForWO({ type: 'quote', id: quoteId });
  setShowEmployeeSelector(true);
};

const openEmployeeSelectorForInvoice = (invoiceId: string) => {
  setSelectedDocForWO({ type: 'invoice', id: invoiceId });
  setShowEmployeeSelector(true);
};
```

### F. Employee Selector Modal JSX Toevoegen (na alle tabs, voor de laatste </div>)

```tsx
{/* Employee Selector Modal */}
{showEmployeeSelector && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral">Selecteer Medewerker</h3>
        <button
          onClick={() => {
            setShowEmployeeSelector(false);
            setSelectedDocForWO(null);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Selecteer de medewerker die deze werkorder moet uitvoeren:
      </p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {employees.map(emp => (
          <button
            key={emp.id}
            onClick={() => handleEmployeeSelected(emp.id)}
            className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
          >
            <div className="font-medium text-neutral">{emp.name}</div>
            <div className="text-sm text-gray-600">{emp.role}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          setShowEmployeeSelector(false);
          setSelectedDocForWO(null);
        }}
        className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
      >
        Annuleren
      </button>
    </div>
  </div>
)}
```

### G. Locatie/Datum Velden aan Formulieren Toevoegen

In het Quote formulier, NA de bestaande velden (rond regel 900):
```tsx
<input
  type="text"
  value={newQuote.location || ''}
  onChange={(e) => setNewQuote({ ...newQuote, location: e.target.value })}
  placeholder="Locatie (optioneel)"
  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
/>
<input
  type="date"
  value={newQuote.scheduledDate || ''}
  onChange={(e) => setNewQuote({ ...newQuote, scheduledDate: e.target.value })}
  placeholder="Geplande uitvoerdatum"
  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
/>
```

Doe hetzelfde voor Invoice formulier.

### H. Knop in Quote Cards (in de Quotes Grid sectie)

Zoek naar de knoppen in de quote card (rond regel 1200), en voeg toe NA de "Omzetten naar Factuur" knop:

```tsx
{quote.status === 'approved' && !quote.workOrderId && (
  <button
    onClick={() => openEmployeeSelectorForQuote(quote.id)}
    className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 font-semibold"
  >
    🔧 → Werkorder
  </button>
)}
{quote.workOrderId && (
  <div className="w-full p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 font-semibold text-center">
    ✓ Werkorder aangemaakt: {quote.workOrderId}
  </div>
)}
```

### I. Knop in Invoice Cards (in de Invoices Grid sectie)

Doe hetzelfde in de invoice cards:

```tsx
{['sent', 'paid'].includes(invoice.status) && !invoice.workOrderId && (
  <button
    onClick={() => openEmployeeSelectorForInvoice(invoice.id)}
    className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 font-semibold"
  >
    🔧 → Werkorder
  </button>
)}
{invoice.workOrderId && (
  <div className="w-full p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 font-semibold text-center">
    ✓ Werkorder aangemaakt: {invoice.workOrderId}
  </div>
)}
```

### J. HandleCreateQuote aanpassen (rond regel 300)

Voeg toe in de Quote object creatie:
```typescript
const quote: Quote = {
  // ... bestaande velden
  location: newQuote.location || undefined,        // TOEVOEGEN
  scheduledDate: newQuote.scheduledDate || undefined,  // TOEVOEGEN
};

// En reset ook de nieuwe velden:
setNewQuote({
  // ... bestaande velden
  location: '',        // TOEVOEGEN
  scheduledDate: '',   // TOEVOEGEN
});
```

Doe hetzelfde voor handleCreateInvoice.

## 🎯 SAMENVATTING VAN WIJZIGINGEN

1. ✅ Types.ts - VOLTOOID
2. ✅ App.tsx - VOLTOOID  
3. ⚠️ Accounting.tsx - HANDMATIG AANPASSEN (zie instructies hierboven)

## 📝 TEST CHECKLIST

Na implementatie, test het volgende:

- [ ] Offerte aanmaken met locatie en datum
- [ ] Offerte status wijzigen naar 'approved'
- [ ] Knop "🔧 → Werkorder" verschijnt
- [ ] Employee selector modal opent
- [ ] Werkorder wordt aangemaakt met alle juiste gegevens
- [ ] Quote toont "✓ Werkorder aangemaakt"
- [ ] Werkorder verschijnt in WorkOrders pagina
- [ ] Herhaal voor Facturen

## 🔄 WORKFLOW

1. **Offerte maken** → klant accepteert → status 'approved'
2. **Knop** "🔧 → Werkorder" klikken
3. **Medewerker** selecteren in modal
4. **Werkorder** wordt aangemaakt met:
   - Alle items uit offerte
   - Geschatte uren uit labor
   - Locatie en geplande datum
   - Link terug naar offerte
5. Werkorder doorloopt: **To Do → Pending → In Progress → Completed**
6. Na voltooiing: **Factuur** aanmaken indien nodig

Succes met de implementatie! 🚀
