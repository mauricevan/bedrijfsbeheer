/**
 * WorkOrders Hook - Material Selection
 * Hook for managing material search and filtering
 */

import { useMemo } from "react";
import { InventoryItem, InventoryCategory } from "../../../types";

export interface UseMaterialSelectionParams {
  inventory: InventoryItem[];
  categories: InventoryCategory[];
  searchTerm: string;
  categoryFilter: string;
  categorySearchTerm: string;
}

export interface UseMaterialSelectionReturn {
  filteredInventory: InventoryItem[];
  filteredCategories: InventoryCategory[];
}

/**
 * Custom hook for material selection and filtering
 */
export const useMaterialSelection = (
  params: UseMaterialSelectionParams
): UseMaterialSelectionReturn => {
  const {
    inventory,
    categories,
    searchTerm,
    categoryFilter,
    categorySearchTerm,
  } = params;

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm) return categories;
    const searchLower = categorySearchTerm.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower)
    );
  }, [categories, categorySearchTerm]);

  // Filter inventory based on category and search term
  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter((item) => item.quantity > 0);

    // Filter by category first
    if (categoryFilter) {
      filtered = filtered.filter(
        (item) => item.categoryId === categoryFilter
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        // Search in name
        if (item.name.toLowerCase().includes(term)) return true;

        // Search in all SKU types
        if (item.sku?.toLowerCase().includes(term)) return true;
        if (item.supplierSku?.toLowerCase().includes(term)) return true;
        if (item.autoSku?.toLowerCase().includes(term)) return true;
        if (item.customSku?.toLowerCase().includes(term)) return true;

        // Search in category name
        if (
          item.categoryId &&
          categories
            .find((c) => c.id === item.categoryId)
            ?.name.toLowerCase()
            .includes(term)
        )
          return true;

        return false;
      });
    }

    return filtered;
  }, [inventory, searchTerm, categoryFilter, categories]);

  return {
    filteredInventory,
    filteredCategories,
  };
};
