import React, { useMemo } from "react";
import type { Invoice, Quote, Transaction, Customer } from "../../../types";
import { useAccountingDashboard } from "../../../features/accounting/hooks/useAccountingDashboard";
import { DashboardStats } from "./DashboardStats";
import { DashboardCharts } from "./DashboardCharts";

export interface AccountingDashboardProps {
  invoices: Invoice[];
  quotes: Quote[];
  transactions: Transaction[];
  customers: Customer[];
  onNavigate: (view: string, data?: any) => void;
}

export const AccountingDashboard: React.FC<AccountingDashboardProps> = ({
  invoices,
  quotes,
  transactions,
  customers,
  onNavigate,
}) => {
  // Use dashboard hook for all calculations
  const dashboardData = useAccountingDashboard(
    invoices,
    quotes,
    transactions,
    customers
  );

  // Extract stats for convenience
  const {
    totalInvoiced,
    totalPaid,
    totalOverdue,
    totalOutstanding,
    paidInvoices,
    overdueInvoices,
    outstandingInvoices,
  } = dashboardData.stats.invoice;
  const { openQuotesCount, avgPaymentDays } = dashboardData.stats;
  const openQuotes = dashboardData.raw.openQuotes;

  // Extract chart data from hook
  const {
    monthlyRevenue,
    outstandingByCustomer,
    salesByCustomer,
    quotesByStatus,
    paymentBehavior,
    previousYearSales,
    openByCustomer,
  } = dashboardData.charts;
  const { comparisonToPrevious } = dashboardData.insights;

  // Enhanced top customers with profit estimation and trend
  const topCustomers = useMemo(() => {
    const customerMap: Record<
      string,
      {
        revenue: number;
        invoiceCount: number;
        lastInvoiceDate?: Date;
        firstInvoiceDate?: Date;
      }
    > = {};

    paidInvoices.forEach((inv) => {
      const name =
        customers.find((c) => c.id === inv.customerId)?.name || "Onbekend";
      if (!customerMap[name]) {
        customerMap[name] = { revenue: 0, invoiceCount: 0 };
      }
      customerMap[name].revenue += inv.total;
      customerMap[name].invoiceCount += 1;

      if (inv.paidDate) {
        const paidDate = new Date(inv.paidDate);
        if (
          !customerMap[name].lastInvoiceDate ||
          paidDate > customerMap[name].lastInvoiceDate!
        ) {
          customerMap[name].lastInvoiceDate = paidDate;
        }
        if (
          !customerMap[name].firstInvoiceDate ||
          paidDate < customerMap[name].firstInvoiceDate!
        ) {
          customerMap[name].firstInvoiceDate = paidDate;
        }
      }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return Object.entries(customerMap)
      .map(([name, data]) => {
        // Estimate profit (assuming 30% margin on average)
        const estimatedProfit = data.revenue * 0.3;

        // Calculate trend (revenue in last 3 months vs previous 3 months)
        const last3MonthsRevenue = paidInvoices
          .filter((inv) => {
            const customerName = customers.find(
              (c) => c.id === inv.customerId
            )?.name;
            if (customerName !== name || !inv.paidDate) return false;
            const paidDate = new Date(inv.paidDate);
            const monthsDiff =
              (currentYear - paidDate.getFullYear()) * 12 +
              (currentMonth - paidDate.getMonth());
            return monthsDiff >= 0 && monthsDiff < 3;
          })
          .reduce((sum, inv) => sum + inv.total, 0);

        const prev3MonthsRevenue = paidInvoices
          .filter((inv) => {
            const customerName = customers.find(
              (c) => c.id === inv.customerId
            )?.name;
            if (customerName !== name || !inv.paidDate) return false;
            const paidDate = new Date(inv.paidDate);
            const monthsDiff =
              (currentYear - paidDate.getFullYear()) * 12 +
              (currentMonth - paidDate.getMonth());
            return monthsDiff >= 3 && monthsDiff < 6;
          })
          .reduce((sum, inv) => sum + inv.total, 0);

        const trend =
          prev3MonthsRevenue > 0
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
  }, [paidInvoices, customers]);

  // Enhanced quotes by status with total value
  const quotesByStatusWithValue = useMemo(() => {
    const statusMap: Record<string, { count: number; totalValue: number }> = {
      approved: { count: 0, totalValue: 0 },
      sent: { count: 0, totalValue: 0 },
      draft: { count: 0, totalValue: 0 },
      rejected: { count: 0, totalValue: 0 },
      expired: { count: 0, totalValue: 0 },
    };

    quotes.forEach((q) => {
      if (!statusMap[q.status]) {
        statusMap[q.status] = { count: 0, totalValue: 0 };
      }
      statusMap[q.status].count += 1;
      statusMap[q.status].totalValue += q.total;
    });

    return [
      {
        status: "Goedgekeurd",
        count: statusMap.approved.count,
        totalValue: Math.round(statusMap.approved.totalValue * 100) / 100,
        statusKey: "approved",
      },
      {
        status: "Verzonden",
        count: statusMap.sent.count,
        totalValue: Math.round(statusMap.sent.totalValue * 100) / 100,
        statusKey: "sent",
      },
      {
        status: "In afwachting",
        count: statusMap.draft.count,
        totalValue: Math.round(statusMap.draft.totalValue * 100) / 100,
        statusKey: "draft",
      },
      {
        status: "Afgewezen",
        count: statusMap.rejected.count,
        totalValue: Math.round(statusMap.rejected.totalValue * 100) / 100,
        statusKey: "rejected",
      },
      {
        status: "Verlopen",
        count: statusMap.expired.count,
        totalValue: Math.round(statusMap.expired.totalValue * 100) / 100,
        statusKey: "expired",
      },
    ].filter((item) => item.count > 0);
  }, [quotes]);

  // Generate insights
  const insights = useMemo(() => {
    const insightsList: string[] = [];
    const now = new Date();

    // Check for overdue invoices
    if (overdueInvoices.length > 0) {
      const totalOverdueAmount = overdueInvoices.reduce(
        (sum, inv) => sum + inv.total,
        0
      );
      insightsList.push(
        `⚠️ Er zijn ${
          overdueInvoices.length
        } verlopen facturen met een totaalbedrag van €${totalOverdueAmount.toFixed(
          2
        )}.`
      );
    }

    // Check for outstanding invoices with high days open
    const highDaysOpen = openByCustomer.filter((c) => c.avgDaysOpen > 30);
    if (highDaysOpen.length > 0) {
      highDaysOpen.forEach((customer) => {
        insightsList.push(
          `💡 Klant ${
            customer.name
          } heeft openstaande facturen van €${customer.amount.toFixed(
            2
          )} die gemiddeld ${customer.avgDaysOpen} dagen oud zijn.`
        );
      });
    }

    // Revenue trend
    if (comparisonToPrevious.revenueChange > 0.1) {
      insightsList.push(
        `✅ Omzet steeg met ${(
          comparisonToPrevious.revenueChange * 100
        ).toFixed(0)}% t.o.v. vorige maand — beste maand dit kwartaal.`
      );
    } else if (comparisonToPrevious.revenueChange < -0.1) {
      insightsList.push(
        `📉 Omzet daalde met ${Math.abs(
          comparisonToPrevious.revenueChange * 100
        ).toFixed(0)}% t.o.v. vorige maand.`
      );
    }

    // Quote conversion
    if (comparisonToPrevious.quoteConversionChange > 0.05) {
      const currentConversion =
        quotesByStatusWithValue
          .filter((q) => q.statusKey === "approved")
          .reduce((sum, q) => sum + q.count, 0) / Math.max(quotes.length, 1);
      insightsList.push(
        `📈 Conversieratio offertes: ${(currentConversion * 100).toFixed(
          0
        )}% (+${(comparisonToPrevious.quoteConversionChange * 100).toFixed(
          0
        )}% t.o.v. vorige maand).`
      );
    }

    // Payment behavior warnings
    const recentPaymentBehavior = paymentBehavior.slice(-1)[0];
    if (
      recentPaymentBehavior &&
      recentPaymentBehavior["Te laat"] >
        recentPaymentBehavior["Op tijd"] * 0.3
    ) {
      insightsList.push(
        `⚠️ Hoge percentage te late betalingen deze maand: ${(
          (recentPaymentBehavior["Te laat"] /
            (recentPaymentBehavior["Op tijd"] +
              recentPaymentBehavior["Te laat"])) *
          100
        ).toFixed(0)}%.`
      );
    }

    return insightsList.slice(0, 4); // Max 4 insights
  }, [
    overdueInvoices,
    openByCustomer,
    comparisonToPrevious,
    quotesByStatusWithValue,
    quotes.length,
    paymentBehavior,
  ]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <DashboardStats
        totalPaid={totalPaid}
        totalInvoiced={totalInvoiced}
        totalOutstanding={totalOutstanding}
        openQuotesCount={openQuotesCount}
        avgPaymentDays={avgPaymentDays}
        totalOverdue={totalOverdue}
        comparisonToPrevious={comparisonToPrevious}
        onNavigate={onNavigate}
      />

      {/* Charts Grid */}
      <DashboardCharts
        monthlyRevenue={monthlyRevenue}
        openByCustomer={openByCustomer}
        salesByCustomer={salesByCustomer}
        quotesByStatusWithValue={quotesByStatusWithValue}
        paymentBehavior={paymentBehavior}
        onNavigate={onNavigate}
      />

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-neutral mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>Inzichten & Aanbevelingen</span>
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.includes("⚠️")
                    ? "bg-red-50 border-red-400"
                    : insight.includes("✅") || insight.includes("📈")
                    ? "bg-green-50 border-green-400"
                    : "bg-blue-50 border-blue-400"
                }`}
              >
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

