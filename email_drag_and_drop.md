# 📧 EMAIL DRAG & DROP - IMPLEMENTATIE PLAN

> **Project:** Bedrijfsbeheer 2.0  
> **Feature:** Email naar Offerte/Factuur/Werkorder Parsing  
> **Laatst bijgewerkt:** 11 november 2025  
> **Status:** 🟢 **FASE 4.1-4.4 COMPLEET** - Admin Interface Live

---

## 🎯 DOEL

Een complete workflow implementeren waarbij gebruikers Outlook emails (.eml) kunnen slepen naar de applicatie en deze automatisch worden omgezet naar:
- Offertes (draft)
- Facturen (draft)
- Werkorders (met medewerker toewijzing)

Met persistent email → customer mapping voor automatische herkenning bij herhaalde emails.

---

## 📊 VOORTGANG OVERZICHT

- **Totaal fases:** 8
- **Totaal stappen:** 47
- **Voltooid:** 50
- **In progress:** 0
- **Te doen:** 16

---

## ✅ FASE 1: EMAIL CUSTOMER MAPPING SYSTEEM

### Doel
Implementeer persistent opslag van email → customer koppelingen zodat emails automatisch herkend worden bij herhaald gebruik.

---

### STAP 1.1: Create emailCustomerMapping.ts Utility

- [x] **1.1.1** - Maak nieuw bestand `utils/emailCustomerMapping.ts`
- [x] **1.1.2** - Definieer TypeScript interface `EmailCustomerMapping`
  - [ ] email: string
  - [ ] customerId: string
  - [ ] mappedBy: string
  - [ ] mappedAt: string (ISO timestamp)
  - [ ] lastUsed: string (ISO timestamp)
  - [ ] usageCount: number
  - [ ] notes?: string (optioneel)
- [x] **1.1.3** - Implementeer `saveEmailCustomerMapping(email, customerId, userId)` functie
- [x] **1.1.4** - Implementeer `getCustomerByEmail(email)` functie (return customerId of null)
- [x] **1.1.5** - Implementeer `updateEmailCustomerMapping(email, newCustomerId, userId)` functie
- [x] **1.1.6** - Implementeer `getAllEmailMappings()` functie (return array van alle mappings)
- [x] **1.1.7** - Implementeer `deleteEmailMapping(email)` functie
- [x] **1.1.8** - Implementeer `getMappingStats()` functie (return statistieken)
- [x] **1.1.9** - Gebruik localStorage als persistence layer (key: `emailCustomerMappings`)

**Test Criteria:**
```
✓ Mapping kan worden opgeslagen in localStorage
✓ Mapping kan worden opgehaald via email
✓ Mapping kan worden geupdate
✓ Mapping kan worden verwijderd
✓ Alle mappings kunnen worden opgehaald
✓ Stats worden correct berekend
✓ localStorage data persistent blijft na refresh
```

**Test Code:**
```typescript
// Console tests uit te voeren in browser
saveEmailCustomerMapping('test@example.com', 'customer_123', 'user_1');
console.log(getCustomerByEmail('test@example.com')); // Should return 'customer_123'
console.log(getAllEmailMappings()); // Should return array met 1 mapping
console.log(getMappingStats()); // Should return stats object
```

---

### STAP 1.2: Update QuoteEmailIntegration Component

- [x] **1.2.1** - Import `emailCustomerMapping` utility in component
- [x] **1.2.2** - Voeg state toe: `autoMatchedCustomer: Customer | null`
- [x] **1.2.3** - Voeg state toe: `rememberMapping: boolean` (voor checkbox)
- [x] **1.2.4** - Update `handleDrop` functie:
  - [x] Na email parsing, extract sender email
  - [x] Roep `getCustomerByEmail(senderEmail)` aan
  - [x] Als mapping gevonden: auto-select customer in dropdown
  - [x] Als mapping gevonden: set `autoMatchedCustomer` state
  - [x] Als mapping NIET gevonden: state blijft null
- [x] **1.2.5** - Update customer selection rendering:
  - [x] Toon "🆕 Nieuwe email" indicator als geen mapping
  - [x] Toon "✓ Automatisch herkend" indicator als mapping bestaat
  - [x] Toon "Laatst gebruikt: [date]" als mapping bestaat
- [x] **1.2.6** - Voeg checkbox toe: "☐ Onthoud deze koppeling voor toekomstige emails"
  - [x] Checked state: `rememberMapping`
  - [x] onChange handler
- [x] **1.2.7** - Update `handleConfirm` functie:
  - [x] Als `rememberMapping === true`: roep `saveEmailCustomerMapping()` aan
  - [x] Alert/Toast melding: "✓ Email gekoppeld aan [Customer Name]"

**Test Criteria:**
```
✓ Bij nieuwe email (geen mapping): dropdown staat leeg, indicator toont "🆕 Nieuwe email"
✓ Bij herkende email: dropdown auto-select juiste klant, indicator toont "✓ Automatisch herkend"
✓ Checkbox "Onthoud koppeling" werkt correct
✓ Bij aanvinken checkbox: mapping wordt opgeslagen in localStorage
✓ Toast melding verschijnt bij opslaan mapping
✓ Na refresh: herkende email wordt nog steeds auto-selected
```

**Test Scenario:**
1. Sleep nieuwe email van `newcustomer@example.com`
2. Selecteer klant "ACME Corp"
3. Vink checkbox "Onthoud koppeling" aan
4. Bevestig (maak offerte)
5. Refresh pagina
6. Sleep WEER email van `newcustomer@example.com`
7. Verifieer: "ACME Corp" is auto-selected

---

### STAP 1.3: Update Preview Modal UI - Customer Selection States

- [x] **1.3.1** - Create drie verschillende customer selection renders:
  - [x] **STATE A:** Nieuwe email (geen mapping)
    - [x] Dropdown met "-- Kies een klant --"
    - [x] Indicator: "🆕 Nieuwe email, selecteer handmatig een klant"
    - [x] Checkbox: "☐ Onthoud deze koppeling"
  - [x] **STATE B:** Herkende email (mapping bestaat)
    - [x] Dropdown auto-selected op gematchte klant
    - [x] Indicator: "✓ Automatisch gekoppeld"
    - [x] Toon "Laatst gebruikt: [datum]"
  - [x] **STATE C:** Override (user wijzigt mapping)
    - [x] Warning: "⚠️ Je wijzigt de koppeling van: [email]"
    - [x] "Van: [Old Customer] → [New Customer]"
    - [x] Checkbox: "☑ Onthoud deze nieuwe koppeling"
- [x] **1.3.2** - Conditional rendering op basis van `autoMatchedCustomer` state
- [x] **1.3.3** - Styling voor verschillende states (kleuren, icons)

**Test Criteria:**
```
✓ STATE A toont correct voor nieuwe email
✓ STATE B toont correct voor herkende email
✓ STATE C toont correct bij wijziging klant
✓ Override warning toont correcte oude en nieuwe klant namen
✓ Checkbox "Onthoud nieuwe koppeling" is auto-checked bij override
✓ Visueel onderscheid tussen de drie states (icons, kleuren)
```

**Test Scenario:**
1. Test STATE A: Nieuwe email zonder mapping
2. Test STATE B: Bekende email met mapping
3. Test STATE C: Bekende email, wijzig klant naar andere klant
4. Verifieer warning en auto-checked checkbox

---

### STAP 1.4: Implement Mapping Override Logic

- [x] **1.4.1** - Voeg state toe: `isOverriding: boolean` (impliciet via logica)
- [x] **1.4.2** - Voeg state toe: `originalCustomerId: string | null` (via autoMatchedCustomer)
- [x] **1.4.3** - Detect override:
  - [x] Als `autoMatchedCustomer` bestaat EN `selectedCustomerId !== autoMatchedCustomer.id`
  - [x] Detectie via conditional check in UI en handleConfirm
- [x] **1.4.4** - Update `handleConfirm`:
  - [x] Als override: roep `updateEmailCustomerMapping()` aan
  - [x] Alert: "✓ Koppeling gewijzigd van [Old Customer] naar [New Customer]"

**Test Criteria:**
```
✓ Override wordt gedetecteerd wanneer user andere klant selecteert
✓ updateEmailCustomerMapping() wordt aangeroepen ipv saveEmailCustomerMapping()
✓ Oude mapping wordt vervangen door nieuwe in localStorage
✓ Toast melding toont correcte oude en nieuwe klant namen
✓ Bij volgende email: nieuwe mapping wordt gebruikt
```

**Test Scenario:**
1. Email van `test@example.com` is gekoppeld aan "Customer A"
2. Sleep email, auto-select toont "Customer A"
3. Wijzig dropdown naar "Customer B"
4. Verifieer warning verschijnt
5. Bevestig
6. Refresh, sleep WEER email van `test@example.com`
7. Verifieer: nu auto-select "Customer B"

---

## ✅ FASE 2B: DASHBOARD WORKFLOW (EMAIL TO QUOTE+WORKORDER)

### Doel
Implementeer dashboard workflow: email drop → customer matching → workflow toggle → edit modal → assignment modal → quote + workorder creation.

