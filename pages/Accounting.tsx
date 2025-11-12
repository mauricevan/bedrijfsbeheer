import React, { useState, useMemo } from "react";
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
  Transaction,
  Quote,
  QuoteItem,
  QuoteLabor,
  QuoteHistoryEntry,
  Invoice,
  InvoiceHistoryEntry,
  Customer,
  InventoryItem,
  InventoryCategory,
  WorkOrder,
  Employee,
  User,
  ModuleKey,
  Notification,
} from "../types";
import { trackAction } from "../utils/analytics";
import {
  createQuoteApprovedNotification,
  createInvoiceSentNotification,
} from "../utils/smartNotifications";
import { QuoteEmailIntegration } from "../components/QuoteEmailIntegration";
import {
  validateQuoteToWorkOrder,
  validateQuoteToInvoice,
  validateInvoiceToWorkOrder,
  validateQuoteEdit,
  validateInvoiceEdit,
  getWorkflowGuardrailMessage,
  WorkflowValidationResult,
} from "../utils/workflowValidation";

interface AccountingProps {
  transactions: Transaction[];
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  inventory: InventoryItem[];
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  employees: Employee[];
  currentUser: User;
  isAdmin: boolean;
  notifications?: Notification[];
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>;
  categories?: InventoryCategory[]; // 🆕 V5.7: Categories prop
}

