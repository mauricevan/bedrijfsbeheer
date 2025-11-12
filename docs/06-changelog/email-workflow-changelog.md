# 📧 Email Drag & Drop Feature - Changelog

> **Project:** Bedrijfsbeheer 2.0  
> **Feature:** Email naar Offerte/Factuur/Werkorder Parsing  
> **Laatst bijgewerkt:** 11 november 2025

---

## 🎯 VOORTGANG OVERZICHT

### ✅ FASE 1: EMAIL CUSTOMER MAPPING SYSTEEM - **100% COMPLEET**
- [x] 1.1 - emailCustomerMapping.ts utility aangemaakt
- [x] 1.2 - QuoteEmailIntegration component updated
- [x] 1.3 - Preview Modal UI customer selection states
- [x] 1.4 - Mapping override logic geïmplementeerd

### 🔵 FASE 2: MULTI-OUTPUT WORKFLOW SYSTEEM - **20% COMPLEET**
- [x] 2.1 - Preview Modal Workflow Selection UI (5 cards)

### 🔵 FASE 2B: DASHBOARD WORKFLOW INTEGRATION - **28% COMPLEET**

#### ✅ Stap 2B.1 - Dashboard Props & State (Voltooid: 11 nov 2025)
- [x] Props interface uitgebreid met:
  - `employees: Employee[]`
  - `onWorkOrderCreated: (workOrder: WorkOrder) => void`
  - `onQuoteCreated: (quote: Quote) => void`
- [x] State toegevoegd:
  - `showWorkflowOptions: boolean`
  - `showWOAssignmentModal: boolean`
  - `pendingQuoteData: any`
- [x] handleClosePreview updated om nieuwe state te resetten

#### ✅ Stap 2B.2 - Workflow Toggle in Dashboard Email Preview Modal (Voltooid: 11 nov 2025)
**Locatie:** `/pages/Dashboard.tsx` - regel ~422-460

**Geïmplementeerde Features:**
- [x] State toegevoegd: `createWorkOrderWithQuote: boolean`
- [x] Toggle/checkbox UI toegevoegd met:
  - Label: "☐ Maak direct offerte + werkorder aan"
  - Subtitle: "Creëer automatisch een werkorder gekoppeld aan de offerte"
  - Hover effect op label (text kleur transitie)
- [x] Visuele feedback box bij toggle AAN:
  - Paarse achtergrond (bg-purple-50)
  - 🔧 Icoon
  - Titel: "Werkorder Workflow Actief"
  - Uitleg over medewerker toewijzing
  - Fade-in animatie
- [x] Dynamische button text:
  - Toggle UIT: "✓ Bevestigen"
  - Toggle AAN: "✓ Maak Offerte & Werkorder →"
- [x] Visuele button feedback bij toggle AAN:
  - Paarse achtergrond (bg-purple-600)
  - Border (border-2 border-purple-400)
  - Hover effect (hover:bg-purple-700)
  - Smooth transition-all
- [x] State reset in handleClosePreview

**Test Criteria:**
```
✓ Toggle checkbox werkt correct
✓ Feedback box verschijnt/verdwijnt met smooth animatie
✓ Button text wijzigt dynamisch
✓ Button styling wijzigt (blauw → paars)
✓ State reset bij modal sluiten
✓ Visueel onderscheid tussen toggle AAN/UIT
```

#### ✅ Stap 2B.3 - Implementeer Workflow Logic (Voltooid: 11 nov 2025)
**Locatie:** `/pages/Dashboard.tsx` + `/components/common/modals/WorkOrderAssignmentModal.tsx`

**Geïmplementeerde Features:**

1. **WorkOrderAssignmentModal Component Gemaakt** (`/components/common/modals/WorkOrderAssignmentModal.tsx`):
   - [x] Volledig functionele modal met form fields
   - [x] Medewerker dropdown (verplicht) met validatie
   - [x] Geplande datum picker (optioneel, default +7 dagen)
   - [x] Locatie text input (optioneel)
   - [x] Prioriteit selector (4 opties: low, normal, high, urgent) met visuele styling
   - [x] Notities textarea (optioneel, max 500 chars)
   - [x] Context info box met klant, geschatte uren, waarde
   - [x] Error display met validatie feedback
   - [x] Form reset on submit/cancel
   - [x] Export toegevoegd aan `/components/common/modals/index.ts`

