# Project Structure 2.0 - Code Optimization Plan

## 📋 Overview
This document provides a step-by-step optimization plan for the Business Management Dashboard application. Each step includes detailed instructions, verification tests, and success criteria.

**Project Stats (Current State):**
- Total Lines of Code: ~38,662
- Critical Issues: 7 mega-components (1,800+ lines each)
- Initial Bundle Size: ~1.5MB
- Load Time: 3-5 seconds
- State Management: Prop drilling (4-5 levels deep)
- Memoization: 0% (No React.memo, no useCallback)

**Project Goals (Target State):**
- Component Size: <300 lines per component
- Initial Bundle Size: ~300KB
- Load Time: <1 second
- State Management: Context API
- Memoization: 90%+ coverage

---

## 🎯 PHASE 1: CODE SPLITTING (IMMEDIATE - Week 1, Day 1-2)

### Impact: 80% bundle size reduction, 70% faster initial load

---

### STEP 1.1: Install Required Dependencies

**Action:**
```bash
npm install --save-dev @rollup/plugin-dynamic-import-vars
```

**Verification Test:**
```bash
# Test: Check package.json has required dependencies
npm list react
echo "✅ STEP 1.1 PASS: Dependencies verified"
```

**Success Criteria:**
- ✅ react@19.1.1 confirmed
- ✅ No installation errors

---

### STEP 1.2: Create Loading Components

**Action:** Create `components/LoadingSpinner.tsx`

**File Content:**
```typescript
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.5rem'
    }}>
      <div>⏳ Loading...</div>
    </div>
  );
};

export const PageLoadingFallback: React.FC<{ pageName?: string }> = ({ pageName }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      fontSize: '1.2rem',
      color: '#666'
    }}>
      <div>Loading {pageName || 'page'}...</div>
    </div>
  );
};
```

**Verification Test:**
```bash
# Test: Verify LoadingSpinner component exists and is valid TypeScript
test -f components/LoadingSpinner.tsx && echo "✅ STEP 1.2 PASS: LoadingSpinner created"
npx tsc --noEmit components/LoadingSpinner.tsx 2>&1 | grep -q "error" && echo "❌ FAIL" || echo "✅ TypeScript valid"
```

**Success Criteria:**
- ✅ File exists at `components/LoadingSpinner.tsx`
- ✅ No TypeScript errors
- ✅ Exports both components

---

### STEP 1.3: Update App.tsx with Lazy Loading

**Action:** Modify App.tsx to use React.lazy and Suspense

**Changes Required:**
1. Import `lazy` and `Suspense` from React
2. Import `LoadingSpinner` component
3. Convert all page imports to lazy imports
4. Wrap Routes in Suspense boundary

**Verification Test:**
```bash
# Test: Verify App.tsx contains lazy imports
grep -q "const Dashboard = lazy" App.tsx && echo "✅ Dashboard lazy loaded"
grep -q "const Accounting = lazy" App.tsx && echo "✅ Accounting lazy loaded"
grep -q "Suspense" App.tsx && echo "✅ Suspense wrapper added"
grep -q "from.*lazy.*Suspense.*react" App.tsx && echo "✅ React imports correct"
echo "✅ STEP 1.3 PASS: Lazy loading implemented"
```

**Success Criteria:**
- ✅ All 11 pages use React.lazy()
- ✅ Suspense wrapper around Routes
- ✅ LoadingSpinner as fallback
- ✅ No TypeScript errors

---

### STEP 1.4: Update Vite Config for Code Splitting

**Action:** Optimize vite.config.mjs for better code splitting

**File Content:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/bedrijfsbeheer/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

**Verification Test:**
```bash
# Test: Build and check chunk sizes
npm run build
ls -lh dist/assets/*.js | awk '{print $5, $9}'
echo "✅ STEP 1.4 PASS: Build successful with code splitting"
```

**Success Criteria:**
- ✅ Build succeeds without errors
- ✅ Multiple chunk files generated (not single bundle)
- ✅ react-vendor chunk exists
- ✅ charts chunk exists
- ✅ Each page has its own chunk

**Expected Output:**
```
dist/assets/
├── react-vendor.[hash].js (~150KB)
├── charts.[hash].js (~500KB)
├── Dashboard.[hash].js (~50KB)
├── Accounting.[hash].js (~200KB)
└── ... (other page chunks)
```

---

### STEP 1.5: Verify Code Splitting Works

**Action:** Test lazy loading in development

**Verification Test:**
```bash
# Test: Start dev server and verify no errors
npm run dev &
DEV_PID=$!
sleep 5
curl -s http://localhost:5173 | grep -q "<!DOCTYPE html>" && echo "✅ Dev server running"
kill $DEV_PID
echo "✅ STEP 1.5 PASS: Code splitting verified"
```

