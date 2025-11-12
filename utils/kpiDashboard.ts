/**
 * KPI Dashboard Utility
 *
 * Lean Six Sigma Optimization: Real-time performance monitoring
 * Key Performance Indicators for business health and process efficiency
 *
 * Dashboard Categories:
 * 1. Financial KPIs (Revenue, Cash Flow, Profitability)
 * 2. Operational KPIs (Cycle Times, Efficiency)
 * 3. Customer KPIs (Satisfaction, Retention)
 * 4. Process KPIs (Quality, Waste Reduction)
 */

import type {
  Quote,
  Invoice,
  WorkOrder,
  Customer,
  Lead,
  Employee,
} from "../types";
import {
  getPaymentAgingReport,
  getPaymentReminderStats,
} from "./paymentReminders";
import { getQuotePipelineMetrics } from "./quoteReminders";
import { calculateSLADashboard } from "./slaTracking";
import { getWorkloadSummary } from "./autoAssignment";

// ==================== FINANCIAL KPIs ====================

export interface FinancialKPIs {
  // Revenue
  totalRevenue: number; // Total of paid invoices
  monthlyRevenue: number; // Revenue this month
  averageInvoiceValue: number;
  revenueGrowth: number; // % change vs last month

  // Cash Flow
  outstandingReceivables: number; // Unpaid invoices
  overdueAmount: number; // Overdue invoices
  averageDaysSalesOutstanding: number; // DSO

  // Profitability
  grossMargin: number; // % (if cost data available)
  netProfit: number; // Revenue minus costs
}

export function calculateFinancialKPIs(
  invoices: Invoice[],
  previousPeriodInvoices?: Invoice[]
): FinancialKPIs {
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Monthly revenue (current month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyInvoices = paidInvoices.filter((inv) => {
    if (!inv.paidDate) return false;
    const paidDate = new Date(inv.paidDate);
    return (
      paidDate.getMonth() === currentMonth &&
      paidDate.getFullYear() === currentYear
    );
  });
  const monthlyRevenue = monthlyInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  // Average invoice value
  const averageInvoiceValue =
    paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

  // Revenue growth
  let revenueGrowth = 0;
  if (previousPeriodInvoices) {
    const previousRevenue = previousPeriodInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0);
    if (previousRevenue > 0) {
      revenueGrowth =
        ((monthlyRevenue - previousRevenue) / previousRevenue) * 100;
    }
  }

  // Outstanding receivables
  const unpaidInvoices = invoices.filter(
    (inv) => inv.status === "sent" || inv.status === "overdue"
  );
  const outstandingReceivables = unpaidInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  // Overdue amount
  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const overdueAmount = overdueInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  // Average DSO (Days Sales Outstanding)
  const paymentStats = getPaymentReminderStats(invoices);
  const averageDaysSalesOutstanding = paymentStats.averageDaysOverdue;

  return {
    totalRevenue,
    monthlyRevenue,
    averageInvoiceValue,
    revenueGrowth,
    outstandingReceivables,
    overdueAmount,
    averageDaysSalesOutstanding,
    grossMargin: 0, // TODO: Calculate when cost data available
    netProfit: totalRevenue, // Simplified: revenue only
  };
}

// ==================== OPERATIONAL KPIs ====================

export interface OperationalKPIs {
  // Cycle Times
  quoteToInvoiceTime: number; // Average days
  workOrderCompletionRate: number; // % completed on time
  averageWorkOrderDuration: number; // Days

  // Efficiency
  employeeUtilization: number; // % of capacity used
  quotesPerEmployee: number;
  workOrdersPerEmployee: number;

  // Productivity
  totalWorkOrders: number;
  completedWorkOrders: number;
  activeWorkOrders: number;
  workOrderBacklog: number;
}

