import React from "react";
import { StatCard } from "./StatCard";

export interface DashboardStatsProps {
  totalPaid: number;
  totalInvoiced: number;
  totalOutstanding: number;
  openQuotesCount: number;
  avgPaymentDays: number;
  totalOverdue: number;
  comparisonToPrevious: {
    revenueChange: number;
    invoicesChange: number;
    openAmountChange: number;
  };
  onNavigate: (view: string, data?: any) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalPaid,
  totalInvoiced,
  totalOutstanding,
  openQuotesCount,
  avgPaymentDays,
  totalOverdue,
  comparisonToPrevious,
  onNavigate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="Totale Omzet"
        value={totalPaid}
        icon="💰"
        borderColor="border-green-500"
        onClick={() => onNavigate("invoices", { overviewType: "paid" })}
        trend={{
          value: comparisonToPrevious.revenueChange,
        }}
      />

      <StatCard
        title="Totaal Gefactureerd"
        value={totalInvoiced}
        icon="📊"
        borderColor="border-blue-500"
        onClick={() => onNavigate("invoices", { overviewType: "all" })}
        trend={{
          value: comparisonToPrevious.invoicesChange,
        }}
      />

      <StatCard
        title="Openstaand"
        value={totalOutstanding}
        icon="⏳"
        borderColor="border-orange-500"
        onClick={() => onNavigate("invoices", { overviewType: "outstanding" })}
        trend={{
          value: comparisonToPrevious.openAmountChange,
        }}
      />

      <StatCard
        title="Openstaande Offertes"
        value={openQuotesCount}
        icon="📋"
        borderColor="border-purple-500"
        onClick={() => onNavigate("quotes", { overviewType: "all" })}
      />

      {avgPaymentDays > 0 && (
        <StatCard
          title="Gem. Betalingstermijn"
          value={`${avgPaymentDays} dagen`}
          icon="📅"
          borderColor="border-gray-400"
          showClickHint={false}
        />
      )}

      {totalOverdue > 0 && (
        <StatCard
          title="Verlopen"
          value={totalOverdue}
          icon="⚠️"
          borderColor="border-red-500"
          valueColor="text-red-600"
          onClick={() => onNavigate("invoices", { overviewType: "overdue" })}
        />
      )}
    </div>
  );
};