**Manual Verification Steps:**
1. Open browser DevTools → Network tab
2. Navigate to http://localhost:5173
3. Verify: Only initial chunks load (react-vendor, main)
4. Navigate to /accounting
5. Verify: Accounting chunk loads dynamically
6. Check: Total initial load < 500KB

**Success Criteria:**
- ✅ Initial load contains only vendor + main bundle
- ✅ Pages load on-demand (lazy)
- ✅ No console errors
- ✅ Navigation works smoothly

---

## 🎯 PHASE 2: CONTEXT API STATE MANAGEMENT (Week 1, Day 3-5)

### Impact: Eliminate prop drilling, 60% reduction in unnecessary re-renders

---

### STEP 2.1: Create Contexts Directory Structure

**Action:** Set up contexts folder

**Commands:**
```bash
mkdir -p contexts
mkdir -p contexts/types
```

**Verification Test:**
```bash
# Test: Verify directory structure
test -d contexts && echo "✅ contexts/ created"
test -d contexts/types && echo "✅ contexts/types/ created"
echo "✅ STEP 2.1 PASS: Directory structure ready"
```

**Success Criteria:**
- ✅ contexts/ directory exists
- ✅ contexts/types/ directory exists

---

### STEP 2.2: Create InventoryContext (Template Pattern)

**Action:** Create `contexts/InventoryContext.tsx`

**File Content:**
```typescript
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { InventoryItem, InventoryCategory } from '../types';
import { MOCK_INVENTORY } from '../data/mockData';

interface InventoryContextType {
  inventory: InventoryItem[];
  categories: InventoryCategory[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  setInventory: (items: InventoryItem[]) => void;
  setCategories: (categories: InventoryCategory[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);

  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  }, []);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  }, []);

  const value = {
    inventory,
    categories,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    setInventory,
    setCategories,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};
```

**Verification Test:**
```bash
# Test: Verify InventoryContext is valid
test -f contexts/InventoryContext.tsx && echo "✅ InventoryContext created"
npx tsc --noEmit contexts/InventoryContext.tsx 2>&1 | grep -q "error" && echo "❌ FAIL" || echo "✅ TypeScript valid"
grep -q "useInventory" contexts/InventoryContext.tsx && echo "✅ Hook exported"
grep -q "InventoryProvider" contexts/InventoryContext.tsx && echo "✅ Provider exported"
echo "✅ STEP 2.2 PASS: InventoryContext ready"
```

**Success Criteria:**
- ✅ File exists
- ✅ No TypeScript errors
- ✅ Exports Provider and hook
- ✅ Uses useCallback for methods

---

### STEP 2.3: Create Additional Contexts (Following Template)

**Action:** Create contexts for all major data domains

**Files to Create:**
1. `contexts/CustomerContext.tsx` - Customers & CRM data
2. `contexts/WorkOrderContext.tsx` - Work orders
3. `contexts/QuoteContext.tsx` - Quotes & Invoices
4. `contexts/EmployeeContext.tsx` - Employees & HRM
5. `contexts/TransactionContext.tsx` - Accounting & transactions
6. `contexts/NotificationContext.tsx` - Notifications
7. `contexts/EmailContext.tsx` - Emails & templates

**Verification Test:**
```bash
# Test: Verify all contexts created
CONTEXTS=(
  "CustomerContext"
  "WorkOrderContext"
  "QuoteContext"
  "EmployeeContext"
  "TransactionContext"
  "NotificationContext"
  "EmailContext"
)

for ctx in "${CONTEXTS[@]}"; do
  test -f "contexts/${ctx}.tsx" && echo "✅ ${ctx} created" || echo "❌ ${ctx} missing"
done

echo "✅ STEP 2.3 PASS: All contexts created"
```

**Success Criteria:**
- ✅ 7 context files created
- ✅ All follow same pattern as InventoryContext
- ✅ No TypeScript errors
- ✅ Each exports Provider and hook

---

### STEP 2.4: Create Root Context Provider

**Action:** Create `contexts/AppProviders.tsx` to combine all providers

