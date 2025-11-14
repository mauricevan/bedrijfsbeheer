/**
 * WorkOrders Services - Work Order Operations
 * Business logic for CRUD operations on work orders
 */

import {
  WorkOrder,
  WorkOrderStatus,
  Employee,
  InventoryItem,
  User,
  ModuleKey,
} from "../../../types";
import { trackAction, trackTaskCompletion } from "../../../utils/analytics";
import { getNextSortIndex } from "../utils/calculations";
import { getEmployeeName } from "../utils/formatters";

export interface CreateWorkOrderParams {
  title: string;
  description: string;
  assignedTo: string;
  customerId?: string;
  location?: string;
  scheduledDate?: string;
  pendingReason?: string;
  sortIndex?: number;
  showPendingReason: boolean;
  requiredMaterials: { itemId: string; quantity: number }[];
  currentUser: User;
  employees: Employee[];
  workOrders: WorkOrder[];
}

export interface UpdateWorkOrderParams {
  workOrder: WorkOrder;
  currentUser: User;
  employees: Employee[];
  workOrders: WorkOrder[];
}

/**
 * Create a new work order
 */
export const createWorkOrder = (
  params: CreateWorkOrderParams
): { workOrder: WorkOrder } => {
  const {
    title,
    description,
    assignedTo,
    customerId,
    location,
    scheduledDate,
    pendingReason,
    sortIndex,
    showPendingReason,
    requiredMaterials,
    currentUser,
    employees,
    workOrders,
  } = params;

  const now = new Date().toISOString();

  const workOrder: WorkOrder = {
    id: `wo${Date.now()}`,
    title,
    description,
    status: showPendingReason ? "Pending" : "To Do",
    assignedTo,
    assignedBy: currentUser.employeeId,
    requiredInventory: requiredMaterials,
    createdDate: new Date().toISOString().split("T")[0],
    customerId: customerId || undefined,
    location: location || undefined,
    scheduledDate: scheduledDate || undefined,
    pendingReason: showPendingReason ? pendingReason || undefined : undefined,
    sortIndex:
      sortIndex !== undefined && sortIndex > 0
        ? sortIndex
        : getNextSortIndex(workOrders, assignedTo),
    timestamps: {
      created: now,
      assigned: now,
    },
    history: [
      {
        timestamp: now,
        action: "created",
        performedBy: currentUser.employeeId,
        details: `Werkorder aangemaakt door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )}`,
      },
      {
        timestamp: now,
        action: "assigned",
        performedBy: currentUser.employeeId,
        details: `Toegewezen aan ${getEmployeeName(
          assignedTo,
          employees
        )} door ${getEmployeeName(currentUser.employeeId, employees)}`,
        toAssignee: assignedTo,
      },
    ],
  };

  // Track analytics
  trackAction(
    currentUser.employeeId,
    currentUser.role,
    ModuleKey.WORK_ORDERS,
    "create_workorder",
    "create",
    {
      workOrderId: workOrder.id,
      customerId: workOrder.customerId,
      assignedTo: workOrder.assignedTo,
      status: workOrder.status,
      materialsCount: workOrder.requiredInventory.length,
    }
  );

  return { workOrder };
};

/**
 * Update an existing work order
 */
export const updateWorkOrder = (
  params: UpdateWorkOrderParams
): { updatedWorkOrder: WorkOrder; conflictingWorkOrder?: WorkOrder } => {
  const { workOrder: editingOrder, currentUser, employees, workOrders } =
    params;

  const now = new Date().toISOString();
  const oldOrder = workOrders.find((wo) => wo.id === editingOrder.id);

  let updatedOrder = { ...editingOrder };
  let conflictingWorkOrder: WorkOrder | undefined;

  // Check if sortIndex changed and handle swap/reorder
  if (
    oldOrder &&
    oldOrder.sortIndex !== editingOrder.sortIndex &&
    editingOrder.sortIndex !== undefined
  ) {
    const newIndex = editingOrder.sortIndex;

    // Find if there's a conflict with another work order of the same employee
    const conflictingOrder = workOrders.find(
      (wo) =>
        wo.id !== editingOrder.id &&
        wo.assignedTo === editingOrder.assignedTo &&
        wo.sortIndex === newIndex
    );

    if (conflictingOrder) {
      // Find the next available index for the conflicting order
      const employeeOrders = workOrders.filter(
        (wo) =>
          wo.assignedTo === editingOrder.assignedTo &&
          wo.id !== editingOrder.id
      );
      const usedIndices = employeeOrders.map((wo) => wo.sortIndex || 0);
      const maxIndex = Math.max(...usedIndices, 0);
      const nextAvailableIndex = maxIndex + 1;

      // Create updated conflicting order
      conflictingWorkOrder = {
        ...conflictingOrder,
        sortIndex: nextAvailableIndex,
        history: [
          ...(conflictingOrder.history || []),
          {
            timestamp: now,
            action: "reordered",
            performedBy: currentUser.employeeId,
            details: `Indexnummer automatisch aangepast van #${
              conflictingOrder.sortIndex
            } naar #${nextAvailableIndex} (conflictresolutie door ${getEmployeeName(
              currentUser.employeeId,
              employees
            )})`,
          },
        ],
      };

      // Add history entry to the edited order about the swap
      updatedOrder.history = [
        ...(updatedOrder.history || []),
        {
          timestamp: now,
          action: "reordered",
          performedBy: currentUser.employeeId,
          details: `Indexnummer gewijzigd van #${
            oldOrder.sortIndex
          } naar #${newIndex} door ${getEmployeeName(
            currentUser.employeeId,
            employees
          )} (werkorder #${
            conflictingOrder.sortIndex
          } opgeschoven naar #${nextAvailableIndex})`,
        },
      ];
    } else {
      // No conflict, just add a simple reorder entry
      updatedOrder.history = [
        ...(updatedOrder.history || []),
        {
          timestamp: now,
          action: "reordered",
          performedBy: currentUser.employeeId,
          details: `Indexnummer gewijzigd van #${
            oldOrder.sortIndex || "auto"
          } naar #${newIndex} door ${getEmployeeName(
            currentUser.employeeId,
            employees
          )}`,
        },
      ];
    }
  }

  // Check if assignee changed
  if (oldOrder && oldOrder.assignedTo !== editingOrder.assignedTo) {
    updatedOrder.history = [
      ...(updatedOrder.history || []),
      {
        timestamp: now,
        action: "assigned",
        performedBy: currentUser.employeeId,
        details: `Opnieuw toegewezen van ${getEmployeeName(
          oldOrder.assignedTo,
          employees
        )} naar ${getEmployeeName(
          editingOrder.assignedTo,
          employees
        )} door ${getEmployeeName(currentUser.employeeId, employees)}`,
        fromAssignee: oldOrder.assignedTo,
        toAssignee: editingOrder.assignedTo,
      },
    ];

    // Update assigned timestamp
    if (!updatedOrder.timestamps) {
      updatedOrder.timestamps = { created: updatedOrder.createdDate };
    } else {
      updatedOrder.timestamps = { ...updatedOrder.timestamps };
    }
    updatedOrder.timestamps.assigned = now;
  }

  // Clear pendingReason if status is not Pending
  updatedOrder.pendingReason =
    updatedOrder.status === "Pending"
      ? updatedOrder.pendingReason
      : undefined;

  return { updatedWorkOrder: updatedOrder, conflictingWorkOrder };
};

