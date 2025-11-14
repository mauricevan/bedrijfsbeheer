/**
 * Inventory Calculations Utilities
 * Pure calculation functions for inventory operations
 */

import { InventoryItem } from "../../../types";

/**
 * Calculate profit margin percentage
 * @param purchasePrice - Purchase price excluding VAT
 * @param salePrice - Sale price excluding VAT
 * @returns Margin percentage rounded to 1 decimal
 */
export const calculateMargin = (
  purchasePrice: number,
  salePrice: number
): number => {
  if (!purchasePrice || purchasePrice === 0) return 0;
  return (
    Math.round(((salePrice - purchasePrice) / purchasePrice) * 100 * 10) / 10
  );
};

/**
 * Calculate VAT inclusive price
 * @param priceExcl - Price excluding VAT
 * @param vatRate - VAT rate type
 * @param customRate - Custom VAT rate if vatRate is "custom"
 * @returns Price including VAT
 */
export const calculateVatInclusive = (
  priceExcl: number,
  vatRate: "21" | "9" | "0" | "custom",
  customRate?: number
): number => {
  const rate = vatRate === "custom" ? customRate || 0 : parseFloat(vatRate);
  return priceExcl * (1 + rate / 100);
};

/**
 * Get numeric VAT rate value from item
 * @param item - Inventory item
 * @returns VAT rate as number
 */
export const getVatRateValue = (item: InventoryItem): number => {
  if (item.vatRate === "custom") return item.customVatRate || 0;
  return parseFloat(item.vatRate);
};

/**
 * Calculate total inventory value
 * @param items - Array of inventory items
 * @returns Total value at purchase price
 */
export const calculateInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => {
    const price = item.purchasePrice || item.price || 0;
    return total + price * item.quantity;
  }, 0);
};

/**
 * Calculate potential revenue
 * @param items - Array of inventory items
 * @returns Total value at sale price
 */
export const calculatePotentialRevenue = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => {
    const price = item.salePrice || item.price || 0;
    return total + price * item.quantity;
  }, 0);
};

/**
 * Calculate VAT report for inventory
 * @param items - Array of inventory items
 * @returns VAT breakdown by rate
 */
export const calculateVatReport = (items: InventoryItem[]) => {
  const vat21Total = items
    .filter((item) => item.vatRate === "21" && item.salePrice)
    .reduce((sum, item) => {
      const vatAmount = item.salePrice! * 0.21;
      return sum + vatAmount;
    }, 0);

  const vat9Total = items
    .filter((item) => item.vatRate === "9" && item.salePrice)
    .reduce((sum, item) => {
      const vatAmount = item.salePrice! * 0.09;
      return sum + vatAmount;
    }, 0);

  const vat0Total = items
    .filter((item) => item.vatRate === "0" && item.salePrice)
    .reduce((sum, item) => item.salePrice! || 0, 0);

  return {
    vat21: Math.round(vat21Total * 100) / 100,
    vat9: Math.round(vat9Total * 100) / 100,
    vat0: Math.round(vat0Total * 100) / 100,
    total: Math.round((vat21Total + vat9Total) * 100) / 100,
  };
};

/**
 * Calculate stock statistics
 * @param items - Array of inventory items
 * @returns Stock statistics
 */
export const calculateStockStats = (items: InventoryItem[]) => {
  const totalItems = items.length;
  const lowStock = items.filter((item) => item.quantity <= item.reorderLevel).length;
  const outOfStock = items.filter((item) => item.quantity === 0).length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalItems,
    lowStock,
    outOfStock,
    totalQuantity,
    averageQuantity: totalItems > 0 ? Math.round(totalQuantity / totalItems) : 0,
  };
};
