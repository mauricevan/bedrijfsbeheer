# ADR-002: Accounting Module Refactoring

**Status:** ✅ Accepted
**Datum:** 2024-11-14
**Auteur:** Development Team
**Tags:** refactoring, accounting, modularity, best-practices

---

## 📋 Context

### Probleem
De accounting module was de grootste en meest complexe module in het project:
- **665 regels** in één `useAccounting.tsx` hook bestand
- Business logic, UI state, form handling allemaal gemengd
- Moeilijk te testen door tight coupling
- Geen herbruikbare functies (alles in één hook)
- Geen duidelijke separatie tussen data transformatie en state management
- Onmogelijk om accounting logic te gebruiken buiten React context

### Achtergrond
- Accounting is kritische module voor bedrijfsbeheer applicatie
- Bevat complexe berekeningen (balance, totalen, BTW)
- Frequent gewijzigd door nieuwe feature requests
- Meerdere developers werken aan accounting features
- Noodzaak voor unit tests (balans berekeningen moeten kloppen)
- ADR-001 besluit om feature-based structure te adopteren

---

## ✅ Beslissing

### Wat we hebben besloten
Refactor de accounting module naar een **feature-based structure** met volledige separation of concerns:
- **Hooks** - React state management en UI logic
- **Services** - Pure business logic functies (testbaar zonder React)
- **Utils** - Helper functies (validators, formatters, filters)
- **Types** - TypeScript type definitions

### Hoe we het implementeren
```
features/accounting/
├── hooks/
│   ├── useAccounting.ts          # Main CRUD hook (150 regels)
│   ├── useAccountingForm.ts      # Form validation (100 regels)
│   └── index.ts
├── services/
│   ├── accountingService.ts      # Business logic (120 regels)
│   │   - calculateBalance()
│   │   - generateId()
│   │   - transformEntry()
│   └── index.ts
├── utils/
│   ├── validators.ts             # Input validation
│   ├── formatters.ts             # Date/amount formatting
│   ├── filters.ts                # Data filtering/sorting
│   └── index.ts
├── types/
│   ├── accounting.types.ts       # AccountingEntry, Balance, etc.
│   └── index.ts
├── README.md
└── index.ts                      # Main barrel export
```

### Implementatie voorbeeld

**Before (665 lines in one file):**
```typescript
// hooks/useAccounting.tsx (BEFORE)
export const useAccounting = (
  accounting: AccountingEntry[],
  setAccounting: React.Dispatch<React.SetStateAction<AccountingEntry[]>>
) => {
  // State (50 lines)
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<AccountingEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Business logic (200 lines) - MIXED WITH HOOKS!
  const calculateBalance = (entries: AccountingEntry[]) => {
    // Complex calculation logic...
  };

  const validateEntry = (entry: AccountingEntry) => {
    // Validation logic...
  };

  // CRUD operations (200 lines)
  const createEntry = (newEntry: AccountingEntry) => {
    // ...
  };

  // Filtering/sorting (100 lines)
  const filteredEntries = useMemo(() => {
    // ...
  }, [accounting, searchTerm]);

  // UI handlers (115 lines)
  const handleSubmit = () => {
    // ...
  };

  return {
    // 30+ exported items...
  };
};
```

**After (modular structure):**
```typescript
// features/accounting/services/accountingService.ts
export const calculateBalance = (entries: AccountingEntry[]): Balance => {
  const income = entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const expense = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  return { income, expense, balance: income - expense };
};

export const generateId = (): string => {
  return `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// features/accounting/hooks/useAccounting.ts (150 lines)
import { calculateBalance, generateId } from '../services';
import { validateEntry } from '../utils/validators';

export const useAccounting = (
  data: AccountingEntry[],
  setData: React.Dispatch<React.SetStateAction<AccountingEntry[]>>
) => {
  const [showForm, setShowForm] = useState(false);

  const createEntry = useCallback((entry: AccountingEntry) => {
    if (!validateEntry(entry)) return;

    const newEntry = { ...entry, id: generateId() };
    setData(prev => [...prev, newEntry]);
  }, [setData]);

  const balance = useMemo(() => calculateBalance(data), [data]);

  return { createEntry, balance, showForm, setShowForm };
};

