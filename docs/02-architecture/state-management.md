# State Management

## Overzicht

Het Bedrijfsbeheer Dashboard gebruikt een gecentraliseerde state management benadering met React Hooks en lifting state up pattern. Deze aanpak biedt simpliciteit en flexibiliteit voor de huidige schaal van de applicatie, met mogelijkheid tot uitbreiding naar meer geavanceerde oplossingen zoals Redux of Zustand wanneer nodig.

---

## Huidige State Management Architectuur

### React Hooks Benadering

Het systeem gebruikt voornamelijk React's ingebouwde state management capabilities:

```typescript
// Voorbeeld van state declarations in App.tsx
const [currentUser, setCurrentUser] = useState<User | null>(null);
const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
const [customers, setCustomers] = useState<Customer[]>([]);
const [quotes, setQuotes] = useState<Quote[]>([]);
const [invoices, setInvoices] = useState<Invoice[]>([]);
const [notifications, setNotifications] = useState<Notification[]>([]);
```

### Core Hooks Gebruikt

#### **useState** - Component State Management

Gebruikt voor alle state die verandert over tijd:

```typescript
// Lokale component state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormData>({});
const [selectedItems, setSelectedItems] = useState<string[]>([]);

// Global application state (in App.tsx)
const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventory);
```

**Voordelen:**
- Eenvoudig te begrijpen
- Type-safe met TypeScript
- Geen extra dependencies
- React's optimalisaties inbegrepen

#### **useMemo** - Performance Optimalisatie

Gebruikt voor zware berekeningen en gefilterde data:

```typescript
// Gefilterde en gesorteerde data
const filteredWorkOrders = useMemo(() => {
  return workOrders
    .filter(order => order.status === currentFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}, [workOrders, currentFilter]);

// Statistieken berekeningen
const totalRevenue = useMemo(() => {
  return invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
}, [invoices]);

// Categorieën filtering
const filteredInventory = useMemo(() => {
  if (!categoryFilter) return inventoryItems;
  return inventoryItems.filter(item => item.category === categoryFilter);
}, [inventoryItems, categoryFilter]);
```

**Voordelen:**
- Voorkomt onnodige herberekeningen
- Verbetert performance bij grote datasets
- Dependency tracking voorkomt bugs

#### **useEffect** - Side Effects Management

Gebruikt voor side effects zoals data laden, synchronisatie en cleanup:

```typescript
// Data initialisatie
useEffect(() => {
  setInventoryItems(mockInventory);
  setWorkOrders(mockWorkOrders);
  setCustomers(mockCustomers);
}, []);

// Synchronisatie tussen gekoppelde data
useEffect(() => {
  // Update werkorder status wanneer gerelateerde offerte wijzigt
  if (quotes.length > 0) {
    syncWorkOrdersWithQuotes();
  }
}, [quotes]);

// Notificaties cleanup
useEffect(() => {
  const timer = setTimeout(() => {
    clearOldNotifications();
  }, 5000);

  return () => clearTimeout(timer);
}, [notifications]);
```

**Use Cases:**
- Data loading bij mount
- Synchronisatie tussen state
- Timers en intervals
- Event listeners
- Cleanup functies

---

## Centralized State in App Component

### Waarom Centralized State?

De applicatie gebruikt een centrale state in `App.tsx` voor:

1. **Eenvoud** - Alle data op één plek
2. **Consistentie** - Single source of truth
3. **Type Safety** - TypeScript interfaces voor alle state
4. **Debug Friendly** - Makkelijk te inspecteren in React DevTools

### Global State Structure

```typescript
// App.tsx - Global State
interface AppState {
  // Authentication
  currentUser: User | null;
  isLoggedIn: boolean;

  // Core Data
  inventoryItems: InventoryItem[];
  customers: Customer[];
  workOrders: WorkOrder[];
  quotes: Quote[];
  invoices: Invoice[];
  employees: Employee[];

  // UI State
  notifications: Notification[];
  enabledModules: Module[];
  sidebarOpen: boolean;

  // Filters & Search
  categoryFilter: string;
  categorySearchTerm: string;
  facturenPeriodFilter: string;
  facturenCustomerFilter: string;

  // Dropdown States
  showCategoryDropdown: boolean;
}
```

---

## Props Drilling Pattern

### Data Flow Architecture

Data stroomt van boven naar beneden via props:

```
App.tsx (Global State)
    ↓
Pages (Module Components)
    ↓
Child Components
    ↓
UI Elements
```

### Voorbeeld Data Flow

```typescript
// App.tsx - State & Handlers
const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

const addInventoryItem = (item: InventoryItem) => {
  setInventoryItems(prev => [...prev, item]);
};

// Doorgeven aan Inventory page
<Inventory
  items={inventoryItems}
  onAddItem={addInventoryItem}
/>

// Inventory.tsx - Ontvangt props
interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onAddItem }) => {
  // Gebruik items en handlers
  return <InventoryList items={items} onAdd={onAddItem} />;
};
```