### Status Update
**FASE 2B:** ✅ **100% COMPLEET** (7/7 stappen)
- ✅ 2B.1 - Props & State Setup
- ✅ 2B.2 - Workflow Toggle UI
- ✅ 2B.3 - End-to-End Testing & Bug Fixes (11 nov 2025)
- ✅ 2B.4-2B.7 - Alle workflow stappen geïmplementeerd

**Production Status:** ✅ **READY FOR DEPLOYMENT** (v4.6.1)

---

## 🔵 FASE 2: MULTI-OUTPUT WORKFLOW SYSTEEM (ACCOUNTING MODULE)

### Doel
Implementeer 5 verschillende workflow opties in Accounting module: Offerte, Factuur, Offerte+WO, Factuur+WO, Bewerken in Form.

### Status
**FASE 2 (Accounting):** 🔵 **20% COMPLEET** - Alleen basic state setup

---

### STAP 2.1: Update Preview Modal - Workflow Selection UI

- [ ] **2.1.1** - Voeg state toe: `selectedWorkflow: 'quote' | 'invoice' | 'quote-wo' | 'invoice-wo' | 'edit' | null`
- [ ] **2.1.2** - Create workflow selection section in modal (na customer selection, voor parsed data)
- [ ] **2.1.3** - Implementeer 5 workflow cards/buttons:
  - [ ] **Card 1:** "📋 Offerte (Draft)" - Maak concept offerte aan
  - [ ] **Card 2:** "🧾 Factuur (Direct)" - Maak direct factuur aan
  - [ ] **Card 3:** "📋➜🔧 Offerte + Werkorder" - Offerte én werkorder
  - [ ] **Card 4:** "🧾➜🔧 Factuur + Werkorder" - Factuur én werkorder
  - [ ] **Card 5:** "✏️ Bewerken in Formulier" - Open form voor handmatige aanpassing
- [ ] **2.1.4** - Styling:
  - [ ] Hover effect op cards
  - [ ] Selected state (border/background kleur)
  - [ ] Icon + titel + beschrijving per card
- [ ] **2.1.5** - Validation: Workflow moet geselecteerd zijn voor confirmatie

**Test Criteria:**
```
✓ 5 workflow cards zijn zichtbaar in preview modal
✓ Cards zijn klikbaar en tonen selected state
✓ Alleen 1 workflow kan tegelijk selected zijn
✓ "Bevestigen" knop is disabled als geen workflow selected
✓ Visueel onderscheid tussen de 5 workflows (icons, kleuren)
```

**Test Scenario:**
1. Open preview modal met email data
2. Klik op elke workflow card
3. Verifieer selected state verschijnt
4. Verifieer andere cards deselecteren
5. Verifieer bevestig knop enabled/disabled correct

---

### STAP 2.2: Implement Quote Creation Workflow (Bestaand)

- [ ] **2.2.1** - Workflow 1 "Offerte (Draft)" is al geïmplementeerd ✅
- [ ] **2.2.2** - Verifieer bestaande functionaliteit werkt correct
- [ ] **2.2.3** - Update voor nieuwe workflow selector (roep aan bij selectedWorkflow === 'quote')
- [ ] **2.2.4** - Zorg dat email mapping wordt opgeslagen (als checkbox aan)
- [ ] **2.2.5** - Toast melding: "✓ Concept offerte aangemaakt"
- [ ] **2.2.6** - Close modal na success
- [ ] **2.2.7** - Optional: Auto-scroll naar nieuwe offerte in lijst

**Test Criteria:**
```
✓ Offerte wordt aangemaakt met correcte data
✓ Customer is correct gekoppeld
✓ Items en labor zijn correct geparset
✓ Status is 'draft'
✓ Offerte verschijnt in Offertes lijst
✓ Toast melding verschijnt
✓ Modal sluit na success
```

**Test Scenario:**
1. Sleep email met product data
2. Selecteer customer
3. Kies workflow "Offerte (Draft)"
4. Bevestig
5. Verifieer offerte in lijst staat met status "draft"

---

### STAP 2.3: Implement Invoice Creation Workflow

- [ ] **2.3.1** - Create functie `createInvoiceFromEmail(parsedData, customerId, currentUser)`
- [ ] **2.3.2** - Generate invoice number via `generateInvoiceNumber()`
- [ ] **2.3.3** - Create Invoice object:
  - [ ] Map parsed items naar InvoiceItem[]
  - [ ] Map parsed labor naar InvoiceLabor[]
  - [ ] Calculate subtotal, VAT, total
  - [ ] Set status = 'draft'
  - [ ] Set issueDate = today
  - [ ] Set dueDate = today + 14 dagen
  - [ ] Set createdBy = currentUser.employeeId
  - [ ] Add timestamps.created
  - [ ] Add history entry: "Factuur aangemaakt vanuit email parsing"
- [ ] **2.3.4** - Add sourceMetadata:
  - [ ] sourceType: 'email'
  - [ ] emailFrom
  - [ ] emailSubject
  - [ ] emailDate
- [ ] **2.3.5** - Callback `onInvoiceCreated(invoice)`
- [ ] **2.3.6** - Toast: "✓ Factuur [INV-XXX] aangemaakt"
- [ ] **2.3.7** - Switch naar Invoices tab
- [ ] **2.3.8** - Highlight nieuwe factuur (scroll + temporary highlight)

**Test Criteria:**
```
✓ Factuur wordt aangemaakt met correct nummer
✓ Items en labor correct gemapped
✓ Totalen correct berekend (subtotal, VAT, total)
✓ Status is 'draft'
✓ Issue date = vandaag
✓ Due date = vandaag + 14 dagen
✓ Factuur verschijnt in Facturen lijst
✓ Auto-switch naar Invoices tab
✓ Toast melding verschijnt met factuur nummer
```

**Test Scenario:**
1. Sleep email met product data
2. Selecteer customer
3. Kies workflow "Factuur (Direct)"
4. Bevestig
5. Verifieer auto-switch naar Invoices tab
6. Verifieer factuur in lijst met status "draft"

---

### STAP 2.4: Implement WorkOrder Creation Logic

- [ ] **2.4.1** - Create functie `createWorkOrderFromEmail(parsedData, customerId, assigneeId, additionalData, currentUser)`
- [ ] **2.4.2** - Create WorkOrder object:
  - [ ] id: `wo${Date.now()}`
  - [ ] title: `[Customer Name] - Email: [Subject]`
  - [ ] description: Include email details en body (eerste 500 chars)
  - [ ] status: 'To Do'
  - [ ] assignedTo: assigneeId (from user selection)
  - [ ] assignedBy: currentUser.employeeId
  - [ ] customerId: customerId
  - [ ] location: additionalData.location of customer address
  - [ ] scheduledDate: additionalData.scheduledDate of today + 7 dagen
  - [ ] priority: additionalData.priority of 'normal'
- [ ] **2.4.3** - Map parsed items naar requiredInventory:
  - [ ] Filter items met inventoryItemId
  - [ ] Array van {itemId, quantity}
- [ ] **2.4.4** - Calculate estimations:
  - [ ] estimatedHours: sum van parsed labor hours
  - [ ] estimatedCost: total van parsed data
- [ ] **2.4.5** - Add source metadata:
  - [ ] sourceType: 'email'
  - [ ] sourceEmail: sender email
  - [ ] quoteId of invoiceId (als van quote/invoice workflow)
- [ ] **2.4.6** - Add timestamps:
  - [ ] created: now
  - [ ] assigned: now
  - [ ] converted: now (als van quote/invoice)
- [ ] **2.4.7** - Add history entries:
  - [ ] "Werkorder aangemaakt vanuit email parsing door [User]"
  - [ ] "Toegewezen aan [Assignee] door [User]"
- [ ] **2.4.8** - Add notes from additionalData.notes

**Test Criteria:**
```
✓ WorkOrder wordt aangemaakt met uniek ID
✓ Title bevat customer name en email subject
✓ Description bevat email details
✓ Status is 'To Do'
✓ Assigned to correct employee
✓ Required inventory correct gemapped
✓ Estimated hours/cost correct berekend
✓ Timestamps correct ingevuld
✓ History entries toegevoegd
```

**Test Scenario:**
1. Prepareer parsed email data met items en labor
2. Roep createWorkOrderFromEmail() aan met test data
3. Verifieer WorkOrder object compleet is
4. Verifieer alle velden correct ingevuld
5. Console log WorkOrder voor inspectie

---

### STAP 2.5: Implement "Edit in Form" Workflow

- [ ] **2.5.1** - Create sub-modal: "Wat wil je bewerken?"
  - [ ] Radio buttons: "Offerte Formulier" of "Factuur Formulier"
  - [ ] State: `editFormType: 'quote' | 'invoice' | null`
- [ ] **2.5.2** - Bij "Offerte Formulier" selectie:
  - [ ] Prepare QuoteFormPrefillData object
  - [ ] Callback: `onOpenQuoteForm(prefillData)`
  - [ ] Close preview modal
- [ ] **2.5.3** - Bij "Factuur Formulier" selectie:
  - [ ] Prepare InvoiceFormPrefillData object
  - [ ] Callback: `onOpenInvoiceForm(prefillData)`
  - [ ] Close preview modal
