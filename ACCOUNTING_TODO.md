# NIEUW - Account.tsx moet nog handmatig worden aangepast!

Het Accounting.tsx bestand is te groot om automatisch volledig te vervangen. 

Volg de gedetailleerde instructies in: **IMPLEMENTATIE_INSTRUCTIES.md**

Of gebruik de volgende snelle samenvatting:

## Quick Fix - Kopieer en plak onderstaande code bovenaan je Accounting.tsx:

### 1. Imports aanpassen (regel 1-3):
```typescript
import React, { useState } from 'react';
import { Transaction, Quote, QuoteItem, QuoteLabor, Invoice, Customer, InventoryItem, WorkOrder, Employee } from '../types';
```

### 2. Props interface uitbreiden (regel ~8):
```typescript
interface AccountingProps {
  transactions: Transaction[];
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  inventory: InventoryItem[];
  workOrders: WorkOrder[];  // TOEVOEGEN
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;  // TOEVOEGEN
  employees: Employee[];  // TOEVOEGEN
  isAdmin: boolean;
}
```

### 3. Destructuring aanpassen (regel ~14):
```typescript
export const Accounting: React.FC<AccountingProps> = ({ 
  transactions, 
  quotes, 
  setQuotes,
  invoices,
  setInvoices,
  customers,
  inventory,
  workOrders,  // TOEVOEGEN
  setWorkOrders,  // TOEVOEGEN
  employees,  // TOEVOEGEN
  isAdmin 
}) => {
```

### 4. State voor nieuwe velden toevoegen (regel ~35):
```typescript
const [newQuote, setNewQuote] = useState({
  customerId: '',
  items: [] as QuoteItem[],
  labor: [] as QuoteLabor[],
  vatRate: 21,
  notes: '',
  validUntil: '',
  location: '',  // TOEVOEGEN
  scheduledDate: '',  // TOEVOEGEN
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
  location: '',  // TOEVOEGEN
  scheduledDate: '',  // TOEVOEGEN
});

// Employee selector state - TOEVOEGEN
const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
const [selectedDocForWO, setSelectedDocForWO] = useState<{ type: 'quote' | 'invoice', id: string } | null>(null);
```

## Voor de volledige implementatie:

Zie **IMPLEMENTATIE_INSTRUCTIES.md** voor:
- Alle nieuwe functies (convertQuoteToWorkOrder, etc.)
- Employee Selector Modal JSX
- Knop plaatsing in quote/invoice cards
- Locatie en datum velden in formulieren

**Status:**
- ✅ types.ts - VOLTOOID
- ✅ App.tsx - VOLTOOID
- ✅ WorkOrders.tsx - VOLTOOID
- ⚠️ Accounting.tsx - HANDMATIG AANPASSEN NODIG
