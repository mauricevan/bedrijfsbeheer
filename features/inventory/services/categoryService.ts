/**
 * Category Service
 * Business logic for inventory category management
 */

import { InventoryCategory } from "../../../types";

/**
 * Create new category
 * @param categoryData - Partial category data
 * @returns New category
 */
export const createCategory = (
  categoryData: Partial<InventoryCategory>
): InventoryCategory => {
  return {
    id: Date.now().toString(),
    name: categoryData.name || "",
    description: categoryData.description || "",
    color: categoryData.color || "#3B82F6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Update existing category
 * @param existingCategory - Current category
 * @param updates - Updated data
 * @returns Updated category
 */
export const updateCategory = (
  existingCategory: InventoryCategory,
  updates: Partial<InventoryCategory>
): InventoryCategory => {
  return {
    ...existingCategory,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Create empty category template
 * @returns Empty category template
 */
export const createEmptyCategory = (): Partial<InventoryCategory> => ({
  name: "",
  description: "",
  color: "#3B82F6",
});

/**
 * Validate category data
 * @param category - Category data to validate
 * @returns Validation result
 */
export const validateCategory = (
  category: Partial<InventoryCategory>
): { valid: boolean; error?: string } => {
  if (!category.name || category.name.trim() === "") {
    return { valid: false, error: "Categorie naam is verplicht" };
  }

  return { valid: true };
};

/**
 * Check if category can be deleted
 * @param categoryId - Category ID
 * @param items - All inventory items
 * @returns Can delete and count of items using this category
 */
export const canDeleteCategory = (
  categoryId: string,
  items: any[]
): { canDelete: boolean; itemCount: number; message?: string } => {
  const itemCount = items.filter(
    (item) => item.categoryId === categoryId
  ).length;

  if (itemCount > 0) {
    return {
      canDelete: false,
      itemCount,
      message: `Deze categorie wordt gebruikt door ${itemCount} item(s). Verwijder eerst deze items of wijzig hun categorie.`,
    };
  }

  return { canDelete: true, itemCount: 0 };
};

/**
 * Get category statistics
 * @param categoryId - Category ID
 * @param items - All inventory items
 * @returns Category statistics
 */
export const getCategoryStats = (categoryId: string, items: any[]) => {
  const categoryItems = items.filter((item) => item.categoryId === categoryId);
  const totalQuantity = categoryItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = categoryItems.reduce(
    (sum, item) => sum + (item.salePrice || item.price || 0) * item.quantity,
    0
  );

  return {
    itemCount: categoryItems.length,
    totalQuantity,
    totalValue: Math.round(totalValue * 100) / 100,
  };
};