- [ ] **2.5.4** - In Accounting.tsx: handle `onOpenQuoteForm`:
  - [ ] Call `quoteForm.setFields(prefillData)`
  - [ ] Set `showQuoteForm = true`
  - [ ] Optional: scroll naar form
- [ ] **2.5.5** - In Accounting.tsx: handle `onOpenInvoiceForm`:
  - [ ] Call `invoiceForm.setFields(prefillData)`
  - [ ] Set `showInvoiceForm = true`
  - [ ] Switch naar Invoices tab
  - [ ] Optional: scroll naar form

**Test Criteria:**
```
✓ Sub-modal "Wat wil je bewerken?" verschijnt bij workflow "Edit in Form"
✓ Radio buttons werken correct
✓ Bij "Offerte": form opent met pre-filled data
✓ Bij "Factuur": form opent met pre-filled data EN switch naar Invoices tab
✓ Alle velden correct ingevuld (items, labor, customer, notes)
✓ User kan data wijzigen en opslaan zoals normale flow
✓ Preview modal sluit na form open
```

**Test Scenario:**
1. Sleep email met data
2. Kies workflow "Bewerken in Formulier"
3. Selecteer "Offerte Formulier"
4. Verifieer Quote Form opent met alle data
5. Wijzig een item
6. Save offerte
7. Verifieer offerte correct opgeslagen
8. Repeat voor "Factuur Formulier"

---

### STAP 2.6: Implement Workflow Router Function

- [ ] **2.6.1** - Create functie `handleWorkflowSelection(workflow, parsedData, selectedCustomerId, mappingSettings)`
- [ ] **2.6.2** - Switch statement voor alle workflows:
  ```
  switch(workflow) {
    case 'quote': → createQuoteFromEmail()
    case 'invoice': → createInvoiceFromEmail()
    case 'quote-wo': → toon WorkOrderAssignmentModal (next fase)
    case 'invoice-wo': → toon WorkOrderAssignmentModal (next fase)
    case 'edit': → toon EditFormSelectionModal
  }
  ```
- [ ] **2.6.3** - Handle email mapping save (als checkbox aan):
  - [ ] Voor alle workflows behalve 'edit'
  - [ ] Call saveEmailCustomerMapping() of updateEmailCustomerMapping()
- [ ] **2.6.4** - Error handling voor alle workflows
- [ ] **2.6.5** - Success feedback (toast) voor alle workflows
- [ ] **2.6.6** - Close preview modal na success (behalve voor WO workflows die sub-modal tonen)

**Test Criteria:**
```
✓ Elke workflow roept correcte functie aan
✓ Email mapping wordt opgeslagen voor alle workflows (behalve edit)
✓ Toast meldingen correct voor elke workflow
✓ Modal sluit correct (direct of na sub-modal)
✓ Error handling werkt (toon error, blijf op modal)
```

**Test Scenario:**
1. Test workflow 'quote': verifieer createQuoteFromEmail() wordt aangeroepen
2. Test workflow 'invoice': verifieer createInvoiceFromEmail() wordt aangeroepen
3. Test workflow 'edit': verifieer sub-modal verschijnt
4. Verifieer email mapping opgeslagen voor quote/invoice workflows
5. Test error scenario (bijv. geen customer selected)

---

## ✅ FASE 3: WERKORDER TOEWIJZING MODAL

### Doel
Implementeer modal voor werkorder toewijzing aan medewerker, voor workflows "Offerte + Werkorder" en "Factuur + Werkorder".

---

### STAP 3.1: Create WorkOrderAssignmentModal Component

- [ ] **3.1.1** - Create nieuw bestand: `components/common/modals/WorkOrderAssignmentModal.tsx`
- [ ] **3.1.2** - Definieer Props interface:
  ```
  interface WorkOrderAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (assignmentData: WorkOrderAssignmentData) => void;
    employees: Employee[];
    prefillData: {
      customerName: string;
      estimatedHours: number;
      estimatedCost: number;
    };
  }
  ```
- [ ] **3.1.3** - Definieer WorkOrderAssignmentData interface:
  ```
  interface WorkOrderAssignmentData {
    assigneeId: string;
    scheduledDate?: string;
    location?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    notes?: string;
  }
  ```
- [ ] **3.1.4** - Implement modal structure met overlay en centered content
- [ ] **3.1.5** - Styling consistent met andere modals in app

**Test Criteria:**
```
✓ Component compileert zonder errors
✓ Modal toont correct wanneer isOpen = true
✓ Modal verbergt wanneer isOpen = false
✓ Overlay click roept onClose aan
✓ Styling consistent met andere modals
```

**Test Scenario:**
1. Import component in test file
2. Render met isOpen=true
3. Verifieer modal verschijnt
4. Click overlay
5. Verifieer onClose callback aangeroepen

---

### STAP 3.2: Implement Form Fields in WorkOrderAssignmentModal

- [ ] **3.2.1** - **Medewerker Dropdown (VERPLICHT)**
  - [ ] State: `selectedAssignee: string`
  - [ ] Dropdown met alle employees
  - [ ] Filter: alleen employees die werkorders kunnen doen (check role/permissions)
  - [ ] Placeholder: "-- Kies een medewerker --"
  - [ ] Validatie: moet ingevuld zijn
  - [ ] Error state als niet ingevuld bij submit
- [ ] **3.2.2** - **Geplande Datum (Optioneel)**
  - [ ] State: `scheduledDate: string`
  - [ ] Date input type="date"
  - [ ] Default: today + 7 dagen
  - [ ] Min: today (geen dates in verleden)
- [ ] **3.2.3** - **Locatie (Optioneel)**
  - [ ] State: `location: string`
  - [ ] Text input
  - [ ] Placeholder: "Bijv. Hoofdkantoor, [adres]"
  - [ ] Optional: pre-fill met customer address als beschikbaar
- [ ] **3.2.4** - **Prioriteit (Optioneel)**
  - [ ] State: `priority: 'low' | 'normal' | 'high' | 'urgent'`
  - [ ] Dropdown met 4 opties
  - [ ] Default: 'normal'
  - [ ] Visuele indicators (kleuren/icons)
- [ ] **3.2.5** - **Notities (Optioneel)**
  - [ ] State: `notes: string`
  - [ ] Textarea (3-5 regels)
  - [ ] Placeholder: "Extra instructies voor de medewerker..."
  - [ ] Max length: 500 characters

**Test Criteria:**
```
✓ Medewerker dropdown toont alle geschikte employees
✓ Datum picker werkt, default = today + 7 dagen
✓ Datum picker blokkeert dates in verleden
✓ Locatie tekstveld werkt
✓ Prioriteit dropdown werkt, default = normal
✓ Notities textarea werkt
✓ Character limit (500) werkt voor notities
```

**Test Scenario:**
1. Open modal met employee data
2. Verifieer alle velden zichtbaar en werken
3. Selecteer medewerker
4. Kies datum in verleden → verifieer niet mogelijk
5. Kies datum in toekomst → verifieer werkt
6. Vul alle velden in
7. Verifieer data correct in state

---

### STAP 3.3: Implement Validation and Submit Logic

- [ ] **3.3.1** - Validation functie `validateAssignment()`:
  - [ ] Check: assigneeId mag niet empty zijn
  - [ ] Return: {isValid: boolean, errors: string[]}
- [ ] **3.3.2** - Submit handler `handleAssign()`:
  - [ ] Roep validateAssignment() aan
  - [ ] Als invalid: toon error messages, return early
  - [ ] Als valid: prepare WorkOrderAssignmentData object
  - [ ] Call onAssign(assignmentData) callback
  - [ ] Reset form state
  - [ ] Close modal
- [ ] **3.3.3** - Cancel handler `handleCancel()`:
  - [ ] Reset form state
  - [ ] Call onClose()
- [ ] **3.3.4** - Error state rendering:
  - [ ] Toon error message onder medewerker dropdown als niet ingevuld
  - [ ] Red border om veld
  - [ ] Disable submit knop als validation faalt

**Test Criteria:**
```
✓ Validation werkt: leeg assigneeId = error
✓ Error message verschijnt onder medewerker dropdown
✓ Submit knop disabled als validation faalt
✓ Submit succesvol met valide data: onAssign wordt aangeroepen
✓ onAssign krijgt correct WorkOrderAssignmentData object
✓ Modal sluit na succesvolle submit
✓ Cancel knop reset form en sluit modal
```

**Test Scenario:**
1. Open modal
2. Klik "Toewijzen" zonder medewerker te selecteren
3. Verifieer error message verschijnt
4. Selecteer medewerker
5. Verifieer error verdwijnt
6. Klik "Toewijzen"
7. Verifieer onAssign callback met correcte data
8. Verifieer modal sluit

---

### STAP 3.4: Display Prefill Data (Context Info)

- [ ] **3.4.1** - Toon context box bovenaan modal met prefillData:
  ```
  ┌─────────────────────────────────────┐
  │ 💼 WERKORDER DETAILS                │
  ├─────────────────────────────────────┤
  │ Klant: [customerName]               │
  │ Geschatte uren: [estimatedHours]u   │
  │ Waarde: €[estimatedCost]            │
  └─────────────────────────────────────┘
  ```
