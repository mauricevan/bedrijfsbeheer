# ADR-001: Feature-Based Architecture

**Status:** ✅ Accepted
**Datum:** 2024-11-14
**Auteur:** Development Team
**Tags:** architecture, modularity, scalability

---

## 📋 Context

### Probleem
Het bedrijfsbeheer2.0 project groeide organisch en had een platte directory structuur:
- Alle componenten in één `components/` folder
- Business logic verspreid over verschillende bestanden
- Moeilijk te onderhouden bij groei (500+ componenten)
- Onduidelijk waar nieuwe code moet worden toegevoegd
- Coupling tussen niet-gerelateerde features
- Lange build times door gebrek aan modulaire grenzen

### Achtergrond
- Project bevat 12+ business modules (klanten, leveranciers, boekhouding, etc.)
- Team van 2-4 developers
- Frequente feature additions en updates
- Behoefte aan duidelijke code ownership
- Nieuwe teamleden moesten snel productief worden
- Geen state management library (React Context + localStorage)

---

## ✅ Beslissing

### Wat we hebben besloten
We adopteren een **feature-based directory structure** waarbij elke business module zijn eigen folder krijgt met volledige separation of concerns.

### Hoe we het implementeren
```
features/
└── [feature-name]/           # Business module (accounting, customers, etc.)
    ├── hooks/                # Custom hooks (business logic)
    │   ├── useFeature.ts     # Main CRUD hook
    │   ├── useFeatureForm.ts # Form validation hook
    │   └── index.ts          # Barrel export
    ├── services/             # Pure functions (no React)
    │   ├── featureService.ts # Business logic
    │   └── index.ts
    ├── utils/                # Helper functions
    │   ├── validators.ts
    │   ├── formatters.ts
    │   └── index.ts
    ├── types/                # TypeScript types
    │   ├── feature.types.ts
    │   └── index.ts
    ├── README.md            # Feature documentation
    └── index.ts             # Main barrel export
```

### Implementatie voorbeeld
```typescript
// features/accounting/index.ts
export { useAccounting } from './hooks/useAccounting';
export { useAccountingForm } from './hooks/useAccountingForm';
export { calculateBalance } from './services/accountingService';
export { validateEntry, formatAmount } from './utils';
export type { AccountingEntry, Balance } from './types';

// Usage in pages/AccountingPage.tsx
import {
  useAccounting,
  calculateBalance,
  type AccountingEntry
} from '@/features/accounting';

export const AccountingPage = () => {
  const { entries, addEntry } = useAccounting();
  const balance = calculateBalance(entries);

  return <div>{/* UI */}</div>;
};
```

---

## 📊 Consequenties

### ✅ Voordelen
- **Modulaire structuur** - Features zijn zelfstandige units die los in/uit kunnen worden geschakeld
- **Duidelijke ownership** - Elke developer kan eigenaar zijn van specifieke features
- **Betere onboarding** - Nieuwe teamleden kunnen starten met één feature zonder hele codebase te kennen
- **Snellere development** - Developers kunnen parallel aan verschillende features werken zonder conflicts
- **Testbaarheid** - Elke feature kan afzonderlijk worden getest
- **Herbruikbaarheid** - Services en utils zijn pure functions die gemakkelijk te hergebruiken zijn
- **Type safety** - TypeScript types zijn georganiseerd per feature
- **Schaalbaar** - Toevoegen van nieuwe features schaalt lineair (geen exponentiële complexiteit)

### ⚠️ Nadelen / Trade-offs
- **Initiële migratie effort** - Bestaande code moet worden gereorganiseerd (geschat 3-4 weken)
- **Code duplication risk** - Shared logic moet expliciet worden geëxtraheerd naar `utils/` of `hooks/`
- **Learning curve** - Team moet nieuwe structuur leren en conventions volgen
- **Meer directories** - Diepere folder nesting kan overweldigend lijken in eerste instantie
- **Disciplinering vereist** - Team moet consistent blijven in het volgen van de structuur

**Mitigatie:**
- Geleidelijke migratie per feature (zie [ADR-002](./002-accounting-module-refactoring.md))
- Shared code extractie naar `src/hooks/` en `src/utils/` voor cross-feature logic
- Documentatie met voorbeelden ([PROJECT_STRUCTURE_PATTERNS.md](../../../prompt-repo/PROJECT_STRUCTURE_PATTERNS.md))
- Code review checklist om consistentie te waarborgen

