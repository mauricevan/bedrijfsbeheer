# Projectstructuur - Bedrijfsbeheer 2.0

> **Laatst bijgewerkt:** `2025-04-05`
> **Genereerd door:** Cursor AI (refactoring guard)
> **Doel:** Voorkom toekomstige refactoring door strikte structuur.

---

## 🎨 Frontend Structuur (Huidige Implementatie)

```
src/
├── components/           # UI-componenten (geen business logic)
│   ├── common/          # Herbruikbare UI
│   │   ├── modals/      # ConfirmModal, OverviewModal
│   │   ├── forms/       # InventoryItemSelector, LaborInput
│   │   ├── charts/      # LineChart, BarChart
│   │   └── index.ts
│   ├── accounting/      # Accounting-specifieke UI
│   │   ├── dashboard/   # AccountingDashboard, DashboardStats
│   │   ├── quotes/      # QuoteList, QuoteForm, QuoteItemRow
│   │   ├── invoices/    # InvoiceList, InvoiceForm
│   │   ├── transactions/ # TransactionList
│   │   └── index.ts
│   ├── crm/
│   └── index.ts
│
├── features/            # Business logic per domein
│   └── accounting/
│       ├── hooks/       # useQuotes, useInvoices, useQuoteForm
│       │   └── index.ts
│       ├── services/    # quoteService, invoiceService (pure functions)
│       │   └── index.ts
│       ├── utils/       # calculations, formatters, validators
│       │   └── index.ts
│       ├── types/       # accounting.types.ts
│       └── index.ts
│
├── pages/               # Orchestratie (max 300 regels)
│   ├── Accounting.tsx   # Tab-navigatie + component rendering
│   ├── CRM.tsx
│   └── index.ts
│
├── hooks/               # Globale custom hooks
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── index.ts
│
├── utils/               # Algemene helpers
│   ├── analytics.ts
│   ├── email/
│   ├── fileHelpers.ts   # list_directory, pages_directory
│   └── index.ts
│
└── types/               # Globale TypeScript types
    ├── index.ts
    └── global.d.ts
```

**⚠️ HUIDIGE STATUS:**
- ✅ Frontend: Volledig geïmplementeerd
- ❌ Backend: Nog niet geïmplementeerd (data is in-memory)
- ❌ Database: Geen persistentie (data verloren bij refresh)
- ❌ API: Geen REST endpoints

---

## 🔧 Backend Structuur (Voor Toekomstige Implementatie)

```
backend/
├── config/              # Configuratie & setup
│   ├── database.js      # Prisma client instantie
│   ├── env.js           # Environment variabelen validatie
│   ├── security.js      # CORS, Helmet, rate limiting
│   └── logger.js        # Winston logger configuratie
│
├── controllers/         # Request handlers (business logic)
│   ├── authController.js      # Login, register, logout
│   ├── quoteController.js     # CRUD voor offertes
│   ├── invoiceController.js   # CRUD voor facturen
│   ├── workOrderController.js # CRUD voor werkorders
│   ├── customerController.js  # CRUD voor klanten
│   └── inventoryController.js # CRUD voor voorraad
│
├── models/              # Database schema
│   └── schema.prisma    # Prisma schema (PostgreSQL)
│
├── routes/              # API endpoints definitie
│   ├── authRoutes.js         # POST /api/auth/login, /register
│   ├── quoteRoutes.js        # /api/quotes (GET, POST, PUT, DELETE)
│   ├── invoiceRoutes.js      # /api/invoices
│   ├── workOrderRoutes.js    # /api/workorders
│   ├── customerRoutes.js     # /api/customers
│   ├── inventoryRoutes.js    # /api/inventory
│   └── index.js              # Centrale route aggregator
│
├── middleware/          # Express middleware
│   ├── authenticate.js       # JWT verificatie
│   ├── authorize.js          # Role-based access control (isAdmin)
│   ├── errorHandler.js       # Global error handler
│   ├── validateQuote.js      # Joi validation voor quotes
│   ├── validateInvoice.js    # Joi validation voor invoices
│   ├── validateWorkOrder.js  # Joi validation voor workorders
│   └── rateLimiter.js        # Rate limiting per endpoint
│
├── utils/               # Backend helpers
│   ├── jwt.js          # JWT sign & verify functies
│   ├── password.js     # bcrypt hash & compare
│   ├── logger.js       # Winston logger wrapper
│   ├── validators.js   # Custom validation functies
│   └── formatters.js   # Response formatters
│
├── tests/               # Test suites
│   ├── unit/           # Unit tests (controllers, services)
│   │   ├── quoteController.test.js
│   │   ├── invoiceController.test.js
│   │   └── jwt.test.js
│   ├── integration/    # Integration tests (API endpoints)
│   │   ├── quotes.test.js
│   │   ├── invoices.test.js
│   │   └── auth.test.js
│   └── setup.js        # Test setup (DB seeding, fixtures)
│
├── prisma/              # Prisma specifieke bestanden
│   ├── migrations/     # Database migrations
│   └── seed.js         # Database seeding script
│
├── app.js               # Express app setup (routes, middleware)
├── server.js            # Server entry point (listen op poort)
├── .env.example         # Example environment variabelen
└── package.json         # Backend dependencies
```

