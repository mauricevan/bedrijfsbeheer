# 🤖 Claude AI Development Guide

> ⚠️ **STOP!** Lees dit voordat je code wijzigt! ⚠️

---

## 📋 Verplichte Checklist

**Voordat je ENIGE wijziging maakt:**

- [ ] ✅ Heb je **`docs/AI_GUIDE.md`** gelezen? (910 regels - KRITIEK!)
- [ ] ✅ Heb je **`docs/02-architecture/project-structure.md`** gecheckt?
- [ ] ✅ Heb je **het bestand dat je wijzigt** gelezen?
- [ ] ✅ Weet je of dit een **Admin of User feature** is?
- [ ] ✅ Heb je gecheckt of component **< 300 regels** blijft?

---

## 🚨 Kritieke Regels (NOOIT OVERTREDEN)

| Regel | Waarom | Check |
|-------|--------|-------|
| **Max 300 regels/component** | Onderhoudbaarheid | Componentgrootte na wijziging |
| **Max 200 regels/hook** | Testbaarheid | Hook complexity |
| **Services = pure functions** | Geen React in services! | Geen useState/useEffect |
| **Permission checks** | Security! | `currentUser?.isAdmin` |
| **Immutable updates** | Data integriteit | Spread operators `{...prev}` |
| **Barrel files** | Import consistency | `@/features/accounting/hooks` |
| **TypeScript types** | Type safety | Geen `any` types |
| **Nederlands in UI** | User experience | Alle labels/buttons/errors |

---

## 📁 Waar Hoort Wat?

```
Nieuwe hook?           → features/[module]/hooks/
Nieuwe UI component?   → components/[module]/
Pure functie?          → features/[module]/services/
Helper functie?        → features/[module]/utils/
Page component?        → pages/ (max 300 regels, alleen orchestratie!)
Types?                 → features/[module]/types/ of types/
```

**Voorbeeld Structuur:**
```
features/accounting/
  ├── hooks/          # useQuotes, useInvoices (business logic)
  ├── services/       # quoteService, invoiceService (pure functions)
  ├── utils/          # calculations, validators, formatters
  └── types/          # accounting.types.ts

components/accounting/
  ├── dashboard/      # AccountingDashboard, DashboardStats
  ├── quotes/         # QuoteList, QuoteForm, QuoteActions
  ├── invoices/       # InvoiceList, InvoiceForm, InvoiceActions
  └── transactions/   # TransactionList

pages/
  └── Accounting.tsx  # Alleen tab navigatie + component rendering
```

---

## 🔍 Workflow (Volg Altijd Deze Volgorde!)

```
1. 📖 READ
   └─ Het bestand dat je gaat wijzigen

2. 🏗️ CHECK ARCHITECTURE
   └─ docs/02-architecture/project-structure.md
   └─ Waar hoort deze code?

3. 🔐 VERIFY PERMISSIONS
   └─ Is dit Admin of User feature?
   └─ Welke permission checks zijn nodig?

4. 💻 CODE
   └─ Volg bestaande patronen
   └─ Gebruik barrel files voor imports
   └─ Immutable state updates

5. ✅ TEST
   └─ npm run build
   └─ Test beide rollen (Admin + User)

6. 📝 COMMIT
   └─ Duidelijke commit message
   └─ Update docs indien nodig
```

---

## ⚡ Snelle Checks (Voor Elke Wijziging)

**Security:**
- [ ] Is `currentUser?.isAdmin` check aanwezig? (bij create/edit/delete)
- [ ] Zijn disabled states toegevoegd voor unauthorized actions?
- [ ] Zijn error messages duidelijk in Nederlands?

**Code Quality:**
- [ ] Gebruik je spread operators? (`{...prev, ...updates}`)
- [ ] Gebruik je barrel files? (`import { useQuotes } from '@/features/accounting/hooks'`)
- [ ] Is component < 300 regels?
- [ ] Is hook < 200 regels?
- [ ] Zijn services pure functions? (geen useState/useEffect)
- [ ] Heb je TypeScript types gebruikt? (geen `any`)

**State Management:**
- [ ] Immutable updates? (geen direct mutations)
- [ ] useMemo voor derived state?
- [ ] Timestamps toegevoegd? (createdAt, updatedAt)

**Synchronization:**
- [ ] Bij Offerte wijziging: Werkorder gesynchroniseerd?
- [ ] Bij Werkorder wijziging: Offerte status geüpdatet?
- [ ] Bij Factuur creatie: Werkorder actualHours gebruikt?
- [ ] Bij voorraad wijziging: POS/Werkorder gecheckt?

---

## 📚 Volledige Documentatie

**Verplicht te lezen:**
- [**AI_GUIDE.md**](../docs/AI_GUIDE.md) - 910 regels met alle coding standards
- [**Project Structure**](../docs/02-architecture/project-structure.md) - Mappenstructuur & regels
- [**Refactoring Plan**](../docs/02-architecture/refactoring-plan.md) - Architectuur geschiedenis

**Referentie (bij twijfel):**
- [State Management](../docs/02-architecture/state-management.md) - State patterns & best practices
- [User Roles](../docs/04-features/user-roles.md) - Complete permission matrix
- [Workorder Workflow](../docs/04-features/workorder-workflow.md) - Data synchronisatie
- [Technical Stack](../docs/02-architecture/technical-stack.md) - Tech details

