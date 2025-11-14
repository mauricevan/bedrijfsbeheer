# ADR-003: No External State Management Library

**Status:** ✅ Accepted
**Datum:** 2024-11-14
**Auteur:** Development Team
**Tags:** state-management, react, simplicity, localStorage

---

## 📋 Context

### Probleem
Het project heeft state management nodig voor:
- **Persistente data** - Klanten, leveranciers, boekhouding, etc. moeten bewaard blijven
- **Cross-component sharing** - Data moet beschikbaar zijn in meerdere pages/components
- **Data synchronisatie** - UI moet reageren op data changes
- **Form state** - Complexe formulieren met validatie

Typische vraag bij React projecten: **Redux? MobX? Zustand? Recoil?**

### Achtergrond
- Bedrijfsbeheer2.0 is een **local-first applicatie** (geen backend server)
- Data wordt opgeslagen in **browser localStorage**
- Team van 2-4 developers (klein team)
- Focus op **snelle development** en **low complexity**
- Geen real-time collaboration of complex state machines
- State is mostly **CRUD operations** op business entities

---

## ✅ Beslissing

### Wat we hebben besloten
**We gebruiken GEEN externe state management library.**

In plaats daarvan:
- **React Context** + **useState** voor global state
- **localStorage** voor data persistence
- **Custom hooks** voor business logic
- **Props drilling** voor component communication (max 2-3 levels)

### Hoe we het implementeren

#### 1. Global State Context
```typescript
// App.tsx
export const App = () => {
  // Global state met localStorage persistence
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', []);
  const [accounting, setAccounting] = useLocalStorage<AccountingEntry[]>('accounting', []);

  return (
    <Router>
      <Routes>
        <Route path="/customers" element={
          <CustomersPage
            customers={customers}
            setCustomers={setCustomers}
          />
        } />
        <Route path="/accounting" element={
          <AccountingPage
            accounting={accounting}
            setAccounting={setAccounting}
          />
        } />
      </Routes>
    </Router>
  );
};
```

#### 2. Custom useLocalStorage Hook
```typescript
// hooks/useLocalStorage.ts
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};
```

#### 3. Feature Hooks for Business Logic
```typescript
// features/accounting/hooks/useAccounting.ts
export const useAccounting = (
  data: AccountingEntry[],
  setData: React.Dispatch<React.SetStateAction<AccountingEntry[]>>
) => {
  const createEntry = useCallback((entry: AccountingEntry) => {
    const newEntry = { ...entry, id: generateId() };
    setData(prev => [...prev, newEntry]);
  }, [setData]);

  const updateEntry = useCallback((id: string, updates: Partial<AccountingEntry>) => {
    setData(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [setData]);

  const deleteEntry = useCallback((id: string) => {
    setData(prev => prev.filter(e => e.id !== id));
  }, [setData]);

  return { createEntry, updateEntry, deleteEntry };
};
```

#### 4. Page Components (Orchestration)
```typescript
// pages/AccountingPage.tsx
type Props = {
  accounting: AccountingEntry[];
  setAccounting: React.Dispatch<React.SetStateAction<AccountingEntry[]>>;
};

export const AccountingPage: React.FC<Props> = ({ accounting, setAccounting }) => {
  const { createEntry, updateEntry, deleteEntry } = useAccounting(accounting, setAccounting);

  return (
    <div>
      <AccountingList
        entries={accounting}
        onUpdate={updateEntry}
        onDelete={deleteEntry}
      />
      <AccountingForm onSubmit={createEntry} />
    </div>
  );
};
```

---

## 📊 Consequenties

### ✅ Voordelen
- **Simplicity** - Geen extra library (0 KB bundle size voor state management)
- **Learning curve** - Team kent al React hooks, geen nieuwe library te leren
- **Debugging** - React DevTools is genoeg, geen extra browser extensions
- **Flexibility** - Geen opinionated patterns, volledige controle
- **Performance** - Geen overhead van library, directe localStorage access
- **Bundle size** - Redux (~12KB), MobX (~16KB), Zustand (~3KB) → **0KB** met native React
- **Type safety** - TypeScript werkt out-of-the-box met useState/Context
- **Migration friendly** - Makkelijk om later naar library te migreren indien nodig