const AccountingComponent: React.FC<AccountingProps> = ({
  transactions,
  quotes,
  setQuotes,
  invoices,
  setInvoices,
  customers,
  inventory,
  workOrders,
  setWorkOrders,
  employees,
  currentUser,
  isAdmin,
  notifications = [],
  setNotifications,
  categories = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "transactions" | "quotes" | "invoices"
  >("dashboard");

  // 🆕 V5.7: Inventory search & filter states for quote/invoice item selection
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] =
    useState<string>("");
  const [inventoryCategorySearchTerm, setInventoryCategorySearchTerm] =
    useState("");
  const [showInventoryCategoryDropdown, setShowInventoryCategoryDropdown] =
    useState(false);

  // 🆕 V5.7: Filtered categories for dropdown search
  const filteredInventoryCategories = useMemo(() => {
    if (!inventoryCategorySearchTerm) return categories;
    const searchLower = inventoryCategorySearchTerm.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower)
    );
  }, [categories, inventoryCategorySearchTerm]);

  // 🆕 V5.7: Filtered inventory for quote/invoice item selection
  const filteredInventoryForSelection = useMemo(() => {
    let filtered = inventory.filter(
      (i) => (i.price || i.salePrice) && (i.price || i.salePrice) > 0
    );

    // Filter op categorie eerst
    if (inventoryCategoryFilter) {
      filtered = filtered.filter(
        (item) => item.categoryId === inventoryCategoryFilter
      );
    }

    // Filter op zoekterm
    if (inventorySearchTerm) {
      const term = inventorySearchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        // Zoek in naam
        if (item.name.toLowerCase().includes(term)) return true;

        // Zoek in alle SKU types
        if (item.sku?.toLowerCase().includes(term)) return true;
        if (item.supplierSku?.toLowerCase().includes(term)) return true;
        if (item.autoSku?.toLowerCase().includes(term)) return true;
        if (item.customSku?.toLowerCase().includes(term)) return true;

        // Zoek in categorie naam
        if (
          item.categoryId &&
          categories
            .find((c) => c.id === item.categoryId)
            ?.name.toLowerCase()
            .includes(term)
        )
          return true;

        return false;
      });
    }

    return filtered;
  }, [inventory, inventorySearchTerm, inventoryCategoryFilter, categories]);

  // Dashboard navigation state - track where user came from
  const [dashboardView, setDashboardView] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  // 🆕 Clone states
  const [showCloneQuoteModal, setShowCloneQuoteModal] = useState(false);
  const [showCloneInvoiceModal, setShowCloneInvoiceModal] = useState(false);

  // 🆕 Accept quote modal with clone option
  const [showAcceptQuoteModal, setShowAcceptQuoteModal] = useState(false);
  const [quoteToAccept, setQuoteToAccept] = useState<string | null>(null);
  const [cloneOnAccept, setCloneOnAccept] = useState(false);

  // 🆕 Edit states
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // 🆕 Overview Modal States
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [overviewType, setOverviewType] = useState<
    "all" | "paid" | "outstanding" | "overdue"
  >("all");
  const [showQuotesOverviewModal, setShowQuotesOverviewModal] = useState(false);
  const [quotesOverviewType, setQuotesOverviewType] = useState<
    "all" | "approved" | "sent" | "expired"
  >("all");
  const [overviewFilter, setOverviewFilter] = useState({
    customerName: "",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
  });

  // 🆕 Batch Operations States
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);

  // NEW: User selection modal state
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [conversionData, setConversionData] = useState<{
    type: "quote" | "invoice";
    sourceId: string;
    data: any;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  // NEW: Invoice validation modal state (Tip 4)
  const [showInvoiceValidationModal, setShowInvoiceValidationModal] =
    useState(false);
  const [invoiceToValidate, setInvoiceToValidate] = useState<Invoice | null>(
    null
  );
  const [validationChecklist, setValidationChecklist] = useState({
    hoursChecked: false,
    materialsChecked: false,
    extraWorkAdded: false,
  });
  const [newQuote, setNewQuote] = useState({
    customerId: "",
    items: [] as QuoteItem[],
    labor: [] as QuoteLabor[],
    vatRate: 21,
    notes: "",
    validUntil: "",
  });
  const [newInvoice, setNewInvoice] = useState({
    customerId: "",
    items: [] as QuoteItem[],
    labor: [] as QuoteLabor[],
    vatRate: 21,
    notes: "",
    paymentTerms: "14 dagen",
    issueDate: "",
    dueDate: "",
  });

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netProfit = totalIncome - totalExpense;

  // Invoice statistics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingInvoices = invoices.filter((inv) =>
    ["sent", "overdue"].includes(inv.status)
  );
  const totalOutstanding = outstandingInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  // Quote statistics
  const totalQuoted = quotes.reduce((sum, q) => sum + q.total, 0);
  const approvedQuotes = quotes.filter((q) => q.status === "approved");
  const sentQuotes = quotes.filter((q) => q.status === "sent");
  const expiredQuotes = quotes.filter(
    (q) =>
      q.status === "expired" ||
      (q.validUntil && new Date(q.validUntil) < new Date())
  );
  const totalApproved = approvedQuotes.reduce((sum, q) => sum + q.total, 0);
  const totalSent = sentQuotes.reduce((sum, q) => sum + q.total, 0);
  const totalExpired = expiredQuotes.reduce((sum, q) => sum + q.total, 0);

  // Helper function om employee naam op te halen
  const getEmployeeName = (id: string) => {
    return employees.find((e) => e.id === id)?.name || "Onbekend";
  };

  // Helper function om history entry aan te maken
  const createHistoryEntry = (
    type: "quote" | "invoice",
    action: string,
    details: string,
    extra?: any
  ): QuoteHistoryEntry | InvoiceHistoryEntry => {
    return {
      timestamp: new Date().toISOString(),
      action: action as any,
      performedBy: currentUser.employeeId,
      details,
      ...extra,
    };
  };

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || "Onbekend";
  };

  // Dashboard component interface
  interface AccountingDashboardProps {
    invoices: Invoice[];
    quotes: Quote[];
    transactions: Transaction[];
    customers: Customer[];
    onNavigate: (view: string, data?: any) => void;
  }

  // Dashboard Component
  const AccountingDashboard: React.FC<AccountingDashboardProps> = ({
    invoices,
    quotes,
    transactions,
    customers,
    onNavigate,
  }) => {
    // Calculate statistics
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter((inv) => inv.status === "paid");
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const outstandingInvoices = invoices.filter((inv) =>
      ["sent", "overdue"].includes(inv.status)
    );
    const totalOutstanding = outstandingInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );
    const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
    const totalOverdue = overdueInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );
    const openQuotes = quotes.filter(
      (q) => !["approved", "rejected"].includes(q.status)
    );
    const openQuotesCount = openQuotes.length;

    // Calculate average payment term
    const paidInvoicesWithDates = invoices.filter(
      (inv) => inv.status === "paid" && inv.issueDate && inv.paidDate
    );
    const avgPaymentDays =
      paidInvoicesWithDates.length > 0
        ? Math.round(
            paidInvoicesWithDates.reduce((sum, inv) => {
              const issueDate = new Date(inv.issueDate);
              const paidDate = new Date(inv.paidDate!);
              const diffTime = Math.abs(
                paidDate.getTime() - issueDate.getTime()
              );
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return sum + diffDays;
            }, 0) / paidInvoicesWithDates.length
          )
        : 0;

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
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - issueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          customerMap[name].daysOpen.push(diffDays);
        }
      });

      return Object.entries(customerMap)
        .map(([name, data]) => ({
          name,
          amount: Math.round(data.amount * 100) / 100,
          daysOpen:
            Math.round(
              data.daysOpen.reduce((sum, d) => sum + d, 0) /
                data.daysOpen.length
            ) || 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    }, [outstandingInvoices, customers]);

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
      const highDaysOpen = openByCustomer.filter((c) => c.daysOpen > 30);
      if (highDaysOpen.length > 0) {
        highDaysOpen.forEach((customer) => {
          insightsList.push(
            `💡 Klant ${
              customer.name
            } heeft openstaande facturen van €${customer.amount.toFixed(
              2
            )} die gemiddeld ${customer.daysOpen} dagen oud zijn.`
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

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div
            className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              onNavigate("invoices", { overviewType: "paid" });
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Totale Omzet</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-neutral">
              €{totalPaid.toFixed(2)}
            </p>
            {comparisonToPrevious.revenueChange !== 0 && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs ${
                  comparisonToPrevious.revenueChange > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <span>
                  {comparisonToPrevious.revenueChange > 0 ? "↑" : "↓"}
                </span>
                <span>
                  {Math.abs(comparisonToPrevious.revenueChange * 100).toFixed(
                    1
                  )}
                  %
                </span>
                <span className="text-gray-500">t.o.v. vorige maand</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Klik voor details →</p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              onNavigate("invoices", { overviewType: "all" });
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Totaal Gefactureerd</p>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-neutral">
              €{totalInvoiced.toFixed(2)}
            </p>
            {comparisonToPrevious.invoicesChange !== 0 && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs ${
                  comparisonToPrevious.invoicesChange > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <span>
                  {comparisonToPrevious.invoicesChange > 0 ? "↑" : "↓"}
                </span>
                <span>
                  {Math.abs(comparisonToPrevious.invoicesChange * 100).toFixed(
                    1
                  )}
                  %
                </span>
                <span className="text-gray-500">t.o.v. vorige maand</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Klik voor details →</p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              onNavigate("invoices", { overviewType: "outstanding" });
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Openstaand</p>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-neutral">
              €{totalOutstanding.toFixed(2)}
            </p>
            {comparisonToPrevious.openAmountChange !== 0 && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs ${
                  comparisonToPrevious.openAmountChange < 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <span>
                  {comparisonToPrevious.openAmountChange < 0 ? "↓" : "↑"}
                </span>
                <span>
                  {Math.abs(
                    comparisonToPrevious.openAmountChange * 100
                  ).toFixed(1)}
                  %
                </span>
                <span className="text-gray-500">t.o.v. vorige maand</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Klik voor details →</p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              onNavigate("quotes", { overviewType: "all" });
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Openstaande Offertes</p>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-neutral">
              {openQuotesCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">Klik voor details →</p>
          </div>

          {avgPaymentDays > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 border-gray-400">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Gem. Betalingstermijn</p>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-neutral">
                {avgPaymentDays} dagen
              </p>
            </div>
          )}

          {totalOverdue > 0 && (
            <div
              className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 border-red-500 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                onNavigate("invoices", { overviewType: "overdue" });
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Verlopen</p>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">
                €{totalOverdue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Klik voor details →</p>
            </div>
          )}
        </div>

        {/* Charts Grid */}
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
                  formatter={(value: number) => `€${value.toFixed(2)}`}
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
                        return [`€${value.toFixed(2)}`, "Bedrag"];
                      }
                      return [
                        `${props.payload.daysOpen} dagen`,
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
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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
                      `€${value.toFixed(2)}`,
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
                      `${
                        props.payload.count
                      } offertes - €${props.payload.totalValue.toFixed(2)}`,
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
                    formatter={(value: number) => `€${value.toFixed(2)}`}
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

  const getInventoryItemName = (itemId: string) => {
    return inventory.find((i) => i.id === itemId)?.name || "Onbekend item";
  };

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateQuoteTotals = () => {
    const itemsSubtotal = newQuote.items.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const laborSubtotal = newQuote.labor.reduce(
      (sum, labor) => sum + labor.total,
      0
    );
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (newQuote.vatRate / 100);
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  };

  const calculateInvoiceTotals = () => {
    const itemsSubtotal = newInvoice.items.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const laborSubtotal = newInvoice.labor.reduce(
      (sum, labor) => sum + labor.total,
      0
    );
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (newInvoice.vatRate / 100);
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .filter((inv) => inv.invoiceNumber.startsWith(`${year}-`))
      .map((inv) => parseInt(inv.invoiceNumber.split("-")[1]))
      .filter((num) => !isNaN(num));

    const nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${year}-${String(nextNumber).padStart(3, "0")}`;
  };

  // Quote CRUD Operations
  const handleAddInventoryItem = () => {
    const newItem: QuoteItem = {
      inventoryItemId: "",
      description: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    };
    setNewQuote({
      ...newQuote,
      items: [...newQuote.items, newItem],
    });
  };

  const handleAddCustomItem = () => {
    const newItem: QuoteItem = {
      description: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    };
    setNewQuote({
      ...newQuote,
      items: [...newQuote.items, newItem],
    });
  };

  const handleAddLabor = () => {
    const newLabor: QuoteLabor = {
      description: "",
      hours: 1,
      hourlyRate: 50,
      total: 50,
    };
    setNewQuote({
      ...newQuote,
      labor: [...newQuote.labor, newLabor],
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewQuote({
      ...newQuote,
      items: newQuote.items.filter((_, i) => i !== index),
    });
  };

  const handleRemoveLabor = (index: number) => {
    setNewQuote({
      ...newQuote,
      labor: newQuote.labor.filter((_, i) => i !== index),
    });
  };

  const handleInventoryItemChange = (
    index: number,
    inventoryItemId: string
  ) => {
    const inventoryItem = inventory.find((i) => i.id === inventoryItemId);
    if (inventoryItem) {
      const updatedItems = [...newQuote.items];
      updatedItems[index] = {
        ...updatedItems[index],
        inventoryItemId: inventoryItemId,
        description: inventoryItem.name,
        pricePerUnit: inventoryItem.price || 0,
        total: updatedItems[index].quantity * (inventoryItem.price || 0),
      };
      setNewQuote({ ...newQuote, items: updatedItems });
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof QuoteItem,
    value: any
  ) => {
    const updatedItems = [...newQuote.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === "quantity" || field === "pricePerUnit") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].pricePerUnit;
    }

    setNewQuote({ ...newQuote, items: updatedItems });
  };

  const handleLaborChange = (
    index: number,
    field: keyof QuoteLabor,
    value: any
  ) => {
    const updatedLabor = [...newQuote.labor];
    updatedLabor[index] = { ...updatedLabor[index], [field]: value };

    if (field === "hours" || field === "hourlyRate") {
      updatedLabor[index].total =
        updatedLabor[index].hours * updatedLabor[index].hourlyRate;
    }

    setNewQuote({ ...newQuote, labor: updatedLabor });
  };

  const handleEditQuote = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    // Pre-fill form with quote data
    setNewQuote({
      customerId: quote.customerId,
      items: quote.items,
      labor: quote.labor || [],
      vatRate: quote.vatRate,
      notes: quote.notes || "",
      validUntil: quote.validUntil,
    });

    // Store editing quote ID
    setEditingQuoteId(quoteId);

    // Open form and switch to quotes tab
    setActiveTab("quotes");
    setShowQuoteForm(true);
  };

  const handleCreateQuote = () => {
    if (
      !newQuote.customerId ||
      newQuote.items.length === 0 ||
      !newQuote.validUntil
    ) {
      alert(
        "Vul alle verplichte velden in (klant, minimaal 1 item, en geldig tot datum)!"
      );
      return;
    }

    const { subtotal, vatAmount, total } = calculateQuoteTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(newQuote.customerId);

    // If editing, update existing quote
    if (editingQuoteId) {
      const existingQuote = quotes.find((q) => q.id === editingQuoteId);
      if (!existingQuote) return;

      const updatedQuote: Quote = {
        ...existingQuote,
        customerId: newQuote.customerId,
        items: newQuote.items,
        labor: newQuote.labor.length > 0 ? newQuote.labor : undefined,
        subtotal: subtotal,
        vatRate: newQuote.vatRate,
        vatAmount: vatAmount,
        total: total,
        validUntil: newQuote.validUntil,
        notes: newQuote.notes,
        history: [
          ...(existingQuote.history || []),
          createHistoryEntry(
            "quote",
            "updated",
            `Offerte bijgewerkt door ${getEmployeeName(currentUser.employeeId)}`
          ) as QuoteHistoryEntry,
        ],
      };

      setQuotes(
        quotes.map((q) => (q.id === editingQuoteId ? updatedQuote : q))
      );

      // Sync to workorder if exists
      if (updatedQuote.workOrderId) {
        const synced = syncQuoteToWorkOrder(updatedQuote.id);
        if (synced) {
          alert("✅ Offerte en werkorder succesvol gesynchroniseerd!");
        }
      }

      setEditingQuoteId(null);
      setShowQuoteForm(false);
      setNewQuote({
        customerId: "",
        items: [],
        labor: [],
        vatRate: 21,
        notes: "",
        validUntil: "",
      });
      alert(`✅ Offerte ${updatedQuote.id} succesvol bijgewerkt!`);
      return;
    }

    // Create new quote
    const quote: Quote = {
      id: `Q${Date.now()}`,
      customerId: newQuote.customerId,
      items: newQuote.items,
      labor: newQuote.labor.length > 0 ? newQuote.labor : undefined,
      subtotal: subtotal,
      vatRate: newQuote.vatRate,
      vatAmount: vatAmount,
      total: total,
      status: "draft",
      createdDate: new Date().toISOString().split("T")[0],
      validUntil: newQuote.validUntil,
      notes: newQuote.notes,

      // Audit trail
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createHistoryEntry(
          "quote",
          "created",
          `Offerte aangemaakt door ${getEmployeeName(
            currentUser.employeeId
          )} voor klant ${customerName}`
        ) as QuoteHistoryEntry,
      ],
    };

    setQuotes([...quotes, quote]);
    setNewQuote({
      customerId: "",
      items: [],
      labor: [],
      vatRate: 21,
      notes: "",
      validUntil: "",
    });
    setShowQuoteForm(false);

    // Track analytics
    trackAction(
      currentUser.employeeId,
      currentUser.role,
      ModuleKey.ACCOUNTING,
      "create_quote",
      "create",
      {
        quoteId: quote.id,
        customerId: quote.customerId,
        total: quote.total,
        itemsCount: quote.items.length,
        laborCount: quote.labor?.length || 0,
      }
    );
    alert(`✅ Offerte ${quote.id} succesvol aangemaakt!`);
  };

  // 🆕 Accept quote with optional clone
  const handleAcceptQuote = () => {
    if (!quoteToAccept) return;

    const quote = quotes.find((q) => q.id === quoteToAccept);
    if (!quote) return;

    // Update quote status to approved
    updateQuoteStatus(quoteToAccept, "approved");

    // If clone is requested, create a cloned quote for next period
    if (cloneOnAccept) {
      // Calculate next period date
      let nextPeriodDate: Date;
      if (quote.validUntil) {
        const validUntilDate = new Date(quote.validUntil);
        nextPeriodDate = new Date(validUntilDate);
        nextPeriodDate.setDate(nextPeriodDate.getDate() + 30); // +30 days
      } else {
        // If no validUntil, use current date + 30 days
        nextPeriodDate = new Date();
        nextPeriodDate.setDate(nextPeriodDate.getDate() + 30);
      }

      const { subtotal, vatAmount, total } = {
        subtotal: quote.subtotal,
        vatAmount: quote.vatAmount,
        total: quote.total,
      };
      const now = new Date().toISOString();
      const customerName = getCustomerName(quote.customerId);

      const clonedQuote: Quote = {
        id: `Q${Date.now()}`,
        customerId: quote.customerId,
        items: quote.items.map((item) => ({ ...item })),
        labor: quote.labor ? quote.labor.map((l) => ({ ...l })) : undefined,
        subtotal: subtotal,
        vatRate: quote.vatRate,
        vatAmount: vatAmount,
        total: total,
        status: "draft",
        createdDate: new Date().toISOString().split("T")[0],
        validUntil: nextPeriodDate.toISOString().split("T")[0],
        notes: `Gekloond van ${
          quote.id
        } (geaccepteerd op ${new Date().toLocaleDateString(
          "nl-NL"
        )}) voor volgende periode${
          quote.notes ? `\n\nOriginele notitie: ${quote.notes}` : ""
        }`,
        createdBy: currentUser.employeeId,
        timestamps: {
          created: now,
        },
        history: [
          createHistoryEntry(
            "quote",
            "created",
            `Offerte automatisch gekloond van ${
              quote.id
            } voor volgende periode door ${getEmployeeName(
              currentUser.employeeId
            )}`
          ) as QuoteHistoryEntry,
        ],
      };

      setQuotes([...quotes, clonedQuote]);
      alert(
        `✅ Offerte geaccepteerd!\n\n📋 Nieuwe offerte ${
          clonedQuote.id
        } aangemaakt voor volgende periode (geldig tot ${nextPeriodDate.toLocaleDateString(
          "nl-NL"
        )}).`
      );
    } else {
      alert(`✅ Offerte ${quote.id} succesvol geaccepteerd!`);
    }

    // Close modal
    setShowAcceptQuoteModal(false);
    setQuoteToAccept(null);
    setCloneOnAccept(false);
  };

  const updateQuoteStatus = (quoteId: string, newStatus: Quote["status"]) => {
    setQuotes(
      quotes.map((q) => {
        if (q.id === quoteId) {
          const now = new Date().toISOString();
          const oldStatus = q.status;

          const updates: Partial<Quote> = {
            status: newStatus,
            history: [
              ...(q.history || []),
              createHistoryEntry(
                "quote",
                newStatus,
                `Status gewijzigd van "${oldStatus}" naar "${newStatus}" door ${getEmployeeName(
                  currentUser.employeeId
                )}`,
                { fromStatus: oldStatus, toStatus: newStatus }
              ) as QuoteHistoryEntry,
            ],
          };

          // Update timestamps
          if (!q.timestamps) {
            updates.timestamps = { created: q.createdDate };
          } else {
            updates.timestamps = { ...q.timestamps };
          }

          if (newStatus === "sent" && !updates.timestamps.sent) {
            updates.timestamps.sent = now;
          } else if (newStatus === "approved" && !updates.timestamps.approved) {
            updates.timestamps.approved = now;
          }

          return { ...q, ...updates };
        }
        return q;
      })
    );

    // Auto-sync to workorder if status changes
    const quote = quotes.find((q) => q.id === quoteId);
    if (quote?.workOrderId && newStatus === "approved") {
      syncQuoteToWorkOrder(quoteId);
    }

    // Create smart notification when quote is approved
    if (newStatus === "approved" && setNotifications) {
      const approvedQuote = quotes.find((q) => q.id === quoteId);
      if (approvedQuote && !approvedQuote.workOrderId) {
        const notification = createQuoteApprovedNotification(
          approvedQuote,
          () => {
            // Action: Convert to work order
            convertQuoteToWorkOrder(quoteId);
          },
          () => {
            // Action: View quote (scroll to quote or show details)
            setActiveTab("quotes");
            // Could add scroll to quote functionality here
          }
        );
        setNotifications((prev) => [notification, ...prev]);
      }
    }
  };

  const handleQuoteUpdate = (quote: Quote) => {
    // Workflow validation before update
    const existingQuote = quotes.find((q) => q.id === quote.id);
    if (existingQuote) {
      const validation = validateQuoteEdit(existingQuote, workOrders);
      if (!validation.canProceed && validation.severity === "error") {
        const guardrail = getWorkflowGuardrailMessage(validation);
        alert(
          `${guardrail.icon} ${validation.message}\n\n${
            validation.suggestedAction || ""
          }`
        );
        return;
      }

      if (validation.severity === "warning") {
        const guardrail = getWorkflowGuardrailMessage(validation);
        const proceed = window.confirm(
          `${guardrail.icon} ${validation.message}\n\n${
            validation.suggestedAction || ""
          }\n\nWil je doorgaan?`
        );
        if (!proceed) return;
      }
    }

    setQuotes(quotes.map((q) => (q.id === quote.id ? quote : q)));

    // Sync to workorder if exists
    if (quote.workOrderId) {
      const synced = syncQuoteToWorkOrder(quote.id);
      if (synced) {
        alert("✅ Offerte en werkorder succesvol gesynchroniseerd!");
      }
    }
  };

  const deleteQuote = (quoteId: string) => {
    if (confirm("Weet je zeker dat je deze offerte wilt verwijderen?")) {
      setQuotes(quotes.filter((q) => q.id !== quoteId));
    }
  };

  // Convert Quote to Invoice
  const convertQuoteToInvoice = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    if (quote.status !== "approved") {
      alert(
        "Alleen geaccepteerde offertes kunnen worden omgezet naar facturen!"
      );
      return;
    }

    const issueDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const now = new Date().toISOString();

    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: quote.customerId,
      quoteId: quote.id,
      items: quote.items,
      labor: quote.labor,
      subtotal: quote.subtotal,
      vatRate: quote.vatRate,
      vatAmount: quote.vatAmount,
      total: quote.total,
      status: "draft",
      issueDate: issueDate,
      dueDate: dueDate.toISOString().split("T")[0],
      notes: quote.notes,
      paymentTerms: "14 dagen",
      workOrderId: quote.workOrderId,

      // Audit trail
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createHistoryEntry(
          "invoice",
          "created",
          `Factuur aangemaakt door ${getEmployeeName(
            currentUser.employeeId
          )} vanuit offerte ${quote.id}`
        ) as InvoiceHistoryEntry,
      ],
    };

    setInvoices([...invoices, invoice]);

    // Update quote met conversie timestamp
    setQuotes(
      quotes.map((q) => {
        if (q.id === quoteId) {
          return {
            ...q,
            timestamps: {
              ...q.timestamps,
              convertedToInvoice: now,
            },
            history: [
              ...(q.history || []),
              createHistoryEntry(
                "quote",
                "converted_to_invoice",
                `Geconverteerd naar factuur ${
                  invoice.invoiceNumber
                } door ${getEmployeeName(currentUser.employeeId)}`
              ) as QuoteHistoryEntry,
            ],
          };
        }
        return q;
      })
    );

    alert(`✅ Factuur ${invoice.invoiceNumber} succesvol aangemaakt!`);
    setActiveTab("invoices");
  };

  // NEW: Convert Quote to Work Order
  const convertQuoteToWorkOrder = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    // Workflow validation
    const validation = validateQuoteToWorkOrder(quote, workOrders);
    if (!validation.canProceed) {
      const guardrail = getWorkflowGuardrailMessage(validation);
      alert(
        `${guardrail.icon} ${validation.message}\n\n${
          validation.suggestedAction || ""
        }`
      );
      return;
    }

    // Check materiaal voorraad
    for (const item of quote.items) {
      if (item.inventoryItemId) {
        const inventoryItem = inventory.find(
          (i) => i.id === item.inventoryItemId
        );
        if (inventoryItem && inventoryItem.quantity < item.quantity) {
          const confirmCreate = confirm(
            `Waarschuwing: Niet genoeg voorraad van ${inventoryItem.name}. Beschikbaar: ${inventoryItem.quantity}, Nodig: ${item.quantity}. Toch werkorder aanmaken?`
          );
          if (!confirmCreate) return;
        }
      }
    }

    const customerName =
      customers.find((c) => c.id === quote.customerId)?.name || "Onbekend";
    const totalHours =
      quote.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

    // Track conversion action
    trackAction(
      currentUser.employeeId,
      currentUser.role,
      ModuleKey.ACCOUNTING,
      "convert_to_workorder",
      "create",
      {
        quoteId: quote.id,
        customerId: quote.customerId,
        totalValue: quote.total,
      }
    );

    // OPEN USER SELECTION MODAL
    setConversionData({
      type: "quote",
      sourceId: quoteId,
      data: { customerName, totalHours, quote },
    });
    setSelectedUserId("");
    setShowUserSelectionModal(true);
  };

  // NEW: Convert Invoice to Work Order
  const convertInvoiceToWorkOrder = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    if (invoice.status !== "sent" && invoice.status !== "draft") {
      alert(
        "Alleen verzonden of concept facturen kunnen worden omgezet naar werkorders!"
      );
      return;
    }

    if (invoice.workOrderId) {
      alert("Deze factuur heeft al een gekoppelde werkorder!");
      return;
    }

    // Check materiaal voorraad
    for (const item of invoice.items) {
      if (item.inventoryItemId) {
        const inventoryItem = inventory.find(
          (i) => i.id === item.inventoryItemId
        );
        if (inventoryItem && inventoryItem.quantity < item.quantity) {
          const confirmCreate = confirm(
            `Waarschuwing: Niet genoeg voorraad van ${inventoryItem.name}. Beschikbaar: ${inventoryItem.quantity}, Nodig: ${item.quantity}. Toch werkorder aanmaken?`
          );
          if (!confirmCreate) return;
        }
      }
    }

    const customerName =
      customers.find((c) => c.id === invoice.customerId)?.name || "Onbekend";
    const totalHours =
      invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

    // OPEN USER SELECTION MODAL
    setConversionData({
      type: "invoice",
      sourceId: invoiceId,
      data: { customerName, totalHours, invoice },
    });
    setSelectedUserId("");
    setShowUserSelectionModal(true);
  };

  // Get WorkOrder status for Quote/Invoice
  const getWorkOrderStatus = (workOrderId?: string) => {
    if (!workOrderId) return null;
    return workOrders.find((wo) => wo.id === workOrderId);
  };

  // Get status badge color and text
  const getWorkOrderBadge = (workOrder?: WorkOrder) => {
    if (!workOrder) return null;

    switch (workOrder.status) {
      case "To Do":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-500",
          icon: "🔵",
          text: "Werkorder: To Do",
        };
      case "Pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-500",
          icon: "🟡",
          text: "Werkorder: In Wacht",
        };
      case "In Progress":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-500",
          icon: "🟢",
          text: "Werkorder: In Uitvoering",
        };
      case "Completed":
        return {
          color: "bg-green-100 text-green-800 border-green-500",
          icon: "✅",
          text: "Werkorder: Voltooid",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: "❓",
          text: "Werkorder: Onbekend",
        };
    }
  };

  // 🆕 Overview Functions
  const openOverviewModal = (
    type: "all" | "paid" | "outstanding" | "overdue"
  ) => {
    setOverviewType(type);
    setShowOverviewModal(true);
  };

  const resetFilters = () => {
    setOverviewFilter({
      customerName: "",
      dateFrom: "",
      dateTo: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;

    // Filter by type
    switch (overviewType) {
      case "paid":
        // Betaalde facturen zijn zichtbaar in Boekhouding & Dossier
        filtered = filtered.filter((inv) => inv.status === "paid");
        break;
      case "outstanding":
        filtered = filtered.filter((inv) =>
          ["sent", "overdue"].includes(inv.status)
        );
        break;
      case "overdue":
        filtered = filtered.filter((inv) => inv.status === "overdue");
        break;
      case "all":
        // 🆕 V5.6: Verberg betaalde facturen bij "all" (alleen zichtbaar in Boekhouding & Dossier)
        filtered = filtered.filter((inv) => inv.status !== "paid");
        break;
      // Default: no filter (but exclude paid)
      default:
        filtered = filtered.filter((inv) => inv.status !== "paid");
    }

    // Filter by customer name
    if (overviewFilter.customerName) {
      filtered = filtered.filter((inv) => {
        const customerName = getCustomerName(inv.customerId).toLowerCase();
        return customerName.includes(overviewFilter.customerName.toLowerCase());
      });
    }

    // Filter by date range
    if (overviewFilter.dateFrom) {
      filtered = filtered.filter(
        (inv) => inv.issueDate >= overviewFilter.dateFrom
      );
    }
    if (overviewFilter.dateTo) {
      filtered = filtered.filter(
        (inv) => inv.issueDate <= overviewFilter.dateTo
      );
    }

    // Filter by amount range
    if (overviewFilter.minAmount) {
      filtered = filtered.filter(
        (inv) => inv.total >= parseFloat(overviewFilter.minAmount)
      );
    }
    if (overviewFilter.maxAmount) {
      filtered = filtered.filter(
        (inv) => inv.total <= parseFloat(overviewFilter.maxAmount)
      );
    }

    return filtered;
  };

  const getFilteredTotal = () => {
    return getFilteredInvoices().reduce((sum, inv) => sum + inv.total, 0);
  };

  // 🆕 Quotes Overview Functions
  const openQuotesOverviewModal = (
    type: "all" | "approved" | "sent" | "expired"
  ) => {
    setQuotesOverviewType(type);
    setShowQuotesOverviewModal(true);
  };

  const getFilteredQuotes = () => {
    let filtered = quotes;

    // Filter by type
    switch (quotesOverviewType) {
      case "approved":
        filtered = filtered.filter((q) => q.status === "approved");
        break;
      case "sent":
        filtered = filtered.filter((q) => q.status === "sent");
        break;
      case "expired":
        filtered = filtered.filter(
          (q) =>
            q.status === "expired" ||
            (q.validUntil && new Date(q.validUntil) < new Date())
        );
        break;
      case "all":
      default:
        break;
    }

    // Apply text filters
    if (overviewFilter.customerName) {
      filtered = filtered.filter((q) =>
        getCustomerName(q.customerId)
          .toLowerCase()
          .includes(overviewFilter.customerName.toLowerCase())
      );
    }

    if (overviewFilter.dateFrom) {
      filtered = filtered.filter(
        (q) => q.createdDate >= overviewFilter.dateFrom
      );
    }

    if (overviewFilter.dateTo) {
      filtered = filtered.filter((q) => q.createdDate <= overviewFilter.dateTo);
    }

    if (overviewFilter.minAmount) {
      filtered = filtered.filter(
        (q) => q.total >= parseFloat(overviewFilter.minAmount)
      );
    }

    if (overviewFilter.maxAmount) {
      filtered = filtered.filter(
        (q) => q.total <= parseFloat(overviewFilter.maxAmount)
      );
    }

    return filtered;
  };

  const getFilteredQuotesTotal = () => {
    return getFilteredQuotes().reduce((sum, q) => sum + q.total, 0);
  };

  // Complete conversion with selected user
  const completeConversion = () => {
    if (!selectedUserId) {
      alert("Selecteer een medewerker!");
      return;
    }

    if (!conversionData) return;

    if (conversionData.type === "quote") {
      executeQuoteToWorkOrderConversion(
        conversionData.sourceId,
        selectedUserId,
        conversionData.data
      );
    } else {
      executeInvoiceToWorkOrderConversion(
        conversionData.sourceId,
        selectedUserId,
        conversionData.data
      );
    }

    setShowUserSelectionModal(false);
    setConversionData(null);
    setSelectedUserId("");
  };

  // Execute the actual conversion after user is selected - FOR QUOTE
  const executeQuoteToWorkOrderConversion = (
    quoteId: string,
    userId: string,
    data: any
  ) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    const now = new Date().toISOString();
    const workOrderId = `wo${Date.now()}`;

    const workOrder: WorkOrder = {
      id: workOrderId,
      title: `${data.customerName} - Offerte ${quote.id}`,
      description:
        quote.notes || `Werkorder aangemaakt vanuit offerte ${quote.id}`,
      status: "To Do",
      assignedTo: userId,
      assignedBy: currentUser.employeeId,
      convertedBy: currentUser.employeeId,
      requiredInventory: quote.items
        .filter((item) => item.inventoryItemId)
        .map((item) => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity,
        })),
      createdDate: new Date().toISOString().split("T")[0],
      customerId: quote.customerId,
      location: quote.location,
      scheduledDate: quote.scheduledDate,
      quoteId: quote.id,
      estimatedHours: data.totalHours,
      estimatedCost: quote.total,
      notes: `Geschatte uren: ${
        data.totalHours
      }u\nGeschatte kosten: €${quote.total.toFixed(2)}`,
      // NEW TIMESTAMPS
      timestamps: {
        created: now,
        converted: now,
        assigned: now,
      },
      // NEW HISTORY
      history: [
        createHistoryEntry(
          "quote",
          "created",
          `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`
        ) as any,
        createHistoryEntry(
          "quote",
          "converted",
          `Geconverteerd van offerte ${quote.id} door ${getEmployeeName(
            currentUser.employeeId
          )}`
        ) as any,
        {
          timestamp: now,
          action: "assigned" as const,
          performedBy: currentUser.employeeId,
          details: `Toegewezen aan ${getEmployeeName(
            userId
          )} door ${getEmployeeName(currentUser.employeeId)}`,
          toAssignee: userId,
        },
      ],
    };

    setWorkOrders([...workOrders, workOrder]);

    // Update quote met workOrderId
    setQuotes(
      quotes.map((q) => {
        if (q.id === quoteId) {
          return {
            ...q,
            workOrderId: workOrder.id,
            timestamps: {
              ...q.timestamps,
              convertedToWorkOrder: now,
            },
            history: [
              ...(q.history || []),
              createHistoryEntry(
                "quote",
                "converted_to_workorder",
                `Geconverteerd naar werkorder ${
                  workOrder.id
                } door ${getEmployeeName(currentUser.employeeId)}`
              ) as QuoteHistoryEntry,
            ],
          };
        }
        return q;
      })
    );

    alert(
      `✅ Werkorder ${
        workOrder.id
      } succesvol aangemaakt en toegewezen aan ${getEmployeeName(userId)}!`
    );
  };

  // Execute the actual conversion after user is selected - FOR INVOICE
  const executeInvoiceToWorkOrderConversion = (
    invoiceId: string,
    userId: string,
    data: any
  ) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const now = new Date().toISOString();
    const workOrderId = `wo${Date.now()}`;

    const workOrder: WorkOrder = {
      id: workOrderId,
      title: `${data.customerName} - Factuur ${data.invoice.invoiceNumber}`,
      description:
        data.invoice.notes ||
        `Werkorder aangemaakt vanuit factuur ${data.invoice.invoiceNumber}`,
      status: "To Do",
      assignedTo: userId,
      assignedBy: currentUser.employeeId,
      convertedBy: currentUser.employeeId,
      requiredInventory: data.invoice.items
        .filter((item: any) => item.inventoryItemId)
        .map((item: any) => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity,
        })),
      createdDate: new Date().toISOString().split("T")[0],
      customerId: data.invoice.customerId,
      location: data.invoice.location,
      scheduledDate: data.invoice.scheduledDate,
      invoiceId: invoice.id,
      estimatedHours: data.totalHours,
      estimatedCost: data.invoice.total,
      notes: `Geschatte uren: ${
        data.totalHours
      }u\nGeschatte kosten: €${data.invoice.total.toFixed(2)}`,
      // NEW TIMESTAMPS
      timestamps: {
        created: now,
        converted: now,
        assigned: now,
      },
      // NEW HISTORY
      history: [
        createHistoryEntry(
          "invoice",
          "created",
          `Werkorder aangemaakt door ${getEmployeeName(currentUser.employeeId)}`
        ) as any,
        createHistoryEntry(
          "invoice",
          "converted",
          `Geconverteerd van factuur ${
            data.invoice.invoiceNumber
          } door ${getEmployeeName(currentUser.employeeId)}`
        ) as any,
        {
          timestamp: now,
          action: "assigned" as const,
          performedBy: currentUser.employeeId,
          details: `Toegewezen aan ${getEmployeeName(
            userId
          )} door ${getEmployeeName(currentUser.employeeId)}`,
          toAssignee: userId,
        },
      ],
    };

    setWorkOrders([...workOrders, workOrder]);

    // Update invoice met workOrderId
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            workOrderId: workOrder.id,
            timestamps: {
              ...inv.timestamps,
              convertedToWorkOrder: now,
            },
            history: [
              ...(inv.history || []),
              createHistoryEntry(
                "invoice",
                "converted_to_workorder",
                `Geconverteerd naar werkorder ${
                  workOrder.id
                } door ${getEmployeeName(currentUser.employeeId)}`
              ) as InvoiceHistoryEntry,
            ],
          };
        }
        return inv;
      })
    );

    alert(
      `✅ Werkorder ${
        workOrder.id
      } succesvol aangemaakt en toegewezen aan ${getEmployeeName(userId)}!`
    );
  };

  // Sync Quote changes to WorkOrder
  const syncQuoteToWorkOrder = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote || !quote.workOrderId) return;

    const workOrder = workOrders.find((wo) => wo.id === quote.workOrderId);
    if (!workOrder) return;

    // Check if workorder is completed
    if (workOrder.status === "Completed") {
      alert(
        "❌ Deze werkorder is al voltooid. Wijzigingen zijn niet meer mogelijk (behalve notities)."
      );
      return false;
    }

    // Warning if in progress
    if (workOrder.status === "In Progress") {
      const confirm = window.confirm(
        "⚠️ Deze werkorder is momenteel actief. Weet je zeker dat je wijzigingen wilt doorvoeren? De toegewezen medewerker ontvangt een notificatie."
      );
      if (!confirm) return false;
    }

    // Update workorder with new data from quote
    const totalHours =
      quote.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      requiredInventory: quote.items
        .filter((item) => item.inventoryItemId)
        .map((item) => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity,
        })),
      estimatedHours: totalHours,
      estimatedCost: quote.total,
      notes: `${
        workOrder.notes || ""
      }\n\n[Update: ${new Date().toLocaleDateString()}] Offerte aangepast - Geschatte uren: ${totalHours}u, Kosten: €${quote.total.toFixed(
        2
      )}`,
    };

    setWorkOrders(
      workOrders.map((wo) => (wo.id === workOrder.id ? updatedWorkOrder : wo))
    );

    return true;
  };

  // Sync Invoice changes to WorkOrder
  const syncInvoiceToWorkOrder = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice || !invoice.workOrderId) return;

    const workOrder = workOrders.find((wo) => wo.id === invoice.workOrderId);
    if (!workOrder) return;

    // Check if workorder is completed
    if (workOrder.status === "Completed") {
      alert(
        "❌ Deze werkorder is al voltooid. Wijzigingen zijn niet meer mogelijk (behalve notities)."
      );
      return false;
    }

    // Warning if in progress
    if (workOrder.status === "In Progress") {
      const confirm = window.confirm(
        "⚠️ Deze werkorder is momenteel actief. Weet je zeker dat je wijzigingen wilt doorvoeren? De toegewezen medewerker ontvangt een notificatie."
      );
      if (!confirm) return false;
    }

    // Update workorder with new data from invoice
    const totalHours =
      invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      requiredInventory: invoice.items
        .filter((item) => item.inventoryItemId)
        .map((item) => ({
          itemId: item.inventoryItemId!,
          quantity: item.quantity,
        })),
      estimatedHours: totalHours,
      estimatedCost: invoice.total,
      notes: `${
        workOrder.notes || ""
      }\n\n[Update: ${new Date().toLocaleDateString()}] Factuur aangepast - Geschatte uren: ${totalHours}u, Kosten: €${invoice.total.toFixed(
        2
      )}`,
    };

    setWorkOrders(
      workOrders.map((wo) => (wo.id === workOrder.id ? updatedWorkOrder : wo))
    );

    return true;
  };

  // Invoice CRUD Operations
  const handleAddInvoiceInventoryItem = () => {
    const newItem: QuoteItem = {
      inventoryItemId: "",
      description: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    };
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, newItem],
    });
  };

  const handleAddInvoiceCustomItem = () => {
    const newItem: QuoteItem = {
      description: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    };
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, newItem],
    });
  };

  const handleAddInvoiceLabor = () => {
    const newLabor: QuoteLabor = {
      description: "",
      hours: 1,
      hourlyRate: 50,
      total: 50,
    };
    setNewInvoice({
      ...newInvoice,
      labor: [...newInvoice.labor, newLabor],
    });
  };

  const handleRemoveInvoiceItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index),
    });
  };

  const handleRemoveInvoiceLabor = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      labor: newInvoice.labor.filter((_, i) => i !== index),
    });
  };

  const handleInvoiceInventoryItemChange = (
    index: number,
    inventoryItemId: string
  ) => {
    const inventoryItem = inventory.find((i) => i.id === inventoryItemId);
    if (inventoryItem) {
      const updatedItems = [...newInvoice.items];
      updatedItems[index] = {
        ...updatedItems[index],
        inventoryItemId: inventoryItemId,
        description: inventoryItem.name,
        pricePerUnit: inventoryItem.price || 0,
        total: updatedItems[index].quantity * (inventoryItem.price || 0),
      };
      setNewInvoice({ ...newInvoice, items: updatedItems });
    }
  };

  const handleInvoiceItemChange = (
    index: number,
    field: keyof QuoteItem,
    value: any
  ) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === "quantity" || field === "pricePerUnit") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].pricePerUnit;
    }

    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const handleInvoiceLaborChange = (
    index: number,
    field: keyof QuoteLabor,
    value: any
  ) => {
    const updatedLabor = [...newInvoice.labor];
    updatedLabor[index] = { ...updatedLabor[index], [field]: value };

    if (field === "hours" || field === "hourlyRate") {
      updatedLabor[index].total =
        updatedLabor[index].hours * updatedLabor[index].hourlyRate;
    }

    setNewInvoice({ ...newInvoice, labor: updatedLabor });
  };

  const handleCreateInvoice = () => {
    if (
      !newInvoice.customerId ||
      newInvoice.items.length === 0 ||
      !newInvoice.issueDate ||
      !newInvoice.dueDate
    ) {
      alert("Vul alle verplichte velden in!");
      return;
    }

    const { subtotal, vatAmount, total } = calculateInvoiceTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(newInvoice.customerId);

    // If editing, update existing invoice
    if (editingInvoiceId) {
      const existingInvoice = invoices.find(
        (inv) => inv.id === editingInvoiceId
      );
      if (!existingInvoice) return;

      const updatedInvoice: Invoice = {
        ...existingInvoice,
        customerId: newInvoice.customerId,
        items: newInvoice.items,
        labor: newInvoice.labor.length > 0 ? newInvoice.labor : undefined,
        subtotal: subtotal,
        vatRate: newInvoice.vatRate,
        vatAmount: vatAmount,
        total: total,
        issueDate: newInvoice.issueDate,
        dueDate: newInvoice.dueDate,
        notes: newInvoice.notes,
        paymentTerms: newInvoice.paymentTerms,
        history: [
          ...(existingInvoice.history || []),
          createHistoryEntry(
            "invoice",
            "updated",
            `Factuur bijgewerkt door ${getEmployeeName(currentUser.employeeId)}`
          ) as InvoiceHistoryEntry,
        ],
      };

      handleInvoiceUpdate(updatedInvoice);
      setEditingInvoiceId(null);
      setShowInvoiceForm(false);
      setNewInvoice({
        customerId: "",
        items: [],
        labor: [],
        vatRate: 21,
        notes: "",
        paymentTerms: "14 dagen",
        issueDate: "",
        dueDate: "",
      });
      alert(`✅ Factuur ${updatedInvoice.invoiceNumber} succesvol bijgewerkt!`);
      return;
    }

    // Create new invoice
    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: newInvoice.customerId,
      items: newInvoice.items,
      labor: newInvoice.labor.length > 0 ? newInvoice.labor : undefined,
      subtotal: subtotal,
      vatRate: newInvoice.vatRate,
      vatAmount: vatAmount,
      total: total,
      status: "draft",
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms,

      // Audit trail
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createHistoryEntry(
          "invoice",
          "created",
          `Factuur aangemaakt door ${getEmployeeName(
            currentUser.employeeId
          )} voor klant ${customerName}`
        ) as InvoiceHistoryEntry,
      ],
    };

    setInvoices([...invoices, invoice]);
    setNewInvoice({
      customerId: "",
      items: [],
      labor: [],
      vatRate: 21,
      notes: "",
      paymentTerms: "14 dagen",
      issueDate: "",
      dueDate: "",
    });
    setShowInvoiceForm(false);

    // Track analytics
    trackAction(
      currentUser.employeeId,
      currentUser.role,
      ModuleKey.ACCOUNTING,
      "create_invoice",
      "create",
      {
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        total: invoice.total,
        itemsCount: invoice.items.length,
        laborCount: invoice.labor?.length || 0,
      }
    );

    alert(`✅ Factuur ${invoice.invoiceNumber} succesvol aangemaakt!`);
  };

  // Check if invoice was automatically created from work order
  const isAutoGeneratedInvoice = (invoice: Invoice): boolean => {
    return !!(
      invoice.workOrderId ||
      (invoice.notes &&
        invoice.notes.includes("Factuur aangemaakt automatisch"))
    );
  };

  // Get work order info for comparison
  const getWorkOrderForInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice?.workOrderId) return null;
    return workOrders.find((wo) => wo.id === invoice.workOrderId);
  };

  const updateInvoiceStatus = (
    invoiceId: string,
    newStatus: Invoice["status"]
  ) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    // Tip 4: Show validation modal for draft invoices being sent, especially auto-generated ones
    if (newStatus === "sent" && invoice.status === "draft") {
      const isAutoGenerated = isAutoGeneratedInvoice(invoice);
      if (isAutoGenerated) {
        // Show validation modal for auto-generated invoices
        setInvoiceToValidate(invoice);
        setValidationChecklist({
          hoursChecked: false,
          materialsChecked: false,
          extraWorkAdded: false,
        });
        setShowInvoiceValidationModal(true);
        return; // Don't update yet, wait for validation
      }
    }

    // Proceed with status update
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const now = new Date().toISOString();
          const oldStatus = inv.status;

          const updates: Partial<Invoice> = {
            status: newStatus,
            history: [
              ...(inv.history || []),
              createHistoryEntry(
                "invoice",
                newStatus,
                `Status gewijzigd van "${oldStatus}" naar "${newStatus}" door ${getEmployeeName(
                  currentUser.employeeId
                )}`,
                { fromStatus: oldStatus, toStatus: newStatus }
              ) as InvoiceHistoryEntry,
            ],
          };

          // Update timestamps
          if (!inv.timestamps) {
            updates.timestamps = { created: inv.issueDate };
          } else {
            updates.timestamps = { ...inv.timestamps };
          }

          if (newStatus === "sent" && !updates.timestamps.sent) {
            updates.timestamps.sent = now;

            // 🆕 V5.6: Automatische herinneringsplanning bij verzenden
            if (inv.dueDate) {
              const dueDate = new Date(inv.dueDate);
              const reminder1Date = new Date(dueDate);
              reminder1Date.setDate(dueDate.getDate() + 7); // +7 dagen na vervaldatum

              const reminder2Date = new Date(dueDate);
              reminder2Date.setDate(dueDate.getDate() + 14); // +14 dagen na vervaldatum

              updates.reminders = {
                reminder1Date: reminder1Date.toISOString().split("T")[0],
                reminder1Sent: false,
                reminder2Date: reminder2Date.toISOString().split("T")[0],
                reminder2Sent: false,
              };
            }

            // Track invoice validation completion
            trackAction(
              currentUser.employeeId,
              currentUser.role,
              ModuleKey.ACCOUNTING,
              "validate_invoice",
              "complete",
              {
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                wasAutoGenerated: isAutoGeneratedInvoice(inv),
              }
            );
          } else if (newStatus === "paid") {
            updates.paidDate = new Date().toISOString().split("T")[0];
            updates.timestamps.paid = now;

            // Track invoice payment
            trackAction(
              currentUser.employeeId,
              currentUser.role,
              ModuleKey.ACCOUNTING,
              "mark_invoice_paid",
              "complete",
              {
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                total: inv.total,
              }
            );
          }

          return { ...inv, ...updates };
        }
        return inv;
      })
    );
  };

  // Tip 4: Confirm invoice validation and send
  const confirmInvoiceValidation = () => {
    if (!invoiceToValidate) return;

    // Check if all items are checked (at least hours and materials)
    if (
      !validationChecklist.hoursChecked ||
      !validationChecklist.materialsChecked
    ) {
      alert("⚠️ Controleer minimaal de uren en materialen voordat u verzendt.");
      return;
    }

    // Directly update invoice status to "sent" without going through validation check again
    const invoice = invoices.find((inv) => inv.id === invoiceToValidate.id);
    if (!invoice) return;

    const now = new Date().toISOString();
    const oldStatus = invoice.status;

    const updates: Partial<Invoice> = {
      status: "sent",
      history: [
        ...(invoice.history || []),
        createHistoryEntry(
          "invoice",
          "sent",
          `Status gewijzigd van "${oldStatus}" naar "sent" na validatie door ${getEmployeeName(
            currentUser.employeeId
          )}`,
          { fromStatus: oldStatus, toStatus: "sent" }
        ) as InvoiceHistoryEntry,
      ],
    };

    // Update timestamps
    if (!invoice.timestamps) {
      updates.timestamps = { created: invoice.issueDate };
    } else {
      updates.timestamps = { ...invoice.timestamps };
    }

    if (!updates.timestamps.sent) {
      updates.timestamps.sent = now;

      // 🆕 V5.6: Automatische herinneringsplanning bij verzenden
      if (invoice.dueDate) {
        const dueDate = new Date(invoice.dueDate);
        const reminder1Date = new Date(dueDate);
        reminder1Date.setDate(dueDate.getDate() + 7); // +7 dagen na vervaldatum

        const reminder2Date = new Date(dueDate);
        reminder2Date.setDate(dueDate.getDate() + 14); // +14 dagen na vervaldatum

        updates.reminders = {
          reminder1Date: reminder1Date.toISOString().split("T")[0],
          reminder1Sent: false,
          reminder2Date: reminder2Date.toISOString().split("T")[0],
          reminder2Sent: false,
        };
      }

      // Track invoice validation completion
      trackAction(
        currentUser.employeeId,
        currentUser.role,
        ModuleKey.ACCOUNTING,
        "validate_invoice",
        "complete",
        {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          wasAutoGenerated: isAutoGeneratedInvoice(invoice),
        }
      );
    }

    // Update invoice in state
    setInvoices(
      invoices.map((inv) =>
        inv.id === invoice.id ? { ...inv, ...updates } : inv
      )
    );

    // Close modal and reset
    setShowInvoiceValidationModal(false);
    setInvoiceToValidate(null);
    setValidationChecklist({
      hoursChecked: false,
      materialsChecked: false,
      extraWorkAdded: false,
    });

    // Show success message
    alert(
      `✅ Factuur ${invoice.invoiceNumber} succesvol gevalideerd en verzonden!`
    );
  };

  const handleEditInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    // Pre-fill form with invoice data
    setNewInvoice({
      customerId: invoice.customerId,
      items: invoice.items,
      labor: invoice.labor || [],
      vatRate: invoice.vatRate,
      notes: invoice.notes || "",
      paymentTerms: invoice.paymentTerms || "14 dagen",
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
    });

    // Store editing invoice ID
    const editingInvoiceId = invoiceId;
    setEditingInvoiceId(editingInvoiceId);

    // Open form and switch to invoices tab
    setActiveTab("invoices");
    setShowInvoiceForm(true);
  };

  const handleInvoiceUpdate = (invoice: Invoice) => {
    setInvoices(invoices.map((inv) => (inv.id === invoice.id ? invoice : inv)));

    // Sync to workorder if exists
    if (invoice.workOrderId) {
      const synced = syncInvoiceToWorkOrder(invoice.id);
      if (synced) {
        alert("✅ Factuur en werkorder succesvol gesynchroniseerd!");
      }
    }
  };

  const deleteInvoice = (invoiceId: string) => {
    if (confirm("Weet je zeker dat je deze factuur wilt verwijderen?")) {
      setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
    }
  };

  // 🆕 CLONE QUOTE FUNCTION
  const handleCloneQuote = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    // Prepare clone data with new ID and reset fields
    setNewQuote({
      customerId: quote.customerId,
      items: quote.items,
      labor: quote.labor || [],
      vatRate: quote.vatRate,
      notes: quote.notes || "",
      validUntil: "", // User should set new date
    });
    setShowCloneQuoteModal(true);
  };

  const handleSaveClonedQuote = () => {
    if (
      !newQuote.customerId ||
      newQuote.items.length === 0 ||
      !newQuote.validUntil
    ) {
      alert(
        "Vul alle verplichte velden in (klant, minimaal 1 item, en geldig tot datum)!"
      );
      return;
    }

    const { subtotal, vatAmount, total } = calculateQuoteTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(newQuote.customerId);

    const quote: Quote = {
      id: `Q${Date.now()}`,
      customerId: newQuote.customerId,
      items: newQuote.items,
      labor: newQuote.labor.length > 0 ? newQuote.labor : undefined,
      subtotal: subtotal,
      vatRate: newQuote.vatRate,
      vatAmount: vatAmount,
      total: total,
      status: "draft",
      createdDate: new Date().toISOString().split("T")[0],
      validUntil: newQuote.validUntil,
      notes: newQuote.notes,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createHistoryEntry(
          "quote",
          "created",
          `Offerte gecloneerd door ${getEmployeeName(
            currentUser.employeeId
          )} voor klant ${customerName}`
        ) as QuoteHistoryEntry,
      ],
    };

    setQuotes([...quotes, quote]);
    setNewQuote({
      customerId: "",
      items: [],
      labor: [],
      vatRate: 21,
      notes: "",
      validUntil: "",
    });
    setShowCloneQuoteModal(false);
    alert(`✅ Offerte ${quote.id} succesvol gecloneerd!`);

    // Scroll to the new quote
    setTimeout(() => {
      const element = document.getElementById(quote.id);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  // 🆕 CLONE INVOICE FUNCTION
  const handleCloneInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const today = new Date().toISOString().split("T")[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // +14 days

    // Prepare clone data with new invoice number and reset fields
    setNewInvoice({
      customerId: invoice.customerId,
      items: invoice.items,
      labor: invoice.labor || [],
      vatRate: invoice.vatRate,
      notes: invoice.notes || "",
      paymentTerms: invoice.paymentTerms,
      issueDate: today,
      dueDate: dueDate.toISOString().split("T")[0],
    });
    setShowCloneInvoiceModal(true);
  };

  const handleSaveClonedInvoice = (sendToWorkOrder: boolean = false) => {
    if (
      !newInvoice.customerId ||
      newInvoice.items.length === 0 ||
      !newInvoice.issueDate ||
      !newInvoice.dueDate
    ) {
      alert("Vul alle verplichte velden in!");
      return;
    }

    const { subtotal, vatAmount, total } = calculateInvoiceTotals();
    const now = new Date().toISOString();
    const customerName = getCustomerName(newInvoice.customerId);

    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: newInvoice.customerId,
      items: newInvoice.items,
      labor: newInvoice.labor.length > 0 ? newInvoice.labor : undefined,
      subtotal: subtotal,
      vatRate: newInvoice.vatRate,
      vatAmount: vatAmount,
      total: total,
      status: "draft",
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms,
      createdBy: currentUser.employeeId,
      timestamps: {
        created: now,
      },
      history: [
        createHistoryEntry(
          "invoice",
          "created",
          `Factuur gecloneerd door ${getEmployeeName(
            currentUser.employeeId
          )} voor klant ${customerName}`
        ) as InvoiceHistoryEntry,
      ],
    };

    setInvoices([...invoices, invoice]);

    // Reset form
    const clonedInvoiceData = {
      customerId: newInvoice.customerId,
      items: newInvoice.items,
      labor: newInvoice.labor,
      vatRate: newInvoice.vatRate,
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms,
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
    };

    setNewInvoice({
      customerId: "",
      items: [],
      labor: [],
      vatRate: 21,
      notes: "",
      paymentTerms: "14 dagen",
      issueDate: "",
      dueDate: "",
    });

    setShowCloneInvoiceModal(false);

    // If sendToWorkOrder is true, open user selection modal
    if (sendToWorkOrder) {
      const totalHours =
        invoice.labor?.reduce((sum, labor) => sum + labor.hours, 0) || 0;

      setConversionData({
        type: "invoice",
        sourceId: invoice.id,
        data: { customerName, totalHours, invoice },
      });
      setSelectedUserId("");
      setShowUserSelectionModal(true);
    } else {
      alert(`✅ Factuur ${invoice.invoiceNumber} succesvol gecloneerd!`);

      // Scroll to the new invoice
      setTimeout(() => {
        const element = document.getElementById(invoice.id);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const handleSaveClonedInvoiceAndSendToWorkOrder = () => {
    handleSaveClonedInvoice(true);
  };

  // 🆕 V5.6: Send reminder manually
  const handleSendReminder = (invoiceId: string, reminderNumber: 1 | 2) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice || !invoice.reminders) return;

    const now = new Date().toISOString();
    const reminderField =
      reminderNumber === 1 ? "reminder1Sent" : "reminder2Sent";
    const reminderDateField =
      reminderNumber === 1 ? "reminder1SentDate" : "reminder2SentDate";

    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId && inv.reminders) {
          return {
            ...inv,
            reminders: {
              ...inv.reminders,
              [reminderField]: true,
              [reminderDateField]: now,
            },
            history: [
              ...(inv.history || []),
              createHistoryEntry(
                "invoice",
                "updated",
                `Herinnering ${reminderNumber} verzonden voor factuur ${
                  inv.invoiceNumber
                } door ${getEmployeeName(currentUser.employeeId)}`
              ) as InvoiceHistoryEntry,
            ],
          };
        }
        return inv;
      })
    );

    const reminderDate =
      reminderNumber === 1
        ? invoice.reminders.reminder1Date
        : invoice.reminders.reminder2Date;
    alert(
      `✅ Herinnering ${reminderNumber} verzonden voor factuur ${
        invoice.invoiceNumber
      }\n\n📧 Template: "Betreft factuur ${
        invoice.invoiceNumber
      } – vriendelijke herinnering"${
        reminderDate
          ? `\n📅 Gepland voor: ${new Date(reminderDate).toLocaleDateString(
              "nl-NL"
            )}`
          : ""
      }`
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral mb-2">
        Facturen en Offerte
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-8">
        Genereer offertes, facturen en beheer financiële gegevens
      </p>

      {/* 🆕 Overview Modal with Filters */}
      {showOverviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-2xl w-full sm:max-w-6xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral flex items-center gap-3">
                  {overviewType === "all" && "📊 Totaal Gefactureerd"}
                  {overviewType === "paid" && "✅ Betaalde Facturen"}
                  {overviewType === "outstanding" && "⏳ Uitstaande Facturen"}
                  {overviewType === "overdue" && "⚠️ Verlopen Facturen"}
                </h2>
                <button
                  onClick={() => {
                    setShowOverviewModal(false);
                    resetFilters();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* 🆕 V5.6: Info banner voor betaalde facturen */}
              {overviewType === "paid" && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        Betaalde facturen zijn verplaatst naar Boekhouding &
                        Dossier
                      </p>
                      <p className="text-xs text-blue-700">
                        Alle betaalde facturen zijn automatisch geregistreerd in
                        het{" "}
                        <span className="font-semibold">
                          Boekhouding & Dossier
                        </span>{" "}
                        module. Ga daarheen voor een volledig overzicht van alle
                        betaalde facturen.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  🔍 Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klantnaam
                    </label>
                    <input
                      type="text"
                      value={overviewFilter.customerName}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          customerName: e.target.value,
                        })
                      }
                      placeholder="Zoek op klantnaam..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum vanaf
                    </label>
                    <input
                      type="date"
                      value={overviewFilter.dateFrom}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          dateFrom: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum tot
                    </label>
                    <input
                      type="date"
                      value={overviewFilter.dateTo}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          dateTo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min. Bedrag (€)
                    </label>
                    <input
                      type="number"
                      value={overviewFilter.minAmount}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          minAmount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max. Bedrag (€)
                    </label>
                    <input
                      type="number"
                      value={overviewFilter.maxAmount}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          maxAmount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    >
                      🔄 Reset Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Totaal */}
              <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">
                    Totaal Gefilterd:
                  </span>
                  <span className="text-3xl font-bold text-blue-600">
                    €{getFilteredTotal().toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getFilteredInvoices().length} facturen gevonden
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
              {getFilteredInvoices().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    🔍 Geen facturen gevonden met deze filters
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredInvoices().map((invoice) => {
                    const isSelected = selectedInvoices.includes(invoice.id);
                    const workOrder = getWorkOrderStatus(invoice.workOrderId);
                    const badge = getWorkOrderBadge(workOrder);

                    return (
                      <div
                        key={invoice.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🧾</span>
                            <div>
                              <p className="font-semibold text-lg text-gray-800">
                                {invoice.invoiceNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                {getCustomerName(invoice.customerId)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              €{invoice.total.toFixed(2)}
                            </p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getInvoiceStatusColor(
                                invoice.status
                              )}`}
                            >
                              {invoice.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mt-3">
                          <div>
                            <span className="font-semibold">Factuurdatum:</span>
                            <p>{invoice.issueDate}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Vervaldatum:</span>
                            <p>{invoice.dueDate}</p>
                          </div>
                          <div>
                            <span className="font-semibold">
                              Betalingstermijn:
                            </span>
                            <p>{invoice.paymentTerms}</p>
                          </div>
                          {invoice.paidDate && (
                            <div>
                              <span className="font-semibold">Betaald op:</span>
                              <p>{invoice.paidDate}</p>
                            </div>
                          )}
                        </div>

                        {badge && (
                          <div className="mt-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border-2 ${badge.color}`}
                            >
                              {badge.icon} {badge.text}
                            </span>
                          </div>
                        )}

                        {invoice.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            <strong>Notities:</strong> {invoice.notes}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setShowOverviewModal(false);
                              handleEditInvoice(invoice.id);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                            title="Factuur bewerken"
                          >
                            ✏️ Bewerken
                          </button>
                          <button
                            onClick={() => {
                              setShowOverviewModal(false);
                              handleCloneInvoice(invoice.id);
                            }}
                            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-semibold"
                            title="Factuur clonen"
                          >
                            📋 Clonen
                          </button>
                          {(invoice.status === "sent" ||
                            invoice.status === "draft") &&
                            !invoice.workOrderId && (
                              <button
                                onClick={() => {
                                  setShowOverviewModal(false);
                                  convertInvoiceToWorkOrder(invoice.id);
                                }}
                                className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                                title="Verzend naar werkorder"
                              >
                                📤 Naar Werkorder
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowOverviewModal(false);
                  resetFilters();
                }}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
              >
                ✓ Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Selection Modal */}
      {showUserSelectionModal && conversionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-semibold text-neutral mb-4">
              👤 Medewerker Toewijzen
            </h2>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Je gaat een werkorder aanmaken van deze{" "}
                {conversionData.type === "quote" ? "offerte" : "factuur"}. Aan
                welke medewerker wil je deze werkorder toewijzen?
              </p>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-blue-800">
                    Werkorder Details
                  </span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Klant:</strong> {conversionData.data.customerName}
                  </p>
                  <p>
                    <strong>Geschatte uren:</strong>{" "}
                    {conversionData.data.totalHours}u
                  </p>
                  <p>
                    <strong>Waarde:</strong> €
                    {conversionData.type === "quote"
                      ? conversionData.data.quote.total.toFixed(2)
                      : conversionData.data.invoice.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecteer Medewerker *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Kies een medewerker --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={completeConversion}
                disabled={!selectedUserId}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  selectedUserId
                    ? "bg-primary text-white hover:bg-secondary"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                ✓ Werkorder Aanmaken
              </button>
              <button
                onClick={() => {
                  setShowUserSelectionModal(false);
                  setConversionData(null);
                  setSelectedUserId("");
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Quotes Overview Modal */}
      {showQuotesOverviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral flex items-center gap-3">
                  {quotesOverviewType === "all" && "📊 Totaal Geoffreerd"}
                  {quotesOverviewType === "approved" &&
                    "✅ Geaccepteerde Offertes"}
                  {quotesOverviewType === "sent" && "📤 Verzonden Offertes"}
                  {quotesOverviewType === "expired" && "⚠️ Verlopen Offertes"}
                </h2>
                <button
                  onClick={() => {
                    setShowQuotesOverviewModal(false);
                    resetFilters();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  🔍 Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klantnaam
                    </label>
                    <input
                      type="text"
                      value={overviewFilter.customerName}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          customerName: e.target.value,
                        })
                      }
                      placeholder="Zoek op klantnaam..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum vanaf
                    </label>
                    <input
                      type="date"
                      value={overviewFilter.dateFrom}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          dateFrom: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum tot
                    </label>
                    <input
                      type="date"
                      value={overviewFilter.dateTo}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          dateTo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min. Bedrag (€)
                    </label>
                    <input
                      type="number"
                      value={overviewFilter.minAmount}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          minAmount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max. Bedrag (€)
                    </label>
                    <input
                      type="number"
                      value={overviewFilter.maxAmount}
                      onChange={(e) =>
                        setOverviewFilter({
                          ...overviewFilter,
                          maxAmount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    >
                      🔄 Reset Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Totaal */}
              <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">
                    Totaal Gefilterd:
                  </span>
                  <span className="text-3xl font-bold text-blue-600">
                    €{getFilteredQuotesTotal().toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getFilteredQuotes().length} offertes gevonden
                </div>
              </div>
            </div>

            {/* Quotes List */}
            <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
              {getFilteredQuotes().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    🔍 Geen offertes gevonden met deze filters
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredQuotes().map((quote) => {
                    const workOrder = getWorkOrderStatus(quote.workOrderId);
                    const badge = getWorkOrderBadge(workOrder);

                    return (
                      <div
                        key={quote.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📋</span>
                            <div>
                              <p className="font-semibold text-lg text-gray-800">
                                {quote.id}
                              </p>
                              <p className="text-sm text-gray-600">
                                {getCustomerName(quote.customerId)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              €{quote.total.toFixed(2)}
                            </p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getQuoteStatusColor(
                                quote.status
                              )}`}
                            >
                              {quote.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600 mt-3">
                          <div>
                            <span className="font-semibold">Aangemaakt:</span>
                            <p>{quote.createdDate}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Geldig tot:</span>
                            <p>{quote.validUntil}</p>
                          </div>
                          {badge && (
                            <div>
                              <span className="font-semibold">Werkorder:</span>
                              <p>{badge.text}</p>
                            </div>
                          )}
                        </div>

                        {badge && (
                          <div className="mt-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border-2 ${badge.color}`}
                            >
                              {badge.icon} {badge.text}
                            </span>
                          </div>
                        )}

                        {quote.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            <strong>Notities:</strong> {quote.notes}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setShowQuotesOverviewModal(false);
                              handleEditQuote(quote.id);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                            title="Offerte bewerken"
                          >
                            ✏️ Bewerken
                          </button>
                          <button
                            onClick={() => {
                              setShowQuotesOverviewModal(false);
                              handleCloneQuote(quote.id);
                            }}
                            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-semibold"
                            title="Offerte clonen"
                          >
                            📋 Clonen
                          </button>
                          {(quote.status === "approved" ||
                            quote.status === "sent") &&
                            !quote.workOrderId && (
                              <button
                                onClick={() => {
                                  setShowQuotesOverviewModal(false);
                                  convertQuoteToWorkOrder(quote.id);
                                }}
                                className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                                title="Verzend naar werkorder"
                              >
                                📤 Naar Werkorder
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowQuotesOverviewModal(false);
                  resetFilters();
                }}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
              >
                ✓ Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 ACCEPT QUOTE MODAL WITH CLONE OPTION */}
      {showAcceptQuoteModal && quoteToAccept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Offerte Accepteren
              </h2>
              <button
                onClick={() => {
                  setShowAcceptQuoteModal(false);
                  setQuoteToAccept(null);
                  setCloneOnAccept(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {(() => {
              const quote = quotes.find((q) => q.id === quoteToAccept);
              if (!quote) return null;

              return (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Deze offerte wordt geaccepteerd en gemarkeerd als
                      goedgekeurd.
                    </p>
                    {quote.validUntil && (
                      <p className="text-xs text-gray-500">
                        Geldig tot:{" "}
                        {new Date(quote.validUntil).toLocaleDateString("nl-NL")}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cloneOnAccept}
                        onChange={(e) => setCloneOnAccept(e.target.checked)}
                        className="mt-1 mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 block">
                          📋 Kloon voor volgende periode
                        </span>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {quote.validUntil
                            ? `Nieuwe offerte wordt aangemaakt met geldigheidsdatum ${new Date(
                                new Date(quote.validUntil).getTime() +
                                  30 * 24 * 60 * 60 * 1000
                              ).toLocaleDateString(
                                "nl-NL"
                              )} (+30 dagen vanaf huidige geldigheidsdatum)`
                            : "Nieuwe offerte wordt aangemaakt voor volgende maand (status: Concept)"}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAcceptQuote}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                    >
                      ✓ Accepteren
                    </button>
                    <button
                      onClick={() => {
                        setShowAcceptQuoteModal(false);
                        setQuoteToAccept(null);
                        setCloneOnAccept(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 🆕 CLONE QUOTE MODAL */}
      {showCloneQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto p-4 sm:p-6 sm:my-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral">
                📋 Offerte Clonen
              </h2>
              <button
                onClick={() => setShowCloneQuoteModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Alle velden zijn aanpasbaar. Het nieuwe
                offerte krijgt automatisch een uniek Q-nummer en de datum wordt
                op vandaag gezet.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klant *
                </label>
                <select
                  value={newQuote.customerId}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, customerId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BTW Tarief (%)
                  </label>
                  <input
                    type="number"
                    value={newQuote.vatRate}
                    onChange={(e) =>
                      setNewQuote({
                        ...newQuote,
                        vatRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Geldig Tot *
                  </label>
                  <input
                    type="date"
                    value={newQuote.validUntil}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, validUntil: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notities
                </label>
                <textarea
                  value={newQuote.notes}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Extra opmerkingen..."
                />
              </div>

              {newQuote.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotaal:</span>
                    <span className="font-semibold">
                      €{calculateQuoteTotals().subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      BTW ({newQuote.vatRate}%):
                    </span>
                    <span className="font-semibold">
                      €{calculateQuoteTotals().vatAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Totaal:</span>
                    <span className="text-primary">
                      €{calculateQuoteTotals().total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveClonedQuote}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                ✓ Gecloneerde Offerte Opslaan
              </button>
              <button
                onClick={() => setShowCloneQuoteModal(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 CLONE INVOICE MODAL */}
      {showCloneInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto p-4 sm:p-6 sm:my-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral">
                📋 Factuur Clonen
              </h2>
              <button
                onClick={() => setShowCloneInvoiceModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> De nieuwe factuur krijgt automatisch
                een nieuw factuurnummer en de datum wordt op vandaag gezet.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klant *
                </label>
                <select
                  value={newInvoice.customerId}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, customerId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Factuurdatum *
                  </label>
                  <input
                    type="date"
                    value={newInvoice.issueDate}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        issueDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vervaldatum *
                  </label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BTW Tarief (%)
                  </label>
                  <input
                    type="number"
                    value={newInvoice.vatRate}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        vatRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Betalingstermijn
                  </label>
                  <input
                    type="text"
                    value={newInvoice.paymentTerms}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="14 dagen"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notities
                </label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Extra opmerkingen..."
                />
              </div>

              {newInvoice.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotaal:</span>
                    <span className="font-semibold">
                      €{calculateInvoiceTotals().subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      BTW ({newInvoice.vatRate}%):
                    </span>
                    <span className="font-semibold">
                      €{calculateInvoiceTotals().vatAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Totaal:</span>
                    <span className="text-primary">
                      €{calculateInvoiceTotals().total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <div className="flex gap-3">
                <button
                  onClick={handleSaveClonedInvoice}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  ✓ Gecloneerde Factuur Opslaan
                </button>
                <button
                  onClick={() => setShowCloneInvoiceModal(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
              <button
                onClick={handleSaveClonedInvoiceAndSendToWorkOrder}
                className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                📤 Opslaan en naar Werkorder Sturen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
        <button
          onClick={() => {
            setActiveTab("dashboard");
            setDashboardView(null);
          }}
          className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            activeTab === "dashboard"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            activeTab === "transactions"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          💰 Transacties
        </button>
        <button
          onClick={() => setActiveTab("quotes")}
          className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            activeTab === "quotes"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📋 Offertes
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
            activeTab === "invoices"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🧾 Facturen
        </button>
      </div>

      {/* Back to Dashboard button (when not on dashboard) */}
      {activeTab !== "dashboard" && (
        <button
          onClick={() => {
            setActiveTab("dashboard");
            setDashboardView(null);
          }}
          className="flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Terug naar Dashboard
        </button>
      )}

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <AccountingDashboard
          invoices={invoices}
          quotes={quotes}
          transactions={transactions}
          customers={customers}
          onNavigate={(view, data) => {
            setDashboardView(view);
            if (view === "invoices") {
              setActiveTab("invoices");
              if (data?.overviewType) {
                setOverviewType(data.overviewType);
                setShowOverviewModal(true);
              }
            } else if (view === "quotes") {
              setActiveTab("quotes");
              if (data?.overviewType) {
                setQuotesOverviewType(data.overviewType);
                setShowQuotesOverviewModal(true);
              }
            } else {
              setActiveTab(view as "transactions" | "quotes" | "invoices");
            }
          }}
        />
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totale Inkomsten</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    €{totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totale Uitgaven</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    €{totalExpense.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Netto Winst</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    €{netProfit.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilter("income")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === "income"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Inkomsten
            </button>
            <button
              onClick={() => setFilter("expense")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Uitgaven
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Beschrijving
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Bedrag
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type === "income" ? "Inkomst" : "Uitgave"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-semibold text-right ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}€
                      {Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Quotes Tab - Existing content continues here... */}
      {activeTab === "quotes" && (
        <>
          {/* 📧 Email Parsing Integration */}
          {isAdmin && (
            <div className="mb-6">
              <QuoteEmailIntegration
                customers={customers}
                onQuoteCreated={(quote) => {
                  setQuotes([...quotes, quote]);
                  alert(
                    `✅ Offerte ${quote.id} succesvol aangemaakt vanuit email!`
                  );
                }}
              />
            </div>
          )}

          {
            /* Quote Statistics */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <button
                  onClick={() => openQuotesOverviewModal("all")}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Totaal Geoffreerd</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        €{totalQuoted.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {quotes.length} offertes
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => openQuotesOverviewModal("approved")}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Geaccepteerd</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        €{totalApproved.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {approvedQuotes.length} offertes
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => openQuotesOverviewModal("sent")}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Verzonden</p>
                      <p className="text-2xl font-bold text-orange-600 mt-1">
                        €{totalSent.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {sentQuotes.length} offertes
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📤</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => openQuotesOverviewModal("expired")}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Verlopen</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        €{totalExpired.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {expiredQuotes.length} offertes
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="text-sm text-gray-600">
                  Totaal: {quotes.length} offertes
                  {batchMode && selectedQuotes.length > 0 && (
                    <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {selectedQuotes.length} geselecteerd
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setBatchMode(!batchMode);
                          if (batchMode) {
                            setSelectedQuotes([]);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          batchMode
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {batchMode ? "✓ Selectie Modus" : "☐ Batch Selectie"}
                      </button>
                      {batchMode && selectedQuotes.length > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Bulk convert to work orders
                              const approvedQuotes = quotes.filter(
                                (q) =>
                                  selectedQuotes.includes(q.id) &&
                                  q.status === "approved" &&
                                  !q.workOrderId
                              );
                              if (approvedQuotes.length === 0) {
                                alert(
                                  "Geen geaccepteerde offertes zonder werkorder geselecteerd!"
                                );
                                return;
                              }
                              if (
                                confirm(
                                  `Wil je ${approvedQuotes.length} offerte(s) omzetten naar werkorders?`
                                )
                              ) {
                                approvedQuotes.forEach((q) =>
                                  convertQuoteToWorkOrder(q.id)
                                );
                                setSelectedQuotes([]);
                                setBatchMode(false);
                              }
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            📋 Maak Werkorders (
                            {
                              selectedQuotes.filter((id) => {
                                const q = quotes.find((qu) => qu.id === id);
                                return (
                                  q?.status === "approved" && !q.workOrderId
                                );
                              }).length
                            }
                            )
                          </button>
                          <button
                            onClick={() => {
                              // Bulk status update
                              const draftQuotes = quotes.filter(
                                (q) =>
                                  selectedQuotes.includes(q.id) &&
                                  q.status === "draft"
                              );
                              if (draftQuotes.length > 0) {
                                if (
                                  confirm(
                                    `Wil je ${draftQuotes.length} concept offerte(s) verzenden?`
                                  )
                                ) {
                                  draftQuotes.forEach((q) =>
                                    updateQuoteStatus(q.id, "sent")
                                  );
                                  setSelectedQuotes([]);
                                  setBatchMode(false);
                                }
                              }
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            📤 Verzend (
                            {
                              selectedQuotes.filter((id) => {
                                const q = quotes.find((qu) => qu.id === id);
                                return q?.status === "draft";
                              }).length
                            }
                            )
                          </button>
                          <button
                            onClick={() => {
                              setSelectedQuotes([]);
                              setBatchMode(false);
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Annuleren
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => setShowQuoteForm(!showQuoteForm)}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                      >
                        + Nieuwe Offerte
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          }
          {showQuoteForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">
                Nieuwe Offerte
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select
                  value={newQuote.customerId}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, customerId: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant *</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newQuote.validUntil}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, validUntil: e.target.value })
                  }
                  placeholder="Geldig tot *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    BTW:
                  </label>
                  <input
                    type="number"
                    value={newQuote.vatRate}
                    onChange={(e) =>
                      setNewQuote({
                        ...newQuote,
                        vatRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    step="0.1"
                  />
                  <span className="text-gray-600">%</span>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">Items</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddInventoryItem}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      + Uit Voorraad
                    </button>
                    <button
                      onClick={handleAddCustomItem}
                      className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                    >
                      + Custom Item
                    </button>
                  </div>
                </div>

                {/* 🆕 V5.7: Category Filter & Search - Always Visible Above Items */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Category Filter Dropdown */}
                    <div
                      className="relative flex-shrink-0"
                      style={{ minWidth: "180px", maxWidth: "250px" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowInventoryCategoryDropdown(
                            !showInventoryCategoryDropdown
                          );
                          setInventoryCategorySearchTerm("");
                        }}
                        className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm ${
                          inventoryCategoryFilter
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {inventoryCategoryFilter
                              ? categories.find(
                                  (c) => c.id === inventoryCategoryFilter
                                )?.name || "Categorie"
                              : "🏷️ Categorie..."}
                          </span>
                          <span className="text-xs">▼</span>
                        </div>
                      </button>

                      {showInventoryCategoryDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() =>
                              setShowInventoryCategoryDropdown(false)
                            }
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-gray-200">
                              <input
                                type="text"
                                placeholder="Zoek categorie..."
                                value={inventoryCategorySearchTerm}
                                onChange={(e) =>
                                  setInventoryCategorySearchTerm(e.target.value)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto max-h-48">
                              <button
                                type="button"
                                onClick={() => {
                                  setInventoryCategoryFilter("");
                                  setShowInventoryCategoryDropdown(false);
                                  setInventoryCategorySearchTerm("");
                                }}
                                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors ${
                                  !inventoryCategoryFilter
                                    ? "bg-blue-50 font-semibold"
                                    : ""
                                }`}
                              >
                                <span className="text-gray-600">
                                  Alle categorieën
                                </span>
                              </button>
                              {filteredInventoryCategories.map((category) => (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => {
                                    setInventoryCategoryFilter(category.id);
                                    setShowInventoryCategoryDropdown(false);
                                    setInventoryCategorySearchTerm("");
                                  }}
                                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                                    inventoryCategoryFilter === category.id
                                      ? "bg-blue-50 font-semibold"
                                      : ""
                                  }`}
                                >
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        category.color || "#3B82F6",
                                    }}
                                  />
                                  <span>{category.name}</span>
                                  <span className="ml-auto text-xs text-gray-500">
                                    (
                                    {
                                      inventory.filter(
                                        (i) => i.categoryId === category.id
                                      ).length
                                    }
                                    )
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Clear filter button */}
                    {inventoryCategoryFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          setInventoryCategoryFilter("");
                          setInventoryCategorySearchTerm("");
                        }}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ✕ Wis
                      </button>
                    )}

                    {/* Search input */}
                    <input
                      type="text"
                      placeholder="Zoek op naam, SKU, categorie..."
                      value={inventorySearchTerm}
                      onChange={(e) => setInventorySearchTerm(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {newQuote.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
                  >
                    {item.inventoryItemId !== undefined ? (
                      <div className="col-span-5 space-y-2">
                        {/* 🆕 V5.7: Category Filter & Search */}
                        {categories.length > 0 && (
                          <div className="flex gap-2">
                            <div
                              className="relative flex-1"
                              style={{ minWidth: "150px" }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setShowInventoryCategoryDropdown(
                                    !showInventoryCategoryDropdown
                                  );
                                  setInventoryCategorySearchTerm("");
                                }}
                                className={`w-full px-3 py-1.5 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-xs ${
                                  inventoryCategoryFilter
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs">
                                    {inventoryCategoryFilter
                                      ? categories.find(
                                          (c) =>
                                            c.id === inventoryCategoryFilter
                                        )?.name || "Categorie"
                                      : "🏷️ Categorie"}
                                  </span>
                                  <span className="text-xs">▼</span>
                                </div>
                              </button>

                              {showInventoryCategoryDropdown && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() =>
                                      setShowInventoryCategoryDropdown(false)
                                    }
                                  />
                                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                    <div className="p-2 border-b border-gray-200">
                                      <input
                                        type="text"
                                        placeholder="Zoek categorie..."
                                        value={inventoryCategorySearchTerm}
                                        onChange={(e) =>
                                          setInventoryCategorySearchTerm(
                                            e.target.value
                                          )
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                        autoFocus
                                      />
                                    </div>
                                    <div className="overflow-y-auto max-h-48">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInventoryCategoryFilter("");
                                          setShowInventoryCategoryDropdown(
                                            false
                                          );
                                          setInventoryCategorySearchTerm("");
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors ${
                                          !inventoryCategoryFilter
                                            ? "bg-blue-50 font-semibold"
                                            : ""
                                        }`}
                                      >
                                        <span className="text-gray-600">
                                          Alle categorieën
                                        </span>
                                      </button>
                                      {filteredInventoryCategories.map(
                                        (category) => (
                                          <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => {
                                              setInventoryCategoryFilter(
                                                category.id
                                              );
                                              setShowInventoryCategoryDropdown(
                                                false
                                              );
                                              setInventoryCategorySearchTerm(
                                                ""
                                              );
                                            }}
                                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                                              inventoryCategoryFilter ===
                                              category.id
                                                ? "bg-blue-50 font-semibold"
                                                : ""
                                            }`}
                                          >
                                            <div
                                              className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                              style={{
                                                backgroundColor:
                                                  category.color || "#3B82F6",
                                              }}
                                            />
                                            <span>{category.name}</span>
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            {inventoryCategoryFilter && (
                              <button
                                type="button"
                                onClick={() => {
                                  setInventoryCategoryFilter("");
                                  setInventoryCategorySearchTerm("");
                                }}
                                className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        )}

                        {/* Inventory dropdown */}
                        <select
                          value={item.inventoryItemId}
                          onChange={(e) =>
                            handleInventoryItemChange(index, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Selecteer voorraad item</option>
                          {filteredInventoryForSelection.map((i) => {
                            const price = i.price || i.salePrice || 0;
                            return (
                              <option key={i.id} value={i.id}>
                                {i.name} ({i.autoSku || i.sku}) - €
                                {price.toFixed(2)}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Beschrijving"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="Aantal"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Prijs/stuk"
                      value={item.pricePerUnit}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "pricePerUnit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                      disabled={!!item.inventoryItemId}
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{item.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Labor Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">
                    Werkuren (optioneel)
                  </h3>
                  <button
                    onClick={handleAddLabor}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    + Werkuren Toevoegen
                  </button>
                </div>

                {newQuote.labor.map((labor, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Beschrijving werkzaamheden"
                      value={labor.description}
                      onChange={(e) =>
                        handleLaborChange(index, "description", e.target.value)
                      }
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Uren"
                      value={labor.hours}
                      onChange={(e) =>
                        handleLaborChange(
                          index,
                          "hours",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.5"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Uurtarief"
                      value={labor.hourlyRate}
                      onChange={(e) =>
                        handleLaborChange(
                          index,
                          "hourlyRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{labor.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveLabor(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <textarea
                placeholder="Notities (optioneel)"
                value={newQuote.notes}
                onChange={(e) =>
                  setNewQuote({ ...newQuote, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />

              {/* Totals Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotaal (excl. BTW):</span>
                  <span className="font-semibold">
                    €{calculateQuoteTotals().subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>BTW ({newQuote.vatRate}%):</span>
                  <span className="font-semibold">
                    €{calculateQuoteTotals().vatAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary border-t pt-2">
                  <span>Totaal (incl. BTW):</span>
                  <span>€{calculateQuoteTotals().total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateQuote}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  {editingQuoteId ? "Offerte Bijwerken" : "Offerte Aanmaken"}
                </button>
                <button
                  onClick={() => {
                    setShowQuoteForm(false);
                    setEditingQuoteId(null);
                    setNewQuote({
                      customerId: "",
                      items: [],
                      labor: [],
                      vatRate: 21,
                      notes: "",
                      validUntil: "",
                    });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Quotes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quotes.map((quote) => {
              const workOrder = getWorkOrderStatus(quote.workOrderId);
              const workOrderBadge = getWorkOrderBadge(workOrder);
              const isCompleted = workOrder?.status === "Completed";
              const isSelected = selectedQuotes.includes(quote.id);

              return (
                <div
                  key={quote.id}
                  className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                    isCompleted ? "border-l-4 border-green-500" : ""
                  } ${
                    batchMode && isSelected
                      ? "ring-4 ring-blue-500 border-blue-500"
                      : batchMode
                      ? "hover:ring-2 hover:ring-gray-300"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    {batchMode && (
                      <div className="mr-3 mt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuotes([...selectedQuotes, quote.id]);
                            } else {
                              setSelectedQuotes(
                                selectedQuotes.filter((id) => id !== quote.id)
                              );
                            }
                          }}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-neutral">
                        {quote.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getCustomerName(quote.customerId)}
                      </p>
                      {workOrderBadge && (
                        <button
                          onClick={() => {
                            // Navigate to work orders - we'll implement this via route
                            alert(`Werkorder ID: ${quote.workOrderId}`);
                          }}
                          className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border-2 ${workOrderBadge.color} hover:opacity-80 transition-opacity cursor-pointer`}
                          title="Klik om naar werkorder te gaan"
                        >
                          {workOrderBadge.icon} {workOrderBadge.text}
                        </button>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getQuoteStatusColor(
                        quote.status
                      )}`}
                    >
                      {quote.status === "draft" && "Concept"}
                      {quote.status === "sent" && "Verzonden"}
                      {quote.status === "approved" && "Geaccepteerd"}
                      {quote.status === "rejected" && "Afgewezen"}
                      {quote.status === "expired" && "Verlopen"}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Items:
                    </h4>
                    {quote.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.inventoryItemId
                            ? getInventoryItemName(item.inventoryItemId)
                            : item.description}
                          <span className="text-gray-500">
                            {" "}
                            (×{item.quantity})
                          </span>
                        </span>
                        <span className="font-medium">
                          €{item.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Labor */}
                  {quote.labor && quote.labor.length > 0 && (
                    <div className="space-y-2 mb-3 border-t pt-3">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Werkuren:
                      </h4>
                      {quote.labor.map((labor, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            {labor.description}
                            <span className="text-gray-500">
                              {" "}
                              ({labor.hours}u @ €{labor.hourlyRate}/u)
                            </span>
                          </span>
                          <span className="font-medium">
                            €{labor.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Totals */}
                  <div className="border-t pt-3 mb-4 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotaal (excl. BTW):</span>
                      <span>€{quote.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>BTW ({quote.vatRate}%):</span>
                      <span>€{quote.vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold text-neutral">
                        Totaal (incl. BTW):
                      </span>
                      <span className="text-xl font-bold text-primary">
                        €{quote.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Aangemaakt: {quote.createdDate}</span>
                    <span>Geldig tot: {quote.validUntil}</span>
                  </div>

                  {quote.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">{quote.notes}</p>
                    </div>
                  )}

                  {/* Visual Pipeline Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between relative mb-2">
                      {/* Progress Bar Background */}
                      <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 rounded-full -translate-y-1/2 z-0"></div>
                      {/* Progress Bar Fill */}
                      <div
                        className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full -translate-y-1/2 z-0 transition-all duration-500"
                        style={{
                          width: `${(() => {
                            let progress = 0;
                            if (
                              quote.status === "approved" ||
                              quote.status === "sent"
                            )
                              progress = 25;
                            if (quote.workOrderId) progress = 50;
                            const invoice = invoices.find(
                              (inv) =>
                                inv.quoteId === quote.id ||
                                inv.workOrderId === quote.workOrderId
                            );
                            if (invoice) progress = 75;
                            if (invoice?.status === "paid") progress = 100;
                            return progress;
                          })()}%`,
                        }}
                      ></div>

                      {/* Pipeline Steps */}
                      <div className="relative z-10 flex items-center justify-between w-full">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                              quote.status === "approved" ||
                              quote.status === "sent"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          >
                            {quote.status === "approved" ||
                            quote.status === "sent"
                              ? "✓"
                              : "1"}
                          </div>
                          <span className="text-xs text-gray-600 mt-1 text-center">
                            Offerte
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                              quote.workOrderId ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            {quote.workOrderId ? "✓" : "2"}
                          </div>
                          <span className="text-xs text-gray-600 mt-1 text-center">
                            Werkorder
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                              invoices.find(
                                (inv) =>
                                  inv.quoteId === quote.id ||
                                  inv.workOrderId === quote.workOrderId
                              )
                                ? "bg-purple-500"
                                : "bg-gray-300"
                            }`}
                          >
                            {invoices.find(
                              (inv) =>
                                inv.quoteId === quote.id ||
                                inv.workOrderId === quote.workOrderId
                            )
                              ? "✓"
                              : "3"}
                          </div>
                          <span className="text-xs text-gray-600 mt-1 text-center">
                            Factuur
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                              invoices.find(
                                (inv) =>
                                  inv.quoteId === quote.id ||
                                  inv.workOrderId === quote.workOrderId
                              )?.status === "paid"
                                ? "bg-green-600"
                                : "bg-gray-300"
                            }`}
                          >
                            {invoices.find(
                              (inv) =>
                                inv.quoteId === quote.id ||
                                inv.workOrderId === quote.workOrderId
                            )?.status === "paid"
                              ? "✓"
                              : "4"}
                          </div>
                          <span className="text-xs text-gray-600 mt-1 text-center">
                            Betaald
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Order Status Info for Completed */}
                  {isCompleted && workOrder && (
                    <div className="p-3 bg-green-50 rounded-lg mb-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-green-700">
                          Werkorder Voltooid
                        </span>
                      </div>
                      {workOrder.hoursSpent !== undefined &&
                        workOrder.estimatedHours && (
                          <p className="text-xs text-gray-700">
                            ⏱️ Gewerkt: {workOrder.hoursSpent}u (Geschat:{" "}
                            {workOrder.estimatedHours}u)
                            {workOrder.hoursSpent !==
                              workOrder.estimatedHours && (
                              <span
                                className={`ml-2 font-semibold ${
                                  workOrder.hoursSpent <=
                                  workOrder.estimatedHours * 1.1
                                    ? "text-green-600"
                                    : workOrder.hoursSpent <=
                                      workOrder.estimatedHours * 1.25
                                    ? "text-orange-600"
                                    : "text-red-600"
                                }`}
                              >
                                (
                                {Math.round(
                                  (workOrder.hoursSpent /
                                    workOrder.estimatedHours) *
                                    100
                                )}
                                %)
                              </span>
                            )}
                          </p>
                        )}
                    </div>
                  )}

                  {/* Editable notification for active workorders */}
                  {quote.workOrderId &&
                    workOrder &&
                    workOrder.status !== "Completed" &&
                    isAdmin && (
                      <div className="p-3 bg-blue-50 rounded-lg mb-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-xs font-medium text-blue-800">
                              ✏️ Deze offerte is gekoppeld aan een actieve
                              werkorder. Wijzigingen worden automatisch
                              gesynchroniseerd.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {isAdmin && (
                    <div className="flex gap-2 flex-wrap">
                      {quote.status === "draft" && (
                        <button
                          onClick={() => updateQuoteStatus(quote.id, "sent")}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Verzenden
                        </button>
                      )}
                      {quote.status === "sent" && (
                        <>
                          <button
                            onClick={() => {
                              setQuoteToAccept(quote.id);
                              setCloneOnAccept(false);
                              setShowAcceptQuoteModal(true);
                            }}
                            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            Accepteren
                          </button>
                          <button
                            onClick={() =>
                              updateQuoteStatus(quote.id, "rejected")
                            }
                            className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Afwijzen
                          </button>
                        </>
                      )}
                      {quote.status === "approved" && !quote.workOrderId && (
                        <button
                          onClick={() => convertQuoteToWorkOrder(quote.id)}
                          className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 font-semibold"
                        >
                          📋 Maak Werkorder
                        </button>
                      )}
                      {quote.status === "approved" && (
                        <button
                          onClick={() => convertQuoteToInvoice(quote.id)}
                          className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 font-semibold"
                        >
                          🧾 Omzetten naar Factuur
                        </button>
                      )}
                      <button
                        onClick={() => handleCloneQuote(quote.id)}
                        className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 font-semibold"
                        title="Offerte clonen"
                      >
                        📋 Clonen
                      </button>
                      <button
                        onClick={() => deleteQuote(quote.id)}
                        className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        Verwijder
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {quotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen offertes gevonden</p>
            </div>
          )}
        </>
      )}

      {/* NEW: Invoices Tab */}
      {activeTab === "invoices" && (
        <>
          {/* Invoice Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => openOverviewModal("all")}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totaal Gefactureerd</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    €{totalInvoiced.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🧾</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => openOverviewModal("paid")}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Betaald</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    €{totalPaid.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {paidInvoices.length} facturen
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => openOverviewModal("outstanding")}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uitstaand</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    €{totalOutstanding.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {outstandingInvoices.length} facturen
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => openOverviewModal("overdue")}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verlopen</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    €{totalOverdue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {overdueInvoices.length} facturen
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Totaal: {invoices.length} facturen
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Factuur
              </button>
            )}
          </div>

          {/* Add Invoice Form - Similar to Quote form */}
          {showInvoiceForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">
                Nieuwe Factuur
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <select
                  value={newInvoice.customerId}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, customerId: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecteer klant *</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newInvoice.issueDate}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, issueDate: e.target.value })
                  }
                  placeholder="Factuurdatum *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                  }
                  placeholder="Vervaldatum *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Betalingstermijn"
                  value={newInvoice.paymentTerms}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      paymentTerms: e.target.value,
                    })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Items Section - Same as Quote */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">Items</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddInvoiceInventoryItem}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      + Uit Voorraad
                    </button>
                    <button
                      onClick={handleAddInvoiceCustomItem}
                      className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                    >
                      + Custom Item
                    </button>
                  </div>
                </div>

                {/* 🆕 V5.7: Category Filter & Search - Always Visible Above Items (Same as Quote) */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Category Filter Dropdown */}
                    <div
                      className="relative flex-shrink-0"
                      style={{ minWidth: "180px", maxWidth: "250px" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowInventoryCategoryDropdown(
                            !showInventoryCategoryDropdown
                          );
                          setInventoryCategorySearchTerm("");
                        }}
                        className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm ${
                          inventoryCategoryFilter
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {inventoryCategoryFilter
                              ? categories.find(
                                  (c) => c.id === inventoryCategoryFilter
                                )?.name || "Categorie"
                              : "🏷️ Categorie..."}
                          </span>
                          <span className="text-xs">▼</span>
                        </div>
                      </button>

                      {showInventoryCategoryDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() =>
                              setShowInventoryCategoryDropdown(false)
                            }
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-gray-200">
                              <input
                                type="text"
                                placeholder="Zoek categorie..."
                                value={inventoryCategorySearchTerm}
                                onChange={(e) =>
                                  setInventoryCategorySearchTerm(e.target.value)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto max-h-48">
                              <button
                                type="button"
                                onClick={() => {
                                  setInventoryCategoryFilter("");
                                  setShowInventoryCategoryDropdown(false);
                                  setInventoryCategorySearchTerm("");
                                }}
                                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors ${
                                  !inventoryCategoryFilter
                                    ? "bg-blue-50 font-semibold"
                                    : ""
                                }`}
                              >
                                <span className="text-gray-600">
                                  Alle categorieën
                                </span>
                              </button>
                              {filteredInventoryCategories.map((category) => (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => {
                                    setInventoryCategoryFilter(category.id);
                                    setShowInventoryCategoryDropdown(false);
                                    setInventoryCategorySearchTerm("");
                                  }}
                                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                                    inventoryCategoryFilter === category.id
                                      ? "bg-blue-50 font-semibold"
                                      : ""
                                  }`}
                                >
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        category.color || "#3B82F6",
                                    }}
                                  />
                                  <span>{category.name}</span>
                                  <span className="ml-auto text-xs text-gray-500">
                                    (
                                    {
                                      inventory.filter(
                                        (i) => i.categoryId === category.id
                                      ).length
                                    }
                                    )
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Clear filter button */}
                    {inventoryCategoryFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          setInventoryCategoryFilter("");
                          setInventoryCategorySearchTerm("");
                        }}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ✕ Wis
                      </button>
                    )}

                    {/* Search input */}
                    <input
                      type="text"
                      placeholder="Zoek op naam, SKU, categorie..."
                      value={inventorySearchTerm}
                      onChange={(e) => setInventorySearchTerm(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {newInvoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
                  >
                    {item.inventoryItemId !== undefined ? (
                      <div className="col-span-5 space-y-2">
                        {/* 🆕 V5.7: Category Filter & Search (same as quote form) */}
                        {categories.length > 0 && (
                          <div className="flex gap-2">
                            <div
                              className="relative flex-1"
                              style={{ minWidth: "150px" }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setShowInventoryCategoryDropdown(
                                    !showInventoryCategoryDropdown
                                  );
                                  setInventoryCategorySearchTerm("");
                                }}
                                className={`w-full px-3 py-1.5 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-xs ${
                                  inventoryCategoryFilter
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs">
                                    {inventoryCategoryFilter
                                      ? categories.find(
                                          (c) =>
                                            c.id === inventoryCategoryFilter
                                        )?.name || "Categorie"
                                      : "🏷️ Categorie"}
                                  </span>
                                  <span className="text-xs">▼</span>
                                </div>
                              </button>

                              {showInventoryCategoryDropdown && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() =>
                                      setShowInventoryCategoryDropdown(false)
                                    }
                                  />
                                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                    <div className="p-2 border-b border-gray-200">
                                      <input
                                        type="text"
                                        placeholder="Zoek categorie..."
                                        value={inventoryCategorySearchTerm}
                                        onChange={(e) =>
                                          setInventoryCategorySearchTerm(
                                            e.target.value
                                          )
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                        autoFocus
                                      />
                                    </div>
                                    <div className="overflow-y-auto max-h-48">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInventoryCategoryFilter("");
                                          setShowInventoryCategoryDropdown(
                                            false
                                          );
                                          setInventoryCategorySearchTerm("");
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors ${
                                          !inventoryCategoryFilter
                                            ? "bg-blue-50 font-semibold"
                                            : ""
                                        }`}
                                      >
                                        <span className="text-gray-600">
                                          Alle categorieën
                                        </span>
                                      </button>
                                      {filteredInventoryCategories.map(
                                        (category) => (
                                          <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => {
                                              setInventoryCategoryFilter(
                                                category.id
                                              );
                                              setShowInventoryCategoryDropdown(
                                                false
                                              );
                                              setInventoryCategorySearchTerm(
                                                ""
                                              );
                                            }}
                                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                                              inventoryCategoryFilter ===
                                              category.id
                                                ? "bg-blue-50 font-semibold"
                                                : ""
                                            }`}
                                          >
                                            <div
                                              className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                              style={{
                                                backgroundColor:
                                                  category.color || "#3B82F6",
                                              }}
                                            />
                                            <span>{category.name}</span>
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            {inventoryCategoryFilter && (
                              <button
                                type="button"
                                onClick={() => {
                                  setInventoryCategoryFilter("");
                                  setInventoryCategorySearchTerm("");
                                }}
                                className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        )}

                        {/* Inventory dropdown */}
                        <select
                          value={item.inventoryItemId}
                          onChange={(e) =>
                            handleInvoiceInventoryItemChange(
                              index,
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Selecteer voorraad item</option>
                          {filteredInventoryForSelection.map((i) => {
                            const price = i.price || i.salePrice || 0;
                            return (
                              <option key={i.id} value={i.id}>
                                {i.name} ({i.autoSku || i.sku}) - €
                                {price.toFixed(2)}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Beschrijving"
                        value={item.description}
                        onChange={(e) =>
                          handleInvoiceItemChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="Aantal"
                      value={item.quantity}
                      onChange={(e) =>
                        handleInvoiceItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Prijs/stuk"
                      value={item.pricePerUnit}
                      onChange={(e) =>
                        handleInvoiceItemChange(
                          index,
                          "pricePerUnit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                      disabled={!!item.inventoryItemId}
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{item.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveInvoiceItem(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Labor Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral">
                    Werkuren (optioneel)
                  </h3>
                  <button
                    onClick={handleAddInvoiceLabor}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                  >
                    + Werkuren Toevoegen
                  </button>
                </div>

                {newInvoice.labor.map((labor, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Beschrijving werkzaamheden"
                      value={labor.description}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Uren"
                      value={labor.hours}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "hours",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.5"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Uurtarief"
                      value={labor.hourlyRate}
                      onChange={(e) =>
                        handleInvoiceLaborChange(
                          index,
                          "hourlyRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                    />
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      €{labor.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveInvoiceLabor(index)}
                      className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <textarea
                placeholder="Notities (optioneel)"
                value={newInvoice.notes}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />

              {/* Totals Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotaal (excl. BTW):</span>
                  <span className="font-semibold">
                    €{calculateInvoiceTotals().subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>BTW ({newInvoice.vatRate}%):</span>
                  <span className="font-semibold">
                    €{calculateInvoiceTotals().vatAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary border-t pt-2">
                  <span>Totaal (incl. BTW):</span>
                  <span>€{calculateInvoiceTotals().total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateInvoice}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  {editingInvoiceId ? "Factuur Bijwerken" : "Factuur Aanmaken"}
                </button>
                <button
                  onClick={() => {
                    setShowInvoiceForm(false);
                    setEditingInvoiceId(null);
                    setNewInvoice({
                      customerId: "",
                      items: [],
                      labor: [],
                      vatRate: 21,
                      notes: "",
                      paymentTerms: "14 dagen",
                      issueDate: "",
                      dueDate: "",
                    });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Invoices Header - Batch Operations */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Totaal: {invoices.length} facturen
              {batchMode && selectedInvoices.length > 0 && (
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {selectedInvoices.length} geselecteerd
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setBatchMode(!batchMode);
                      if (batchMode) {
                        setSelectedInvoices([]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      batchMode
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {batchMode ? "✓ Selectie Modus" : "☐ Batch Selectie"}
                  </button>
                  {batchMode && selectedInvoices.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Bulk mark as paid
                          const unpaidInvoices = invoices.filter(
                            (inv) =>
                              selectedInvoices.includes(inv.id) &&
                              inv.status !== "paid"
                          );
                          if (unpaidInvoices.length === 0) {
                            alert("Geen onbetaalde facturen geselecteerd!");
                            return;
                          }
                          if (
                            confirm(
                              `Wil je ${unpaidInvoices.length} factuur(en) als betaald markeren?`
                            )
                          ) {
                            unpaidInvoices.forEach((inv) => {
                              const updatedInvoice = {
                                ...inv,
                                status: "paid" as const,
                                paidDate: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                history: [
                                  ...(inv.history || []),
                                  {
                                    timestamp: new Date().toISOString(),
                                    action: "paid" as const,
                                    performedBy:
                                      currentUser.id || currentUser.name,
                                    details: `Status gewijzigd van ${inv.status} naar betaald`,
                                    fromStatus: inv.status,
                                    toStatus: "paid" as const,
                                  } as InvoiceHistoryEntry,
                                ],
                              };
                              setInvoices(
                                invoices.map((i) =>
                                  i.id === inv.id ? updatedInvoice : i
                                )
                              );
                            });
                            setSelectedInvoices([]);
                            setBatchMode(false);
                          }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        ✅ Markeer Betaald (
                        {
                          selectedInvoices.filter((id) => {
                            const inv = invoices.find((i) => i.id === id);
                            return inv?.status !== "paid";
                          }).length
                        }
                        )
                      </button>
                      <button
                        onClick={() => {
                          // Bulk send drafts
                          const draftInvoices = invoices.filter(
                            (inv) =>
                              selectedInvoices.includes(inv.id) &&
                              inv.status === "draft"
                          );
                          if (draftInvoices.length > 0) {
                            if (
                              confirm(
                                `Wil je ${draftInvoices.length} concept factuur(en) verzenden?`
                              )
                            ) {
                              draftInvoices.forEach((inv) => {
                                const updatedInvoice = {
                                  ...inv,
                                  status: "sent" as const,
                                  history: [
                                    ...(inv.history || []),
                                    {
                                      timestamp: new Date().toISOString(),
                                      action: "sent" as const,
                                      performedBy:
                                        currentUser.id || currentUser.name,
                                      details:
                                        "Status gewijzigd van concept naar verzonden",
                                      fromStatus: "draft" as const,
                                      toStatus: "sent" as const,
                                    } as InvoiceHistoryEntry,
                                  ],
                                };
                                setInvoices(
                                  invoices.map((i) =>
                                    i.id === inv.id ? updatedInvoice : i
                                  )
                                );
                                trackAction(
                                  currentUser.id || currentUser.name,
                                  currentUser.role || "user",
                                  ModuleKey.ACCOUNTING,
                                  "invoice_status_updated",
                                  "update",
                                  {
                                    invoiceId: inv.id,
                                    fromStatus: "draft",
                                    toStatus: "sent",
                                  }
                                );
                              });
                              setSelectedInvoices([]);
                              setBatchMode(false);
                            }
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        📤 Verzend (
                        {
                          selectedInvoices.filter((id) => {
                            const inv = invoices.find((i) => i.id === id);
                            return inv?.status === "draft";
                          }).length
                        }
                        )
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoices([]);
                          setBatchMode(false);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Annuleren
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                  >
                    + Nieuwe Factuur
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Invoices Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {invoices
              .filter((invoice) => invoice.status !== "paid") // 🆕 V5.6: Verberg betaalde facturen (zichtbaar in Boekhouding & Dossier)
              .map((invoice) => {
                const workOrder = getWorkOrderStatus(invoice.workOrderId);
                const workOrderBadge = getWorkOrderBadge(workOrder);
                const isCompleted = workOrder?.status === "Completed";
                const hasOverdue = invoice.status === "overdue";
                const isSelected = selectedInvoices.includes(invoice.id);

                return (
                  <div
                    key={invoice.id}
                    className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                      hasOverdue
                        ? "border-l-4 border-red-500"
                        : isCompleted
                        ? "border-l-4 border-green-500"
                        : ""
                    } ${
                      batchMode && isSelected
                        ? "ring-4 ring-blue-500 border-blue-500"
                        : batchMode
                        ? "hover:ring-2 hover:ring-gray-300"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      {batchMode && (
                        <div className="mr-3 mt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices([
                                  ...selectedInvoices,
                                  invoice.id,
                                ]);
                              } else {
                                setSelectedInvoices(
                                  selectedInvoices.filter(
                                    (id) => id !== invoice.id
                                  )
                                );
                              }
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-neutral">
                          {invoice.invoiceNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getCustomerName(invoice.customerId)}
                        </p>
                        {invoice.quoteId && (
                          <p className="text-xs text-blue-600 mt-1">
                            Van offerte: {invoice.quoteId}
                          </p>
                        )}
                        {workOrderBadge && (
                          <button
                            onClick={() => {
                              alert(`Werkorder ID: ${invoice.workOrderId}`);
                            }}
                            className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border-2 ${workOrderBadge.color} hover:opacity-80 transition-opacity cursor-pointer`}
                            title="Klik om naar werkorder te gaan"
                          >
                            {workOrderBadge.icon} {workOrderBadge.text}
                          </button>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getInvoiceStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status === "draft" && "Concept"}
                        {invoice.status === "sent" && "Verzonden"}
                        {invoice.status === "paid" && "Betaald"}
                        {invoice.status === "overdue" && "Verlopen"}
                        {invoice.status === "cancelled" && "Geannuleerd"}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Items:
                      </h4>
                      {invoice.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            {item.inventoryItemId
                              ? getInventoryItemName(item.inventoryItemId)
                              : item.description}
                            <span className="text-gray-500">
                              {" "}
                              (×{item.quantity})
                            </span>
                          </span>
                          <span className="font-medium">
                            €{item.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Labor */}
                    {invoice.labor && invoice.labor.length > 0 && (
                      <div className="space-y-2 mb-3 border-t pt-3">
                        <h4 className="text-sm font-semibold text-gray-700">
                          Werkuren:
                        </h4>
                        {invoice.labor.map((labor, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {labor.description}
                              <span className="text-gray-500">
                                {" "}
                                ({labor.hours}u @ €{labor.hourlyRate}/u)
                              </span>
                            </span>
                            <span className="font-medium">
                              €{labor.total.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Totals */}
                    <div className="border-t pt-3 mb-4 space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotaal (excl. BTW):</span>
                        <span>€{invoice.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>BTW ({invoice.vatRate}%):</span>
                        <span>€{invoice.vatAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold text-neutral">
                          Totaal (incl. BTW):
                        </span>
                        <span className="text-xl font-bold text-primary">
                          €{invoice.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>Factuurdatum: {invoice.issueDate}</span>
                      <span>Vervaldatum: {invoice.dueDate}</span>
                    </div>

                    {/* 🆕 V5.6: Reminder Information */}
                    {invoice.reminders && invoice.status === "sent" && (
                      <div className="p-3 bg-blue-50 rounded-lg mb-4 border-l-4 border-blue-400">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">
                          📅 Herinneringsplanning
                        </h4>
                        <div className="space-y-2">
                          {invoice.reminders.reminder1Date && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-blue-700">
                                Herinnering 1:{" "}
                                {new Date(
                                  invoice.reminders.reminder1Date
                                ).toLocaleDateString("nl-NL")}
                              </span>
                              {invoice.reminders.reminder1Sent ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                  ✓ Verzonden{" "}
                                  {invoice.reminders.reminder1SentDate
                                    ? new Date(
                                        invoice.reminders.reminder1SentDate
                                      ).toLocaleDateString("nl-NL")
                                    : ""}
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleSendReminder(invoice.id, 1)
                                  }
                                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors"
                                >
                                  📧 Herinnering nu sturen
                                </button>
                              )}
                            </div>
                          )}
                          {invoice.reminders.reminder2Date && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-blue-700">
                                Herinnering 2:{" "}
                                {new Date(
                                  invoice.reminders.reminder2Date
                                ).toLocaleDateString("nl-NL")}
                              </span>
                              {invoice.reminders.reminder2Sent ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                  ✓ Verzonden{" "}
                                  {invoice.reminders.reminder2SentDate
                                    ? new Date(
                                        invoice.reminders.reminder2SentDate
                                      ).toLocaleDateString("nl-NL")
                                    : ""}
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleSendReminder(invoice.id, 2)
                                  }
                                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold transition-colors"
                                >
                                  📧 Herinnering nu sturen
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          💡 Template: "Betreft factuur {invoice.invoiceNumber}{" "}
                          – vriendelijke herinnering"
                        </p>
                      </div>
                    )}

                    {invoice.paidDate && (
                      <div className="p-3 bg-green-50 rounded-lg mb-4">
                        <p className="text-sm text-green-700 font-medium">
                          ✓ Betaald op: {invoice.paidDate}
                        </p>
                      </div>
                    )}

                    {invoice.paymentTerms && (
                      <div className="text-xs text-gray-500 mb-4">
                        Betalingstermijn: {invoice.paymentTerms}
                      </div>
                    )}

                    {invoice.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">{invoice.notes}</p>
                      </div>
                    )}

                    {/* Tip 4: Warning banner for auto-generated invoices */}
                    {invoice.status === "draft" &&
                      isAutoGeneratedInvoice(invoice) && (
                        <div className="p-4 bg-yellow-50 rounded-lg mb-4 border-l-4 border-yellow-400">
                          <div className="flex items-start gap-3">
                            <svg
                              className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                                ⚠️ Automatisch aangemaakte factuur
                              </h4>
                              <p className="text-xs text-yellow-700 mb-2">
                                Deze factuur is automatisch aangemaakt na
                                voltooiing van een werkorder. Controleer{" "}
                                <strong>gewerkte uren</strong>,{" "}
                                <strong>materialen</strong> en voeg eventueel{" "}
                                <strong>meerwerk</strong> toe voordat u
                                verzendt.
                              </p>
                              {workOrder && (
                                <div className="mt-2 text-xs">
                                  <button
                                    onClick={() =>
                                      handleEditInvoice(invoice.id)
                                    }
                                    className="text-yellow-800 underline hover:text-yellow-900 font-medium"
                                  >
                                    ✏️ Bewerk factuur om te controleren
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Work Order Status Info for Completed */}
                    {isCompleted && workOrder && (
                      <div className="p-3 bg-green-50 rounded-lg mb-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm font-semibold text-green-700">
                            Werkorder Voltooid
                          </span>
                        </div>
                        {workOrder.hoursSpent !== undefined &&
                          workOrder.estimatedHours && (
                            <p className="text-xs text-gray-700">
                              ⏱️ Gewerkt: {workOrder.hoursSpent}u (Geschat:{" "}
                              {workOrder.estimatedHours}u)
                              {workOrder.hoursSpent !==
                                workOrder.estimatedHours && (
                                <span
                                  className={`ml-2 font-semibold ${
                                    workOrder.hoursSpent <=
                                    workOrder.estimatedHours * 1.1
                                      ? "text-green-600"
                                      : workOrder.hoursSpent <=
                                        workOrder.estimatedHours * 1.25
                                      ? "text-orange-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  (
                                  {Math.round(
                                    (workOrder.hoursSpent /
                                      workOrder.estimatedHours) *
                                      100
                                  )}
                                  %)
                                </span>
                              )}
                            </p>
                          )}
                      </div>
                    )}

                    {/* Editable notification for active workorders */}
                    {invoice.workOrderId &&
                      workOrder &&
                      workOrder.status !== "Completed" &&
                      isAdmin && (
                        <div className="p-3 bg-blue-50 rounded-lg mb-4 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-xs font-medium text-blue-800">
                                ✏️ Deze factuur is gekoppeld aan een actieve
                                werkorder. Wijzigingen worden automatisch
                                gesynchroniseerd.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {isAdmin && (
                      <div className="flex gap-2 flex-wrap">
                        {invoice.status === "draft" && (
                          <button
                            onClick={() =>
                              updateInvoiceStatus(invoice.id, "sent")
                            }
                            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Verzenden
                          </button>
                        )}
                        {(invoice.status === "sent" ||
                          invoice.status === "draft") &&
                          !invoice.workOrderId && (
                            <button
                              onClick={() =>
                                convertInvoiceToWorkOrder(invoice.id)
                              }
                              className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 font-semibold"
                            >
                              📋 Maak Werkorder
                            </button>
                          )}
                        {(invoice.status === "sent" ||
                          invoice.status === "overdue") && (
                          <button
                            onClick={() =>
                              updateInvoiceStatus(invoice.id, "paid")
                            }
                            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            ✓ Markeer als Betaald
                          </button>
                        )}
                        {invoice.status !== "paid" &&
                          invoice.status !== "cancelled" && (
                            <button
                              onClick={() =>
                                updateInvoiceStatus(invoice.id, "cancelled")
                              }
                              className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                            >
                              Annuleren
                            </button>
                          )}
                        <button
                          onClick={() => handleCloneInvoice(invoice.id)}
                          className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 font-semibold"
                          title="Factuur clonen"
                        >
                          📋 Clonen
                        </button>
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Verwijder
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {invoices.filter((invoice) => invoice.status !== "paid").length ===
            0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">
                Geen openstaande facturen
              </p>
              <p className="text-sm text-gray-400">
                Betaalde facturen zijn verplaatst naar{" "}
                <span className="font-semibold text-primary">
                  Boekhouding & Dossier
                </span>
              </p>
            </div>
          )}
        </>
      )}

      {/* Tip 4: Invoice Validation Modal */}
      {showInvoiceValidationModal && invoiceToValidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-3xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral flex items-center gap-2">
                <span>⚠️</span>
                <span>Factuur Validatie Voordat Verzenden</span>
              </h2>
              <button
                onClick={() => {
                  setShowInvoiceValidationModal(false);
                  setInvoiceToValidate(null);
                  setValidationChecklist({
                    hoursChecked: false,
                    materialsChecked: false,
                    extraWorkAdded: false,
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Warning Message */}
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Belangrijk:</strong> Deze factuur is automatisch
                  aangemaakt na voltooiing van een werkorder. Controleer alle
                  gegevens zorgvuldig voordat u naar de klant verzendt.
                </p>
              </div>

              {/* Comparison Section */}
              {(() => {
                const workOrder = getWorkOrderForInvoice(invoiceToValidate.id);
                if (!workOrder) return null;

                const estimatedHours = workOrder.estimatedHours || 0;
                const actualHours = workOrder.hoursSpent || 0;
                const estimatedCost =
                  invoiceToValidate.estimatedCost ||
                  workOrder.estimatedCost ||
                  0;
                const actualCost = invoiceToValidate.total;

                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral">
                      Vergelijking: Geschat vs Werkelijk
                    </h3>

                    {/* Hours Comparison */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        ⏱️ Werkuren
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Geschat</p>
                          <p className="text-lg font-bold text-blue-600">
                            {estimatedHours}u
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Gewerkt</p>
                          <p
                            className={`text-lg font-bold ${
                              actualHours <= estimatedHours * 1.1
                                ? "text-green-600"
                                : actualHours <= estimatedHours * 1.25
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            {actualHours}u
                          </p>
                          {estimatedHours > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              (
                              {Math.round((actualHours / estimatedHours) * 100)}
                              % van geschat)
                            </p>
                          )}
                        </div>
                      </div>
                      {estimatedHours > 0 &&
                        actualHours > estimatedHours * 1.1 && (
                          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                            ⚠️ Meerdere uren gewerkt dan geschat. Overweeg
                            meerwerk facturering.
                          </div>
                        )}
                    </div>

                    {/* Cost Comparison */}
                    {estimatedCost > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          💰 Kosten
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600">
                              Geschat Totaal
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              €{estimatedCost.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">
                              Factuur Totaal
                            </p>
                            <p
                              className={`text-lg font-bold ${
                                actualCost <= estimatedCost * 1.1
                                  ? "text-green-600"
                                  : actualCost <= estimatedCost * 1.2
                                  ? "text-orange-600"
                                  : "text-red-600"
                              }`}
                            >
                              €{actualCost.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              ({actualCost > estimatedCost ? "+" : ""}€
                              {(actualCost - estimatedCost).toFixed(2)})
                            </p>
                          </div>
                        </div>
                        {actualCost > estimatedCost * 1.1 && (
                          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                            ⚠️ Factuurbedrag is hoger dan geschat. Controleer
                            items en meerwerk.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Materials Summary */}
                    {invoiceToValidate.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          📦 Materialen
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {invoiceToValidate.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0"
                            >
                              <span className="text-gray-700">
                                {item.description}
                              </span>
                              <span className="font-medium text-gray-900">
                                {item.quantity}x €{item.pricePerUnit.toFixed(2)}{" "}
                                = €{item.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-300">
                          <p className="text-sm font-semibold text-gray-700">
                            Subtotaal Materialen: €
                            {invoiceToValidate.items
                              .reduce((sum, item) => sum + item.total, 0)
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Labor Summary */}
                    {invoiceToValidate.labor &&
                      invoiceToValidate.labor.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            👷 Werkuren
                          </h4>
                          <div className="space-y-2">
                            {invoiceToValidate.labor.map((labor, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0"
                              >
                                <span className="text-gray-700">
                                  {labor.description}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {labor.hours}u × €
                                  {labor.hourlyRate.toFixed(2)}/u = €
                                  {labor.total.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-300">
                            <p className="text-sm font-semibold text-gray-700">
                              Subtotaal Werkuren: €
                              {invoiceToValidate.labor
                                .reduce((sum, labor) => sum + labor.total, 0)
                                .toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                );
              })()}

              {/* Validation Checklist */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-neutral mb-4">
                  ✅ Validatie Checklist
                </h3>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={validationChecklist.hoursChecked}
                      onChange={(e) =>
                        setValidationChecklist({
                          ...validationChecklist,
                          hoursChecked: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        ⏱️ Uren gecontroleerd (gewerkte uren vs geschat)
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Controleer of de gewerkte uren kloppen en of meerwerk
                        nodig is
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={validationChecklist.materialsChecked}
                      onChange={(e) =>
                        setValidationChecklist({
                          ...validationChecklist,
                          materialsChecked: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        📦 Materialen gecontroleerd
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Controleer of alle gebruikte materialen zijn opgenomen
                        tegen juiste prijzen
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={validationChecklist.extraWorkAdded}
                      onChange={(e) =>
                        setValidationChecklist({
                          ...validationChecklist,
                          extraWorkAdded: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">
                        ➕ Meerwerk toegevoegd (indien nodig)
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Indien er extra werk is uitgevoerd, is dit toegevoegd
                        aan de factuur
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  ⚡ Snelle Acties
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleEditInvoice(invoiceToValidate.id)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    ✏️ Factuur Bewerken
                  </button>
                  <button
                    onClick={() => {
                      if (invoiceToValidate.workOrderId) {
                        const wo = workOrders.find(
                          (w) => w.id === invoiceToValidate.workOrderId
                        );
                        if (wo) {
                          alert(
                            `Werkorder ID: ${wo.id}\nTitel: ${wo.title}\nStatus: ${wo.status}`
                          );
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    📋 Bekijk Werkorder
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={confirmInvoiceValidation}
                  disabled={
                    !validationChecklist.hoursChecked ||
                    !validationChecklist.materialsChecked
                  }
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    validationChecklist.hoursChecked &&
                    validationChecklist.materialsChecked
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  ✓ Validatie Voltooid - Factuur Verzenden
                </button>
                <button
                  onClick={() => {
                    setShowInvoiceValidationModal(false);
                    setInvoiceToValidate(null);
                    setValidationChecklist({
                      hoursChecked: false,
                      materialsChecked: false,
                      extraWorkAdded: false,
                    });
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Accounting = React.memo(AccountingComponent);
