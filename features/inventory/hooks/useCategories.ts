/**
 * useCategories Hook
 * Category CRUD operations
 */

import { InventoryCategory, InventoryItem } from "../../../types";
import {
  createCategory,
  updateCategory,
  canDeleteCategory,
} from "../services";

interface UseCategoriesProps {
  categories: InventoryCategory[];
  setCategories: React.Dispatch<React.SetStateAction<InventoryCategory[]>>;
  inventory: InventoryItem[];
}

export const useCategories = ({
  categories,
  setCategories,
  inventory,
}: UseCategoriesProps) => {
  /**
   * Add new category
   */
  const addCategory = (categoryData: Partial<InventoryCategory>): boolean => {
    if (!categoryData.name) {
      alert("⚠️ Vul ten minste de naam in.");
      return false;
    }

    const category = createCategory(categoryData);
    setCategories([...categories, category]);
    alert(`✅ Categorie "${category.name}" succesvol toegevoegd!`);
    return true;
  };

  /**
   * Update existing category
   */
  const updateCategoryById = (
    categoryId: string,
    updates: Partial<InventoryCategory>
  ): boolean => {
    const existingCategory = categories.find((c) => c.id === categoryId);
    if (!existingCategory) {
      alert("⚠️ Categorie niet gevonden.");
      return false;
    }

    if (!updates.name) {
      alert("⚠️ Vul ten minste de naam in.");
      return false;
    }

    const updatedCategory = updateCategory(existingCategory, updates);
    setCategories(
      categories.map((cat) => (cat.id === categoryId ? updatedCategory : cat))
    );
    alert(`✅ Categorie "${updatedCategory.name}" succesvol bijgewerkt!`);
    return true;
  };

  /**
   * Delete category
   */
  const deleteCategory = (categoryId: string): boolean => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      alert("⚠️ Categorie niet gevonden.");
      return false;
    }

    // Check if category can be deleted
    const deleteCheck = canDeleteCategory(categoryId, inventory);
    if (!deleteCheck.canDelete) {
      alert(`⚠️ ${deleteCheck.message}`);
      return false;
    }

    if (
      !confirm(
        `Weet u zeker dat u categorie "${category.name}" wilt verwijderen?`
      )
    ) {
      return false;
    }

    setCategories(categories.filter((c) => c.id !== categoryId));
    alert("✅ Categorie verwijderd.");
    return true;
  };

  /**
   * Get category by ID
   */
  const getCategoryById = (
    categoryId: string
  ): InventoryCategory | undefined => {
    return categories.find((c) => c.id === categoryId);
  };

  /**
   * Get items in category
   */
  const getItemsInCategory = (categoryId: string): InventoryItem[] => {
    return inventory.filter((item) => item.categoryId === categoryId);
  };

  return {
    addCategory,
    updateCategoryById,
    deleteCategory,
    getCategoryById,
    getItemsInCategory,
  };
};
