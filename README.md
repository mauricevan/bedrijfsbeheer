# Bedrijfsbeheer Dashboard

**Versie:** 5.8.0 - Email Integratie & Automatische Offerte Creatie
**Status:** Productie-ready
**Laatst bijgewerkt:** December 2024

---

## 🎯 Project Overzicht

Een volledig geïntegreerd dashboard/backend-systeem waarmee de eigenaar alle bedrijfsprocessen kan overzien en regelen, en medewerkers alle tools hebben die nodig zijn om hun taken efficiënt uit te voeren.

### Belangrijkste Features

- 📊 **12+ Modules** - Dashboard, Voorraadbeheer, Werkorders, Boekhouding, CRM, HRM, en meer
- 📧 **Email Integratie** - Drag-and-drop .eml bestanden voor automatische offerte/taak creatie
- 🔄 **Werkorder Workflow** - Seamless Offerte → Werkorder → Factuur integratie
- 📦 **3 SKU Types** - Flexibel voorraadbeheersysteem met categorieën
- 💰 **MKB-ready Boekhouding** - NL-compliant grootboek en BTW-aangifte
- 📱 **Mobile-First Design** - Volledig responsive voor alle devices
- 👥 **Role-Based Access** - Admin en User permissies

---

## 🚀 Quick Start

### Installatie

```bash
# Clone repository
git clone <repository-url>
cd bedrijfsbeheer

# Installeer dependencies
npm install

# Start development server
npm run dev
```

Applicatie draait op `http://localhost:5173`

### Demo Login

**Admin Account:**
- Email: sophie@bedrijf.nl
- Wachtwoord: 1234

**User Account:**
- Email: jan@bedrijf.nl
- Wachtwoord: 1234

### Build voor Productie

```bash
npm run build
npm run preview
```

---

## 📚 Documentatie

**Volledige documentatie beschikbaar in `/docs/`**

### 🎓 Voor Nieuwe Gebruikers

Start hier om snel aan de slag te gaan:

- **[Master Index](./docs/INDEX.md)** - Complete documentatie overzicht
- **[Quick Start Guide](./docs/01-getting-started/quick-start.md)** - Snel aan de slag in 3 stappen
- **[Installation Guide](./docs/01-getting-started/installation.md)** - Gedetailleerde installatie instructies
- **[Demo Accounts](./docs/01-getting-started/demo-accounts.md)** - Test credentials en gebruikersrollen
- **[Modules Overview](./docs/03-modules/overview.md)** - Overzicht van alle modules

### 💻 Voor Developers

Technische documentatie en development guides:

- **[AI Guide](./docs/AI_GUIDE.md)** - Voor AI assistenten die werken aan het project
- **[Technical Stack](./docs/02-architecture/technical-stack.md)** - React 19, TypeScript, Tailwind CSS
- **[File Structure](./docs/02-architecture/file-structure.md)** - Project organisatie
- **[State Management](./docs/02-architecture/state-management.md)** - React Hooks patterns
- **[API Overview](./docs/05-api/overview.md)** - API architectuur en endpoints
- **[Security](./docs/02-architecture/security.md)** - Beveiliging en authenticatie

### 👥 Voor Admins

Administratie en gebruikersbeheer:

- **[User Roles & Permissions](./docs/04-features/user-roles.md)** - Complete rechten matrix
- **[Admin Settings](./docs/03-modules/admin-settings.md)** - Systeem configuratie
- **[HRM Module](./docs/03-modules/hrm.md)** - Personeelsbeheer

### 📖 Module Documentatie

Gedetailleerde guides per module:

- [Dashboard](./docs/03-modules/dashboard.md) - Overzicht & Email Drop Zone
- [Voorraadbeheer](./docs/03-modules/inventory.md) - 3 SKU types & Categorieën
- [Werkorders](./docs/03-modules/workorders.md) - Kanban Workboard
- [Boekhouding](./docs/03-modules/accounting.md) - Offertes, Facturen & Grootboek
- [CRM](./docs/03-modules/crm.md) - Klantrelatiebeheer
- [POS](./docs/03-modules/pos.md) - Kassasysteem
- [HRM](./docs/03-modules/hrm.md) - Personeelsbeheer
- [Planning](./docs/03-modules/planning.md) - Agenda systeem
- [Reports](./docs/03-modules/reports.md) - Rapportages & Analytics
- [Webshop](./docs/03-modules/webshop.md) - E-commerce beheer
- [Admin Settings](./docs/03-modules/admin-settings.md) - Systeem instellingen

### ✨ Feature Documentatie

Belangrijke functionaliteiten:

- **[Email Integration](./docs/04-features/email-integration.md)** - Drag-and-drop email workflow (V5.8)
- **[Workorder Workflow](./docs/04-features/workorder-workflow.md)** - End-to-end proces
- **[Mobile Optimization](./docs/04-features/mobile-optimization.md)** - Responsive design guide
- **[Notifications](./docs/04-features/notifications.md)** - Real-time alerts systeem

### 📅 Changelog

Versiegeschiedenis en release notes:

- **[Changelog Overview](./docs/06-changelog/overview.md)** - Alle versies overzicht
- **[Version 5.x](./docs/06-changelog/v5.x.md)** - Laatste releases (Email, Categorieën, Boekhouding)
- **[Version 4.x](./docs/06-changelog/v4.x.md)** - Werkorder Integratie, Mobile Optimalisatie
- **[Version 3.x en ouder](./docs/06-changelog/)** - Eerdere versies

