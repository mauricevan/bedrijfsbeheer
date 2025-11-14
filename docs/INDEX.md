# Bedrijfsbeheer Dashboard - Documentatie Index

**Versie:** 5.8.0 (December 2024)
**Status:** Productie-ready met Email Integratie & Automatische Offerte Creatie

---

## 📖 Welkom bij de Documentatie

Dit is het centrale documentatie-overzicht voor het Bedrijfsbeheer Dashboard - een volledig geïntegreerd systeem waarmee de eigenaar alle bedrijfsprocessen kan overzien en regelen, en medewerkers alle tools hebben die nodig zijn om hun taken efficiënt uit te voeren.

---

## 🎯 Snelle Navigatie

### Voor Nieuwe Gebruikers
1. [Installatie](./01-getting-started/installation.md) - Setup instructies
2. [Quick Start Guide](./01-getting-started/quick-start.md) - Begin direct
3. [Demo Accounts](./01-getting-started/demo-accounts.md) - Test credentials
4. [Login & Users](./01-getting-started/login-users.md) - Authenticatie

### Voor Gebruikers
- [Modules Overzicht](./03-modules/overview.md) - Alle beschikbare modules
- [User Roles](./04-features/user-roles.md) - Rechten per rol
- [Notifications](./04-features/notifications.md) - Notificatie systeem
- [Mobile Guide](./04-features/mobile-optimization.md) - Mobiel gebruik

### Voor Developers
- [Technical Stack](./02-architecture/technical-stack.md) - Technische details
- [File Structure](./02-architecture/file-structure.md) - Project structuur
- [State Management](./02-architecture/state-management.md) - State patterns
- [API Overview](./05-api/overview.md) - API documentatie
- [AI Guide](./AI_GUIDE.md) - Voor AI assistenten

### Voor Admins
- [User Roles & Permissions](./04-features/user-roles.md) - Complete rechten matrix
- [Admin Settings](./03-modules/admin-settings.md) - Systeem configuratie
- [Security](./02-architecture/security.md) - Beveiligingsarchitectuur

---

## 📚 Documentatie Structuur

### 01. Getting Started
Begin hier als je nieuw bent met het systeem.

- [Installation](./01-getting-started/installation.md) - Installatie instructies
- [Quick Start](./01-getting-started/quick-start.md) - Snel aan de slag
- [Demo Accounts](./01-getting-started/demo-accounts.md) - Test accounts
- [Login & Users](./01-getting-started/login-users.md) - Authenticatie systeem

### 02. Architecture
Technische architectuur en ontwerpbeslissingen.

- [Technical Stack](./02-architecture/technical-stack.md) - React 19, TypeScript, Vite 6
- [File Structure](./02-architecture/file-structure.md) - Project organisatie
- [State Management](./02-architecture/state-management.md) - React Hooks patterns
- [Security](./02-architecture/security.md) - Beveiliging & privacy
- [ADRs](./02-architecture/adr/README.md) - Architecture Decision Records 🆕
- [Refactoring Plan](./02-architecture/refactoring-plan.md) - Implementation roadmap

### 03. Modules
Gedetailleerde documentatie van alle 12 modules.

- [Overview](./03-modules/overview.md) - Alle modules overzicht
- [Dashboard](./03-modules/dashboard.md) - Overzicht & Email Drop Zone
- [Inventory](./03-modules/inventory.md) - Voorraadbeheer (3 SKU types)
- [POS](./03-modules/pos.md) - Kassasysteem
- [Work Orders](./03-modules/workorders.md) - Werkorders & Workboard
- [Accounting](./03-modules/accounting.md) - Boekhouding, Offertes & Facturen
- [CRM](./03-modules/crm.md) - Klantrelatiebeheer
- [HRM](./03-modules/hrm.md) - Personeelsbeheer
- [Planning](./03-modules/planning.md) - Agenda systeem
- [Reports](./03-modules/reports.md) - Rapportages & Analyse
- [Webshop](./03-modules/webshop.md) - Webshop beheer
- [Admin Settings](./03-modules/admin-settings.md) - Systeem instellingen
- [Notifications](./03-modules/notifications.md) - Notificatie systeem

### 04. Features
Belangrijke functionaliteiten en workflows.

- [User Roles](./04-features/user-roles.md) - Admin vs User rechten
- [Notifications](./04-features/notifications.md) - Notificatie systeem
- [Email Integration](./04-features/email-integration.md) - Email Drop Zone (V5.8)
- [Workorder Workflow](./04-features/workorder-workflow.md) - End-to-end workflow
- [Mobile Optimization](./04-features/mobile-optimization.md) - Mobile-first design

