import type { Transaction } from "../../../types";

/**
 * Group transactions by month
 * @param transactions - Array of transactions
 * @returns Object with transactions grouped by month (YYYY-MM format)
 */
export const groupTransactionsByMonth = (
  transactions: Transaction[]
): Record<string, Transaction[]> => {
  const grouped: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    // Extract year-month from date (assuming format YYYY-MM-DD)
    const monthKey = transaction.date.substring(0, 7); // "YYYY-MM"
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(transaction);
  });

  return grouped;
};

/**
 * Group transactions by type
 * @param transactions - Array of transactions
 * @returns Object with transactions grouped by type
 */
export const groupTransactionsByType = (
  transactions: Transaction[]
): { income: Transaction[]; expense: Transaction[] } => {
  return {
    income: transactions.filter((t) => t.type === "income"),
    expense: transactions.filter((t) => t.type === "expense"),
  };
};

/**
 * Sort transactions by date (newest first)
 * @param transactions - Array of transactions
 * @returns Sorted array of transactions
 */
export const sortTransactionsByDateDesc = (
  transactions: Transaction[]
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Descending order (newest first)
  });
};

/**
 * Sort transactions by date (oldest first)
 * @param transactions - Array of transactions
 * @returns Sorted array of transactions
 */
export const sortTransactionsByDateAsc = (
  transactions: Transaction[]
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB; // Ascending order (oldest first)
  });
};

/**
 * Sort transactions by amount (highest first)
 * @param transactions - Array of transactions
 * @returns Sorted array of transactions
 */
export const sortTransactionsByAmountDesc = (
  transactions: Transaction[]
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    return Math.abs(b.amount) - Math.abs(a.amount); // Descending order
  });
};

/**
 * Sort transactions by amount (lowest first)
 * @param transactions - Array of transactions
 * @returns Sorted array of transactions
 */
export const sortTransactionsByAmountAsc = (
  transactions: Transaction[]
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    return Math.abs(a.amount) - Math.abs(b.amount); // Ascending order
  });
};

/**
 * Get transactions for a specific date range
 * @param transactions - Array of transactions
 * @param startDate - Start date (YYYY-MM-DD format)
 * @param endDate - End date (YYYY-MM-DD format)
 * @returns Filtered array of transactions within date range
 */
export const getTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] => {
  return transactions.filter((transaction) => {
    const transactionDate = transaction.date;
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Get transactions for a specific month
 * @param transactions - Array of transactions
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 * @returns Filtered array of transactions for the specified month
 */
export const getTransactionsByMonth = (
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] => {
  const monthStr = String(month).padStart(2, "0");
  const yearMonth = `${year}-${monthStr}`;
  
  return transactions.filter((transaction) => {
    return transaction.date.startsWith(yearMonth);
  });
};

/**
 * Get transactions for a specific year
 * @param transactions - Array of transactions
 * @param year - Year (YYYY)
 * @returns Filtered array of transactions for the specified year
 */
export const getTransactionsByYear = (
  transactions: Transaction[],
  year: number
): Transaction[] => {
  return transactions.filter((transaction) => {
    return transaction.date.startsWith(String(year));
  });
};