- [ ] **3.4.2** - Styling: background kleur, border, padding
- [ ] **3.4.3** - Formatting: currency format voor cost
- [ ] **3.4.4** - Optional: icon per regel (🏢 klant, ⏱️ uren, 💰 waarde)

**Test Criteria:**
```
✓ Context box zichtbaar bovenaan modal
✓ Customer name correct getoond
✓ Estimated hours correct getoond
✓ Estimated cost correct geformatteerd (€X.XX)
✓ Styling consistent en leesbaar
```

**Test Scenario:**
1. Open modal met test prefillData
2. Verifieer alle drie velden correct getoond
3. Verifieer currency formatting klopt
4. Verifieer visueel aantrekkelijk

---

### STAP 3.5: Integrate Modal in Quote+WO Workflow

- [ ] **3.5.1** - In QuoteEmailIntegration: voeg state toe `showWOAssignmentModal: boolean`
- [ ] **3.5.2** - In `handleWorkflowSelection`:
  - [ ] Bij workflow === 'quote-wo': set `showWOAssignmentModal = true`
  - [ ] Store parsed data in temporary state voor gebruik in modal
- [ ] **3.5.3** - Render WorkOrderAssignmentModal na preview modal
- [ ] **3.5.4** - Handle `onAssign` callback:
  ```
  1. Create Quote: createQuoteFromEmail()
  2. Create WorkOrder: createWorkOrderFromEmail(..., assignmentData)
  3. Link: quote.workOrderId = workOrder.id
  4. Link: workOrder.quoteId = quote.id
  5. Callbacks: onQuoteCreated(quote) + onWorkOrderCreated(workOrder)
  6. Toast: "✓ Offerte en werkorder aangemaakt, toegewezen aan [Naam]"
  7. Close beide modals
  ```
- [ ] **3.5.5** - Handle `onClose`: return to workflow selection (blijf op preview modal)

**Test Criteria:**
```
✓ Bij workflow "Offerte + Werkorder": WO assignment modal verschijnt
✓ Preview modal blijft open achter WO modal (of verbergt)
✓ Data flow correct: parsed data → assignment modal → WO creation
✓ Quote EN WorkOrder beide aangemaakt
✓ Quote.workOrderId en WorkOrder.quoteId correct linked
✓ Toast melding toont assignee naam
✓ Beide modals sluiten na success
✓ Bij cancel: terug naar workflow selection
```

**Test Scenario:**
1. Sleep email met data
2. Selecteer customer
3. Kies workflow "Offerte + Werkorder"
4. Verifieer WO assignment modal verschijnt
5. Selecteer medewerker "Jan Jansen"
6. Vul datum in
7. Klik "Toewijzen"
8. Verifieer quote aangemaakt in Offertes lijst
9. Verifieer werkorder aangemaakt in WorkOrders module
10. Verifieer linkage: quote heeft workOrderId, WO heeft quoteId
11. Verifieer toast toont "Jan Jansen"

---

### STAP 3.6: Integrate Modal in Invoice+WO Workflow

- [ ] **3.6.1** - Similar aan stap 3.5, maar voor 'invoice-wo' workflow
- [ ] **3.6.2** - In `handleWorkflowSelection`:
  - [ ] Bij workflow === 'invoice-wo': set `showWOAssignmentModal = true`
- [ ] **3.6.3** - Handle `onAssign` callback:
  ```
  1. Create Invoice: createInvoiceFromEmail()
  2. Create WorkOrder: createWorkOrderFromEmail(..., assignmentData)
  3. Link: invoice.workOrderId = workOrder.id
  4. Link: workOrder.invoiceId = invoice.id
  5. Callbacks: onInvoiceCreated(invoice) + onWorkOrderCreated(workOrder)
  6. Toast: "✓ Factuur en werkorder aangemaakt"
  7. Switch naar Invoices tab
  8. Close modals
  ```

**Test Criteria:**
```
✓ Bij workflow "Factuur + Werkorder": WO assignment modal verschijnt
✓ Invoice EN WorkOrder beide aangemaakt
✓ Invoice.workOrderId en WorkOrder.invoiceId correct linked
✓ Toast melding correct
✓ Auto-switch naar Invoices tab
✓ Modals sluiten na success
```

**Test Scenario:**
1. Repeat test van stap 3.5 maar met "Factuur + Werkorder" workflow
2. Verifieer factuur aangemaakt in Invoices lijst
3. Verifieer werkorder aangemaakt
4. Verifieer linkage correct
5. Verifieer auto-switch naar Invoices tab

---

### STAP 3.7: Implement Employee Notifications