### 🔄 Impact op Team
- **Developer Experience:** Positief - minder context switching, duidelijke structuur
- **Learning Curve:** 1-2 weken om gewend te raken aan nieuwe structuur
- **Onboarding:** Aanzienlijk verbeterd - nieuwe developers kunnen starten met één feature
- **Workflow:** Meer parallel work mogelijk door duidelijke module grenzen

### 📈 Impact op Codebase
- **Migration Effort:** 3-4 weken voor volledige migratie van alle features
- **Breaking Changes:** Alleen import paths wijzigen (geen API changes)
- **Backward Compatibility:** Oude componenten blijven werken tijdens migratie
- **Technical Debt:** Vermindert tech debt door duidelijke separatie van concerns

---

## 🔍 Alternatieven Overwogen

### Alternatief 1: Layer-Based Structure (MVC-achtig)
**Beschrijving:**
```
src/
├── components/     # Alle UI componenten
├── hooks/          # Alle custom hooks
├── services/       # Alle business logic
├── utils/          # Alle helpers
└── types/          # Alle TypeScript types
```

**Waarom niet gekozen:**
- Bij 500+ componenten wordt `components/` folder onbeheersbaar
- Geen duidelijke module grenzen - alles is global
- Moeilijk om feature ownership toe te wijzen
- Hoge coupling tussen features (alles kan alles aanroepen)

**Wanneer wel geschikt:**
- Kleine projecten (<50 componenten)
- Eén developer die hele codebase overziet
- Weinig business modules (1-3 domeinen)

### Alternatief 2: Monorepo met Packages
**Beschrijving:**
```
packages/
├── accounting/       # Volledig geïsoleerd package
├── customers/        # Eigen package.json, versioning
└── suppliers/        # Kan gepubliceerd worden naar npm
```

**Waarom niet gekozen:**
- Te veel overhead voor huidige projectgrootte
- Build tooling complexiteit (Nx, Turborepo, Lerna)
- Overkill voor single-application project
- Geen behoefte aan package publishing
- Team van 2-4 developers (niet 20+)

**Wanneer wel geschikt:**
- Multi-application ecosysteem
- Code delen tussen apps
- Grote teams (10+ developers)
- Microservices architecture

### Alternatief 3: Status Quo (Platte structuur)
**Waarom niet gekozen:**
- Schaalt niet bij groei (al 500+ bestanden in `components/`)
- Geen duidelijke separatie tussen features
- Moeilijk te onderhouden
- Lange onboarding tijd voor nieuwe developers
- Veel merge conflicts door gebrek aan module grenzen

---

## 📚 Referenties

### Gerelateerde ADRs
- [ADR-002: Accounting Module Refactoring](./002-accounting-module-refactoring.md) - Eerste feature migratie
- [ADR-004: Src Directory Migration](./004-src-directory-migration.md) - Migratie naar `src/` structuur

### Externe Resources
- [Project Structure Patterns](https://github.com/mauricevan/prompt/blob/main/PROJECT_STRUCTURE_PATTERNS.md)
- [React File Structure Best Practices](https://react.dev/learn/thinking-in-react#step-1-break-the-ui-into-a-component-hierarchy)
- [Feature-Sliced Design](https://feature-sliced.design/)

### Interne Documentatie
- [Refactoring Plan](../refactoring-plan.md) - Implementatie details
- [Implementation Roadmap](../../IMPLEMENTATION_ROADMAP.md) - Uitrol planning
- [Project Structure](../../01-getting-started/project-structure.md) - Huidige structuur

---

## 📝 Change Log

| Datum | Wijziging | Auteur |
|-------|-----------|--------|
| 2024-11-14 | ADR created (status: Accepted) | Development Team |
| 2024-11-14 | Accounting module refactoring started | Development Team |

---

## ✅ Implementatie Status

### Completed Features ✅
- `features/accounting/` - Volledig gemigreerd met hooks, services, utils, types
- ADR structure opgezet
- Documentation templates aangemaakt

### In Progress 🚧
- Migratie van overige business modules (klanten, leveranciers, etc.)
- `src/` directory restructuring ([ADR-004](./004-src-directory-migration.md))

### Planned 📋
- Shared component library extractie
- Feature-specific testing setup
- Performance monitoring per feature

---

**Laatste review:** 14 november 2024
**Next review:** Na completion van fase 2 modules