---

## 📋 Regels per Map

### Frontend Regels

#### `src/components/`
- ✅ **Alleen UI rendering** (geen data fetching)
- ✅ **Props drilling** voor data en callbacks
- ✅ **Max 300 regels** per component
- ✅ **Gebruik React.memo** voor performance
- ❌ **Geen useState** voor data (wel voor UI state zoals open/closed)
- ❌ **Geen API calls** (data komt via props)

#### `src/features/[module]/hooks/`
- ✅ **Business logic** voor module
- ✅ **State management** (useState, useReducer)
- ✅ **Side effects** (useEffect voor data sync)
- ✅ **Max 200 regels** per hook
- ❌ **Geen JSX** (wel return object met functies/state)

#### `src/features/[module]/services/`
- ✅ **Pure functies** alleen
- ✅ **Berekeningen** (calculateTotal, generateId)
- ✅ **Transformaties** (convertQuoteToInvoice)
- ✅ **Max 250 regels** per service
- ❌ **Geen React** (geen hooks, geen JSX)
- ❌ **Geen side effects** (geen API calls)

#### `src/pages/`
- ✅ **Orchestratie** alleen (componenten samenbrengen)
- ✅ **State ophalen** van App.tsx
- ✅ **Props doorgeven** aan child componenten
- ✅ **Max 300 regels**
- ❌ **Geen business logic** (delegeer naar hooks)
- ❌ **Geen complexe berekeningen** (delegeer naar services)

### Backend Regels

#### `backend/controllers/`
- ✅ **Request handling** (extract req.body, req.params)
- ✅ **Authorization checks** (req.user.isAdmin)
- ✅ **Database operations** (Prisma queries)
- ✅ **Response formatting** (res.status().json())
- ✅ **Error handling** (try/catch + next(error))
- ❌ **Geen validatie** (gebeurt in middleware)
- ❌ **Geen direct error response** (gebruik next(error))

**Pattern:**
```javascript
export const createQuote = async (req, res, next) => {
  try {
    // 1. Extract data
    const { customerId, items } = req.body;

    // 2. Authorization (indien niet in middleware)
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Niet toegestaan' });
    }

    // 3. Database operation
    const quote = await prisma.quote.create({
      data: { /* ... */ },
      include: { customer: true }
    });

    // 4. Success response
    res.status(201).json(quote);

  } catch (error) {
    // 5. Pass to error handler
    next(error);
  }
};
```

#### `backend/routes/`
- ✅ **Endpoint definitie** (GET, POST, PUT, DELETE)
- ✅ **Middleware chaining** (authenticate → authorize → validate → controller)
- ✅ **RESTful naming** (/api/quotes/:id)
- ❌ **Geen business logic** (alleen routing)

**Pattern:**
```javascript
import express from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { validateQuote } from '../middleware/validateQuote.js';
import * as quoteController from '../controllers/quoteController.js';

const router = express.Router();

router.get('/quotes', authenticate, quoteController.getQuotes);
router.get('/quotes/:id', authenticate, quoteController.getQuote);
router.post('/quotes', authenticate, requireAdmin, validateQuote, quoteController.createQuote);
router.put('/quotes/:id', authenticate, requireAdmin, validateQuote, quoteController.updateQuote);
router.delete('/quotes/:id', authenticate, requireAdmin, quoteController.deleteQuote);

export default router;
```

#### `backend/middleware/`
- ✅ **Reusable middleware** (authenticate, authorize, validate)
- ✅ **Call next()** om door te gaan
- ✅ **Error responses** bij validation failures
- ❌ **Geen business logic** (alleen verificatie/validatie)

#### `backend/models/schema.prisma`
- ✅ **PostgreSQL types** (String, Int, Decimal, DateTime, Boolean)
- ✅ **Relations** (User → Quote → WorkOrder)
- ✅ **Indexes** op vaak-gebruikte velden (customerId, userId, status)
- ✅ **@map()** voor snake_case in database
- ✅ **@@map()** voor plural table names