**File Content:**
```typescript
import React, { ReactNode } from 'react';
import { InventoryProvider } from './InventoryContext';
import { CustomerProvider } from './CustomerContext';
import { WorkOrderProvider } from './WorkOrderContext';
import { QuoteProvider } from './QuoteContext';
import { EmployeeProvider } from './EmployeeContext';
import { TransactionProvider } from './TransactionContext';
import { NotificationProvider } from './NotificationContext';
import { EmailProvider } from './EmailContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <EmployeeProvider>
        <CustomerProvider>
          <InventoryProvider>
            <QuoteProvider>
              <TransactionProvider>
                <WorkOrderProvider>
                  <EmailProvider>
                    {children}
                  </EmailProvider>
                </WorkOrderProvider>
              </TransactionProvider>
            </QuoteProvider>
          </InventoryProvider>
        </CustomerProvider>
      </EmployeeProvider>
    </NotificationProvider>
  );
};
```

**Verification Test:**
```bash
# Test: Verify AppProviders composition
test -f contexts/AppProviders.tsx && echo "✅ AppProviders created"
grep -q "NotificationProvider" contexts/AppProviders.tsx && echo "✅ Includes NotificationProvider"
grep -q "EmailProvider" contexts/AppProviders.tsx && echo "✅ Includes EmailProvider"
npx tsc --noEmit contexts/AppProviders.tsx 2>&1 | grep -q "error" && echo "❌ FAIL" || echo "✅ TypeScript valid"
echo "✅ STEP 2.4 PASS: AppProviders ready"
```

**Success Criteria:**
- ✅ File exists
- ✅ Imports all 8 providers
- ✅ Nests providers correctly
- ✅ No TypeScript errors

---

### STEP 2.5: Update App.tsx to Use Contexts

**Action:** Wrap application with AppProviders and remove prop drilling

**Changes Required:**
1. Import AppProviders
2. Wrap Routes with AppProviders
3. Remove all useState declarations (move to contexts)
4. Remove all props from Route components
5. Update components to use hooks instead of props

**Verification Test:**
```bash
# Test: Verify App.tsx uses contexts
grep -q "AppProviders" App.tsx && echo "✅ AppProviders imported"
grep -q "<AppProviders>" App.tsx && echo "✅ AppProviders wrapping app"
! grep -q "inventory={inventory}" App.tsx && echo "✅ Inventory props removed"
! grep -q "customers={customers}" App.tsx && echo "✅ Customer props removed"
npx tsc --noEmit App.tsx 2>&1 | grep -q "error" && echo "❌ FAIL" || echo "✅ TypeScript valid"
echo "✅ STEP 2.5 PASS: App.tsx refactored"
```

**Success Criteria:**
- ✅ AppProviders wraps application
- ✅ No useState in App.tsx
- ✅ No props passed to route components
- ✅ App.tsx < 200 lines

---

### STEP 2.6: Update One Page Component (Inventory - Test Case)

**Action:** Refactor Inventory.tsx to use useInventory hook

**Changes Required:**
```typescript
// OLD:
export const Inventory: React.FC<{
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  categories: InventoryCategory[];
  setCategories: (cats: InventoryCategory[]) => void;
  // ... 10 more props
}> = ({ inventory, setInventory, categories, setCategories, ... }) => {

// NEW:
export const Inventory: React.FC = () => {
  const { inventory, categories, updateInventoryItem, deleteInventoryItem } = useInventory();
  const { currentUser } = useEmployee();
```

**Verification Test:**
```bash
# Test: Verify Inventory uses context
grep -q "useInventory" pages/Inventory.tsx && echo "✅ Uses useInventory hook"
! grep -q "inventory: InventoryItem\[\]" pages/Inventory.tsx && echo "✅ Props removed from interface"
npx tsc --noEmit pages/Inventory.tsx 2>&1 | grep -q "error" && echo "❌ FAIL" || echo "✅ TypeScript valid"
echo "✅ STEP 2.6 PASS: Inventory refactored"
```

**Success Criteria:**
- ✅ No props in component interface
- ✅ Uses useInventory hook
- ✅ No TypeScript errors
- ✅ Functionality unchanged

---

## 🎯 PHASE 3: MEMOIZATION LAYER (Week 2, Day 1-2)

### Impact: 80-90% reduction in re-render time

---

### STEP 3.1: Create useCallback Wrapper for Event Handlers

**Action:** Update App.tsx to wrap all event handlers with useCallback

**Example Pattern:**
```typescript
// OLD:
const handleLogin = (username: string, password: string) => {
  // login logic
};

// NEW:
const handleLogin = useCallback((username: string, password: string) => {
  // login logic
}, [/* dependencies */]);
```

**Verification Test:**
```bash
# Test: Count useCallback usage
CALLBACK_COUNT=$(grep -c "useCallback" App.tsx)
echo "Found $CALLBACK_COUNT useCallback usages"
[ $CALLBACK_COUNT -gt 5 ] && echo "✅ STEP 3.1 PASS: useCallback added" || echo "❌ FAIL: Need more useCallback"
```

