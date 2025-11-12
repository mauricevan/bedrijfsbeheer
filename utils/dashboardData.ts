/**
 * Utility function to transform dashboard data to Mock API structure
 * This matches the format expected from the /api/dashboard-data endpoint
 */

import { Invoice, Quote, Customer, Transaction } from '../types';

export interface DashboardDataResponse {
  period: string;
  comparisonToPrevious: {
    revenueChange: number;
    invoicesChange: number;
    openAmountChange: number;
    quoteConversionChange: number;
  };
  stats: {
    totalRevenue: number;
    totalInvoiced: number;
    openAmount: number;
    averagePaymentTermDays: number;
    openQuotes: number;
  };
  salesByMonth: Array<{ month: string; revenue: number }>;
  previousYearSales: Array<{ month: string; revenue: number }>;
  openByCustomer: Array<{ name: string; amount: number; daysOpen: number }>;
  topCustomers: Array<{ name: string; revenue: number; profit: number; trend: number }>;
  quotesByStatus: Array<{ status: string; count: number; totalValue: number }>;
  paymentBehavior: Array<{ month: string; onTime: number; late: number }>;
  insights: string[];
}

export function transformDashboardData(
  invoices: Invoice[],
  quotes: Quote[],
  customers: Customer[],
  transactions: Transaction[]
): DashboardDataResponse {
  const now = new Date();
  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const period = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  // Calculate statistics
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingInvoices = invoices.filter(inv => 
    ['sent', 'overdue'].includes(inv.status)
  );
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);
  
  const paidInvoicesWithDates = invoices.filter(
    inv => inv.status === 'paid' && inv.issueDate && inv.paidDate
  );
  const avgPaymentDays = paidInvoicesWithDates.length > 0
    ? Math.round(
        paidInvoicesWithDates.reduce((sum, inv) => {
          const issueDate = new Date(inv.issueDate);
          const paidDate = new Date(inv.paidDate!);
          const diffTime = Math.abs(paidDate.getTime() - issueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0) / paidInvoicesWithDates.length
      )
    : 0;

  const openQuotes = quotes.filter(q => !['approved', 'rejected'].includes(q.status));

  // Calculate comparison to previous period
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthRevenue = paidInvoices
    .filter(inv => {
      if (!inv.paidDate) return false;
      const paidDate = new Date(inv.paidDate);
      return `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}` === currentMonth;
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  const previousMonthRevenue = paidInvoices
    .filter(inv => {
      if (!inv.paidDate) return false;
      const paidDate = new Date(inv.paidDate);
      return `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}` === previousMonthKey;
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  const currentMonthInvoices = invoices.filter(inv => {
    if (!inv.issueDate) return false;
    const issueDate = new Date(inv.issueDate);
    return `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}` === currentMonth;
  }).length;

  const previousMonthInvoices = invoices.filter(inv => {
    if (!inv.issueDate) return false;
    const issueDate = new Date(inv.issueDate);
    return `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}` === previousMonthKey;
  }).length;

  const currentMonthOpenAmount = outstandingInvoices
    .filter(inv => {
      if (!inv.issueDate) return false;
      const issueDate = new Date(inv.issueDate);
      return `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}` === currentMonth;
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  const previousMonthOpenAmount = outstandingInvoices
    .filter(inv => {
      if (!inv.issueDate) return false;
      const issueDate = new Date(inv.issueDate);
      return `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}` === previousMonthKey;
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  const currentMonthQuotes = quotes.filter(q => {
    if (!q.createdDate) return false;
    const createdDate = new Date(q.createdDate);
    return `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}` === currentMonth;
  });

  const previousMonthQuotes = quotes.filter(q => {
    if (!q.createdDate) return false;
    const createdDate = new Date(q.createdDate);
    return `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}` === previousMonthKey;
  });

  const currentMonthApprovedQuotes = currentMonthQuotes.filter(q => q.status === 'approved').length;
  const currentMonthQuoteConversion = currentMonthQuotes.length > 0 
    ? currentMonthApprovedQuotes / currentMonthQuotes.length 
    : 0;

  const previousMonthApprovedQuotes = previousMonthQuotes.filter(q => q.status === 'approved').length;
  const previousMonthQuoteConversion = previousMonthQuotes.length > 0 
    ? previousMonthApprovedQuotes / previousMonthQuotes.length 
    : 0;

  // Monthly revenue data (last 6 months)
  const months: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months[key] = 0;
  }

  paidInvoices.forEach(inv => {
    if (inv.paidDate) {
      const date = new Date(inv.paidDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key] !== undefined) {
        months[key] += inv.total;
      }
    }
  });

  const salesByMonth = Object.entries(months).map(([month, revenue]) => ({
    month: month.split('-')[1] + '/' + month.split('-')[0].slice(-2),
    revenue: Math.round(revenue * 100) / 100,
  }));

  // Previous year sales (same months last year)
  const prevYearMonths: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear() - 1, now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    prevYearMonths[key] = 0;
  }

  paidInvoices.forEach(inv => {
    if (inv.paidDate) {
      const date = new Date(inv.paidDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (prevYearMonths[key] !== undefined) {
        prevYearMonths[key] += inv.total;
      }
    }
  });

  const previousYearSales = Object.entries(prevYearMonths).map(([month, revenue]) => ({
    month: month.split('-')[1] + '/' + month.split('-')[0].slice(-2),
    revenue: Math.round(revenue * 100) / 100,
  }));

  // Outstanding by customer with days open
  const customerMap: Record<string, { amount: number; daysOpen: number[] }> = {};
  outstandingInvoices.forEach(inv => {
    const name = customers.find(c => c.id === inv.customerId)?.name || 'Onbekend';
    if (!customerMap[name]) {
      customerMap[name] = { amount: 0, daysOpen: [] };
    }
    customerMap[name].amount += inv.total;
    if (inv.issueDate) {
      const issueDate = new Date(inv.issueDate);
      const diffTime = Math.abs(now.getTime() - issueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      customerMap[name].daysOpen.push(diffDays);
    }
  });

  const openByCustomer = Object.entries(customerMap)
    .map(([name, data]) => ({
      name,
      amount: Math.round(data.amount * 100) / 100,
      daysOpen: Math.round(data.daysOpen.reduce((sum, d) => sum + d, 0) / data.daysOpen.length) || 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Top customers with profit and trend
  const topCustomerMap: Record<string, { revenue: number; invoiceCount: number }> = {};
  paidInvoices.forEach(inv => {
    const name = customers.find(c => c.id === inv.customerId)?.name || 'Onbekend';
    if (!topCustomerMap[name]) {
      topCustomerMap[name] = { revenue: 0, invoiceCount: 0 };
    }
    topCustomerMap[name].revenue += inv.total;
    topCustomerMap[name].invoiceCount += 1;
  });

  const currentMonth2 = now.getMonth();
  const currentYear = now.getFullYear();

  const topCustomers = Object.entries(topCustomerMap)
    .map(([name, data]) => {
      const estimatedProfit = data.revenue * 0.3;
      
      const last3MonthsRevenue = paidInvoices
        .filter(inv => {
          const customerName = customers.find(c => c.id === inv.customerId)?.name;
          if (customerName !== name || !inv.paidDate) return false;
          const paidDate = new Date(inv.paidDate);
          const monthsDiff = (currentYear - paidDate.getFullYear()) * 12 + (currentMonth2 - paidDate.getMonth());
          return monthsDiff >= 0 && monthsDiff < 3;
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      const prev3MonthsRevenue = paidInvoices
        .filter(inv => {
          const customerName = customers.find(c => c.id === inv.customerId)?.name;
          if (customerName !== name || !inv.paidDate) return false;
          const paidDate = new Date(inv.paidDate);
          const monthsDiff = (currentYear - paidDate.getFullYear()) * 12 + (currentMonth2 - paidDate.getMonth());
          return monthsDiff >= 3 && monthsDiff < 6;
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      const trend = prev3MonthsRevenue > 0 
        ? (last3MonthsRevenue - prev3MonthsRevenue) / prev3MonthsRevenue 
        : 0;

      return {
        name,
        revenue: Math.round(data.revenue * 100) / 100,
        profit: Math.round(estimatedProfit * 100) / 100,
        trend: Math.round(trend * 100) / 100,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Quotes by status with total value
  const statusMap: Record<string, { count: number; totalValue: number }> = {
    approved: { count: 0, totalValue: 0 },
    sent: { count: 0, totalValue: 0 },
    draft: { count: 0, totalValue: 0 },
    rejected: { count: 0, totalValue: 0 },
    expired: { count: 0, totalValue: 0 },
  };

  quotes.forEach(q => {
    if (!statusMap[q.status]) {
      statusMap[q.status] = { count: 0, totalValue: 0 };
    }
    statusMap[q.status].count += 1;
    statusMap[q.status].totalValue += q.total;
  });

  const quotesByStatus = [
    { status: 'Goedgekeurd', count: statusMap.approved.count, totalValue: Math.round(statusMap.approved.totalValue * 100) / 100 },
    { status: 'Afgewezen', count: statusMap.rejected.count, totalValue: Math.round(statusMap.rejected.totalValue * 100) / 100 },
    { status: 'In afwachting', count: statusMap.draft.count, totalValue: Math.round(statusMap.draft.totalValue * 100) / 100 },
    { status: 'Verlopen', count: statusMap.expired.count, totalValue: Math.round(statusMap.expired.totalValue * 100) / 100 },
  ].filter(item => item.count > 0);

  // Payment behavior
  const behavior: Record<string, { onTime: number; late: number }> = {};
  invoices.forEach(inv => {
    if (inv.status === 'paid' && inv.issueDate && inv.paidDate && inv.dueDate) {
      const issueDate = new Date(inv.issueDate);
      const paidDate = new Date(inv.paidDate);
      const dueDate = new Date(inv.dueDate);
      const monthKey = `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}`;

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

  const paymentBehavior = Object.entries(behavior)
    .sort()
    .slice(-6)
    .map(([month, data]) => ({
      month: month.split('-')[1] + '/' + month.split('-')[0].slice(-2),
      onTime: Math.round(data.onTime * 100) / 100,
      late: Math.round(data.late * 100) / 100,
    }));

  // Generate insights
  const insights: string[] = [];
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  
  if (overdueInvoices.length > 0) {
    const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
    insights.push(`⚠️ Er zijn ${overdueInvoices.length} verlopen facturen met een totaalbedrag van €${totalOverdueAmount.toFixed(2)}.`);
  }

  const highDaysOpen = openByCustomer.filter(c => c.daysOpen > 30);
  if (highDaysOpen.length > 0) {
    highDaysOpen.forEach(customer => {
      insights.push(`💡 Klant ${customer.name} heeft openstaande facturen van €${customer.amount.toFixed(2)} die gemiddeld ${customer.daysOpen} dagen oud zijn.`);
    });
  }

  const revenueChange = previousMonthRevenue > 0 
    ? (currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue 
    : 0;
  
  if (revenueChange > 0.1) {
    insights.push(`✅ Omzet steeg met ${(revenueChange * 100).toFixed(0)}% t.o.v. vorige maand — beste maand dit kwartaal.`);
  } else if (revenueChange < -0.1) {
    insights.push(`📉 Omzet daalde met ${Math.abs(revenueChange * 100).toFixed(0)}% t.o.v. vorige maand.`);
  }

  const quoteConversionChange = previousMonthQuoteConversion > 0 
    ? (currentMonthQuoteConversion - previousMonthQuoteConversion) / previousMonthQuoteConversion 
    : 0;

  if (quoteConversionChange > 0.05) {
    const currentConversion = quotesByStatus
      .find(q => q.status === 'Goedgekeurd')?.count || 0 / Math.max(quotes.length, 1);
    insights.push(`📈 Conversieratio offertes: ${(currentConversion * 100).toFixed(0)}% (+${(quoteConversionChange * 100).toFixed(0)}% t.o.v. vorige maand).`);
  }

  return {
    period,
    comparisonToPrevious: {
      revenueChange,
      invoicesChange: previousMonthInvoices > 0 
        ? (currentMonthInvoices - previousMonthInvoices) / previousMonthInvoices 
        : 0,
      openAmountChange: previousMonthOpenAmount > 0 
        ? (currentMonthOpenAmount - previousMonthOpenAmount) / previousMonthOpenAmount 
        : 0,
      quoteConversionChange,
    },
    stats: {
      totalRevenue: Math.round(totalPaid * 100) / 100,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      openAmount: Math.round(totalOutstanding * 100) / 100,
      averagePaymentTermDays: avgPaymentDays,
      openQuotes: openQuotes.length,
    },
    salesByMonth,
    previousYearSales,
    openByCustomer,
    topCustomers,
    quotesByStatus,
    paymentBehavior,
    insights: insights.slice(0, 4),
  };
}