2. **handleConfirmEmail() Updated**:
   - [x] Check `createWorkOrderWithQuote` state
   - [x] Als FALSE: toon placeholder alert (originele flow)
   - [x] Als TRUE: store email data in `pendingQuoteData` en open WorkOrderAssignmentModal
   - [x] Email mapping opslaan (als checkbox aan) - VOOR workflow check

3. **handleWorkOrderAssigned() Callback Geïmplementeerd**:
   - [x] Ontvang `assignmentData` van modal
   - [x] Validatie: customer en employee bestaan
   - [x] Create Quote object:
     - [x] Unique ID (`Q${timestamp}`)
     - [x] Customer link
     - [x] Email info in notes
     - [x] Location en scheduledDate van assignment
     - [x] Timestamps en history tracking
     - [x] workOrderId link
   - [x] Create WorkOrder object:
     - [x] Unique ID (`wo${timestamp}`)
     - [x] Title met customer name + email subject
     - [x] Description met email details
     - [x] Status: 'To Do'
     - [x] Assigned to selected employee
     - [x] Location, scheduledDate, priority, notes van assignment
     - [x] quoteId link
     - [x] Timestamps (created, assigned, converted)
     - [x] History entries (created + assigned)
   - [x] Bidirectional linking: `quote.workOrderId = workOrder.id`
   - [x] Callbacks: `onQuoteCreated(quote)` en `onWorkOrderCreated(workOrder)`
   - [x] Success alert met offerte ID en medewerker naam
   - [x] Close modals en reset state

4. **WorkOrderAssignmentModal Rendering**:
   - [x] Conditional rendering: alleen als `showWOAssignmentModal && pendingQuoteData`
   - [x] Props: isOpen, onClose, onAssign, employees, prefillData
   - [x] onClose handler: close modal, optioneel terug naar email preview
   - [x] Higher z-index (z-[60]) dan email preview modal (z-50)

**Test Criteria:**
```
✓ Toggle AAN + Bevestigen → WorkOrderAssignmentModal verschijnt
✓ Modal toont correcte customer name in context box
✓ Medewerker dropdown werkt, validation bij leeg
✓ Geplande datum default = today + 7 dagen
✓ Datum picker blokkeert dates in verleden
✓ Prioriteit buttons werken met visuele feedback
✓ Notities textarea werkt, character count toont
✓ "Toewijzen" button disabled als geen medewerker
✓ Submit → Quote EN WorkOrder aangemaakt
✓ Quote.workOrderId === WorkOrder.id (linking)
✓ WorkOrder.quoteId === Quote.id (linking)
✓ Success alert toont correcte info
✓ Modals sluiten na success
✓ Cancel button sluit modal, optioneel terug naar email preview
```

**TODO's / Toekomstige Verbeteringen:**
- [ ] Parse items en labor uit email voor Quote (nu leeg array)
- [ ] Parse estimated hours en cost uit email voor WorkOrder (nu 0)
- [ ] Toast notification ipv alert()
- [ ] Mogelijkheid om direct naar werkorder te navigeren na creatie

---

## 📋 VOLGENDE STAPPEN

### Prioriteit 1: Voltooien FASE 2B Dashboard Workflow
1. **Stap 2B.3** - Workflow logic implementatie
   - handleConfirmEmail updaten
   - WorkOrder creation logic
   - Quote ↔ WorkOrder linking
   
2. **Stap 2B.4** - WorkOrderAssignmentModal integreren
   - Modal component maken (of herbruiken van QuoteEmailIntegration als die bestaat)
   - Modal state management
   - Assignment form fields

3. **Stap 2B.5** - Testing & Refinement
   - Test complete workflow: email → toggle → assign → both created
   - Test edge cases
   - UI/UX polish

### Prioriteit 2: QuoteEmailIntegration Workflows Voltooien
- **Stap 2.2** - Quote Creation Workflow (nu alleen draft)
- **Stap 2.3** - Invoice Creation Workflow
- **Stap 2.4** - WorkOrder Creation Logic
- **Stap 2.5** - Edit in Form Workflow
- **Stap 2.6** - Workflow Router Function

---

## 🔍 TECHNISCHE DETAILS