- [ ] **3.7.1** - Check of app heeft notificatie systeem (check `setNotifications` callback)
- [ ] **3.7.2** - Als ja: create functie `createWorkOrderAssignmentNotification(workOrder, assignee)`
- [ ] **3.7.3** - Notification object:
  ```
  {
    id: `notif${Date.now()}`,
    type: 'workorder',
    title: "🔧 Nieuwe Werkorder Toegewezen",
    message: `Je hebt een nieuwe werkorder voor ${customerName}. 
              Geschatte uren: ${hours}u, Geplande datum: ${date}`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/workorders/${workOrderId}`,
    recipientId: assigneeId
  }
  ```
- [ ] **3.7.4** - Roep aan na WO creation: `setNotifications(prev => [notification, ...prev])`
- [ ] **3.7.5** - Optional: email notificatie (future feature, voor nu skip)

**Test Criteria:**
```
✓ Als notificatie systeem beschikbaar: notification wordt aangemaakt
✓ Notification bevat correcte data (customer, uren, datum)
✓ Notification toegevoegd aan notifications state
✓ Notification verschijnt in notifications dropdown/list
✓ Notification heeft actionUrl naar werkorder
✓ RecipientId correct (toegewezen medewerker)
```

**Test Scenario:**
1. Maak werkorder via email met toewijzing aan medewerker
2. Check notifications state/list
3. Verifieer notification aanwezig voor toegewezen medewerker
4. Klik notification
5. Verifieer navigatie naar werkorder detail

---

## ✅ FASE 4: ADMIN BEHEER INTERFACE

### Doel
Implementeer admin interface voor beheer van email → customer koppelingen: overzicht, toevoegen, wijzigen, verwijderen, import/export.

### Status Update
**FASE 4 (Admin Interface):** ✅ **85% COMPLEET** (11 nov 2025)
- ✅ 4.1 - AdminSettings Tab (COMPLEET)
- ✅ 4.2 - Display Email Mappings Table (COMPLEET)
- ✅ 4.3 - Delete Functionality (COMPLEET)
- ✅ 4.4 - Manual Add Functionality (COMPLEET)
- ✅ 4.7 - Statistics Dashboard (COMPLEET - 4 cards geïmplementeerd)
- ⏸️ 4.5 - Bulk Delete (OPTIONEEL - nog niet geïmplementeerd)
- ⏸️ 4.6 - Export/Import CSV (OPTIONEEL - nog niet geïmplementeerd)

**Production Status:** ✅ **READY FOR USE** - Core functionaliteit compleet

---

### STAP 4.1: Extend AdminSettings Component - New Tab

- [x] **4.1.1** - Open `components/AdminSettings.tsx`
- [x] **4.1.2** - Voeg nieuwe tab toe aan tab lijst: "Email Koppelingen"
- [x] **4.1.3** - Voeg state toe: `activeTab` (extend met nieuwe optie)
- [x] **4.1.4** - Create tab content section voor "Email Koppelingen"
- [x] **4.1.5** - Conditional rendering: toon alleen als admin
- [x] **4.1.6** - Basic layout: header, tabel, action buttons

**Test Criteria:**
```
✓ Nieuwe tab "Email Koppelingen" zichtbaar in AdminSettings
✓ Tab klikbaar en toont content
✓ Alleen zichtbaar voor admin users
✓ Niet zichtbaar voor non-admin users
```

**Test Scenario:**
1. Login als admin
2. Open Admin Settings
3. Verifieer tab "Email Koppelingen" aanwezig
4. Klik tab
5. Verifieer tab content toont (leeg voor nu)
6. Logout, login als non-admin
7. Verifieer tab niet zichtbaar

---

### STAP 4.2: Display Email Mappings Table

- [x] **4.2.1** - State: `emailMappings: EmailCustomerMapping[]`
- [x] **4.2.2** - useEffect: load mappings on mount bij tab change
- [x] **4.2.3** - Render tabel met kolommen:
  - [x] Email Adres
  - [x] Klant ID (met badge styling)
  - [x] Laatste Gebruik (datum formatted Nederlands)
  - [x] Aantal Keer Gebruikt (met kleurcodering)
  - [x] Acties (delete button)
- [x] **4.2.4** - Styling: Tailwind table classes met responsive design
- [x] **4.2.5** - Empty state: "Geen email koppelingen gevonden" met instructies
- [x] **4.2.6** - Sorting: standaard op "Laatste Gebruik" (nieuwste eerst)

**Test Criteria:**
```
✓ Tabel toont alle email mappings uit localStorage
✓ Alle kolommen correct getoond
✓ Klant naam correct opgehaald (niet alleen ID)
✓ Datum formatting correct (Nederlands)
✓ Aantal gebruikt correct
✓ Empty state toont als geen mappings
✓ Sorting werkt (nieuwste eerst)
```

**Test Scenario:**
1. Voeg handmatig 3 test mappings toe via console:
   ```
   saveEmailCustomerMapping('test1@example.com', 'cust1', 'user1');
   saveEmailCustomerMapping('test2@example.com', 'cust2', 'user1');
   ```
2. Open Admin Settings → Email Koppelingen tab
3. Verifieer 3 rows in tabel
4. Verifieer alle data correct
5. Clear localStorage, refresh
6. Verifieer empty state

---

### STAP 4.3: Implement Delete Functionality

- [x] **4.3.1** - Delete button per row (🗑️ icon met "Verwijder" tekst)
- [x] **4.3.2** - Click handler `handleDeleteMapping(email)`:
  - [x] Confirmation dialog via `window.confirm()`
  - [x] Bij ja: `deleteEmailMapping(email)` + update state
  - [x] Alert: "✓ Koppeling verwijderd"
- [x] **4.3.3** - Error handling met try-catch blok
- [x] **4.3.4** - State sync met localStorage werkt correct

**Test Criteria:**
```
✓ Delete button zichtbaar per row
✓ Confirmation dialog verschijnt bij click
✓ Bij "Nee": geen actie
✓ Bij "Ja": mapping verwijderd uit localStorage
✓ Mapping verdwijnt uit tabel
✓ Toast melding verschijnt
```

**Test Scenario:**
1. Tabel met 3 mappings
2. Klik delete bij mapping 2
3. Verifieer confirmation dialog
4. Klik "Nee"
5. Verifieer mapping nog in tabel
6. Klik delete opnieuw
7. Klik "Ja"
8. Verifieer mapping verdwenen uit tabel EN localStorage
9. Refresh pagina
10. Verifieer mapping nog steeds weg

---

### STAP 4.4: Implement Manual Add Functionality

- [x] **4.4.1** - Button: "+ Handmatig Toevoegen" bovenaan met SVG plus icon
- [x] **4.4.2** - State: `showAddMappingModal: boolean`
- [x] **4.4.3** - Modal geïmplementeerd met form fields:
  - [x] Email input (type="email", required)
  - [x] Customer ID input (met hint om uit CRM te kopiëren)
  - [x] Notities textarea (optioneel, max 500 chars)
  - [x] "Toevoegen" en "Annuleren" buttons
- [x] **4.4.4** - Validation geïmplementeerd:
  - [x] Email niet leeg + @ check
  - [x] Customer ID required
  - [x] Duplicate email check
- [x] **4.4.5** - Submit handler compleet:
  - [x] Validation + saveEmailCustomerMapping()
  - [x] State update + localStorage sync
  - [x] Alert: "✓ Koppeling toegevoegd"
  - [x] Modal close + form reset
- [x] **4.4.6** - Error handling met alerts

**Test Criteria:**
```
✓ "Handmatig Toevoegen" button werkt
✓ Modal verschijnt met form
✓ Email validation werkt (format check)
✓ Customer dropdown werkt
✓ Duplicate check werkt (error als email al bestaat)
✓ Submit met valide data: mapping opgeslagen
✓ Nieuwe mapping verschijnt in tabel
✓ Modal sluit na success
```

**Test Scenario:**
1. Klik "+ Handmatig Toevoegen"
2. Verifieer modal opent
3. Vul invalid email in → verifieer error
4. Vul valid email in die al bestaat → verifieer duplicate error
5. Vul nieuwe valid email + customer in
6. Klik "Toevoegen"
7. Verifieer mapping in tabel EN localStorage
8. Test mapping werkt bij email drop

---

### STAP 4.5: Implement Bulk Delete

- [ ] **4.5.1** - Checkbox per row voor selectie
- [ ] **4.5.2** - State: `selectedMappings: string[]` (array van emails)
- [ ] **4.5.3** - "Select All" checkbox in table header
- [ ] **4.5.4** - Button: "Verwijder Geselecteerd (X)" (disabled als geen selectie)
- [ ] **4.5.5** - Click handler `handleBulkDelete()`:
  - [ ] Confirmation: "Weet je zeker dat je X koppelingen wilt verwijderen?"
  - [ ] Bij ja: loop over selectedMappings, roep `deleteEmailMapping()` aan voor elk
  - [ ] Update state: filter alle geselecteerde mappings uit array
  - [ ] Clear selectie: `setSelectedMappings([])`
  - [ ] Toast: "✓ X koppelingen verwijderd"

**Test Criteria:**
```
✓ Checkboxes per row werken
✓ "Select All" werkt (selecteert alle rows)
✓ "Verwijder Geselecteerd" button enabled/disabled correct
✓ Button toont aantal geselecteerde mappings
✓ Confirmation dialog correct (toont aantal)
✓ Bulk delete verwijdert alle geselecteerde mappings
✓ Toast toont correct aantal
```

**Test Scenario:**
1. Tabel met 5 mappings
2. Selecteer 3 mappings via checkboxes
3. Verifieer button toont "(3)"
4. Klik button
5. Verifieer confirmation voor 3 mappings
6. Bevestig
7. Verifieer 3 mappings verwijderd, 2 blijven
8. Test "Select All" → verwijder alles

---

### STAP 4.6: Implement Export/Import Functionality

#### Export:

- [ ] **4.6.1** - Button: "Export CSV" bovenaan
- [ ] **4.6.2** - Click handler `handleExport()`:
  - [ ] Get all mappings: `getAllEmailMappings()`
  - [ ] Convert naar CSV format:
    ```
    Email,Customer ID,Customer Name,Mapped At,Last Used,Usage Count
    test@example.com,cust123,ACME Corp,2025-11-10,2025-11-10,5
    ```
  - [ ] Create Blob met CSV data
  - [ ] Trigger download: filename = `email-mappings-${date}.csv`
- [ ] **4.6.3** - Toast: "✓ Export gestart (X koppelingen)"

#### Import:

- [ ] **4.6.4** - Button: "Import CSV" bovenaan
- [ ] **4.6.5** - File input (hidden) type="file" accept=".csv"
- [ ] **4.6.6** - Click handler `handleImport(file)`:
  - [ ] Read CSV file
  - [ ] Parse rows (skip header)
  - [ ] Validate each row:
    - [ ] Email format correct
    - [ ] Customer ID exists
  - [ ] Voor elke valide row: `saveEmailCustomerMapping()`
  - [ ] Track: successes, errors
  - [ ] Toast: "✓ Import compleet: X toegevoegd, Y fouten"
  - [ ] Reload tabel

**Test Criteria:**
```
EXPORT:
✓ Export button werkt
✓ CSV file download start
✓ CSV bevat correcte data (alle mappings)
✓ CSV format correct (komma-separated)
✓ Filename bevat datum

