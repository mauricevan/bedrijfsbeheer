/**
 * Auto-Assignment Utility for Work Orders
 *
 * Lean Six Sigma Optimization: Eliminates manual employee selection modal
 * by automatically assigning work orders to employees based on:
 * 1. Current workload (# of active work orders)
 * 2. Availability status
 * 3. Total estimated hours
 *
 * Expected savings: 100-200 hours/year (1-2 min per conversion × 100+ conversions)
 */

import type { Employee, WorkOrder } from "../types";

export interface AssignmentScore {
  employeeId: string;
  score: number;
  workload: number;
  totalHours: number;
  reason: string;
}

/**
 * Calculate employee workload metrics
 */
function calculateWorkload(
  employeeId: string,
  workOrders: WorkOrder[]
): { activeCount: number; totalHours: number } {
  const employeeWorkOrders = workOrders.filter(
    (wo) =>
      wo.assignedTo === employeeId &&
      (wo.status === "To Do" || wo.status === "In Progress")
  );

  const activeCount = employeeWorkOrders.length;
  const totalHours = employeeWorkOrders.reduce(
    (sum, wo) => sum + (wo.estimatedHours || 0),
    0
  );

  return { activeCount, totalHours };
}

/**
 * Score employees for assignment (lower score = better candidate)
 * Scoring algorithm:
 * - Base score: number of active work orders × 10
 * - Add: total estimated hours
 * - Penalty: unavailable (+1000), on vacation (+2000)
 */
function scoreEmployee(
  employee: Employee,
  workOrders: WorkOrder[]
): AssignmentScore {
  const { activeCount, totalHours } = calculateWorkload(employee.id, workOrders);

  let score = activeCount * 10 + totalHours;
  let reason = `${activeCount} active work orders, ${totalHours.toFixed(1)}h total`;

  // Apply availability penalties
  if (employee.availability === "unavailable") {
    score += 1000;
    reason += " (unavailable)";
  } else if (employee.availability === "vacation") {
    score += 2000;
    reason += " (on vacation)";
  }

  return {
    employeeId: employee.id,
    score,
    workload: activeCount,
    totalHours,
    reason,
  };
}

/**
 * Auto-assign work order to the best available employee
 * Returns the employee ID of the best candidate
 *
 * @param employees - List of all employees
 * @param workOrders - List of all work orders
 * @param excludeEmployeeIds - Optional list of employee IDs to exclude
 * @returns Employee ID or null if no suitable employee found
 */
export function autoAssignEmployee(
  employees: Employee[],
  workOrders: WorkOrder[],
  excludeEmployeeIds: string[] = []
): string | null {
  // Filter out excluded employees and ensure we have valid candidates
  const candidates = employees.filter(
    (emp) => !excludeEmployeeIds.includes(emp.id)
  );

  if (candidates.length === 0) {
    return null;
  }

  // Score all candidates
  const scores = candidates.map((emp) => scoreEmployee(emp, workOrders));

  // Sort by score (lowest = best)
  scores.sort((a, b) => a.score - b.score);

  // Return the best candidate
  return scores[0].employeeId;
}

/**
 * Get assignment recommendations with detailed scoring
 * Useful for debugging or showing user why assignment was made
 */
export function getAssignmentRecommendations(
  employees: Employee[],
  workOrders: WorkOrder[],
  topN: number = 3
): AssignmentScore[] {
  const scores = employees.map((emp) => scoreEmployee(emp, workOrders));
  scores.sort((a, b) => a.score - b.score);
  return scores.slice(0, topN);
}

/**
 * Check if an employee is overloaded
 * Returns true if employee has more than threshold work orders or hours
 */
export function isEmployeeOverloaded(
  employeeId: string,
  workOrders: WorkOrder[],
  maxWorkOrders: number = 10,
  maxHours: number = 80
): boolean {
  const { activeCount, totalHours } = calculateWorkload(employeeId, workOrders);
  return activeCount >= maxWorkOrders || totalHours >= maxHours;
}

/**
 * Get workload summary for all employees
 * Useful for dashboard/reporting
 */
export function getWorkloadSummary(
  employees: Employee[],
  workOrders: WorkOrder[]
): Array<{
  employeeId: string;
  employeeName: string;
  activeWorkOrders: number;
  totalHours: number;
  availability: string;
}> {
  return employees.map((emp) => {
    const { activeCount, totalHours } = calculateWorkload(emp.id, workOrders);
    return {
      employeeId: emp.id,
      employeeName: emp.name,
      activeWorkOrders: activeCount,
      totalHours,
      availability: emp.availability || "available",
    };
  });
}
