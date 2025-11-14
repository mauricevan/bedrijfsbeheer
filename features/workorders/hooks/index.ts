/**
 * WorkOrders Hooks Barrel Export
 * Centralized export file for all work order-related custom hooks
 */

export { useWorkOrderState } from "./useWorkOrderState";
export type {
  NewOrderFormData,
  EditFormData,
  MaterialState,
  EditMaterialState,
  WorkOrderState,
} from "./useWorkOrderState";

export { useWorkOrders } from "./useWorkOrders";
export type {
  UseWorkOrdersParams,
  UseWorkOrdersReturn,
} from "./useWorkOrders";

export { useMaterialSelection } from "./useMaterialSelection";
export type {
  UseMaterialSelectionParams,
  UseMaterialSelectionReturn,
} from "./useMaterialSelection";

export { useFilteredWorkOrders } from "./useFilteredWorkOrders";
export type {
  UseFilteredWorkOrdersParams,
  GroupedWorkOrders,
  UseFilteredWorkOrdersReturn,
} from "./useFilteredWorkOrders";
