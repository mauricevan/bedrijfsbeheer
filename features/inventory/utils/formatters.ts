/**
 * Inventory Formatters Utilities
 * Pure formatting functions for display
 */

import { InventoryItem, InventoryCategory, Supplier } from "../../../types";

/**
 * Generate automatic SKU (INV-0001, INV-0002, etc.)
 * @param existingItems - Existing inventory items
 * @returns Next auto-generated SKU
 */
export const generateAutoSku = (existingItems: InventoryItem[]): string => {
  const maxSku = existingItems.reduce((max, item) => {
    const sku = item.autoSku || item.sku;
    if (sku && sku.startsWith("INV-")) {
      const num = parseInt(sku.replace("INV-", "")) || 0;
      return Math.max(max, num);
    }
    return max;
  }, 0);
  const nextNum = maxSku + 1;
  return `INV-${nextNum.toString().padStart(4, "0")}`;
};

/**
 * Get display SKU (priority: custom > supplier > auto)
 * @param item - Inventory item
 * @returns Primary SKU for display
 */
export const getDisplaySku = (item: InventoryItem): string => {
  return item.customSku || item.supplierSku || item.autoSku || item.sku || "-";
};

/**
 * Get all SKUs as array
 * @param item - Inventory item
 * @returns Array of all non-empty SKUs
 */
export const getAllSkus = (item: InventoryItem): string[] => {
  const skus: string[] = [];
  if (item.customSku) skus.push(item.customSku);
  if (item.supplierSku) skus.push(item.supplierSku);
  if (item.autoSku) skus.push(item.autoSku);
  if (item.sku && !skus.includes(item.sku)) skus.push(item.sku);
  return skus;
};

/**
 * Format currency value
 * @param value - Numeric value
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

/**
 * Format percentage
 * @param value - Numeric value
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get category name by ID
 * @param categoryId - Category ID
 * @param categories - Array of categories
 * @returns Category name or "-"
 */
export const getCategoryName = (
  categoryId: string | undefined,
  categories: InventoryCategory[]
): string => {
  if (!categoryId) return "-";
  const category = categories.find((c) => c.id === categoryId);
  return category?.name || "-";
};

/**
 * Get supplier name
 * @param supplierId - Supplier ID
 * @param supplierName - Legacy supplier name string
 * @param suppliers - Array of suppliers
 * @returns Supplier name or "-"
 */
export const getSupplierName = (
  supplierId: string | undefined,
  supplierName: string | undefined,
  suppliers: Supplier[]
): string => {
  if (supplierId) {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (supplier) return supplier.name;
  }
  return supplierName || "-";
};

/**
 * Get stock status color
 * @param item - Inventory item
 * @returns Tailwind color class
 */
export const getStockStatusColor = (item: InventoryItem): string => {
  if (item.quantity === 0) return "text-red-600";
  if (item.quantity <= item.reorderLevel) return "text-orange-600";
  return "text-green-600";
};

/**
 * Get stock status label
 * @param item - Inventory item
 * @returns Status label
 */
export const getStockStatusLabel = (item: InventoryItem): string => {
  if (item.quantity === 0) return "Uitverkocht";
  if (item.quantity <= item.reorderLevel) return "Laag";
  return "Op voorraad";
};

/**
 * Format stock display
 * @param quantity - Current quantity
 * @param unit - Unit of measurement
 * @returns Formatted stock string
 */
export const formatStock = (quantity: number, unit?: string): string => {
  return `${quantity} ${unit || "stuks"}`;
};

/**
 * Generate webshop slug from name
 * @param name - Product name
 * @returns URL-friendly slug
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