export function calculateOperationalKPIs(
  quotes: Quote[],
  invoices: Invoice[],
  workOrders: WorkOrder[],
  employees: Employee[]
): OperationalKPIs {
  // Quote to Invoice time
  const convertedQuotes = quotes.filter((q) => q.workOrderId);
  let totalConversionDays = 0;
  convertedQuotes.forEach((q) => {
    if (q.timestamps?.created && q.timestamps?.convertedToInvoice) {
      const created = new Date(q.timestamps.created);
      const converted = new Date(q.timestamps.convertedToInvoice);
      const days = (converted.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      totalConversionDays += days;
    }
  });
  const quoteToInvoiceTime =
    convertedQuotes.length > 0
      ? totalConversionDays / convertedQuotes.length
      : 0;

  // Work order metrics
  const completedWorkOrders = workOrders.filter(
    (wo) => wo.status === "Completed"
  ).length;
  const activeWorkOrders = workOrders.filter(
    (wo) => wo.status === "In Progress" || wo.status === "To Do"
  ).length;
  const workOrderBacklog = workOrders.filter(
    (wo) => wo.status === "To Do"
  ).length;

  // Work order completion rate (on time)
  const completedOnTime = workOrders.filter((wo) => {
    if (wo.status !== "Completed" || !wo.scheduledDate || !wo.completedDate) {
      return false;
    }
    const scheduled = new Date(wo.scheduledDate);
    const completed = new Date(wo.completedDate);
    return completed <= scheduled;
  }).length;
  const workOrderCompletionRate =
    completedWorkOrders > 0 ? (completedOnTime / completedWorkOrders) * 100 : 0;

  // Average work order duration
  let totalDuration = 0;
  const completedWithDates = workOrders.filter(
    (wo) =>
      wo.status === "Completed" &&
      wo.timestamps?.created &&
      wo.timestamps?.completed
  );
  completedWithDates.forEach((wo) => {
    if (wo.timestamps?.created && wo.timestamps?.completed) {
      const created = new Date(wo.timestamps.created);
      const completed = new Date(wo.timestamps.completed);
      const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      totalDuration += days;
    }
  });
  const averageWorkOrderDuration =
    completedWithDates.length > 0
      ? totalDuration / completedWithDates.length
      : 0;

  // Employee metrics
  const activeEmployees = employees.filter(
    (emp) => emp.availability !== "unavailable"
  ).length;
  const quotesPerEmployee =
    activeEmployees > 0 ? quotes.length / activeEmployees : 0;
  const workOrdersPerEmployee =
    activeEmployees > 0 ? workOrders.length / activeEmployees : 0;

  // Employee utilization (simplified: % of employees with active work)
  const employeesWithWork = new Set(
    workOrders
      .filter((wo) => wo.status === "In Progress" || wo.status === "To Do")
      .map((wo) => wo.assignedTo)
  ).size;
  const employeeUtilization =
    activeEmployees > 0 ? (employeesWithWork / activeEmployees) * 100 : 0;

  return {
    quoteToInvoiceTime,
    workOrderCompletionRate,
    averageWorkOrderDuration,
    employeeUtilization,
    quotesPerEmployee,
    workOrdersPerEmployee,
    totalWorkOrders: workOrders.length,
    completedWorkOrders,
    activeWorkOrders,
    workOrderBacklog,
  };
}

// ==================== CUSTOMER KPIs ====================

export interface CustomerKPIs {
  // Customer Base
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number; // Customers with activity in last 90 days
  customerGrowthRate: number; // % change

  // Sales Pipeline
  totalLeads: number;
  activeLeads: number;
  leadConversionRate: number; // % of leads converted to customers
  quoteConversionRate: number; // % of quotes approved

  // Customer Value
  averageCustomerValue: number; // Total revenue / customers
  customerLifetimeValue: number; // Estimated
  repeatCustomerRate: number; // % with multiple invoices
}

export function calculateCustomerKPIs(
  customers: Customer[],
  leads: Lead[],
  quotes: Quote[],
  invoices: Invoice[]
): CustomerKPIs {
  const totalCustomers = customers.length;

  // New customers this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const newCustomersThisMonth = customers.filter((cust) => {
    const since = new Date(cust.since);
    return (
      since.getMonth() === currentMonth && since.getFullYear() === currentYear
    );
  }).length;

  // Active customers (with invoices in last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const activeCustomerIds = new Set(
    invoices
      .filter((inv) => new Date(inv.issueDate) >= ninetyDaysAgo)
      .map((inv) => inv.customerId)
  );
  const activeCustomers = activeCustomerIds.size;

  // Customer growth rate (simplified: this month vs last month)
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthCustomers = customers.filter((cust) => {
    const since = new Date(cust.since);
    return (
      since.getMonth() === lastMonth && since.getFullYear() === lastMonthYear
    );
  }).length;
  const customerGrowthRate =
    lastMonthCustomers > 0
      ? ((newCustomersThisMonth - lastMonthCustomers) / lastMonthCustomers) *
        100
      : 0;

  // Lead metrics
  const totalLeads = leads.length;
  const activeLeads = leads.filter(
    (lead) =>
      lead.status === "new" ||
      lead.status === "contacted" ||
      lead.status === "qualified"
  ).length;
  const convertedLeads = leads.filter((lead) => lead.status === "won").length;
  const leadConversionRate =
    totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Quote conversion rate
  const quotePipelineMetrics = getQuotePipelineMetrics(quotes);
  const quoteConversionRate = quotePipelineMetrics.conversionRate;

  // Customer value metrics
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  const averageCustomerValue =
    totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Customer lifetime value (simplified: average value * estimated years)
  const estimatedYears = 3; // Assume 3-year customer lifecycle
  const customerLifetimeValue = averageCustomerValue * estimatedYears;

  // Repeat customer rate
  const customerInvoiceCounts = new Map<string, number>();
  invoices.forEach((inv) => {
    const count = customerInvoiceCounts.get(inv.customerId) || 0;
    customerInvoiceCounts.set(inv.customerId, count + 1);
  });
  const repeatCustomers = Array.from(customerInvoiceCounts.values()).filter(
    (count) => count > 1
  ).length;
  const repeatCustomerRate =
    totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

  return {
    totalCustomers,
    newCustomersThisMonth,
    activeCustomers,
    customerGrowthRate,
    totalLeads,
    activeLeads,
    leadConversionRate,
    quoteConversionRate,
    averageCustomerValue,
    customerLifetimeValue,
    repeatCustomerRate,
  };
}