### 05. API
API documentatie en backend integratie.

- [Overview](./05-api/overview.md) - API architectuur & endpoints
- [Mock Server](./05-api/mock-server.md) - Development server

### 06. Changelog
Complete versiegeschiedenis en release notes.

- [Overview](./06-changelog/overview.md) - Alle versies overzicht
- [Version 5.x](./06-changelog/v5.x.md) - Email, Categorieën, Boekhouding
- [Version 4.x](./06-changelog/v4.x.md) - Werkorder Integratie, Mobile
- [Version 3.x](./06-changelog/v3.x.md) - CRM, Facturen, Offertes
- [Version 2.x](./06-changelog/v2.x.md) - Login, Materialen
- [Version 1.x](./06-changelog/v1.x.md) - Basis modules

### 07. Workflow 🆕
Git workflow, code review en development process.

- [Git Workflow](./07-workflow/README.md) - Branch strategy, commits, PRs
- [Code Review Checklist](./07-workflow/code-review-checklist.md) - Complete review guide

---

## 🔧 Module Overzicht

### Productie & Operaties
| Module | Status | Beschrijving |
|--------|--------|--------------|
| [Dashboard](./03-modules/dashboard.md) | ✅ V5.8 | Real-time overzicht + Email Drop Zone |
| [Werkorders](./03-modules/workorders.md) | ✅ V5.3 | Kanban workboard met history viewer |
| [Voorraadbeheer](./03-modules/inventory.md) | ✅ V5.7 | 3 SKU types + Categorieën systeem |
| [POS](./03-modules/pos.md) | ✅ V5.7.1 | Kassasysteem met categorie filter |
| [Planning](./03-modules/planning.md) | ✅ V4.0 | Kalender & agenda beheer |

### Financieel & Administratie
| Module | Status | Beschrijving |
|--------|--------|--------------|
| [Boekhouding](./03-modules/accounting.md) | ✅ V5.8 | Offertes, Facturen + Grootboek |
| [CRM](./03-modules/crm.md) | ✅ V5.8 | Klantbeheer met email integratie |
| [Rapportages](./03-modules/reports.md) | ✅ V4.9 | Analytics & Business Intelligence |

### Personeel & Beheer
| Module | Status | Beschrijving |
|--------|--------|--------------|
| [HRM](./03-modules/hrm.md) | ✅ V4.7 | Personeelsbeheer met dossiers |
| [Admin](./03-modules/admin-settings.md) | ✅ V4.9 | Systeem configuratie + Diagnostics |
| [Notificaties](./03-modules/notifications.md) | ✅ V5.0 | Real-time alerts systeem |

### E-commerce
| Module | Status | Beschrijving |
|--------|--------|--------------|
| [Webshop](./03-modules/webshop.md) | ✅ V5.0 | Volledig webshop beheer |

---

## 🚀 Belangrijkste Features

### Email Integratie (V5.8) 🆕
- Drag-and-drop .eml bestanden
- Automatische offerte/taak creatie
- Klant matching op email adres
- [Lees meer →](./04-features/email-integration.md)

### Werkorder Workflow (V4.0)
- Offerte → Werkorder → Factuur
- Real-time status synchronisatie
- Bidirectional updates
- [Lees meer →](./04-features/workorder-workflow.md)

### Voorraadbeheer (V5.7)
- 3 SKU types per item
- Categorieën met kleur badges
- Uitgebreide zoeken & filteren
- [Lees meer →](./03-modules/inventory.md)

### Boekhouding (V5.2)
- MKB-ready grootboek
- NL-compliant BTW aangifte
- Financiële dossiers
- [Lees meer →](./03-modules/accounting.md)

### Mobile Optimalisatie (V4.5)
- Volledig responsive design
- Touch-optimized interface
- Hamburger menu
- [Lees meer →](./04-features/mobile-optimization.md)

---

## 👥 Gebruikersrollen

### Admin (Manager Productie)
- ✅ Volledige toegang tot alle modules
- ✅ Modules in- en uitschakelen
- ✅ Medewerkers en rechten beheren
- ✅ Alle werkorders overzien
- ✅ Nieuwe items/klanten/werkorders aanmaken

[Bekijk complete rechten matrix →](./04-features/user-roles.md)