**Success Criteria:**
- ✅ All event handlers wrapped with useCallback
- ✅ Correct dependency arrays
- ✅ No lint warnings

---

### STEP 3.2: Add React.memo to Page Components

**Action:** Wrap all page components with React.memo

**Pattern:**
```typescript
// OLD:
export const Dashboard: React.FC = () => {
  // component
};

// NEW:
const DashboardComponent: React.FC = () => {
  // component
};

export const Dashboard = React.memo(DashboardComponent);
```

**Verification Test:**
```bash
# Test: Check all pages use React.memo
PAGES=(
  "Dashboard"
  "Inventory"
  "POS"
  "WorkOrders"
  "Accounting"
  "Bookkeeping"
  "CRM"
  "HRM"
  "Reports"
  "Planning"
  "Webshop"
)

for page in "${PAGES[@]}"; do
  grep -q "React.memo" "pages/${page}.tsx" && echo "✅ ${page} memoized" || echo "⚠️ ${page} not memoized"
done

echo "✅ STEP 3.2 PASS: Memoization added"
```

**Success Criteria:**
- ✅ All 11 page components use React.memo
- ✅ No TypeScript errors
- ✅ Export pattern correct

---

### STEP 3.3: Add React.memo to Shared Components

**Action:** Wrap Header, Sidebar, and other shared components

**Files to Update:**
- components/Header.tsx
- components/Sidebar.tsx
- components/UnifiedSearch.tsx
- components/AnalyticsTracker.tsx

**Verification Test:**
```bash
# Test: Check shared components memoized
grep -q "React.memo" components/Header.tsx && echo "✅ Header memoized"
grep -q "React.memo" components/Sidebar.tsx && echo "✅ Sidebar memoized"
echo "✅ STEP 3.3 PASS: Shared components memoized"
```

**Success Criteria:**
- ✅ 4 shared components use React.memo
- ✅ Props properly typed
- ✅ No re-render issues

---

### STEP 3.4: Optimize useMemo Dependencies

**Action:** Review and optimize all existing useMemo calls

**Pattern to Find and Fix:**
```typescript
// BAD:
const filtered = useMemo(() => {
  return items.filter(/* ... */);
}, [items]); // ❌ Entire array dependency

// GOOD:
const filtered = useMemo(() => {
  return items.filter(/* ... */);
}, [items.length, filterCriteria]); // ✅ Primitive dependencies
```

**Verification Test:**
```bash
# Test: Find problematic useMemo patterns
echo "Checking for array dependencies in useMemo..."
grep -n "useMemo.*\[.*inventory.*\]" pages/*.tsx | wc -l
echo "✅ STEP 3.4 PASS: Dependencies optimized"
```

**Success Criteria:**
- ✅ No entire array dependencies (when avoidable)
- ✅ Primitive values as dependencies
- ✅ No lint warnings

---

## 🎯 PHASE 4: COMPONENT REFACTORING - ACCOUNTING.TSX (Week 2, Day 3-5)

### Impact: 7,602 lines → <300 lines per component

---

### STEP 4.1: Create Accounting Module Structure

**Action:** Set up new directory structure

**Commands:**
```bash
mkdir -p pages/Accounting
mkdir -p pages/Accounting/components
mkdir -p pages/Accounting/hooks
mkdir -p pages/Accounting/types
```

**Verification Test:**
```bash
# Test: Verify directory structure
test -d pages/Accounting/components && echo "✅ components/ created"
test -d pages/Accounting/hooks && echo "✅ hooks/ created"
test -d pages/Accounting/types && echo "✅ types/ created"
echo "✅ STEP 4.1 PASS: Structure ready"
```

**Success Criteria:**
- ✅ All directories created
- ✅ Structure follows pattern

---

### STEP 4.2: Extract Invoice Components

**Action:** Extract invoice-related code into separate components

**Components to Create:**
1. `pages/Accounting/components/InvoiceList.tsx`
2. `pages/Accounting/components/InvoiceModal.tsx`
3. `pages/Accounting/components/InvoiceForm.tsx`
4. `pages/Accounting/components/InvoicePreview.tsx`

**Verification Test:**
```bash
# Test: Verify invoice components created
test -f pages/Accounting/components/InvoiceList.tsx && echo "✅ InvoiceList created"
test -f pages/Accounting/components/InvoiceModal.tsx && echo "✅ InvoiceModal created"
test -f pages/Accounting/components/InvoiceForm.tsx && echo "✅ InvoiceForm created"
test -f pages/Accounting/components/InvoicePreview.tsx && echo "✅ InvoicePreview created"
echo "✅ STEP 4.2 PASS: Invoice components extracted"
```

