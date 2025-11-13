# 🏗️ Technische Architectuur - Bedrijfsbeheer Dashboard 2.0

> **Complete architectuur documentatie**: Current State → Proposed State → Migration Path

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Proposed Architecture](#proposed-architecture)
4. [Architecture Comparison](#architecture-comparison)
5. [Migration Strategy](#migration-strategy)
6. [Architecture Decisions](#architecture-decisions)
7. [Scalability Plan](#scalability-plan)

---

## 🎯 Executive Summary

### Problem Statement
De huidige architectuur heeft **kritieke tekortkomingen**:
- ❌ Geen backend (alle data in localStorage)
- ❌ Props drilling (CRM krijgt 19 props)
- ❌ Geen state management library
- ❌ Security issues (plaintext passwords, API keys in client)
- ❌ Geen testing infrastructure
- ❌ Geen proper error handling

### Solution
Een **moderne, schaalbare architectuur** met:
- ✅ Backend API (Node.js + Express + PostgreSQL)
- ✅ Redux Toolkit voor state management
- ✅ Proper authentication & authorization
- ✅ 80%+ test coverage
- ✅ Production-ready infrastructure

### Impact
- **Security**: 2/10 → 9/10
- **Maintainability**: Low → High
- **Scalability**: Limited → Excellent
- **Developer Experience**: Poor → Excellent

---

## 🔴 Current Architecture

### High-Level Overview

```
┌─────────────────────────────────────────┐
│          Browser (Client)               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │     React 19 + TypeScript         │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │   Props Drilling            │ │ │
│  │  │   (No Redux)                │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │   localStorage               │ │ │
│  │  │   (Unencrypted Data)        │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │   Plaintext Passwords       │ │ │
│  │  └─────────────────────────────┘ │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘

❌ NO BACKEND
❌ NO DATABASE
❌ NO API
```

### Current Tech Stack

| Layer | Technology | Issues |
|-------|-----------|--------|
| **Frontend** | React 19.1.1 | ✅ Modern |
| **Language** | TypeScript 5.8 | ✅ Good |
| **Build Tool** | Vite 6.2.0 | ✅ Fast |
| **Styling** | Tailwind CSS 4.1 | ✅ Good |
| **State** | Props drilling | ❌ **MAJOR ISSUE** |
| **Backend** | None | ❌ **CRITICAL** |
| **Database** | localStorage | ❌ **CRITICAL** |
| **Auth** | Plaintext | ❌ **CRITICAL** |
| **Testing** | None | ❌ **CRITICAL** |
| **Deployment** | Static | ⚠️ Limited |

### Current Folder Structure

```
src/
├── components/          # 📁 60+ components (some 1000+ lines)
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── Login.tsx       # ❌ Plaintext password check
│   ├── ...
│   └── EmailDropZone.tsx  # ❌ 1463 lines, no file validation
│
├── pages/              # 📁 Module pages
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── POS.tsx
│   ├── CRM.tsx         # ❌ Receives 19 props
│   └── ...
│
├── data/               # 📁 Mock data
│   └── mockData.ts     # ❌ Hardcoded data, plaintext passwords
│
├── types.ts            # 📄 All TypeScript types (32KB file)
├── constants.ts        # 📄 Constants
├── utils/              # 📁 Utility functions
│   ├── analytics.ts
│   └── emailParser.ts
│
└── App.tsx             # 📄 Main component (409 lines)
```

### Current Data Flow

```
User Action
    ↓
Component (Props Drilling)
    ↓
Local State (useState)
    ↓
localStorage (Unencrypted)
    ↓
No Validation
No Backend
No Persistence
```

### Critical Issues

#### 1. **Props Drilling** 🔴 Critical
```typescript
// App.tsx - CRM krijgt 19 props!
<CRM
  customers={customers}
  setCustomers={setCustomers}
  sales={sales}
  tasks={tasks}
  setTasks={setTasks}
  leads={leads}
  setLeads={setLeads}
  interactions={interactions}
  setInteractions={setInteractions}
  employees={employees}
  currentUser={currentUser}
  isAdmin={currentUser.isAdmin}
  invoices={invoices}
  setInvoices={setInvoices}
  quotes={quotes}
  setQuotes={setQuotes}
  workOrders={workOrders}
  setWorkOrders={setWorkOrders}
  inventory={inventory}
  emails={emails}
  setEmails={setEmails}
  emailTemplates={emailTemplates}
  setEmailTemplates={setEmailTemplates}
/>
```

**Impact**:
- Moeilijk te onderhouden
- Type-checking nightmare
- Performance issues (unnecessary re-renders)
- Onmogelijk om te testen

#### 2. **No Backend** 🔴 Critical
```typescript
// Alle data in localStorage
const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
// ... 15 meer state arrays ...

// localStorage (components/Login.tsx:38)
localStorage.setItem('authenticated', 'true');
```

**Impact**:
- Geen data persistence
- Geen multi-user support
- Geen backup/recovery
- Geen data validation
- Security nightmare

#### 3. **Plaintext Passwords** 🔴 Critical
```typescript
// components/Login.tsx:54
if (employee.password !== password) {
  setError('Onjuist wachtwoord');
  return;
}

// data/mockData.ts:1830
export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp_001",
    name: "Maurice",
    password: "admin123",  // ❌ PLAINTEXT!
    role: "Manager Productie",
    isAdmin: true
  }
];
```

**Impact**:
- Iedereen met toegang tot code kan alle wachtwoorden zien
- GDPR violation
- Critical security breach

#### 4. **God Components** 🟠 High
```typescript
// components/EmailDropZone.tsx: 1463 lines
// Doet alles: file parsing, email rendering, state management, UI
```

**Impact**:
- Onmogelijk te testen
- Moeilijk te begrijpen
- Bug-prone

---

## 🟢 Proposed Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React 19 + TypeScript                     │ │
│  │                                                        │ │
│  │  ┌──────────────────┐      ┌─────────────────────┐  │ │
│  │  │  Redux Toolkit   │◄────►│   RTK Query         │  │ │
│  │  │  (State Mgmt)    │      │   (API Calls)       │  │ │
│  │  └──────────────────┘      └─────────────────────┘  │ │
│  │           ▲                          ▲               │ │
│  │           │                          │               │ │
│  │           ▼                          ▼               │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │         React Components (Feature-based)     │  │ │
│  │  │  • auth/    • dashboard/   • inventory/      │  │ │
│  │  │  • pos/     • crm/         • hrm/            │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS + JWT
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                          BACKEND                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Node.js + Express                         │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │ │
│  │  │ Auth Layer   │  │ Middleware   │  │   Routes   │ │ │
│  │  │ • JWT        │  │ • CORS       │  │   /api/v1  │ │ │
│  │  │ • Bcrypt     │  │ • Rate Limit │  │            │ │ │
│  │  │ • Refresh    │  │ • Validation │  │            │ │ │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │          Business Logic Layer                    │ │ │
│  │  │  • Services  • Controllers  • Validators        │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────┐              ┌──────────────────┐ │ │
│  │  │   Prisma ORM │◄────────────►│   Redis Cache    │ │ │
│  │  └──────────────┘              └──────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   PostgreSQL 16                        │ │
│  │                                                        │ │
│  │  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │
│  │  │ Users│  │ Products │  │ WorkOrder│  │ Invoices │ │ │
│  │  └──────┘  └──────────┘  └──────────┘  └──────────┘ │ │
│  │  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │
│  │  │ Sales│  │ Customers│  │ Employees│  │  Quotes  │ │ │
│  │  └──────┘  └──────────┘  └──────────┘  └──────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Proposed Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | React 19 + TypeScript | Modern, performant, type-safe |
| **State** | Redux Toolkit | Industry standard, eliminates props drilling |
| **API Client** | RTK Query | Built-in caching, auto-generated hooks |
| **Styling** | Tailwind CSS 4 | Fast, consistent, maintainable |
| **Build** | Vite 6 | Lightning fast, great DX |
| **Backend** | Node.js 22 + Express | JavaScript full-stack, large ecosystem |
| **ORM** | Prisma | Type-safe, great DX, migrations |
| **Database** | PostgreSQL 16 | Reliable, ACID, excellent for business apps |
| **Cache** | Redis | Fast, reduces DB load |
| **Auth** | JWT + Bcrypt | Industry standard, secure |
| **Testing** | Jest + Vitest + Playwright | Complete testing pyramid |
| **DevOps** | Docker + GitHub Actions | Reproducible, automated |
| **Monitoring** | Sentry + LogRocket | Error tracking, user sessions |

### Proposed Folder Structure

```
bedrijfsbeheer2.0/
│
├── apps/                              # Monorepo applications
│   ├── web/                           # Frontend (React)
│   │   ├── src/
│   │   │   ├── features/              # Feature-based structure
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   │   └── LoginForm.test.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useAuth.ts
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── authApi.ts
│   │   │   │   │   ├── slices/
│   │   │   │   │   │   └── authSlice.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── auth.types.ts
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   ├── inventory/
│   │   │   │   ├── pos/
│   │   │   │   ├── workorders/
│   │   │   │   ├── accounting/
│   │   │   │   ├── crm/
│   │   │   │   ├── hrm/
│   │   │   │   ├── planning/
│   │   │   │   ├── reports/
│   │   │   │   └── webshop/
│   │   │   │
│   │   │   ├── shared/                # Shared code
│   │   │   │   ├── components/
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Table/
│   │   │   │   │   └── Modal/
│   │   │   │   ├── hooks/
│   │   │   │   ├── utils/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── store/                 # Redux store
│   │   │   │   ├── index.ts
│   │   │   │   └── hooks.ts
│   │   │   │
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   │
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── api/                           # Backend (Node.js)
│       ├── src/
│       │   ├── modules/               # Feature modules
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.validation.ts
│       │   │   │   └── auth.test.ts
│       │   │   │
│       │   │   ├── users/
│       │   │   ├── inventory/
│       │   │   ├── sales/
│       │   │   ├── workorders/
│       │   │   ├── customers/
│       │   │   └── ...
│       │   │
│       │   ├── shared/                # Shared backend code
│       │   │   ├── middleware/
│       │   │   │   ├── auth.middleware.ts
│       │   │   │   ├── rateLimiter.middleware.ts
│       │   │   │   └── validation.middleware.ts
│       │   │   ├── utils/
│       │   │   └── types/
│       │   │
│       │   ├── prisma/                # Database
│       │   │   ├── schema.prisma
│       │   │   ├── migrations/
│       │   │   └── seed.ts
│       │   │
│       │   ├── config/
│       │   │   ├── database.config.ts
│       │   │   ├── redis.config.ts
│       │   │   └── jwt.config.ts
│       │   │
│       │   ├── index.ts
│       │   └── server.ts
│       │
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
│
├── packages/                          # Shared packages
│   ├── types/                         # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── user.types.ts
│   │   │   ├── product.types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── eslint-config/                 # Shared ESLint config
│       └── package.json
│
├── docker/                            # Docker configs
│   ├── docker-compose.yml
│   ├── Dockerfile.web
│   └── Dockerfile.api
│
├── .github/                           # CI/CD
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security.yml
│
├── docs/                              # Documentation (FROM bedrijfsbeheer2.0-docs)
├── nx.json                            # Nx configuration
├── package.json
└── README.md
```

### Proposed Data Flow

```
User Action
    ↓
React Component
    ↓
Redux Action (dispatched)
    ↓
RTK Query API Call
    ↓
HTTPS Request (with JWT)
    ↓
Backend API Endpoint
    ↓
Authentication Middleware (verify JWT)
    ↓
Validation Middleware (validate input)
    ↓
Controller (business logic)
    ↓
Service Layer
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response Back Up the Chain
    ↓
Redux State Updated (via RTK Query)
    ↓
React Component Re-renders
```

---

## 📊 Architecture Comparison

### State Management

| Aspect | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| **Method** | Props drilling | Redux Toolkit | 🟢 Massive |
| **Complexity** | High | Low | 🟢 Much simpler |
| **Type Safety** | Poor | Excellent | 🟢 100% typed |
| **Testing** | Impossible | Easy | 🟢 Full coverage |
| **Performance** | Poor (re-renders) | Optimized | 🟢 Memoization |
| **DevTools** | None | Redux DevTools | 🟢 Time-travel debugging |

**Example Redux vs Props Drilling:**

```typescript
// ❌ CURRENT: Props drilling (App.tsx → CRM.tsx)
<CRM
  customers={customers}
  setCustomers={setCustomers}
  sales={sales}
  // ... 16 more props ...
/>

// ✅ PROPOSED: Redux + RTK Query
const CRM = () => {
  // Clean, simple, testable
  const { data: customers, isLoading } = useGetCustomersQuery();
  const { data: sales } = useGetSalesQuery();

  // Component logic here
};
```

### Data Persistence

| Aspect | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| **Storage** | localStorage | PostgreSQL | 🟢 Reliable DB |
| **Encryption** | None | AES-256 | 🟢 Encrypted |
| **Backup** | None | Automated | 🟢 Daily backups |
| **Multi-user** | No | Yes | 🟢 Concurrent users |
| **Validation** | Client only | Server + Client | 🟢 Double validation |
| **Audit Trail** | No | Yes | 🟢 Full history |

### Authentication

| Aspect | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| **Method** | Plaintext | Bcrypt + JWT | 🟢 Industry standard |
| **Password Storage** | Plaintext | Hashed (10 rounds) | 🟢 Secure |
| **Session** | localStorage | HTTP-only cookie | 🟢 XSS-proof |
| **Token Refresh** | No | Yes | 🟢 Better UX |
| **MFA** | No | Planned (Phase 4) | 🟢 Extra security |
| **Rate Limiting** | No | Yes | 🟢 Brute-force protection |

### Security

| Aspect | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| **HTTPS** | No enforcement | Required | 🟢 Encrypted transport |
| **CSP Headers** | No | Yes | 🟢 XSS protection |
| **Input Validation** | Client only | Server + Client | 🟢 Prevent injection |
| **File Upload** | No validation | Full validation | 🟢 Malware protection |
| **SQL Injection** | Vulnerable | Protected (Prisma) | 🟢 ORM prevents |
| **CSRF** | Vulnerable | Protected | 🟢 Token-based |
| **CORS** | Wide open | Restrictive | 🟢 Limited origins |

### Performance

| Aspect | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| **Bundle Size** | ~800KB | ~500KB | 🟢 37% reduction |
| **Code Splitting** | Partial | Full | 🟢 Lazy loading |
| **Caching** | None | Redis | 🟢 Fast responses |
| **DB Queries** | N/A | Optimized + Indexed | 🟢 Fast queries |
| **Image Optimization** | No | Yes | 🟢 WebP, lazy load |
| **API Response Time** | N/A | <200ms (target) | 🟢 Fast |

### Testing

| Aspect | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| **Unit Tests** | 0% | 80%+ | 🟢 Full coverage |
| **Integration Tests** | 0% | 60%+ | 🟢 Component tests |
| **E2E Tests** | 0% | Critical paths | 🟢 User flow tests |
| **CI/CD** | No | Yes | 🟢 Automated |
| **Test Framework** | None | Jest + Vitest + Playwright | 🟢 Complete pyramid |

---

## 🔄 Migration Strategy

### Phase Approach

```
Current State (Week 0)
    ↓
Phase 1: Foundation (Week 1-2)
    - Setup monorepo
    - Docker containers
    - PostgreSQL + Redis
    - CI/CD pipeline
    ↓
Phase 2: Backend (Week 3-4)
    - Express API
    - Prisma ORM
    - JWT auth
    - Basic CRUD endpoints
    ↓
Phase 3: State Migration (Week 5-6)
    - Redux Toolkit setup
    - RTK Query integration
    - Migrate props → Redux
    - Frontend connects to API
    ↓
Phase 4: Feature Migration (Week 7-12)
    - Migrate modules one by one
    - Dashboard → Inventory → POS → etc.
    - Add tests as we go
    ↓
Phase 5: Polish (Week 13-16)
    - Security hardening
    - Performance optimization
    - Documentation
    - Production deployment
    ↓
Production (Week 16)
```

### Dual-Running Strategy

We kunnen de oude en nieuwe versie **parallel** runnen during migration:

```
┌────────────────┐          ┌────────────────┐
│   OLD SYSTEM   │          │   NEW SYSTEM   │
│  (bedrijfs-    │          │ (bedrijfs-     │
│   beheer)      │          │  beheer2.0)    │
│                │          │                │
│  localhost:    │          │  localhost:    │
│    5173        │          │    3000        │
└────────────────┘          └────────────────┘
        │                           │
        └───────────┬───────────────┘
                    │
              Development
```

**Voordelen**:
- Geen downtime
- A/B testing mogelijk
- Rollback option
- Gradual migration

### Data Migration

```sql
-- Week 3-4: Data migration script

-- 1. Extract from localStorage (via export feature)
-- 2. Transform to SQL format
-- 3. Load into PostgreSQL

-- Example: Migrate customers
INSERT INTO customers (id, name, email, phone, company, created_at)
SELECT
  id,
  name,
  email,
  phone,
  company,
  NOW()
FROM json_to_recordset('[... localStorage data ...]');

-- 4. Validate data integrity
-- 5. Create indexes
-- 6. Run tests
```

---

## 🏛️ Architecture Decisions (ADRs)

### ADR-001: Why Redux Toolkit?

**Context**: Need state management solution

**Options Considered**:
1. Continue with props drilling
2. React Context API
3. Zustand
4. Redux Toolkit
5. MobX

**Decision**: Redux Toolkit

**Rationale**:
- ✅ Industry standard (huge community)
- ✅ Excellent TypeScript support
- ✅ Redux DevTools (time-travel debugging)
- ✅ RTK Query eliminates API boilerplate
- ✅ Built-in Immer (immutability)
- ✅ Best documentation
- ✅ Performance optimizations built-in

**Consequences**:
- (+) Eliminates props drilling
- (+) Easier testing
- (+) Better performance
- (-) Learning curve for team
- (-) Slightly more boilerplate than Zustand

---

### ADR-002: Why PostgreSQL?

**Context**: Need reliable database

**Options Considered**:
1. Continue with localStorage
2. MongoDB
3. MySQL
4. PostgreSQL
5. SQLite

**Decision**: PostgreSQL 16

**Rationale**:
- ✅ ACID compliance (critical for financial data)
- ✅ Excellent for relational data (invoices, customers, products)
- ✅ JSON support (flexible for webshop data)
- ✅ Great Prisma support
- ✅ Mature, stable, battle-tested
- ✅ Free and open-source
- ✅ Excellent performance

**Consequences**:
- (+) Reliable data persistence
- (+) Full ACID guarantees
- (+) Complex queries possible
- (+) Backup/restore built-in
- (-) Requires hosting (vs. serverless)
- (-) Slightly steeper learning curve than MongoDB

---

### ADR-003: Why Monorepo?

**Context**: Need to organize frontend + backend

**Options Considered**:
1. Separate repos (frontend + backend)
2. Monorepo with Nx
3. Monorepo with Turborepo
4. Single repo without workspace

**Decision**: Monorepo with Nx

**Rationale**:
- ✅ Shared TypeScript types
- ✅ Atomic commits across frontend/backend
- ✅ Easier refactoring
- ✅ Single CI/CD pipeline
- ✅ Nx has excellent DX
- ✅ Caching speeds up builds

**Consequences**:
- (+) Better code sharing
- (+) Easier to maintain
- (+) Single source of truth
- (-) Larger repo size
- (-) Need to learn Nx

---

### ADR-004: Why RTK Query?

**Context**: Need API client for frontend

**Options Considered**:
1. Fetch API manually
2. Axios
3. React Query (TanStack Query)
4. RTK Query
5. SWR

**Decision**: RTK Query

**Rationale**:
- ✅ Integrates with Redux Toolkit
- ✅ Auto-generated hooks
- ✅ Built-in caching
- ✅ Optimistic updates
- ✅ Invalidation strategies
- ✅ TypeScript codegen from OpenAPI

**Consequences**:
- (+) Less boilerplate
- (+) Automatic cache management
- (+) Great DX
- (-) Tied to Redux ecosystem

---

## 📈 Scalability Plan

### Current Limitations

- ❌ Single-user only (localStorage)
- ❌ No concurrent access
- ❌ Limited to browser memory
- ❌ No load balancing possible
- ❌ No horizontal scaling

### Proposed Scalability

#### Phase 1: Single Server (Week 1-16)
```
Load Balancer
    ↓
┌────────────────┐
│   App Server   │
│  (Node.js)     │
└────────────────┘
    ↓
┌────────────────┐
│   PostgreSQL   │
└────────────────┘
```

**Supports**: 100-500 concurrent users

#### Phase 2: Horizontal Scaling (Month 6+)
```
        Load Balancer
             ↓
   ┌─────────┼─────────┐
   ↓         ↓         ↓
┌─────┐  ┌─────┐  ┌─────┐
│ App │  │ App │  │ App │
│ #1  │  │ #2  │  │ #3  │
└─────┘  └─────┘  └─────┘
   ↓         ↓         ↓
   └─────────┼─────────┘
             ↓
      ┌─────────────┐
      │   Redis     │
      │  (Sessions) │
      └─────────────┘
             ↓
      ┌─────────────┐
      │ PostgreSQL  │
      │  (Primary)  │
      └─────────────┘
             ↓
      ┌─────────────┐
      │ PostgreSQL  │
      │  (Replica)  │
      └─────────────┘
```

**Supports**: 1,000-10,000 concurrent users

#### Phase 3: Microservices (Year 2+)
```
API Gateway
    ↓
┌───────────────────────────────┐
│  Microservices                │
│  ┌─────┐  ┌─────┐  ┌──────┐ │
│  │Auth │  │ POS │  │ CRM  │ │
│  └─────┘  └─────┘  └──────┘ │
│  ┌─────┐  ┌─────┐  ┌──────┐ │
│  │Inv. │  │ WO  │  │ HRM  │ │
│  └─────┘  └─────┘  └──────┘ │
└───────────────────────────────┘
    ↓
Message Queue (RabbitMQ)
    ↓
Multiple Databases (per service)
```

**Supports**: 10,000+ concurrent users

### Performance Targets

| Metric | Current | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|---------|
| **Concurrent Users** | 1 | 500 | 5,000 | 50,000 |
| **API Response Time** | N/A | <200ms | <150ms | <100ms |
| **Page Load Time** | 2s | 1.5s | 1s | <1s |
| **Bundle Size** | 800KB | 500KB | 400KB | 300KB |
| **Database Queries** | N/A | <50ms | <30ms | <20ms |

---

## 🔐 Security Architecture

Zie [SECURITY.md](./SECURITY.md) voor complete details.

**Key Points**:
- JWT authentication (access + refresh tokens)
- Bcrypt password hashing (10 rounds)
- HTTPS enforcement
- CSP headers
- Rate limiting (100 req/15min per IP)
- Input validation (server + client)
- File upload scanning
- SQL injection protection (Prisma ORM)
- XSS protection (DOMPurify)
- CSRF tokens

---

## 📚 Related Documentation

- [Tech Stack Details](./TECH_STACK.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Design](./API_DESIGN.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Security Architecture](./SECURITY.md)
- [Rebuild Plan](../11-rebuild-plan/REBUILD_OVERVIEW.md)

---

## 📞 Questions?

Voor vragen over de architectuur:
- Open een [GitHub Issue](https://github.com/mauricevan/bedrijfsbeheer2.0/issues)
- Check de [FAQ](../01-getting-started/FAQ.md)

---

**Versie**: 1.0.0
**Laatst Bijgewerkt**: 2025-01-13
**Status**: 📘 Complete
