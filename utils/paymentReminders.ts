/**
 * Payment Reminders Utility
 *
 * Lean Six Sigma Optimization: Automates payment follow-up process
 * Expected Impact:
 * - Reduces Days Sales Outstanding (DSO) by 30-50%
 * - Improves cash flow by $20K-50K annually
 * - Eliminates manual reminder tracking
 *
 * Reminder Schedule:
 * - Reminder 1: 7 days after due date
 * - Reminder 2: 14 days after due date
 * - Auto-mark as overdue: 7+ days past due
 */

import type { Invoice, Customer } from "../types";

export interface ReminderAction {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  daysOverdue: number;
  amount: number;
  reminderType: "reminder1" | "reminder2" | "overdue";
  suggestedMessage: string;
}

/**
 * Calculate days past due date
 * Returns positive number if overdue, negative if not yet due
 */
function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if reminder should be sent
 */
function shouldSendReminder(
  invoice: Invoice,
  daysOverdue: number,
  reminderType: "reminder1" | "reminder2"
): boolean {
  // Only send reminders for sent/overdue invoices (not drafts or paid)
  if (invoice.status !== "sent" && invoice.status !== "overdue") {
    return false;
  }

  const reminders = invoice.reminders || {};

  if (reminderType === "reminder1") {
    // Send reminder 1 at 7+ days overdue if not already sent
    return daysOverdue >= 7 && !reminders.reminder1Sent;
  } else if (reminderType === "reminder2") {
    // Send reminder 2 at 14+ days overdue if not already sent
    return daysOverdue >= 14 && !reminders.reminder2Sent;
  }

  return false;
}

/**
 * Generate reminder message template
 */
function generateReminderMessage(
  customer: Customer,
  invoice: Invoice,
  daysOverdue: number,
  reminderType: "reminder1" | "reminder2"
): string {
  const politeness = reminderType === "reminder1" ? "vriendelijke" : "dringende";
  const tone =
    reminderType === "reminder1"
      ? "Mogelijk is de betaling onderweg, in dat geval kunt u dit bericht negeren."
      : "We hebben nog geen betaling ontvangen voor onderstaande factuur.";

  return `Beste ${customer.name},

Dit is een ${politeness} herinnering voor factuur ${invoice.invoiceNumber}.

Factuurbedrag: €${invoice.total.toFixed(2)}
Vervaldatum: ${new Date(invoice.dueDate).toLocaleDateString("nl-NL")}
Dagen over tijd: ${daysOverdue}

${tone}

Gelieve het bedrag van €${invoice.total.toFixed(2)} te voldoen op:
${invoice.paymentTerms || "Zie factuur voor betaalgegevens"}

Bij vragen kunt u contact met ons opnemen.

Met vriendelijke groet,
Uw Bedrijf`;
}

/**
 * Get all invoices that need reminders
 */
export function getInvoicesNeedingReminders(
  invoices: Invoice[],
  customers: Customer[]
): ReminderAction[] {
  const actions: ReminderAction[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const invoice of invoices) {
    // Skip paid, cancelled, or draft invoices
    if (
      invoice.status === "paid" ||
      invoice.status === "cancelled" ||
      invoice.status === "draft"
    ) {
      continue;
    }

    const daysOverdue = calculateDaysOverdue(invoice.dueDate);
    const customer = customers.find((c) => c.id === invoice.customerId);

    if (!customer) continue;

    // Check for reminder 1 (7 days)
    if (shouldSendReminder(invoice, daysOverdue, "reminder1")) {
      actions.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        daysOverdue,
        amount: invoice.total,
        reminderType: "reminder1",
        suggestedMessage: generateReminderMessage(
          customer,
          invoice,
          daysOverdue,
          "reminder1"
        ),
      });
    }

    // Check for reminder 2 (14 days)
    else if (shouldSendReminder(invoice, daysOverdue, "reminder2")) {
      actions.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        daysOverdue,
        amount: invoice.total,
        reminderType: "reminder2",
        suggestedMessage: generateReminderMessage(
          customer,
          invoice,
          daysOverdue,
          "reminder2"
        ),
      });
    }

    // Check if should be marked as overdue (7+ days, not sent reminder yet)
    else if (daysOverdue >= 7 && invoice.status === "sent") {
      actions.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        daysOverdue,
        amount: invoice.total,
        reminderType: "overdue",
        suggestedMessage: `Auto-mark as overdue: ${daysOverdue} days past due`,
      });
    }
  }

  // Sort by days overdue (most urgent first)
  actions.sort((a, b) => b.daysOverdue - a.daysOverdue);

  return actions;
}

/**
 * Mark reminder as sent
 */