### ⚠️ Nadelen / Trade-offs
- **Props drilling** - Bij 3+ levels nesting wordt het verbose (maar acceptabel voor ons)
- **Boilerplate** - Elke feature hook neemt `data` en `setData` als parameters
- **No DevTools** - Geen time-travel debugging zoals Redux DevTools
- **No middleware** - Geen logging/persistence middleware out-of-the-box
- **Manual optimization** - Moet zelf useCallback/useMemo toepassen
- **LocalStorage limits** - 5-10MB browser limit (maar voldoende voor onze use case)

**Mitigatie:**
- **Props drilling**: Max 2-3 levels, daarna Context gebruiken indien nodig
- **Boilerplate**: Consistente pattern maakt het voorspelbaar
- **DevTools**: Console.log en React DevTools zijn voldoende voor debugging
- **Middleware**: Custom `useLocalStorage` hook abstraheert persistence
- **Optimization**: Code review checklist vereist useCallback voor event handlers
- **Storage limits**: Business app data is typisch <1MB, monitoring indien groei

### 🔄 Impact op Team
- **Developer Experience:** Positief - geen nieuwe library syntaxis te leren
- **Learning Curve:** Minimaal - React hooks kennis is voldoende
- **Onboarding:** Sneller - geen Redux/MobX training nodig
- **Debugging:** Eenvoudig - standard React debugging techniques

### 📈 Impact op Codebase
- **Migration Effort:** N/A - geen migratie nodig, native React
- **Breaking Changes:** Geen
- **Dependencies:** **-3 dependencies** (Redux, React-Redux, Redux-Toolkit NIET nodig)
- **Bundle Size:** **-40KB** (Redux ecosystem overhead vermeden)
- **Test Complexity:** Lager - geen mocking van Redux store nodig

---

## 🔍 Alternatieven Overwogen

### Alternatief 1: Redux Toolkit
**Beschrijving:**
```typescript
// Redux store setup
const store = configureStore({
  reducer: {
    customers: customersReducer,
    suppliers: suppliersReducer,
    accounting: accountingReducer,
  },
});

// Slice example
const accountingSlice = createSlice({
  name: 'accounting',
  initialState: [],
  reducers: {
    addEntry: (state, action) => {
      state.push(action.payload);
    },
  },
});

// Component usage
const AccountingPage = () => {
  const entries = useSelector(state => state.accounting);
  const dispatch = useDispatch();

  const handleAdd = (entry) => {
    dispatch(accountingSlice.actions.addEntry(entry));
  };
};
```

**Waarom niet gekozen:**
- **Overkill** - Redux is designed voor large-scale apps met complex state flows
- **Learning curve** - Team zou reducers, actions, selectors moeten leren
- **Boilerplate** - Meer code nodig voor simpele CRUD operations
- **Bundle size** - ~40KB extra (Redux + React-Redux + Redux Toolkit)
- **localStorage integratie** - Redux-persist library nodig (extra dependency)
- **Complexity mismatch** - Ons probleem is simpel (localStorage CRUD), Redux is voor complexe state machines

**Wanneer wel geschikt:**
- Large apps (50+ components)
- Complex state dependencies (action A affects state B, C, D)
- Time-travel debugging vereist
- Real-time collaboration features
- Complex async workflows (sagas/thunks)

### Alternatief 2: Zustand
**Beschrijving:**
```typescript
// Store definition
const useStore = create((set) => ({
  accounting: [],
  addEntry: (entry) => set((state) => ({
    accounting: [...state.accounting, entry]
  })),
}));

// Component usage
const AccountingPage = () => {
  const { accounting, addEntry } = useStore();
  return <div>{/* ... */}</div>;
};
```

**Waarom niet gekozen:**
- **Not needed yet** - Native React is voldoende voor huidige complexity
- **Migration risk** - Als we later migreren, is Zustand goed alternatief (klein, simpel)
- **Learning investment** - Liever focussen op business logic dan library specifics
- **localStorage** - Zou middleware nodig hebben voor persistence

**Wanneer wel geschikt:**
- **Als we groeien** - Zustand is excellent upgrade path vanuit native React
- Props drilling wordt probleem (>4 levels)
- Need for global state zonder Context re-render issues
- Kleine bundle size vereist maar wel global state management

### Alternatief 3: MobX
**Beschrijving:**
```typescript
class AccountingStore {
  @observable accounting = [];

  @action addEntry(entry) {
    this.accounting.push(entry);
  }
}

const store = new AccountingStore();

const AccountingPage = observer(() => {
  return <div>{store.accounting.length}</div>;
});
```

