import { useState, useMemo } from "react";
import type { InventoryItem, InventoryCategory } from "../../../types";

/**
 * Hook for managing inventory selection and filtering
 * @param inventory - Array of inventory items
 * @param categories - Array of inventory categories
 * @returns Inventory selection state and filtered inventory
 */
export const useInventorySelection = (
  inventory: InventoryItem[],
  categories: InventoryCategory[] = []
) => {
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>("");
  const [inventoryCategorySearchTerm, setInventoryCategorySearchTerm] = useState("");
  const [showInventoryCategoryDropdown, setShowInventoryCategoryDropdown] = useState(false);

  // Filtered categories for dropdown search
  const filteredInventoryCategories = useMemo(() => {
    if (!inventoryCategorySearchTerm) return categories;
    const searchLower = inventoryCategorySearchTerm.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower)
    );
  }, [categories, inventoryCategorySearchTerm]);

  // Filtered inventory for quote/invoice item selection
  const filteredInventoryForSelection = useMemo(() => {
    let filtered = inventory.filter(
      (i) => (i.price || i.salePrice) && (i.price || i.salePrice) > 0
    );

    // Filter op categorie eerst
    if (inventoryCategoryFilter) {
      filtered = filtered.filter(
        (item) => item.categoryId === inventoryCategoryFilter
      );
    }

    // Filter op zoekterm
    if (inventorySearchTerm) {
      const term = inventorySearchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        // Zoek in naam
        if (item.name.toLowerCase().includes(term)) return true;

        // Zoek in alle SKU types
        if (item.sku?.toLowerCase().includes(term)) return true;
        if (item.supplierSku?.toLowerCase().includes(term)) return true;
        if (item.autoSku?.toLowerCase().includes(term)) return true;
        if (item.customSku?.toLowerCase().includes(term)) return true;

        // Zoek in categorie naam
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
  }, [inventory, inventorySearchTerm, inventoryCategoryFilter, categories]);

  return {
    // Search state
    inventorySearchTerm,
    setInventorySearchTerm,
    
    // Category filter state
    inventoryCategoryFilter,
    setInventoryCategoryFilter,
    
    // Category search state
    inventoryCategorySearchTerm,
    setInventoryCategorySearchTerm,
    
    // Dropdown state
    showInventoryCategoryDropdown,
    setShowInventoryCategoryDropdown,
    
    // Filtered results
    filteredInventoryCategories,
    filteredInventoryForSelection,
  };
};

