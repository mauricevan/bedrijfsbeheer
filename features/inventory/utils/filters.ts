/**
 * Inventory Filters Utilities
 * Pure filtering and search functions
 */

import { InventoryItem, InventoryCategory, Supplier } from "../../../types";

/**
 * Filter inventory by search term (searches all fields)
 * @param items - Array of inventory items
 * @param searchTerm - Search term
 * @param suppliers - Array of suppliers (for supplier name search)
 * @param categories - Array of categories (for category name search)
 * @returns Filtered items
 */
export const filterBySearchTerm = (
  items: InventoryItem[],
  searchTerm: string,
  suppliers: Supplier[],
  categories: InventoryCategory[]
): InventoryItem[] => {
  if (!searchTerm) return items;

  const searchLower = searchTerm.toLowerCase();

  return items.filter((item) => {
    // Search in name
    if (item.name.toLowerCase().includes(searchLower)) return true;

    // Search in all SKU types
    if (item.sku?.toLowerCase().includes(searchLower)) return true;
    if (item.supplierSku?.toLowerCase().includes(searchLower)) return true;
    if (item.autoSku?.toLowerCase().includes(searchLower)) return true;
    if (item.customSku?.toLowerCase().includes(searchLower)) return true;

    // Search in location
    if (item.location?.toLowerCase().includes(searchLower)) return true;

    // Search in unit
    if (item.unit?.toLowerCase().includes(searchLower)) return true;

    // Search in supplier name
    if (item.supplier?.toLowerCase().includes(searchLower)) return true;
    if (
      item.supplierId &&
      suppliers
        .find((s) => s.id === item.supplierId)
        ?.name.toLowerCase()
        .includes(searchLower)
    )
      return true;

    // Search in category name
    if (
      item.categoryId &&
      categories
        .find((c) => c.id === item.categoryId)
        ?.name.toLowerCase()
        .includes(searchLower)
    )
      return true;

    // Search in prices (as string)
    if (item.purchasePrice?.toString().includes(searchLower)) return true;
    if (item.salePrice?.toString().includes(searchLower)) return true;

    // Search in POS alert note
    if (item.posAlertNote?.toLowerCase().includes(searchLower)) return true;

    return false;
  });
};

/**
 * Filter inventory by category
 * @param items - Array of inventory items
 * @param categoryId - Category ID to filter by
 * @returns Filtered items
 */
export const filterByCategory = (
  items: InventoryItem[],
  categoryId: string
): InventoryItem[] => {
  if (!categoryId) return items;
  return items.filter((item) => item.categoryId === categoryId);
};

/**
 * Filter inventory by supplier
 * @param items - Array of inventory items
 * @param supplierId - Supplier ID to filter by
 * @returns Filtered items
 */
export const filterBySupplier = (
  items: InventoryItem[],
  supplierId: string
): InventoryItem[] => {
  if (!supplierId) return items;
  return items.filter((item) => item.supplierId === supplierId);
};

/**
 * Filter inventory by stock status
 * @param items - Array of inventory items
 * @param status - "low" | "out" | "ok"
 * @returns Filtered items
 */
export const filterByStockStatus = (
  items: InventoryItem[],
  status: "low" | "out" | "ok"
): InventoryItem[] => {
  switch (status) {
    case "out":
      return items.filter((item) => item.quantity === 0);
    case "low":
      return items.filter(
        (item) => item.quantity > 0 && item.quantity <= item.reorderLevel
      );
    case "ok":
      return items.filter((item) => item.quantity > item.reorderLevel);
    default:
      return items;
  }
};

/**
 * Filter categories by search term
 * @param categories - Array of categories
 * @param searchTerm - Search term
 * @returns Filtered categories
 */
export const filterCategoriesBySearch = (
  categories: InventoryCategory[],
  searchTerm: string
): InventoryCategory[] => {
  if (!searchTerm) return categories;
  const searchLower = searchTerm.toLowerCase();
  return categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchLower) ||
      cat.description?.toLowerCase().includes(searchLower)
  );
};

/**
 * Get items that need reordering
 * @param items - Array of inventory items
 * @returns Items below reorder level
 */
export const getItemsNeedingReorder = (items: InventoryItem[]): InventoryItem[] => {
  return items.filter((item) => item.quantity <= item.reorderLevel);
};

/**
 * Get out of stock items
 * @param items - Array of inventory items
 * @returns Items with zero quantity
 */
export const getOutOfStockItems = (items: InventoryItem[]): InventoryItem[] => {
  return items.filter((item) => item.quantity === 0);
};

/**
 * Sort items by field
 * @param items - Array of inventory items
 * @param field - Field to sort by
 * @param direction - Sort direction
 * @returns Sorted items
 */
export const sortInventoryItems = (
  items: InventoryItem[],
  field: keyof InventoryItem,
  direction: "asc" | "desc" = "asc"
): InventoryItem[] => {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
};