/**
 * Update work order status
 */
export const updateWorkOrderStatus = (
  workOrder: WorkOrder,
  newStatus: WorkOrderStatus,
  currentUser: User,
  employees: Employee[]
): WorkOrder => {
  const now = new Date().toISOString();
  const oldStatus = workOrder.status;

  const updates: Partial<WorkOrder> = {
    status: newStatus,
    history: [
      ...(workOrder.history || []),
      {
        timestamp: now,
        action: "status_changed",
        performedBy: currentUser.employeeId,
        details: `Status gewijzigd van "${oldStatus}" naar "${newStatus}" door ${getEmployeeName(
          currentUser.employeeId,
          employees
        )}`,
        fromStatus: oldStatus,
        toStatus: newStatus,
      },
    ],
  };

  // Update timestamps
  if (!workOrder.timestamps) {
    updates.timestamps = { created: workOrder.createdDate };
  } else {
    updates.timestamps = { ...workOrder.timestamps };
  }

  if (newStatus === "In Progress" && !updates.timestamps.started) {
    updates.timestamps.started = now;
  }

  if (newStatus === "Completed") {
    updates.completedDate = new Date().toISOString().split("T")[0];
    updates.timestamps.completed = now;
  }

  // Clear pendingReason if moving away from Pending status
  if (newStatus !== "Pending") {
    updates.pendingReason = undefined;
  }

  return { ...workOrder, ...updates };
};

/**
 * Update work order hours spent
 */
export const updateWorkOrderHours = (
  workOrder: WorkOrder,
  hours: number
): WorkOrder => {
  return {
    ...workOrder,
    hoursSpent: hours,
  };
};

/**
 * Delete a work order (returns null if deletion is confirmed)
 */
export const deleteWorkOrder = (): boolean => {
  return confirm("Weet je zeker dat je deze werkorder wilt verwijderen?");
};

/**
 * Track status change analytics
 */
export const trackStatusChange = (
  workOrder: WorkOrder,
  fromStatus: WorkOrderStatus,
  toStatus: WorkOrderStatus,
  currentUser: User
): void => {
  trackAction(
    currentUser.employeeId,
    currentUser.role,
    ModuleKey.WORK_ORDERS,
    `update_status_${toStatus.toLowerCase().replace(" ", "_")}`,
    "update",
    {
      workOrderId: workOrder.id,
      fromStatus,
      toStatus,
    }
  );
};

/**
 * Track task completion analytics
 */
export const trackWorkOrderCompletion = (
  workOrder: WorkOrder,
  currentUser: User
): void => {
  const duration = workOrder.timestamps?.started
    ? Date.now() - new Date(workOrder.timestamps.started).getTime()
    : 0;

  trackTaskCompletion(
    currentUser.employeeId,
    currentUser.role,
    ModuleKey.WORK_ORDERS,
    "workorder",
    duration,
    true,
    []
  );
};

/**
 * Deduct inventory after work order completion
 */
export const deductInventory = (
  workOrder: WorkOrder,
  inventory: InventoryItem[]
): InventoryItem[] => {
  const updatedInventory = [...inventory];
  workOrder.requiredInventory.forEach((req) => {
    const item = updatedInventory.find((i) => i.id === req.itemId);
    if (item) {
      item.quantity = Math.max(0, item.quantity - req.quantity);
    }
  });
  return updatedInventory;
};
