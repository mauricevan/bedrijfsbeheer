/**
 * WorkOrders Hook - Filtered Work Orders
 * Hook for filtering and grouping work orders
 */

import { useMemo } from "react";
import { WorkOrder, WorkOrderStatus, Employee } from "../../../types";
import { calculateWorkOrderStats } from "../utils/calculations";

export interface UseFilteredWorkOrdersParams {
  workOrders: WorkOrder[];
  viewingUserId: string;
  statusFilter: WorkOrderStatus | null;
  isAdmin: boolean;
  employees: Employee[];
}

export interface GroupedWorkOrders {
  [employeeId: string]: {
    employee: Employee;
    workOrders: WorkOrder[];
    stats: {
      total: number;
      toDo: number;
      inProgress: number;
      pending: number;
      completed: number;
    };
  };
}

export interface UseFilteredWorkOrdersReturn {
  filteredWorkOrders: WorkOrder[];
  groupedWorkOrders: GroupedWorkOrders | null;
  statsBase: {
    total: number;
    toDo: number;
    inProgress: number;
    pending: number;
    completed: number;
  };
  stats: {
    total: number;
    toDo: number;
    inProgress: number;
    pending: number;
    completed: number;
  };
}

/**
 * Custom hook for filtering and grouping work orders
 */
export const useFilteredWorkOrders = (
  params: UseFilteredWorkOrdersParams
): UseFilteredWorkOrdersReturn => {
  const { workOrders, viewingUserId, statusFilter, isAdmin, employees } =
    params;

  // Filter work orders based on viewing user and status filter
  const filteredWorkOrders = useMemo(() => {
    let filtered;
    if (isAdmin && viewingUserId === "all") {
      filtered = workOrders;
    } else {
      filtered = workOrders.filter(
        (order) => order.assignedTo === viewingUserId
      );
    }

    // Apply status filter if set
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Sort by sortIndex (lowest first), fallback to creation date
    return filtered.sort((a, b) => {
      const indexA = a.sortIndex ?? 999999;
      const indexB = b.sortIndex ?? 999999;
      if (indexA !== indexB) {
        return indexA - indexB;
      }
      // If same index, sort by creation date
      return (
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      );
    });
  }, [workOrders, viewingUserId, isAdmin, statusFilter]);

  // Group work orders by employee when viewing all
  const groupedWorkOrders = useMemo(() => {
    if (!isAdmin || viewingUserId !== "all") {
      return null;
    }

    // Filter by status if filter is active
    let filtered = workOrders;
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Group by employee
    const grouped: GroupedWorkOrders = {};

    filtered.forEach((order) => {
      const employeeId = order.assignedTo;
      if (!grouped[employeeId]) {
        const employee = employees.find((e) => e.id === employeeId);
        if (employee) {
          grouped[employeeId] = {
            employee,
            workOrders: [],
            stats: {
              total: 0,
              toDo: 0,
              inProgress: 0,
              pending: 0,
              completed: 0,
            },
          };
        }
      }

      if (grouped[employeeId]) {
        grouped[employeeId].workOrders.push(order);
      }
    });

    // Calculate stats for each employee and sort work orders
    Object.keys(grouped).forEach((employeeId) => {
      const group = grouped[employeeId];
      group.stats = calculateWorkOrderStats(group.workOrders);

      // Sort work orders by sortIndex
      group.workOrders.sort((a, b) => {
        const indexA = a.sortIndex ?? 999999;
        const indexB = b.sortIndex ?? 999999;
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        return (
          new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
        );
      });
    });

    return grouped;
  }, [workOrders, viewingUserId, isAdmin, statusFilter, employees]);

  // Calculate base stats (all work orders without status filter)
  const statsBase = useMemo(() => {
    let filtered;
    if (isAdmin && viewingUserId === "all") {
      filtered = workOrders;
    } else {
      filtered = workOrders.filter(
        (order) => order.assignedTo === viewingUserId
      );
    }

    return calculateWorkOrderStats(filtered);
  }, [workOrders, viewingUserId, isAdmin]);

  // Calculate stats with status filter applied
  const stats = useMemo(() => {
    if (statusFilter) {
      return calculateWorkOrderStats(filteredWorkOrders);
    }
    return statsBase;
  }, [filteredWorkOrders, statsBase, statusFilter]);

  return {
    filteredWorkOrders,
    groupedWorkOrders,
    statsBase,
    stats,
  };
};
