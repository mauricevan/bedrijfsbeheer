/**
 * SLA (Service Level Agreement) Tracking Utility
 *
 * Lean Six Sigma Optimization: Monitors process performance against targets
 * Expected Impact:
 * - Identifies process bottlenecks
 * - Ensures consistent service delivery
 * - Provides data for continuous improvement
 *
 * SLA Metrics Tracked:
 * - Quote Response Time: Target < 24 hours
 * - Quote to Work Order: Target < 1 hour
 * - Work Order Completion: Target < scheduled date
 * - Invoice Payment Time: Target < 14 days
 * - Customer Response Time: Target < 4 hours
 */

import type { Quote, Invoice, WorkOrder } from "../types";

export interface SLATarget {
  name: string;
  targetHours: number;
  targetDays?: number;
  description: string;
}

export interface SLAMetric {
  metricName: string;
  target: number; // in hours
  actual: number; // in hours
  withinSLA: boolean;
  variance: number; // positive = under target (good), negative = over target (bad)
  percentOfTarget: number;
  status: "excellent" | "good" | "warning" | "critical";
}

export interface SLADashboard {
  quoteResponseTime: SLAMetric;
  quoteToWorkOrder: SLAMetric;
  workOrderCompletion: SLAMetric;
  invoicePayment: SLAMetric;
  overallSLACompliance: number; // percentage
  metricsAtRisk: SLAMetric[];
}

// SLA Targets (configurable)
export const SLA_TARGETS = {
  QUOTE_RESPONSE: { hours: 24, description: "Time to create and send quote" },
  QUOTE_TO_WORKORDER: {
    hours: 1,
    description: "Time to convert approved quote to work order",
  },
  WORKORDER_COMPLETION: {
    hours: 168, // 7 days default
    description: "Time to complete work order from creation",
  },
  INVOICE_PAYMENT: {
    hours: 336, // 14 days
    description: "Time from invoice sent to payment received",
  },
  CUSTOMER_RESPONSE: {
    hours: 4,
    description: "Time to respond to customer inquiry",
  },
};

/**
 * Calculate hours between two timestamps
 */
function calculateHoursBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Determine SLA status based on variance
 */
function determineSLAStatus(
  percentOfTarget: number
): "excellent" | "good" | "warning" | "critical" {
  if (percentOfTarget <= 50) return "excellent"; // Completed in 50% or less of target
  if (percentOfTarget <= 80) return "good"; // Completed in 80% or less of target
  if (percentOfTarget <= 100) return "warning"; // Completed within target but close
  return "critical"; // Exceeded target
}

/**
 * Calculate Quote Response Time SLA
 * Measures: Time from quote created to quote sent
 */
export function calculateQuoteResponseTimeSLA(quotes: Quote[]): SLAMetric {
  const sentQuotes = quotes.filter(
    (q) => q.timestamps?.created && q.timestamps?.sent
  );

  if (sentQuotes.length === 0) {
    return {
      metricName: "Quote Response Time",
      target: SLA_TARGETS.QUOTE_RESPONSE.hours,
      actual: 0,
      withinSLA: true,
      variance: 0,
      percentOfTarget: 0,
      status: "excellent",
    };
  }

  const totalHours = sentQuotes.reduce((sum, quote) => {
    if (quote.timestamps?.created && quote.timestamps?.sent) {
      return (
        sum + calculateHoursBetween(quote.timestamps.created, quote.timestamps.sent)
      );
    }
    return sum;
  }, 0);

  const avgHours = totalHours / sentQuotes.length;
  const target = SLA_TARGETS.QUOTE_RESPONSE.hours;
  const variance = target - avgHours;
  const percentOfTarget = (avgHours / target) * 100;

  return {
    metricName: "Quote Response Time",
    target,
    actual: avgHours,
    withinSLA: avgHours <= target,
    variance,
    percentOfTarget,
    status: determineSLAStatus(percentOfTarget),
  };
}

/**
 * Calculate Quote to WorkOrder Conversion Time SLA
 * Measures: Time from quote approved to work order created
 */
export function calculateQuoteToWorkOrderSLA(
  quotes: Quote[],
  workOrders: WorkOrder[]
): SLAMetric {
  const convertedQuotes = quotes.filter(
    (q) =>
      q.workOrderId &&
      q.timestamps?.approved &&
      q.timestamps?.convertedToWorkOrder
  );

  if (convertedQuotes.length === 0) {
    return {
      metricName: "Quote → WorkOrder Time",
      target: SLA_TARGETS.QUOTE_TO_WORKORDER.hours,
      actual: 0,
      withinSLA: true,
      variance: 0,
      percentOfTarget: 0,
      status: "excellent",
    };
  }

  const totalHours = convertedQuotes.reduce((sum, quote) => {
    if (quote.timestamps?.approved && quote.timestamps?.convertedToWorkOrder) {
      return (
        sum +
        calculateHoursBetween(
          quote.timestamps.approved,
          quote.timestamps.convertedToWorkOrder
        )
      );
    }
    return sum;
  }, 0);

  const avgHours = totalHours / convertedQuotes.length;
  const target = SLA_TARGETS.QUOTE_TO_WORKORDER.hours;
  const variance = target - avgHours;
  const percentOfTarget = (avgHours / target) * 100;

  return {
    metricName: "Quote → WorkOrder Time",
    target,
    actual: avgHours,
    withinSLA: avgHours <= target,
    variance,
    percentOfTarget,
    status: determineSLAStatus(percentOfTarget),
  };
}

