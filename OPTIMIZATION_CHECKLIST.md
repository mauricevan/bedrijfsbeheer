# Lean Six Sigma Optimization Checklist - Bedrijfsbeheer

## Quick Reference: Key Metrics to Measure

### 1. Quote Cycle Time
- **Definition**: Time from quote creation to approval
- **Current State**: Unknown (recommend measuring)
- **Best Practice**: < 2 days
- **Measurement Method**: Quote.timestamps.created → Quote.timestamps.approved
- **Target Reduction**: 20-30%

### 2. Quote-to-Invoice Conversion Time
- **Definition**: Time from quote approval to invoice creation
- **Current State**: Minutes (if manual) to instant (if automated)
- **Best Practice**: Automatic or < 15 minutes
- **Issue**: User must click "Convert" button manually
- **Opportunity**: Auto-conversion or one-click batch conversion

### 3. Invoice Payment Lag
- **Definition**: Days from invoice sent to payment received
- **Current State**: 14+ days (based on default payment terms)
- **Best Practice**: < 10 days
- **Opportunity**: Payment reminders, early payment discounts, autopay

### 4. WorkOrder Assignment Time
- **Definition**: Time from quote acceptance to work order creation & assignment
- **Current State**: 1-5 minutes (modal selection adds friction)
- **Best Practice**: < 2 minutes
- **Issue**: Modal selection requires manager intervention
- **Opportunity**: Auto-assignment based on workload

### 5. Inventory Search Time
- **Definition**: Time to find and select item in POS/Accounting/WorkOrder
- **Current State**: 10-30 seconds (3 SKU types to search)
- **Best Practice**: < 5 seconds
- **Opportunity**: Consolidate SKU types, predictive search, favorites

### 6. Email-to-Quote Conversion Rate
- **Definition**: % of emails that successfully become quotes
- **Current State**: Unknown (recommend tracking)
- **Best Practice**: > 95%
- **Issue**: Manual customer matching fallback
- **Opportunity**: Fuzzy matching, better email parsing

---

## Workflow Friction Points Priority Matrix

| Friction Point | Severity | Frequency | Effort | Priority |
|---|---|---|---|---|
| Manual employee assignment modal | High | Daily | Low | 1 |
| Email customer matching fallback | Medium | 5x/week | Medium | 2 |
| Manual payment recording | High | Daily | Medium | 3 |
| Inventory search (3 SKU types) | Medium | Hourly | Low | 4 |
| Category filter redundancy | Low | Hourly | Low | 5 |
| Pending status complexity | Low | Daily | Medium | 6 |
| Quote approval reminders | Medium | Weekly | Low | 7 |
| Stock check confirmation dialog | Low | Daily | Low | 8 |
| Invoice clone status reset | Low | Weekly | Low | 9 |
| WorkOrder SLA tracking | Medium | Daily | High | 10 |

---

## Value Stream Mapping Template

### Current State Workflow:
```
Step 1: Email Received
├─ Time: 0 sec
├─ Value: 0% (pure wait)
└─ Issue: N/A

Step 2: Email Parsing
├─ Time: 1 sec (automated)
├─ Value: 80% (automation reduces time)
└─ Issue: Customer matching fallback sometimes needed

Step 3: Customer Selection (if needed)
├─ Time: 30 sec (manual)
├─ Value: 0% (pure wait, should be automated)
└─ Issue: Email domain matching could improve hit rate

Step 4: Quote Review & Confirmation
├─ Time: 2 min (manual)
├─ Value: 100% (business decision)
└─ Issue: Could be sped up with better preview

Step 5: Quote Creation
├─ Time: 2 sec (automated)
├─ Value: 100% (system processing)
└─ Issue: None

Step 6: User Waits for Quote Approval
├─ Time: 1-7 days (wait for customer)
├─ Value: 0% (pure wait, no internal action)
└─ Issue: Could send automatic reminders

Step 7: Quote Approved
├─ Time: 0 sec (event)
├─ Value: 100% (business milestone)
└─ Issue: No auto-escalation

Step 8: Convert to WorkOrder (Manual)
├─ Time: 2 min (modal selection)
├─ Value: 50% (partly manual, should be auto)
└─ Issue: User must select assignee

Step 9: WorkOrder Created
├─ Time: 2 sec (automated)
├─ Value: 100% (system processing)
└─ Issue: None

Step 10: Employee Works on Order
├─ Time: 1-14 days (value-added work)
├─ Value: 100% (customer value)
└─ Issue: No SLA tracking

Step 11: Mark Complete & Convert to Invoice (Manual)
├─ Time: 3 min (manual)
├─ Value: 50% (partly manual)
└─ Issue: Could be auto-triggered

Step 12: Invoice Created
├─ Time: 2 sec (automated)
├─ Value: 100% (system processing)
└─ Issue: None

Step 13: User Sends Invoice
├─ Time: 1 min (manual)
├─ Value: 0% (pure wait, should auto-send)
└─ Issue: Could be auto-sent on creation

Step 14: Customer Receives & Pays
├─ Time: 5-30 days (wait for customer)
├─ Value: 0% (pure wait, no internal action)
└─ Issue: Payment reminders not auto-sent

Step 15: User Records Payment (Manual)
├─ Time: 2 min (manual)
├─ Value: 0% (should be auto from payment gateway)
└─ Issue: Manual recording prone to errors
```

