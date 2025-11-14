/**
 * Supplier Service
 * Business logic for supplier management
 */

import { Supplier } from "../../../types";

/**
 * Create new supplier
 * @param supplierData - Partial supplier data
 * @returns New supplier
 */
export const createSupplier = (
  supplierData: Partial<Supplier>
): Supplier => {
  return {
    id: Date.now().toString(),
    name: supplierData.name || "",
    contactPerson: supplierData.contactPerson || "",
    email: supplierData.email || "",
    phone: supplierData.phone || "",
    address: supplierData.address || "",
    averageLeadTime: supplierData.averageLeadTime || 7,
    notes: supplierData.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Update existing supplier
 * @param existingSupplier - Current supplier
 * @param updates - Updated data
 * @returns Updated supplier
 */
export const updateSupplier = (
  existingSupplier: Supplier,
  updates: Partial<Supplier>
): Supplier => {
  return {
    ...existingSupplier,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Create empty supplier template
 * @returns Empty supplier template
 */
export const createEmptySupplier = (): Partial<Supplier> => ({
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  averageLeadTime: 7,
  notes: "",
});

/**
 * Validate supplier data
 * @param supplier - Supplier data to validate
 * @returns Validation result
 */
export const validateSupplier = (
  supplier: Partial<Supplier>
): { valid: boolean; error?: string } => {
  if (!supplier.name || supplier.name.trim() === "") {
    return { valid: false, error: "Leverancier naam is verplicht" };
  }

  if (supplier.email && !isValidEmail(supplier.email)) {
    return { valid: false, error: "Ongeldig e-mailadres" };
  }

  return { valid: true };
};

/**
 * Check if supplier can be deleted
 * @param supplierId - Supplier ID
 * @param items - All inventory items
 * @returns Can delete and count of items using this supplier
 */
export const canDeleteSupplier = (
  supplierId: string,
  items: any[]
): { canDelete: boolean; itemCount: number; message?: string } => {
  const itemCount = items.filter(
    (item) => item.supplierId === supplierId
  ).length;

  if (itemCount > 0) {
    return {
      canDelete: false,
      itemCount,
      message: `Deze leverancier wordt gebruikt door ${itemCount} item(s). Verwijder eerst deze items of wijzig hun leverancier.`,
    };
  }

  return { canDelete: true, itemCount: 0 };
};

/**
 * Get supplier statistics
 * @param supplierId - Supplier ID
 * @param items - All inventory items
 * @returns Supplier statistics
 */
export const getSupplierStats = (supplierId: string, items: any[]) => {
  const supplierItems = items.filter((item) => item.supplierId === supplierId);
  const totalQuantity = supplierItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = supplierItems.reduce(
    (sum, item) => sum + (item.purchasePrice || 0) * item.quantity,
    0
  );

  return {
    itemCount: supplierItems.length,
    totalQuantity,
    totalValue: Math.round(totalValue * 100) / 100,
  };
};

/**
 * Validate email address
 * @param email - Email to validate
 * @returns Is valid email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
