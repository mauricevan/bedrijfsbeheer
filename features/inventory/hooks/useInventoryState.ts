/**
 * useInventoryState Hook
 * Consolidated state management for Inventory component
 */

import { useState } from "react";
import { InventoryItem, Supplier, InventoryCategory } from "../../../types";
import { CSVParseResult } from "../../../utils/csvParser";
import { createEmptyItem, createEmptyCategory, createEmptySupplier } from "../services";

export const useInventoryState = () => {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "suppliers" | "reports" | "categories">("items");

  // CSV import state
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvImportResult, setCSVImportResult] = useState<CSVParseResult<any> | null>(null);
  const [showImportResultsModal, setShowImportResultsModal] = useState(false);

  // Category management state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<InventoryCategory>>(createEmptyCategory());
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  // Supplier management state
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>(createEmptySupplier());

  // Item management state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>(createEmptyItem());

  /**
   * Reset item form to empty state
   */
  const resetItemForm = () => {
    setNewItem(createEmptyItem());
    setEditingItem(null);
    setShowAddForm(false);
    setShowNewCategoryForm(false);
  };

  /**
   * Reset category form to empty state
   */
  const resetCategoryForm = () => {
    setNewCategory(createEmptyCategory());
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  /**
   * Reset supplier form to empty state
   */
  const resetSupplierForm = () => {
    setNewSupplier(createEmptySupplier());
    setEditingSupplier(null);
    setShowSupplierForm(false);
  };

  /**
   * Set item for editing
   */
  const setItemForEditing = (item: InventoryItem, generateAutoSku: () => string) => {
    setEditingItem(item);
    setNewItem({
      ...item,
      purchasePrice: item.purchasePrice || 0,
      salePrice: item.salePrice || item.price || 0,
      supplierSku: item.supplierSku || "",
      autoSku: item.autoSku || item.sku || generateAutoSku(),
      customSku: item.customSku || "",
      categoryId: item.categoryId || undefined,
    });
    setShowAddForm(true);
  };

  /**
   * Set category for editing
   */
  const setCategoryForEditing = (category: InventoryCategory) => {
    setEditingCategory(category);
    setNewCategory({ ...category });
    setShowCategoryForm(true);
  };

  /**
   * Set supplier for editing
   */
  const setSupplierForEditing = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({ ...supplier });
    setShowSupplierForm(true);
  };

  return {
    // Search and filter
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    categorySearchTerm,
    setCategorySearchTerm,
    showCategoryDropdown,
    setShowCategoryDropdown,

    // UI state
    showAddForm,
    setShowAddForm,
    showSuppliers,
    setShowSuppliers,
    showReports,
    setShowReports,
    activeTab,
    setActiveTab,

    // CSV import
    showCSVImport,
    setShowCSVImport,
    csvImportResult,
    setCSVImportResult,
    showImportResultsModal,
    setShowImportResultsModal,

    // Category management
    showCategoryForm,
    setShowCategoryForm,
    editingCategory,
    setEditingCategory,
    newCategory,
    setNewCategory,
    showNewCategoryForm,
    setShowNewCategoryForm,

    // Supplier management
    showSupplierForm,
    setShowSupplierForm,
    editingSupplier,
    setEditingSupplier,
    newSupplier,
    setNewSupplier,

    // Item management
    editingItem,
    setEditingItem,
    newItem,
    setNewItem,

    // Helper methods
    resetItemForm,
    resetCategoryForm,
    resetSupplierForm,
    setItemForEditing,
    setCategoryForEditing,
    setSupplierForEditing,
  };
};
