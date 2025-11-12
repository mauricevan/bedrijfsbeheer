# Bestandsstructuur

## Overzicht

De projectstructuur is georganiseerd volgens een modulaire, component-based architectuur waarbij elke map een specifieke verantwoordelijkheid heeft. Deze structuur bevordert schaalbaarheid, onderhoudbaarheid en code herbruikbaarheid.

---

## Project Directory Layout

```
Bedrijfsbeheer2.0/
├── components/          # Herbruikbare UI componenten
│   ├── icons/          # Icon componenten
│   ├── AdminSettings.tsx
│   ├── Header.tsx
│   ├── Login.tsx       # Login component
│   └── Sidebar.tsx
├── pages/              # Module pagina's
│   ├── Dashboard.tsx   # Met notificaties
│   ├── Inventory.tsx
│   ├── POS.tsx
│   ├── WorkOrders.tsx  # Volledig vernieuwd workboard
│   ├── Accounting.tsx  # Met offertes en facturen tabs + werkorder integratie
│   ├── CRM.tsx         # Met taken tab
│   ├── HRM.tsx
│   ├── Planning.tsx    # Kalender module
│   └── Reports.tsx     # 4 rapport types
├── data/               # Mock data en database modellen
│   └── mockData.ts     # Incl. mock facturen
├── docs/               # Documentatie
│   ├── 01-getting-started/
│   ├── 02-architecture/
│   ├── 03-modules/
│   ├── 04-features/
│   ├── 05-api/
│   └── 06-changelog/
├── App.tsx             # Met login flow en invoice state
├── constants.ts        # Module definities
├── types.ts            # TypeScript types (incl. Invoice + WorkOrder koppeling)
├── index.tsx           # Entry point
├── index.css           # Global styles en Tailwind imports
├── vite.config.ts      # Vite configuratie
├── tsconfig.json       # TypeScript configuratie
├── tailwind.config.js  # Tailwind CSS configuratie
├── package.json        # Dependencies en scripts
└── README.md           # Project documentatie
```

---

## Directory Uitleg

### `/components` - Herbruikbare UI Componenten

Deze map bevat alle herbruikbare UI componenten die door meerdere modules worden gebruikt.

**Structuur:**
```
components/
├── icons/              # Icon componenten (SVG icons)
│   ├── DashboardIcon.tsx
│   ├── InventoryIcon.tsx
│   ├── POSIcon.tsx
│   └── ... (andere icons)
├── AdminSettings.tsx   # Admin configuratie component
├── Header.tsx          # Applicatie header met user menu
├── Login.tsx           # Login scherm component
└── Sidebar.tsx         # Navigatie sidebar component
```

**Key Components:**

- **Header.tsx**
  - User avatar en naam
  - Role indicator (Admin/User)
  - User menu dropdown
  - Logout functionaliteit
  - Notificatie badge

- **Sidebar.tsx**
  - Navigatie menu
  - Module links met icons
  - Active state highlighting
  - Admin-only modules
  - Mobile hamburger menu support

- **Login.tsx**
  - Email/password formulier
  - Quick login knoppen
  - Form validatie
  - Error handling

- **AdminSettings.tsx**
  - Module aan/uit schakelen
  - Systeem configuratie
  - User management access

---

### `/pages` - Module Pagina's

Elke pagina representeert een volledige module in het systeem.

**Module Overzicht:**

- **Dashboard.tsx**
  - KPI cards (omzet, werkorders, klanten, voorraad)
  - Notificaties systeem
  - Recent activities
  - Quick actions

- **Inventory.tsx**
  - Voorraad overzicht
  - Product management
  - Categorieën systeem
  - SKU types (Standard, Bundle, Service)
  - Lage voorraad waarschuwingen

- **POS.tsx**
  - Point of Sale interface
  - Product selectie
  - Shopping cart
  - Transactie afhandeling
  - Voorraad synchronisatie

- **WorkOrders.tsx**
  - Persoonlijk workboard
  - Kanban-style workflow (To Do, In Progress, Done)
  - Werkorder details
  - Uren registratie
  - Materiaal tracking

- **Accounting.tsx**
  - Offertes beheer
  - Facturen beheer
  - Werkorder integratie
  - Status tracking
  - Conversie workflow

- **CRM.tsx**
  - Klanten beheer
  - Taken management
  - Contact historie
  - Klant statistieken

- **HRM.tsx**
  - Medewerkers beheer
  - Verlof tracking
  - Beschikbaarheid status
  - Persoonlijke dossiers

- **Planning.tsx**
  - Kalender view
  - Event scheduling
  - Resource planning
  - Timeline visualisatie

- **Reports.tsx**
  - Voorraad rapporten
  - Verkoop rapporten
  - Werkorder rapporten
  - Klant rapporten

---

### `/data` - Mock Data & Database Modellen

**mockData.ts** bevat alle demo data voor het systeem:

- Users (demo accounts)
- Customers
- Inventory items
- Work orders
- Quotes
- Invoices
- Employees
- Notifications
- Categories