**Module Specifiek:**
- [Dashboard](../docs/03-modules/dashboard.md) - Email drop zone
- [Inventory](../docs/03-modules/inventory.md) - 3 SKU types
- [Work Orders](../docs/03-modules/workorders.md) - Kanban board
- [Accounting](../docs/03-modules/accounting.md) - Offertes & Facturen
- [CRM](../docs/03-modules/crm.md) - Klantbeheer

---

## 🆘 Twijfel Je?

**ASK FIRST, CODE LATER!**

Als je niet 100% zeker bent:
1. ✅ Check `docs/AI_GUIDE.md` sectie met vergelijkbare code
2. ✅ Zoek bestaande component als voorbeeld (bijv. QuoteList voor InvoiceList pattern)
3. ✅ Vraag user voor clarificatie

**Common Scenarios:**

**"Waar moet ik deze functie plaatsen?"**
→ Check [project-structure.md](../docs/02-architecture/project-structure.md)

**"Welke permissions zijn nodig?"**
→ Check [user-roles.md](../docs/04-features/user-roles.md)

**"Hoe sync ik Offerte ↔ Werkorder?"**
→ Check [AI_GUIDE.md](../docs/AI_GUIDE.md) sectie "Module Interacties"

**"Is deze wijziging Admin of User feature?"**
→ Default: Als het create/edit/delete is → Admin only

---

## 🎯 Test Accounts (Test ALTIJD Beide Rollen!)

**Admin Account:**
- Email: `sophie@bedrijf.nl`
- Password: `1234`
- Kan: Alles (create, edit, delete, view all)

**User Account:**
- Email: `jan@bedrijf.nl`
- Password: `1234`
- Kan: Alleen eigen werkorders, uren registreren
- Kan NIET: Create, edit, delete

**Test Checklist:**
- [ ] Werkt feature voor Admin?
- [ ] Zijn buttons disabled/hidden voor User?
- [ ] Zie User alleen eigen data?
- [ ] Zijn error messages duidelijk?

---

## 🔄 Common Patterns (Copy-Paste Ready)

### Permission Check
```typescript
// Admin only action
{currentUser?.isAdmin && (
  <button onClick={handleDelete}>
    Verwijder
  </button>
)}

// Show disabled for non-admin
<button
  disabled={!currentUser?.isAdmin}
  onClick={handleEdit}
  title={!currentUser?.isAdmin ? 'Alleen admins kunnen bewerken' : ''}
>
  Bewerk
</button>
```

### Immutable State Update
```typescript
// Adding item
setItems(prev => [...prev, newItem]);

// Updating item
setItems(prev => prev.map(item =>
  item.id === id
    ? { ...item, ...updates, updatedAt: new Date().toISOString() }
    : item
));

// Deleting item
setItems(prev => prev.filter(item => item.id !== id));
```

### Barrel File Import
```typescript
// ✅ GOED
import { useQuotes } from '@/features/accounting/hooks';
import { QuoteList } from '@/components/accounting/quotes';

// ❌ FOUT
import { useQuotes } from '../../features/accounting/hooks/useQuotes';
```

### Derived State with useMemo
```typescript
const filteredItems = useMemo(() =>
  items.filter(item => item.status === 'active'),
  [items]
);
```

---

## 🚀 Development Commands

```bash
# Start development
npm run dev

# Type checking
npm run type-check

# Build (ALWAYS before commit!)
npm run build

# Preview production build
npm run preview
```

---

## 📊 Code Review Checklist

Voor je commit:

**TypeScript:**
- [ ] Alle functies hebben type annotations
- [ ] Geen `any` types
- [ ] Props interfaces gedefineerd

**Security:**
- [ ] Permission checks aanwezig
- [ ] User filtering correct
- [ ] Error messages informatief

**State:**
- [ ] Immutable updates
- [ ] No direct mutations
- [ ] Timestamps toegevoegd

**Sync:**
- [ ] Offerte ↔ Werkorder bidirectional
- [ ] Status badges up-to-date
- [ ] Voorraad correct afgetrokken

**UX:**
- [ ] Loading states
- [ ] Error messages (Nederlands)
- [ ] Success confirmations
- [ ] Mobile responsive

**Build:**
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No console errors in browser

---

## 💡 Pro Tips

1. **Lees Bestaande Code Eerst**
   - Wil je InvoiceList wijzigen? Lees eerst QuoteList voor patronen
   - Consistentie is belangrijker dan perfectie

2. **Klein Beginnen**
   - 1 feature per keer
   - Test tussentijds
   - Commit vaak

3. **Types Zijn Je Vriend**
   - TypeScript voorkomt 90% van bugs
   - Als compiler klaagt, luister!

4. **Test Beide Rollen**
   - Admin ziet alles werken
   - User test toont permission bugs

5. **Vraag Bij Twijfel**
   - Beter 1 minuut vragen dan 1 uur fixen

---

## 🎓 Learning Path

**New to project?** Lees in deze volgorde:

1. [Quick Start Guide](../docs/01-getting-started/quick-start.md) (5 min)
2. Deze file (.claude/README.md) (10 min)
3. [AI_GUIDE.md](../docs/AI_GUIDE.md) (30 min)
4. [Project Structure](../docs/02-architecture/project-structure.md) (10 min)
5. [State Management](../docs/02-architecture/state-management.md) (15 min)
6. [User Roles](../docs/04-features/user-roles.md) (10 min)

**Total: ~80 minuten** voor volledig begrip van project

---

**Onthoud:**

🔒 **Safety > Speed**
📚 **Lees Docs > Guess Patterns**
✅ **Test Altijd > Assume It Works**

**Veel succes met development! 🚀**