### Voordelen van Props Drilling

- **Expliciete data flow** - Gemakkelijk te volgen waar data vandaan komt
- **Type safety** - TypeScript checkt alle prop types
- **Geen magic** - Geen hidden dependencies
- **Debugging** - Makkelijk te traceren in component tree

### Nadelen (bij Schaling)

- Verbosity bij diep geneste componenten
- Herhaalde prop declarations
- Moeilijker refactoring bij structuur wijzigingen

---

## State Management Patterns

### 1. Lifting State Up

Wanneer meerdere componenten dezelfde state nodig hebben:

```typescript
// ❌ SLECHT - State in beide components
const ComponentA = () => {
  const [sharedData, setSharedData] = useState([]);
  // ...
};

const ComponentB = () => {
  const [sharedData, setSharedData] = useState([]);
  // ...
};

// ✅ GOED - State in parent component
const ParentComponent = () => {
  const [sharedData, setSharedData] = useState([]);

  return (
    <>
      <ComponentA data={sharedData} />
      <ComponentB data={sharedData} />
    </>
  );
};
```

### 2. Derived State Pattern

Bereken waarden uit bestaande state ipv opslaan:

```typescript
// ❌ SLECHT - Redundante state
const [items, setItems] = useState([]);
const [totalItems, setTotalItems] = useState(0);

useEffect(() => {
  setTotalItems(items.length);
}, [items]);

// ✅ GOED - Berekende waarde
const [items, setItems] = useState([]);
const totalItems = items.length; // Of useMemo voor zware berekeningen
```

### 3. Immutable Updates Pattern

State updates moeten immutable zijn:

```typescript
// ❌ SLECHT - Muteert state direct
const handleUpdate = (id: string, newValue: string) => {
  const item = items.find(i => i.id === id);
  item.value = newValue; // MUTATION!
  setItems(items);
};

// ✅ GOED - Immutable update
const handleUpdate = (id: string, newValue: string) => {
  setItems(items.map(item =>
    item.id === id
      ? { ...item, value: newValue }
      : item
  ));
};
```

### 4. Batch Updates Pattern

Groepeer gerelateerde state updates:

```typescript
// ✅ React batcht automatisch in event handlers
const handleSubmit = () => {
  setLoading(true);
  setError(null);
  setData(newData);
  // Deze updates worden gebatched
};

// Voor async updates, gebruik state updater functie
const handleAsync = async () => {
  const result = await fetchData();
  setData(prevData => [...prevData, result]);
};
```

---

## Module-Specifieke State Management

### Dashboard Module

```typescript
// State voor KPI's en statistieken
const [stats, setStats] = useState({
  totalRevenue: 0,
  activeWorkOrders: 0,
  totalCustomers: 0,
  lowStockItems: 0
});

// Berekende statistics met useMemo
const dashboardStats = useMemo(() => {
  return {
    totalRevenue: calculateRevenue(invoices),
    activeWorkOrders: workOrders.filter(wo => wo.status === 'in_progress').length,
    totalCustomers: customers.length,
    lowStockItems: inventoryItems.filter(item => item.stock < item.minStock).length
  };
}, [invoices, workOrders, customers, inventoryItems]);
```

### Inventory Module

```typescript
// Categorieën state management
const [categoryFilter, setCategoryFilter] = useState<string>('');
const [categorySearchTerm, setCategorySearchTerm] = useState<string>('');
const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);

// Gefilterde items
const filteredItems = useMemo(() => {
  return inventoryItems.filter(item => {
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}, [inventoryItems, categoryFilter, searchTerm]);
```

### Accounting Module

```typescript
// Facturen view state management
const [facturenView, setFacturenView] = useState<'all' | 'draft' | 'sent' | 'paid'>('all');
const [facturenPeriodFilter, setFacturenPeriodFilter] = useState<string>('');
const [facturenCustomerFilter, setFacturenCustomerFilter] = useState<string>('');

// Gefilterde facturen
const filteredInvoices = useMemo(() => {
  return invoices.filter(invoice => {
    const matchesView = facturenView === 'all' || invoice.status === facturenView;
    const matchesPeriod = !facturenPeriodFilter || isInPeriod(invoice.date, facturenPeriodFilter);
    const matchesCustomer = !facturenCustomerFilter || invoice.customerId === facturenCustomerFilter;
    return matchesView && matchesPeriod && matchesCustomer;
  });
}, [invoices, facturenView, facturenPeriodFilter, facturenCustomerFilter]);
```

### WorkOrders Module

```typescript
// Werkorder status synchronisatie
useEffect(() => {
  // Sync werkorder status met gekoppelde offertes
  quotes.forEach(quote => {
    if (quote.workOrderId) {
      const workOrder = workOrders.find(wo => wo.id === quote.workOrderId);
      if (workOrder && workOrder.status !== quote.workOrderStatus) {
        updateQuoteWorkOrderStatus(quote.id, workOrder.status);
      }
    }
  });
}, [workOrders, quotes]);
```

