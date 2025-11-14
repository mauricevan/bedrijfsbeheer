/**
 * WorkOrders Services - Material Management
 * Business logic for managing materials in work orders
 */

import { InventoryItem, WorkOrder } from "../../../types";

export interface MaterialValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate material availability
 */
export const validateMaterialAvailability = (
  materialId: string,
  quantity: number,
  inventory: InventoryItem[]
): MaterialValidationResult => {
  if (!materialId || quantity <= 0) {
    return {
      valid: false,
      message: "Selecteer een materiaal en voer een geldig aantal in!",
    };
  }

  const item = inventory.find((i) => i.id === materialId);
  if (!item) {
    return {
      valid: false,
      message: "Materiaal niet gevonden!",
    };
  }

  if (item.quantity < quantity) {
    return {
      valid: false,
      message: `Niet genoeg voorraad. Beschikbaar: ${item.quantity}`,
    };
  }

  return { valid: true };
};

/**
 * Validate all required materials for a work order
 */
export const validateAllRequiredMaterials = (
  requiredMaterials: { itemId: string; quantity: number }[],
  inventory: InventoryItem[]
): MaterialValidationResult => {
  for (const material of requiredMaterials) {
    const item = inventory.find((i) => i.id === material.itemId);
    if (item && item.quantity < material.quantity) {
      return {
        valid: false,
        message: `Niet genoeg voorraad van ${item.name}. Beschikbaar: ${item.quantity}, Nodig: ${material.quantity}`,
      };
    }
  }
  return { valid: true };
};

/**
 * Add material to required materials list
 */
export const addMaterialToList = (
  materialId: string,
  quantity: number,
  currentMaterials: { itemId: string; quantity: number }[]
): { itemId: string; quantity: number }[] => {
  // Check if material already exists
  const existingIndex = currentMaterials.findIndex(
    (m) => m.itemId === materialId
  );

  if (existingIndex >= 0) {
    // Update existing material quantity
    const updated = [...currentMaterials];
    updated[existingIndex].quantity += quantity;
    return updated;
  } else {
    // Add new material
    return [
      ...currentMaterials,
      { itemId: materialId, quantity: quantity },
    ];
  }
};

/**
 * Remove material from required materials list
 */
export const removeMaterialFromList = (
  materialId: string,
  currentMaterials: { itemId: string; quantity: number }[]
): { itemId: string; quantity: number }[] => {
  return currentMaterials.filter((m) => m.itemId !== materialId);
};

/**
 * Add material to work order
 */
export const addMaterialToWorkOrder = (
  workOrder: WorkOrder,
  materialId: string,
  quantity: number
): WorkOrder => {
  const existingIndex = workOrder.requiredInventory.findIndex(
    (m) => m.itemId === materialId
  );

  if (existingIndex >= 0) {
    const updated = [...workOrder.requiredInventory];
    updated[existingIndex].quantity += quantity;
    return {
      ...workOrder,
      requiredInventory: updated,
    };
  } else {
    return {
      ...workOrder,
      requiredInventory: [
        ...workOrder.requiredInventory,
        { itemId: materialId, quantity: quantity },
      ],
    };
  }
};

/**
 * Remove material from work order
 */
export const removeMaterialFromWorkOrder = (
  workOrder: WorkOrder,
  materialId: string
): WorkOrder => {
  return {
    ...workOrder,
    requiredInventory: workOrder.requiredInventory.filter(
      (m) => m.itemId !== materialId
    ),
  };
};