IMPORT:
✓ Import button opent file picker
✓ Alleen .csv bestanden accepteren
✓ CSV parsing werkt
✓ Validatie werkt (email format, customer exists)
✓ Valide rows worden toegevoegd
✓ Invalid rows worden geskipped
✓ Toast toont correcte aantallen (success/errors)
✓ Tabel refresht na import
```

**Test Scenario:**
1. Maak 3 mappings in app
2. Klik "Export CSV"
3. Verifieer CSV download met 3 rows
4. Open CSV, verifieer data klopt
5. Wijzig CSV: voeg 2 nieuwe valid rows toe, 1 invalid row
6. Klik "Import CSV", selecteer gewijzigde file
7. Verifieer toast: "5 toegevoegd, 1 fout" (of similar)
8. Verifieer tabel toont nu 5 mappings
9. Verifieer invalid row niet toegevoegd

---

### STAP 4.7: Implement Statistics Dashboard

- [x] **4.7.1** - Stats section geïmplementeerd boven tabel
- [x] **4.7.2** - Stats berekend via inline logic:
  - [x] Totaal aantal koppelingen (emailMappings.length)
  - [x] Meest gebruikt (Math.max usageCount)
  - [x] Recent gebruikt (laatste 7 dagen filter)
  - [x] Ongebruikt > 30 dagen filter
- [x] **4.7.3** - Display in 4 kleurrijke stat cards:
  - [x] Blue card: Totaal Koppelingen
  - [x] Green card: Meest Gebruikt (count)
  - [x] Purple card: Recent Gebruikt (7 dagen)
  - [x] Orange card: Ongebruikt (30+ dagen)
- [ ] **4.7.4** - "Opruimen" functie (OPTIONEEL - nog niet geïmplementeerd)

**Note:** Statistics Dashboard core functionaliteit compleet. Cleanup functie is optioneel voor toekomstige versie.

**Test Criteria:**
```
✓ Stats sectie zichtbaar
✓ Totaal aantal correct
✓ "Deze maand" count correct
✓ Meest gebruikte email correct (hoogste count)
✓ "Ongebruikt > 30 dagen" count correct
✓ "Opruimen" button werkt
✓ Confirmation toont welke mappings verwijderd worden
✓ Na cleanup: oude mappings weg
```

**Test Scenario:**
1. Voeg test mappings toe met verschillende lastUsed dates
2. Verifieer stats correct berekend
3. Klik "Opruimen"
4. Verifieer confirmation toont correcte mappings
5. Bevestig
6. Verifieer oude mappings verwijderd

---

## ✅ FASE 5: PROPS & STATE MANAGEMENT

### Doel
Update alle component props en state management om nieuwe functionaliteit te ondersteunen.

---

### STAP 5.1: Update QuoteEmailIntegration Props

- [ ] **5.1.1** - Open `components/accounting/quotes/QuoteEmailIntegration.tsx`
- [ ] **5.1.2** - Extend Props interface:
  ```typescript
  interface QuoteEmailIntegrationProps {
    customers: Customer[];
    
    // BESTAAND
    onQuoteCreated: (quote: Quote) => void;
    
    // NIEUW
    onInvoiceCreated: (invoice: Invoice) => void;
    onWorkOrderCreated: (workOrder: WorkOrder) => void;
    onOpenQuoteForm?: (prefillData: QuoteFormPrefillData) => void;
    onOpenInvoiceForm?: (prefillData: InvoiceFormPrefillData) => void;
    
    // Voor WO toewijzing
    employees: Employee[];
    currentUser: User;
    
    // Voor state management
    invoices: Invoice[];  // Voor invoice number generation
    workOrders: WorkOrder[];  // Voor WO ID generation
  }
  ```
- [ ] **5.1.3** - Update component function signature met nieuwe props
- [ ] **5.1.4** - TypeScript compile check: geen errors

**Test Criteria:**
```
✓ Props interface updated
✓ Component accepteert nieuwe props
✓ TypeScript compile succesvol
✓ Geen prop type errors
```

---

### STAP 5.2: Update Accounting.tsx - New Handlers

- [ ] **5.2.1** - Open `pages/Accounting.tsx`
- [ ] **5.2.2** - Create handler: `handleInvoiceCreatedFromEmail(invoice: Invoice)`
  ```typescript
  const handleInvoiceCreatedFromEmail = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    setActiveTab('invoices');  // Switch to invoices tab
    // Optional: scroll to new invoice
    toast.success(`✓ Factuur ${invoice.invoiceNumber} aangemaakt`);
  };
  ```
- [ ] **5.2.3** - Create handler: `handleWorkOrderCreatedFromEmail(workOrder: WorkOrder)`
  ```typescript
  const handleWorkOrderCreatedFromEmail = (workOrder: WorkOrder) => {
    setWorkOrders([...workOrders, workOrder]);
    // Optional: send notification to assignee
    toast.success(`✓ Werkorder aangemaakt en toegewezen`);
  };
  ```
- [ ] **5.2.4** - Create handler: `handleOpenInvoiceFormFromEmail(prefillData: InvoiceFormPrefillData)`
  ```typescript
  const handleOpenInvoiceFormFromEmail = (prefillData) => {
    invoiceForm.setFields(prefillData);
    setShowInvoiceForm(true);
    setActiveTab('invoices');
    // Optional: scroll to form
  };
  ```
- [ ] **5.2.5** - Optional: Create handler for combined quote+WO creation

**Test Criteria:**
```
✓ Alle handlers gedefinieerd
✓ handleInvoiceCreatedFromEmail: adds invoice, switches tab
✓ handleWorkOrderCreatedFromEmail: adds workorder
✓ handleOpenInvoiceFormFromEmail: opens form with prefill
✓ TypeScript compile succesvol
```

**Test Scenario:**
1. Mock call handlers met test data
2. Verifieer state updates correct
3. Verifieer tab switches correct
4. Verifieer forms open met data

---

### STAP 5.3: Update QuoteEmailIntegration Rendering in Accounting.tsx

- [ ] **5.3.1** - Zoek QuoteEmailIntegration render in Accounting.tsx (regel ~1699)
- [ ] **5.3.2** - Update props:
  ```tsx
  <QuoteEmailIntegration
    customers={customers}
    
    // BESTAAND
    onQuoteCreated={handleCreateQuote}
    
    // NIEUW
    onInvoiceCreated={handleInvoiceCreatedFromEmail}
    onWorkOrderCreated={handleWorkOrderCreatedFromEmail}
    onOpenQuoteForm={handleOpenQuoteFormFromEmail}  // Als bestaat
    onOpenInvoiceForm={handleOpenInvoiceFormFromEmail}
    
    employees={employees}
    currentUser={currentUser}
    invoices={invoices}
    workOrders={workOrders}
  />
  ```
- [ ] **5.3.3** - TypeScript compile check

**Test Criteria:**
```
✓ Alle props correct doorgegeven
✓ TypeScript compile succesvol
✓ Geen runtime errors bij render
```

---

### STAP 5.4: Email Mappings State Management (Optional: Global)

**Optie A: Local Storage Only (Huidige aanpak)**
- [x] Geen extra state management nodig
- [x] emailCustomerMapping utility handelt alles af

**Optie B: Global State (Voor toekomstige sync tussen components)**
- [ ] **5.4.1** - In App.tsx: voeg state toe `emailMappings: EmailCustomerMapping[]`
- [ ] **5.4.2** - Load on mount: `useEffect(() => setEmailMappings(getAllEmailMappings()), [])`
- [ ] **5.4.3** - Pass down als prop naar relevante components
- [ ] **5.4.4** - Update state when mapping saved/deleted
- [ ] **5.4.5** - Optional: useContext voor betere state sharing

**Voor MVP: Kies Optie A (Local Storage Only)**

**Test Criteria:**
```
Als Optie A:
✓ Mappings persistent in localStorage
✓ Components lezen direct van localStorage

