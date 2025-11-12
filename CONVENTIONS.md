# Code Conventions - Bedrijfsbeheer 2.0

**Quick Reference voor Code Style & Patterns**

Voor volledige details: zie [docs/AI_GUIDE.md](./docs/AI_GUIDE.md)

---

## 📏 File Size Limits

| Type | Max Lines | Waarom |
|------|-----------|---------|
| Component | 300 | Onderhoudbaarheid |
| Hook | 200 | Testbaarheid |
| Service | 250 | Single Responsibility |
| Utility | 150 | Focus & reusability |
| Page | 300 | Alleen orchestratie |

---

## 📝 Naming Conventions

### Components
```typescript
// PascalCase
WorkOrderBoard.tsx
DashboardKPICard.tsx
InventoryManagement.tsx
EmailWorkOrderEditModal.tsx
```

### Functions
```typescript
// camelCase
const handleCreateWorkOrder = () => {};
const fetchInventoryItems = () => {};
const calculateTotalRevenue = () => {};
```

### Constants
```typescript
// UPPERCASE
const MAX_INVENTORY_ITEMS = 1000;
const DEFAULT_WORK_STATUS = 'todo';
const API_TIMEOUT = 5000;
```

### Variables
```typescript
// camelCase
const workOrders = [];
const currentUser = null;
const isLoading = false;
const selectedCustomerId = '';
```

### Barrel Files
```typescript
// index.ts in every directory
index.ts
```

---

## 📁 File Organization

```
features/[module]/
  ├── hooks/          # useModuleHook.ts
  ├── services/       # moduleService.ts
  ├── utils/          # helpers.ts, calculations.ts
  ├── types/          # module.types.ts
  └── index.ts        # Barrel file

components/[module]/
  ├── [feature]/      # FeatureComponent.tsx
  └── index.ts        # Barrel file

pages/
  └── ModulePage.tsx  # Only orchestration
```

---

## 🎯 TypeScript

### Always Use Types
```typescript
// ✅ GOED
interface WorkOrder {
  id: string;
  title: string;
  assignedTo: string;
  status: 'todo' | 'pending' | 'in_progress' | 'completed';
  hours: number;
}

const createWorkOrder = (data: WorkOrder): WorkOrder => {
  return data;
}

// ❌ FOUT
const createWorkOrder = (data: any) => {
  return data;
}
```

### Props Types
```typescript
// ✅ Use 'type' for props
type WorkOrderBoardProps = {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  users: User[];
  currentUser: User | null;
};

// ❌ Avoid 'interface' for props
interface WorkOrderBoardProps {
  // ...
}
```

### No Any Types
```typescript
// ✅ GOED - Explicit type
const handleSubmit = (data: Customer) => {
  // ...
};

// ❌ FOUT - Any type
const handleSubmit = (data: any) => {
  // ...
};
```

---

## 📦 Imports

### Order
```typescript
// 1. External libraries
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal types
import type { WorkOrder, User } from './types';

// 3. Internal components
import { Button } from './components/Button';
import { Modal } from './components/Modal';

// 4. Internal utilities
import { formatDate } from './utils/dateUtils';

// 5. Icons
import { PlusIcon } from './components/icons';
```

### Barrel Files
```typescript
// ✅ GOED - Use barrel files
import { useQuotes } from '@/features/accounting/hooks';
import { QuoteList, QuoteForm } from '@/components/accounting/quotes';

// ❌ FOUT - Direct imports
import { useQuotes } from '@/features/accounting/hooks/useQuotes';
import { QuoteList } from '@/components/accounting/quotes/QuoteList';
```

---

## 🔐 Permission Checks

### Admin Only Actions
```typescript
// ✅ GOED - Permission check
{currentUser?.isAdmin && (
  <button onClick={handleDeleteWorkOrder}>
    Verwijder Werkorder
  </button>
)}

// ✅ GOED - Show disabled for non-admin
<button
  disabled={!currentUser?.isAdmin}
  onClick={handleEditInventory}
  title={!currentUser?.isAdmin ? 'Alleen admins kunnen bewerken' : ''}
>
  Bewerk Item
</button>

// ❌ FOUT - No permission check
<button onClick={handleDeleteWorkOrder}>
  Verwijder Werkorder
</button>
```

### Function Level Checks
```typescript
// ✅ GOED
const handleDelete = (id: string) => {
  if (!currentUser?.isAdmin) {
    alert('Alleen admins kunnen items verwijderen');
    return;
  }
  setItems(prev => prev.filter(item => item.id !== id));
};

// ❌ FOUT - No check
const handleDelete = (id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
};
```