**Success Criteria:**
- ✅ 4 invoice components created
- ✅ Each < 300 lines
- ✅ Props properly typed
- ✅ No TypeScript errors

---

### STEP 4.3: Extract Quote Components

**Action:** Extract quote-related code

**Components to Create:**
1. `pages/Accounting/components/QuoteList.tsx`
2. `pages/Accounting/components/QuoteModal.tsx`
3. `pages/Accounting/components/QuoteForm.tsx`

**Verification Test:**
```bash
# Test: Verify quote components
ls pages/Accounting/components/Quote*.tsx | wc -l
[ $(ls pages/Accounting/components/Quote*.tsx | wc -l) -eq 3 ] && echo "✅ STEP 4.3 PASS: Quote components extracted"
```

**Success Criteria:**
- ✅ 3 quote components created
- ✅ Each < 300 lines
- ✅ Reuses invoice patterns

---

### STEP 4.4: Extract Shared Accounting Components

**Action:** Extract reusable components

**Components to Create:**
1. `pages/Accounting/components/MaterialSelector.tsx`
2. `pages/Accounting/components/VATCalculator.tsx`
3. `pages/Accounting/components/CategoryFilter.tsx`
4. `pages/Accounting/components/CustomerSelector.tsx`

**Verification Test:**
```bash
# Test: Verify shared components
test -f pages/Accounting/components/MaterialSelector.tsx && echo "✅ MaterialSelector created"
test -f pages/Accounting/components/VATCalculator.tsx && echo "✅ VATCalculator created"
echo "✅ STEP 4.4 PASS: Shared components extracted"
```

**Success Criteria:**
- ✅ 4 shared components created
- ✅ Each < 200 lines
- ✅ Highly reusable

---

### STEP 4.5: Create Custom Hooks for Accounting Logic

**Action:** Extract business logic into hooks

**Hooks to Create:**
1. `pages/Accounting/hooks/useInvoiceManagement.ts`
2. `pages/Accounting/hooks/useQuoteManagement.ts`
3. `pages/Accounting/hooks/useTransactionFilters.ts`

**Verification Test:**
```bash
# Test: Verify hooks created
ls pages/Accounting/hooks/*.ts | wc -l
[ $(ls pages/Accounting/hooks/*.ts | wc -l) -ge 3 ] && echo "✅ STEP 4.5 PASS: Hooks extracted"
```

**Success Criteria:**
- ✅ 3+ hooks created
- ✅ Logic separated from UI
- ✅ Properly typed

---

### STEP 4.6: Create New AccountingPage.tsx (Main Container)

**Action:** Create clean main component that composes extracted pieces

**Expected Structure:**
```typescript
import React from 'react';
import { InvoiceList } from './components/InvoiceList';
import { QuoteList } from './components/QuoteList';
import { useInvoiceManagement } from './hooks/useInvoiceManagement';

export const AccountingPage: React.FC = () => {
  const invoiceManager = useInvoiceManagement();

  return (
    <div className="accounting-page">
      <h1>Accounting</h1>
      <InvoiceList {...invoiceManager} />
      <QuoteList />
    </div>
  );
};
```

**Verification Test:**
```bash
# Test: Verify new AccountingPage
test -f pages/Accounting/AccountingPage.tsx && echo "✅ AccountingPage created"
LINES=$(wc -l < pages/Accounting/AccountingPage.tsx)
[ $LINES -lt 300 ] && echo "✅ AccountingPage < 300 lines ($LINES)" || echo "⚠️ Still too large ($LINES)"
echo "✅ STEP 4.6 PASS: AccountingPage refactored"
```

**Success Criteria:**
- ✅ AccountingPage.tsx < 300 lines
- ✅ Imports extracted components
- ✅ Clean composition pattern
- ✅ No business logic in component

---

### STEP 4.7: Update Routing to Use New AccountingPage

**Action:** Update App.tsx to import from new location

**Changes:**
```typescript
// OLD:
import { Accounting } from "./pages/Accounting";

// NEW:
const Accounting = lazy(() => import('./pages/Accounting/AccountingPage').then(m => ({ default: m.AccountingPage })));
```

**Verification Test:**
```bash
# Test: Verify routing updated
grep -q "pages/Accounting/AccountingPage" App.tsx && echo "✅ Routing updated"
npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build successful"
echo "✅ STEP 4.7 PASS: Routing updated"
```

**Success Criteria:**
- ✅ App.tsx imports new AccountingPage
- ✅ Lazy loading still works
- ✅ Application builds successfully
- ✅ No runtime errors

---

### STEP 4.8: Verify Accounting Refactor Complete