### Total Lead Time: 8-52 days
### Total Processing Time: 15 minutes
### Total Value Time: 8-52 days (mostly wait time outside company control)
### Value Stream Efficiency: ~30-50%

---

## DMAIC Roadmap

### DEFINE Phase
- [ ] Map end-to-end quote-to-payment workflow
- [ ] Identify key business processes
- [ ] Determine current lead times
- [ ] Define customer expectations (what's "fast enough"?)
- [ ] Calculate current cost of poor quality (COPQ)

### MEASURE Phase
- [ ] Track quote creation time (manual vs. email)
- [ ] Measure quote-to-approval time
- [ ] Measure approval-to-invoice time
- [ ] Track payment collection time
- [ ] Measure error/rework rates
- [ ] Calculate cycle time variance
- [ ] Track employee assignment time

### ANALYZE Phase
- [ ] Root cause analysis: Why are quotes delayed?
- [ ] Failure mode analysis: What causes conversion failures?
- [ ] Pareto analysis: 80% of delays from 20% of causes?
- [ ] Process mining: Identify bottlenecks in actual data
- [ ] Data correlation: Which factors most impact lead time?

### IMPROVE Phase
Implementation in Order of Priority:
1. Auto-assignment for work orders (+15% faster)
2. Fuzzy email customer matching (+10% accuracy)
3. Auto-send payment reminders (+20% faster payment)
4. Consolidate SKU types (+30% faster search)
5. Auto-convert completed work orders to invoices (+10% faster)

### CONTROL Phase
- [ ] Establish SLAs for each workflow step
- [ ] Create dashboard to monitor KPIs
- [ ] Set up alerts for process deviations
- [ ] Monthly review of metrics
- [ ] Continuous improvement culture

---

## Specific Recommendations (Prioritized)

### QUICK WINS (Implement First - Low Effort, High Impact)

#### 1. Auto-Assignment for WorkOrders
**Current**: Click button → Modal opens → Select employee → Confirm
**Proposed**: Click button → Auto-assign to best available employee → Done
- Effort: 1 day development
- Saving: 1-2 min per work order × 100+ orders/year = 100-200 hours/year
- Implementation:
  - Track employee workload (open vs. completed work orders)
  - Auto-assign to employee with lowest workload
  - Allow manager to override if needed
  - Add "reassign" button instead of modal

#### 2. Fuzzy Email-to-Customer Matching
**Current**: Match by exact email → Fallback to manual selection
**Proposed**: Match by email, company domain, or fuzzy name matching
- Effort: 3 days development
- Saving: 30 sec × 50% of emails that don't exact match = 25-50 hours/year
- Implementation:
  - Add company domain extraction from email
  - Implement fuzzy string matching on customer name
  - Show top 3 matches instead of requiring exact match
  - Remember selected customers for future emails

#### 3. Auto-Send Payment Reminders
**Current**: Dates calculated in database, but not sent to customer
**Proposed**: Auto-send email reminders on reminder1Date and reminder2Date
- Effort: 2 days development
- Saving: 20% faster payment collection × invoice value = Thousands in cash flow
- Implementation:
  - Check due dates daily
  - Auto-send email if reminder1Date passed and not sent
  - Track reminder1Sent flag
  - Repeat for reminder2Date

#### 4. Sticky Category Filter (POS/Accounting/WorkOrder)
**Current**: Select category → Must reselect when switching views
**Proposed**: Remember last selected category in localStorage
- Effort: 0.5 days development
- Saving: 10 sec × 100 selections/day = 15 min/day
- Implementation:
  - Store categoryFilter in localStorage per module
  - Restore on module load
  - Add "Clear filter" button
  - Add "Remember filter" toggle

### MEDIUM WINS (Implement Second - Medium Effort, Good Impact)

#### 5. Quote Approval Reminders
**Current**: Quote expires silently, no notification sent
**Proposed**: Send reminders at 50% and 80% of validity period
- Effort: 2 days development
- Impact: Faster quote responses, higher approval rate
- Implementation:
  - Check quote validity dates daily
  - At 50%: Send reminder to customer "50% of validity left"
  - At 80%: Send escalation "Expires in 2 days"
  - At 100%: Auto-expire quote

#### 6. Consolidate SKU Types
**Current**: Search across supplierSku, autoSku, customSku (3 types)
**Proposed**: Use 2 types: auto (system) + custom (user)
- Effort: 3 days refactoring + migration
- Impact: 30% faster inventory search, less user confusion
- Implementation:
  - Phase out supplierSku (migrate to customSku)
  - Consolidate search to check only autoSku and customSku
  - Update UI to show type indicator
  - Update documentation

#### 7. Auto-Expire Quotes
**Current**: Quotes remain in "sent" status indefinitely
**Proposed**: Auto-move quotes to "expired" status after validity date
- Effort: 1 day development
- Impact: Cleaner quote list, less confusion
- Implementation:
  - Daily check of validUntil dates
  - Auto-update status if past validUntil
  - Add notification when quote expires
  - Add option to extend validity

#### 8. Quote Templates by Customer Type
**Current**: Enter all items manually each time
**Proposed**: Save quote template, clone and reuse
- Effort: 2 days development
- Impact: 50% faster quote creation for repeat customers
- Implementation:
  - Add "Save as Template" button on quotes
  - Store template with customer type
  - Show template suggestions when creating new quote
  - One-click template application with quantity adjustment

### STRATEGIC WINS (Implement Third - Higher Effort, Major Impact)

#### 9. Payment Gateway Integration
**Current**: Manual payment recording, no integration
**Proposed**: Integrate with payment gateway (Stripe, iDEAL, etc.)
- Effort: 1-2 weeks development + setup
- Impact: Auto payment recording, cash flow visibility, reduced errors
- Implementation:
  - Integrate payment provider API
  - Auto-update invoice status from payment confirmation
  - Send automatic receipts to customers
  - Reconciliation dashboard

#### 10. WorkOrder SLA & Escalation
**Current**: No tracking of overdue work orders
**Proposed**: Set SLA per customer/type, escalate if at risk
- Effort: 2 weeks development
- Impact: Improved on-time delivery, early problem detection
- Implementation:
  - Define SLA by work order type (standard, urgent, etc.)
  - Calculate days-at-risk for each work order
  - Dashboard showing at-risk and overdue orders
  - Auto-notification when approaching SLA
  - Manager escalation if SLA breached

#### 11. Batch Operations & Automation Rules
**Current**: Manual one-by-one conversions
**Proposed**: Batch convert quotes/invoices, automation rules
- Effort: 3 weeks development
- Impact: 50-80% faster for bulk operations
- Implementation:
  - Multi-select quotes for batch approval
  - Batch convert to work orders with default assignment
  - Create automation rules (e.g., "auto-convert all approved quotes weekly")
  - Scheduling for automatic runs

#### 12. Unified Customer 360° Dashboard
**Current**: Customer info scattered across CRM, Accounting, WorkOrders
**Proposed**: Single customer view with all transactions and status
- Effort: 1 week development
- Impact: Better customer insights, faster decision making
- Implementation:
  - Aggregate customer data from all modules
  - Show recent quotes, invoices, work orders
  - Display financial summary (balance, outstanding, paid)
  - Activity timeline with all interactions
  - One-click drill-down to details

---

## Expected Outcomes After Implementation

### Timing Improvements
| Metric | Current | Target | Improvement |
|---|---|---|---|
| Email-to-Quote time | 2-3 min | 30 sec | 80% ↓ |
| Quote-to-WorkOrder time | 2-3 min | 30 sec | 80% ↓ |
| WorkOrder-to-Invoice time | 2-3 min | 30 sec | 80% ↓ |
| Invoice-to-Payment time | 14+ days | 7-10 days | 30% ↓ |
| Inventory search time | 20-30 sec | 5 sec | 75% ↓ |
| Customer matching rate | 50-60% | 95%+ | 60% ↑ |

### Quality Improvements
| Metric | Current | Target | Improvement |
|---|---|---|---|
| Manual data entry errors | Unknown | 50% ↓ | Automation |
| Missed payment reminders | High | ~0% | Auto-send |
| Overdue work orders missed | Unknown | 0% | SLA tracking |
| Quote expiry awareness | ~50% | 100% | Auto-notify |
| Payment recording accuracy | ~90% | 99%+ | Auto-record |

### Financial Impact (Estimated)
- **Improved Cash Flow**: Faster payment collection = $20K-50K annually (depending on volume)
- **Labor Savings**: 100-200 hours/year × $50/hr = $5K-10K annually
- **Error Reduction**: 50% fewer manual errors = $2K-5K annually
- **Total Estimated Annual Benefit**: $27K-65K

---

## Implementation Roadmap (6-Month Plan)

### Month 1: Quick Wins (20% effort, 30% benefit)
- [ ] Auto-assignment for work orders
- [ ] Fuzzy email customer matching
- [ ] Sticky category filter
- [ ] Quote approval reminders

### Month 2-3: Medium Wins (40% effort, 40% benefit)
- [ ] Payment reminder automation
- [ ] SKU type consolidation
- [ ] Quote templates
- [ ] Auto-expiry for quotes

### Month 4-5: Strategic Wins (40% effort, 30% benefit)
- [ ] Payment gateway integration
- [ ] WorkOrder SLA & escalation
- [ ] Batch operations

### Month 6: Monitoring & Continuous Improvement
- [ ] Dashboard for cycle time KPIs
- [ ] Process mining analysis
- [ ] Next round improvements

---

## Success Metrics Dashboard

**Weekly Metrics to Track:**
- Average quote creation time
- Average quote approval time
- % of automated vs. manual conversions
- Average payment lag (days)
- % of quotes requiring manual customer selection
- Customer satisfaction (if available)

**Monthly Metrics:**
- Total processing time reduction
- Error rate trend
- Cash flow improvement
- Employee time saved
- System reliability/uptime