---

## 🔄 State Management

### Immutable Updates
```typescript
// ✅ GOED - Immutable updates
// Add
setWorkOrders(prev => [...prev, newWorkOrder]);

// Update
setWorkOrders(prev => prev.map(wo =>
  wo.id === id
    ? { ...wo, status: 'completed', completedAt: new Date().toISOString() }
    : wo
));

// Delete
setWorkOrders(prev => prev.filter(wo => wo.id !== id));

// ❌ FOUT - Direct mutation
const wo = workOrders.find(w => w.id === id);
wo.status = 'completed'; // NEVER!
```

### Derived State
```typescript
// ✅ GOED - useMemo for derived data
const completedOrders = useMemo(() =>
  workOrders.filter(wo => wo.status === 'completed'),
  [workOrders]
);

const totalRevenue = useMemo(() =>
  invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0),
  [invoices]
);

// ❌ FOUT - Recalculate on every render
const completedOrders = workOrders.filter(wo => wo.status === 'completed');
```

### Timestamps
```typescript
// ✅ GOED - Always add timestamps
setWorkOrders(prev => [...prev, {
  ...newWorkOrder,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}]);

// ❌ FOUT - Missing timestamps
setWorkOrders(prev => [...prev, newWorkOrder]);
```

---

## 🎨 Component Structure

### Functional Components Only
```typescript
// ✅ GOED
type WorkOrderCardProps = {
  workOrder: WorkOrder;
  onUpdate: (id: string, updates: Partial<WorkOrder>) => void;
};

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  workOrder,
  onUpdate
}) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

// ❌ FOUT - Class component
class WorkOrderCard extends React.Component {
  render() {
    return <div>...</div>;
  }
}
```

### Component Documentation
```typescript
/**
 * WorkOrderBoard - Kanban-stijl board voor werkorders
 *
 * Features:
 * - 4 kolommen: To Do, In Wacht, In Uitvoering, Afgerond
 * - Filter per medewerker (admin)
 * - Compacte/uitgebreide weergave toggle
 *
 * Permissions:
 * - Admin: Alle werkorders, kan alles bewerken
 * - User: Alleen eigen werkorders, kan status updaten
 */
type WorkOrderBoardProps = {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  users: User[];
  currentUser: User | null;
};
```

---

## 🧩 Services (Pure Functions)

### Pure Functions Only
```typescript
// ✅ GOED - Pure function
export const calculateQuoteTotals = (quote: Quote): QuoteTotals => {
  const subtotal = quote.items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subtotal * (quote.vatRate / 100);
  const total = subtotal + vatAmount;

  return { subtotal, vatAmount, total };
};

// ❌ FOUT - React hooks in service
export const calculateQuoteTotals = (quote: Quote) => {
  const [total, setTotal] = useState(0); // NO!
  useEffect(() => { /* NO! */ }, []);
  return total;
};
```

### Error Handling
```typescript
// ✅ GOED - Throw errors, don't alert
export const convertQuoteToInvoice = (quote: Quote): Invoice => {
  if (quote.status !== 'approved') {
    throw new Error('Alleen goedgekeurde offertes kunnen worden omgezet');
  }

  // ... conversion logic
  return invoice;
};

// ❌ FOUT - Alert in service
export const convertQuoteToInvoice = (quote: Quote): Invoice => {
  if (quote.status !== 'approved') {
    alert('Fout!'); // NO!
    return null;
  }
};
```

---

## 🎯 Hooks

### Custom Hook Pattern
```typescript
// ✅ GOED - Custom hook structure
export const useQuotes = (
  quotes: Quote[],
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>
) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const createQuote = useCallback((data: Quote) => {
    const id = `Q${Date.now()}`;
    setQuotes(prev => [...prev, { ...data, id }]);
  }, [setQuotes]);

  return {
    showQuoteForm,
    setShowQuoteForm,
    createQuote,
    // ... other methods
  };
};
```

### Hook Size
```typescript
// ✅ GOED - Split large hooks
// useQuotes.ts (150 regels)
// useQuoteForm.ts (120 regels)
// useQuoteValidation.ts (80 regels)

// ❌ FOUT - One massive hook
// useQuotes.ts (500 regels) - Te groot!
```

---

## 🎨 Styling

### Tailwind Classes Only
```typescript
// ✅ GOED - Tailwind classes
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Opslaan
</button>

// ❌ FOUT - Inline styles
<button style={{ backgroundColor: '#3b82f6', padding: '8px 16px' }}>
  Opslaan
</button>
```

