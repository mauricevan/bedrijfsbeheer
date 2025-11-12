import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  formatCurrency,
  formatPercentage,
  formatCurrencyForChart,
} from "../../../features/accounting/utils/formatters";

export interface DashboardChartsProps {
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  openByCustomer: Array<{ name: string; amount: number; avgDaysOpen: number }>;
  salesByCustomer: Array<{ name: string; amount: number }>;
  quotesByStatusWithValue: Array<{
    status: string;
    count: number;
    totalValue: number;
    statusKey?: string;
  }>;
  paymentBehavior: Array<{
    month: string;
    "Op tijd": number;
    "Te laat": number;
  }>;
  onNavigate: (view: string, data?: any) => void;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlyRevenue,
  openByCustomer,
  salesByCustomer,
  quotesByStatusWithValue,
  paymentBehavior,
  onNavigate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Monthly Revenue Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-neutral mb-3 sm:mb-4">
          Omzet per Maand
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={monthlyRevenue}
            margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={60} />
            <Tooltip
              formatter={formatCurrencyForChart}
              contentStyle={{ fontSize: "12px", padding: "8px" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Omzet (€)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Outstanding by Customer Bar Chart */}
      {openByCustomer.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral mb-3 sm:mb-4">
            Openstaand per Klant
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={openByCustomer}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} width={60} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  if (name === "amount") {
                    return [formatCurrency(value), "Bedrag"];
                  }
                  return [
                    `${props.payload.avgDaysOpen} dagen`,
                    "Dagen openstaand",
                  ];
                }}
                contentStyle={{ fontSize: "12px", padding: "8px" }}
              />
              <Bar
                dataKey="amount"
                fill="#f59e0b"
                name="Bedrag (€)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sales per Customer Donut Chart */}
      {salesByCustomer.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral mb-3 sm:mb-4">
            Top 5 Klanten
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={salesByCustomer}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => formatPercentage(percent, 0, true)}
                outerRadius={70}
                fill="#8884d8"
                dataKey="amount"
              >
                {salesByCustomer.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name,
                ]}
                contentStyle={{ fontSize: "12px", padding: "8px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quotes by Status Pie Chart */}
      {quotesByStatusWithValue.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral mb-3 sm:mb-4">
            Offertes per Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={quotesByStatusWithValue}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ count }) => `${count}`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="count"
              >
                {quotesByStatusWithValue.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    onClick={() => {
                      if (entry.statusKey) {
                        onNavigate("quotes", {
                          overviewType: entry.statusKey,
                        });
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${props.payload.count} offertes - ${formatCurrency(
                    props.payload.totalValue
                  )}`,
                  props.payload.status,
                ]}
                contentStyle={{ fontSize: "12px", padding: "8px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Payment Behavior Stacked Bar Chart */}
      {paymentBehavior.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 lg:col-span-2">
          <h3 className="text-base sm:text-lg font-semibold text-neutral mb-3 sm:mb-4">
            Betaalgedrag per Maand
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={paymentBehavior}
              margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={60} />
              <Tooltip
                formatter={formatCurrencyForChart}
                contentStyle={{ fontSize: "12px", padding: "8px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="Op tijd"
                stackId="a"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Te laat"
                stackId="a"
                fill="#ef4444"
                radius={[0, 0, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