export function markReminderSent(
  invoice: Invoice,
  reminderType: "reminder1" | "reminder2"
): Invoice {
  const now = new Date().toISOString();
  const reminders = invoice.reminders || {};

  if (reminderType === "reminder1") {
    return {
      ...invoice,
      reminders: {
        ...reminders,
        reminder1Sent: true,
        reminder1SentDate: now,
        reminder1Date: now,
      },
    };
  } else {
    return {
      ...invoice,
      reminders: {
        ...reminders,
        reminder2Sent: true,
        reminder2SentDate: now,
        reminder2Date: now,
      },
    };
  }
}

/**
 * Auto-update invoice status to overdue if needed
 */
export function updateOverdueStatus(invoice: Invoice): Invoice {
  const daysOverdue = calculateDaysOverdue(invoice.dueDate);

  // Mark as overdue if 7+ days past due and currently "sent"
  if (daysOverdue >= 7 && invoice.status === "sent") {
    return {
      ...invoice,
      status: "overdue",
    };
  }

  return invoice;
}

/**
 * Process all invoices and update statuses
 * Returns updated invoices array
 */
export function processInvoiceReminders(
  invoices: Invoice[]
): { updatedInvoices: Invoice[]; overdueCount: number } {
  let overdueCount = 0;
  const updatedInvoices = invoices.map((invoice) => {
    const updated = updateOverdueStatus(invoice);
    if (updated.status === "overdue" && invoice.status !== "overdue") {
      overdueCount++;
    }
    return updated;
  });

  return { updatedInvoices, overdueCount };
}

/**
 * Get payment aging report
 */
export interface AgingBucket {
  label: string;
  count: number;
  totalAmount: number;
  invoices: string[]; // Invoice numbers
}

export function getPaymentAgingReport(invoices: Invoice[]): {
  current: AgingBucket;
  days1to7: AgingBucket;
  days8to14: AgingBucket;
  days15to30: AgingBucket;
  days31plus: AgingBucket;
  totalOutstanding: number;
} {
  const buckets = {
    current: { label: "Current (0 days)", count: 0, totalAmount: 0, invoices: [] as string[] },
    days1to7: { label: "1-7 days overdue", count: 0, totalAmount: 0, invoices: [] as string[] },
    days8to14: { label: "8-14 days overdue", count: 0, totalAmount: 0, invoices: [] as string[] },
    days15to30: { label: "15-30 days overdue", count: 0, totalAmount: 0, invoices: [] as string[] },
    days31plus: { label: "31+ days overdue", count: 0, totalAmount: 0, invoices: [] as string[] },
    totalOutstanding: 0,
  };

  for (const invoice of invoices) {
    // Only include sent/overdue invoices (not paid, cancelled, or draft)
    if (invoice.status !== "sent" && invoice.status !== "overdue") {
      continue;
    }

    const daysOverdue = calculateDaysOverdue(invoice.dueDate);
    let bucket: AgingBucket;

    if (daysOverdue < 0) {
      bucket = buckets.current;
    } else if (daysOverdue <= 7) {
      bucket = buckets.days1to7;
    } else if (daysOverdue <= 14) {
      bucket = buckets.days8to14;
    } else if (daysOverdue <= 30) {
      bucket = buckets.days15to30;
    } else {
      bucket = buckets.days31plus;
    }

    bucket.count++;
    bucket.totalAmount += invoice.total;
    bucket.invoices.push(invoice.invoiceNumber);
    buckets.totalOutstanding += invoice.total;
  }

  return buckets;
}

/**
 * Get summary stats for dashboard
 */
export function getPaymentReminderStats(
  invoices: Invoice[]
): {
  totalOverdue: number;
  totalOverdueAmount: number;
  needsReminder1: number;
  needsReminder2: number;
  averageDaysOverdue: number;
} {
  let totalOverdue = 0;
  let totalOverdueAmount = 0;
  let needsReminder1 = 0;
  let needsReminder2 = 0;
  let totalDaysOverdue = 0;

  for (const invoice of invoices) {
    if (invoice.status !== "sent" && invoice.status !== "overdue") {
      continue;
    }

    const daysOverdue = calculateDaysOverdue(invoice.dueDate);

    if (daysOverdue > 0) {
      totalOverdue++;
      totalOverdueAmount += invoice.total;
      totalDaysOverdue += daysOverdue;

      const reminders = invoice.reminders || {};
      if (daysOverdue >= 7 && !reminders.reminder1Sent) {
        needsReminder1++;
      }
      if (daysOverdue >= 14 && !reminders.reminder2Sent) {
        needsReminder2++;
      }
    }
  }

  return {
    totalOverdue,
    totalOverdueAmount,
    needsReminder1,
    needsReminder2,
    averageDaysOverdue: totalOverdue > 0 ? totalDaysOverdue / totalOverdue : 0,
  };
}
