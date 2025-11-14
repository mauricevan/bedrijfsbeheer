# ADR-004: Migration to src/ Directory Structure

**Status:** 🚧 Proposed
**Datum:** 2024-11-14
**Auteur:** Development Team
**Tags:** refactoring, structure, best-practices, tooling

---

## 📋 Context

### Probleem
De huidige directory structuur plaatst alle broncode in de project root:
```
bedrijfsbeheer2.0/
├── components/
├── features/
├── hooks/
├── pages/
├── utils/
├── App.tsx
├── main.tsx
└── index.html
```

Dit veroorzaakt problemen:
- **Tooling confusion** - Build tools moeten expliciet configured worden welke folders te includen
- **Import paths** - Lange relative imports (`../../../components/...`)
- **Typescript config** - Moet weten welke directories zijn source vs config
- **Testing** - Test files verspreid tussen source files
- **Convention mismatch** - De meeste React projecten gebruiken `src/` directory

### Achtergrond
- Vite default template gebruikt `src/` directory
- Create React App gebruikt `src/` directory
- Next.js gebruikt `app/` of `pages/` directory (maar ook vaak `src/`)
- Industry standard: **source code in `src/`, config in root**
- Huidige setup werkt, maar is niet idiomatisch

---

## ✅ Beslissing

### Wat we voorstellen
**Migreer alle source code naar `src/` directory.**

### Hoe we het implementeren
```
bedrijfsbeheer2.0/
├── src/                      # 👈 NEW - All source code
│   ├── components/
│   ├── features/
│   │   └── accounting/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── utils/
│   │       └── types/
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── public/                   # Static assets
├── docs/                     # Documentation
├── tests/                    # Test suites (E2E, integration)
├── .github/                  # CI/CD configs
├── vite.config.ts           # Build config
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies
└── index.html               # Entry point
```

### Migratie stappen
```bash
# 1. Create src/ directory
mkdir src

# 2. Move source code
mv components/ src/
mv features/ src/
mv hooks/ src/
mv pages/ src/
mv utils/ src/
mv types/ src/
mv App.tsx src/
mv main.tsx src/

# 3. Update index.html
# Change: <script src="/main.tsx">
# To:     <script src="/src/main.tsx">

# 4. Update vite.config.ts
# No changes needed - Vite auto-detects src/

# 5. Update tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"]
}

# 6. Update imports
# From: import { X } from '../components/X'
# To:   import { X } from '@/components/X'

# 7. Test build
npm run build

# 8. Test dev server
npm run dev
```

### Implementatie voorbeeld

**Before:**
```typescript
// pages/AccountingPage.tsx (in root)
import { useAccounting } from '../features/accounting';
import { Header } from '../components/common/Header';
import { formatDate } from '../utils/dateUtils';
```

**After:**
```typescript
// src/pages/AccountingPage.tsx
import { useAccounting } from '@/features/accounting';
import { Header } from '@/components/common/Header';
import { formatDate } from '@/utils/dateUtils';
```

---

## 📊 Consequenties

### ✅ Voordelen
- **Industry standard** - Volgt React/Vite conventions
- **Cleaner root** - Alleen config files in root, source in `src/`
- **Better tooling** - IDEs autoconfigure voor `src/` directory
- **Absolute imports** - `@/components/X` instead of `../../../components/X`
- **Clear separation** - Source vs config vs docs vs tests
- **Onboarding** - Nieuwe developers verwachten `src/` directory
- **Build optimization** - Vite/Webpack weten precies wat te bundelen
- **Prettier ignore** - Makkelijker om build output te excluden

### ⚠️ Nadelen / Trade-offs
- **Migration effort** - 1-2 uur werk om files te verplaatsen en imports te updaten
- **Git history** - File moves kunnen git blame/history compliceren
- **Breaking change** - Alle import paths wijzigen (maar tooling helpt)
- **Learning curve** - Team moet wennen aan `@/` imports (minimaal)

**Mitigatie:**
- **Git history**: `git log --follow` blijft werken voor file history
- **Imports**: VS Code kan auto-update imports bij file moves
- **Testing**: Gradual migration mogelijk (start met `main.tsx`, dan `App.tsx`, etc.)
- **Rollback**: Makkelijk terug te draaien als problematisch