### User (Medewerker)
- ✅ Persoonlijk workboard
- ✅ Eigen werkorders beheren
- ✅ Uren registreren
- ✅ Taken van collega's bekijken (read-only)
- ❌ Beperkte toegang tot bepaalde modules

[Bekijk complete rechten matrix →](./04-features/user-roles.md)

---

## 💻 Technische Stack

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4
- React Router 7
- Vite 6

**State Management:**
- React Hooks (useState, useMemo)
- Centralized state in App component
- Context API ready

**Development:**
- Node.js v18+
- npm/yarn
- ESLint + TypeScript

[Lees meer over de architectuur →](./02-architecture/technical-stack.md)

---

## 📊 Systeem Architectuur (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                     BEDRIJFSBEHEER DASHBOARD                 │
│                         (React 19 SPA)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                             │
        ▼                                             ▼
┌──────────────┐                            ┌──────────────┐
│  ADMIN VIEW  │                            │  USER VIEW   │
└──────────────┘                            └──────────────┘
        │                                             │
        │                                             │
        └─────────────┬───────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │     Centralized State       │
        │     (App Component)         │
        │  - Users, Customers, etc.   │
        └─────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │Dashboard│  │Werkorder│  │Boekhoudn│
   │ Module  │  │ Module  │  │  Module │
   └─────────┘  └─────────┘  └─────────┘
         │            │            │
         │            │            │
         ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │Voorraad │  │   CRM   │  │   HRM   │
   │ Module  │  │ Module  │  │ Module  │
   └─────────┘  └─────────┘  └─────────┘
         │            │            │
         │            │            │
         ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │   POS   │  │Planning │  │Reports  │
   │ Module  │  │ Module  │  │ Module  │
   └─────────┘  └─────────┘  └─────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │    Notification System      │
        │  (Real-time Alerts)         │
        └─────────────────────────────┘
```

---

## 🔄 Data Flow: Offerte → Werkorder → Factuur

```
┌───────────┐
│  Offerte  │  Status: Draft → Geaccepteerd
└─────┬─────┘
      │ "Maak Werkorder"
      ▼
┌───────────┐
│ Werkorder │  Status: To Do → In Progress → Completed
└─────┬─────┘  ├─ Materialen gekoppeld
      │        ├─ Uren geregistreerd
      │        └─ Real-time sync met offerte
      │
      │ Bidirectional Updates
      │ (Edit offerte → Update werkorder)
      │
      ▼
┌───────────┐
│  Factuur  │  Status: Draft → Verzenden → Betaald
└───────────┘  ├─ Gewerkte uren (niet geschat)
               ├─ Materialen uit werkorder
               └─ Link behouden naar werkorder