**Pattern:**
```prisma
model Quote {
  id          String   @id
  customerId  String   @map("customer_id")
  userId      String   @map("user_id")
  status      String
  total       Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user        User       @relation(fields: [userId], references: [id])
  customer    Customer   @relation(fields: [customerId], references: [id])
  items       QuoteItem[]

  @@index([customerId])
  @@index([userId])
  @@map("quotes")
}
```

#### `backend/tests/`
- ✅ **Unit tests** voor controllers (80%+ coverage)
- ✅ **Integration tests** voor API endpoints
- ✅ **Mock Prisma** voor unit tests
- ✅ **Test database** voor integration tests
- ✅ **Vitest** als test framework

---

## 🚫 Anti-Patterns (NOOIT DOEN!)

### Frontend Anti-Patterns

❌ **Component > 300 regels**
```typescript
// FOUT - Te groot!
export const Accounting = () => {
  // 800 regels code...
};

// GOED - Split in kleinere componenten
export const Accounting = () => {
  return (
    <>
      <AccountingDashboard />
      <QuoteList />
      <InvoiceList />
    </>
  );
};
```

❌ **API calls in componenten**
```typescript
// FOUT - Direct fetch in component
export const QuoteList = () => {
  useEffect(() => {
    fetch('/api/quotes').then(/* ... */);
  }, []);
};

// GOED - Data via props van parent
export const QuoteList = ({ quotes, onUpdate }) => {
  // ...
};
```

❌ **React hooks in services**
```typescript
// FOUT - useState in service
export const calculateTotal = () => {
  const [total, setTotal] = useState(0); // NO!
};

// GOED - Pure function
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};
```

### Backend Anti-Patterns

❌ **Business logic in routes**
```javascript
// FOUT - Logic in route file
router.post('/quotes', (req, res) => {
  const total = req.body.items.reduce(/* ... */); // NO!
  // ...
});

// GOED - Logic in controller
router.post('/quotes', authenticate, requireAdmin, validateQuote, createQuote);
```

❌ **Direct error handling in controllers**
```javascript
// FOUT - Direct response
export const createQuote = async (req, res) => {
  try {
    // ...
  } catch (error) {
    res.status(500).json({ error: error.message }); // NO!
  }
};

// GOED - Pass to error middleware
export const createQuote = async (req, res, next) => {
  try {
    // ...
  } catch (error) {
    next(error); // Let global handler deal with it
  }
};
```

❌ **Hardcoded secrets**
```javascript
// FOUT - Hardcoded
const JWT_SECRET = 'my-secret-key'; // NO!

// GOED - Environment variable
const JWT_SECRET = process.env.JWT_SECRET;
```

---

## ✅ Quick Reference

**Nieuwe hook toevoegen?**
```
features/[module]/hooks/useNewHook.ts
→ Export via features/[module]/hooks/index.ts
```

**Nieuwe component toevoegen?**
```
components/[module]/[feature]/NewComponent.tsx
→ Export via components/[module]/index.ts
```

**Nieuwe API endpoint toevoegen?**
```
1. backend/controllers/newController.js (business logic)
2. backend/middleware/validateNew.js (Joi schema)
3. backend/routes/newRoutes.js (endpoint definitie)
4. backend/routes/index.js (registreer route)
5. backend/tests/integration/new.test.js (API test)
```

**Nieuwe database model toevoegen?**
```
1. backend/models/schema.prisma (model definitie)
2. npx prisma migrate dev --name add_new_model
3. npx prisma generate
```

---

**Cursor AI moet dit bestand altijd updaten bij nieuwe mappen.**

2. utils/fileHelpers.ts (Veilige list_directory)
   ts// src/utils/fileHelpers.ts
   import fs from 'fs';
   import path from 'path';

/\*\*

- Veilig lijst bestanden/mappen op in een directory
- Gebruikt in plaats van directory_tree → voorkomt overbelasting
  \*/
  export const list_directory = async (dirPath: string): Promise<string[]> => {
  try {
  const items = await fs.promises.readdir(dirPath);
  return items.filter(item => {
  const fullPath = path.join(dirPath, item);
  const stat = fs.statSync(fullPath);
  return stat.isDirectory() || stat.isFile();
  });
  } catch (error) {
  console.warn(`[list_directory] Kon map niet lezen: ${dirPath}`);
  return [];
  }
  };

/\*\*