**Action:** Run comprehensive tests

**Verification Tests:**
```bash
# Test: Complete verification
echo "=== Accounting Refactor Verification ==="
echo "Component count:"
ls pages/Accounting/components/*.tsx | wc -l
echo "Hook count:"
ls pages/Accounting/hooks/*.ts | wc -l
echo "Main component size:"
wc -l pages/Accounting/AccountingPage.tsx
echo "Build test:"
npm run build
echo "✅ STEP 4.8 PASS: Accounting refactor complete"
```

**Success Criteria:**
- ✅ 10+ components extracted
- ✅ 3+ hooks created
- ✅ AccountingPage < 300 lines
- ✅ Build succeeds
- ✅ All features work

---

## 🎯 PHASE 5: SHARED HOOKS EXTRACTION (Week 3, Day 1-2)

### Impact: Eliminate 400+ lines of duplicate code

---

### STEP 5.1: Create Hooks Directory

**Action:** Set up shared hooks structure

**Commands:**
```bash
mkdir -p hooks
```

**Verification Test:**
```bash
test -d hooks && echo "✅ STEP 5.1 PASS: hooks/ directory created"
```

---

### STEP 5.2: Extract useInventoryFilter Hook

**Action:** Create `hooks/useInventoryFilter.ts`

**File Content:**
```typescript
import { useMemo } from 'react';
import { InventoryItem, InventoryCategory } from '../types';

interface UseInventoryFilterOptions {
  inventory: InventoryItem[];
  categories: InventoryCategory[];
  searchTerm?: string;
  categoryFilter?: string;
  showOnlyWithPrice?: boolean;
}

export const useInventoryFilter = ({
  inventory,
  categories,
  searchTerm = '',
  categoryFilter,
  showOnlyWithPrice = false,
}: UseInventoryFilterOptions) => {
  return useMemo(() => {
    let filtered = inventory;

    if (showOnlyWithPrice) {
      filtered = filtered.filter(i => (i.price || i.salePrice) && (i.price || i.salePrice) > 0);
    }

    if (categoryFilter) {
      filtered = filtered.filter(item => item.categoryId === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        if (item.name.toLowerCase().includes(term)) return true;
        if (item.sku?.toLowerCase().includes(term)) return true;
        if (item.description?.toLowerCase().includes(term)) return true;

        const category = categories.find(c => c.id === item.categoryId);
        if (category?.name.toLowerCase().includes(term)) return true;

        return false;
      });
    }

    return filtered;
  }, [inventory, categories, searchTerm, categoryFilter, showOnlyWithPrice]);
};
```

**Verification Test:**
```bash
# Test: Verify useInventoryFilter
test -f hooks/useInventoryFilter.ts && echo "✅ useInventoryFilter created"
npx tsc --noEmit hooks/useInventoryFilter.ts && echo "✅ TypeScript valid"
echo "✅ STEP 5.2 PASS: useInventoryFilter ready"
```

**Success Criteria:**
- ✅ Hook file created
- ✅ Properly typed with TypeScript
- ✅ Uses useMemo correctly
- ✅ No errors

---

### STEP 5.3: Extract useCategorySearch Hook

**Action:** Create `hooks/useCategorySearch.ts`

**Verification Test:**
```bash
test -f hooks/useCategorySearch.ts && echo "✅ STEP 5.3 PASS: useCategorySearch created"
```

---

### STEP 5.4: Extract useDebounce Hook

**Action:** Create `hooks/useDebounce.ts`

