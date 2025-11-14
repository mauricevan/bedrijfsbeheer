/**
 * WorkOrders Utility Functions - Calculations
 * Pure calculation functions for work orders
 */

import { WorkOrder, QuoteItem, QuoteLabor } from "../../../types";

/**
 * Get the next available sort index for a work order
 */
export const getNextSortIndex = (
  workOrders: WorkOrder[],
  employeeId?: string
): number => {
  if (workOrders.length === 0) return 1;

  // Filter by employee if provided
  const relevantOrders = employeeId
    ? workOrders.filter((wo) => wo.assignedTo === employeeId)
    : workOrders;

  if (relevantOrders.length === 0) return 1;

  const maxIndex = Math.max(
    ...relevantOrders.map((wo) => wo.sortIndex || 0)
  );
  return maxIndex + 1;
};

/**
 * Calculate totals for items and labor
 */
export const calculateTotals = (
  items: QuoteItem[],
  labor: QuoteLabor[],
  vatRate: number
): {
  subtotal: number;
  vatAmount: number;
  total: number;
  itemsSubtotal: number;
  laborSubtotal: number;
} => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = labor.reduce((sum, labor) => sum + labor.total, 0);
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return { subtotal, vatAmount, total, itemsSubtotal, laborSubtotal };
};

/**
 * Calculate item total based on quantity and price
 */
export const calculateItemTotal = (
  quantity: number,
  pricePerUnit: number
): number => {
  return quantity * pricePerUnit;
};

/**
 * Calculate labor total based on hours and hourly rate
 */
export const calculateLaborTotal = (
  hours: number,
  hourlyRate: number
): number => {
  return hours * hourlyRate;
};

/**
 * Calculate work order statistics for a set of work orders
 */
export const calculateWorkOrderStats = (
  workOrders: WorkOrder[]
): {
  total: number;
  toDo: number;
  inProgress: number;
  pending: number;
  completed: number;
} => {
  return {
    total: workOrders.length,
    toDo: workOrders.filter((wo) => wo.status === "To Do").length,
    inProgress: workOrders.filter((wo) => wo.status === "In Progress").length,
    pending: workOrders.filter((wo) => wo.status === "Pending").length,
    completed: workOrders.filter((wo) => wo.status === "Completed").length,
  };
};
