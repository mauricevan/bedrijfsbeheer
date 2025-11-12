import { useState, useMemo } from "react";
import type { Transaction } from "../../../types";
import { filterTransactions } from "../utils/filters";

/**
 * Hook for managing transaction filtering
 * @param transactions - Array of transactions
 * @returns Transaction filter state and filtered transactions
 */
export const useTransactions = (transactions: Transaction[]) => {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filter);
  }, [transactions, filter]);

  return {
    filter,
    setFilter,
    filteredTransactions,
    transactions,
  };
};

