/**
 * Inventory Operations Service
 * Business logic for inventory CRUD operations
 */

import { InventoryItem, WebshopProduct } from "../../../types";
import { calculateMargin, calculateVatInclusive } from "../utils/calculations";
import { generateAutoSku, generateSlug } from "../utils/formatters";

/**
 * Create new inventory item
 * @param itemData - Partial item data from form
 * @param existingItems - Existing inventory items (for SKU generation)
 * @returns New inventory item
 */
export const createInventoryItem = (
  itemData: Partial<InventoryItem>,
  existingItems: InventoryItem[]
): InventoryItem => {
  // Generate automatic SKU if not exists
  const autoSku = itemData.autoSku || generateAutoSku(existingItems);

  // Calculate margin
  const margin =
    itemData.purchasePrice && itemData.purchasePrice > 0 && itemData.salePrice
      ? calculateMargin(itemData.purchasePrice, itemData.salePrice)
      : 0;

  const item: InventoryItem = {
    id: Date.now().toString(),
    name: itemData.name || "",
    sku: autoSku, // Legacy support - use autoSku
    autoSku, // Automatically generated SKU
    supplierSku: itemData.supplierSku || "",
    customSku: itemData.customSku || "",
    quantity: itemData.quantity || 0,
    reorderLevel: itemData.reorderLevel || 0,
    unit: itemData.unit || "stuk",
    location: itemData.location,
    salePrice: itemData.salePrice || 0,
    purchasePrice: itemData.purchasePrice || 0,
    price: itemData.salePrice || 0, // Legacy support
    margin,
    vatRate: (itemData.vatRate || "21") as "21" | "9" | "0" | "custom",
    customVatRate: itemData.customVatRate,
    supplierId: itemData.supplierId,
    supplier: itemData.supplier || "",
    categoryId: itemData.categoryId,
    syncEnabled: itemData.syncEnabled || false,
    webshopProductId: itemData.webshopProductId,
    webshopId: itemData.webshopId,
    posAlertNote: itemData.posAlertNote,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return item;
};

/**
 * Update existing inventory item
 * @param existingItem - Current item
 * @param updates - Updated data
 * @returns Updated inventory item
 */
export const updateInventoryItem = (
  existingItem: InventoryItem,
  updates: Partial<InventoryItem>
): InventoryItem => {
  // Calculate margin if prices changed
  const margin =
    updates.purchasePrice !== undefined || updates.salePrice !== undefined
      ? calculateMargin(
          updates.purchasePrice ?? existingItem.purchasePrice ?? 0,
          updates.salePrice ?? existingItem.salePrice ?? 0
        )
      : existingItem.margin;

  const updatedItem: InventoryItem = {
    ...existingItem,
    ...updates,
    margin,
    price: updates.salePrice ?? existingItem.salePrice ?? existingItem.price, // Legacy support
    updatedAt: new Date().toISOString(),
  };

  return updatedItem;
};

/**
 * Update inventory item quantity
 * @param item - Inventory item
 * @param delta - Quantity change (positive or negative)
 * @returns Updated item
 */
export const updateItemQuantity = (
  item: InventoryItem,
  delta: number
): InventoryItem => {
  return {
    ...item,
    quantity: Math.max(0, item.quantity + delta),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Create empty inventory item template
 * @returns Empty item template for form
 */
export const createEmptyItem = (): Partial<InventoryItem> => ({
  name: "",
  sku: "",
  quantity: 0,
  reorderLevel: 0,
  supplierId: undefined,
  supplier: "",
  purchasePrice: 0,
  salePrice: 0,
  margin: 0,
  vatRate: "21",
  customVatRate: undefined,
  syncEnabled: false,
  webshopId: undefined,
  webshopProductId: undefined,
  unit: "stuk",
  price: 0,
  posAlertNote: undefined,
  supplierSku: "",
  autoSku: "",
  customSku: "",
  categoryId: undefined,
});

/**
 * Sync inventory item to webshop
 * @param item - Inventory item to sync
 * @param existingProduct - Existing webshop product (if any)
 * @returns Webshop product
 */
export const syncItemToWebshop = (
  item: InventoryItem,
  existingProduct?: WebshopProduct
): WebshopProduct => {
  const price = calculateVatInclusive(
    item.salePrice,
    item.vatRate,
    item.customVatRate
  );

  if (existingProduct) {
    // Update existing product
    return {
      ...existingProduct,
      stockQuantity: item.quantity,
      price,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Create new webshop product
    return {
      id: Date.now().toString(),
      name: item.name,
      slug: generateSlug(item.name),
      description: `${item.name} - ${item.unit || "stuk"}`,
      shortDescription: item.name,
      sku: item.sku,
      price,
      salePrice: undefined,
      stockQuantity: item.quantity,
      stockStatus: item.quantity > 0 ? "instock" : "outofstock",
      categoryId: item.categoryId,
      images: [],
      featured: false,
      onSale: false,
      inventoryItemId: item.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Process CSV import data into inventory items
 * @param csvData - Parsed CSV data
 * @param existingItems - Existing inventory items
 * @param categories - Available categories
 * @returns Array of new inventory items
 */
export const processCSVImport = (
  csvData: any[],
  existingItems: InventoryItem[],
  categories: { id: string; name: string }[]
): InventoryItem[] => {
  return csvData.map((csvItem, index) => {
    // Find category ID by name
    let categoryId: string | undefined;
    if (csvItem.categoryName) {
      const category = categories.find(
        (c) => c.name.toLowerCase() === csvItem.categoryName.toLowerCase()
      );
      categoryId = category?.id;
    }

    // Calculate margin
    const margin =
      csvItem.purchasePrice &&
      csvItem.salePrice &&
      csvItem.purchasePrice > 0
        ? calculateMargin(csvItem.purchasePrice, csvItem.salePrice)
        : 0;

    return {
      id: `${Date.now()}-${index}`,
      name: csvItem.name,
      supplierSku: csvItem.supplierSku || "",
      customSku: csvItem.customSku || "",
      autoSku: generateAutoSku([...existingItems]), // Generate auto SKU
      sku: generateAutoSku([...existingItems]), // Legacy support
      location: csvItem.location,
      quantity: csvItem.quantity || 0,
      unit: csvItem.unit || "stuk",
      reorderLevel: csvItem.reorderLevel || 0,
      supplier: csvItem.supplier || "",
      categoryId,
      salePrice: csvItem.salePrice || 0,
      purchasePrice: csvItem.purchasePrice || 0,
      price: csvItem.salePrice || 0, // Legacy support
      margin,
      vatRate: "21" as any,
      syncEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
};
