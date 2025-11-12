# Comprehensive Workflow Architecture Analysis - Bedrijfsbeheer System

## Executive Summary
This is a comprehensive, integrated business management system with 11+ interconnected modules managing the complete lifecycle from lead acquisition through payment. The system emphasizes workflow automation, data integrity, and cross-module dependencies while maintaining extensive audit trails.

---

## 1. MAIN BUSINESS WORKFLOWS & PROCESSES

### 1.1 QUOTE-TO-INVOICE-TO-WORKORDER WORKFLOW (Primary Revenue Flow)

**Complete End-to-End Flow:**
```
Lead/Customer → Quote (Draft) → Quote (Approved/Sent) → Invoice/WorkOrder → Payment
```

**Step-by-Step Process:**

1. **Quote Creation** (Manual or Email-triggered)
   - Manual: User enters items, labor, customer in Accounting module
   - Email-triggered: Email parsed via EmailDropZone or QuoteEmailIntegration
   - Email parser extracts items, quantities, and prices from email body
   - Customer automatically matched via email address (findCustomerByEmail)
   - Quote created in Draft status
   - Audit trail: created timestamp, creation history entry

2. **Quote Status Transitions**
   - Draft → Sent (when user sends to customer)
   - Sent → Approved (when customer accepts)
   - Approved → (two paths):
     - Path A: Convert to Invoice (for direct billing)
     - Path B: Convert to WorkOrder (for service execution first)