### Dashboard.tsx State Management
```typescript
// Email Preview State
const [showEmailPreview, setShowEmailPreview] = useState(false);
const [previewEmail, setPreviewEmail] = useState<ParsedEmail | null>(null);
const [selectedCustomerId, setSelectedCustomerId] = useState('');
const [autoMatchedCustomer, setAutoMatchedCustomer] = useState<Customer | null>(null);
const [rememberMapping, setRememberMapping] = useState(false);

// FASE 2B: Dashboard Workflow State
const [showWorkflowOptions, setShowWorkflowOptions] = useState(false);
const [showWOAssignmentModal, setShowWOAssignmentModal] = useState(false);
const [pendingQuoteData, setPendingQuoteData] = useState<any>(null);
const [createWorkOrderWithQuote, setCreateWorkOrderWithQuote] = useState(false); // 🆕 Stap 2B.2
```

### Props Interface
```typescript
interface DashboardProps {
  inventory: InventoryItem[];
  sales: Sale[];
  workOrders: WorkOrder[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  customers: Customer[];
  onNavigateToAccounting?: () => void;
  
  // FASE 2B: Dashboard Workflow Props
  employees: Employee[];
  onWorkOrderCreated: (workOrder: WorkOrder) => void;
  onQuoteCreated: (quote: Quote) => void;
}
```

---

## 📝 DESIGN DECISIONS

### Workflow Toggle Locatie
**Beslissing:** Plaats toggle TUSSEN customer selection en email body preview

**Rationale:**
- Logische flow: klant kiezen → workflow bepalen → email zien → bevestigen
- Visuele hiërarchie: belangrijke acties bovenaan
- Consistent met QuoteEmailIntegration waar workflow NA customer komt

### Button Styling bij Toggle
**Beslissing:** Paarse kleur (purple-600) ipv blauw (primary)

**Rationale:**
- Visueel onderscheid tussen normale flow (blauw) en workflow (paars)
- Paars associatie met "advanced" / "extra actie"
- Border toevoegen voor extra emphasis
- Consistent met QuoteEmailIntegration waar quote-wo workflow ook paars is

### Feedback Box Animatie
**Beslissing:** Gebruik `animate-fade-in` voor smooth appearance

**Rationale:**
- Betere UX: geen abrupte verandering
- Trekt aandacht naar belangrijke info
- Professionele look & feel

---

## 🐛 BEKENDE ISSUES / TODO's

### Dashboard Workflow
- [ ] handleConfirmEmail roept nog alert() aan ipv echte workflow logic
- [ ] WorkOrderAssignmentModal bestaat nog niet in Dashboard context
- [ ] Quote creation logic nog niet geïmplementeerd in Dashboard
- [ ] Link naar Accounting pagina werkt (via onNavigateToAccounting) maar geen data wordt doorgegeven

### QuoteEmailIntegration
- [ ] Workflow logic voor invoice, quote-wo, invoice-wo, edit nog niet geïmplementeerd
- [ ] WorkOrderAssignmentModal bestaat als component maar wordt niet gebruikt
- [ ] handleConfirm maakt alleen quote aan, ongeacht selectedWorkflow

---

## 📊 STATISTIEKEN

| Metric | Status |
|--------|--------|
| **FASE 1** | ✅ 100% (4/4 stappen) |
| **FASE 2** | 🔵 20% (1/7 stappen) |
| **FASE 2B** | 🔵 28% (2/7 verwachte stappen) |
| **Totaal Components** | 2 (Dashboard, QuoteEmailIntegration) |
| **Totaal State Variables** | 9 (Dashboard), 7 (QuoteEmailIntegration) |
| **Nieuwe Utils** | 2 (emailCustomerMapping.ts, emailQuoteParser.ts) |

---

## 🎨 UI/UX IMPROVEMENTS

### Stap 2B.2 Highlights
1. **Checkbox met descriptive text** - Users weten precies wat ze activeren
2. **Hover feedback** - Interactive feel, label text wordt blauw
3. **Contextual info box** - Geen verrassingen, user weet wat te verwachten
4. **Dynamic button** - Duidelijk onderscheid tussen workflows
5. **Color coding** - Paars = advanced workflow, blauw = standaard

### Mogelijke Toekomstige Verbeteringen
- [ ] Tooltip bij toggle met extra uitleg
- [ ] Preview van werkorder details in feedback box
- [ ] Mogelijkheid om direct medewerker te selecteren in toggle sectie (skip modal)
- [ ] Keyboard shortcuts (bijv. Ctrl+W voor toggle)

---

**Laatste update:** 11 november 2025, 15:30  
**Volgende milestone:** Stap 2B.3 - Workflow Logic Implementation  
**Estimated completion FASE 2B:** ~3-4 stappen remaining