**Waarom niet gekozen:**
- **OOP paradigm** - React hooks zijn functioneel, MobX is OOP (mismatch)
- **Decorators** - Vereist Babel config voor `@observable` syntax
- **Magic** - Automatic reactivity is powerful maar moeilijk te debuggen
- **Learning curve** - Steile curve voor team zonder OOP achtergrond

**Wanneer wel geschikt:**
- Team met OOP achtergrond (Java, C#)
- Complex state graphs (nested objects, circular references)
- Performance critical apps (MobX is zeer snel)

### Alternatief 4: React Context + useReducer
**Beschrijving:**
```typescript
const AccountingContext = createContext();

const accountingReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ENTRY':
      return [...state, action.payload];
    default:
      return state;
  }
};

const AccountingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(accountingReducer, []);
  return (
    <AccountingContext.Provider value={{ state, dispatch }}>
      {children}
    </AccountingContext.Provider>
  );
};
```

**Waarom niet gekozen:**
- **Boilerplate** - Meer code dan useState (reducers, action types, dispatch)
- **Complexity** - useReducer is voor complex state, onze state is simpel CRUD
- **Props drilling avoided** - Maar we hebben geen problems met max 2-3 level drilling
- **Context re-renders** - Zou alle consumers re-renderen bij elke state change

**Wanneer wel geschikt:**
- Complex state transitions (state machines)
- Multiple sub-values in state object
- Deep component trees (>4 levels)

---

## 📚 Referenties

### Gerelateerde ADRs
- [ADR-001: Feature-Based Architecture](./001-feature-based-architecture.md) - Custom hooks per feature
- [ADR-002: Accounting Module Refactoring](./002-accounting-module-refactoring.md) - Hook patterns

### Externe Resources
- [React Hooks Documentation](https://react.dev/reference/react)
- [You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
- [React State Management in 2024](https://react.dev/learn/managing-state)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Interne Documentatie
- [useLocalStorage Hook](../../01-getting-started/custom-hooks.md#uselocalstorage)
- [State Management Patterns](../state-management-patterns.md)
- [Feature Hooks Guide](../../03-features/README.md#hooks)

---

## 📝 Change Log

| Datum | Wijziging | Auteur |
|-------|-----------|--------|
| 2024-11-14 | ADR created (status: Accepted) | Development Team |
| 2024-11-14 | useLocalStorage hook implemented | Development Team |

---

## ✅ Implementatie Status

### Completed ✅
- [x] `useLocalStorage` custom hook
- [x] All features use pattern: `(data, setData) => { ... }`
- [x] localStorage persistence voor customers, suppliers, accounting
- [x] Type-safe state management met TypeScript
- [x] Props drilling limited to max 2-3 levels

### Metrics
| Metric | Value | Target |
|--------|-------|--------|
| Bundle size (state mgmt) | 0 KB | < 5 KB ✅ |
| Dependencies (state mgmt) | 0 | < 2 ✅ |
| Props drilling depth | Max 2 levels | < 3 ✅ |
| Type safety | 100% | 100% ✅ |
| LocalStorage usage | ~500 KB | < 5 MB ✅ |

### Migration Path (indien nodig)
Als project groeit en native React niet meer voldoende is:

**Signalen dat migratie nodig is:**
- Props drilling >4 levels consistent
- Performance problemen door re-renders
- Complex state machines (bijv. multi-step wizards met branching)
- Need for time-travel debugging
- Team groeit naar 10+ developers

**Aanbevolen migratie pad:**
1. **Small growth** → Zustand (easiest migration, minimal refactoring)
2. **Medium growth** → Redux Toolkit (if complex async needed)
3. **Large scale** → Evaluate latest React patterns (React Server Components, etc.)

**Current status:** Native React is sufficient ✅

---

## 🎯 Key Takeaways

1. **YAGNI** (You Aren't Gonna Need It) - Don't add libraries until you need them
2. **Simplicity** - Simple solutions are easier to understand and maintain
3. **React is enough** - Modern React hooks handle 80% of state management needs
4. **LocalStorage + useState** - Perfect for local-first CRUD applications
5. **Easy upgrade path** - Can migrate to Zustand/Redux later if needed

---

**Laatste review:** 14 november 2024
**Next review:** Na 6 maanden of bij team size groei naar 5+ developers
**Success criteria:** ✅ No state management complaints, props drilling < 3 levels, 0KB overhead