**Data Structuur:**
```typescript
// Voorbeelden van data exports
export const users = [...];
export const customers = [...];
export const inventoryItems = [...];
export const workOrders = [...];
export const quotes = [...];
export const invoices = [...];
```

---

### `/docs` - Documentatie

Gestructureerde documentatie in verschillende categorieën:

```
docs/
├── 01-getting-started/   # Installatie en setup
├── 02-architecture/      # Technische architectuur
├── 03-modules/           # Module documentatie
├── 04-features/          # Feature guides
├── 05-api/               # API documentatie
└── 06-changelog/         # Versie geschiedenis
```

---

## Root Files

### **App.tsx** - Hoofdcomponent

- Centrale applicatie logik
- State management
- Routing setup
- Login flow
- Module rendering
- Data initialisatie

**Key Responsibilities:**
- User authentication state
- Module state (enabled/disabled)
- Global data management (inventory, customers, orders, etc.)
- Route configuration
- Layout composition

### **types.ts** - TypeScript Type Definities

Bevat alle TypeScript interfaces en types:

```typescript
// Voorbeelden
interface User { ... }
interface Customer { ... }
interface InventoryItem { ... }
interface WorkOrder { ... }
interface Quote { ... }
interface Invoice { ... }
interface Employee { ... }
```

**Voordelen:**
- Type safety
- IntelliSense support
- Code documentatie
- Compile-time error checking

### **constants.ts** - Module Configuratie

Definities van beschikbare modules:

```typescript
interface Module {
  name: string;
  id: string;
  enabled: boolean;
  component: React.ComponentType<any>;
}
```

**Gebruikt voor:**
- Module registratie
- Dynamic routing
- Admin settings
- Feature flags

### **index.tsx** - Entry Point

- React app mounting
- Root element rendering
- Provider setup
- Global error handling

### **index.css** - Global Styles

- Tailwind CSS imports
- Custom CSS variables
- Global resets
- Utility classes

---

## Component Organization Patterns

### Naming Conventions

- **Components**: PascalCase (bijv. `Header.tsx`, `Sidebar.tsx`)
- **Files**: camelCase voor utilities (bijv. `mockData.ts`, `constants.ts`)
- **Types**: PascalCase voor interfaces (bijv. `User`, `WorkOrder`)

### Import Structure

```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 2. Internal components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// 3. Types
import { User, Module } from './types';

// 4. Constants & Data
import { MODULES } from './constants';
import { users } from './data/mockData';
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Interface definitions
interface Props {
  // ...
}

// 3. Component definition
const ComponentName: React.FC<Props> = ({ ...props }) => {
  // 4. State declarations
  const [state, setState] = useState();

  // 5. Effect hooks
  useEffect(() => {
    // ...
  }, []);

  // 6. Event handlers
  const handleEvent = () => {
    // ...
  };

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 8. Export
export default ComponentName;
```

---

## Build Output

### Development

```
node_modules/           # Dependencies (niet in git)
.vite/                  # Vite cache
```

### Production Build

```
dist/                   # Production build output
├── assets/            # Bundled JS, CSS, images
│   ├── index.[hash].js
│   ├── index.[hash].css
│   └── ...
└── index.html         # Entry HTML
```

---

## Configuratie Files

### **vite.config.ts**
- Build configuratie
- Plugin setup
- Alias definitions
- Server settings

### **tsconfig.json**
- TypeScript compiler opties
- Module resolution
- Type checking regels
- Output settings

### **tailwind.config.js**
- Color palette
- Breakpoints
- Custom utilities
- Plugin configuratie

### **package.json**
- Dependencies
- Dev dependencies
- Scripts (dev, build, preview)
- Project metadata

---

## Best Practices

### File Organization

1. **Een component per file** - Verbetert leesbaarheid en onderhoudbaarheid
2. **Gegroepeerde imports** - Logische volgorde (external → internal → types → data)
3. **Duidelijke naming** - Beschrijvende namen die functie aangeven
4. **Consistent formatting** - Gebruik van TypeScript en ESLint

### Component Design

1. **Single Responsibility** - Elke component heeft één duidelijke taak
2. **Props over state** - Gebruik props voor data flow waar mogelijk
3. **Type alle props** - TypeScript interfaces voor alle component props
4. **Herbruikbaarheid** - Maak componenten generiek waar zinvol

### State Management

1. **Lift state up** - Deel state op laagst mogelijke gemeenschappelijk niveau
2. **Minimize state** - Houd alleen essentiële data in state
3. **Derived state** - Bereken waarden waar mogelijk ipv opslaan
4. **Immutable updates** - Gebruik spread operator voor state updates

---

## Gerelateerde Documentatie

- [Technische Stack](./technical-stack.md) - Gebruikte technologieën en frameworks
- [State Management](./state-management.md) - State management patterns en praktijken
- [Component Development](../04-features/component-development.md) - Component development guide
- [Module Development](../03-modules/module-development.md) - Nieuwe modules toevoegen