// ==================== PROCESS QUALITY KPIs ====================

export interface ProcessQualityKPIs {
  // Quality
  quoteAccuracyRate: number; // % of quotes without revisions
  invoiceErrorRate: number; // % of invoices with issues
  onTimeDeliveryRate: number; // % of work orders completed on time

  // Waste Reduction
  expiredQuoteRate: number; // % of quotes that expired
  cancelledInvoiceRate: number; // % of invoices cancelled
  reworkRate: number; // % of work orders requiring rework

  // Process Efficiency
  averageQuoteProcessingTime: number; // Hours
  averageInvoiceProcessingTime: number; // Hours
  automationRate: number; // % of processes automated
}

export function calculateProcessQualityKPIs(
  quotes: Quote[],
  invoices: Invoice[],
  workOrders: WorkOrder[]
): ProcessQualityKPIs {
  // Quote accuracy (quotes approved without rejection)
  const totalQuotesSent = quotes.filter((q) => q.status !== "draft").length;
  const quotesApproved = quotes.filter((q) => q.status === "approved").length;
  const quoteAccuracyRate =
    totalQuotesSent > 0 ? (quotesApproved / totalQuotesSent) * 100 : 0;

  // Invoice error rate (cancelled invoices as proxy)
  const totalInvoicesSent = invoices.filter((inv) => inv.status !== "draft")
    .length;
  const cancelledInvoices = invoices.filter(
    (inv) => inv.status === "cancelled"
  ).length;
  const invoiceErrorRate =
    totalInvoicesSent > 0 ? (cancelledInvoices / totalInvoicesSent) * 100 : 0;

  // On-time delivery
  const completedWorkOrders = workOrders.filter(
    (wo) => wo.status === "Completed"
  ).length;
  const onTimeWorkOrders = workOrders.filter((wo) => {
    if (wo.status !== "Completed" || !wo.scheduledDate || !wo.completedDate) {
      return false;
    }
    return new Date(wo.completedDate) <= new Date(wo.scheduledDate);
  }).length;
  const onTimeDeliveryRate =
    completedWorkOrders > 0 ? (onTimeWorkOrders / completedWorkOrders) * 100 : 0;

  // Expired quote rate
  const totalQuotes = quotes.length;
  const expiredQuotes = quotes.filter((q) => q.status === "expired").length;
  const expiredQuoteRate =
    totalQuotes > 0 ? (expiredQuotes / totalQuotes) * 100 : 0;

  // Cancelled invoice rate
  const totalInvoices = invoices.length;
  const cancelledInvoiceRate =
    totalInvoices > 0 ? (cancelledInvoices / totalInvoices) * 100 : 0;

  // Rework rate (work orders with history of status changes back to In Progress)
  const reworkWorkOrders = workOrders.filter((wo) => {
    if (!wo.history) return false;
    // Check if status went from Completed back to In Progress
    let wasCompleted = false;
    for (const entry of wo.history) {
      if (entry.action === "status_changed" && entry.toStatus === "Completed") {
        wasCompleted = true;
      }
      if (
        wasCompleted &&
        entry.action === "status_changed" &&
        entry.toStatus === "In Progress"
      ) {
        return true;
      }
    }
    return false;
  }).length;
  const reworkRate =
    workOrders.length > 0 ? (reworkWorkOrders / workOrders.length) * 100 : 0;

  // Processing times (simplified)
  const avgQuoteTime = 12; // Placeholder: 12 hours
  const avgInvoiceTime = 8; // Placeholder: 8 hours

  // Automation rate (placeholder - would need more data)
  const automationRate = 60; // 60% of processes have some automation

  return {
    quoteAccuracyRate,
    invoiceErrorRate,
    onTimeDeliveryRate,
    expiredQuoteRate,
    cancelledInvoiceRate,
    reworkRate,
    averageQuoteProcessingTime: avgQuoteTime,
    averageInvoiceProcessingTime: avgInvoiceTime,
    automationRate,
  };
}