3. **Workflow Validation Guardrails**
   - validateQuoteToWorkOrder: Only approved quotes can become work orders
   - validateQuoteToInvoice: Only approved quotes can become invoices
   - Checks for duplicate conversions (quote can't have multiple work orders/invoices)
   - Inventory stock verification before work order creation
   - Error messages with suggested actions

4. **Quote to Invoice Conversion**
   - Creates new Invoice with same items/labor/customer
   - Preserves quote data in invoice.quoteId reference
   - Sets invoice status to "draft"
   - Auto-generates invoice number (generateInvoiceNumber)
   - Sets 14-day default payment terms
   - Updates quote with conversion timestamp and history entry
   - Creates audit trail entry

5. **Quote to WorkOrder Conversion**
   - Opens user selection modal (SELECT ASSIGNEE)
   - Creates WorkOrder with quote's items as required materials
   - Links WorkOrder to Quote via workOrderId
   - Sets initial status: "To Do"
   - Tracks labor hours from quote labor field
   - Captures estimated costs from quote
   - Creates comprehensive audit trail with assigned employee

6. **WorkOrder Execution Workflow**
   - Status transitions: To Do → Pending (optional) → In Progress → Completed
   - Pending status captures reason (pendingReason field) - e.g., waiting for materials
   - Employee can update status in real-time
   - System tracks when status changes (timestamps.started, timestamps.completed)
   - Materials are managed in requiredInventory array

7. **Completed WorkOrder to Invoice**
   - Can only convert from Completed status
   - validateWorkOrderToInvoice ensures completion
   - Creates invoice with actual hours from work order
   - Links invoice to work order via invoiceId
   - Optionally updates existing quote-invoice if one exists
   - Updates inventory based on actual materials used

8. **Invoice Payment Flow**
   - Invoice statuses: draft → sent → paid
   - Overdue status triggered if past dueDate
   - Payment reminder automation (reminder1Date at +7 days, reminder2Date at +14 days)
   - Bookkeeping module tracks payment methods and status
   - Kassa (POS) invoices marked with "Kassa verkoop" or customer "Particulier (Kassa)"

---

### 1.2 INVENTORY MANAGEMENT WORKFLOW

**Data Model:**
- InventoryItem with 3 SKU types:
  - supplierSku: Supplier's SKU
  - autoSku: Auto-generated (INV-0001 format)
  - customSku: Manual/custom SKU
- Properties: name, quantity, reorderLevel, purchasePrice, salePrice, margin
- Categories: InventoryCategory with color coding and descriptions
- Suppliers: Full supplier management with lead times

**Workflow Steps:**

1. **Item Creation**
   - Auto-generate autoSku on creation
   - Set sale price, purchase price (calculates margin automatically)
   - Assign category for filtering
   - Link to supplier with lead time
   - Option to sync with webshop (syncEnabled flag)

2. **Stock Monitoring**
   - Display quantity vs. reorderLevel
   - Alert when approaching reorder level
   - Inventory alerts (posAlertNote) for POS system

3. **Item Usage in Workflows**
   - Quote items reference inventoryItemId
   - WorkOrder materials from items (requiredInventory array)
   - POS cart items deduct from inventory on sale
   - Inventory sync to webshop products

4. **Stock Adjustments**
   - Manual quantity updates
   - Automatic deduction from quotes/invoices
   - Replenishment from suppliers

---

### 1.3 POINT OF SALE (POS) WORKFLOW

**Two Modes:**
1. **B2C Mode (Kassa)**: Retail/cash sales to customers
2. **B2B Mode (Pakbon)**: Packing slip generation for business orders

**Sales Process:**

1. **Cart Building**
   - Search/filter inventory by name, SKU (all 3 types), or category
   - Add items to cart with quantity adjustment
   - Manual item creation (not in inventory)
   - Favorites system (up to 8 customizable quick items)
   - POS alert notes display when items added

2. **Customer Selection** (Optional)
   - Select from existing customers (B2B)
   - Leave empty for B2C anonymous sales
   - Customer discount/credit tracking

3. **Payment Processing**
   - Methods: Cash, PIN, iDEAL, Bank Transfer, Credit
   - VAT calculation per item (21%, 9%, 0%, or custom)
   - Discount application

4. **Transaction Completion**
   - Creates Sale record with items and total
   - Creates Invoice in POS module
   - Deducts inventory quantities immediately
   - Generates Packing Slip (if B2B)
   - Creates PackingSlip record (linked to invoice)
   - Marks invoice as "paid" (all POS sales are immediate payment)

5. **Packing Slip Generation**
   - PDF output with order details
   - Customer/shipping address
   - Item list with quantities
   - Totals including VAT

---

### 1.4 WORK ORDER MANAGEMENT WORKFLOW

**Process:**

1. **Creation Methods**
   - Manual creation in WorkOrders module
   - Conversion from approved Quote
   - Conversion from sent/draft Invoice

2. **Assignment Process**
   - Assign to employee with MODAL SELECTION
   - Only employees with status "available" shown (unless filtering all)
   - V5.6: Intelligent filtering - hides employees with no work orders in filtered status

3. **Material Management**
   - Add required materials from inventory
   - Search materials by name, all SKU types, or category
   - Specify quantities needed
   - V5.7: Category filter for faster lookup

4. **Status Workflow**
   - "To Do" (default) - not started
   - "Pending" (optional) - halted, with optional reason (pendingReason)
   - "In Progress" - actively being worked
   - "Completed" - finished and ready for invoice

5. **Audit & History Tracking**
   - Every status change logged with timestamp
   - WorkOrderHistoryEntry tracks: action (created, converted, assigned, status_changed), performedBy, timestamp
   - Actions have icons: 🆕 created, 👤 assigned, 📊 status_changed
   - Timestamps tracked: created, assigned, started, completed

6. **Integration with Quotes/Invoices**
   - Show linked quote/invoice details in work order
   - Real-time status badges showing work order progress
   - Update work order from quote/invoice views

---

### 1.5 CUSTOMER RELATIONSHIP MANAGEMENT (CRM) WORKFLOW

**Components:**

1. **Customer Management**
   - Profiles: name, email (primary + additional), phone, company, type (business/private)
   - Payment terms, credit limit (for B2B)
   - Notes and source tracking

2. **Lead Management**
   - Lead statuses: new → contacted → qualified → proposal → negotiation → won/lost
   - Tracking estimated value
   - Follow-up date management

3. **Interaction Tracking**
   - Types: call, email, meeting, note, SMS
   - Linked to customer or lead
   - Employee responsible captured
   - Follow-up required flag with date

4. **Task Management**
   - Priorities: low, medium, high
   - Statuses: todo, in_progress, done
   - Linked to customer or employee
   - Due date tracking

5. **Email Integration** (Major Feature)
   - Drag-and-drop .eml file support
   - Automatic parsing via parseEmailForQuote utility
   - Email-to-Quote creation workflow:
     - Parse email for products, services, quantities, prices
     - Extract labor hours if mentioned
     - Auto-match customer by email address
     - Create Quote with parsed data
     - User previews and confirms

6. **Email Management**
   - Store and thread emails (threadId, inReplyTo)
   - Link to customers, leads, quotes, invoices, tasks
   - Status: draft, sent, received, archived
   - Priority levels

---

### 1.6 ACCOUNTING & INVOICE WORKFLOW

**Quote Tab:**
- Create quotes manually
- Search by customer name, amount, date
- Clone to create similar quotes
- Accept/approve quotes
- Status badges with workflow indicators
- Real-time work order status tracking

**Invoice Tab:**
- Create invoices manually
- Create from quotes
- Search and filter (status, customer, date range)
- Clone invoices
- Batch status updates
- Payment reminders (7-day, 14-day after due date)
- Archive invoices

**Dashboard:**
- Total sales (YTD)
- Invoices overview (sent, paid, outstanding, overdue)
- Quotes overview (draft, sent, approved, expired)
- Charts and analytics

---

### 1.7 BOOKKEEPING & FINANCIAL WORKFLOW

**Key Components:**

1. **Ledger System**
   - Standard MKB (Small/Medium Business) accounts
   - Asset accounts (Debitors, Inventory)
   - Expense accounts (Material Purchase, Service Purchase)
   - Revenue accounts (Goods, Services, Exempt from VAT)
   - Liability accounts (Creditors, VAT payable)

2. **Journal Entries**
   - Double-entry bookkeeping
   - Automatic entry creation from invoices
   - Manual journal entry creation

3. **VAT Reporting**
   - Automatic VAT report generation
   - Tracks VAT by rate (21%, 9%, 0%)
   - Compliance-ready for NL requirements

4. **Kassa (POS) Module**
   - Separate tracking of cash sales
   - Payment method categorization
   - Period filtering (today, week, quarter, year, custom)
   - Revenue overview

5. **Customer/Supplier Dossiers**
   - Complete financial history per customer
   - Invoice archive with paid/outstanding status
   - Supplier tracking

---

## 2. USER JOURNEY & NAVIGATION PATTERNS

### 2.1 USER Roles & Permissions

**Permission System:**
- full_admin: All admin rights
- manage_modules: Enable/disable modules
- manage_inventory: CRUD inventory
- manage_crm: CRUD customers, leads, tasks
- manage_accounting: Manage quotes, invoices
- manage_workorders: Create and assign work orders
- view_all_workorders: See all (not just own)
- manage_employees: Employee management
- view_reports: Full reporting access
- manage_planning: Schedule/calendar management
- manage_pos: POS system

### 2.2 Primary Navigation Flow

```
Dashboard → Select Module → Work in Module → Switch Module
```

**Module Access:**
1. Dashboard (Overview, KPIs)
2. CRM (Lead/Customer Management)
3. Inventory (Stock Management)
4. Accounting (Quotes/Invoices)
5. Work Orders (Task Execution)
6. POS (Sales)
7. Bookkeeping (Financial Records)
8. HRM (Employee Management)
9. Planning (Scheduling)
10. Reports (Analytics)
11. Webshop (E-commerce)

### 2.3 Cross-Module Navigation Patterns

**Quote Context Navigation:**
Accounting (Create Quote) → 
  - [Clone] → Create similar
  - [Accept] → Set to Approved
  - [Convert to WorkOrder] → Select Assignee → WorkOrder
  - [Convert to Invoice] → Create Invoice
  - [View Customer] → Jump to CRM

**WorkOrder Context Navigation:**
WorkOrders (View/Edit) →
  - [View linked Quote] → Accounting (Quote detail)
  - [View linked Invoice] → Accounting (Invoice detail)
  - [Change Status] → Real-time update
  - [View Customer] → Jump to CRM
  - [Edit Materials] → Inventory integration

**Invoice Context Navigation:**
Accounting (Invoice) →
  - [View linked Quote] → Show source quote
  - [Convert to WorkOrder] → Create work order
  - [Clone] → Duplicate invoice
  - [Send] → Email to customer (planned)

---

## 3. DATA FLOW & INTEGRATION ARCHITECTURE

### 3.1 Data Model Relationships

```
Customer
  ├─ Quote (quoteId)
  │   ├─ QuoteItem → InventoryItem
  │   ├─ QuoteLabor
  │   ├─ QuoteHistoryEntry
  │   └─ Convert to → Invoice or WorkOrder
  │
  ├─ Invoice (invoiceId)
  │   ├─ InvoiceHistoryEntry
  │   ├─ Link to Quote (quoteId)
  │   ├─ Link to WorkOrder (workOrderId)
  │   └─ Payment info
  │
  └─ WorkOrder (customerId)
      ├─ Assign to → Employee
      ├─ Link to → Quote or Invoice
      ├─ RequiredInventory[]
      └─ WorkOrderHistoryEntry

Employee
  ├─ Assigned WorkOrders
  ├─ Created Quotes/Invoices/WorkOrders
  └─ Interactions (calls, meetings, notes)

InventoryItem
  ├─ Category (InventoryCategory)
  ├─ Supplier (Supplier)
  ├─ Link to → WebshopProduct (for sync)
  ├─ Used in → Quote Items
  ├─ Used in → WorkOrder Materials
  └─ Used in → POS Cart

Lead
  ├─ Interactions[]
  ├─ Follow-up tracking
  └─ Convert to → Customer

Interaction
  ├─ Link to → Customer or Lead
  ├─ Assign to → Employee
  └─ Type: call, email, meeting, note, SMS

Email
  ├─ Parse to → Quote
  ├─ Link to → Customer, Lead, Quote, Invoice, Task
  └─ Create → Interaction or Task
```

### 3.2 Central State Management (App.tsx)

**Centralized in React State:**
- inventory (InventoryItem[])
- categories (InventoryCategory[])
- products (Product[]) - legacy
- sales (Sale[])
- workOrders (WorkOrder[])
- customers (Customer[])
- employees (Employee[])
- transactions (Transaction[])
- quotes (Quote[])
- invoices (Invoice[])
- tasks (Task[])
- calendarEvents (CalendarEvent[])
- notifications (Notification[])
- leads (Lead[])
- interactions (Interaction[])
- emails (Email[])
- emailTemplates (EmailTemplate[])
- webshopProducts (WebshopProduct[])

**Prop Drilling Pattern:**
All state passed down through component hierarchy via props.
Each module receives:
- Relevant data arrays
- Setter functions for mutations
- Related module data (for cross-references)

### 3.3 Data Validation & Workflow Rules

**Validation Layer** (utils/workflowValidation.ts):

```
Quote → WorkOrder:
  ✓ Quote status must be "approved"
  ✓ No existing work order linked
  ✓ Inventory stock available

Quote → Invoice:
  ✓ Quote status must be "approved"
  ✓ No existing invoice linked
  ✓ No active work order (must be completed first)

WorkOrder → Invoice:
  ✓ WorkOrder status must be "Completed"
  ✓ Customer linked (customerId required)
  ✓ No existing invoice linked

Invoice → WorkOrder:
  ✓ Invoice status: draft or sent (not paid/overdue)
  ✓ No existing work order linked

Quote Edit Protection:
  ✓ If work order linked and Completed: Can't edit items/labor
  ✓ If work order In Progress: Can edit but sends notification

Invoice Edit Protection:
  ✓ If linked work order is Completed: Can't edit
  ✓ If invoice status is "paid": Read-only
```

---

## 4. FORM SUBMISSIONS & VALIDATION PROCESSES

### 4.1 Quote Creation Form

**Fields:**
- Customer ID (dropdown)
- Items (manual add or import from inventory)
  - Description, Quantity, Price per unit
  - Inventory linking
- Labor (optional)
  - Description, Hours, Hourly rate
- VAT rate (21%, 9%, 0%, custom)
- Notes
- Valid until date

**Validation:**
- Customer required
- At least one item or labor entry
- Prices must be numeric
- Hours must be numeric

**On Submit:**
- Calculate subtotal, VAT, total
- Generate quote ID (Q + timestamp)
- Create history entry
- Set status to "draft"
- Store in quotes array

### 4.2 Invoice Creation Form

**Fields:**
- Customer ID (dropdown or copy from quote if cloning)
- Items (from quote or manual)
- Labor (from quote or manual)
- Issue date (auto-current)
- Due date (auto +14 days)
- Payment terms text
- VAT rate
- Notes

**Validation:**
- Customer required
- At least one item
- Dates valid
- Due date >= Issue date

**On Submit:**
- Generate invoice number (year + sequence)
- Create history entry
- Set status to "draft"
- Link to quote if applicable
- Store in invoices array

### 4.3 WorkOrder Creation Form

**Fields:**
- Title (required)
- Description
- Customer ID
- Assigned To (Employee - MODAL SELECTION)
- Location
- Scheduled date
- Materials (search + add from inventory)
- Pending reason (if initial status is "Pending")

**Validation:**
- Title required
- Customer required (from quote/invoice or manual)
- Assignee required
- At least one material (optional?)

**On Submit:**
- Generate work order ID
- Create audit trail entry
- Set initial status "To Do"
- Track assigned employee, timestamp
- Link to source quote/invoice if applicable
- Create timestamps.created, timestamps.assigned
- Store in workOrders array

### 4.4 Email-to-Quote Workflow

**Input:**
- .eml file from Outlook

**Processing:**
1. Parse EML file (emlParser.ts)
2. Extract: from, to, subject, body, date, attachments
3. Parse email body for quote data (emailQuoteParser.ts):
   - Search for numbered/bullet lists
   - Extract: description, quantity, unit price
   - Detect service keywords → labor hours
   - Calculate totals
4. Auto-match customer by email address (emailCustomerMapping.ts)
5. Show preview modal with:
   - Email details
   - Parsed items/labor
   - Customer selection (with auto-match highlighted)
   - Calculated totals

**On Confirm:**
- Create Quote with parsed data
- Link to matched/selected customer
- Set to "draft" status
- Add creation history with "system" as performer
- Store email context in notes
- Add timestamps.created

---

## 5. INTEGRATION POINTS

### 5.1 Email Integration

**Components:**
- EmailDropZone (components/EmailDropZone.tsx)
  - Drag-and-drop .eml files
  - Workflow type detection (order, task, notification)
  - Callback-based integration

- QuoteEmailIntegration (components/QuoteEmailIntegration.tsx)
  - Specific to quote creation
  - Email parsing + preview
  - Customer auto-matching

- Utilities:
  - parseEmlFile: Parse .eml format
  - parseEmailForQuote: Extract quote data
  - findCustomerByEmail: Auto-match customers
  - saveEmailMapping: Store email-customer links

**Email Actions Supported:**
- create_quote (from email)
- create_task (from email)
- create_invoice (from email)
- link_customer (associate email with customer)
- archive (mark email as processed)

### 5.2 Inventory Integration

**Sync Points:**
1. Quote Item → InventoryItem reference
2. WorkOrder Material → InventoryItem usage
3. POS Sale → Inventory deduction
4. Inventory Item → WebshopProduct sync (syncEnabled flag)

**Alerts:**
- Stock level warnings (approaching reorderLevel)
- POS alert notes (custom alerts when item added to sale)
- Insufficient stock warnings when converting to work order

### 5.3 Customer Integration

**Data Sharing:**
- CRM ← → Accounting: Customer data in quotes/invoices
- CRM ← → WorkOrders: Customer linked to work orders
- CRM ← → Email: Auto-match customers by email
- CRM ← → Interactions: Track all contact history

### 5.4 Employee Integration

**Permission & Assignment:**
- All modules respect employee permissions
- WorkOrders: Only assign to employees with "available" status
- Interactions: Track which employee handled contact
- Audit trails: Record which employee performed each action

### 5.5 Analytics Integration

**Tracking:**
- trackNavigation: Module switches
- trackAction: Specific operations
- trackTaskCompletion: Workflow steps with duration

**Data Captured:**
- User ID, role, timestamp
- Module and action performed
- Duration (if timed operation)
- Success/failure status
- Error messages

---

## 6. AUTOMATION VS. MANUAL STEPS

### 6.1 Automated Processes

**Email Parsing Automation:**
- Email dropped → Automatic parsing → Item/labor extraction → Customer matching
- Removes manual data entry for quotes from emails

**Inventory Management:**
- Auto-calculate margin (salePrice - purchasePrice) / purchasePrice
- Auto-generate SKU (INV-0001 format)
- Auto-deduct inventory on POS sales
- Auto-alert when reaching reorder level

**Invoice Number Generation:**
- Auto-generate invoice number (year + sequence)
- Auto-set issue date (today)
- Auto-set due date (+14 days default)
- Auto-calculate VAT based on item rates

**Workflow Validation:**
- Auto-prevent invalid conversions (e.g., draft quote → work order)
- Auto-check inventory before work order creation
- Auto-validate quote approval before invoice/work order creation
- Auto-suggest next steps in workflow

**History & Audit Trails:**
- Auto-create history entries on every status change
- Auto-capture performer, timestamp, details
- Auto-add conversion tracking (convertedToInvoice timestamp)

**Email Reminders:**
- Auto-generate reminder dates (7 days, 14 days post-due)
- Auto-flag overdue invoices

**Analytics Tracking:**
- Auto-track every user action
- Auto-calculate session duration
- Auto-identify error patterns

### 6.2 Manual Steps (Friction Points)

**User Selection Modal:**
- Converting Quote → WorkOrder requires manual employee selection
- Converting Invoice → WorkOrder requires manual employee selection
- Cannot auto-assign (business logic: managers need control)

**Customer Matching:**
- Email auto-matching works, but user can override
- If no email match, user must manually select customer

**Approval Process:**
- Quote approval (sent → approved) is manual
- No automated approval workflow
- Depends on customer response

**Payment Recording:**
- Invoice payment marking is manual
- No automatic payment gateway integration
- POS payments marked as "paid" immediately

**Status Updates:**
- WorkOrder status changes are manual
- Employee must actively update status
- No auto-transition based on time or conditions

**Material Selection:**
- Adding materials to work orders is manual
- User must search and select each material
- Quantities must be entered manually

**Item Pricing:**
- Quote item pricing can be manual (not auto-lookup)
- Can reference inventory but prices not locked
- Allows for custom pricing/discounts

---

## 7. DATABASE SCHEMA & RELATIONSHIPS

### 7.1 Core Entities

**Quote**
```typescript
{
  id: string
  customerId: string (FK → Customer)
  items: QuoteItem[]
  labor?: QuoteLabor[]
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  status: "draft" | "sent" | "approved" | "rejected" | "expired"
  createdDate: string
  validUntil: string
  notes?: string
  location?: string
  scheduledDate?: string
  workOrderId?: string (FK → WorkOrder)
  invoiceId?: string (FK → Invoice)
  createdBy?: string (FK → Employee)
  history?: QuoteHistoryEntry[]
  timestamps?: {
    created: string
    sent?: string
    approved?: string
    convertedToInvoice?: string
    convertedToWorkOrder?: string
  }
}
```

**Invoice**
```typescript
{
  id: string
  invoiceNumber: string (UNIQUE)
  customerId: string (FK → Customer)
  quoteId?: string (FK → Quote)
  items: QuoteItem[]
  labor?: QuoteLabor[]
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  issueDate: string
  dueDate: string
  paidDate?: string
  notes?: string
  paymentTerms?: string
  location?: string
  scheduledDate?: string
  workOrderId?: string (FK → WorkOrder)
  createdBy?: string (FK → Employee)
  history?: InvoiceHistoryEntry[]
  timestamps?: {
    created: string
    sent?: string
    paid?: string
    convertedToWorkOrder?: string
  }
  reminders?: {
    reminder1Date?: string
    reminder1Sent?: boolean
    reminder2Date?: string
    reminder2Sent?: boolean
  }
}
```

**WorkOrder**
```typescript
{
  id: string
  title: string
  description: string
  status: "To Do" | "Pending" | "In Progress" | "Completed"
  assignedTo: string (FK → Employee)
  requiredInventory: { itemId: string; quantity: number }[]
  createdDate: string
  customerId?: string (FK → Customer)
  location?: string
  scheduledDate?: string
  completedDate?: string
  hoursSpent?: number
  photos?: string[]
  signature?: string
  notes?: string
  pendingReason?: string
  quoteId?: string (FK → Quote)
  invoiceId?: string (FK → Invoice)
  estimatedHours?: number
  estimatedCost?: number
  sortIndex?: number
  timestamps?: {
    created: string
    assigned?: string
    started?: string
    completed?: string
  }
  history?: WorkOrderHistoryEntry[]
  assignedBy?: string (FK → Employee)
}
```

**InventoryItem**
```typescript
{
  id: string
  name: string
  sku: string (legacy)
  quantity: number
  reorderLevel: number
  supplierId?: string (FK → Supplier)
  location?: string
  supplierSku?: string
  autoSku?: string (auto-generated INV-XXXX)
  customSku?: string
  categoryId?: string (FK → InventoryCategory)
  purchasePrice?: number
  salePrice: number
  margin?: number (auto-calculated)
  vatRate: "21" | "9" | "0" | "custom"
  customVatRate?: number
  syncEnabled: boolean
  webshopId?: string
  webshopProductId?: string (FK → WebshopProduct)
  unit?: string
  posAlertNote?: string
  createdAt?: string
  updatedAt?: string
}
```

**Customer**
```typescript
{
  id: string
  name: string
  email: string (PRIMARY)
  emailAddresses?: string[] (ADDITIONAL)
  phone: string
  since: string
  type?: "business" | "private" | "individual"
  address?: string
  notes?: string
  source?: string
  company?: string
  creditLimit?: number
  paymentTerms?: number (days)
}
```

**Employee**
```typescript
{
  id: string
  name: string
  role: string
  email: string
  phone: string
  hireDate: string
  vacationDays?: number
  usedVacationDays?: number
  availability?: "available" | "unavailable" | "vacation"
  password?: string
  isAdmin?: boolean (legacy)
  permissions?: Permission[]
  notes?: EmployeeNote[]
}
```

### 7.2 Relationship Mapping

**One-to-Many Relationships:**
- Customer → Quotes (customerId)
- Customer → Invoices (customerId)
- Customer → WorkOrders (customerId)
- Customer → Interactions
- Customer → Leads (converted from)
- Employee → WorkOrders (assignedTo)
- Employee → Created Quotes (createdBy)
- Employee → Interactions
- InventoryCategory → InventoryItem (categoryId)
- Supplier → InventoryItem (supplierId)

**Many-to-Many (Implicit):**
- Quote ← → WorkOrder (1:0..1)
- Quote ← → Invoice (1:0..1)
- WorkOrder ← → Invoice (1:0..1)
- InventoryItem ← → Quote Items (multiple items in multiple quotes)
- InventoryItem ← → WorkOrder Materials (multiple items in multiple orders)

**Audit Trail References:**
- QuoteHistoryEntry[] → Quote
- InvoiceHistoryEntry[] → Invoice
- WorkOrderHistoryEntry[] → WorkOrder
- EmployeeNote[] → Employee

---

## 8. AREAS FOR LEAN SIX SIGMA OPTIMIZATION

### 8.1 Process Inefficiencies

**HIGH PRIORITY:**

1. **Manual Assignee Selection for WorkOrders**
   - Current: Convert Quote/Invoice → Modal opens → User selects employee
   - Issue: Extra click/modal, no default assignment logic
   - Opportunity: Auto-assign based on workload, availability, skills
   - Potential Saving: 30-60 seconds per conversion × frequency

2. **Email-to-Quote Customer Matching Fallback**
   - Current: Auto-match by email, but if no match, user must manually select
   - Issue: Incomplete automation, requires user intervention
   - Opportunity: Fuzzy matching by name, company, or domain
   - Potential Saving: Reduce manual customer selection time

3. **Pending Status in WorkOrders**
   - Current: To Do → Pending → In Progress → Completed (4 states)
   - Issue: Pending state with optional reason field adds complexity
   - Opportunity: Consider if pending is truly needed; could use "Pending Reason" field as a sub-state
   - Potential Saving: Simplify workflow, reduce state confusion

4. **Multiple SKU Types in Inventory**
   - Current: supplierSku, autoSku, customSku (3 types)
   - Issue: Users must search across all 3 types; increases search complexity
   - Opportunity: Consolidate to 2 types or use unified search with type indicators
   - Potential Saving: Faster inventory search, reduce confusion

5. **Manual Payment Recording**
   - Current: User must manually mark invoice as "paid"
   - Issue: Prone to delays, forgotten payments, manual data entry
   - Opportunity: Integration with payment gateway or payment request reminders
   - Potential Saving: Eliminate manual recording, speed up cash flow tracking

**MEDIUM PRIORITY:**

6. **Invoice Payment Reminders (Manual Setup)**
   - Current: Dates calculated, but reminders need manual sending
   - Issue: Reminders not auto-sent; user must remember
   - Opportunity: Auto-send email reminders on reminder1Date, reminder2Date
   - Potential Saving: Faster cash collection, reduce outstanding receivables

7. **Inventory Stock Check Before WorkOrder Creation**
   - Current: Check performed, but requires user confirmation if insufficient
   - Issue: Extra confirmation dialog adds friction
   - Opportunity: Auto-reserve stock or proceed if threshold not critical
   - Potential Saving: Faster work order creation for non-critical materials

8. **Category Filter Redundancy in POS/Accounting**
   - Current: Category dropdown + search term separate; must open dropdown each time
   - Issue: Multi-step filtering, not sticky across sessions
   - Opportunity: Combine search + category in single smart search; remember last category
   - Potential Saving: Faster inventory selection across modules

9. **Cloning Operations**
   - Current: Clone quote → Clone invoice → Clone quote (manual status resetting)
   - Issue: Multiple conversions create duplication; hard to track original
   - Opportunity: Template system for recurring patterns
   - Potential Saving: Faster quote/invoice generation for similar customers

10. **Work Order Status Tracking**
    - Current: Audit trail created on every change, but no auto-escalation
    - Issue: Overdue work orders not flagged; no SLA tracking
    - Opportunity: Add SLA monitoring, auto-escalation for delays
    - Potential Saving: Reduce project delays, improve on-time delivery

### 8.2 Data Entry Redundancy

**Issues:**
1. Quote items must be entered manually (no templates)
2. Customer info duplicated across modules (email addresses, phone)
3. Labor hours entered in quote, must re-enter in invoice if not auto-copied
4. Work order materials manually selected from inventory

**Opportunities:**
- Quote templates by customer type
- Email/phone sync across modules
- Auto-copy labor hours in invoice conversions ✓ (Already implemented)
- Material package templates (standard kits)

### 8.3 Manual Approval Bottlenecks

**Current Flow:**
- Quote created → Sent to customer → Customer approves → User marks as approved manually

**Issues:**
1. No automated approval reminder (quote auto-expires but no notice)
2. Expired quotes not auto-rejected
3. No escalation for pending approvals

**Opportunities:**
- Auto-send approval reminders at 50% of validity period
- Auto-expire quotes after validity date
- Approval tracking dashboard
- Escalation rules based on quote age/value

### 8.4 Process Synchronization Issues

**Current State:**
- Multiple manual data points that must stay in sync:
  - Quote items → Invoice items (manual copy on conversion)
  - Work order materials → Inventory quantities (manual deduction)
  - Customer email → Email customer mapping (auto-saved on email receipt)

**Risks:**
- Quote-to-invoice conversion could have data loss
- Inventory not deducted if conversion fails mid-process
- Email customer links could stale

**Opportunities:**
- Transactional conversions (all-or-nothing)
- Event-driven inventory updates
- Regular email-customer link refresh

### 8.5 Information Fragmentation

**Issues:**
1. Customer financial history scattered across Accounting + Bookkeeping
2. WorkOrder material usage not linked back to inventory cost tracking
3. No unified timeline of customer interactions across CRM + Accounting

**Opportunities:**
- Customer 360° dashboard
- WorkOrder cost analysis (actual costs vs. estimated)
- Unified activity timeline per customer

---

## 9. VALIDATION & BUSINESS RULES

### 9.1 Workflow Guardrails (Implemented)

**Quote Conversions:**
- ✓ Only approved quotes → work orders/invoices
- ✓ No duplicate conversions (one quote → one work order, one invoice max)
- ✓ Inventory stock check before work order creation
- ✓ Error messages with suggested actions

**Work Order Conversions:**
- ✓ Only completed work orders → invoices
- ✓ Customer must be linked
- ✓ No duplicate invoices from same work order
- ✓ Notification to assigned employee on status update

**Edit Protections:**
- ✓ Completed work order quote cannot have materials/hours edited
- ✓ Paid invoices are read-only
- ✓ Active work orders show warning but allow edit with notification

**Employee Assignment:**
- ✓ Only "available" employees shown in assignment modal (by default)
- ✓ V5.6: Intelligent filtering hides employees with no work orders in status filter

### 9.2 Data Validation Rules

**Required Fields:**
- Quote: Customer, at least 1 item
- Invoice: Customer, at least 1 item, issue date <= due date
- WorkOrder: Title, customer, assignee, (materials optional?)
- Customer: Name, email
- Employee: Name, role, email

**Format Validation:**
- Email format checked
- Phone format (basic)
- Dates must be valid ISO format
- Numbers must be numeric and >= 0
- Quantities must be integers

**Business Logic Validation:**
- Invoice due date >= issue date
- Due date for quotes must be future date
- Quote status must be valid enum value
- WorkOrder status must be valid enum value

---

## 10. AUTOMATION OPPORTUNITIES BY MODULE

### 10.1 CRM Module
- [ ] Auto-convert leads to customers based on interaction count
- [ ] Auto-schedule follow-up reminders
- [ ] Auto-send new customer welcome email
- [ ] Auto-link related interactions to shared thread

### 10.2 Accounting Module
- [ ] Auto-send quote approval reminders
- [ ] Auto-expire quotes on validity date
- [ ] Auto-flag quotes for follow-up if not responded within X days
- [ ] Auto-generate invoice from completed work order

### 10.3 WorkOrder Module
- [ ] Auto-generate packing slips for materials
- [ ] Auto-notify employee on new assignment
- [ ] Auto-mark overdue work orders
- [ ] Auto-suggest next status based on history

### 10.4 POS Module
- [ ] Auto-suggest add-on items based on cart contents
- [ ] Auto-apply customer-specific discounts
- [ ] Auto-reserve stock during transaction

### 10.5 Inventory Module
- [ ] Auto-trigger purchase orders when stock < reorder level
- [ ] Auto-sync with supplier API for real-time pricing
- [ ] Auto-adjust prices based on supplier changes

### 10.6 Email Integration
- [ ] Auto-create tasks from emails with priority keywords
- [ ] Auto-route emails to correct department/person
- [ ] Auto-attach email to quote after creation

---

## 11. SYSTEM STATISTICS & DIMENSIONS

### Data Volume Estimates
- Inventory items: 100-1000 typical
- Customers: 50-500 typical
- Invoices per year: 100-1000+ typical
- Work orders per year: 100-500 typical
- Employees: 5-50 typical

### Storage Considerations
- Analytics events: 10,000 stored (in localStorage)
- Audit trail: Unlimited (per entity)
- Email history: Unlimited
- Attachment storage: Not currently stored (references only)

### Performance Considerations
- All data in React state (client-side)
- Filters applied in useMemo() for performance
- No server persistence (would need backend)
- No real-time sync (multi-user conflicts possible)

---

## 12. RECOMMENDATIONS FOR LEAN SIX SIGMA PROJECT

### Define Phase
1. Map current workflow: Lead → Quote → Invoice → Payment → Completion
2. Measure cycle time for each conversion step
3. Measure manual vs. automated portions
4. Identify bottlenecks (employee selection modal, manual matching, etc.)

### Measure Phase
1. Time tracking: Quote creation time (manual vs. email)
2. Error rate: Quote-to-invoice conversion failures
3. Rework rate: Quotes requiring revision
4. Approval time: Quote approval delay
5. Cash flow impact: Invoice-to-payment delay

### Analyze Phase
1. Root cause analysis: Why do quotes get rejected?
2. Failure mode analysis: What causes conversion failures?
3. Data mining: Patterns in long-cycle-time conversions
4. Constraint theory: Identify bottleneck step in value stream

### Improve Phase
1. Automation: Email parsing improvements
2. Simplification: Reduce modal steps
3. Standardization: Quote templates
4. Integration: Payment gateway automation
5. Monitoring: SLA dashboards for invoice aging

### Control Phase
1. Analytics dashboard: Track conversion cycle time
2. Alert system: Escalate old quotes/invoices
3. Process documentation: Updated workflows
4. Training: Efficient use of new automations

---

## SUMMARY TABLE: WORKFLOW COMPLEXITY

| Workflow | Steps | Manual | Automated | Validation Points | Risk Level |
|----------|-------|--------|-----------|-------------------|-----------|
| Quote → Invoice | 2 | 1 | 1 | 5 | Low |
| Quote → WorkOrder | 3 | 1 | 2 | 6 | Medium |
| WorkOrder → Invoice | 2 | 0 | 2 | 4 | Low |
| Email → Quote | 3 | 1 | 2 | 3 | Medium |
| POS Sale | 4 | 2 | 2 | 4 | Low |
| Payment Recording | 1 | 1 | 0 | 1 | Medium |