---

## Bidirectionele Synchronisatie

### Offerte ↔ Werkorder ↔ Factuur

Het systeem onderhoudt synchronisatie tussen gekoppelde entiteiten:

```typescript
// Update werkorder wanneer offerte wijzigt
const updateWorkOrderFromQuote = (quoteId: string) => {
  const quote = quotes.find(q => q.id === quoteId);
  if (!quote || !quote.workOrderId) return;

  setWorkOrders(prev => prev.map(wo =>
    wo.id === quote.workOrderId
      ? {
          ...wo,
          materials: quote.items,
          estimatedHours: quote.laborHours
        }
      : wo
  ));
};

// Update offerte status wanneer werkorder wijzigt
const syncQuoteWithWorkOrder = (workOrderId: string) => {
  const workOrder = workOrders.find(wo => wo.id === workOrderId);
  if (!workOrder) return;

  setQuotes(prev => prev.map(quote =>
    quote.workOrderId === workOrderId
      ? {
          ...quote,
          workOrderStatus: workOrder.status
        }
      : quote
  ));
};
```

---

## Context API Ready Architecture

### Voorbereid voor Toekomstige Scaling

De huidige architectuur kan eenvoudig worden gemigreerd naar Context API:

```typescript
// Toekomstige structuur met Context API
interface AppContextType {
  // State
  inventoryItems: InventoryItem[];
  customers: Customer[];
  workOrders: WorkOrder[];

  // Actions
  addInventoryItem: (item: InventoryItem) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  deleteCustomer: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

**Voordelen van Context API:**
- Geen props drilling
- Gegroepeerde gerelateerde state
- Custom hooks voor data access
- Betere code organisatie

---

## Performance Optimalisaties

### Memoization Strategies

```typescript
// 1. Memoize zware berekeningen
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// 2. Memoize gefilterde lijsten
const activeOrders = useMemo(() => {
  return orders.filter(order => order.status === 'active');
}, [orders]);

// 3. Memoize statistieken
const statistics = useMemo(() => {
  return calculateComplexStatistics(data);
}, [data]);
```

### React.memo voor Component Memoization

```typescript
// Voorkom onnodige re-renders van child components
const MemoizedComponent = React.memo(({ data, onUpdate }) => {
  return <div>{/* render logic */}</div>;
});

// Met custom comparison
const MemoizedComponent = React.memo(
  ({ data, onUpdate }) => {
    return <div>{/* render logic */}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

---

## Best Practices

### 1. State Colocation

Houd state zo dicht mogelijk bij waar het gebruikt wordt:

```typescript
// ✅ GOED - Lokale UI state
const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Alleen deze component heeft deze state nodig
};

// ❌ SLECHT - Globale state voor lokale UI
// Vermijd dit tenzij meerdere componenten het nodig hebben
```

### 2. Minimize State

Bewaar alleen essentiële data in state:

```typescript
// ❌ SLECHT - Redundante state
const [users, setUsers] = useState([]);
const [userCount, setUserCount] = useState(0);
const [hasUsers, setHasUsers] = useState(false);

// ✅ GOED - Afgeleide waarden
const [users, setUsers] = useState([]);
const userCount = users.length;
const hasUsers = users.length > 0;
```

### 3. Single Source of Truth

Elke piece of data moet één bron hebben:

```typescript
// ✅ GOED - Eén bron in App.tsx
const [inventoryItems, setInventoryItems] = useState([]);

// ❌ SLECHT - Gedupliceerde state in child
const InventoryPage = ({ items }) => {
  const [localItems, setLocalItems] = useState(items); // DUPLICATION!
};
```

### 4. Type Safety

Gebruik TypeScript voor alle state:

```typescript
// ✅ GOED - Typed state
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<InventoryItem[]>([]);

// ❌ SLECHT - Any types
const [user, setUser] = useState<any>(null);
```

---

## Toekomstige State Management Opties

### Redux Toolkit (Voor Complexe State)

**Overwegen wanneer:**
- Applicatie groeit significant
- Complexe state interdependencies
- Need voor middleware (logging, persistence)
- Time-travel debugging gewenst

### Zustand (Lichtgewicht Alternatief)

**Overwegen wanneer:**
- Simpeler dan Redux
- Minder boilerplate
- Goede TypeScript support
- Performance voordelen

### Jotai (Atomic State Management)

**Overwegen wanneer:**
- Fine-grained reactivity gewenst
- Bottom-up state approach
- Minimale re-renders belangrijk
- Atomic state updates

---

## Gerelateerde Documentatie

- [Technische Stack](./technical-stack.md) - React, TypeScript en andere technologieën
- [Bestandsstructuur](./file-structure.md) - Waar state wordt gedefinieerd
- [Component Development](../04-features/component-development.md) - Component patterns
- [Performance Optimalisatie](../04-features/performance.md) - Performance best practices
