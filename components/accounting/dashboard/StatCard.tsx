import React from "react";
import { formatCurrency } from "../../../features/accounting/utils/formatters";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  borderColor: string;
  onClick?: () => void;
  trend?: {
    value: number;
    label?: string;
  };
  showClickHint?: boolean;
  valueColor?: string; // Optional custom color for value (e.g., "text-red-600")
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  borderColor,
  onClick,
  trend,
  showClickHint = true,
  valueColor = "text-neutral",
}) => {
  const isClickable = !!onClick;
  const isCurrency = typeof value === "number";

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 ${borderColor} ${
        isClickable
          ? "cursor-pointer hover:shadow-md transition-shadow"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${valueColor}`}>
        {isCurrency ? formatCurrency(value) : value}
      </p>
      {trend && trend.value !== 0 && (
        <div
          className={`flex items-center gap-1 mt-1 text-xs ${
            trend.value > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{trend.value > 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(trend.value * 100).toFixed(1)}%</span>
          <span className="text-gray-500">
            {trend.label || "t.o.v. vorige maand"}
          </span>
        </div>
      )}
      {isClickable && showClickHint && (
        <p className="text-xs text-gray-500 mt-1">Klik voor details →</p>
      )}
    </div>
  );
};