/**
 * Calculate Work Order Completion Time SLA
 * Measures: Time from work order created to completed
 */
export function calculateWorkOrderCompletionSLA(
  workOrders: WorkOrder[]
): SLAMetric {
  const completedWorkOrders = workOrders.filter(
    (wo) =>
      wo.status === "Completed" &&
      wo.timestamps?.created &&
      wo.timestamps?.completed
  );

  if (completedWorkOrders.length === 0) {
    return {
      metricName: "WorkOrder Completion Time",
      target: SLA_TARGETS.WORKORDER_COMPLETION.hours,
      actual: 0,
      withinSLA: true,
      variance: 0,
      percentOfTarget: 0,
      status: "excellent",
    };
  }

  const totalHours = completedWorkOrders.reduce((sum, wo) => {
    if (wo.timestamps?.created && wo.timestamps?.completed) {
      return (
        sum + calculateHoursBetween(wo.timestamps.created, wo.timestamps.completed)
      );
    }
    return sum;
  }, 0);

  const avgHours = totalHours / completedWorkOrders.length;
  const target = SLA_TARGETS.WORKORDER_COMPLETION.hours;
  const variance = target - avgHours;
  const percentOfTarget = (avgHours / target) * 100;

  return {
    metricName: "WorkOrder Completion Time",
    target,
    actual: avgHours,
    withinSLA: avgHours <= target,
    variance,
    percentOfTarget,
    status: determineSLAStatus(percentOfTarget),
  };
}

/**
 * Calculate Invoice Payment Time SLA
 * Measures: Time from invoice sent to payment received
 */
export function calculateInvoicePaymentSLA(invoices: Invoice[]): SLAMetric {
  const paidInvoices = invoices.filter(
    (inv) =>
      inv.status === "paid" && inv.timestamps?.sent && inv.timestamps?.paid
  );

  if (paidInvoices.length === 0) {
    return {
      metricName: "Invoice Payment Time",
      target: SLA_TARGETS.INVOICE_PAYMENT.hours,
      actual: 0,
      withinSLA: true,
      variance: 0,
      percentOfTarget: 0,
      status: "excellent",
    };
  }

  const totalHours = paidInvoices.reduce((sum, inv) => {
    if (inv.timestamps?.sent && inv.timestamps?.paid) {
      return (
        sum + calculateHoursBetween(inv.timestamps.sent, inv.timestamps.paid)
      );
    }
    return sum;
  }, 0);

  const avgHours = totalHours / paidInvoices.length;
  const target = SLA_TARGETS.INVOICE_PAYMENT.hours;
  const variance = target - avgHours;
  const percentOfTarget = (avgHours / target) * 100;

  return {
    metricName: "Invoice Payment Time",
    target,
    actual: avgHours,
    withinSLA: avgHours <= target,
    variance,
    percentOfTarget,
    status: determineSLAStatus(percentOfTarget),
  };
}

/**
 * Calculate overall SLA compliance dashboard
 */
export function calculateSLADashboard(
  quotes: Quote[],
  invoices: Invoice[],
  workOrders: WorkOrder[]
): SLADashboard {
  const quoteResponseTime = calculateQuoteResponseTimeSLA(quotes);
  const quoteToWorkOrder = calculateQuoteToWorkOrderSLA(quotes, workOrders);
  const workOrderCompletion = calculateWorkOrderCompletionSLA(workOrders);
  const invoicePayment = calculateInvoicePaymentSLA(invoices);

  const allMetrics = [
    quoteResponseTime,
    quoteToWorkOrder,
    workOrderCompletion,
    invoicePayment,
  ];

  // Calculate overall compliance (percentage of metrics within SLA)
  const metricsWithinSLA = allMetrics.filter((m) => m.withinSLA).length;
  const overallSLACompliance = (metricsWithinSLA / allMetrics.length) * 100;

  // Identify metrics at risk (warning or critical)
  const metricsAtRisk = allMetrics.filter(
    (m) => m.status === "warning" || m.status === "critical"
  );

  return {
    quoteResponseTime,
    quoteToWorkOrder,
    workOrderCompletion,
    invoicePayment,
    overallSLACompliance,
    metricsAtRisk,
  };
}

/**
 * Get SLA violations (for alerts/notifications)
 */
export interface SLAViolation {
  type: "quote" | "workorder" | "invoice";
  id: string;
  metricName: string;
  hoursOverdue: number;
  daysOverdue: number;
  severity: "warning" | "critical";
}

