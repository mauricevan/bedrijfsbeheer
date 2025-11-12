import { useMemo } from "react";
import type {
  Invoice,
  Quote,
  Transaction,
  Customer,
} from "../../../types";
import {
  calculateTransactionStats,
  calculateInvoiceStats,
  calculateQuoteStats,
  calculateAveragePaymentDays,
} from "../utils/calculations";

/**
 * Hook for managing accounting dashboard calculations and insights
 * @param invoices - Invoices array
 * @param quotes - Quotes array
 * @param transactions - Transactions array
 * @param customers - Customers array
 * @returns Dashboard statistics, charts data, and insights
 */
export const useAccountingDashboard = (
  invoices: Invoice[],
  quotes: Quote[],
  transactions: Transaction[],
  customers: Customer[]
) => {
  // Transaction statistics
  const transactionStats = calculateTransactionStats(transactions);

  // Invoice statistics
  const invoiceStats = calculateInvoiceStats(invoices);
  const {
    totalInvoiced,
    totalPaid,
    totalOverdue,
    totalOutstanding,
    paidInvoices,
    overdueInvoices,
    outstandingInvoices,
  } = invoiceStats;

  // Quote statistics
  const quoteStats = calculateQuoteStats(quotes);
  const {
    totalQuoted,
    totalApproved,
    totalSent,
    totalExpired,
    approvedQuotes,
    sentQuotes,
    expiredQuotes,
  } = quoteStats;

  // Open quotes count
  const openQuotes = quotes.filter(
    (q) => !["approved", "rejected"].includes(q.status)
  );
  const openQuotesCount = openQuotes.length;

  // Calculate average payment term
  const avgPaymentDays = calculateAveragePaymentDays(invoices);

  // Monthly revenue data (last 12 months)
  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      months[key] = 0;
    }

    // Add invoice revenue
    invoices.forEach((inv) => {
      if (inv.status === "paid" && inv.paidDate) {
        const date = new Date(inv.paidDate);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (months[key] !== undefined) {
          months[key] += inv.total;
        }
      }
    });

    return Object.entries(months).map(([month, revenue]) => ({
      month: month.split("-")[1] + "/" + month.split("-")[0].slice(-2),
      revenue: Math.round(revenue * 100) / 100,
    }));
  }, [invoices]);

  // Outstanding amounts per customer (top 5)
  const outstandingByCustomer = useMemo(() => {
    const customerMap: Record<string, number> = {};
    outstandingInvoices.forEach((inv) => {
      const name =
        customers.find((c) => c.id === inv.customerId)?.name || "Onbekend";
      customerMap[name] = (customerMap[name] || 0) + inv.total;
    });
    return Object.entries(customerMap)
      .map(([name, amount]) => ({
        name,
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [outstandingInvoices, customers]);

  // Sales per customer (top 5)
  const salesByCustomer = useMemo(() => {
    const customerMap: Record<string, number> = {};
    paidInvoices.forEach((inv) => {
      const name =
        customers.find((c) => c.id === inv.customerId)?.name || "Onbekend";
      customerMap[name] = (customerMap[name] || 0) + inv.total;
    });
    return Object.entries(customerMap)
      .map(([name, amount]) => ({
        name,
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [paidInvoices, customers]);

  // Quotes by status
  const quotesByStatus = useMemo(() => {
    const statusMap: Record<string, number> = {
      approved: 0,
      sent: 0,
      draft: 0,
      rejected: 0,
      expired: 0,
    };
    quotes.forEach((q) => {
      statusMap[q.status] = (statusMap[q.status] || 0) + 1;
    });
    return [
      { name: "Goedgekeurd", value: statusMap.approved, status: "approved" },
      { name: "Verzonden", value: statusMap.sent, status: "sent" },
      { name: "Concept", value: statusMap.draft, status: "draft" },
      { name: "Afgewezen", value: statusMap.rejected, status: "rejected" },
      { name: "Verlopen", value: statusMap.expired, status: "expired" },
    ].filter((item) => item.value > 0);
  }, [quotes]);

  // Payment behavior data
  const paymentBehavior = useMemo(() => {
    const behavior: Record<string, { onTime: number; late: number }> = {};
    invoices.forEach((inv) => {
      if (
        inv.status === "paid" &&
        inv.issueDate &&
        inv.paidDate &&
        inv.dueDate
      ) {
        const issueDate = new Date(inv.issueDate);
        const paidDate = new Date(inv.paidDate);
        const dueDate = new Date(inv.dueDate);
        const monthKey = `${issueDate.getFullYear()}-${String(
          issueDate.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!behavior[monthKey]) {
          behavior[monthKey] = { onTime: 0, late: 0 };
        }

        if (paidDate <= dueDate) {
          behavior[monthKey].onTime += inv.total;
        } else {
          behavior[monthKey].late += inv.total;
        }
      }
    });

    return Object.entries(behavior)
      .sort()
      .slice(-6)
      .map(([month, data]) => ({
        month: month.split("-")[1] + "/" + month.split("-")[0].slice(-2),
        "Op tijd": Math.round(data.onTime * 100) / 100,
        "Te laat": Math.round(data.late * 100) / 100,
      }));
  }, [invoices]);

  // Calculate comparison to previous period (month-over-month)
  const comparisonToPrevious = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthKey = `${lastMonth.getFullYear()}-${String(
      lastMonth.getMonth() + 1
    ).padStart(2, "0")}`;

    // Current month stats
    const currentMonthRevenue = paidInvoices
      .filter((inv) => {
        if (!inv.paidDate) return false;
        const paidDate = new Date(inv.paidDate);
        return (
          `${paidDate.getFullYear()}-${String(
            paidDate.getMonth() + 1
          ).padStart(2, "0")}` === currentMonth
        );
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const currentMonthInvoices = invoices.filter((inv) => {
      if (!inv.issueDate) return false;
      const issueDate = new Date(inv.issueDate);
      return (
        `${issueDate.getFullYear()}-${String(
          issueDate.getMonth() + 1
        ).padStart(2, "0")}` === currentMonth
      );
    }).length;

    const currentMonthOpenAmount = outstandingInvoices
      .filter((inv) => {
        if (!inv.issueDate) return false;
        const issueDate = new Date(inv.issueDate);
        return (
          `${issueDate.getFullYear()}-${String(
            issueDate.getMonth() + 1
          ).padStart(2, "0")}` === currentMonth
        );
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const currentMonthQuotes = quotes.filter((q) => {
      if (!q.createdDate) return false;
      const createdDate = new Date(q.createdDate);
      return (
        `${createdDate.getFullYear()}-${String(
          createdDate.getMonth() + 1
        ).padStart(2, "0")}` === currentMonth
      );
    });

    const currentMonthApprovedQuotes = currentMonthQuotes.filter(
      (q) => q.status === "approved"
    ).length;
    const currentMonthQuoteConversion =
      currentMonthQuotes.length > 0
        ? currentMonthApprovedQuotes / currentMonthQuotes.length
        : 0;

    // Previous month stats
    const previousMonthRevenue = paidInvoices
      .filter((inv) => {
        if (!inv.paidDate) return false;
        const paidDate = new Date(inv.paidDate);
        return (
          `${paidDate.getFullYear()}-${String(
            paidDate.getMonth() + 1
          ).padStart(2, "0")}` === previousMonthKey
        );
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const previousMonthInvoices = invoices.filter((inv) => {
      if (!inv.issueDate) return false;
      const issueDate = new Date(inv.issueDate);
      return (
        `${issueDate.getFullYear()}-${String(
          issueDate.getMonth() + 1
        ).padStart(2, "0")}` === previousMonthKey
      );
    }).length;

    const previousMonthOpenAmount = outstandingInvoices
      .filter((inv) => {
        if (!inv.issueDate) return false;
        const issueDate = new Date(inv.issueDate);
        return (
          `${issueDate.getFullYear()}-${String(
            issueDate.getMonth() + 1
          ).padStart(2, "0")}` === previousMonthKey
        );
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const previousMonthQuotes = quotes.filter((q) => {
      if (!q.createdDate) return false;
      const createdDate = new Date(q.createdDate);
      return (
        `${createdDate.getFullYear()}-${String(
          createdDate.getMonth() + 1
        ).padStart(2, "0")}` === previousMonthKey
      );
    });

    const previousMonthApprovedQuotes = previousMonthQuotes.filter(
      (q) => q.status === "approved"
    ).length;
    const previousMonthQuoteConversion =
      previousMonthQuotes.length > 0
        ? previousMonthApprovedQuotes / previousMonthQuotes.length
        : 0;

    return {
      revenueChange:
        previousMonthRevenue > 0
          ? (currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue
          : 0,
      invoicesChange:
        previousMonthInvoices > 0
          ? (currentMonthInvoices - previousMonthInvoices) /
            previousMonthInvoices
          : 0,
      openAmountChange:
        previousMonthOpenAmount > 0
          ? (currentMonthOpenAmount - previousMonthOpenAmount) /
            previousMonthOpenAmount
          : 0,
      quoteConversionChange:
        previousMonthQuoteConversion > 0
          ? (currentMonthQuoteConversion - previousMonthQuoteConversion) /
            previousMonthQuoteConversion
          : 0,
    };
  }, [paidInvoices, invoices, outstandingInvoices, quotes]);

  // Calculate previous year sales (same months last year)
  const previousYearSales = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();

    // Initialize last 6 months of previous year
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear() - 1, now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      months[key] = 0;
    }

    // Add invoice revenue from previous year
    paidInvoices.forEach((inv) => {
      if (inv.paidDate) {
        const date = new Date(inv.paidDate);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (months[key] !== undefined) {
          months[key] += inv.total;
        }
      }
    });

    return Object.entries(months).map(([month, revenue]) => ({
      month: month.split("-")[1] + "/" + month.split("-")[0].slice(-2),
      revenue: Math.round(revenue * 100) / 100,
    }));
  }, [paidInvoices]);

  // Enhanced outstanding by customer with days open
  const openByCustomer = useMemo(() => {
    const customerMap: Record<
      string,
      { amount: number; daysOpen: number[] }
    > = {};

    outstandingInvoices.forEach((inv) => {
      const name =
        customers.find((c) => c.id === inv.customerId)?.name || "Onbekend";
      if (!customerMap[name]) {
        customerMap[name] = { amount: 0, daysOpen: [] };
      }
      customerMap[name].amount += inv.total;

      if (inv.issueDate) {
        const issueDate = new Date(inv.issueDate);
        const daysOpen = Math.floor(
          (new Date().getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        customerMap[name].daysOpen.push(daysOpen);
      }
    });

    return Object.entries(customerMap)
      .map(([name, data]) => ({
        name,
        amount: Math.round(data.amount * 100) / 100,
        avgDaysOpen:
          data.daysOpen.length > 0
            ? Math.round(
                data.daysOpen.reduce((sum, days) => sum + days, 0) /
                  data.daysOpen.length
              )
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [outstandingInvoices, customers]);

  return {
    // Statistics
    stats: {
      transaction: transactionStats,
      invoice: invoiceStats,
      quote: quoteStats,
      openQuotesCount,
      avgPaymentDays,
    },
    // Charts data
    charts: {
      monthlyRevenue,
      outstandingByCustomer,
      salesByCustomer,
      quotesByStatus,
      paymentBehavior,
      previousYearSales,
      openByCustomer,
    },
    // Insights
    insights: {
      comparisonToPrevious,
    },
    // Raw data for convenience
    raw: {
      paidInvoices,
      overdueInvoices,
      outstandingInvoices,
      approvedQuotes,
      sentQuotes,
      expiredQuotes,
      openQuotes,
    },
  };
};