### 🔄 Impact op Team
- **Developer Experience:** Positief - cleaner project structure
- **Learning Curve:** Minimaal - `@/` imports zijn intuïtief
- **Onboarding:** Verbeterd - matches expectations van nieuwe developers
- **IDE Support:** Beter - autocomplete werkt beter met `src/`

### 📈 Impact op Codebase
- **Migration Effort:** 1-2 uur
- **Breaking Changes:** Alle imports (maar auto-fixable)
- **Lines of Code Changed:** ~200 import statements
- **Risk Level:** LOW - Vite handles `src/` out-of-the-box

---

## 🔍 Alternatieven Overwogen

### Alternatief 1: Status Quo (root-level directories)
**Waarom niet gekozen:**
- Niet idiomatisch in React ecosystem
- Tooling moet expliciete config
- Root directory rommelig met source + config
- Nieuwe developers verwachten `src/`

**Wanneer wel geschikt:**
- Zeer kleine projecten (single-file apps)
- Non-standard build setups
- Legacy projects waar migratie te risicovol is

### Alternatief 2: lib/ directory (zoals libraries)
**Beschrijving:**
```
bedrijfsbeheer2.0/
├── lib/          # Source code
└── dist/         # Build output
```

**Waarom niet gekozen:**
- `lib/` is conventie voor **library packages**, niet apps
- Bedrijfsbeheer2.0 is application, geen library
- Zou verwarring creëren

**Wanneer wel geschikt:**
- Reusable library packages (npm publish)
- Monorepo packages
- Shared component libraries

### Alternatief 3: app/ directory (Next.js style)
**Beschrijving:**
```
bedrijfsbeheer2.0/
├── app/          # App source code
└── public/       # Static assets
```

**Waarom niet gekozen:**
- `app/` is Next.js 13+ convention (App Router)
- We gebruiken Vite + React Router, niet Next.js
- Zou verwarring creëren met framework specifics

**Wanneer wel geschikt:**
- Next.js projects met App Router
- Server-side rendering apps
- File-based routing systems

---

## 📚 Referenties

### Gerelateerde ADRs
- [ADR-001: Feature-Based Architecture](./001-feature-based-architecture.md) - Structure blijft hetzelfde, alleen in `src/`

### Externe Resources
- [Vite Project Structure](https://vitejs.dev/guide/#index-html-and-project-root)
- [React File Structure Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)

### Interne Documentatie
- [Project Structure](../../01-getting-started/project-structure.md)
- [Refactoring Plan](../refactoring-plan.md)

---

## ✅ Review Checklist

Voordat deze ADR wordt geaccepteerd:

- [ ] Team heeft beslissing gereviewd
- [ ] Migration script is getest in branch
- [ ] Build succesvol na migratie
- [ ] Dev server werkt na migratie
- [ ] Alle tests passen na migratie
- [ ] Import paths zijn bijgewerkt
- [ ] Git history is gepreserveerd
- [ ] Stakeholders zijn geïnformeerd

---

## 📝 Change Log

| Datum | Wijziging | Auteur |
|-------|-----------|--------|
| 2024-11-14 | ADR created (status: Proposed) | Development Team |

---

## 🎯 Implementatie Plan

### Fase 1: Preparation (30 min)
- [ ] Create `src/` directory
- [ ] Update `tsconfig.json` with paths
- [ ] Update `vite.config.ts` (if needed)
- [ ] Update `index.html` script tag

### Fase 2: Migration (30 min)
- [ ] Move `main.tsx` to `src/main.tsx`
- [ ] Move `App.tsx` to `src/App.tsx`
- [ ] Move all directories (`components/`, `features/`, etc.) to `src/`
- [ ] Run VS Code "Update Imports" refactoring

### Fase 3: Verification (30 min)
- [ ] Test dev server: `npm run dev`
- [ ] Test build: `npm run build`
- [ ] Run tests: `npm run test`
- [ ] Check git diff for unintended changes
- [ ] Verify hot reload still works

### Fase 4: Cleanup
- [ ] Update `.gitignore` if needed
- [ ] Update documentation with new paths
- [ ] Commit met duidelijke message: `refactor: migrate source code to src/ directory`

### Rollback Plan
Als problemen optreden:
```bash
git revert <commit-hash>
# Or
git reset --hard HEAD~1
```

---

**Huidige status:** 🚧 Awaiting team review en approval
**Aanbeveling:** Accepteren - low risk, high benefit, industry standard