export function getSLAViolations(
  quotes: Quote[],
  invoices: Invoice[],
  workOrders: WorkOrder[]
): SLAViolation[] {
  const violations: SLAViolation[] = [];
  const now = new Date().toISOString();

  // Check quotes awaiting response (created but not sent)
  for (const quote of quotes) {
    if (quote.status === "draft" && quote.timestamps?.created) {
      const hoursElapsed = calculateHoursBetween(
        quote.timestamps.created,
        now
      );
      if (hoursElapsed > SLA_TARGETS.QUOTE_RESPONSE.hours) {
        violations.push({
          type: "quote",
          id: quote.id,
          metricName: "Quote Response Time",
          hoursOverdue: hoursElapsed - SLA_TARGETS.QUOTE_RESPONSE.hours,
          daysOverdue:
            (hoursElapsed - SLA_TARGETS.QUOTE_RESPONSE.hours) / 24,
          severity:
            hoursElapsed > SLA_TARGETS.QUOTE_RESPONSE.hours * 2
              ? "critical"
              : "warning",
        });
      }
    }
  }

  // Check work orders overdue
  for (const wo of workOrders) {
    if (
      (wo.status === "To Do" || wo.status === "In Progress") &&
      wo.timestamps?.created
    ) {
      const hoursElapsed = calculateHoursBetween(wo.timestamps.created, now);
      if (hoursElapsed > SLA_TARGETS.WORKORDER_COMPLETION.hours) {
        violations.push({
          type: "workorder",
          id: wo.id,
          metricName: "WorkOrder Completion",
          hoursOverdue:
            hoursElapsed - SLA_TARGETS.WORKORDER_COMPLETION.hours,
          daysOverdue:
            (hoursElapsed - SLA_TARGETS.WORKORDER_COMPLETION.hours) / 24,
          severity:
            hoursElapsed > SLA_TARGETS.WORKORDER_COMPLETION.hours * 1.5
              ? "critical"
              : "warning",
        });
      }
    }
  }

  // Check invoices overdue for payment
  for (const inv of invoices) {
    if (
      (inv.status === "sent" || inv.status === "overdue") &&
      inv.timestamps?.sent
    ) {
      const hoursElapsed = calculateHoursBetween(inv.timestamps.sent, now);
      if (hoursElapsed > SLA_TARGETS.INVOICE_PAYMENT.hours) {
        violations.push({
          type: "invoice",
          id: inv.id,
          metricName: "Invoice Payment",
          hoursOverdue: hoursElapsed - SLA_TARGETS.INVOICE_PAYMENT.hours,
          daysOverdue:
            (hoursElapsed - SLA_TARGETS.INVOICE_PAYMENT.hours) / 24,
          severity:
            hoursElapsed > SLA_TARGETS.INVOICE_PAYMENT.hours * 1.5
              ? "critical"
              : "warning",
        });
      }
    }
  }

  // Sort by severity (critical first) then by hours overdue
  violations.sort((a, b) => {
    if (a.severity === b.severity) {
      return b.hoursOverdue - a.hoursOverdue;
    }
    return a.severity === "critical" ? -1 : 1;
  });

  return violations;
}

/**
 * Get SLA performance trend (for charting)
 * Returns data points for the last N days
 */
export interface SLATrendDataPoint {
  date: string;
  quoteResponseAvg: number;
  workOrderCompletionAvg: number;
  invoicePaymentAvg: number;
  complianceRate: number;
}

export function getSLAPerformanceTrend(
  quotes: Quote[],
  invoices: Invoice[],
  workOrders: WorkOrder[],
  days: number = 30
): SLATrendDataPoint[] {
  const trend: SLATrendDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Filter data for this specific day
    const dayQuotes = quotes.filter((q) =>
      q.timestamps?.sent?.startsWith(dateStr)
    );
    const dayInvoices = invoices.filter((inv) =>
      inv.timestamps?.paid?.startsWith(dateStr)
    );
    const dayWorkOrders = workOrders.filter((wo) =>
      wo.timestamps?.completed?.startsWith(dateStr)
    );

    // Calculate metrics for this day
    const quoteMetric = calculateQuoteResponseTimeSLA(dayQuotes);
    const woMetric = calculateWorkOrderCompletionSLA(dayWorkOrders);
    const invMetric = calculateInvoicePaymentSLA(dayInvoices);

    const metricsCount = 3;
    const metricsWithinSLA =
      (quoteMetric.withinSLA ? 1 : 0) +
      (woMetric.withinSLA ? 1 : 0) +
      (invMetric.withinSLA ? 1 : 0);
    const complianceRate = (metricsWithinSLA / metricsCount) * 100;

    trend.push({
      date: dateStr,
      quoteResponseAvg: quoteMetric.actual,
      workOrderCompletionAvg: woMetric.actual,
      invoicePaymentAvg: invMetric.actual,
      complianceRate,
    });
  }

  return trend;
}