Als Optie B:
✓ Mappings in global state
✓ State updates propageren naar alle components
✓ State sync met localStorage
```

---

## ✅ FASE 6: DATA STRUCTURES & TYPESCRIPT

### Doel
Definieer alle TypeScript interfaces en types voor nieuwe functionaliteit.

---

### STAP 6.1: Define TypeScript Interfaces in types/index.ts

- [ ] **6.1.1** - Open `types/index.ts` (of `types/global.d.ts`)
- [ ] **6.1.2** - Add `EmailCustomerMapping` interface:
  ```typescript
  export interface EmailCustomerMapping {
    email: string;
    customerId: string;
    mappedBy: string;  // Employee ID
    mappedAt: string;  // ISO timestamp
    lastUsed: string;  // ISO timestamp
    usageCount: number;
    notes?: string;
  }
  ```
- [ ] **6.1.3** - Add `QuoteFormPrefillData` interface:
  ```typescript
  export interface QuoteFormPrefillData {
    customerId: string;
    items: QuoteItem[];
    labor?: QuoteLabor[];
    notes?: string;
    sourceType: 'email' | 'manual' | 'api';
    sourceMetadata?: {
      emailFrom: string;
      emailSubject: string;
      emailDate: string;
    };
  }
  ```
- [ ] **6.1.4** - Add `InvoiceFormPrefillData` interface:
  ```typescript
  export interface InvoiceFormPrefillData {
    customerId: string;
    items: InvoiceItem[];
    labor?: InvoiceLabor[];
    notes?: string;
    issueDate: string;
    dueDate: string;
    sourceType: 'email' | 'manual' | 'api';
    sourceMetadata?: {
      emailFrom: string;
      emailSubject: string;
      emailDate: string;
    };
  }
  ```
- [ ] **6.1.5** - Add `WorkOrderAssignmentData` interface:
  ```typescript
  export interface WorkOrderAssignmentData {
    assigneeId: string;
    scheduledDate?: string;
    location?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    notes?: string;
  }
  ```
- [ ] **6.1.6** - Extend `Quote` interface (als nog niet aanwezig):
  ```typescript
  export interface Quote {
    // ... existing fields
    workOrderId?: string;  // Link to WorkOrder
    sourceType?: 'email' | 'manual' | 'api';
    sourceMetadata?: {
      emailFrom?: string;
      emailSubject?: string;
      emailDate?: string;
    };
  }
  ```
- [ ] **6.1.7** - Extend `Invoice` interface (als nog niet aanwezig):
  ```typescript
  export interface Invoice {
    // ... existing fields
    workOrderId?: string;  // Link to WorkOrder
    sourceType?: 'email' | 'manual' | 'api';
    sourceMetadata?: {
      emailFrom?: string;
      emailSubject?: string;
      emailDate?: string;
    };
  }
  ```
- [ ] **6.1.8** - Extend `WorkOrder` interface (als nog niet aanwezig):
  ```typescript
  export interface WorkOrder {
    // ... existing fields
    quoteId?: string;
    invoiceId?: string;
    sourceType?: 'email' | 'quote' | 'invoice' | 'manual';
    sourceEmail?: string;
  }
  ```

**Test Criteria:**
```
✓ Alle interfaces toegevoegd aan types file
✓ TypeScript compile succesvol (geen errors)
✓ Interfaces exporteren correct
✓ Imports werken in andere files
```

**Test Scenario:**
1. Add interfaces naar types file
2. Run `tsc` of check in IDE
3. Import interface in test file
4. Verifieer autocomplete werkt
5. Verifieer type checking werkt

---

## ✅ FASE 7: TESTING & VALIDATION

### Doel
Uitgebreide end-to-end tests voor alle workflows en edge cases.

---

### STAP 7.1: Email Mapping Tests

- [ ] **Test 7.1.1** - Nieuwe Email Mapping
  - [ ] Sleep nieuwe email
  - [ ] Geen auto-select
  - [ ] Selecteer klant handmatig
  - [ ] Vink "Onthoud koppeling" aan
  - [ ] Verifieer opgeslagen in localStorage
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.1.2** - Herhaalde Email (Auto-recognize)
  - [ ] Sleep email van gekende sender
  - [ ] Verifieer auto-select klant
  - [ ] Verifieer indicator "✓ Automatisch herkend"
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.1.3** - Override Mapping
  - [ ] Sleep gekende email
  - [ ] Wijzig klant naar andere
  - [ ] Verifieer warning
  - [ ] Bevestig
  - [ ] Verifieer mapping geupdate in localStorage
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.1.4** - Mapping Zonder "Onthoud" Checkbox
  - [ ] Sleep nieuwe email
  - [ ] Selecteer klant
  - [ ] NIET aanvinken "Onthoud koppeling"
  - [ ] Bevestig
  - [ ] Verifieer mapping NIET opgeslagen
  - [ ] **PASS/FAIL:**

---

### STAP 7.2: Workflow Tests

- [ ] **Test 7.2.1** - Workflow: Offerte (Draft)
  - [ ] Complete flow: email → offerte
  - [ ] Verifieer offerte in lijst
  - [ ] Verifieer status 'draft'
  - [ ] Verifieer data correct
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.2.2** - Workflow: Factuur (Direct)
  - [ ] Complete flow: email → factuur
  - [ ] Verifieer factuur in lijst
  - [ ] Verifieer invoice number
  - [ ] Verifieer auto-switch naar Invoices tab
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.2.3** - Workflow: Offerte + Werkorder
  - [ ] Complete flow: email → offerte → WO assignment → beide aangemaakt
  - [ ] Verifieer offerte aangemaakt
  - [ ] Verifieer werkorder aangemaakt
  - [ ] Verifieer linkage (workOrderId, quoteId)
  - [ ] Verifieer medewerker toegewezen
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.2.4** - Workflow: Factuur + Werkorder
  - [ ] Complete flow: email → factuur → WO assignment → beide aangemaakt
  - [ ] Verifieer factuur aangemaakt
  - [ ] Verifieer werkorder aangemaakt
  - [ ] Verifieer linkage
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.2.5** - Workflow: Bewerken in Form (Offerte)
  - [ ] Complete flow: email → edit → quote form
  - [ ] Verifieer form opent
  - [ ] Verifieer data pre-filled
  - [ ] Wijzig data
  - [ ] Save
  - [ ] Verifieer gewijzigde data in offerte
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.2.6** - Workflow: Bewerken in Form (Factuur)
  - [ ] Complete flow: email → edit → invoice form
  - [ ] Verifieer form opent EN switch naar Invoices tab
  - [ ] Verifieer data pre-filled
  - [ ] Save
  - [ ] **PASS/FAIL:**

---

### STAP 7.3: Admin Beheer Tests

- [ ] **Test 7.3.1** - Admin Tabel Weergave
  - [ ] Login als admin
  - [ ] Open Email Koppelingen tab
  - [ ] Verifieer alle mappings tonen
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.3.2** - Delete Mapping
  - [ ] Klik delete op mapping
  - [ ] Verifieer confirmation
  - [ ] Bevestig
  - [ ] Verifieer mapping weg uit tabel EN localStorage
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.3.3** - Handmatig Toevoegen
  - [ ] Klik "Handmatig Toevoegen"
  - [ ] Vul email + klant in
  - [ ] Save
  - [ ] Verifieer mapping in tabel
  - [ ] Test mapping werkt bij email drop
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.3.4** - Bulk Delete
  - [ ] Selecteer 3 mappings
  - [ ] Klik "Verwijder Geselecteerd"
  - [ ] Bevestig
  - [ ] Verifieer alle 3 weg
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.3.5** - Export CSV
  - [ ] Klik "Export CSV"
  - [ ] Verifieer download start
  - [ ] Open CSV
  - [ ] Verifieer data correct
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.3.6** - Import CSV
  - [ ] Create test CSV met nieuwe mappings
  - [ ] Import
  - [ ] Verifieer mappings toegevoegd
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.3.7** - Statistics Dashboard
  - [ ] Verifieer stats correct berekend
  - [ ] Test "Opruimen" functie
  - [ ] **PASS/FAIL:**

---

### STAP 7.4: Edge Cases & Error Handling

- [ ] **Test 7.4.1** - Invalid Email File
  - [ ] Sleep non-.eml file
  - [ ] Verifieer error message
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.4.2** - Email Zonder Data
  - [ ] Sleep email zonder producten/prijzen
  - [ ] Verifieer warning in preview
  - [ ] Verifieer kan alsnog offerte maken (met 0 items)
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.4.3** - Geen Customer Geselecteerd
  - [ ] Try to confirm zonder customer
  - [ ] Verifieer error/disabled state
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.4.4** - Duplicate Email in Admin Add
  - [ ] Try to add email die al bestaat
  - [ ] Verifieer error message
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.4.5** - WO Assignment Zonder Medewerker
  - [ ] Workflow: Offerte + WO
  - [ ] In assignment modal: NIET selecteer medewerker
  - [ ] Try to submit
  - [ ] Verifieer error
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.4.6** - Browser Refresh During Process
  - [ ] Start email parsing
  - [ ] Refresh browser mid-process
  - [ ] Verifieer geen corrupt state
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.4.7** - LocalStorage Full
  - [ ] (Hard to test, maar document behavior)
  - [ ] Verifieer graceful error handling
  - [ ] **PASS/FAIL:**

---

### STAP 7.5: Mobile Responsiveness Tests

- [ ] **Test 7.5.1** - Email Drop Zone op Mobile
  - [ ] Open op mobile device/emulator
  - [ ] Verifieer file input button werkt (geen drag&drop op mobile)
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.5.2** - Preview Modal op Mobile
  - [ ] Open preview modal op mobile
  - [ ] Verifieer full screen layout
  - [ ] Verifieer touch-friendly buttons
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.5.3** - WO Assignment Modal op Mobile
  - [ ] Open WO assignment op mobile
  - [ ] Verifieer layout stapelt verticaal
  - [ ] Verifieer datum picker werkt op mobile
  - [ ] **PASS/FAIL:**

- [ ] **Test 7.5.4** - Admin Tabel op Mobile
  - [ ] Open admin tabel op mobile
  - [ ] Verifieer horizontale scroll werkt
  - [ ] Verifieer touch-friendly delete buttons
  - [ ] **PASS/FAIL:**

---

## ✅ FASE 8: DOCUMENTATION & POLISH

### Doel
Finaliseer documentatie, README, en laatste polish voor productie.

---

### STAP 8.1: Update README.md

- [ ] **8.1.1** - Voeg sectie toe: "📧 Email Naar Offerte/Factuur Parsing"
- [ ] **8.1.2** - Beschrijf feature:
  - [ ] Drag & drop Outlook emails (.eml)
  - [ ] Automatische parsing van producten, prijzen, uren
  - [ ] Customer matching & persistent mapping
  - [ ] 5 workflow opties
- [ ] **8.1.3** - Voeg screenshots toe (maak screenshots van):
  - [ ] Email drop zone
  - [ ] Preview modal met workflow selectie
  - [ ] WO assignment modal
  - [ ] Admin beheer interface
- [ ] **8.1.4** - Voeg "Ondersteunde Email Formats" sectie toe
- [ ] **8.1.5** - Voeg "Bekende Beperkingen" sectie toe

**Test Criteria:**
```
✓ README bevat volledige feature beschrijving
✓ Screenshots toegevoegd en zichtbaar
✓ Duidelijke instructies voor gebruik
✓ Beperkingen gedocumenteerd
```

---

### STAP 8.2: Code Documentation (JSDoc)

- [ ] **8.2.1** - Voeg JSDoc comments toe aan alle publieke functies in `emailCustomerMapping.ts`
- [ ] **8.2.2** - Voeg JSDoc comments toe aan `emailQuoteParser.ts`
- [ ] **8.2.3** - Voeg JSDoc comments toe aan alle workflow functies
- [ ] **8.2.4** - Voeg JSDoc comments toe aan component props
- [ ] **8.2.5** -Voorbeeld:
  ```typescript
  /**
   * Saves an email to customer mapping for future auto-recognition
   * @param email - Sender email address
   * @param customerId - Customer ID to map to
   * @param userId - User ID who created the mapping
   * @returns void
   * @throws Error if email is invalid or customerId doesn't exist
   */
  export function saveEmailCustomerMapping(...)
  ```

**Test Criteria:**
```
✓ Alle publieke functies hebben JSDoc comments
✓ JSDoc includes @param, @returns, @throws waar relevant
✓ Descriptions duidelijk en Engels
```

---

### STAP 8.3: User Guide / Help Tooltips

- [ ] **8.3.1** - Voeg help icon (?) toe naast Email Drop Zone
- [ ] **8.3.2** - Tooltip content:
  ```
  Email Parsing Tips:
  - Sleep .eml bestanden van Outlook
  - Best results met gestructureerde emails (lijsten, tabellen)
  - Prijzen worden automatisch herkend (€XX.XX format)
  - Hoeveelheden: "5x", "5 stuks", "qty: 5"
  - Uren: "8 uur", "10u", "hours: 8"
  ```
- [ ] **8.3.3** - Voeg help tooltips toe bij:
  - [ ] Workflow selectie cards
  - [ ] "Onthoud koppeling" checkbox
  - [ ] Admin beheer knoppen
- [ ] **8.3.4** - Create optioneel: Wiki page of /docs folder met uitgebreide gids

**Test Criteria:**
```
✓ Help icons zichtbaar en klikbaar
✓ Tooltip content duidelijk en nuttig
✓ Tooltips sluiten bij click buiten
✓ Tooltips werken op mobile (tap)
```

---

### STAP 8.4: Error Messages & User Feedback Polish

- [ ] **8.4.1** - Review alle error messages:
  - [ ] Duidelijk en gebruiksvriendelijk
  - [ ] Nederlands (of Engels, consistent)
  - [ ] Suggesties voor oplossing waar mogelijk
- [ ] **8.4.2** - Review alle toast messages:
  - [ ] Bevestigen acties
  - [ ] Niet te veel (spam vermijden)
  - [ ] Auto-dismiss na 3-5 seconden
- [ ] **8.4.3** - Voeg loading states toe waar nodig:
  - [ ] Email parsing
  - [ ] File upload
  - [ ] Data opslaan
- [ ] **8.4.4** - Voeg success animations toe (optioneel):
  - [ ] Checkmark animation bij succes
  - [ ] Fade in bij nieuwe items in lijst

**Test Criteria:**
```
✓ Alle error messages duidelijk en consistent
✓ Toast messages informatief maar niet spammy
✓ Loading states zichtbaar bij async operaties
✓ Success feedback positief en bevestigend
```

---

### STAP 8.5: Performance Optimization

- [ ] **8.5.1** - Test performance met grote datasets:
  - [ ] 100+ email mappings in localStorage
  - [ ] 50+ customers in dropdown
  - [ ] Large .eml files (5-10MB)
- [ ] **8.5.2** - Optimize waar nodig:
  - [ ] Debounce search in customer dropdown
  - [ ] Virtualize lange lijsten (react-window)
  - [ ] Lazy load admin tabel (pagination)
- [ ] **8.5.3** - File size limits:
  - [ ] Max .eml file size: 10MB
  - [ ] Show error als te groot
- [ ] **8.5.4** - LocalStorage size monitoring:
  - [ ] Check size before save
  - [ ] Warning bij 80% vol
  - [ ] Error bij 100% vol

**Test Criteria:**
```
✓ App responsive met 100+ mappings
✓ Customer dropdown snel met 50+ customers
✓ Large files (5-10MB) parsen binnen 5 seconden
✓ File size limits enforced
✓ LocalStorage overflow handled gracefully
```

---

### STAP 8.6: Accessibility (A11y)

- [ ] **8.6.1** - Keyboard navigation:
  - [ ] Alle modals closable met ESC key
  - [ ] Tab order logisch in forms
  - [ ] Focus states zichtbaar
- [ ] **8.6.2** - Screen reader support:
  - [ ] ARIA labels op buttons en dropdowns
  - [ ] ARIA-live regions voor toast messages
  - [ ] Alt text op icons
- [ ] **8.6.3** - Color contrast:
  - [ ] Check alle kleuren voldoen aan WCAG AA
  - [ ] Error states duidelijk zonder alleen kleur
- [ ] **8.6.4** - Test met screen reader (NVDA of VoiceOver)

**Test Criteria:**
```
✓ Keyboard navigation werkt volledig
✓ ESC key sluit modals
✓ Focus states zichtbaar
✓ Screen reader announces belangrijke wijzigingen
✓ Color contrast voldoet aan WCAG AA
```

---

### STAP 8.7: Final QA Checklist

- [ ] **8.7.1** - Browser Compatibility:
  - [ ] Chrome ✓
  - [ ] Firefox ✓
  - [ ] Safari ✓
  - [ ] Edge ✓
- [ ] **8.7.2** - Device Testing:
  - [ ] Desktop (Windows) ✓
  - [ ] Desktop (Mac) ✓
  - [ ] Tablet (iPad) ✓
  - [ ] Mobile (Android) ✓
  - [ ] Mobile (iOS) ✓
- [ ] **8.7.3** - Code Quality:
  - [ ] No console.log() statements (of alleen debug logs)
  - [ ] No commented-out code
  - [ ] Consistent formatting (Prettier)
  - [ ] All TypeScript errors resolved
- [ ] **8.7.4** - Git:
  - [ ] Commit all changes
  - [ ] Meaningful commit messages
  - [ ] Update version number (v2.X.X)
  - [ ] Create git tag voor release

**Test Criteria:**
```
✓ Werkt in alle browsers
✓ Werkt op alle devices
✓ Code clean en geformatteerd
✓ Git history netjes
```

---

### STAP 8.8: Create Release Notes

- [ ] **8.8.1** - Create `RELEASE_NOTES.md` of section in README
- [ ] **8.8.2** - Document nieuwe features:
  ```markdown
  ## Version 2.X.X - Email Parsing & Multi-Workflow

  ### 🎉 Nieuwe Features
  - 📧 Drag & drop Outlook emails voor automatische offerte/factuur creatie
  - 🔗 Persistent email → customer mapping met auto-herkenning
  - 🔧 Direct werkorder aanmaken vanuit email workflow
  - 📋 5 workflow opties: offerte, factuur, offerte+WO, factuur+WO, bewerken
  - ⚙️ Admin interface voor email koppelingen beheer
  - 📊 Import/Export functionaliteit voor mappings

  ### 🐛 Bug Fixes
  - [List any bugs fixed during development]

  ### ⚠️ Bekende Issues
  - Email parsing werkt best met gestructureerde emails
  - Complexe HTML emails kunnen parsing issues hebben
  - LocalStorage limiet ~5MB (ongeveer 1000+ mappings)

  ### 📚 Documentatie
  - Volledige feature guide in README.md
  - JSDoc comments toegevoegd
  - Help tooltips in interface
  ```

**Test Criteria:**
```
✓ Release notes compleet en accuraat
✓ Features duidelijk beschreven
✓ Bekende issues gedocumenteerd
✓ Version number correct
```

---

## 🎉 COMPLETION CHECKLIST

### Feature Complete:
- [ ] ✅ Email customer mapping systeem (Fase 1)
- [ ] ✅ Multi-output workflow systeem (Fase 2)
- [ ] ✅ Werkorder toewijzing modal (Fase 3)
- [ ] ✅ Admin beheer interface (Fase 4)
- [ ] ✅ Props & state management (Fase 5)
- [ ] ✅ Data structures & TypeScript (Fase 6)
- [ ] ✅ Testing & validation (Fase 7)
- [ ] ✅ Documentation & polish (Fase 8)

### All Tests Passing:
- [ ] ✅ Email mapping tests (7.1)
- [ ] ✅ Workflow tests (7.2)
- [ ] ✅ Admin beheer tests (7.3)
- [ ] ✅ Edge cases tests (7.4)
- [ ] ✅ Mobile tests (7.5)

### Production Ready:
- [ ] ✅ README updated
- [ ] ✅ Code documented (JSDoc)
- [ ] ✅ User guide / tooltips
- [ ] ✅ Error handling polished
- [ ] ✅ Performance optimized
- [ ] ✅ Accessibility tested
- [ ] ✅ QA checklist complete
- [ ] ✅ Release notes written

---

## 📝 NOTES & DECISIONS LOG

### Belangrijke Beslissingen:
1. **Storage Method:** LocalStorage gekozen voor MVP (vs. backend database)
   - Reden: Sneller te implementeren, geen backend changes
   - Trade-off: Niet gedeeld tussen devices, limiet ~5MB
   - Future: Migreren naar database als nodig

2. **Workflow Selection:** Cards/buttons gekozen (vs. dropdown)
   - Reden: Visueel duidelijker, beter voor onervaren gebruikers
   - Trade-off: Neemt meer ruimte in modal

3. **Email Parsing Library:** Eigen implementatie (vs. third-party library)
   - Reden: Full control, geen dependencies, specifiek voor NL business context
   - Trade-off: Meer onderhoud nodig

### Open Questions / Future Improvements:
- [ ] Email notificaties naar medewerkers (nu alleen in-app notifications)
- [ ] ML-based email parsing verbetering over tijd
- [ ] Batch email processing (sleep 10+ emails tegelijk)
- [ ] Email templates herkenning (vaste leveranciers met vaste formats)
- [ ] API endpoint voor email parsing (voor externe integraties)

---

## 🔄 VERSIONING

- **v2.0.0** - Initial email parsing feature (planning fase)
- **v2.1.0** - Email customer mapping implementatie (na Fase 1 compleet)
- **v2.2.0** - Multi-workflow systeem (na Fase 2 compleet)
- **v2.3.0** - Admin beheer interface (na Fase 4 compleet)
- **v2.4.0** - Final release (alle fases compleet)

---

**🚀 READY TO START IMPLEMENTATION!**

Volgende stap: Begin met Fase 1, Stap 1.1 - Create emailCustomerMapping.ts