### 🔧 Voor Maintainers

Documentatie onderhoud:

- **[Scaling Guide](./docs/SCALING_GUIDE.md)** - Hoe documentatie up-to-date houden

---

## 💻 Tech Stack

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4
- React Router 7
- Vite 6

**State Management:**
- React Hooks (useState, useMemo)
- Centralized state in App component

**Development:**
- Node.js v18+
- npm/yarn
- ESLint + TypeScript

[Lees meer over de technical stack →](./docs/02-architecture/technical-stack.md)

---

## 🏗 Project Structuur

```
bedrijfsbeheer/
├── components/          # Reusable React components
│   └── icons/           # SVG icon components
├── pages/               # Full page components
├── utils/               # Utility functions
│   └── email/           # Email parsing utilities
├── data/                # Initial/demo data
├── docs/                # 📚 Complete documentation
│   ├── INDEX.md         # Master documentation index
│   ├── AI_GUIDE.md      # Guide for AI assistants
│   ├── SCALING_GUIDE.md # Documentation maintenance
│   ├── 01-getting-started/
│   ├── 02-architecture/
│   ├── 03-modules/
│   ├── 04-features/
│   ├── 05-api/
│   └── 06-changelog/
├── server/              # Mock API server
└── README.md            # This file
```

[Lees meer over de file structure →](./docs/02-architecture/file-structure.md)

---

## 👥 Gebruikersrollen

### Admin (Manager Productie)
- ✅ Volledige toegang tot alle modules
- ✅ Modules in- en uitschakelen
- ✅ Medewerkers en rechten beheren
- ✅ Alle werkorders overzien

### User (Medewerker)
- ✅ Persoonlijk workboard
- ✅ Eigen werkorders beheren
- ✅ Uren registreren
- ❌ Beperkte toegang tot bepaalde modules

[Complete rechten matrix →](./docs/04-features/user-roles.md)

---

## 🔄 Belangrijkste Workflow

```
Offerte (Draft)
    ↓
Offerte (Geaccepteerd)
    ↓
📋 Maak Werkorder
    ↓
Werkorder (To Do → In Progress → Completed)
    ↓
🧾 Omzetten naar Factuur
    ↓
Factuur (Draft → Verzenden → Betaald)
```

[Lees meer over de workflow →](./docs/04-features/workorder-workflow.md)

---

## 🆕 Laatste Updates (V5.8.0)

### Email Integratie
- 📧 Drag-and-drop .eml bestanden naar dashboard
- 🤖 Automatische email parsing (items, prijzen, uren)
- 👤 Klant/lead matching op basis van email adres
- ⚡ Creëer offertes, taken of notificaties vanuit emails

### Voorraadbeheer (V5.7.0)
- 📦 3 SKU types: Leverancier, Automatisch, Aangepast
- 🏷️ Categorieën systeem met kleur badges
- 🔍 Uitgebreide zoeken in alle velden
- 🖱️ Dubbelklik om items te bewerken

### Boekhouding (V5.2.0)
- 💰 MKB-ready grootboek met NL-compliant BTW
- 📊 Financieel overzicht met Excel-achtige tabellen
- 📑 Klant/leverancier dossiers
- 🔄 Automatische journaalposten

[Bekijk volledige changelog →](./docs/06-changelog/overview.md)

---

## 🤖 Voor AI Assistenten

Als je een AI assistant bent die werkt aan dit project:

1. **Lees eerst:** [AI_GUIDE.md](./docs/AI_GUIDE.md) voor development richtlijnen
2. **Volg:** [SCALING_GUIDE.md](./docs/SCALING_GUIDE.md) bij documentatie updates
3. **Raadpleeg:** [State Management](./docs/02-architecture/state-management.md) voor data patterns
4. **Check:** [User Roles](./docs/04-features/user-roles.md) voor permission rules

**Belangrijkste principes:**
- 🔒 Altijd permission checks (Admin vs User)
- 🔄 Altijd immutable state updates
- 🔗 Altijd bidirectional synchronization (Offerte ↔ Werkorder ↔ Factuur)
- 🇳🇱 Altijd Nederlands in UI
- ✅ Altijd TypeScript types gebruiken

---

## 📞 Support & Contact

Voor vragen, bugs of feature requests:
- Raadpleeg de [documentatie](./docs/INDEX.md)
- Open een issue in het repository
- Contacteer het development team

---

## 📄 Licentie

Dit project is ontwikkeld voor intern gebruik. Alle rechten voorbehouden.

---

## 🎯 Snelle Links

| Categorie | Link |
|-----------|------|
| 📚 **Documentatie** | [Master Index](./docs/INDEX.md) |
| 🚀 **Quick Start** | [Quick Start Guide](./docs/01-getting-started/quick-start.md) |
| 🤖 **AI Guide** | [AI Development Guide](./docs/AI_GUIDE.md) |
| 💻 **Tech Stack** | [Technical Stack](./docs/02-architecture/technical-stack.md) |
| 👥 **User Roles** | [Permissions Matrix](./docs/04-features/user-roles.md) |
| 📦 **Modules** | [Modules Overview](./docs/03-modules/overview.md) |
| 🔄 **Changelog** | [Version History](./docs/06-changelog/overview.md) |
| 📈 **Scaling** | [Scaling Guide](./docs/SCALING_GUIDE.md) |

---

**Veel succes met het Bedrijfsbeheer Dashboard! 🚀**

**✨ Nieuwe feature in V5.8: Sleep emails naar het dashboard voor automatische offerte creatie! ✨**