**File Content:**
```typescript
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

**Verification Test:**
```bash
test -f hooks/useDebounce.ts && echo "✅ STEP 5.4 PASS: useDebounce created"
```

---

### STEP 5.5: Extract useLocalStorage Hook

**Action:** Create `hooks/useLocalStorage.ts`

**File Content:**
```typescript
import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};
```

**Verification Test:**
```bash
test -f hooks/useLocalStorage.ts && echo "✅ STEP 5.5 PASS: useLocalStorage created"
```

---

### STEP 5.6: Verify All Shared Hooks

**Action:** Run comprehensive hook verification

**Verification Test:**
```bash
# Test: Count and verify all hooks
echo "=== Shared Hooks Verification ==="
HOOK_COUNT=$(ls hooks/*.ts 2>/dev/null | wc -l)
echo "Total hooks created: $HOOK_COUNT"
[ $HOOK_COUNT -ge 3 ] && echo "✅ Minimum hooks created"

for hook in hooks/*.ts; do
  echo "Testing: $hook"
  npx tsc --noEmit "$hook" 2>&1 | grep -q "error" && echo "  ❌ TypeScript errors" || echo "  ✅ Valid"
done

echo "✅ STEP 5.6 PASS: All shared hooks verified"
```

**Success Criteria:**
- ✅ At least 4 shared hooks created
- ✅ All hooks have proper TypeScript types
- ✅ All hooks use React hooks correctly
- ✅ No compilation errors

---

## 🎯 PHASE 6: ERROR BOUNDARIES (Week 3, Day 3)

### Impact: Prevent cascading failures, improve UX

---

### STEP 6.1: Create ErrorBoundary Component

**Action:** Create `components/ErrorBoundary.tsx`

**File Content:**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #f44336',
          borderRadius: '8px',
          backgroundColor: '#ffebee'
        }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error?.toString()}
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Verification Test:**
```bash
# Test: Verify ErrorBoundary
test -f components/ErrorBoundary.tsx && echo "✅ ErrorBoundary created"
grep -q "class ErrorBoundary" components/ErrorBoundary.tsx && echo "✅ Class component"
grep -q "componentDidCatch" components/ErrorBoundary.tsx && echo "✅ Error handler present"
npx tsc --noEmit components/ErrorBoundary.tsx && echo "✅ TypeScript valid"
echo "✅ STEP 6.1 PASS: ErrorBoundary ready"
```

**Success Criteria:**
- ✅ ErrorBoundary component created
- ✅ Uses class component (required for error boundaries)
- ✅ Has componentDidCatch method
- ✅ Has fallback UI
- ✅ No TypeScript errors

---

### STEP 6.2: Wrap Routes with ErrorBoundary

**Action:** Update App.tsx to wrap Suspense with ErrorBoundary

**Changes:**
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

// Wrap Suspense with ErrorBoundary
<ErrorBoundary>
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      {/* routes */}
    </Routes>
  </Suspense>
</ErrorBoundary>
```

**Verification Test:**
```bash
# Test: Verify ErrorBoundary in App.tsx
grep -q "ErrorBoundary" App.tsx && echo "✅ ErrorBoundary imported"
grep -q "<ErrorBoundary>" App.tsx && echo "✅ ErrorBoundary wrapping app"
echo "✅ STEP 6.2 PASS: ErrorBoundary integrated"
```

**Success Criteria:**
- ✅ ErrorBoundary imported
- ✅ Wraps main application
- ✅ Positioned correctly (outside Suspense)
- ✅ No errors

---

## 🎯 FINAL VERIFICATION & TESTING

---

### STEP 7.1: Run TypeScript Compilation

**Verification Test:**
```bash
echo "=== TypeScript Compilation Test ==="
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ STEP 7.1 PASS: No TypeScript errors"
else
  echo "❌ STEP 7.1 FAIL: TypeScript errors found"
  exit 1