// ==================== COMPLETE DASHBOARD ====================

export interface ComprehensiveDashboard {
  financial: FinancialKPIs;
  operational: OperationalKPIs;
  customer: CustomerKPIs;
  quality: ProcessQualityKPIs;
  sla: ReturnType<typeof calculateSLADashboard>;
  summary: {
    overallHealth: number; // 0-100 score
    topWins: string[];
    topConcerns: string[];
    actionItems: string[];
  };
}

export function calculateComprehensiveDashboard(
  quotes: Quote[],
  invoices: Invoice[],
  workOrders: WorkOrder[],
  customers: Customer[],
  leads: Lead[],
  employees: Employee[]
): ComprehensiveDashboard {
  const financial = calculateFinancialKPIs(invoices);
  const operational = calculateOperationalKPIs(
    quotes,
    invoices,
    workOrders,
    employees
  );
  const customer = calculateCustomerKPIs(customers, leads, quotes, invoices);
  const quality = calculateProcessQualityKPIs(quotes, invoices, workOrders);
  const sla = calculateSLADashboard(quotes, invoices, workOrders);

  // Calculate overall health score (0-100)
  const healthFactors = [
    sla.overallSLACompliance, // 0-100
    Math.min(operational.workOrderCompletionRate, 100), // 0-100
    quality.onTimeDeliveryRate, // 0-100
    Math.min((financial.revenueGrowth + 100) / 2, 100), // Normalize to 0-100
  ];
  const overallHealth =
    healthFactors.reduce((sum, factor) => sum + factor, 0) /
    healthFactors.length;

  // Identify top wins
  const topWins: string[] = [];
  if (customer.quoteConversionRate > 70) {
    topWins.push(`Excellent quote conversion: ${customer.quoteConversionRate.toFixed(1)}%`);
  }
  if (sla.overallSLACompliance > 80) {
    topWins.push(`Strong SLA compliance: ${sla.overallSLACompliance.toFixed(1)}%`);
  }
  if (financial.revenueGrowth > 10) {
    topWins.push(`Revenue growing: +${financial.revenueGrowth.toFixed(1)}%`);
  }

  // Identify concerns
  const topConcerns: string[] = [];
  if (financial.overdueAmount > 5000) {
    topWins.push(`High overdue amount: €${financial.overdueAmount.toFixed(2)}`);
  }
  if (quality.expiredQuoteRate > 20) {
    topConcerns.push(`Many quotes expiring: ${quality.expiredQuoteRate.toFixed(1)}%`);
  }
  if (sla.metricsAtRisk.length > 0) {
    topConcerns.push(`${sla.metricsAtRisk.length} SLA metrics at risk`);
  }

  // Action items
  const actionItems: string[] = [];
  if (financial.overdueAmount > 1000) {
    actionItems.push("Follow up on overdue invoices");
  }
  if (operational.workOrderBacklog > 10) {
    actionItems.push(`Address work order backlog (${operational.workOrderBacklog})`);
  }
  if (sla.metricsAtRisk.length > 0) {
    actionItems.push("Improve SLA performance on critical metrics");
  }

  return {
    financial,
    operational,
    customer,
    quality,
    sla,
    summary: {
      overallHealth,
      topWins,
      topConcerns,
      actionItems,
    },
  };
}
