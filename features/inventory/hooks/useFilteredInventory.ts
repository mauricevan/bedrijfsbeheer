/**
 * useFilteredInventory Hook
 * Search and filter logic for inventory
 */

import { useMemo } from "react";
import { InventoryItem, InventoryCategory, Supplier } from "../../../types";
import { filterBySearchTerm, filterByCategory } from "../utils/filters";

interface UseFilteredInventoryProps {
  inventory: InventoryItem[];
  searchTerm: string;
  categoryFilter: string;
  suppliers: Supplier[];
  categories: InventoryCategory[];
}

export const useFilteredInventory = ({
  inventory,
  searchTerm,
  categoryFilter,
  suppliers,
  categories,
}: UseFilteredInventoryProps) => {
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // Filter by category first
    if (categoryFilter) {
      filtered = filterByCategory(filtered, categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filterBySearchTerm(filtered, searchTerm, suppliers, categories);
    }

    return filtered;
  }, [inventory, searchTerm, categoryFilter, suppliers, categories]);

  return filteredInventory;
};