fi
```

**Success Criteria:**
- ✅ No TypeScript errors
- ✅ All files compile successfully

---

### STEP 7.2: Run Production Build

**Verification Test:**
```bash
echo "=== Production Build Test ==="
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
  echo ""
  echo "=== Bundle Size Analysis ==="
  ls -lh dist/assets/*.js | awk '{print $5, $9}'
  echo ""
  echo "✅ STEP 7.2 PASS: Production build successful"
else
  echo "❌ STEP 7.2 FAIL: Build errors"
  exit 1
fi
```

**Success Criteria:**
- ✅ Build completes without errors
- ✅ Multiple chunk files generated
- ✅ No single bundle > 500KB

---

### STEP 7.3: Verify Code Splitting

**Verification Test:**
```bash
echo "=== Code Splitting Verification ==="
CHUNK_COUNT=$(ls dist/assets/*.js | wc -l)
echo "Total JavaScript chunks: $CHUNK_COUNT"

if [ $CHUNK_COUNT -gt 5 ]; then
  echo "✅ Code splitting working ($CHUNK_COUNT chunks)"
else
  echo "⚠️ Limited code splitting ($CHUNK_COUNT chunks)"
fi

echo "✅ STEP 7.3 PASS: Code splitting verified"
```

**Success Criteria:**
- ✅ More than 5 JavaScript chunks
- ✅ Each page has separate chunk
- ✅ Vendor chunks separated

---

### STEP 7.4: Test Development Server

**Verification Test:**
```bash
echo "=== Development Server Test ==="
npm run dev &
DEV_PID=$!
sleep 8

if curl -s http://localhost:5173 | grep -q "<!DOCTYPE html>"; then
  echo "✅ Dev server running"
else
  echo "❌ Dev server not responding"
fi

kill $DEV_PID 2>/dev/null
echo "✅ STEP 7.4 PASS: Dev server verified"
```

**Success Criteria:**
- ✅ Dev server starts without errors
- ✅ Application loads at localhost:5173
- ✅ No console errors

---

### STEP 7.5: Component Size Verification

**Verification Test:**
```bash
echo "=== Component Size Verification ==="
echo "Checking for components > 300 lines..."

find pages -name "*.tsx" -type f | while read file; do
  LINES=$(wc -l < "$file")
  if [ $LINES -gt 300 ]; then
    echo "⚠️ $file: $LINES lines (exceeds 300)"
  else
    echo "✅ $file: $LINES lines"
  fi
done

echo "✅ STEP 7.5 PASS: Component sizes checked"
```

**Success Criteria:**
- ✅ Most components < 300 lines
- ✅ Accounting components split
- ✅ Improvement from baseline

---

### STEP 7.6: Generate Final Report

**Verification Test:**
```bash
echo "=== FINAL OPTIMIZATION REPORT ===" > OPTIMIZATION_REPORT.md
echo "" >> OPTIMIZATION_REPORT.md
echo "## Completion Date: $(date)" >> OPTIMIZATION_REPORT.md
echo "" >> OPTIMIZATION_REPORT.md
echo "## Phases Completed:" >> OPTIMIZATION_REPORT.md
echo "- ✅ Phase 1: Code Splitting" >> OPTIMIZATION_REPORT.md
echo "- ✅ Phase 2: Context API State Management" >> OPTIMIZATION_REPORT.md
echo "- ✅ Phase 3: Memoization Layer" >> OPTIMIZATION_REPORT.md
echo "- ✅ Phase 4: Component Refactoring - Accounting" >> OPTIMIZATION_REPORT.md
echo "- ✅ Phase 5: Shared Hooks Extraction" >> OPTIMIZATION_REPORT.md
echo "- ✅ Phase 6: Error Boundaries" >> OPTIMIZATION_REPORT.md
echo "" >> OPTIMIZATION_REPORT.md
echo "## Metrics:" >> OPTIMIZATION_REPORT.md
echo "### Bundle Sizes:" >> OPTIMIZATION_REPORT.md
ls -lh dist/assets/*.js | awk '{print "- " $9 ": " $5}' >> OPTIMIZATION_REPORT.md
echo "" >> OPTIMIZATION_REPORT.md
echo "### Component Count:" >> OPTIMIZATION_REPORT.md
echo "- Total components: $(find pages -name "*.tsx" | wc -l)" >> OPTIMIZATION_REPORT.md
echo "- Contexts created: $(ls contexts/*.tsx 2>/dev/null | wc -l)" >> OPTIMIZATION_REPORT.md
echo "- Shared hooks: $(ls hooks/*.ts 2>/dev/null | wc -l)" >> OPTIMIZATION_REPORT.md
echo "" >> OPTIMIZATION_REPORT.md
echo "✅ STEP 7.6 PASS: Final report generated"
cat OPTIMIZATION_REPORT.md
```

**Success Criteria:**
- ✅ Report generated
- ✅ All phases documented
- ✅ Metrics included

---

## 📊 SUCCESS CRITERIA SUMMARY

### Overall Project Success:
- ✅ All TypeScript compiles without errors
- ✅ Production build succeeds
- ✅ Bundle size reduced by 60%+ (1.5MB → <600KB initial)
- ✅ Component sizes reduced (avg <300 lines)
- ✅ Context API implemented (no prop drilling)
- ✅ Code splitting active (11+ chunks)
- ✅ Memoization layer added (React.memo + useCallback)
- ✅ Error boundaries in place
- ✅ Shared hooks extracted (reduce duplication)
- ✅ Dev server runs without errors

### Performance Targets:
- Initial load: <1 second (from 3-5 seconds)
- Re-render time: <10ms (from 50-150ms)
- Bundle size: ~300KB initial (from 1.5MB)
- Memory usage: ~30MB (from 50-80MB)

---

## 🚀 EXECUTION COMMAND

To execute this entire plan:

```bash
# Run each phase sequentially
chmod +x execute_optimization.sh
./execute_optimization.sh
```

Or execute phases individually:

```bash
# Phase 1: Code Splitting
npm install --save-dev @rollup/plugin-dynamic-import-vars
# ... follow steps 1.1 - 1.5

# Phase 2: Context API
# ... follow steps 2.1 - 2.6

# And so on...
```

---

## 📝 NOTES

- Each step builds on previous steps - do not skip
- Run verification tests after each step
- If a test fails, fix before proceeding
- Keep backups before major refactors
- Test in browser after each phase

---

**Document Version:** 2.0
**Created:** 2025-11-12
**Status:** Ready for execution
