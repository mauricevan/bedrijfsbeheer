/**
 * useInventory Hook
 * Inventory CRUD operations
 */

import { InventoryItem, WebshopProduct } from "../../../types";
import {
  createInventoryItem,
  updateInventoryItem,
  updateItemQuantity,
  syncItemToWebshop,
} from "../services";
import { generateAutoSku } from "../utils/formatters";

interface UseInventoryProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  webshopProducts?: WebshopProduct[];
  setWebshopProducts?: React.Dispatch<React.SetStateAction<WebshopProduct[]>>;
}

export const useInventory = ({
  inventory,
  setInventory,
  webshopProducts = [],
  setWebshopProducts,
}: UseInventoryProps) => {
  /**
   * Add new inventory item
   */
  const addItem = (itemData: Partial<InventoryItem>): boolean => {
    if (!itemData.name || !itemData.salePrice) {
      alert("⚠️ Vul ten minste naam en verkoopprijs in.");
      return false;
    }

    const item = createInventoryItem(itemData, inventory);
    setInventory([...inventory, item]);
    alert(`✅ Item "${item.name}" succesvol toegevoegd!`);
    return true;
  };

  /**
   * Update existing inventory item
   */
  const updateItem = (
    itemId: string,
    updates: Partial<InventoryItem>
  ): boolean => {
    const existingItem = inventory.find((i) => i.id === itemId);
    if (!existingItem) {
      alert("⚠️ Item niet gevonden.");
      return false;
    }

    if (!updates.name || !updates.salePrice) {
      alert("⚠️ Vul ten minste naam en verkoopprijs in.");
      return false;
    }

    const updatedItem = updateInventoryItem(existingItem, updates);
    setInventory(inventory.map((item) => (item.id === itemId ? updatedItem : item)));
    alert(`✅ Item "${updatedItem.name}" succesvol bijgewerkt!`);
    return true;
  };

  /**
   * Delete inventory item
   */
  const deleteItem = (itemId: string): boolean => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) {
      alert("⚠️ Item niet gevonden.");
      return false;
    }

    if (!confirm(`Weet u zeker dat u "${item.name}" wilt verwijderen?`)) {
      return false;
    }

    setInventory(inventory.filter((i) => i.id !== itemId));
    alert("✅ Item verwijderd.");
    return true;
  };

  /**
   * Update item quantity
   */
  const changeQuantity = (itemId: string, delta: number): void => {
    setInventory(
      inventory.map((item) =>
        item.id === itemId ? updateItemQuantity(item, delta) : item
      )
    );
  };

  /**
   * Sync item to webshop
   */
  const syncToWebshop = (itemId: string): boolean => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item || !setWebshopProducts || !webshopProducts) {
      alert("⚠️ Webshop sync is niet beschikbaar (webshop module niet geladen)");
      return false;
    }

    // Find existing webshop product
    const existingProduct = webshopProducts.find(
      (p) => p.inventoryItemId === itemId || p.sku === item.sku
    );

    const webshopProduct = syncItemToWebshop(item, existingProduct);

    if (existingProduct) {
      // Update existing product
      setWebshopProducts(
        webshopProducts.map((p) =>
          p.id === existingProduct.id ? webshopProduct : p
        )
      );

      // Update inventory item with webshop link
      setInventory(
        inventory.map((i) =>
          i.id === itemId
            ? {
                ...i,
                webshopProductId: existingProduct.id,
                webshopId: existingProduct.id,
                syncEnabled: true,
              }
            : i
        )
      );

      alert(
        `✅ Webshop product "${existingProduct.name}" bijgewerkt met nieuwe voorraad: ${item.quantity} stuks`
      );
    } else {
      // Add new product
      setWebshopProducts([...webshopProducts, webshopProduct]);

      // Update inventory item with webshop link
      setInventory(
        inventory.map((i) =>
          i.id === itemId
            ? {
                ...i,
                webshopProductId: webshopProduct.id,
                webshopId: webshopProduct.id,
                syncEnabled: true,
              }
            : i
        )
      );

      alert(
        `✅ Nieuw webshop product aangemaakt: "${webshopProduct.name}" met ${item.quantity} stuks op voorraad`
      );
    }

    return true;
  };

  /**
   * Disable webshop sync for item
   */
  const disableSync = (itemId: string): void => {
    setInventory(
      inventory.map((i) =>
        i.id === itemId
          ? {
              ...i,
              syncEnabled: false,
              webshopProductId: undefined,
              webshopId: undefined,
            }
          : i
      )
    );
    alert("✅ Webshop sync uitgeschakeld");
  };

  /**
   * Generate next auto SKU
   */
  const getNextAutoSku = (): string => {
    return generateAutoSku(inventory);
  };

  return {
    addItem,
    updateItem,
    deleteItem,
    changeQuantity,
    syncToWebshop,
    disableSync,
    getNextAutoSku,
  };
};
