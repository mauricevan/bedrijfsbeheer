/**
 * useSuppliers Hook
 * Supplier CRUD operations
 */

import { Supplier, InventoryItem } from "../../../types";
import {
  createSupplier,
  updateSupplier,
  canDeleteSupplier,
} from "../services";

interface UseSuppliersProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  inventory: InventoryItem[];
}

export const useSuppliers = ({
  suppliers,
  setSuppliers,
  inventory,
}: UseSuppliersProps) => {
  /**
   * Add new supplier
   */
  const addSupplier = (supplierData: Partial<Supplier>): boolean => {
    if (!supplierData.name) {
      alert("⚠️ Vul ten minste de naam in.");
      return false;
    }

    const supplier = createSupplier(supplierData);
    setSuppliers([...suppliers, supplier]);
    alert(`✅ Leverancier "${supplier.name}" succesvol toegevoegd!`);
    return true;
  };

  /**
   * Update existing supplier
   */
  const updateSupplierById = (
    supplierId: string,
    updates: Partial<Supplier>
  ): boolean => {
    const existingSupplier = suppliers.find((s) => s.id === supplierId);
    if (!existingSupplier) {
      alert("⚠️ Leverancier niet gevonden.");
      return false;
    }

    if (!updates.name) {
      alert("⚠️ Vul ten minste de naam in.");
      return false;
    }

    const updatedSupplier = updateSupplier(existingSupplier, updates);
    setSuppliers(
      suppliers.map((sup) => (sup.id === supplierId ? updatedSupplier : sup))
    );
    alert(`✅ Leverancier "${updatedSupplier.name}" succesvol bijgewerkt!`);
    return true;
  };

  /**
   * Delete supplier
   */
  const deleteSupplier = (supplierId: string): boolean => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      alert("⚠️ Leverancier niet gevonden.");
      return false;
    }

    // Check if supplier can be deleted
    const deleteCheck = canDeleteSupplier(supplierId, inventory);
    if (!deleteCheck.canDelete) {
      alert(`⚠️ ${deleteCheck.message}`);
      return false;
    }

    if (
      !confirm(
        `Weet u zeker dat u leverancier "${supplier.name}" wilt verwijderen?`
      )
    ) {
      return false;
    }

    setSuppliers(suppliers.filter((s) => s.id !== supplierId));
    alert("✅ Leverancier verwijderd.");
    return true;
  };

  /**
   * Get supplier by ID
   */
  const getSupplierById = (supplierId: string): Supplier | undefined => {
    return suppliers.find((s) => s.id === supplierId);
  };

  /**
   * Get items from supplier
   */
  const getItemsFromSupplier = (supplierId: string): InventoryItem[] => {
    return inventory.filter((item) => item.supplierId === supplierId);
  };

  return {
    addSupplier,
    updateSupplierById,
    deleteSupplier,
    getSupplierById,
    getItemsFromSupplier,
  };
};