// features/accounting/index.ts (barrel export)
export { useAccounting } from './hooks/useAccounting';
export { calculateBalance } from './services/accountingService';
export type { AccountingEntry, Balance } from './types';
```

---

## 📊 Consequenties

### ✅ Voordelen
- **Testbaarheid** - Pure functies kunnen worden getest zonder React (calculateBalance, validateEntry)
- **Leesbaarheid** - Elk bestand heeft één verantwoordelijkheid (<200 regels)
- **Herbruikbaarheid** - Services kunnen worden gebruikt in andere modules of Node.js scripts
- **Type safety** - TypeScript types zijn centraal gedefinieerd
- **Maintainability** - Developers hoeven slechts één laag te wijzigen (hook, service, of util)
- **Performance** - Memoization effectiever door kleinere functies
- **Onboarding** - Nieuwe developers kunnen starten met utils/services zonder hooks te begrijpen
- **Parallel development** - Developers kunnen tegelijk aan hooks, services, en utils werken

### ⚠️ Nadelen / Trade-offs
- **Refactoring time** - 2 dagen werk om 665 regels te splitsen en reorganiseren
- **Import overhead** - Meer imports nodig in consuming components
- **File switching** - Developers moeten tussen meerdere bestanden schakelen
- **Learning curve** - Team moet wennen aan nieuwe structuur

**Mitigatie:**
- Refactoring in kleine commits met duidelijke commit messages
- Barrel exports (`index.ts`) reduceren import statements
- IDE tooling (VS Code) maakt file switching eenvoudig (Ctrl+P)
- Documentatie met voorbeelden (README.md in accounting feature)

### 🔄 Impact op Team
- **Developer Experience:** Sterk verbeterd - elke file heeft één doel
- **Learning Curve:** 1-2 dagen om nieuwe structuur te begrijpen
- **Testing:** Unit tests zijn nu mogelijk voor business logic
- **Code Reviews:** Sneller door kleinere, gefocuste files

### 📈 Impact op Codebase
- **Migration Effort:** 2 dagen voor accounting module (pilot)
- **Breaking Changes:** Import paths wijzigen van `hooks/useAccounting` naar `features/accounting`
- **Backward Compatibility:** Oude imports blijven werken via re-exports tijdens transitie
- **Technical Debt:** Aanzienlijk verminderd - van 665 naar 5x ~120 regels bestanden

---

## 🔍 Alternatieven Overwogen

### Alternatief 1: Alleen Code Split (zonder reorganisatie)
**Beschrijving:**
665 regels bestand splitsen in meerdere kleinere bestanden binnen `hooks/`:
```
hooks/
├── useAccounting.ts          # Main hook
├── useAccountingCRUD.ts      # CRUD operations
├── useAccountingFilters.ts   # Filtering/sorting
└── useAccountingHelpers.ts   # Business logic
```

**Waarom niet gekozen:**
- Business logic (calculateBalance) blijft in hook files, niet testbaar zonder React
- Geen duidelijke separatie tussen pure functies en state management
- Mist opportunity om services te hergebruiken buiten hooks
- Geen type centralisatie

**Wanneer wel geschikt:**
- Zeer kleine modules (<200 regels totaal)
- Geen behoefte aan business logic hergebruik
- Alleen React componenten als consumers

### Alternatief 2: OOP/Class-Based Refactoring
**Beschrijving:**
```typescript
class AccountingService {
  private entries: AccountingEntry[];

  constructor(entries: AccountingEntry[]) {
    this.entries = entries;
  }

  calculateBalance(): Balance {
    // ...
  }

  addEntry(entry: AccountingEntry): void {
    // ...
  }
}
```

**Waarom niet gekozen:**
- React hooks zijn functionele programming paradigma (geen classes)
- Minder idiomatisch in React ecosystem
- Moeilijker te testen (mocking, state mutations)
- React setState werkt met immutable updates, niet met class mutations

**Wanneer wel geschikt:**
- Backend services (Node.js API)
- Complexe state machines
- Legacy codebases met OOP patterns

### Alternatief 3: Status Quo (665 regels bestand)
**Waarom niet gekozen:**
- Onhoudbaar bij verdere groei
- Onmogelijk om business logic te unit testen
- Moeilijk voor nieuwe developers om te begrijpen
- Merge conflicts bij parallelle development
- Geen herbruikbaarheid

---

## 📚 Referenties

### Gerelateerde ADRs
- [ADR-001: Feature-Based Architecture](./001-feature-based-architecture.md) - Foundational decision
- [ADR-003: No State Management Library](./003-no-state-management-library.md) - Waarom custom hooks

### Externe Resources
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
- [Pure Functions](https://en.wikipedia.org/wiki/Pure_function)

### Interne Documentatie
- [Refactoring Plan - FASE 11](../refactoring-plan.md#fase-11-accounting-feature-extractie)
- [Accounting Feature README](../../03-features/accounting/README.md)
- [Testing Strategy](../../05-testing/testing-strategy.md)

---

## 📝 Change Log

| Datum | Wijziging | Auteur |
|-------|-----------|--------|
| 2024-11-14 | ADR created (status: Accepted) | Development Team |
| 2024-11-14 | Refactoring voltooid | Development Team |
| 2024-11-14 | Unit tests toegevoegd voor services | Development Team |

---

## ✅ Implementatie Status

### Completed ✅
- [x] `features/accounting/hooks/` - useAccounting.ts, useAccountingForm.ts
- [x] `features/accounting/services/` - accountingService.ts met calculateBalance, generateId
- [x] `features/accounting/utils/` - validators.ts, formatters.ts, filters.ts
- [x] `features/accounting/types/` - accounting.types.ts met alle interfaces
- [x] Barrel exports (`index.ts`) in alle subdirectories
- [x] Feature README.md met usage examples
- [x] Unit tests voor calculateBalance en validateEntry

### Metrics
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Largest file | 665 lines | 150 lines | **77% reduction** |
| Testable functions | 0 | 8 | **8 new unit tests** |
| Files in module | 1 | 12 | **Better organization** |
| Avg file size | 665 lines | ~100 lines | **85% smaller** |
| Type safety | Partial | Full | **100% typed** |

### Lessons Learned
1. **Start with services** - Pure functions are easiest to extract first
2. **Types before code** - Define interfaces before refactoring
3. **Incremental testing** - Add tests during refactoring, not after
4. **Barrel exports essential** - Make imports cleaner immediately
5. **Document as you go** - README.md helps future refactorings

---

## 🎯 Next Modules to Refactor

Based on success of accounting refactoring:

1. **Customers module** (Priority: HIGH) - Similar complexity
2. **Suppliers module** (Priority: HIGH) - Similar patterns
3. **Inventory module** (Priority: MEDIUM) - Simpler structure
4. **Projects module** (Priority: LOW) - Already relatively clean

---

**Laatste review:** 14 november 2024
**Success criteria:** ✅ All tests passing, file sizes < 200 lines, full type coverage