- Lijst alleen pagina's op (pages/ map)
  \*/
  export const pages_directory = async (): Promise<string[]> => {
  const pagesPath = path.join(process.cwd(), 'src', 'pages');
  return list_directory(pagesPath);
  };

3. .cursor/rules.md (AI Regels — Cursor AI moet dit altijd volgen)
   md# Cursor AI Regels - Bedrijfsbeheer 2.0

## ALTIJD VOLGEN

1. **Nooit** `directory_tree` gebruiken → gebruik `list_directory` of `pages_directory`
2. **Nooit** `read_file` → gebruik `edit_file` of `str_replace`
3. **Altijd** `project_structure.md` updaten bij:
   - Nieuwe map
   - Verplaatste map
   - Verwijderde map
4. **Altijd** `README.md` synchroniseren met `project_structure.md`
5. **Max 1 bestand wijzigen per prompt** (tenzij bulk replace)
6. **Gebruik barrel files** (`index.ts`) in elke map
7. **Geen component > 300 regels**
8. **Geen hook > 200 regels**
9. **Alle services zijn pure functies** (geen React, geen state)
10. **Gebruik `React.memo` bij lijsten**
11. **Gebruik `useCallback` bij event handlers in lijsten**
12. **Geen inline styles** → gebruik Tailwind classes
13. **Gebruik `type` in plaats van `interface` voor props**
14. **Alle nieuwe bestanden moeten in `project_structure.md`**

## VOORBEELD IMPORTS

````ts
// Goed
import { useQuotes } from '@/features/accounting/hooks';
import { ConfirmModal } from '@/components/common/modals';

// Slecht
import { useQuotes } from '../../features/accounting/hooks/useQuotes';
FOUTAFHANDELING

Gebruik try/catch in alle async operaties
Log warnings, nooit errors

text---

## 4. VS Code Snippet: Snelle Structuur Update

Ga naar: **VS Code → Settings → User Snippets → markdown.json**

```json
{
  "Update Project Structure": {
    "prefix": "upstruct",
    "body": [
      "> **Laatst bijgewerkt:** `${1:$(date '+%Y-%m-%d')}`",
      "> **Genereerd door:** Cursor AI (refactoring guard)",
      "",
      "```",
      "src/",
      "${2:├── components/}",
      "${3:│   └── accounting/}",
      "${4:│       └── quotes/}",
      "├── features/",
      "│   └── accounting/",
      "│       ├── hooks/",
      "│       ├── services/",
      "│       └── utils/",
      "├── pages/",
      "└── types/",
      "```",
      "",
      "**Cursor AI moet dit bestand altijd updaten bij nieuwe mappen.**"
    ],
    "description": "Update project_structure.md met huidige structuur"
  }
}
Gebruik: Typ upstruct in project_structure.md → automatisch bijwerken.

5. Automatisch Sync Script (Bonus)
Maak: scripts/sync-structure.js
js// scripts/sync-structure.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src');
const OUTPUT = path.join(__dirname, '..', 'project_structure.md');

function buildTree(dir, prefix = '') {
  const items = fs.readdirSync(dir).filter(i => i !== '.git' && i !== 'node_modules');
  const dirs = items.filter(i => fs.statSync(path.join(dir, i)).isDirectory());
  const tree = [];

  dirs.forEach((name, index) => {
    const isLast = index === dirs.length - 1;
    tree.push(`${prefix}${isLast ? '└──' : '├──'} ${name}/`);
    tree.push(...buildTree(path.join(dir, name), `${prefix}${isLast ? '   ' : '│  '}`));
  });

  return tree;
}

const tree = [
  '# Projectstructuur - Bedrijfsbeheer 2.0\n',
  `> **Laatst bijgewerkt:** ${new Date().toISOString().split('T')[0]}\n`,
  '> **Genereerd door:** Automatisch script\n',
  '```\nsrc/',
  ...buildTree(ROOT).map(line => line.replace(/src\//, '')),
  '```\n',
  '**Cursor AI moet dit bestand altijd updaten bij nieuwe mappen.**'
].join('\n');

fs.writeFileSync(OUTPUT, tree);
console.log('project_structure.md bijgewerkt!');
Run met:
bashnode scripts/sync-structure.js

Samenvatting: Jouw Anti-Refactor Systeem





























BestandDoelproject_structure.mdVisuele blauwdrukutils/fileHelpers.tsVeilige file ops.cursor/rules.mdAI gedragsregelsVS Code SnippetSnelle updatessync-structure.jsAutomatisch genereren
````