### Responsive Design
```typescript
// ✅ GOED - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Use breakpoints: sm, md, lg, xl, 2xl
```

---

## 🇳🇱 Dutch Language

### All UI Text
```typescript
// ✅ GOED
<button>Opslaan</button>
<h1>Werkorders</h1>
<p>Klik om te bewerken</p>

// ❌ FOUT
<button>Save</button>
<h1>Work Orders</h1>
<p>Click to edit</p>
```

### Error Messages
```typescript
// ✅ GOED
alert('Naam en email zijn verplicht');
throw new Error('Alleen admins kunnen klanten verwijderen');

// ❌ FOUT
alert('Name and email are required');
throw new Error('Only admins can delete customers');
```

---

## 📋 Validation

### Form Validation
```typescript
// ✅ GOED - Validate before submit
const handleSubmit = (data: Customer) => {
  // Required fields
  if (!data.name || !data.email) {
    alert('Naam en email zijn verplicht');
    return;
  }

  // Email format
  if (!/\S+@\S+\.\S+/.test(data.email)) {
    alert('Ongeldig email adres');
    return;
  }

  // Duplicate check
  if (customers.some(c => c.email === data.email)) {
    alert('Email adres bestaat al');
    return;
  }

  // Submit
  setCustomers(prev => [...prev, { ...data, id: generateId() }]);
};

// ❌ FOUT - No validation
const handleSubmit = (data: Customer) => {
  setCustomers(prev => [...prev, data]);
};
```

---

## 🔗 Data Synchronization

### Bidirectional Linking
```typescript
// ✅ GOED - Sync both ways
const handleCreateWorkOrderFromQuote = (quote: Quote) => {
  const workOrder: WorkOrder = {
    id: `WO${Date.now()}`,
    quoteId: quote.id, // Link to quote
    // ... other fields
  };

  // Update both states
  setWorkOrders(prev => [...prev, workOrder]);
  setQuotes(prev => prev.map(q =>
    q.id === quote.id
      ? { ...q, workOrderId: workOrder.id } // Link back
      : q
  ));
};

// ❌ FOUT - Only one way
const handleCreateWorkOrderFromQuote = (quote: Quote) => {
  setWorkOrders(prev => [...prev, workOrder]);
  // Missing: Update quote with workOrderId!
};
```

---

## 🧪 Testing

### Manual Testing
```typescript
// Always test both roles:
// 1. Login as Admin (sophie@bedrijf.nl / 1234)
//    - Test: Can create/edit/delete
//    - Test: Can see all data
//
// 2. Login as User (jan@bedrijf.nl / 1234)
//    - Test: Buttons disabled/hidden
//    - Test: Can only see own data
//    - Test: Can update own workorders
```

### Build Testing
```bash
# Always before commit!
npm run build

# Should have:
# ✅ No TypeScript errors
# ✅ No linting errors
# ✅ Build succeeds
```

---

## 📝 Comments

### When to Comment
```typescript
// ✅ GOED - Complex logic explanation
// Calculate average payment days excluding invoices paid on creation date
// This filters out POS sales that are immediately marked as paid
const averagePaymentDays = useMemo(() => {
  const paidInvoices = invoices.filter(inv =>
    inv.status === 'paid' &&
    inv.date !== inv.paidDate // Exclude immediate payments
  );
  // ... calculation
}, [invoices]);

// ❌ FOUT - Obvious comments
// Set the status to completed
setStatus('completed');

// Loop through items
items.forEach(item => { /* ... */ });
```

### Architecture Comments
```typescript
// 📁 ARCHITECTURE: This is a service (pure function, no React)
// 🔒 SECURITY: Admin only - check currentUser.isAdmin before calling
// 📚 DOCS: See docs/AI_GUIDE.md section "Module Interacties"

export const deleteCustomer = (id: string) => {
  // ...
};
```

---

## ✅ Quick Checklist

Voor je commit:

```markdown
- [ ] TypeScript: Geen `any` types
- [ ] Permissions: Admin checks aanwezig
- [ ] State: Immutable updates
- [ ] Imports: Barrel files gebruikt
- [ ] Size: Component < 300 regels
- [ ] Size: Hook < 200 regels
- [ ] Dutch: Alle UI tekst in Nederlands
- [ ] Build: `npm run build` succeeds
- [ ] Test: Beide rollen getest (Admin + User)
```

---

**Voor meer details: zie [docs/AI_GUIDE.md](./docs/AI_GUIDE.md)**