```

[Lees meer over de workflow →](./04-features/workorder-workflow.md)

---

## 📋 Module Features Matrix

| Functionaliteit | Admin | User |
|----------------|-------|------|
| Nieuwe items/klanten toevoegen | ✅ | ❌ |
| Items bewerken/verwijderen | ✅ | ❌ |
| Alle werkorders zien | ✅ | ❌ |
| Werkorders toewijzen | ✅ | ❌ |
| Facturen beheren | ✅ | ❌ |
| Medewerkers beheren | ✅ | ❌ |
| Modules in-/uitschakelen | ✅ | ❌ |
| Eigen werkorders beheren | ✅ | ✅ |
| Uren registreren | ✅ | ✅ |
| Data bekijken | ✅ | ✅ (beperkt) |

[Complete rechten matrix →](./04-features/user-roles.md)

---

## 🎓 Learning Paths

### Pad 1: Nieuwe Gebruiker (30 min)
1. [Installatie](./01-getting-started/installation.md) (5 min)
2. [Quick Start](./01-getting-started/quick-start.md) (10 min)
3. [Modules Overzicht](./03-modules/overview.md) (15 min)

### Pad 2: Developer Onboarding (2 uur)
1. [Technical Stack](./02-architecture/technical-stack.md) (20 min)
2. [File Structure](./02-architecture/file-structure.md) (20 min)
3. [State Management](./02-architecture/state-management.md) (30 min)
4. [API Overview](./05-api/overview.md) (20 min)
5. [Security](./02-architecture/security.md) (20 min)
6. [AI Guide](./AI_GUIDE.md) (10 min)

### Pad 3: Admin Training (1 uur)
1. [Login & Users](./01-getting-started/login-users.md) (10 min)
2. [User Roles](./04-features/user-roles.md) (15 min)
3. [Admin Settings](./03-modules/admin-settings.md) (15 min)
4. [HRM Module](./03-modules/hrm.md) (10 min)
5. [Werkorder Workflow](./04-features/workorder-workflow.md) (10 min)

### Pad 4: Medewerker Training (30 min)
1. [Login](./01-getting-started/login-users.md) (5 min)
2. [Werkorders Module](./03-modules/workorders.md) (15 min)
3. [Mobile Guide](./04-features/mobile-optimization.md) (10 min)

---

## 🎯 Wanneer Welke Doc? (Quick Reference)

### Voor Specifieke Taken

| Taak / Vraag | Document | Sectie |
|--------------|----------|--------|
| **Development & Code** |||
| Nieuwe React component maken | [Technical Stack](./02-architecture/technical-stack.md) | React Patterns |
| State management implementeren | [State Management](./02-architecture/state-management.md) | Hook Patterns |
| TypeScript types definiëren | [Technical Stack](./02-architecture/technical-stack.md) | TypeScript Guide |
| Project structuur begrijpen | [File Structure](./02-architecture/file-structure.md) | Complete |
| Feature-based module maken | [ADR-001](./02-architecture/adr/001-feature-based-architecture.md) | Implementation |
| Services extracteren | [ADR-002](./02-architecture/adr/002-accounting-module-refactoring.md) | Refactoring |
| **Git & Workflow** |||
| Branch naming | [Git Workflow](./07-workflow/README.md) | Branch Strategy |
| Commit message schrijven | [Git Workflow](./07-workflow/README.md) | Commit Conventions |
| Pull Request maken | [Git Workflow](./07-workflow/README.md) | PR Workflow |
| Code review doen | [Code Review Checklist](./07-workflow/code-review-checklist.md) | Complete |
| Release maken | [Git Workflow](./07-workflow/README.md) | Release Process |
| **Architecture & Decisions** |||
| Waarom feature-based structure? | [ADR-001](./02-architecture/adr/001-feature-based-architecture.md) | Context & Decision |
| Waarom geen Redux/MobX? | [ADR-003](./02-architecture/adr/003-no-state-management-library.md) | Context & Decision |
| Migreren naar src/ directory? | [ADR-004](./02-architecture/adr/004-src-directory-migration.md) | Proposed |
| Architecture decision maken | [ADR Template](./02-architecture/adr/template.md) | Complete |
| Refactoring plan | [Refactoring Plan](./02-architecture/refactoring-plan.md) | Complete |
| **User Features & Modules** |||
| Email naar offerte converteren | [Email Integration](./04-features/email-integration.md) | Email to Quote |
| Werkorder workflow begrijpen | [Workorder Workflow](./04-features/workorder-workflow.md) | Complete Flow |
| Gebruikersrechten begrijpen | [User Roles](./04-features/user-roles.md) | Permissions Matrix |
| Mobile app gebruiken | [Mobile Optimization](./04-features/mobile-optimization.md) | Mobile Guide |
| Module-specifieke features | [Modules Overview](./03-modules/overview.md) | Per Module |
| **Setup & Installation** |||
| Project installeren | [Installation](./01-getting-started/installation.md) | Complete |
| Snel starten | [Quick Start](./01-getting-started/quick-start.md) | Complete |
| Demo accounts gebruiken | [Demo Accounts](./01-getting-started/demo-accounts.md) | Login Credentials |
| Development environment | [Installation](./01-getting-started/installation.md) | Dev Setup |
| **Security & Best Practices** |||
| Security implementatie | [Security](./02-architecture/security.md) | Complete |
| Permission checks | [Security](./02-architecture/security.md) | Role-Based Access |
| Code review standards | [Code Review Checklist](./07-workflow/code-review-checklist.md) | Complete |
| **Documentation** |||
| ADR schrijven | [ADR Template](./02-architecture/adr/template.md) | Template |
| MD file optimaliseren | [MD Optimization Plan](./MD_OPTIMIZATION_PLAN.md) | Quality Checklist |
| AI assistant gebruiken | [AI Guide](./AI_GUIDE.md) | Complete |
| Documentatie updaten | [SCALING_GUIDE](./SCALING_GUIDE.md) | Doc Patterns |

### Voor Specifieke Situaties

```markdown
🆕 "Ik ben een nieuwe developer"
   → Start met: Installation → Quick Start → Technical Stack → File Structure

🔧 "Ik ga een nieuwe feature bouwen"
   → Lees: ADR-001 → Refactoring Plan → Code Review Checklist

