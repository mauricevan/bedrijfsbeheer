/**
 * WorkOrders Services - Barrel Export
 * Pure business logic functions for work order operations
 */

// Work Order Operations
export {
  createWorkOrder,
  updateWorkOrder,
  updateWorkOrderStatus,
  updateWorkOrderHours,
  deleteWorkOrder,
  trackStatusChange,
  trackWorkOrderCompletion,
  deductInventory,
} from "./workOrderOperations";
export type {
  CreateWorkOrderParams,
  UpdateWorkOrderParams,
} from "./workOrderOperations";

// Material Service
export {
  validateMaterialAvailability,
  validateAllRequiredMaterials,
  addMaterialToList,
  removeMaterialFromList,
  addMaterialToWorkOrder,
  removeMaterialFromWorkOrder,
} from "./materialService";
export type { MaterialValidationResult } from "./materialService";

// Conversion Service
export {
  generateInvoiceNumber,
  createInvoiceHistoryEntry,
  convertWorkOrderToInvoice,
  convertQuoteToWorkOrder,
  convertInvoiceToWorkOrder,
} from "./conversionService";
export type { ConvertToInvoiceParams } from "./conversionService";