📝 "Ik moet een architecture decision maken"
   → Gebruik: ADR Template → Review ADR-001/002/003 voor voorbeelden

🐛 "Ik ga een bug fixen"
   → Lees: Git Workflow (branch naming) → Code Review Checklist

🧪 "Ik ga tests schrijven"
   → Lees: Testing Strategy (PLANNED - zie MD_OPTIMIZATION_PLAN.md)

👀 "Ik moet code reviewen"
   → Gebruik: Code Review Checklist → Git Workflow (PR guidelines)

📱 "Ik werk aan mobile features"
   → Lees: Mobile Optimization → Responsive Design patterns

🔐 "Ik implementeer authentication/security"
   → Lees: Security → User Roles → Permission checks

📧 "Ik werk aan email features"
   → Lees: Email Integration → Workorder Workflow

📊 "Ik werk aan accounting/boekhouding"
   → Lees: ADR-002 (Accounting Refactoring) → Accounting Module docs

🎓 "Ik wil het project begrijpen"
   → Follow: Developer Onboarding learning path (2 uur)
```

---

## 🔧 Veelgebruikte Taken

### Als Admin
- [Een nieuwe medewerker toevoegen](./03-modules/hrm.md#medewerker-toevoegen)
- [Werkorder aanmaken en toewijzen](./03-modules/workorders.md#werkorder-aanmaken)
- [Offerte omzetten naar factuur](./03-modules/accounting.md#offerte-naar-factuur)
- [Module in- of uitschakelen](./03-modules/admin-settings.md#modules-beheren)
- [Email naar offerte converteren](./04-features/email-integration.md#email-naar-offerte)

### Als User
- [Werkorder starten](./03-modules/workorders.md#werkorder-starten)
- [Uren registreren](./03-modules/workorders.md#uren-registreren)
- [Taak voltooien](./03-modules/workorders.md#taak-voltooien)
- [Notificaties bekijken](./04-features/notifications.md#notificaties-bekijken)

---

## 📅 Versiegeschiedenis Highlights

| Versie | Datum | Belangrijkste Features |
|--------|-------|------------------------|
| **5.8.0** | Dec 2024 | 📧 Email Integratie & Drag-and-Drop |
| **5.7.0** | Nov 2024 | 📦 3 SKU Types + Categorieën |
| **5.2.0** | Oct 2024 | 📊 Boekhouding Module (MKB-ready) |
| **5.0.0** | Sep 2024 | 🛒 Webshop Module |
| **4.5.0** | Aug 2024 | 📱 Volledige Mobile Optimalisatie |
| **4.0.0** | Jul 2024 | 🔄 Werkorder Integratie |

[Bekijk volledige changelog →](./06-changelog/overview.md)

---

## 🔍 Zoeken in Documentatie

Gebruik de volgende keywords om snel te vinden wat je zoekt:

**Modules:** dashboard, inventory, pos, workorders, accounting, crm, hrm, planning, reports, webshop, admin, notifications

**Features:** email, workflow, mobile, permissions, security, api

**Taken:** login, install, add, edit, delete, assign, convert, export

---

## 🤖 Voor AI Assistenten

Als je een AI assistant bent die werkt aan dit project:
- Lees eerst [AI_GUIDE.md](./AI_GUIDE.md) voor development richtlijnen
- Volg de [SCALING_GUIDE.md](./SCALING_GUIDE.md) bij documentatie updates
- Raadpleeg [State Management](./02-architecture/state-management.md) voor data patterns
- Bekijk [Security](./02-architecture/security.md) voor permission checks

---

## 📞 Support & Contact

Voor vragen, bugs of feature requests:
- Open een issue in het project repository
- Raadpleeg de relevante documentatie sectie
- Contacteer het development team

---

## 📄 Licentie

Dit project is ontwikkeld voor intern gebruik. Alle rechten voorbehouden.

---

## 🎯 Quick Links

- [🚀 Quick Start](./01-getting-started/quick-start.md)
- [📚 Modules](./03-modules/overview.md)
- [👥 User Roles](./04-features/user-roles.md)
- [💻 Technical Stack](./02-architecture/technical-stack.md)
- [🔄 Changelog](./06-changelog/overview.md)
- [🤖 AI Guide](./AI_GUIDE.md)
- [📈 Scaling Guide](./SCALING_GUIDE.md)

---

**Laatste update**: December 2024
**Documentatie versie**: 1.0.0
**Systeem versie**: 5.8.0

**Veel succes met het Bedrijfsbeheer Dashboard! 🚀**
